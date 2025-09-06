import { LazyDMPrepApp } from "./app.js";

/* ---------- Hook: init (register settings) ---------- */
Hooks.once("init", async () => {
  console.info("Lazy Prep\n Initializing module (v13 AppV2)");
  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });
});

/* ---------- Hook: getSceneControlButtons (safe, non-mutating) ---------- */
Hooks.on("getSceneControlButtons", (controls) => {
  try {
    // Do not transform shapes; just append our group/tool if missing
    let group = controls.find(c => c?.name === "lazy-prep");
    if (!group) {
      group = {
        name: "lazy-prep",
        title: game.i18n?.localize("LAZY_PREP.APP_TITLE") ?? "Lazy DM Prep",
        icon: "fas fa-dragon",
        tools: []
      };
      controls.push(group);
    }

    if (!Array.isArray(group.tools)) group.tools = []; // normalize only our group's tools

    if (!group.tools.some(t => t.name === "open-dashboard")) {
      group.tools.push({
        name: "open-dashboard",
        title: game.i18n?.has("LAZY_PREP.OPEN")
          ? game.i18n.localize("LAZY_PREP.OPEN")
          : "Open Lazy DM Prep",
        icon: "fas fa-book-open",
        onClick: () => game.lazyPrep?.open?.()
      });
    }
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

  // Ensure controls refresh once the canvas is ready so our group shows
  Hooks.once("canvasReady", () => {
    console.info("Lazy Prep \n canvasReady → ui.controls.render(true)");
    ui.controls?.render(true);
  });
});
