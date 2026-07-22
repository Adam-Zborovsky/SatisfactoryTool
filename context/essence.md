# Project Essence

## What this project is

A **production-chain recipe calculator with consumption tracking**. Given a target output quantity for a crafted item, the system computes how many of each recipe ingredient are needed, converts those quantities into inventory units (stacks, storage containers), and tracks how many stacks of each ingredient have been consumed during the crafting process.

## What this project is NOT

- A factory planner (no machine counts, no throughput calculations, no belt speeds)
- A map or layout tool
- A multiplayer or server tool

## Core concept

Every crafting game has the same loop: gather inputs → craft → get outputs → use outputs as inputs for the next tier. This project sits at the boundary between "I know what I want to make" and "I need to go gather the materials." It answers two questions: **what exactly do I need?** and **how much have I already used?**

The consumption tracking is the key differentiator. Recipe ingredients aren't consumed at the same rate — some deplete faster because the recipe demands more of them per craft. Tracking stacks consumed per ingredient lets you see at a glance which inputs are running low and how many stacks remain to gather.

## Domain-agnostic design

The calculation engine (`src/lib/`) knows nothing about Satisfactory. It operates on a generic data model:
- An **item** has a name, a stack size, and belongs to a production tier
- A **recipe** maps an output item to its input items with per-craft-cycle quantities
- A **production chain** is a tiered set of items connected by recipes
- A **container hierarchy** maps inventory slots to storage units (1 slot = 1 stack, 48 slots = 1 double chest)
- **Consumption state** tracks per-item-per-ingredient stacks consumed

Satisfactory is one implementation. Factorio, Dyson Sphere Program, or any crafting game could use the same engine with different data files.

## Tier convention

Tier 0 is always the first layer that requires manual crafting. There is no "automated inputs" escape hatch — every item in the chain gets full recipe expansion. If a deeper input is already automated by existing factories, the user can simply ignore its recipe breakdown, but the data is always available.

## Why context matters

Phase 4 of Satisfactory is the first implementation, but the system is designed for reuse. Drop in new data files for Phase 5, Factorio, or any game with recipe-based crafting. The engine stays the same.
