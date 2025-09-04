/* Potential Scenes tab logic (v13-ready) */
export function activateScenesListeners(html, app) {
  // Add scene row
  html.on("click", ".add-scene", () => {
    app.session.scenes.push({
      id: foundry.utils.randomID(),
      name: "",
      goal: "",
      twist: ""
    });
    app.render();
  });

  // Edit fields
  html.on("change", "input[name^='scene-name-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const s = app.session.scenes.find(x => x.id === id);
    if (s) s.name = ev.currentTarget.value ?? "";
  });

  html.on("change", "input[name^='scene-goal-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const s = app.session.scenes.find(x => x.id === id);
    if (s) s.goal = ev.currentTarget.value ?? "";
  });

  html.on("change", "input[name^='scene-twist-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const s = app.session.scenes.find(x => x.id === id);
    if (s) s.twist = ev.currentTarget.value ?? "";
  });
}
