import React, { useState, useMemo } from 'react';

export default function ItemLibrary({ registry, plan, onAddItem, onSetRecipe }) {
  const [search, setSearch] = useState('');

  const allItems = useMemo(() => {
    if (!registry) return [];
    return registry.getAllItems();
  }, [registry]);

  const filtered = useMemo(() => {
    if (!search.trim()) return allItems;
    const q = search.toLowerCase();
    return allItems.filter(i => i.name.toLowerCase().includes(q));
  }, [allItems, search]);

  const planItemIds = useMemo(() => {
    if (!plan) return new Set();
    return new Set((plan.items || []).map(i => i.id));
  }, [plan]);

  const handleItemClick = (item) => {
    if (planItemIds.has(item.id)) return;
    onAddItem(item.id, item.name, item.stackSize);
  };

  return (
    <div>
      <div className="main-header">
        <h2>Item Library</h2>
        <span className="empty-hint">{allItems.length} items from Docs.json</span>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="library-grid">
        {filtered.map(item => (
          <div
            key={item.id}
            className={`library-item ${planItemIds.has(item.id) ? 'in-plan' : ''}`}
            onClick={() => handleItemClick(item)}
          >
            <div className="li-name">{item.name}</div>
            <div className="li-meta">
              Stack: {item.stackSize}
              {item.sinkPoints > 0 && <span className="li-badge">{item.sinkPoints} pts</span>}
              {planItemIds.has(item.id) && <span className="li-badge">In plan</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
