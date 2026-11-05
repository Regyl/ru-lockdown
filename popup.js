const RULESET_ID = "ru_block";

const toggle = document.querySelector("#enabled");
const status = document.querySelector("#status");

function render(on) {
  toggle.checked = on;
  status.textContent = on ? "Blocking is on" : "Blocking is off";
  status.classList.toggle("is-off", !on);
}

async function load() {
  const enabled = await chrome.declarativeNetRequest.getEnabledRulesets();
  render(enabled.includes(RULESET_ID));
}

toggle.addEventListener("change", async () => {
  const on = toggle.checked;
  toggle.disabled = true;
  try {
    await chrome.declarativeNetRequest.updateEnabledRulesets(
      on
        ? { enableRulesetIds: [RULESET_ID] }
        : { disableRulesetIds: [RULESET_ID] }
    );
    render(on);
  } catch {
    render(!on);
    status.textContent = "Could not update the block";
    status.classList.add("is-off");
  } finally {
    toggle.disabled = false;
  }
});

load().catch(() => {
  status.textContent = "Could not read the block";
  status.classList.add("is-off");
  toggle.disabled = true;
});
