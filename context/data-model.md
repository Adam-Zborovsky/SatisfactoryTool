# Data Model (Game-Agnostic)

## Item

```js
{
  id: string,          // unique key, e.g. "heavy-modular-frame"
  name: string,        // display name, e.g. "Heavy Modular Frame"
  tier: number,        // production tier (0 = first craftable, higher = further downstream)
  stackSize: number,   // how many fit in one inventory stack
}
```

All items are tracked equally. Tier 0 is the first layer requiring manual crafting; there is no separate "automated" category.

## Recipe

```js
{
  output: string,         // item id this recipe produces
  outputPerCraft: number, // how many of the output item one craft cycle yields
  inputs: [               // what goes in (per craft cycle)
    { id: string, name: string, quantity: number, stackSize: number }
  ]
}
```

Input requirements are calculated per target:

```
craftsNeeded = ceil(target / recipe.outputPerCraft)
inputQuantity = craftsNeeded * input.quantity
```

## Production Chain

```js
{
  items: Item[],        // all items in the chain, ordered by tier
  recipes: { [itemId]: Recipe },  // recipe lookup by output item
  tierLabels: { [tier: number]: string },
  tierColors: { [tier: number]: string },
  tierOrder: number[],  // display order (typically ascending)
}
```

## Container Hierarchy

```js
STACKS_PER_CHEST = 48
```

Conversion path: `quantity → ceil(quantity / stackSize) = slots → floor(slots / 48) = chests, slots % 48 = remaining stacks`.

## User State (per-session, persisted)

```js
{
  [itemId]: {
    quantity: number,     // target quantity for this item
    stackSize: number,    // overridable (defaults to item.stackSize)
    consumed: {           // per-ingredient stacks consumed (only for items with recipes)
      [inputId]: number,  // integer count of stacks already fed into crafting
    }
  }
}
```

State is saved to `localStorage` with a versioned namespace key and exportable as JSON. The `consumed` object is initialized from the item's recipe inputs. When a target quantity changes, ingredient totals recalculate and consumed counts are capped to the new maximum.
