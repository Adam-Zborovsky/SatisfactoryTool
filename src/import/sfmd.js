const CLUSTER_THRESHOLD = 80;

export function parseSfmd(raw) {
  const data = JSON.parse(raw);
  const items = data.Data || [];

  const nodes = items.map(item => ({
    name: item.Name,
    x: item.X,
    y: item.Y,
    inputs: item.Inputs || {},
    max: item.Max || null,
  }));

  return nodes;
}

export function detectTiers(nodes, threshold = CLUSTER_THRESHOLD) {
  const sorted = [...nodes].sort((a, b) => a.x - b.x);

  const bands = [];
  let currentBand = [sorted[0]];

  for (let i = 1; i < sorted.length; i++) {
    const gap = Math.abs(sorted[i].x - sorted[i - 1].x);
    if (gap > threshold) {
      bands.push(currentBand);
      currentBand = [sorted[i]];
    } else {
      currentBand.push(sorted[i]);
    }
  }
  if (currentBand.length > 0) bands.push(currentBand);

  return bands.map((band, i) => ({
    tier: i,
    items: band.map(n => n.name),
    xMin: Math.min(...band.map(n => n.x)),
    xMax: Math.max(...band.map(n => n.x)),
  }));
}

export function buildRelationships(nodes) {
  const byName = {};
  nodes.forEach(n => { byName[n.name] = n; });

  const relationships = {};
  nodes.forEach(n => {
    const inputs = Object.keys(n.inputs);
    relationships[n.name] = {
      item: n.name,
      feedsInto: [],
      fedBy: inputs,
      x: n.x,
      y: n.y,
    };
  });

  nodes.forEach(n => {
    const inputs = Object.keys(n.inputs);
    inputs.forEach(inputName => {
      if (relationships[inputName]) {
        relationships[inputName].feedsInto.push(n.name);
      }
    });
  });

  return relationships;
}

export function nameToId(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function importPlan(sfmdRaw, dataRegistry) {
  const nodes = parseSfmd(sfmdRaw);
  const tiers = detectTiers(nodes);
  const relationships = buildRelationships(nodes);

  const planItems = nodes.map(node => {
    const id = nameToId(node.name);
    const dataItem = dataRegistry?.findByName(node.name);
    return {
      id,
      name: node.name,
      className: dataItem?.className || null,
      stackSize: dataItem?.stackSize || 50,
      tier: tiers.findIndex(t => t.items.includes(node.name)),
      max: node.max ? parseInt(node.max, 10) : undefined,
    };
  });

  const planRecipes = {};
  const warnings = [];
  let recipeHits = 0;
  let recipeMisses = 0;

  for (const node of nodes) {
    const inputNames = Object.keys(node.inputs);
    if (inputNames.length === 0) continue;

    const id = nameToId(node.name);
    const recipes = dataRegistry?.findRecipesByName(node.name) || [];
    const dataRecipe = recipes.find(r => !r.isAlternate) || recipes[0] || null;

    if (dataRecipe) {
      planRecipes[id] = dataRecipe;
      recipeHits++;
    } else {
      recipeMisses++;
      warnings.push(`No recipe found for "${node.name}" — used stub recipe with quantity=1`);
      const outputItem = dataRegistry?.findByName(node.name);
      planRecipes[id] = {
        output: outputItem?.className || id,
        outputName: node.name,
        outputPerCraft: 1,
        inputs: inputNames.map(inName => {
          const inItem = dataRegistry?.findByName(inName);
          return {
            id: inItem?.className || nameToId(inName),
            name: inName,
            quantity: 1,
            stackSize: inItem?.stackSize || 50,
          };
        }),
        _stub: true,
      };
    }
  }

  return {
    name: 'Imported Plan',
    items: planItems,
    recipes: planRecipes,
    tiers,
    relationships,
    source: 'sfmd',
    warnings: warnings.length > 0 ? warnings : undefined,
    stats: { total: nodes.length, withInputs: recipeHits + recipeMisses, recipeHits, recipeMisses },
  };
}
