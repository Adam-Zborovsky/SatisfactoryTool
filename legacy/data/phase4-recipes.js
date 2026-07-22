// phase4-recipes.js — Recipe definitions for Satisfactory Phase 4
window.SF = window.SF || {};

SF.RECIPES = {
  // ── Tier 0: Craftable Inputs ─────────────────────────────
  "copper-powder": {
    outputPerCraft: 5,
    inputs: [
      { id: "copper-ingot",   name: "Copper Ingot",  quantity: 30, stackSize: 100 },
    ],
  },
  "ai-limiter": {
    outputPerCraft: 1,
    inputs: [
      { id: "copper-sheet",   name: "Copper Sheet",  quantity: 5,  stackSize: 200 },
      { id: "quickwire",      name: "Quickwire",     quantity: 20, stackSize: 500 },
    ],
  },
  "high-speed-connector": {
    outputPerCraft: 1,
    inputs: [
      { id: "quickwire",      name: "Quickwire",     quantity: 56, stackSize: 500 },
      { id: "cable",          name: "Cable",         quantity: 10, stackSize: 200 },
      { id: "circuit-board",  name: "Circuit Board",  quantity: 1,  stackSize: 200 },
    ],
  },
  "circuit-board": {
    outputPerCraft: 1,
    inputs: [
      { id: "copper-sheet",   name: "Copper Sheet",  quantity: 2,  stackSize: 200 },
      { id: "plastic",        name: "Plastic",       quantity: 4,  stackSize: 200 },
    ],
  },
  "automated-wiring": {
    outputPerCraft: 1,
    inputs: [
      { id: "stator",         name: "Stator",        quantity: 1,  stackSize: 100 },
      { id: "cable",          name: "Cable",         quantity: 20, stackSize: 200 },
    ],
  },
  "heat-sink": {
    outputPerCraft: 1,
    inputs: [
      { id: "aluminum-sheet", name: "Aluminum Sheet", quantity: 5,  stackSize: 200 },
      { id: "copper-sheet",   name: "Copper Sheet",   quantity: 3,  stackSize: 200 },
    ],
  },

  // ── Tier 1: Foundational Components ──────────────────────
  "heavy-modular-frame": {
    outputPerCraft: 1,
    inputs: [
      { id: "modular-frame",        name: "Modular Frame",         quantity: 5,   stackSize: 50 },
      { id: "encased-beam",         name: "Encased Industrial Beam",quantity: 5,  stackSize: 100 },
      { id: "steel-pipe",           name: "Steel Pipe",            quantity: 20,  stackSize: 200 },
      { id: "screws",               name: "Screws",                quantity: 120, stackSize: 500 },
    ],
  },
  "radio-control-unit": {
    outputPerCraft: 1,
    inputs: [
      { id: "aluminum-casing",      name: "Aluminum Casing",       quantity: 32, stackSize: 200 },
      { id: "crystal-oscillator",   name: "Crystal Oscillator",   quantity: 1,  stackSize: 100 },
      { id: "computer",             name: "Computer",              quantity: 1,  stackSize: 50 },
    ],
  },
  "modular-engine": {
    outputPerCraft: 1,
    inputs: [
      { id: "motor",                name: "Motor",                 quantity: 2,  stackSize: 50 },
      { id: "rubber",               name: "Rubber",                quantity: 15, stackSize: 200 },
      { id: "smart-plating",        name: "Smart Plating",        quantity: 2,  stackSize: 50 },
    ],
  },
  "versatile-framework": {
    outputPerCraft: 2,
    inputs: [
      { id: "modular-frame",        name: "Modular Frame",         quantity: 1,  stackSize: 50 },
      { id: "steel-beam",           name: "Steel Beam",            quantity: 12, stackSize: 200 },
    ],
  },

  // ── Tier 2: Phase 4 Subcomponents ────────────────────────
  "fused-modular-frame": {
    outputPerCraft: 1,
    inputs: [
      { id: "heavy-modular-frame",  name: "Heavy Modular Frame",   quantity: 1,  stackSize: 50 },
      { id: "aluminum-casing",      name: "Aluminum Casing",       quantity: 50, stackSize: 200 },
      { id: "nitrogen-gas",         name: "Nitrogen Gas",          quantity: 25, stackSize: 500 },
    ],
  },
  "electromagnetic-ctrl-rod": {
    outputPerCraft: 2,
    inputs: [
      { id: "ai-limiter",           name: "AI Limiter",            quantity: 2,  stackSize: 100 },
      { id: "stator",               name: "Stator",                quantity: 3,  stackSize: 100 },
    ],
  },
  "cooling-system": {
    outputPerCraft: 1,
    inputs: [
      { id: "heat-sink",            name: "Heat Sink",             quantity: 2,  stackSize: 100 },
      { id: "rubber",               name: "Rubber",                quantity: 2,  stackSize: 200 },
      { id: "water",                name: "Water",                 quantity: 5,  stackSize: 500 },
      { id: "nitrogen-gas",         name: "Nitrogen Gas",          quantity: 25, stackSize: 500 },
    ],
  },
  "supercomputer": {
    outputPerCraft: 1,
    inputs: [
      { id: "ai-limiter",           name: "AI Limiter",            quantity: 2,  stackSize: 100 },
      { id: "high-speed-connector", name: "High-Speed Connector",  quantity: 3,  stackSize: 100 },
      { id: "computer",             name: "Computer",              quantity: 4,  stackSize: 50 },
      { id: "plastic",              name: "Plastic",               quantity: 28, stackSize: 200 },
    ],
  },
  "adaptive-control-unit": {
    outputPerCraft: 1,
    inputs: [
      { id: "automated-wiring",     name: "Automated Wiring",      quantity: 5,  stackSize: 100 },
      { id: "circuit-board",        name: "Circuit Board",         quantity: 5,  stackSize: 200 },
      { id: "heavy-modular-frame",  name: "Heavy Modular Frame",   quantity: 1,  stackSize: 50 },
      { id: "computer",             name: "Computer",              quantity: 2,  stackSize: 50 },
    ],
  },

  // ── Tier 3: Complex Parts ────────────────────────────────
  "pressure-conversion-cube": {
    outputPerCraft: 1,
    inputs: [
      { id: "fused-modular-frame",  name: "Fused Modular Frame",   quantity: 1,  stackSize: 50 },
      { id: "radio-control-unit",   name: "Radio Control Unit",    quantity: 2,  stackSize: 50 },
    ],
  },
  "turbo-motor": {
    outputPerCraft: 1,
    inputs: [
      { id: "cooling-system",       name: "Cooling System",        quantity: 4,  stackSize: 50 },
      { id: "radio-control-unit",   name: "Radio Control Unit",    quantity: 2,  stackSize: 50 },
      { id: "motor",                name: "Motor",                 quantity: 4,  stackSize: 50 },
      { id: "rubber",               name: "Rubber",                quantity: 24, stackSize: 200 },
    ],
  },
  "magnetic-field-generator": {
    outputPerCraft: 2,
    inputs: [
      { id: "versatile-framework",  name: "Versatile Framework",   quantity: 5,  stackSize: 50 },
      { id: "electromagnetic-ctrl-rod", name: "Electromagnetic Control Rod", quantity: 2, stackSize: 100 },
    ],
  },
  "assembly-director-system": {
    outputPerCraft: 1,
    inputs: [
      { id: "adaptive-control-unit",name: "Adaptive Control Unit",  quantity: 2,  stackSize: 50 },
      { id: "supercomputer",        name: "Supercomputer",         quantity: 1,  stackSize: 50 },
    ],
  },

  // ── Tier 4: Phase 4 Parts ────────────────────────────────
  "nuclear-pasta": {
    outputPerCraft: 1,
    inputs: [
      { id: "copper-powder",        name: "Copper Powder",         quantity: 200, stackSize: 500 },
      { id: "pressure-conversion-cube", name: "Pressure Conversion Cube", quantity: 1, stackSize: 50 },
    ],
  },
  "thermal-propulsion-rocket": {
    outputPerCraft: 2,
    inputs: [
      { id: "modular-engine",       name: "Modular Engine",         quantity: 5,  stackSize: 50 },
      { id: "turbo-motor",          name: "Turbo Motor",            quantity: 2,  stackSize: 50 },
      { id: "cooling-system",       name: "Cooling System",         quantity: 6,  stackSize: 50 },
      { id: "fused-modular-frame",  name: "Fused Modular Frame",    quantity: 2,  stackSize: 50 },
    ],
  },

  // ── Tier 5: Elevator Deliverable ─────────────────────────
  "space-elevator-phase-4": {
    outputPerCraft: 1,
    inputs: [
      { id: "assembly-director-system",  name: "Assembly Director System",  quantity: 4000, stackSize: 50 },
      { id: "magnetic-field-generator",  name: "Magnetic Field Generator",  quantity: 4000, stackSize: 50 },
      { id: "nuclear-pasta",             name: "Nuclear Pasta",             quantity: 1000, stackSize: 50 },
      { id: "thermal-propulsion-rocket", name: "Thermal Propulsion Rocket", quantity: 1000, stackSize: 50 },
    ],
  },
};
