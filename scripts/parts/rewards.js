/* Rewards tab logic (v13-ready, native DOM) */
export function activateRewardsListeners(htmlElement, app) {
  htmlElement.querySelectorAll(".add-reward").forEach(btn => {
    btn.addEventListener("click", () => {
      app.session.rewards.push({
        id: foundry.utils.randomID(),
        name: "",
        notes: ""
      });
      app.render();
    });
  });

  htmlElement.querySelectorAll("input[name^='reward-name-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const r = app.session.rewards.find(x => x.id === id);
      if (r) r.name = ev.currentTarget.value ?? "";
    });
  });

  htmlElement.querySelectorAll("input[name^='reward-notes-']").forEach(input => {
    input.addEventListener("change", ev => {
      const id = ev.currentTarget.name.split("-")[2];
      const r = app.session.rewards.find(x => x.id === id);
      if (r) r.notes = ev.currentTarget.value ?? "";
    });
  });
}
