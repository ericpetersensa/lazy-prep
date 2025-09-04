/* Rewards tab logic (v13-ready) */
export function activateRewardsListeners(html, app) {
  // Add reward
  html.on("click", ".add-reward", () => {
    app.session.rewards.push({
      id: foundry.utils.randomID(),
      name: ""
    });
    app.render();
  });

  // Edit fields
  html.on("change", "input[name^='reward-name-']", (ev) => {
    const id = ev.currentTarget.name.split("-")[2];
    const r = app.session.rewards.find(x => x.id === id);
    if (r) r.name = ev.currentTarget.value ?? "";
  });
}
