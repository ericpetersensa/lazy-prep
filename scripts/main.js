import { LazyDMPrepApp } from "./app.js";

/** v13 Handlebars namespace */
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
    const compiled = await HBS.getTemplate(path); // v13 namespaced
    Handlebars.registerPartial(p, compiled);
    console.info(`Lazy Prep | Registered partial: ${p}`);
  }
}

Hooks.once("init", async () => {
  console.info("Lazy Prep | Initializing module (v13 AppV2)");

  // Persistent session store
  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  // Precompile and register partials (log failures, but don't hard‑fail)
  try {
    await registerPartials();
    console.info("Lazy Prep | All partials registered.");
  } catch (err) {
    console.warn("Lazy Prep | Failed to register partial templates.", err);
  }
});

/**
 * v13: controls is Record<string, SceneControl>, not an Array.
 * We add:
 *  - a dedicated 'lazy-prep' group (dragon header),
 *  - and a tool under the Token group as a safety net.
 */
Hooks.on("getSceneControlButtons", (controls) => {
  try {
    console.info("Lazy Prep | getSceneControlButtons fired. Keys:", Object.keys(controls));

    // --- Dedicated 'lazy-prep' group (dragon header) ---
    if (!controls["lazy-prep"]) {
      controls["lazy-prep"] = {
        name: "lazy-prep",
        title: game.i18n?.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
        icon: "fas fa-dragon",
        visible: true,
        tools: []
      };
      console.info("Lazy Prep | Added dedicated 'lazy-prep' group.");
    }

    const lazyGroup = controls["lazy-prep"];
    if (!lazyGroup.tools) lazyGroup.tools = [];

    if (!lazyGroup.tools.find(t => t.name === "open-dashboard")) {
      lazyGroup.tools.push({
        name: "open-dashboard",
        title: game.i18n?.has("LAZY_PREP.OPEN")
          ? game.i18n.localize("LAZY_PREP.OPEN")
          : "Open Lazy DM Prep",
        icon: "fas fa-book-open",
        button: true,
        onClick: () => game.lazyPrep?.open?.()
      });
      console.info("Lazy Prep | Added 'Open' tool to 'lazy-prep' group.");
    }

    // --- Safety net: also add a tool under Token controls ---
    const token = controls["token"];
    if (token) {
      token.tools ??= [];
      if (!token.tools.find(t => t.name === "lazy-prep-open")) {
        token.tools.push({
          name: "lazy-prep-open",
          title: game.i18n?.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
          icon: "fas fa-dragon",
          button: true,
          onClick: () => game.lazyPrep?.open?.()
        });
        console.info("Lazy Prep | Added Token-layer 'Open' tool.");
      }
    } else {
      console.warn("Lazy Prep | Token controls not found; custom tool will only appear in dedicated group.");
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

  // Force controls refresh once the canvas is ready (ensures buttons appear)
  Hooks.once("canvasReady", () => {
    console.info("Lazy Prep | canvasReady → forcing controls render.");
    ui.controls?.render(true);
  });

  // Optional: auto-create macro for GMs
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
