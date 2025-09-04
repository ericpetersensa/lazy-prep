/* Threats tab logic (v13-ready) */
export function activateThreatsListeners(html, app) {
  // Add threat
  html.on("click", ".add-threat", () => {
    app.session.threats.push({
      id: foundry.utils.randomID(),
      name: ""
    });
    app.render();
  });

  // Edit fields
  html.on("change", "input[name^='threat-name-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const t = app.session.threats.find(x => x.id === id);
    if (t) t.name = ev.currentTarget.value ?? "";
  });
}
