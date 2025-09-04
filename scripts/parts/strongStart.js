/* Strong Start tab logic (v13-ready) */
export function activateStrongStartListeners(html, app) {
  // Update text
  html.on("change", "textarea[name='strong-start-text']", (ev) => {
    app.session.strongStart.text = ev.currentTarget.value ?? "";
  });

  // Create a stub Scene for Strong Start
  html.on("click", ".create-strong-start-scene", async () => {
    const sceneName = "Strong Start";
    const scene = await Scene.create({ name: sceneName, active: false });
    app.session.strongStart.sceneId = scene?.id ?? null;
    ui.notifications?.info(`Created scene: ${sceneName}`);
    app.render();
  });
}
