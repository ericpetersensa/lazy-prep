import { LazyDMPrepApp } from "./app.js";

/** v13 Handlebars namespace (no deprecations) */
const HBS = foundry.applications.handlebars;

/** Precompile + register Handlebars partials (v13‑native) */
async function registerPartials() {
  const parts = [
    "characters", "strongStart", "scenes", "secrets",
    "locations", "npcs", "threats", "rewards"
  ];
  const base = "modules/lazy-prep/templates/parts";

  for (const p of parts) {
    const path = `${base}/${p}.hbs`;
    const compiled = await HBS.getTemplate(path); // v13 namespaced API
    Handlebars.registerPartial(p, compiled);
    console.info(`Lazy Prep | Registered partial: ${p}`);
  }
}

/** Utilities that work for BOTH v13 hook shapes (Array or Record map) */
function getGroups(controls) {
  return Array.isArray(controls) ? controls : Object.values(controls);
}

function getGroupByName(controls, name) {
  if (Array.isArray(controls)) return controls.find(c => c.name === name);
  return controls[name] ?? getGroups(controls).find(c => c?.name === name);
}

function ensureGroup(controls, def) {
  // def: { name, title, icon, visible, tools: [] }
  if (Array.isArray(controls)) {
    let g = controls.find(c => c.name === def.name);
    if (!g) {
      g = { ...def, tools: def.tools ?? [] };
      controls.push(g);
      console.info(`Lazy Prep | Created group '${def.name}' (array mode).`);
    }
    g.tools ??= [];
    return g;
  } else {
    if (!controls[def.name]) {
      controls[def.name] = { ...def, tools: def.tools ?? [] };
      console.info(`Lazy Prep | Created group '${def.name}' (record mode).`);
    }
    const g = controls[def.name];
    g.tools ??= [];
    return g;
  }
}

function ensureTool(group, toolDef) {
  if (!group.tools.find(t => t.name === toolDef.name)) {
    group.tools.push(toolDef);
    console.info(`Lazy Prep | Added tool '${toolDef.name}' to group '${group.name}'.`);
  }
}

Hooks.once("init", async () => {
  console.info("Lazy Prep | Initializing module (v13 AppV2)");

  // Persistent world setting for session data
  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  // Precompile partials (log but don’t crash if a path is off)
  try {
    await registerPartials();
    console.info("Lazy Prep | All partials registered.");
  } catch (err) {
    console.warn("Lazy Prep | Failed to register partial templates.", err);
  }
});

/**
 * v13 hook: controls may be an Array OR a Record<string, SceneControl> depending on build/types.
 * We normalize and update safely.
 */
Hooks.on("getSceneControlButtons", (controls) => {
  try {
    console.info("Lazy Prep | getSceneControlButtons fired.",
                 Array.isArray(controls) ? "(array)" : "(record)",
                 "keys:", Array.isArray(controls) ? getGroups(controls).map(g => g.name) : Object.keys(controls));

    // 1) Dedicated 'lazy-prep' group with a dragon header
    const lazyGroup = ensureGroup(controls, {
      name: "lazy-prep",
      title: game.i18n?.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
      icon: "fas fa-dragon",
      visible: true,
      tools: []
    });

    ensureTool(lazyGroup, {
      name: "open-dashboard",
      title: game.i18n?.has("LAZY_PREP.OPEN")
        ? game.i18n.localize("LAZY_PREP.OPEN")
        : "Open Lazy DM Prep",
      icon: "fas fa-book-open",
      button: true,
      onClick: () => game.lazyPrep?.open?.()
    });

    // 2) Safety net: also add a tool under the Token group
    const tokenGroup = getGroupByName(controls, "token");
    if (tokenGroup) {
      ensureTool(tokenGroup, {
        name: "lazy-prep-open",
        title: game.i18n?.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
        icon: "fas fa-dragon",
        button: true,
        onClick: () => game.lazyPrep?.open?.()
      });
    } else {
      console.warn("Lazy Prep | Token group not found; tool only added to dedicated group.");
    }
  } catch (e) {
    console.error("Lazy Prep | Error in getSceneControlButtons:", e);
  }
});

Hooks.once("ready", async () => {
  // Global API
  game.lazyPrep = {
    app: null,
    open: () => {
      if (!game.lazyPrep.app) game.lazyPrep.app = new LazyDMPrepApp();
      game.lazyPrep.app.render(true);
    }
  };

  // After the canvas is ready, force a controls refresh so our buttons appear
  Hooks.once("canvasReady", () => {
    console.info("Lazy Prep | canvasReady → ui.controls.render(true)");
    ui.controls?.render(true);
  });

  // Optional: create a GM macro (no auto-assigning slot to keep things clean)
  if (game.user.isGM) {
    const macroName = "Open Lazy DM Prep";
    let macro = game.macros?.getName?.(macroName);
    if (!macro) {
      try {
        macro = await Macro.create({
          name: macroName,
          type: "script",
          command: "game.lazyPrep.open();",
          img: "icons/svg/book.svg",
          scope: "global"
        });
        ui.notifications?.info("Lazy Prep | Created 'Open Lazy DM Prep' macro.");
      } catch (err) {
        console.warn("Lazy Prep | Could not create macro automatically.", err);
      }
    }
  }

  console.info("Lazy Prep | ready complete.");
});
