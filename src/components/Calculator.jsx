import React from 'react';
import ItemCard from './ItemCard';

const TIER_COLORS = [
  '#e87a23', '#5c6bc0', '#26a69a', '#ffa726', '#ef5350',
  '#ab47bc', '#66bb6a', '#29b6f6', '#ec407a', '#8d6e63',
];

function buildTiers(plan) {
  if (!plan) return [];
  const items = plan.items || [];
  const tierMap = {};
  items.forEach(item => {
    const t = item.tier != null ? Number(item.tier) : -1;
    if (!tierMap[t]) tierMap[t] = [];
    tierMap[t].push(item);
  });

  const existingTiers = plan.tiers || [];
  const definedTiers = new Set(existingTiers.map(t => Number(t.tier)));
  const tiers = [];

  existingTiers.forEach((t, i) => {
    const tNum = Number(t.tier);
    tiers.push({
      ...t,
      tier: tNum,
      index: i,
      items: (tierMap[tNum] || []).sort((a, b) => a.name.localeCompare(b.name)),
      color: t.color || TIER_COLORS[i % TIER_COLORS.length],
    });
  });

  Object.keys(tierMap)
    .map(Number)
    .filter(t => t >= 0 && !definedTiers.has(t))
    .sort((a, b) => a - b)
    .forEach((t, i) => {
      tiers.push({
        tier: t,
        label: `Tier ${t}`,
        color: TIER_COLORS[(existingTiers.length + i) % TIER_COLORS.length],
        items: (tierMap[t] || []).sort((a, b) => a.name.localeCompare(b.name)),
        index: tiers.length,
      });
    });

  const unassigned = tierMap[-1];
  if (unassigned?.length) {
    tiers.push({
      tier: -1, label: 'Unassigned', color: 'var(--text-faint)',
      items: unassigned, index: tiers.length,
    });
  }

  return tiers;
}

export default function Calculator({ plan, registry, editMode, onToggleEdit, onUpdateState, onUpdateTarget, onRemoveItem, onSetRecipe, onChangeTier, onChangeTierLabel, onSavePlan }) {
  if (!plan) {
    return (
      <div className="main-header">
        <h2>No plan selected</h2>
        <span className="empty-hint">Create a plan or import a .sfmd file to get started.</span>
      </div>
    );
  }

  const tiers = buildTiers(plan);

  const handleLabelChange = (tier, tierIndex, value) => {
    const existingIndex = (plan.tiers || []).findIndex(t => Number(t.tier) === Number(tier.tier));
    if (existingIndex >= 0) {
      onChangeTierLabel(existingIndex, value);
    } else {
      const updated = [...(plan.tiers || []), { tier: tier.tier, label: value, color: tier.color }];
      onSavePlan({ tiers: updated });
    }
  };

  return (
    <div>
      <div className="main-header">
        <h2>{plan.name}</h2>
        <div className="header-actions">
          <button
            className={`sb-btn ${editMode ? 'primary' : ''}`}
            onClick={onToggleEdit}
          >
            {editMode ? 'Done editing' : 'Edit plan'}
          </button>
        </div>
      </div>

      {tiers.length === 0 && (
        <div className="empty-hint">No items in this plan. Switch to Item Library to add items.</div>
      )}

      {tiers.map((tier, i) => (
        <div className="tier-section" key={i}>
          <div className="tier-head" style={{ '--tier-color': tier.color }}>
            {tier.tier >= 0 ? (
              editMode ? (
                <input
                  className="tier-name-input"
                  value={tier.label || `Tier ${tier.tier}`}
                  onChange={(e) => handleLabelChange(tier, i, e.target.value)}
                />
              ) : (
                <h3>{tier.label || `Tier ${tier.tier}`}</h3>
              )
            ) : (
              <h3>{tier.label}</h3>
            )}
            <span className="tier-meta">{tier.items.length} items</span>
          </div>
          <div className="cards">
            {tier.items.map(item => (
              <ItemCard
                key={item.id}
                item={item}
                plan={plan}
                registry={registry}
                editMode={editMode}
                onUpdateState={onUpdateState}
                onUpdateTarget={onUpdateTarget}
                onRemoveItem={onRemoveItem}
                onSetRecipe={onSetRecipe}
                onChangeTier={onChangeTier}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
