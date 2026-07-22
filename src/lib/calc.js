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
