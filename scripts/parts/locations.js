export function activateLocationsListeners(html, app) {
  html.find(".add-location").click(() => {
    app.session.locations.push({ id: randomID(), name: "", detail: "" });
    app.render();
  });

  html.find("input[name^='loc-name']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const loc = app.session.locations.find(l => l.id === id);
    if (loc) loc.name = ev.currentTarget.value;
  });

  html.find("input[name^='loc-detail']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const loc = app.session.locations.find(l => l.id === id);
    if (loc) loc.detail = ev.currentTarget.value;
  });
}
