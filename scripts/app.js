/* eslint-disable no-undef */
// Foundry VTT v13 - ApplicationV2 + Handlebars mixin
// MVP app that renders eight Lazy DM steps, with partials or fallback injection, and wires all listeners.

import { activateCharactersListeners } from "./parts/characters.js";
import { activateStrongStartListeners } from "./parts/strongStart.js";
import { activateScenesListeners } from "./parts/scenes.js";
import { activateSecretsListeners } from "./parts/secrets.js";
import { activateLocationsListeners } from "./parts/locations.js";
import { activateNPCsListeners } from "./parts/npcs.js";
import { activateThreatsListeners } from "./parts/threats.js";
import { activateRewardsListeners } from "./parts/rewards.js";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;
const HBS = foundry.applications.handlebars;

export class LazyDMPrepApp extends HandlebarsApplicationMixin(ApplicationV2) {

  static DEFAULT_OPTIONS = {
    id: "lazy-dm-prep",
    title: game.i18n?.localize("LAZY_PREP.APP_TITLE") ?? "Lazy DM Prep Dashboard",
    template: "modules/lazy-prep/templates/app.hbs",
    position: { width: 900, height: 640 }, // v13 AppV2 sizing
    resizable: true,
    classes: ["lazy-dm-prep", "sheet"],
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

  constructor(options = {}) {
    super(options);
    this._session = null;
  }

  async getData(options) {
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

  /** Render and ensure content exists even if partials weren't registered */
  async _renderInner(data) {
    const html = await super._renderInner(data);

    // If app.hbs partials didn't render, inject parts dynamically as a fallback.
    let tabs = html.querySelectorAll(".tab[data-tab]");
    if (!tabs || tabs.length === 0) {
      const content = html.querySelector("section.content");
      if (content) {
        for (const [partId, partCfg] of Object.entries(this.constructor.DEFAULT_OPTIONS.parts)) {
          const partHTML = await HBS.renderTemplate(partCfg.template, { session: this._session, i18n: game.i18n });
          const wrapper = document.createElement("div");
          wrapper.innerHTML = partHTML.trim();
          const tab = wrapper.querySelector(".tab[data-tab]");

          if (tab) content.appendChild(tab);
          else {
            // If a template ever lacks the .tab wrapper, wrap it.
            const tabDiv = document.createElement("div");
            tabDiv.classList.add("tab");
            tabDiv.dataset.tab = partId;
            tabDiv.append(...wrapper.childNodes);
            content.appendChild(tabDiv);
          }
        }
      }
      tabs = html.querySelectorAll(".tab[data-tab]");
      console.info(`Lazy Prep | Fallback injected ${tabs.length} tab(s).`);
    }

    return html;
  }

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

    // Wire up part listeners (jQuery wrapper for convenience)
    const $html = $(htmlElement);
    activateCharactersListeners($html, this);
    activateStrongStartListeners($html, this);
    activateScenesListeners($html, this);
    activateSecretsListeners($html, this);
    activateLocationsListeners($html, this);
    activateNPCsListeners($html, this);
    activateThreatsListeners($html, this);
    activateRewardsListeners($html, this);
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
