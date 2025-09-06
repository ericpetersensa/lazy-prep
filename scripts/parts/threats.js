/* Threats tab logic (v13-ready, native DOM) */
export function activateThreatsListeners(htmlElement, app) {
  htmlElement.querySelectorAll(".add-threat").forEach(btn => {
    btn.addEventListener("click", () => {
      app.session.threats.push({
        id: foundry.utils.randomID(),
        name: "",
        notes: ""
      });
      app.render();
    });
  });
  htmlElement.querySelectorAll("input[name^='threat-name-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const t = app.session.threats.find(x => x.id === id);
      if (t) t.name = ev.currentTarget.value ?? "";
    });
  });
  htmlElement.querySelectorAll("input[name^='threat-notes-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const t = app.session.threats.find(x => x.id === id);
      if (t) t.notes = ev.currentTarget.value ?? "";
    });
  });
}
