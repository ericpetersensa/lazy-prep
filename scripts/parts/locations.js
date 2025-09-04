/* Locations tab logic (v13-ready) */
export function activateLocationsListeners(html, app) {
  // Add location
  html.on("click", ".add-location", () => {
    app.session.locations.push({
      id: foundry.utils.randomID(),
      name: "",
      detail: ""
    });
    app.render();
  });

  // Edit fields
  html.on("change", "input[name^='loc-name-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const l = app.session.locations.find(x => x.id === id);
    if (l) l.name = ev.currentTarget.value ?? "";
  });

  html.on("change", "input[name^='loc-detail-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const l = app.session.locations.find(x => x.id === id);
    if (l) l.detail = ev.currentTarget.value ?? "";
  });
}
