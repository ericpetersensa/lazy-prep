import { LazyDMPrepApp } from "./app.js";

Hooks.once("init", () => {
  console.log("Lazy Prep | Initializing module");

  // Register world setting for session persistence
  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });
});

Hooks.once("ready", () => {
  // Expose a global API for convenience
  game.lazyPrep = {
    app: null,
    open: () => {
      if (!game.lazyPrep.app) {
        game.lazyPrep.app = new LazyDMPrepApp();
      }
      game.lazyPrep.app.render(true);
    }
  };

  // Add a Scene Control button for quick access
  Hooks.on("getSceneControlButtons", (controls) => {
    controls.push({
      name: "lazy-prep",
      title: game.i18n.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
      icon: "fas fa-dragon",
      button: true,
      onClick: () => game.lazyPrep.open()
    });
  });

  // Optional: Add a hotbar macro for quick access
  if (!game.macros.getName("Open Lazy DM Prep")) {
    Macro.create({
      name: "Open Lazy DM Prep",
      type: "script",
      command: "game.lazyPrep.open();",
      img: "icons/svg/book.svg"
    });
  }
});
