# Satisfactory Production Tracker

A production-chain tracking tool for [Satisfactory](https://www.satisfactorygame.com/). Import your factory plans from [Satisfactory Modeler](https://github.com/satisfactory-modeling/satisfactory-modeler), set target quantities, and track how many items you've crafted — with ingredient consumption calculated automatically and kept in sync.

![License](https://img.shields.io/badge/license-MIT-blue)
![React](https://img.shields.io/badge/React-19-61dafb)
![Vite](https://img.shields.io/badge/Vite-6-646cff)

---

## What it does

This tool answers two questions: **what do I need to gather?** and **how much have I already crafted?**

It is **not** a factory planner — that's Satisfactory Modeler's job. This tool sits on the other side: once you've designed a production chain in the Modeler, import the `.sfmd` save file here and track your crafting progress against the plan. No machine counts, no throughput calculations, no belt speeds. Just recipe math and consumption tracking.

### Key features

- **`.sfmd` import** — drag in a Satisfactory Modeler save file. Items, input relationships, and canvas positions are parsed automatically. Tiers are auto-detected by clustering items on their X coordinate (left-to-right = earlier tiers).
- **Canonical recipe data from Docs.json** — all 142 items and 850 recipes are extracted directly from the game's own documentation file. No manual recipe entry. Standard and alternate recipes are both available.
- **Bidirectional consumption tracking** — enter how many items you've crafted, and ingredient consumption updates automatically. Or adjust an individual ingredient's consumed stacks, and the crafted count recalculates to match. Both counters stay in sync.
- **Multiple plans** — create, duplicate, switch between, export, and import plans. Each plan is a self-contained JSON object with items, tiers, recipes, and tracking state.
- **Tier management** — rename tiers, move items between tiers, auto-detect tiers from `.sfmd` canvas layout.
- **Item library** — browse all Satisfactory items (searchable), add any item to your plan, choose between standard and alternate recipe variants.
- **Industrial container math** — quantities display in items, stacks (integer + remainder), and industrial container equivalents (48 stacks = 1 container).

---

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (tested on Node 22+)
- A copy of Satisfactory's `Docs.json` (found at `<Satisfactory install>/CommunityResources/Docs/Docs.json` or any of the locale JSON files like `en-US.json`)

### Installation

```bash
git clone https://github.com/YOUR_USERNAME/satisfactory-production-tracker.git
cd satisfactory-production-tracker
npm install
```

### Generate recipe data

The app needs a parsed data file from Satisfactory's `Docs.json`. Place the file at `scripts/en-US.json` (UTF-16 LE encoded, as shipped by the game), then run:

```bash
npm run parse-docs
```

This generates `public/satisfactory-data.json` containing all items, recipes, and buildings in a clean format. Re-run this whenever Satisfactory updates.

### Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

### Build for production

```bash
npm run build
```

Output goes to `dist/`. The `public/satisfactory-data.json` file is included in the build automatically.

---

## Usage

### Importing a plan from Satisfactory Modeler

1. Open [Satisfactory Modeler](https://github.com/satisfactory-modeling/satisfactory-modeler) and design your production chain.
2. Save the file (`.sfmd` format).
3. In this tool, click **Import .sfmd** in the sidebar.
4. Drop the `.sfmd` file or browse to select it.
5. Review the auto-detected tiers. Items are grouped by their horizontal position on the Modeler canvas. Adjust tier assignments if needed.
6. Click **Import**. The plan is created with all items, recipes, and tier assignments.

### Tracking crafting progress

1. Enter a **target** quantity for each item you want to produce.
2. As you craft items in-game, update the **Crafted** counter:
   - Type a number directly into the input field
   - Use the `+` / `−` buttons (step = one stack of that item)
3. Ingredient rows show **consumed** and **remaining** stacks automatically, derived from the crafted count.
4. You can also adjust an ingredient's consumed stacks directly with its `+` / `−` buttons — the crafted count will recalculate to match.

### Editing a plan

Click **Edit plan** in the header to toggle edit mode:

- **Remove items** — `×` button on each card
- **Move items between tiers** — dropdown on each card
- **Rename tiers** — inline text input on tier headers
- **Change recipes** — switch between standard and alternate variants
- **Add items** — switch to the Item Library view and search

Click **Done editing** to return to the calculator view.

### Exporting and importing plans

- **Export Plan JSON** — downloads the current plan as a `.json` file (includes items, tiers, recipes, and tracking state)
- **Import Plan JSON** — loads a previously exported plan

Plans are also automatically persisted in the browser via IndexedDB, so they survive page reloads.

---

## How it works

### Architecture

```
┌─────────────────────────────────────────────┐
│  React UI (src/components/)                 │
│  Calculator · ItemCard · IngredientRow      │
│  PlanSidebar · ItemLibrary · ImportModal    │
├─────────────────────────────────────────────┤
│  Import layer (src/import/sfmd.js)          │
│  Parse .sfmd · Detect tiers · Build graph   │
├─────────────────────────────────────────────┤
│  Data layer (src/data/loader.js)            │
│  Load satisfactory-data.json · Recipe lookup│
├─────────────────────────────────────────────┤
│  Calc engine (src/lib/calc.js)              │
│  Game-agnostic · Recipe math · Stack/chest  │
├─────────────────────────────────────────────┤
│  Storage (src/lib/db.js)                    │
│  Dexie/IndexedDB · Plan CRUD · State persist│
└─────────────────────────────────────────────┘
```

### Calculation engine

The calculation engine (`src/lib/calc.js`) is **game-agnostic**. It operates on a generic data model:

- An **item** has a name, a stack size, and belongs to a production tier
- A **recipe** maps an output item to its input items with per-craft-cycle quantities
- A **container** holds 48 stacks (one industrial container / double chest)

Core functions:

| Function | Purpose |
|---|---|
| `recipeInputs(target, recipe)` | Calculate ingredient quantities for a target output |
| `totalSlots(quantity, stackSize)` | Convert item count to inventory slots (stacks) |
| `calcChests(slots)` | Break stacks into containers + remainder |
| `craftedFromStacks(recipe, input, stacks)` | Reverse: find crafted count from consumed stacks |
| `craftedDecreaseForStacks(...)` | Reverse for decrease direction |

The bidirectional sync works because ingredient consumption is always **derived** from the crafted count, never stored independently. When you adjust an ingredient's consumed stacks, the engine reverse-calculates what crafted count produces that consumption level.

### `.sfmd` import pipeline

1. **Parse** — extract item names, X/Y canvas positions, and input relationships from the JSON
2. **Cluster by X** — sort items horizontally, detect gaps > 80px, each cluster becomes a tier
3. **Cross-reference Docs.json** — match item names to canonical recipes (standard recipes preferred over alternates)
4. **Populate plan** — items, tiers, recipes, and initial state (all zeros)

Items that can't be matched to a recipe get a stub recipe (quantity=1) and a warning is shown.

### Docs.json parser

`scripts/parse-docs.mjs` reads Satisfactory's `Docs.json` (UTF-16 LE encoded) and extracts:

- **142 items** — name, stack size, description, sink points
- **850 recipes** — ingredients, products, per-craft amounts, produced-in buildings, duration, alternate flag
- **20 buildings** — name and description

The parser handles the game's string-encoded data format (e.g., `"((ItemClass=\"...Desc_IronPlate_C'\",Amount=3))"`) and converts it to clean JavaScript objects.

### Data model

```js
// Plan (stored in IndexedDB)
{
  id: number,           // auto-increment
  name: string,
  createdAt: string,    // ISO timestamp
  updatedAt: string,
  tiers: [{ tier, label, color }],
  items: [{ id, name, stackSize, tier }],
  recipes: { [itemId]: { output, outputPerCraft, inputs: [...] } },
  state: { [itemId]: { quantity, crafted } }
}

// Recipe
{
  output: string,         // item class name
  outputName: string,     // display name
  outputPerCraft: number, // items per craft cycle
  inputs: [{
    id: string,           // item class name
    name: string,         // display name
    quantity: number,     // per-craft amount
    stackSize: number,    // items per stack
  }],
  isAlternate: boolean,
}
```

### Tier convention

Tier 0 is always the first layer requiring manual crafting. There is no "automated inputs" escape hatch — every item in the chain gets full recipe expansion. If a deeper input is already automated by existing factories, you can simply ignore its recipe breakdown, but the data is always available.

---

## Project structure

```
satisfactory-production-tracker/
├── context/                    # Design docs and architecture notes
│   ├── essence.md              # What this project is (and isn't)
│   ├── data-model.md           # Generic data shapes
│   └── architecture.md         # How the layers fit together
├── legacy/                     # Original Phase 4 calculator (vanilla JS)
│   ├── index.html
│   ├── styles.css
│   ├── lib/
│   │   ├── calc.js
│   │   ├── format.js
│   │   └── storage.js
│   └── data/
│       ├── phase4-items.js
│       └── phase4-recipes.js
├── scripts/
│   ├── parse-docs.mjs          # Docs.json → satisfactory-data.json
│   └── en-US.json              # Source Docs.json (from Satisfactory)
├── src/                        # Main React application
│   ├── main.jsx                # Entry point
│   ├── App.jsx                 # Root component, state management
│   ├── App.css                 # Global styles, design tokens
│   ├── lib/
│   │   ├── calc.js             # Game-agnostic calculation engine
│   │   ├── format.js           # Number formatting (commas, containers)
│   │   └── db.js               # IndexedDB via Dexie
│   ├── data/
│   │   └── loader.js           # Load + query satisfactory-data.json
│   ├── import/
│   │   └── sfmd.js             # .sfmd parser, tier detection, import
│   └── components/
│       ├── PlanSidebar.jsx     # Plan list, tier overview, view switching
│       ├── Calculator.jsx      # Tier-grouped card grid
│       ├── ItemCard.jsx        # Per-item: target, crafted, recipe breakdown
│       ├── IngredientRow.jsx   # Per-ingredient: consumed/remaining
│       ├── ItemLibrary.jsx     # Searchable item browser
│       └── ImportModal.jsx     # .sfmd upload + tier review
├── public/
│   ├── satisfactory-data.json  # Generated recipe data (from parse-docs)
│   └── favicon.svg             # Logo
├── Phase4.sfmd                 # Example Modeler save (for testing import)
├── index.html                  # Vite entry
├── package.json
└── vite.config.js
```

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | React 19 |
| Build tool | Vite 6 |
| Persistence | Dexie 4 (IndexedDB wrapper) |
| Fonts | Space Grotesk, Fira Sans, JetBrains Mono |
| Recipe data | Satisfactory Docs.json (parsed at build time) |

No backend. No server. No account. Everything runs in the browser. Plans are stored locally in IndexedDB and can be exported/imported as JSON files.

---

## The `.sfmd` format

Satisfactory Modeler saves files in JSON format. The relevant fields:

```json
{
  "Version": "1.0",
  "Data": [
    {
      "Name": "Heavy Modular Frame",
      "X": -6200,
      "Y": -8300
    },
    {
      "Name": "Fused Modular Frame",
      "X": -5700,
      "Y": -8000,
      "Inputs": {
        "Heavy Modular Frame": [17]
      }
    }
  ]
}
```

- **Name** — the item's display name (matched against Docs.json)
- **X / Y** — canvas position (X = tier column, Y = vertical position within tier)
- **Inputs** — maps input item names to connection indices (the array values are graph link IDs, not quantities)
- **Max** — optional target quantity set in the Modeler

The `.sfmd` does **not** contain recipe details, stack sizes, or per-craft quantities. Those come from Docs.json. The import pipeline cross-references item names between the two sources.

---

## Limitations

- **No backend sync** — plans live in the browser. Use JSON export/import to move between devices.
- **No machine throughput** — this tool doesn't calculate how many machines you need or belt speeds. Use Satisfactory Modeler for that.
- **Docs.json required** — recipe data must be generated from Satisfactory's Docs.json file. Without it, items show "No recipe data available."
- **Name matching** — the import matches item names between `.sfmd` and Docs.json. If names don't match exactly (case-insensitive), recipes won't be found. A warning is shown for any unmatched items.

---

## Development

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Regenerate recipe data from Docs.json
npm run parse-docs
```

### Design system

The UI uses an industrial "FICSIT terminal" aesthetic:

- **Colors**: Deep near-black background (`#0b0d0c`), warm off-white text (`#e8e2d5`), FICSIT orange (`#f48229`) as the sole accent
- **Typography**: Space Grotesk (display), Fira Sans (body), JetBrains Mono (data/numbers)
- **Geometry**: Sharp edges (zero border-radius on cards), thin borders, no shadows
- **Density**: Dashboard-tight spacing (4/8/12px scale)

Design tokens are defined as CSS custom properties in `src/App.css`.

---

## Contributing

Contributions are welcome. Please open an issue first to discuss what you'd like to change.

### Areas for improvement

- Drag-and-drop tier reordering (currently dropdown-based)
- Sort options (by tier, name, target quantity)
- Plan templates
- Multi-game support (the calc engine is game-agnostic — only the data layer is Satisfactory-specific)
- Backend sync / cloud storage

---

## Acknowledgments

- [Satisfactory Modeler](https://github.com/satisfactory-modeling/satisfactory-modeler) — the factory planning tool whose `.sfmd` files this tool imports
- [Coffee Stain Studios](https://www.coffeestainstudios.com/) — for Satisfactory and its open documentation format
- [Dexie.js](https://dexie.org/) — the IndexedDB wrapper that makes plan persistence painless

---

## License

MIT
