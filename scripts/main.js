import { LazyDMPrepApp } from "./app.js";

/**
 * Utility: Register Handlebars partials for each part template.
 * Uses Foundry's template pipeline to compile and cache.
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

  // Preload to warm cache (optional but recommended for smoother first render)
  await loadTemplates(parts.map(p => `${base}/${p}.hbs`));

  // Register as partials so templates/app.hbs can include them via {{> partName}}
  for (const part of parts) {
    const path = `${base}/${part}.hbs`;
    const tplFn = await getTemplate(path); // compiled template function
    Handlebars.registerPartial(part, tplFn);
  }
}

/**
 * Utility: Create a "Open Lazy DM Prep" macro for GMs if one doesn't exist,
 * and assign it to the first free hotbar slot.
 */
async function ensureOpenMacro() {
  if (!game.user.isGM) return;

  const macroName = "Open Lazy DM Prep";
  let macro = game.macros?.getName?.(macroName);

  if (!macro) {
    try {
      macro = await Macro.create({
        name: macroName,
        type: "script",
        command: "game.lazyPrep.open();",
        img: "icons/svg/book.svg",
        scope: "global" // visible to all worlds users; omit if you prefer default
      });
      ui.notifications?.info("Lazy Prep | Created 'Open Lazy DM Prep' macro.");
    } catch (err) {
      console.warn("Lazy Prep | Could not create macro automatically.", err);
      return;
    }
  }

  // Assign to first empty hotbar slot (1..10) for the current GM
  try {
    const existing = Object.values(game.user.getHotbarMacros() ?? {});
    const occupied = new Set(existing.filter(Boolean).map(m => m?.slot));
    let emptySlot = 1;
    for (; emptySlot <= 10; emptySlot++) {
      if (!occupied.has(emptySlot)) break;
    }
    if (emptySlot <= 10) {
      await game.user.assignHotbarMacro(macro, emptySlot);
      ui.notifications?.info(`Lazy Prep | Macro assigned to hotbar slot ${emptySlot}.`);
    }
  } catch (err) {
    console.warn("Lazy Prep | Could not assign macro to hotbar.", err);
  }
}

/**
 * INIT: Register settings and partials.
 */
Hooks.once("init", async () => {
  console.log("Lazy Prep | Initializing module");

  // Persistent world setting to store the current session object
  game.settings.register("lazy-prep", "currentSession", {
    scope: "world",
    config: false,
    type: Object,
    default: {}
  });

  // Register Handlebars partials for parts used by templates/app.hbs
  await registerPartials();
});

/**
 * READY: Expose API, add Scene Controls group, ensure macro.
 */
Hooks.once("ready", async () => {
  // Expose a global API for convenience (other modules/macros can call this)
  game.lazyPrep = {
    app: null,
    open: () => {
      if (!game.lazyPrep.app) {
        game.lazyPrep.app = new LazyDMPrepApp();
      }
      game.lazyPrep.app.render(true);
    }
  };

  // Create a dedicated controls group on the left toolbar
  Hooks.on("getSceneControlButtons", (controls) => {
    controls.push({
      name: "lazy-prep",
      title: game.i18n?.localize("LAZY_PREP.APP_TITLE") || "Lazy DM Prep",
      icon: "fas fa-dragon",   // header icon for the group
      visible: true,           // show for all users; change to game.user.isGM if you want GM-only
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
      // Note: No custom layer needed; this group simply exposes tools.
    });
  });

  // Optional QoL: Create + assign the "Open Lazy DM Prep" macro
  await ensureOpenMacro();
});
