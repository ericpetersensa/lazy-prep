import { LazyDMPrepApp } from "./app.js";

/** v13 Handlebars namespace */
const HBS = foundry.applications.handlebars;

/** Precompile + register Handlebars partials (v13‑native) */
async function registerPartials() {
  const parts = [
    "characters","strongStart","scenes","secrets",
    "locations","npcs","threats","rewards"
  ];
  const base = "modules/lazy-prep/templates/parts";
  for (const p of parts) {
    const path = `${base}/${p}.hbs`;
    const compiled = await HBS.getTemplate(path); // v13 namespaced API
    Handlebars.registerPartial(p, compiled);
    console.info(`Lazy Prep | Registered partial: ${p}`);
  }
}

Hooks.once("init", async () => {
  console.info("Lazy Prep | Initializing module (v13 AppV2)");

  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  try {
    await registerPartials();
    console.info("Lazy Prep | All partials registered.");
  } catch (err) {
    console.warn("Lazy Prep | Failed to register partial templates.", err);
  }
});

/* ---------- Helpers that support v13 array OR record shapes ---------- */

// Return an array of groups regardless of the underlying shape
function groupsList(controls) {
  return Array.isArray(controls) ? controls : Object.values(controls);
}

// Find a group by name across both shapes
function findGroup(controls, name) {
  if (Array.isArray(controls)) return controls.find(g => g?.name === name);
  return controls[name] ?? Object.values(controls).find(g => g?.name === name);
}

// Ensure a group exists (create if missing), return it
function ensureGroup(controls, def) {
  if (Array.isArray(controls)) {
    let g = controls.find(c => c?.name === def.name);
    if (!g) {
      g = { activeTool: "", order: 999, visible: true, tools: [], ...def };
      controls.push(g);
      console.info(`Lazy Prep | Created group '${def.name}' (array mode).`);
    }
    // Ensure tools collection exists in a usable form
    if (!g.tools) g.tools = [];
    return g;
  } else {
    if (!controls[def.name]) {
      // v13 interface uses a record of tools; order & activeTool are standard fields
      controls[def.name] = {
        activeTool: "",
        order: 999,
        visible: true,
        tools: {},          // record keyed by tool name
        ...def
      };
      console.info(`Lazy Prep | Created group '${def.name}' (record mode).`);
    }
    const g = controls[def.name];
    // Normalize tools if some system provided an array
    if (Array.isArray(g.tools)) {
      const arr = g.tools; g.tools = {};
      for (const t of arr) g.tools[t.name] = t;
    } else if (!g.tools) {
      g.tools = {};
    }
    return g;
  }
}

// Insert a tool into a group's tools (works for array OR record)
function ensureTool(group, tool) {
  if (Array.isArray(group.tools)) {
    if (!group.tools.some(t => t.name === tool.name)) {
      group.tools.push(tool);
      console.info(`Lazy Prep | Added tool '${tool.name}' to group '${group.name}'.`);
    }
  } else {
    if (!group.tools[tool.name]) {
      group.tools[tool.name] = tool;
      console.info(`Lazy Prep | Added tool '${tool.name}' to group '${group.name}'.`);
    }
  }
}

/* ---------- Hook: getSceneControlButtons (v13‑safe) ---------- */

Hooks.on("getSceneControlButtons", (controls) => {
  try {
    const keys = Array.isArray(controls) ? groupsList(controls).map(g => g?.name) : Object.keys(controls);
    console.info("Lazy Prep | getSceneControlButtons fired. Shape:", Array.isArray(controls) ? "array" : "record", "keys:", keys);

    // 1) Dedicated group (dragon header)
    const lazyGroup = ensureGroup(controls, {
      name: "lazy-prep",
      title: game.i18n?.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
      icon: "fas fa-dragon",
      visible: true
    });

    ensureTool(lazyGroup, {
      name: "open-dashboard",
      title: game.i18n?.has("LAZY_PREP.OPEN") ? game.i18n.localize("LAZY_PREP.OPEN") : "Open Lazy DM Prep",
      icon: "fas fa-book-open",
      button: true,
      onClick: () => game.lazyPrep?.open?.()
    });

    // 2) Safety net: put a tool somewhere users will see if 'token' group doesn't exist
    let target = findGroup(controls, "token")
              ?? findGroup(controls, "measure")
              ?? findGroup(controls, "notes")
              ?? groupsList(controls)[0];   // fall back to first group

    if (target) {
      ensureTool(target, {
        name: "lazy-prep-open",
        title: game.i18n?.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
        icon: "fas fa-dragon",
        button: true,
        onClick: () => game.lazyPrep?.open?.()
      });
    } else {
      console.warn("Lazy Prep | No suitable control group found for safety‑net tool.");
    }
  } catch (e) {
    console.error("Lazy Prep | Error in getSceneControlButtons:", e);
  }
});

Hooks.once("ready", () => {
  // Public API
  game.lazyPrep = {
    app: null,
    open: () => {
      if (!game.lazyPrep.app) game.lazyPrep.app = new LazyDMPrepApp();
      game.lazyPrep.app.render(true);
    }
  };

  // Force a controls refresh after canvas becomes ready (ensures buttons appear on load)
  Hooks.once("canvasReady", () => {
    console.info("Lazy Prep | canvasReady → ui.controls.render(true)");
    ui.controls?.render(true);
  });
});
