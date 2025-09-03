export function activateThreatsListeners(html, app) {
  html.find(".add-threat").click(() => {
    app.session.threats.push({ id: randomID(), name: "" });
    app.render();
  });

  html.find("input[name^='threat-name']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const threat = app.session.threats.find(t => t.id === id);
    if (threat) threat.name = ev.currentTarget.value;
  });
}
