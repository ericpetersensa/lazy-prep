/* Characters tab logic (v13-ready) */
export function activateCharactersListeners(html, app) {
  // Add character
  html.on("click", ".add-character", () => {
    app.session.characters.push({
      id: foundry.utils.randomID(),
      name: "",
      spotlightDebt: 0,
      notes: ""
    });
    app.render();
  });

  // Edit fields
  html.on("change", "input[name^='char-name-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const c = app.session.characters.find(x => x.id === id);
    if (c) c.name = ev.currentTarget.value ?? "";
  });

  html.on("change", "input[name^='char-spotlight-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const c = app.session.characters.find(x => x.id === id);
    if (c) c.spotlightDebt = Math.max(0, parseInt(ev.currentTarget.value, 10) || 0);
  });

  html.on("change", "input[name^='char-notes-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const c = app.session.characters.find(x => x.id === id);
    if (c) c.notes = ev.currentTarget.value ?? "";
  });
}
