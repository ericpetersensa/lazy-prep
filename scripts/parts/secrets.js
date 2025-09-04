/* Secrets & Clues tab logic (v13-ready) */
export function activateSecretsListeners(html, app) {
  // Add secret
  html.on("click", ".add-secret", () => {
    app.session.secrets.push({
      id: foundry.utils.randomID(),
      text: "",
      revealed: false
    });
    app.render();
  });

  // Edit secret text
  html.on("change", "input[type='text'][name^='secret-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[1];
    const s = app.session.secrets.find(x => x.id === id);
    if (s) s.text = ev.currentTarget.value ?? "";
  });

  // Toggle revealed
  // (Template's checkbox has no name; we infer the ID from the sibling text input in the same <li>)
  html.on("change", ".tab[data-tab='secrets'] li input[type='checkbox']", (ev) => {
    const $li = $(ev.currentTarget).closest("li");
    const name = $li.find("input[name^='secret-']").attr("name"); // "secret-<id>"
    const id = name?.split("-")[1];
    const s = app.session.secrets.find(x => x.id === id);
    if (s) s.revealed = ev.currentTarget.checked;
  });
}
