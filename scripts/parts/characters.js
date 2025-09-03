export function activateCharactersListeners(html, app) {
  html.find(".add-character").click(() => {
    app.session.characters.push({ id: randomID(), name: "", spotlightDebt: 0, notes: "" });
    app.render();
  });

  html.find("input[name^='char-name']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const char = app.session.characters.find(c => c.id === id);
    if (char) char.name = ev.currentTarget.value;
  });

  html.find("input[name^='char-spotlight']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const char = app.session.characters.find(c => c.id === id);
    if (char) char.spotlightDebt = parseInt(ev.currentTarget.value) || 0;
  });

  html.find("input[name^='char-notes']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const char = app.session.characters.find(c => c.id === id);
    if (char) char.notes = ev.currentTarget.value;
  });
}
