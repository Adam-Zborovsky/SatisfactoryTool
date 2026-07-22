let dataCache = null;

export async function loadData() {
  if (dataCache) return dataCache;
  const resp = await fetch('/satisfactory-data.json');
  if (!resp.ok) throw new Error(`Failed to load data: ${resp.status}`);
  dataCache = await resp.json();
  return dataCache;
}

export function getData() {
  return dataCache;
}

export function createRegistry(data) {
  const byId = data.items || {};
  const byRecipe = data.productionRecipes || {};

  const nameToId = {};
  for (const [id, item] of Object.entries(byId)) {
    nameToId[item.name.toLowerCase()] = id;
  }

  const nameToRecipe = {};
  for (const [id, recipe] of Object.entries(byRecipe)) {
    const key = recipe.outputName.toLowerCase();
    if (!nameToRecipe[key] || !recipe.isAlternate) {
      nameToRecipe[key] = { id, ...recipe };
    }
  }

  return {
    findByName(name) {
      if (!name) return null;
      const id = nameToId[name.toLowerCase()];
      if (id && byId[id]) {
        return { className: id, ...byId[id] };
      }
      return null;
    },
    findRecipe(name) {
      if (!name) return null;
      const r = nameToRecipe[name.toLowerCase()];
      if (!r) return null;
      return {
        output: r.output,
        outputName: r.outputName,
        outputPerCraft: r.outputPerCraft,
        inputs: r.ingredients.map(ing => ({
          id: ing.item,
          name: ing.name,
          quantity: ing.amount,
          stackSize: ing.stackSize,
        })),
        producedIn: r.producedIn,
        duration: r.duration,
        isAlternate: r.isAlternate,
      };
    },
    findRecipesByName(name) {
      if (!name) return [];
      const id = nameToId[name.toLowerCase()];
      if (!id) return [];
      return Object.entries(byRecipe)
        .filter(([, r]) => r.output === id)
        .map(([recipeId, r]) => ({
          id: recipeId,
          outputName: r.displayName || r.outputName,
          outputPerCraft: r.outputPerCraft,
          inputs: r.ingredients.map(ing => ({
            id: ing.item,
            name: ing.name,
            quantity: ing.amount,
            stackSize: ing.stackSize,
          })),
          isAlternate: r.isAlternate,
        }));
    },
    getAllItems() {
      return Object.entries(byId).map(([id, item]) => ({
        id,
        ...item,
      }));
    },
  };
}
