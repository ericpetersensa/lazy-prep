/* eslint-disable no-undef */
// Foundry VTT v13 - ApplicationV2 + Handlebars mixin
// Robust MVP app that renders eight Lazy DM steps and wires all part listeners.

import { activateCharactersListeners } from "./parts/characters.js";
import { activateStrongStartListeners } from "./parts/strongStart.js";
import { activateScenesListeners } from "./parts/scenes.js";
import { activateSecretsListeners } from "./parts/secrets.js";
import { activateLocationsListeners } from "./parts/locations.js";
import { activateNPCsListeners } from "./parts/npcs.js";
import { activateThreatsListeners } from "./parts/threats.js";
import { activateRewardsListeners } from "./parts/rewards.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

export class LazyDMPrepApp extends HandlebarsApplicationMixin(ApplicationV2) {

  /** -----------------------------------------
   * Default Options & Part Templates
   * ------------------------------------------ */
  static DEFAULT_OPTIONS = {
    id: "lazy-dm-prep",
    title: game.i18n?.localize("LAZY_PREP.APP_TITLE") ?? "Lazy DM Prep Dashboard",
    template: "modules/lazy-prep/templates/app.hbs",
    // ApplicationV2 (v13) uses "position" for sizing and placement
    position: { width: 900, height: 640 },
    resizable: true,
    classes: ["lazy-dm-prep", "sheet"],
    // Parts are declared for reference; rendering comes from the partials in app.hbs
    parts: {
      characters: { template: "modules/lazy-prep/templates/parts/characters.hbs" },
      strongStart: { template: "modules/lazy-prep/templates/parts/strongStart.hbs" },
      scenes: { template: "modules/lazy-prep/templates/parts/scenes.hbs" },
      secrets: { template: "modules/lazy-prep/templates/parts/secrets.hbs" },
      locations: { template: "modules/lazy-prep/templates/parts/locations.hbs" },
      npcs: { template: "modules/lazy-prep/templates/parts/npcs.hbs" },
      threats: { template: "modules/lazy-prep/templates/parts/threats.hbs" },
      rewards: { template: "modules/lazy-prep/templates/parts/rewards.hbs" }
    }
  };

  /** -----------------------------------------
   * Lifecycle
   * ------------------------------------------ */
  constructor(options = {}) {
    super(options);
    this._session = null;
  }

  /**
   * Supply data for the top-level Handlebars template.
   * Returned object is merged into the template context.
   */
  async getData(options) {
    const session = await this.loadSession();
    return {
      session,
      i18n: game.i18n
    };
  }

  /**
   * Load session object from world settings or initialize a default.
   */
  async loadSession() {
    if (this._session) return this._session;
    const stored = game.settings.get("lazy-prep", "currentSession");
    this._session = foundry.utils.mergeObject(this.defaultSession(), stored ?? {}, { inplace: false });
    return this._session;
  }

  /**
   * Default session shape (versioned if/when schema evolves).
   */
  defaultSession() {
    return {
      _schema: 1,
      id: foundry.utils.randomID(),
      name: "New Session",
      date: new Date().toISOString().split("T")[0],
      characters: [],                 // [{ id, name, spotlightDebt, notes }]
      strongStart: { text: "", sceneId: null },
      scenes: [],                     // [{ id, name, goal, twist }]
      secrets: [],                    // [{ id, text, revealed }]
      locations: [],                  // [{ id, name, detail }]
      npcs: [],                       // [{ id, name, motive }]
      threats: [],                    // [{ id, name }]
      rewards: []                     // [{ id, name }]
    };
  }

  /**
   * Save the in-memory session back to world settings.
   */
  async saveSession() {
    await game.settings.set("lazy-prep", "currentSession", this._session);
    ui.notifications?.info(game.i18n?.localize("LAZY_PREP.SAVE") ?? "Session saved.");
  }

  /** -----------------------------------------
   * Rendering
   * ------------------------------------------ */

  /**
   * We rely on app.hbs partials rendered by Foundry's template cache.
   * If you ever want to support dynamic injection, that can be added here,
   * but declarative partials are the preferred, stable pattern.
   */
  async _renderInner(data) {
    return super._renderInner(data);
  }

  /**
   * Attach handlers and initialize the tab UI, then hand off per-part event binding.
   */
  activateListeners(htmlElement) {
    super.activateListeners(htmlElement);

    // Tabs (simple, explicit)
    const nav = htmlElement.querySelector("nav.tabs[data-group='primary']");
    const tabs = Array.from(htmlElement.querySelectorAll(".tab[data-tab]"));
    if (nav && tabs.length) {
      const initial = nav.querySelector("a.item[data-tab]")?.dataset?.tab ?? tabs[0].dataset.tab;
      this._showTab(htmlElement, initial);

      nav.querySelectorAll("a.item[data-tab]").forEach(a => {
        a.addEventListener("click", ev => {
          ev.preventDefault();
          this._showTab(htmlElement, a.dataset.tab);
        });
      });
    }

    // Global save button (in top-level template)
    const saveBtn = htmlElement.querySelector(".save-session");
    if (saveBtn) saveBtn.addEventListener("click", () => this.saveSession());

    // Wire up each part’s listeners (they receive jQuery html and the app instance).
    const $html = $(htmlElement); // jQuery remains supported in v13
    activateCharactersListeners($html, this);
    activateStrongStartListeners($html, this);
    activateScenesListeners($html, this);
    activateSecretsListeners($html, this);
    activateLocationsListeners($html, this);
    activateNPCsListeners($html, this);
    activateThreatsListeners($html, this);
    activateRewardsListeners($html, this);
  }

  /** -----------------------------------------
   * Helpers
   * ------------------------------------------ */
  _showTab(rootEl, tabName) {
    rootEl.querySelectorAll("nav.tabs[data-group='primary'] a.item[data-tab]").forEach(a => {
      a.classList.toggle("active", a.dataset.tab === tabName);
    });
    rootEl.querySelectorAll(".tab[data-tab]").forEach(div => {
      div.style.display = (div.dataset.tab === tabName) ? "" : "none";
    });
  }

  get session() { return this._session; }
  set session(v) { this._session = v; }
}
