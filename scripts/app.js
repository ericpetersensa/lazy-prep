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
    // We declare the parts here for reference; actual injection is done after main render.
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
    // NOTE: Do NOT touch globalThis.randomID in v13 (deprecated).
    // All IDs should be created with foundry.utils.randomID() in part scripts.
  }

  /**
   * Supply data for the top-level Handlebars template.
   * Returned object is merged into the template context.
   */
  async getData(options) {
    const session = await this.loadSession();
    return {
      session,
      // Expose localization function for templates if useful
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
   * After the top-level template is rendered, optionally inject part templates.
   * This supports two approaches:
   *  1) If your app.hbs already includes the parts (via {{> partial}}), we won't inject.
   *  2) If not, we render parts and append them to the `.content` container.
   */
  async _renderInner(data) {
    // Render the main template first (Handlebars mixin does this).
    const html = await super._renderInner(data);

    // If parts are already present (e.g., you included them in app.hbs), skip injection.
    const existingTabs = html.querySelectorAll(".tab[data-tab]");
    if (existingTabs.length > 0) return html;

    // Otherwise, render all parts and inject into the content area.
    const content = html.querySelector("section.content");
    if (!content) return html;

    // Render each part template with shared context (the same data used in getData()).
    for (const [partId, partCfg] of Object.entries(this.constructor.DEFAULT_OPTIONS.parts)) {
      const context = { session: this._session, i18n: game.i18n };
      const partHTML = await foundry.applications.handlebars.renderTemplate(partCfg.template, context);
      const wrapper = document.createElement("div");
      wrapper.innerHTML = partHTML.trim();

      // Ensure each part has a .tab[data-tab="..."] root for tab system.
      const tab = wrapper.querySelector(".tab[data-tab]");
      if (!tab) {
        // If template omitted the .tab wrapper, wrap it with one for consistency.
        const tabDiv = document.createElement("div");
        tabDiv.classList.add("tab");
        tabDiv.dataset.tab = partId;
        tabDiv.append(...wrapper.childNodes);
        content.appendChild(tabDiv);
      } else {
        content.appendChild(tab);
      }
    }

    return html;
  }

  /**
   * Attach handlers and initialize the tab UI, then hand off per-part event binding.
   */
  activateListeners(htmlElement) {
    super.activateListeners(htmlElement);

    // In v13, htmlElement is a DOM Element. jQuery is still available if desired:
    const html = $(htmlElement); // convenience wrapper

    // Tabs
    this._activateTabs(htmlElement);

    // Global save button (in top-level template)
    html.find(".save-session").on("click", () => this.saveSession());

    // Wire up each part’s listeners (they receive jQuery html and the app instance).
    activateCharactersListeners(html, this);
    activateStrongStartListeners(html, this);
    activateScenesListeners(html, this);
    activateSecretsListeners(html, this);
    activateLocationsListeners(html, this);
    activateNPCsListeners(html, this);
    activateThreatsListeners(html, this);
    activateRewardsListeners(html, this);
  }

  /** -----------------------------------------
   * Helpers
   * ------------------------------------------ */

  /**
   * Simple tabs system: clicking a nav item shows the corresponding .tab[data-tab]
   * Assumes your app.hbs has:
   *   <nav class="tabs" data-group="primary"> <a data-tab="characters">... </nav>
   *   <section class="content"> <div class="tab" data-tab="characters">...</div> ... </section>
   */
  _activateTabs(rootEl) {
    const nav = rootEl.querySelector("nav.tabs[data-group='primary']");
    const tabs = Array.from(rootEl.querySelectorAll(".tab[data-tab]"));
    if (!nav || !tabs.length) return;

    // Initial: show first tab only
    const initial = nav.querySelector("a.item[data-tab]")?.dataset?.tab ?? tabs[0].dataset.tab;
    this._showTab(rootEl, initial);

    // Click handling
    nav.querySelectorAll("a.item[data-tab]").forEach(a => {
      a.addEventListener("click", ev => {
        ev.preventDefault();
        const tab = a.dataset.tab;
        this._showTab(rootEl, tab);
      });
    });
  }

  _showTab(rootEl, tabName) {
    rootEl.querySelectorAll("nav.tabs[data-group='primary'] a.item[data-tab]").forEach(a => {
      a.classList.toggle("active", a.dataset.tab === tabName);
    });
    rootEl.querySelectorAll(".tab[data-tab]").forEach(div => {
      div.style.display = (div.dataset.tab === tabName) ? "" : "none";
    });
  }

  /**
   * Public accessor for session (so part scripts can read/write).
   */
  get session() { return this._session; }
  set session(v) { this._session = v; }
}
