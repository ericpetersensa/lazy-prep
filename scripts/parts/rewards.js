export function activateRewardsListeners(html, app) {
  html.find(".add-reward").click(() => {
    app.session.rewards.push({ id: randomID(), name: "" });
    app.render();
  });

  html.find("input[name^='reward-name']").change(ev => {
    const id = ev.currentTarget.name.split("-")[2];
    const reward = app.session.rewards.find(r => r.id === id);
    if (reward) reward.name = ev.currentTarget.value;
  });
}
