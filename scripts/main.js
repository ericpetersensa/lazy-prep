import { LazyDMPrepApp } from "./app.js";

Hooks.once("init", () => {
  console.log("Lazy Prep | Initializing module");
  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });
});

Hooks.once("ready", () => {
  game.lazyPrep = {
    open: () => {
      if (!game.lazyPrep.app) game.lazyPrep.app = new LazyDMPrepApp();
      game.lazyPrep.app.render(true);
    }
  };

  // Add a control button in the UI
  Hooks.on("getSceneControlButtons", (controls) => {
    controls.push({
      name: "lazy-prep",
      title: "Lazy DM Prep",
      icon: "fas fa-dragon",
      button: true,
      onClick: () => game.lazyPrep.open()
    });
  });
});
