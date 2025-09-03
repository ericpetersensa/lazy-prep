export function activateStrongStartListeners(html, app) {
  html.find("textarea[name='strong-start-text']").change(ev => {
    app.session.strongStart.text = ev.currentTarget.value;
  });

  html.find(".create-strong-start-scene").click(async () => {
    const scene = await Scene.create({ name: "Strong Start", active: false });
    app.session.strongStart.sceneId = scene.id;
    ui.notifications.info("Strong Start Scene created!");
    app.render();
  });
}
