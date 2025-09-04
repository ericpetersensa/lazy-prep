import { LazyDMPrepApp } from "./app.js";

/** Precompile + register Handlebars partials (v13 namespaced API) */
async function registerPartials() {
  const hbs = foundry.applications.handlebars;
  const parts = [
    "characters", "strongStart", "scenes", "secrets",
    "locations", "npcs", "threats", "rewards"
  ];
  const base = "modules/lazy-prep/templates/parts";

  // Compile & cache each template, then register as partial
  for (const p of parts) {
    const path = `${base}/${p}.hbs`;
    const compiled = await hbs.getTemplate(path); // v13 namespaced
    Handlebars.registerPartial(p, compiled);
    console.info(`Lazy Prep | Registered partial: ${p}`);
  }
}

Hooks.once("init", async () => {
  console.log("Lazy Prep | Initializing module (v13 AppV2)");

  // World setting for persistent session data
  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  // Register partials (log but don't die on failure)
  try {
    await registerPartials();
  } catch (err) {
    console.warn(
      "Lazy Prep | Failed to register partial templates. app.hbs includes may be empty; " +
      "app.js will try dynamic injection as a fallback.",
      err
    );
  }
});

Hooks.once("ready", async () => {
  // Expose a global API for macros/other modules
  game.lazyPrep = {
    app: null,
    open: () => {
      if (!game.lazyPrep.app) game.lazyPrep.app = new LazyDMPrepApp();
      game.lazyPrep.app.render(true);
    }
  };

  // 1) Dedicated Scene Controls group (dragon icon)
  Hooks.on("getSceneControlButtons", (controls) => {
    const exists = controls.some(c => c.name === "lazy-prep");
    if (!exists) {
      controls.push({
        name: "lazy-prep",
        title: game.i18n?.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
        icon: "fas fa-dragon",
        visible: true, // change to game.user.isGM for GM-only
        tools: [
          {
            name: "open-dashboard",
            title: game.i18n?.has("LAZY_PREP.OPEN") ? game.i18n.localize("LAZY_PREP.OPEN") : "Open Lazy DM Prep",
            icon: "fas fa-book-open",
            button: true,
            onClick: () => game.lazyPrep.open()
          }
        ]
      });
    }

    // 2) Safety net: also add a tool under Token controls
    const tokenControls = controls.find(c => c.name === "token");
    if (tokenControls && !tokenControls.tools.some(t => t.name === "lazy-prep-open")) {
      tokenControls.tools.push({
        name: "lazy-prep-open",
        title: game.i18n?.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
        icon: "fas fa-dragon",
        button: true,
        onClick: () => game.lazyPrep.open()
      });
    }
  });

  // Force a controls refresh so buttons appear immediately
  ui.controls?.render(true);

  // Optional QoL: create a macro for GMs and assign to first free slot
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
