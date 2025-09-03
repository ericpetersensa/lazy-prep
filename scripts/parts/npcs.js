export function activateNPCsListeners(html, app) {
  html.find(".add-npc").click(() => {
    app.session.npcs.push({ id: randomID(), name: "", motive: "" });
    app.render();
  });

  html.find("input[name^='npc-name']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const npc = app.session.npcs.find(n => n.id === id);
    if (npc) npc.name = ev.currentTarget.value;
  });

  html.find("input[name^='npc-motive']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const npc = app.session.npcs.find(n => n.id === id);
    if (npc) npc.motive = ev.currentTarget.value;
  });
}
