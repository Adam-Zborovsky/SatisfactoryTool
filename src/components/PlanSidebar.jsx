import React from 'react';

export default function PlanSidebar({
  plans, currentPlanId, currentPlan, view,
  onSelectPlan, onCreatePlan, onDeletePlan, onDuplicatePlan,
  onImportClick, onImportPlan, onExportPlan,
  onViewChange, dataRegistry,
}) {
  const items = currentPlan?.items || [];
  const itemCountByTier = {};
  items.forEach(item => {
    const t = item.tier != null ? Number(item.tier) : -1;
    itemCountByTier[t] = (itemCountByTier[t] || 0) + 1;
  });

  const existingTiers = currentPlan?.tiers || [];
  const definedTierNums = new Set(existingTiers.map(t => Number(t.tier)));
  const autoTiers = Object.keys(itemCountByTier)
    .map(Number)
    .filter(t => t >= 0 && !definedTierNums.has(t))
    .sort((a, b) => a - b)
    .map(t => ({ tier: t, label: `Tier ${t}`, color: 'var(--text-faint)' }));

  const allTiers = [...existingTiers, ...autoTiers];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-dot" />
        <h1>Satisfactory <span>Tracker</span></h1>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Plans</div>
        <div className="plan-list">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`plan-item ${plan.id === currentPlanId ? 'active' : ''}`}
              onClick={() => onSelectPlan(plan.id)}
            >
              <span className="plan-name">{plan.name}</span>
              <span className="plan-actions">
                <button className="plan-btn" title="Duplicate" onClick={(e) => { e.stopPropagation(); onDuplicatePlan(plan.id); }}>+</button>
                <button className="plan-btn danger" title="Delete" onClick={(e) => { e.stopPropagation(); onDeletePlan(plan.id); }}>x</button>
              </span>
            </div>
          ))}
        </div>
        <button className="sb-btn block" onClick={onCreatePlan}>+ New Plan</button>
      </div>

      {currentPlan && currentPlan.items?.length > 0 && (
        <div className="sidebar-section">
          <div className="sidebar-label">Tiers</div>
          <div className="tier-list">
            {allTiers.map((t, i) => (
              <div className="tier-row" key={i}>
                <span className="dot" style={{ background: t.color || 'var(--orange)' }} />
                <span className="tier-name">{t.label}</span>
                <span className="tier-count">{itemCountByTier[Number(t.tier)] || 0}</span>
              </div>
            ))}
            {(itemCountByTier[-1] || 0) > 0 && (
              <div className="tier-row">
                <span className="dot" style={{ background: 'var(--ink-faint)' }} />
                <span className="tier-name" style={{ fontStyle: 'italic' }}>Unassigned</span>
                <span className="tier-count">{itemCountByTier[-1]}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="sidebar-section">
        <div className="sidebar-label">View</div>
        <button
          className={`sb-btn block ${view === 'calculator' ? 'primary' : ''}`}
          onClick={() => onViewChange('calculator')}
        >Calculator</button>
        <button
          className={`sb-btn block ${view === 'library' ? 'primary' : ''}`}
          onClick={() => onViewChange('library')}
          disabled={!dataRegistry}
        >Item Library</button>
      </div>

      <div className="sidebar-section">
        <div className="sidebar-label">Import / Export</div>
        <button className="sb-btn block" onClick={onImportClick}>Import .sfmd</button>
        <button className="sb-btn block" onClick={onImportPlan}>Import Plan JSON</button>
        <button className="sb-btn block" onClick={onExportPlan} disabled={!currentPlanId}>Export Plan JSON</button>
      </div>
    </aside>
  );
}
