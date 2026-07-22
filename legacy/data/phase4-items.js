// phase4-items.js — Item definitions for Satisfactory Phase 4
window.SF = window.SF || {};

SF.ITEMS = [
  // Tier 0 — First craftable layer
  { id: "copper-powder",         name: "Copper Powder",            tier: 0, stackSize: 500 },
  { id: "ai-limiter",            name: "AI Limiter",               tier: 0, stackSize: 100 },
  { id: "high-speed-connector",  name: "High-Speed Connector",     tier: 0, stackSize: 100 },
  { id: "circuit-board",         name: "Circuit Board",            tier: 0, stackSize: 200 },
  { id: "automated-wiring",      name: "Automated Wiring",         tier: 0, stackSize: 100 },
  { id: "heat-sink",             name: "Heat Sink",                tier: 0, stackSize: 100 },

  // Tier 1 — Foundational Components
  { id: "heavy-modular-frame",   name: "Heavy Modular Frame",      tier: 1, stackSize: 50 },
  { id: "radio-control-unit",    name: "Radio Control Unit",       tier: 1, stackSize: 50 },
  { id: "modular-engine",        name: "Modular Engine",           tier: 1, stackSize: 50 },
  { id: "versatile-framework",   name: "Versatile Framework",      tier: 1, stackSize: 50 },

  // Tier 2 — Phase 4 Subcomponents
  { id: "fused-modular-frame",        name: "Fused Modular Frame",        tier: 2, stackSize: 50 },
  { id: "electromagnetic-ctrl-rod",   name: "Electromagnetic Control Rod",tier: 2, stackSize: 100 },
  { id: "cooling-system",             name: "Cooling System",             tier: 2, stackSize: 50 },
  { id: "supercomputer",              name: "Supercomputer",              tier: 2, stackSize: 50 },
  { id: "adaptive-control-unit",      name: "Adaptive Control Unit",      tier: 2, stackSize: 50 },

  // Tier 3 — Complex Parts
  { id: "pressure-conversion-cube",   name: "Pressure Conversion Cube",   tier: 3, stackSize: 50 },
  { id: "turbo-motor",                name: "Turbo Motor",                tier: 3, stackSize: 50 },
  { id: "magnetic-field-generator",   name: "Magnetic Field Generator",   tier: 3, stackSize: 50 },
  { id: "assembly-director-system",   name: "Assembly Director System",   tier: 3, stackSize: 50 },

  // Tier 4 — Phase 4 Parts
  { id: "nuclear-pasta",              name: "Nuclear Pasta",              tier: 4, stackSize: 50 },
  { id: "thermal-propulsion-rocket",  name: "Thermal Propulsion Rocket",  tier: 4, stackSize: 50 },

  // Tier 5 — Elevator Deliverable
  { id: "space-elevator-phase-4",     name: "Space Elevator Phase 4",     tier: 5, stackSize: 50 },
];

SF.BY_ID = {};
SF.ITEMS.forEach(i => { SF.BY_ID[i.id] = i; });

SF.TIER_LABELS = {
  0: "Craftable Inputs",
  1: "Foundational Components",
  2: "Phase 4 Subcomponents",
  3: "Complex Parts",
  4: "Phase 4 Parts",
  5: "Elevator Deliverable",
};

SF.TIER_COLORS = {
  0: "var(--steel)",
  1: "var(--blue)",
  2: "var(--teal)",
  3: "var(--amber)",
  4: "var(--coral)",
  5: "var(--purple)",
};

SF.TIER_ORDER = [0, 1, 2, 3, 4, 5];
