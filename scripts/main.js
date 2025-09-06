import { LazyDMPrepApp } from "./app.js";

/* ---------- Hook: init (REGISTER SETTINGS) ---------- */
Hooks.once("init", async () => {
  console.info("Lazy Prep \n Initializing module (v13 AppV2)");
  // Persistent store for the session
  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });
});

/* ---------- Utilities to support array OR record controls shape ---------- */
function ensureGroup(controls, def) {
  const isArrayShape = Array.isArray(controls);

  if (isArrayShape) {
    let g = controls.find(c => c?.name === def.name);
    if (!g) {
      g = { activeTool: "", order: 999, visible: true, tools: [], ...def };
      controls.push(g);
      console.info(`Lazy Prep \n Created group '${def.name}' (array mode).`);
    }
    if (!g.tools) g.tools = [];
    return g;
  } else {
    if (!controls[def.name]) {
      controls[def.name] = {
        activeTool: "",
        order: 999,
        visible: true,
        tools: {},
        ...def
      };
      console.info(`Lazy Prep \n Created group '${def.name}' (record mode).`);
    }
    const g = controls[def.name];
    if (Array.isArray(g.tools)) {
      const arr = g.tools; g.tools = {};
      for (const t of arr) g.tools[t.name] = t;
    } else if (!g.tools) {
      g.tools = {};
    }
    return g;
  }
}

function ensureTool(group, tool) {
  if (Array.isArray(group.tools)) {
    if (!group.tools.some(t => t.name === tool.name)) {
      group.tools.push(tool);
      console.info(`Lazy Prep \n Added tool '${tool.name}' to group '${group.name}'.`);
    }
  } else {
    if (!group.tools[tool.name]) {
      group.tools[tool.name] = tool;
      console.info(`Lazy Prep \n Added tool '${tool.name}' to group '${group.name}'.`);
    }
  }
}

/* ---------- Hook: getSceneControlButtons (no safety net; onChange only) ---------- */
Hooks.on("getSceneControlButtons", (controls) => {
  try {
    const lazyGroup = ensureGroup(controls, {
      name: "lazy-prep",
      title: game.i18n?.localize("LAZY_PREP.APP_TITLE") ?? "Lazy DM Prep",
      icon: "fas fa-dragon",
      visible: true
    });

    ensureTool(lazyGroup, {
      name: "open-dashboard",
      title: game.i18n?.has("LAZY_PREP.OPEN")
        ? game.i18n.localize("LAZY_PREP.OPEN")
        : "Open Lazy DM Prep",
      icon: "fas fa-book-open",
      toggle: true,
      onChange: (event, active) => {
        if (active) game.lazyPrep?.open?.();
      }
    });
  } catch (e) {
    console.error("Lazy Prep \n Error in getSceneControlButtons:", e);
  }
});

/* ---------- Hook: ready ---------- */
Hooks.once("ready", () => {
  // Public API for macros/other modules
  game.lazyPrep = {
    app: null,
    open: () => {
      if (!game.lazyPrep.app) game.lazyPrep.app = new LazyDMPrepApp();
      game.lazyPrep.app.render(true);
    }
  };

  // Ensure the new controls appear after canvas loads
  Hooks.once("canvasReady", () => {
    console.info("Lazy Prep \n canvasReady → ui.controls.render(true)");
    ui.controls?.render(true);
  });
});
