const modal = document.getElementById("rating-modal");

const btnModalOpen = document.getElementById("rate-btn");
const btnModalClose = document.getElementById("close-btn");

const ratingForm = document.getElementById("rating-form");

const badgeFieldset = document.getElementById("badges");

const btnPrevious = document.getElementById("modal__btn-previous");
const btnNext = document.getElementById("modal__btn-next");

const liveScore = document.getElementById("live-score");
const liveScoreNum = document.getElementById("live-score-num");
const liveScoreDisplay = document.getElementById("live-score-display");

const ratingCategories = document.getElementById("rating-categories");

const submitMsg = document.getElementById("submit-msg");
const submitMsgMsg = submitMsg.querySelector("p");
const submitMsgBar = submitMsg.querySelector(".progress-bar");

const categoryRadios = Array.from(
  ratingCategories.querySelectorAll('input[name="category"]'),
);

loadBadges();

modal.addEventListener("click", (e) => {
  if (e.target === modal) {
    modal.close();
  }
});

btnModalOpen.addEventListener("click", () => {
  modal.showModal();
});

btnModalClose.addEventListener("click", () => {
  modal.close();
});

ratingForm.addEventListener("submit", (e) => {
  e.preventDefault();

  modal.close();
  if (submitRating()) {
    showSubmitMsg("Avaliação enviada com sucesso!", "success");
  } else {
    showSubmitMsg("Avaliação não registrada. Nenhum campo foi preenchido.", "warning");
  }
  loadStats(gameItem);
  loadComments(gameItem);
  showBadges();
  ratingForm.reset();

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});

btnPrevious.addEventListener("click", () => {
  moveStep(-1);
});

btnNext.addEventListener("click", () => {
  moveStep(1);
});

ratingCategories.addEventListener("change", () => {
  btnPrevious.disabled = categoryRadios[0].checked;
});

ratingForm.addEventListener("change", showLiveScore);

document.addEventListener("click", (e) => {
  if (submitMsg.classList.contains("visible") && !submitMsg.contains(e.target)) {
    hideSubmitMsg();
  }
});

async function loadBadges() {
  try {
    const badges = await getBadgeCatalog();

    badgeFieldset.replaceChildren();

    badges.forEach((badge) => {
      const label = document.createElement("label");
      label.className = "modal-badge";

      const badgeId = document.createElement("div");
      badgeId.className = "modal-badge__id";

      const iconContainer = document.createElement("div");
      iconContainer.className = "modal-badge__icon";
      iconContainer.setAttribute("aria-hidden", "true");

      iconContainer.appendChild(createIcon(badge.icon));

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
  gameItem = getGameItem(gameId);

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

  const isEmpty = (obj) =>
    Object.entries(obj)
      .filter(([key]) => key !== "timestamp")
      .every(
        ([, value]) =>
          value === "" || value == null || (Array.isArray(value) && value.length === 0),
      );

  if (isEmpty(formVals)) {
    console.log("Avaliação vazia");
    return false;
  }

  if (gameItem) {
    gameItem.numRatings++;

    if (formVals.comment.trim() !== "") {
      gameItem.numComments++;
      gameItem.comments.push({
        text: formVals.comment,
        timestamp: formVals.timestamp,
      });
    }

    for (const criteria of Object.values(gameItem.criteria)) {
      for (const [criterion, stats] of Object.entries(criteria)) {
        const value = formVals[criterion];

        if (value !== null && value.trim() !== "") {
          stats.sum += Number(value);
          stats.count++;
        }
      }
    }

    for (const badge of formVals.badges) {
      gameItem.badges[badge] = (gameItem.badges[badge] ?? 0) + 1;
    }

    localStorage.setItem(gameId, JSON.stringify(gameItem));
  } else {
    localStorage.setItem(gameId, JSON.stringify(generateStats(formVals)));
  }
  gameItem = getGameItem(gameId);

  return true;
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

function moveStep(direction) {
    const currentStep = categoryRadios.findIndex(radio => radio.checked);
    const targetStep = currentStep + direction;

    if (targetStep < 0 || targetStep >= categoryRadios.length) {
        return;
    }

    categoryRadios[targetStep].checked = true;

    btnPrevious.disabled = targetStep === 0;
}

function showLiveScore() {
  const formData = new FormData(ratingForm);

  const scores = {
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
  };

  const values = Object.values(scores)
    .filter((value) => value !== "" && value != null)
    .map(Number);

  const average = values.length
    ? values.reduce((sum, v) => sum + v, 0) / values.length
    : 0;

  liveScore.style.setProperty("--score-val", average);
  liveScoreNum.textContent = average ? Math.round(average * 10) / 10 : "-.-";

  if (average >= 4) {
    liveScore.dataset.lvl = "high";
    liveScoreDisplay.dataset.lvl = "high";
  } else if (average >= 2.5) {
    liveScore.dataset.lvl = "medium";
    liveScoreDisplay.dataset.lvl = "medium";
  } else {
    liveScore.dataset.lvl = "low";
    liveScoreDisplay.dataset.lvl = average ? "low" : "none";
  }
}

function showSubmitMsg(msg, style) {
  submitMsgMsg.textContent = msg;
  submitMsg.classList.add("shown");
  submitMsg.classList.add(style);

  if (style === "warning") {
    submitMsg.role = "alert";
  } else {
    submitMsg.role = "status";
  }

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      submitMsg.classList.add("visible");
    });
  });

  submitMsgBar.addEventListener("animationend", function handler() {
    hideSubmitMsg();
    submitMsg.removeEventListener("animationend", handler);
  });
}

function hideSubmitMsg() {
  submitMsg.classList.remove("visible");
  submitMsg.addEventListener("transitionend", function handler() {
    submitMsg.classList.remove("shown");
    submitMsgMsg.textContent = "";
    submitMsg.className = "";
    submitMsg.removeEventListener("transitionend", handler);
  });
}
