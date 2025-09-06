/* Strong Start tab logic (v13-ready, native DOM) */
export function activateStrongStartListeners(htmlElement, app) {
  htmlElement.querySelectorAll("input[name='strongStart-text']").forEach(input => {
    input.addEventListener("change", ev => {
      app.session.strongStart.text = ev.currentTarget.value ?? "";
    });
  });

  htmlElement.querySelectorAll("input[name='strongStart-sceneId']").forEach(input => {
    input.addEventListener("change", ev => {
      app.session.strongStart.sceneId = ev.currentTarget.value ?? null;
    });
  });
}
