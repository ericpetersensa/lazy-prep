/* Characters tab logic (v13-ready, native DOM) */
export function activateCharactersListeners(htmlElement, app) {
  // Add character
  htmlElement.querySelectorAll(".add-character").forEach(btn => {
    btn.addEventListener("click", () => {
      app.session.characters.push({
        id: foundry.utils.randomID(),
        name: "",
        spotlightDebt: 0,
        notes: ""
      });
      app.render();
    });
  });

  // Edit fields: name
  htmlElement.querySelectorAll("input[name^='char-name-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const c = app.session.characters.find(x => x.id === id);
      if (c) c.name = ev.currentTarget.value ?? "";
    });
  });

  // Edit fields: spotlight
  htmlElement.querySelectorAll("input[name^='char-spotlight-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const c = app.session.characters.find(x => x.id === id);
      if (c) c.spotlightDebt = Math.max(0, parseInt(ev.currentTarget.value, 10) || 0);
    });
  });

  // Edit fields: notes
  htmlElement.querySelectorAll("input[name^='char-notes-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const c = app.session.characters.find(x => x.id === id);
      if (c) c.notes = ev.currentTarget.value ?? "";
    });
  });
}
