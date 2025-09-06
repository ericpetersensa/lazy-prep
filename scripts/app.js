/* eslint-disable no-undef */
// Foundry VTT v13 - ApplicationV2 + Handlebars mixin (pure parts; no fallback injection)
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
  static DEFAULT_OPTIONS = {
    id: "lazy-dm-prep",
    template: "modules/lazy-prep/templates/app.hbs",
    position: { width: 900, height: 640 },
    window: { title: "LAZY_PREP.APP_TITLE", resizable: true },
    classes: ["lazy-dm-prep", "sheet"],
    // Each part renders into a <... data-part="..."> slot in app.hbs
    parts: {
      characters:  { template: "modules/lazy-prep/templates/parts/characters.hbs" },
      strongStart: { template: "modules/lazy-prep/templates/parts/strongStart.hbs" },
      scenes:      { template: "modules/lazy-prep/templates/parts/scenes.hbs" },
      secrets:     { template: "modules/lazy-prep/templates/parts/secrets.hbs" },
      locations:   { template: "modules/lazy-prep/templates/parts/locations.hbs" },
      npcs:        { template: "modules/lazy-prep/templates/parts/npcs.hbs" },
      threats:     { template: "modules/lazy-prep/templates/parts/threats.hbs" },
      rewards:     { template: "modules/lazy-prep/templates/parts/rewards.hbs" }
    }
  };

  constructor(options = {}) {
    super(options);
    this._session = null;
  }

  /** AppV2: build the handlebars context here. */
  async _prepareContext(_options) {
    const session = await this.loadSession();
    return { session, i18n: game.i18n };
  }

  async loadSession() {
    if (this._session) return this._session;
    const stored = game.settings.get("lazy-prep", "currentSession");
    this._session = foundry.utils.mergeObject(this.defaultSession(), stored ?? {}, { inplace: false });
    return this._session;
  }

  defaultSession() {
    return {
      _schema: 1,
      id: foundry.utils.randomID(),
      name: "New Session",
      date: new Date().toISOString().split("T")[0],
      characters: [],
      strongStart: { text: "", sceneId: null },
      scenes: [],
      secrets: [],
      locations: [],
      npcs: [],
      threats: [],
      rewards: []
    };
  }

  async saveSession() {
    await game.settings.set("lazy-prep", "currentSession", this._session);
    ui.notifications?.info(game.i18n?.localize("LAZY_PREP.SAVE") ?? "Session saved.");
  }

  /** Standard DOM wiring; no rendering/injection fallback needed. */
  activateListeners(htmlElement) {
    super.activateListeners(htmlElement);

    // Tabs
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

    // Save button
    const saveBtn = htmlElement.querySelector(".save-session");
    if (saveBtn) saveBtn.addEventListener("click", () => this.saveSession());

    // Part listeners (native DOM)
    activateCharactersListeners(htmlElement, this);
    activateStrongStartListeners(htmlElement, this);
    activateScenesListeners(htmlElement, this);
    activateSecretsListeners(htmlElement, this);
    activateLocationsListeners(htmlElement, this);
    activateNPCsListeners(htmlElement, this);
    activateThreatsListeners(htmlElement, this);
    activateRewardsListeners(htmlElement, this);
  }

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
