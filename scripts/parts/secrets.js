/* Secrets tab logic (v13-ready, native DOM) */
export function activateSecretsListeners(htmlElement, app) {
  htmlElement.querySelectorAll(".add-secret").forEach(btn => {
    btn.addEventListener("click", () => {
      app.session.secrets.push({
        id: foundry.utils.randomID(),
        text: ""
      });
      app.render();
    });
  });

  htmlElement.querySelectorAll("input[name^='secret-text-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const s = app.session.secrets.find(x => x.id === id);
      if (s) s.text = ev.currentTarget.value ?? "";
    });
  });
}
