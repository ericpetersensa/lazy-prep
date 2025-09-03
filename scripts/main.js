import { LazyDMPrepApp } from "./app.js";

/**
 * Utility: Register Handlebars partials for each part template.
 * We use Foundry's getTemplate to retrieve compiled template functions.
 */
async function registerPartials() {
  const parts = [
    "characters",
    "strongStart",
    "scenes",
    "secrets",
    "locations",
    "npcs",
    "threats",
    "rewards"
  ];

  const base = "modules/lazy-prep/templates/parts";
  // Preload to warm cache (optional, but keeps logs cleaner and avoids redundant compilation)
  await loadTemplates(parts.map(p => `${base}/${p}.hbs`));

  for (const part of parts) {
    const path = `${base}/${part}.hbs`;
    const tplFn = await getTemplate(path);  // returns a compiled template function
    Handlebars.registerPartial(part, tplFn);
  }
}

Hooks.once("init", async () => {
  console.log("Lazy Prep | Initializing module");

  // Register world-level setting for session persistence
  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  // Register Handlebars partials used by templates/app.hbs
  await registerPartials();
});

Hooks.once("ready", async () => {
  // Expose a global API to open/reuse the app instance
  game.lazyPrep = {
    app: null,
    open: () => {
      if (!game.lazyPrep.app) game.lazyPrep.app = new LazyDMPrepApp();
      game.lazyPrep.app.render(true);
    }
  };

  // Add a Scene Controls button for quick access
  Hooks.on("getSceneControlButtons", (controls) => {
    controls.push({
      name: "lazy-prep",
      title: game.i18n.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
      icon: "fas fa-dragon",
      button: true,
      onClick: () => game.lazyPrep.open()
    });
  });

  // Optional QoL: auto-create a GM macro to open the dashboard (once per world)
  if (game.user.isGM) {
    const macroName = "Open Lazy DM Prep";
    const existing = game.macros?.getName?.(macroName);
    if (!existing) {
      try {
        await Macro.create({
          name: macroName,
          type: "script",
          command: "game.lazyPrep.open();",
          img: "icons/svg/book.svg",
          scope: "global" // available to all worlds users; omit if you prefer default
        });
        ui.notifications?.info("Lazy Prep | Created 'Open Lazy DM Prep' macro on the hotbar.");
      } catch (err) {
        console.warn("Lazy Prep | Could not create macro automatically.", err);
      }
    }
  }
});
