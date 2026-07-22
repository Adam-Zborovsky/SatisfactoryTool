import Dexie from 'dexie';

const db = new Dexie('SatisfactoryTracker');

db.version(1).stores({
  plans: '++id, name, createdAt, updatedAt',
});

export async function createPlan(name = 'New Plan') {
  const plan = {
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tiers: [],
    items: [],
    recipes: {},
    state: {},
  };
  const id = await db.plans.add(plan);
  return { id, ...plan };
}

export async function deletePlan(id) {
  await db.plans.delete(id);
}

export async function duplicatePlan(id) {
  const plan = await db.plans.get(id);
  if (!plan) throw new Error('Plan not found');
  const { id: _, ...copy } = plan;
  copy.name = `${copy.name} (copy)`;
  copy.createdAt = new Date().toISOString();
  copy.updatedAt = new Date().toISOString();
  return db.plans.add(copy);
}

export async function getAllPlans() {
  return db.plans.orderBy('updatedAt').reverse().toArray();
}

export async function getPlan(id) {
  return db.plans.get(id);
}

export async function savePlan(id, updates) {
  await db.plans.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
  });
}

export async function updatePlanState(id, itemId, stateUpdates) {
  const plan = await db.plans.get(id);
  if (!plan) return;
  const state = { ...plan.state };
  state[itemId] = { ...state[itemId], ...stateUpdates };
  await db.plans.update(id, { state, updatedAt: new Date().toISOString() });
}

export async function exportPlan(id) {
  const plan = await db.plans.get(id);
  if (!plan) return null;
  return JSON.stringify(plan, null, 2);
}

export async function importPlan(jsonStr, name) {
  const data = JSON.parse(jsonStr);
  const plan = {
    name: name || data.name || 'Imported Plan',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tiers: data.tiers || [],
    items: data.items || [],
    recipes: data.recipes || {},
    state: data.state || {},
  };
  return db.plans.add(plan);
}

export default db;
