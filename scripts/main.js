import { LazyDMPrepApp } from "./app.js";

/* ---------- Hook: getSceneControlButtons (v13‑safe) ---------- */
Hooks.on("getSceneControlButtons", (controls) => {
  try {
    const isArrayShape = Array.isArray(controls);

    // Helper: ensure we get/create a dedicated group called "lazy-prep"
    function ensureGroup(def) {
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

    // Helper: add a tool to the group regardless of shape
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

    console.info(
      "Lazy Prep \n getSceneControlButtons fired. Shape:",
      isArrayShape ? "array" : "record"
    );

    // Only add to the dedicated Lazy Prep group (no safety net)
    const lazyGroup = ensureGroup({
      name: "lazy-prep",
      title: game.i18n?.localize("LAZY_PREP.APP_TITLE") ?? "Lazy DM Prep",
      icon: "fas fa-dragon",
      visible: true
    });

    // Modern tool: use onChange (not deprecated onClick)
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
  // Public API
  game.lazyPrep = {
    app: null,
    open: () => {
      if (!game.lazyPrep.app) game.lazyPrep.app = new LazyDMPrepApp();
      game.lazyPrep.app.render(true);
    }
  };

  // Ensure buttons appear on load
  Hooks.once("canvasReady", () => {
    console.info("Lazy Prep \n canvasReady → ui.controls.render(true)");
    ui.controls?.render(true);
  });
});
