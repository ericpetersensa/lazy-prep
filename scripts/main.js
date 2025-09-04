import { LazyDMPrepApp } from "./app.js";

/** Preload + register Handlebars partials used by app.hbs */
async function registerPartials() {
  const parts = [
    "characters", "strongStart", "scenes", "secrets",
    "locations", "npcs", "threats", "rewards"
  ];
  const base = "modules/lazy-prep/templates/parts";

  // Preload all part templates (compiles & caches)
  await loadTemplates(parts.map(p => `${base}/${p}.hbs`));

  // Register each as a partial for use by {{> partName}}
  for (const p of parts) {
    const path = `${base}/${p}.hbs`;
    const compiled = await getTemplate(path); // compiled template fn
    Handlebars.registerPartial(p, compiled);
  }
}

Hooks.once("init", async () => {
  console.log("Lazy Prep | Initializing module");

  // World setting for persistent session data
  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  // Register partials; if it fails, log but keep module alive
  try {
    await registerPartials();
  } catch (err) {
    console.warn("Lazy Prep | Failed to register partial templates. Check paths under templates/parts/.", err);
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

  // Dedicated Scene Controls group (dragon icon)
  Hooks.on("getSceneControlButtons", (controls) => {
    if (!controls.some(c => c.name === "lazy-prep")) {
      controls.push({
        name: "lazy-prep",
        title: game.i18n?.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
        icon: "fas fa-dragon",
        visible: true, // change to game.user.isGM if you want GM-only
        tools: [
          {
            name: "open-dashboard",
            title: game.i18n?.has("LAZY_PREP.OPEN")
              ? game.i18n.localize("LAZY_PREP.OPEN")
              : "Open Lazy DM Prep",
            icon: "fas fa-book-open",
            button: true,
            onClick: () => game.lazyPrep.open()
          }
        ]
      });
    }
  });

  // Optional: auto-create macro for GMs and assign to first empty hotbar slot
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
    try {
      const existing = Object.values(game.user.getHotbarMacros?.() ?? {});
      const taken = new Set(existing.filter(Boolean).map(m => m?.slot));
      let slot = 1; while (slot <= 10 && taken.has(slot)) slot++;
      if (slot <= 10 && macro) {
        await game.user.assignHotbarMacro(macro, slot);
        ui.notifications?.info(`Lazy Prep | Macro assigned to hotbar slot ${slot}.`);
      }
    } catch (err) {
      console.warn("Lazy Prep | Could not assign macro to hotbar.", err);
    }
  }
});
