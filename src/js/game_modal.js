const btn_modal_open = document.getElementById("rate-btn");
const btn_modal_close = document.getElementById("close-btn");
const overlay = document.getElementById("overlay");

const badgeFieldset = document.getElementById("badges");

btn_modal_open.addEventListener("click", () => {
  open_modal();
})

btn_modal_close.addEventListener("click", () => {
  close_modal();
})

function open_modal() {
  overlay.classList.remove("hidden");
}

function close_modal() {
  overlay.classList.add("hidden");
}

loadBadges();

async function loadBadges() {
  try {
    const response = await fetch("src/data/badges.json");

    if (!response.ok) {
      throw new Error(`Erro HTTP: ${response.status}`);
    }

    const badges = await response.json();

    badgeFieldset.replaceChildren();

    badges.forEach((badge) => {
      const label = document.createElement("label");
      label.className = "modal-badge";

      const badgeId = document.createElement("div");
      badgeId.className = "modal-badge__id";

      const iconContainer = document.createElement("div");
      iconContainer.className = "modal-badge__icon";
      iconContainer.setAttribute("aria-hidden", "true");

      const svg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      svg.setAttribute("viewBox", "0 0 640 640");

      const use = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "use"
      );
      use.setAttribute("href", `assets/icons.svg#${badge.icon}`);

      svg.appendChild(use);
      iconContainer.appendChild(svg);

      const badgeInfo = document.createElement("div");
      badgeInfo.className = "modal-badge__info";

      const name = document.createElement("strong");
      name.className = "modal-badge__name clr-main";
      name.textContent = badge.name;

      const description = document.createElement("p");
      description.className = "modal-badge__description clr-text";
      description.textContent = badge.description;

      badgeInfo.append(name, description);
      badgeId.append(iconContainer, badgeInfo);

      const input = document.createElement("input");
      input.type = "checkbox";
      input.name = "badges";
      input.value = badge.id;

      label.append(badgeId, input);
      badgeFieldset.appendChild(label);
    });
  } catch (error) {
    console.error("Não foi possível carregar os selos:", error);
  }
}
