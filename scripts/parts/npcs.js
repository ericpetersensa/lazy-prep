/* NPCs tab logic (v13-ready, native DOM) */
export function activateNPCsListeners(htmlElement, app) {
  htmlElement.querySelectorAll(".add-npc").forEach(btn => {
    btn.addEventListener("click", () => {
      app.session.npcs.push({
        id: foundry.utils.randomID(),
        name: "",
        role: "",
        notes: ""
      });
      app.render();
    });
  });

  htmlElement.querySelectorAll("input[name^='npc-name-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const n = app.session.npcs.find(x => x.id === id);
      if (n) n.name = ev.currentTarget.value ?? "";
    });
  });

  htmlElement.querySelectorAll("input[name^='npc-role-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const n = app.session.npcs.find(x => x.id === id);
      if (n) n.role = ev.currentTarget.value ?? "";
    });
  });

  htmlElement.querySelectorAll("input[name^='npc-notes-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const n = app.session.npcs.find(x => x.id === id);
      if (n) n.notes = ev.currentTarget.value ?? "";
    });
  });
}
