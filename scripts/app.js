export class LazyDMPrepApp extends ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: "lazy-dm-prep",
    title: "Lazy DM Prep Dashboard",
    template: "modules/lazy-prep/templates/app.hbs",
    width: 800,
    height: 600,
    resizable: true,
    classes: ["lazy-dm-prep"],
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
    this.session = this.loadSession();
  }

  async loadSession() {
    const data = game.settings.get("lazy-prep", "currentSession") || {};
    return foundry.utils.mergeObject(this.defaultSession(), data);
  }

  defaultSession() {
    return {
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

  async _renderInner(data) {
    data.session = this.session;
    return super._renderInner(data);
  }

  activateListeners(html) {
    super.activateListeners(html);
    html.find(".save-session").click(() => this.saveSession());
    html.find(".add-secret").click(() => this.addSecret());
    // Add more event bindings for each step
  }

  saveSession() {
    game.settings.set("lazy-prep", "currentSession", this.session);
    ui.notifications.info("Session saved!");
  }

  addSecret() {
    this.session.secrets.push({ id: randomID(), text: "", revealed: false });
    this.render();
  }
}
