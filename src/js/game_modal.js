const overlay = document.getElementById("overlay");
const modal = document.getElementById("rating-modal");

const btnModalOpen = document.getElementById("rate-btn");
const btnModalClose = document.getElementById("close-btn");

const ratingForm = document.getElementById("rating-form");

const badgeFieldset = document.getElementById("badges");

overlay.addEventListener("click", (e) => {
  if (!modal.contains(e.target)) {
    closeModal();
  }
});

btnModalOpen.addEventListener("click", () => {
  openModal();
});

btnModalClose.addEventListener("click", () => {
  closeModal();
});

ratingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  closeModal();
  submitRating();
  ratingForm.reset();
  loadStats(gameId);
});

function openModal() {
  overlay.classList.remove("hidden");
  document.body.classList.add("modal-open");
}

function closeModal() {
  overlay.classList.add("hidden");
  document.body.classList.remove("modal-open");
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

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 640 640");

      const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
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

function submitRating() {
  const formData = new FormData(ratingForm);
  const localData = JSON.parse(localStorage.getItem(gameId));

  const formVals = {
    violence: formData.get("violence-score"),
    sex: formData.get("sex-score"),
    language: formData.get("language-score"),
    sensitive: formData.get("sensitive-score"),
    communication: formData.get("communication-score"),
    stranger: formData.get("stranger-score"),
    community: formData.get("community-score"),
    competition: formData.get("competition-score"),
    report: formData.get("report-score"),
    block: formData.get("block-score"),
    filter: formData.get("filter-score"),
    parental: formData.get("parental-score"),
    microtransaction: formData.get("microtransaction-score"),
    pressure: formData.get("pressure-score"),
    lootboxes: formData.get("lootboxes-score"),
    ads: formData.get("ads-score"),
    badges: formData.getAll("badges"),
    comment: formData.get("comment"),
    timestamp: Date.now(),
  };

  if (localData) {
    localData.numRatings++;

    if (formVals.comment.trim() !== "") {
      localData.numComments++;
      localData.comments.push({
        text: formVals.comment,
        timestamp: formVals.timestamp,
      });
    }

    for (const criteria of Object.values(localData.criteria)) {
      for (const [criterion, stats] of Object.entries(criteria)) {
        const value = formVals[criterion];

        if (value !== null && value.trim() !== "") {
          stats.sum += Number(value);
          stats.count++;
        }
      }
    }

    for (const badge of formVals.badges) {
      localData.badges[badge] = (localData.badges[badge] ?? 0) + 1;
    }

    localStorage.setItem(gameId, JSON.stringify(localData));
  } else {
    localStorage.setItem(gameId, JSON.stringify(generateStats(formVals)));
  }
}

function generateStats(vals) {
  const object = {
    numComments: 0,
    numRatings: 0,
    criteria: {
      content: {
        violence: { sum: 0, count: 0 },
        sex: { sum: 0, count: 0 },
        language: { sum: 0, count: 0 },
        sensitive: { sum: 0, count: 0 },
      },
      interaction: {
        communication: { sum: 0, count: 0 },
        stranger: { sum: 0, count: 0 },
        community: { sum: 0, count: 0 },
        competition: { sum: 0, count: 0 },
      },
      moderation: {
        report: { sum: 0, count: 0 },
        block: { sum: 0, count: 0 },
        filter: { sum: 0, count: 0 },
        parental: { sum: 0, count: 0 },
      },
      purchase: {
        microtransaction: { sum: 0, count: 0 },
        pressure: { sum: 0, count: 0 },
        lootboxes: { sum: 0, count: 0 },
        ads: { sum: 0, count: 0 },
      },
    },
    badges: {},
    comments: [],
  };

  object.numRatings = 1;

  for (const criteria of Object.values(object.criteria)) {
    for (const [criterion, stats] of Object.entries(criteria)) {
      const value = vals[criterion];

      if (value !== null && value.trim() !== "") {
        stats.sum = Number(value);
        stats.count = 1;
      }
    }
  }

  for (const badge of vals.badges) {
    object.badges[badge] = 1;
  }

  if (vals.comment.trim() !== "") {
    object.numComments = 1;
    object.comments.push({
      text: vals.comment,
      timestamp: vals.timestamp,
    });
  }

  return object;
}
