import { resolve, dirname } from "path";
import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(__dirname, "..");
const docsPath = resolve(projectRoot, "scripts", "en-US.json");
const outputPath = resolve(projectRoot, "public", "satisfactory-data.json");

const buf = readFileSync(docsPath);
const str = buf.toString("utf16le").replace(/^\uFEFF/, "");
const raw = JSON.parse(str);

const STACK_SIZE_MAP = {
	SS_ONE: 1,
	SS_SMALL: 50,
	SS_MEDIUM: 100,
	SS_BIG: 200,
	SS_HUGE: 500,
};

function resolveStackSize(item) {
	if (item.mCachedStackSize && item.mCachedStackSize !== "0") {
		return parseInt(item.mCachedStackSize, 10);
	}
	return STACK_SIZE_MAP[item.mStackSize] || 50;
}

function parseClassRef(str) {
	if (!str) return [];
	const entries = str.replace(/^\(+|\)+$/g, "").split(/(?<=\)),(?=\()/g);
	return entries
		.map((entry) => {
			const m = entry.match(
				/ItemClass="[^"]*Desc_(\w+)_C[^"]*"\)?,Amount=(\d+)/,
			);
			if (!m) return null;
			return {
				className: `Desc_${m[1]}_C`,
				amount: parseInt(m[2], 10),
			};
		})
		.filter(Boolean);
}

function parseClassRefs(str) {
	if (!str) return [];
	const matches = str.matchAll(/Desc_(\w+)_C/g);
	return [...new Set([...matches].map((m) => `Desc_${m[1]}_C`))];
}

const entries = Array.isArray(raw) ? raw : [];

// Extract items
const items = {};
const itemEntries = entries.filter(
	(e) => e.NativeClass && e.NativeClass.includes("FGItemDescriptor"),
);
for (const entry of itemEntries) {
	for (const cls of entry.Classes || []) {
		const stackSize = resolveStackSize(cls);
		items[cls.ClassName] = {
			name: cls.mDisplayName,
			stackSize,
			description: cls.mDescription || "",
			sinkPoints: parseInt(cls.mResourceSinkPoints, 10) || 0,
			form: cls.mForm || "RF_SOLID",
		};
	}
}

// Extract recipes
const productionRecipes = {};
const recipeEntries = entries.filter(
	(e) => e.NativeClass && e.NativeClass.includes("FGRecipe"),
);
for (const entry of recipeEntries) {
	for (const cls of entry.Classes || []) {
		const ingredients = parseClassRef(cls.mIngredients);
		const products = parseClassRef(cls.mProduct);
		const producedIn = parseClassRefs(cls.mProducedIn);

		if (products.length === 0 || ingredients.length === 0) continue;

		const product = products[0];
		const outputItem = items[product.className];

		productionRecipes[cls.ClassName] = {
			output: product.className,
			outputName: outputItem?.name || "Unknown",
			outputPerCraft: product.amount,
			ingredients: ingredients.map((ing) => ({
				item: ing.className,
				name: items[ing.className]?.name || ing.className,
				amount: ing.amount,
				stackSize: items[ing.className]?.stackSize || 50,
			})),
			producedIn,
			duration: parseFloat(cls.mManufactoringDuration) || 0,
			isAlternate: cls.mDisplayName?.includes("Alternate") || false,
			displayName: cls.mDisplayName,
		};
	}
}

// Extract buildings
const buildings = {};
const buildingEntries = entries.filter(
	(e) =>
		e.NativeClass &&
		(e.NativeClass.includes("FGBuildableManufacturer") ||
			e.NativeClass.includes("FGBuildableGenerator") ||
			e.NativeClass.includes("FGBuildableResourceExtractor")),
);
for (const entry of buildingEntries) {
	for (const cls of entry.Classes || []) {
		buildings[cls.ClassName] = {
			name: cls.mDisplayName,
			description: cls.mDescription || "",
		};
	}
}

// Generate item name lookup
const namesById = {};
for (const [id, item] of Object.entries(items)) {
	namesById[id] = item.name;
}

const result = {
	items,
	productionRecipes,
	buildings,
	namesById,
	generatedAt: new Date().toISOString().slice(0, 10),
	itemCount: Object.keys(items).length,
	recipeCount: Object.keys(productionRecipes).length,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`Generated ${outputPath}`);
console.log(`  Items: ${result.itemCount}`);
console.log(`  Recipes: ${result.recipeCount}`);
console.log(`  Buildings: ${Object.keys(buildings).length}`);
