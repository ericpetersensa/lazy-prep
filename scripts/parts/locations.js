/* Locations tab logic (v13-ready, native DOM) */
export function activateLocationsListeners(htmlElement, app) {
  htmlElement.querySelectorAll(".add-location").forEach(btn => {
    btn.addEventListener("click", () => {
      app.session.locations.push({
        id: foundry.utils.randomID(),
        name: "",
        notes: ""
      });
      app.render();
    });
  });

  htmlElement.querySelectorAll("input[name^='loc-name-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const l = app.session.locations.find(x => x.id === id);
      if (l) l.name = ev.currentTarget.value ?? "";
    });
  });

  htmlElement.querySelectorAll("input[name^='loc-notes-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const l = app.session.locations.find(x => x.id === id);
      if (l) l.notes = ev.currentTarget.value ?? "";
    });
  });
}
