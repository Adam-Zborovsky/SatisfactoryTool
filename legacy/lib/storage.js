// storage.js — localStorage persistence layer
window.Store = {
  key: "sf-phase4-v4",

  defaults() {
    const s = {};
    SF.ITEMS.forEach(item => {
      const entry = { quantity: 0, stackSize: item.stackSize };
      const recipe = SF.RECIPES[item.id];
      if (recipe) {
        entry.consumed = {};
        recipe.inputs.forEach(inp => { entry.consumed[inp.id] = 0; });
      }
      s[item.id] = entry;
    });
    return s;
  },

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (raw) {
        const fresh = this.defaults();
        const parsed = JSON.parse(raw);
        for (const [k, v] of Object.entries(parsed)) {
          if (fresh[k] !== undefined) {
            fresh[k] = { ...fresh[k], ...v };
            if (fresh[k].consumed && v.consumed) {
              fresh[k].consumed = { ...fresh[k].consumed, ...v.consumed };
            }
          }
        }
        return fresh;
      }
    } catch (e) {}
    return this.defaults();
  },

  save(state) {
    try { localStorage.setItem(this.key, JSON.stringify(state)); } catch (e) {}
  },

  exportBackup(state) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `phase4-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  },

  importBackup(file, state, renderFn) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        for (const [k, v] of Object.entries(imported)) {
          if (state[k] !== undefined) {
            state[k] = { ...state[k], ...v };
            if (state[k].consumed && v.consumed) {
              state[k].consumed = { ...state[k].consumed, ...v.consumed };
            }
          }
        }
        this.save(state);
        renderFn();
      } catch (err) { alert("Invalid backup file."); }
    };
    reader.readAsText(file);
  },
};
