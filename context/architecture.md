# Architecture

## Layer stack

```
┌─────────────────────────────────┐
│  src/index.html + styles.css    │  ← UI rendering, event handling
├─────────────────────────────────┤
│  src/data/phase4-items.js       │  ← Item definitions, tier labels/colors
│  src/data/phase4-recipes.js     │  ← Recipe definitions (per-craft-cycle)
├─────────────────────────────────┤
│  src/lib/calc.js                │  ← Recipe math, stack/chest conversion
│  src/lib/format.js              │  ← Number formatting, live input masking
│  src/lib/storage.js             │  ← localStorage CRUD, export/import
└─────────────────────────────────┘
```

## Data flow

1. User enters a target quantity → saved to state via `storage.js`
2. `calc.js` reads the item's recipe from `phase4-recipes.js`
3. For each recipe input: `ceil(target / outputPerCraft) * input.quantity`
4. Results converted to stacks and chests via `calc.js`
5. Per-input consumption state tracked in `state[itemId].consumed[inputId]`
6. Remaining stacks calculated as `totalSlots - consumed`
7. `format.js` applies comma formatting to all displayed numbers
8. UI re-renders the full card grid

## Consumption tracking

Each recipe ingredient row on a card shows:
- **Total needed**: auto-calculated items, stacks, and chests
- **Stacks consumed**: integer counter with +/- buttons (persisted to state)
- **Stacks remaining**: total − consumed (auto-updating)
- **Chests remaining**: conversion of remaining stacks to chest units

When target changes, consumed counts are capped to the new ingredient totals. Consumed counts are included in JSON exports and restored on import.

## Rendering

Vanilla DOM manipulation — no framework. `render()` rebuilds the entire card grid from state on any change. The data set is small enough (22 items, ~80 recipe inputs) that full rebuild is fast.

## State persistence

- **Primary**: `localStorage` under key `sf-phase4-v4` — auto-saved on every change
- **Backup**: JSON export/import buttons — manual snapshots to file
- **Namespace**: versioned key allows multiple phases to coexist in the same browser

## Current implementation

Satisfactory Phase 4 — 22 items across 6 tiers (0–5), with full recipe data for all items. Tier 0 ("Craftable Inputs") is the first layer requiring manual crafting. The engine is generic; the data is Satisfactory-specific.

## Extending for new phases/games

1. Create new data files in `src/data/` for the new item set and recipes
2. Point `index.html` script tags at the new data files (or add phase switching)
3. Update `Store.key` for a fresh namespace
4. `src/lib/` files require zero changes
