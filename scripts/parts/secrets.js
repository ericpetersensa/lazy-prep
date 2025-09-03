export function activateSecretsListeners(html, app) {
  html.find(".add-secret").click(() => {
    app.session.secrets.push({ id: randomID(), text: "", revealed: false });
    app.render();
  });

  html.find("input[type='text'][name^='secret-']").change(ev => {
    const id = ev.currentTarget.name.split("-")[1];
    const secret = app.session.secrets.find(s => s.id === id);
    if (secret) secret.text = ev.currentTarget.value;
  });

  html.find("input[type='checkbox']").change(ev => {
    const idx = html.find("input[type='checkbox']").index(ev.currentTarget);
    app.session.secrets[idx].revealed = ev.currentTarget.checked;
  });
}
