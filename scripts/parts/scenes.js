export function activateScenesListeners(html, app) {
  html.find(".add-scene").click(() => {
    app.session.scenes.push({ id: randomID(), name: "", goal: "", twist: "" });
    app.render();
  });

  html.find("input[name^='scene-name']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const scene = app.session.scenes.find(s => s.id === id);
    if (scene) scene.name = ev.currentTarget.value;
  });

  html.find("input[name^='scene-goal']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const scene = app.session.scenes.find(s => s.id === id);
    if (scene) scene.goal = ev.currentTarget.value;
  });

  html.find("input[name^='scene-twist']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const scene = app.session.scenes.find(s => s.id === id);
    if (scene) scene.twist = ev.currentTarget.value;
  });
}
