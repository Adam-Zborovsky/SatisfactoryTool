import React, { useState, useEffect, useCallback } from 'react';
import { loadData, createRegistry } from './data/loader';
import { getAllPlans, createPlan, deletePlan, duplicatePlan, getPlan, savePlan, updatePlanState, exportPlan, importPlan } from './lib/db';
import db from './lib/db';
import { parseSfmd, detectTiers, nameToId, importPlan as sfmdImport } from './import/sfmd';
import PlanSidebar from './components/PlanSidebar';
import Calculator from './components/Calculator';
import ItemLibrary from './components/ItemLibrary';
import ImportModal from './components/ImportModal';

const TIER_COLORS = [
  '#e87a23', '#5c6bc0', '#26a69a', '#ffa726', '#ef5350',
  '#ab47bc', '#66bb6a', '#29b6f6', '#ec407a', '#8d6e63',
];

export default function App() {
  const [dataRegistry, setDataRegistry] = useState(null);
  const [plans, setPlans] = useState([]);
  const [currentPlanId, setCurrentPlanId] = useState(null);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [view, setView] = useState('calculator');
  const [showImport, setShowImport] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    loadData().then(data => {
      setDataRegistry(createRegistry(data));
    });
  }, []);

  const refreshPlans = useCallback(async () => {
    const all = await getAllPlans();
    setPlans(all);
  }, []);

  useEffect(() => { refreshPlans(); }, [refreshPlans]);

  const loadPlan = useCallback(async (id) => {
    const plan = await getPlan(id);
    setCurrentPlan(plan);
    setCurrentPlanId(id);
  }, []);

  useEffect(() => {
    if (plans.length > 0 && !currentPlanId) {
      loadPlan(plans[0].id);
    }
  }, [plans, currentPlanId, loadPlan]);

  const handleCreatePlan = async () => {
    const name = prompt('Plan name:', 'New Plan');
    if (!name) return;
    await createPlan(name);
    await refreshPlans();
  };

  const handleDeletePlan = async (id) => {
    if (!confirm('Delete this plan?')) return;
    await deletePlan(id);
    await refreshPlans();
    if (currentPlanId === id) {
      const all = await getAllPlans();
      if (all.length > 0) {
        loadPlan(all[0].id);
      } else {
        setCurrentPlan(null);
        setCurrentPlanId(null);
      }
    }
  };

  const handleDuplicatePlan = async (id) => {
    await duplicatePlan(id);
    await refreshPlans();
  };

  const handleSavePlan = async (updates) => {
    if (!currentPlanId) return;
    await savePlan(currentPlanId, updates);
    await loadPlan(currentPlanId);
    await refreshPlans();
  };

  const handleUpdateState = async (itemId, updates) => {
    if (!currentPlanId) return;
    await updatePlanState(currentPlanId, itemId, updates);
    await loadPlan(currentPlanId);
  };

  const handleAddItem = async (itemId, itemName, stackSize) => {
    if (!currentPlanId || !currentPlan) return;
    const items = [...(currentPlan.items || [])];
    if (items.find(i => i.id === itemId)) return;
    const targetTier = (currentPlan.tiers?.length > 0) ? currentPlan.tiers[currentPlan.tiers.length - 1].tier : 0;
    items.push({
      id: itemId,
      name: itemName,
      stackSize,
      tier: targetTier,
    });

    const availableRecipes = dataRegistry?.findRecipesByName(itemName) || [];
    const defaultRecipe = availableRecipes.find(r => !r.isAlternate) || availableRecipes[0];
    const recipes = { ...currentPlan.recipes };
    const state = { ...currentPlan.state };

    if (defaultRecipe) {
      recipes[itemId] = defaultRecipe;
    }
    state[itemId] = { quantity: 0, crafted: 0 };

    await handleSavePlan({ items, recipes, state });
  };

  const handleRemoveItem = async (itemId) => {
    if (!currentPlanId || !currentPlan) return;
    const items = currentPlan.items.filter(i => i.id !== itemId);
    const recipes = { ...currentPlan.recipes };
    delete recipes[itemId];
    const state = { ...currentPlan.state };
    delete state[itemId];
    await handleSavePlan({ items, recipes, state });
  };

  const handleSetRecipe = async (itemId, recipe) => {
    if (!currentPlanId || !currentPlan) return;
    const recipes = { ...currentPlan.recipes, [itemId]: recipe };
    await handleSavePlan({ recipes });
  };

  const handleImportSfmd = async (fileContent, tierEdits) => {
    if (!dataRegistry) return;
    const planData = sfmdImport(fileContent, dataRegistry);
    if (tierEdits) {
      planData.items = planData.items.map(item => {
        const edit = tierEdits.find(e => e.name === item.name);
        if (edit) return { ...item, tier: edit.tier };
        return item;
      });
    }
    const newTiers = planData.tiers?.map((t, i) => ({
      tier: i,
      label: `Auto-detected Tier ${i}`,
      color: TIER_COLORS[i % TIER_COLORS.length],
    })) || [];

    const initState = {};
    for (const item of planData.items) {
      initState[item.id] = {
        quantity: 0,
        crafted: 0,
      };
    }

    if (!currentPlanId || !currentPlan) {
      const id = await db.plans.add({
        name: 'Imported Plan',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tiers: newTiers,
        items: planData.items,
        recipes: planData.recipes,
        state: initState,
      });
      setCurrentPlanId(id);
      await refreshPlans();
      await loadPlan(id);
    } else {
      const existingIds = new Set(currentPlan.items.map(i => i.id));
      const newItems = planData.items.filter(i => !existingIds.has(i.id));
      const existingMaxTier = (currentPlan.tiers || []).length > 0
        ? Math.max(...currentPlan.tiers.map(t => t.tier), -1)
        : (currentPlan.items || []).reduce((max, i) => Math.max(max, i.tier != null ? Number(i.tier) : -1), -1);
      const nextTier = existingMaxTier + 1;
      const offsetTiers = newTiers.map(t => ({ ...t, tier: t.tier + nextTier }));
      const offsetItems = newItems.map(item => ({ ...item, tier: item.tier + nextTier }));
      const mergedRecipes = { ...currentPlan.recipes, ...planData.recipes };
      const newState = {};
      for (const [id] of Object.entries(mergedRecipes)) {
        if (!(id in currentPlan.state)) {
          newState[id] = { quantity: 0, crafted: 0 };
        }
      }
      for (const item of offsetItems) {
        if (!(item.id in newState) && !(item.id in currentPlan.state)) {
          newState[item.id] = { quantity: 0, crafted: 0 };
        }
      }
      const mergedState = { ...currentPlan.state, ...newState };

      await handleSavePlan({
        items: [...currentPlan.items, ...offsetItems],
        recipes: mergedRecipes,
        tiers: [...(currentPlan.tiers || []), ...offsetTiers],
        state: mergedState,
      });
    }
    setShowImport(false);

    if (planData.warnings?.length > 0) {
      alert(`${planData.warnings.length} recipe(s) could not be loaded from Docs.json:\n\n${planData.warnings.join('\n')}\n\nItems with missing recipes use stub data (quantity=1). Recipe breakdowns will be inaccurate.`);
    }
  };

  const handleImportPlan = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      const name = prompt('Plan name:', 'Imported Plan');
      if (!name) return;
      await importPlan(text, name);
      await refreshPlans();
    };
    input.click();
  };

  const handleExportPlan = async () => {
    if (!currentPlanId) return;
    const json = await exportPlan(currentPlanId);
    if (!json) return;
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${currentPlan?.name || 'plan'}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleChangeTier = async (itemId, newTier) => {
    if (!currentPlanId || !currentPlan) return;
    const items = currentPlan.items.map(i =>
      i.id === itemId ? { ...i, tier: newTier } : i
    );
    await handleSavePlan({ items });
  };

  return (
    <div className="app">
      <PlanSidebar
        plans={plans}
        currentPlanId={currentPlanId}
        currentPlan={currentPlan}
        view={view}
        onSelectPlan={loadPlan}
        onCreatePlan={handleCreatePlan}
        onDeletePlan={handleDeletePlan}
        onDuplicatePlan={handleDuplicatePlan}
        onImportClick={() => setShowImport(true)}
        onImportPlan={handleImportPlan}
        onExportPlan={handleExportPlan}
        onViewChange={setView}
        dataRegistry={dataRegistry}
      />
      <main className="main">
        {view === 'library' ? (
          <ItemLibrary
            registry={dataRegistry}
            plan={currentPlan}
            onAddItem={handleAddItem}
            onSetRecipe={handleSetRecipe}
          />
        ) : (
          <Calculator
            plan={currentPlan}
            registry={dataRegistry}
            editMode={editMode}
            onToggleEdit={() => setEditMode(m => !m)}
            onUpdateState={handleUpdateState}
            onUpdateTarget={(itemId, quantity) => handleUpdateState(itemId, { quantity })}
            onRemoveItem={handleRemoveItem}
            onSetRecipe={handleSetRecipe}
            onChangeTier={handleChangeTier}
            onChangeTierLabel={(tierIndex, label) => {
              const tiers = (currentPlan?.tiers || []).map((t, i) =>
                i === tierIndex ? { ...t, label } : t
              );
              handleSavePlan({ tiers });
            }}
            onSavePlan={handleSavePlan}
          />
        )}
      </main>
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={handleImportSfmd}
        />
      )}
    </div>
  );
}
