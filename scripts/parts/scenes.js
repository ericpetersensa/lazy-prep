/* Scenes tab logic (v13-ready, native DOM) */
export function activateScenesListeners(htmlElement, app) {
  htmlElement.querySelectorAll(".add-scene").forEach(btn => {
    btn.addEventListener("click", () => {
      app.session.scenes.push({
        id: foundry.utils.randomID(),
        name: "",
        notes: ""
      });
      app.render();
    });
  });

  htmlElement.querySelectorAll("input[name^='scene-name-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const s = app.session.scenes.find(x => x.id === id);
      if (s) s.name = ev.currentTarget.value ?? "";
    });
  });

  htmlElement.querySelectorAll("input[name^='scene-notes-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const s = app.session.scenes.find(x => x.id === id);
      if (s) s.notes = ev.currentTarget.value ?? "";
    });
  });
}
