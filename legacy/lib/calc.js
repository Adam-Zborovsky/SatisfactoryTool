// calc.js — Game-agnostic calculation engine
window.Calc = {
  STACKS_PER_CHEST: 48,

  totalStacks(quantity, stackSize) {
    return (quantity || 0) / (stackSize || 1);
  },

  totalSlots(quantity, stackSize) {
    return Math.max(0, Math.ceil(this.totalStacks(quantity, stackSize)));
  },

  calcChests(slots) {
    return {
      full: Math.floor(slots / this.STACKS_PER_CHEST),
      rem: slots % this.STACKS_PER_CHEST,
    };
  },

  recipeInputs(targetQuantity, recipe) {
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
  },
};
