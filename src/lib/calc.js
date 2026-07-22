const STACKS_PER_CHEST = 48;

export function totalStacks(quantity, stackSize) {
  return (quantity || 0) / (stackSize || 1);
}

export function totalSlots(quantity, stackSize) {
  return Math.max(0, Math.ceil(totalStacks(quantity, stackSize)));
}

export function slotRemainder(quantity, stackSize) {
  const total = quantity || 0;
  return total % (stackSize || 1);
}

export function calcChests(slots) {
  return {
    full: Math.floor(slots / STACKS_PER_CHEST),
    rem: slots % STACKS_PER_CHEST,
  };
}

export function recipeInputs(targetQuantity, recipe) {
  if (!recipe || targetQuantity <= 0) return [];
  const crafts = Math.ceil(targetQuantity / recipe.outputPerCraft);
  return recipe.inputs.map(input => ({
    id: input.id,
    name: input.name,
    quantity: crafts * input.quantity,
    stackSize: input.stackSize,
    perCraft: input.quantity,
    crafts,
  }));
}

export function craftedFromStacks(recipe, input, targetStacks) {
  if (!recipe || targetStacks <= 0) return 0;
  const itemsNeeded = (targetStacks - 1) * (input.stackSize || 1) + 1;
  const crafts = Math.ceil(itemsNeeded / (input.quantity || 1));
  return Math.min(crafts * recipe.outputPerCraft, crafts * recipe.outputPerCraft);
}

export function craftedDecreaseForStacks(recipe, input, targetStacks, maxCrafted) {
  if (!recipe || targetStacks <= 0) return 0;
  const itemsLimit = targetStacks * (input.stackSize || 1);
  const crafts = Math.floor(itemsLimit / (input.quantity || 1));
  return Math.min(maxCrafted, Math.max(0, crafts * recipe.outputPerCraft));
}
