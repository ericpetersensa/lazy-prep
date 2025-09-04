/* NPCs tab logic (v13-ready) */
export function activateNPCsListeners(html, app) {
  // Add NPC
  html.on("click", ".add-npc", () => {
    app.session.npcs.push({
      id: foundry.utils.randomID(),
      name: "",
      motive: ""
    });
    app.render();
  });

  // Edit fields
  html.on("change", "input[name^='npc-name-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const n = app.session.npcs.find(x => x.id === id);
    if (n) n.name = ev.currentTarget.value ?? "";
  });

  html.on("change", "input[name^='npc-motive-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const n = app.session.npcs.find(x => x.id === id);
    if (n) n.motive = ev.currentTarget.value ?? "";
  });
}
