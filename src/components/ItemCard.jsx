import React, { useState, useEffect } from 'react';
import { recipeInputs, totalSlots, calcChests, craftedFromStacks, craftedDecreaseForStacks } from '../lib/calc';
import { fmtNum, parseNum, fmtChests } from '../lib/format';
import IngredientRow from './IngredientRow';

export default function ItemCard({ item, plan, registry, editMode, onUpdateState, onUpdateTarget, onRemoveItem, onSetRecipe, onChangeTier }) {
  const state = (plan.state || {})[item.id] || {};
  const target = state.quantity || 0;
  const explicitRecipe = (plan.recipes || {})[item.id];
  const availableRecipes = registry?.findRecipesByName(item.name) || [];
  const recipe = explicitRecipe || availableRecipes[0] || null;

  const [showRecipes, setShowRecipes] = useState(false);
  const [localVal, setLocalVal] = useState('');
  const [craftedLocal, setCraftedLocal] = useState('');

  useEffect(() => {
    setLocalVal(fmtNum(target));
  }, [target]);

  const craftedCount = state.crafted || 0;

  useEffect(() => {
    setCraftedLocal(fmtNum(craftedCount));
  }, [craftedCount]);

  const hasRecipeData = !!recipe;
  const isStub = recipe?._stub === true;

  const inputs = recipe ? recipeInputs(target, recipe) : [];
  const slots = totalSlots(target, item.stackSize);
  const chests = calcChests(slots);

  const tiers = plan.tiers || [];
  const currentTier = item.tier != null ? Number(item.tier) : -1;

  const stepSize = item.stackSize || 50;

  const getConsumedStacks = (input) => {
    if (!recipe || craftedCount <= 0) return 0;
    const craftedInputs = recipeInputs(craftedCount, recipe);
    const match = craftedInputs.find(i => i.id === input.id);
    return match ? totalSlots(match.quantity, input.stackSize) : 0;
  };

  const adjustIngredient = (input, delta) => {
    if (!recipe) return;
    const currentStacks = getConsumedStacks(input);
    const targetStacks = currentStacks + delta;
    let newCrafted;
    if (delta > 0) {
      newCrafted = craftedFromStacks(recipe, input, targetStacks);
    } else {
      newCrafted = craftedDecreaseForStacks(recipe, input, targetStacks, craftedCount);
    }
    newCrafted = Math.max(0, Math.min(target, newCrafted));
    onUpdateState(item.id, { crafted: newCrafted });
  };

  const handleInputChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    if (!/^\d*$/.test(raw)) return;
    setLocalVal(fmtNum(parseInt(raw || '0', 10)));
  };

  const handleInputBlur = () => {
    onUpdateTarget(item.id, parseNum(localVal));
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  const handleCraftedChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    if (!/^\d*$/.test(raw)) return;
    setCraftedLocal(fmtNum(parseInt(raw || '0', 10)));
  };

  const handleCraftedBlur = () => {
    const val = parseNum(craftedLocal);
    onUpdateState(item.id, { crafted: Math.min(val, target) });
  };

  const handleCraftedKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  const adjCrafted = (delta) => {
    const next = Math.max(0, Math.min(target, craftedCount + delta));
    onUpdateState(item.id, { crafted: next });
  };

  return (
    <div className="card">
      <div className="card-top">
        <h4>{item.name}</h4>
        {editMode && onChangeTier && (
          <select
            value={currentTier}
            onChange={(e) => onChangeTier(item.id, parseInt(e.target.value, 10))}
            style={{
              background: 'var(--surface2)', color: 'var(--text-dim)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              padding: '2px 4px', fontFamily: 'var(--font-mono)', fontSize: 10,
              marginRight: 4,
            }}
          >
            <option value={-1} style={{ color: 'var(--text-faint)' }}>Unassigned</option>
            {tiers.map(t => (
              <option key={t.tier} value={t.tier}>Tier {t.tier}: {t.label}</option>
            ))}
          </select>
        )}
        {editMode && (
          <button className="card-remove" onClick={() => onRemoveItem(item.id)} title="Remove from plan">x</button>
        )}
      </div>

      <div className="card-target">
        <label>Target</label>
        <input
          type="text"
          inputMode="numeric"
          value={localVal}
          placeholder="0"
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
        />
      </div>

      {target > 0 && (
        <div className="card-summary">
          <span>{fmtNum(target)} items</span>
          <span className="cv">{fmtNum(slots)} stacks</span>
          {chests.full > 0 || chests.rem > 0 ? (
            <span className="cv">{fmtChests(chests)}</span>
          ) : null}
        </div>
      )}

      {recipe && target > 0 && (
        <div className="card-target">
          <label>Crafted</label>
          <div className="bc">
            <button onClick={() => adjCrafted(-stepSize)} disabled={craftedCount <= 0} title={`−${fmtNum(stepSize)} (1 stack)`}>−</button>
            <input
              type="text"
              inputMode="numeric"
              value={craftedLocal}
              placeholder="0"
              onChange={handleCraftedChange}
              onBlur={handleCraftedBlur}
              onKeyDown={handleCraftedKeyDown}
              style={{
                width: 80, textAlign: 'center', background: 'transparent', color: 'var(--ink)',
                border: 'none', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-sm)',
                fontWeight: 600, outline: 'none', padding: 0,
              }}
            />
            <button onClick={() => adjCrafted(stepSize)} disabled={craftedCount >= target} title={`+${fmtNum(stepSize)} (1 stack)`}>+</button>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)', color: 'var(--ink-dim)', marginLeft: 8 }}>
            of {fmtNum(target)}
          </span>
        </div>
      )}

      {editMode && hasRecipeData && target > 0 && (
        <>
          {!explicitRecipe && (
            <div className="recipe-select" style={{ marginBottom: 8 }}>
              <div className="sidebar-label">Choose recipe</div>
              {availableRecipes.map((r, i) => (
                <div
                  key={i}
                  className="recipe-option"
                  onClick={() => onSetRecipe(item.id, r)}
                >
                  <span>{r.outputName}</span>
                  <span className="ro-badge">{r.isAlternate ? 'ALT' : 'STD'}</span>
                </div>
              ))}
            </div>
          )}
          {explicitRecipe && (
            <div>
              <div className="breakdown">
                <div className="breakdown-label">
                  Recipe &mdash; needed / remaining
                  {isStub && (
                    <span style={{ color: 'var(--amber)', marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                      ⚠ stub &mdash; data missing
                    </span>
                  )}
                </div>
                {inputs.map(inp => (
                  <IngredientRow
                    key={inp.id}
                    input={inp}
                    consumed={getConsumedStacks(inp)}
                    onAdjust={(delta) => adjustIngredient(inp, delta)}
                  />
                ))}
              </div>
              {availableRecipes.length > 1 && (
                <div style={{ marginTop: 6 }}>
                  <button className="sb-btn small" onClick={() => setShowRecipes(!showRecipes)}>
                    Change recipe
                  </button>
                  {showRecipes && (
                    <div className="recipe-select" style={{ marginTop: 4 }}>
                      {availableRecipes.map((r, i) => (
                        <div
                          key={i}
                          className={`recipe-option ${r.outputName === explicitRecipe?.outputName ? 'selected' : ''}`}
                          onClick={() => { onSetRecipe(item.id, r); setShowRecipes(false); }}
                        >
                          <span>{r.outputName}</span>
                          <span className="ro-badge">{r.isAlternate ? 'ALT' : 'STD'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!editMode && recipe && target > 0 && (
        <div className="breakdown">
          <div className="breakdown-label">
            Recipe &mdash; needed / remaining
            {isStub && (
              <span style={{ color: 'var(--amber)', marginLeft: 8, fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>
                ⚠ stub &mdash; data missing
              </span>
            )}
          </div>
          {inputs.map(inp => (
            <IngredientRow
              key={inp.id}
              input={inp}
              consumed={getConsumedStacks(inp)}
              onAdjust={(delta) => adjustIngredient(inp, delta)}
            />
          ))}
        </div>
      )}

      {!hasRecipeData && target > 0 && (
        <div className="breakdown">
          <div className="br-no-recipe">No recipe data available for this item.</div>
        </div>
      )}
    </div>
  );
}
