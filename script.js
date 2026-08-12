let allCartoons = [];
let currentSort = "video-desc"; // état par défaut : groupé par vidéo, épisode le plus récent en premier
let currentDecade = null; // ex. 2000, 2010... null = toutes
let currentModalList = [];
let currentModalIndex = -1;
let isMuted = true; // les vidéos démarrent toujours en muet sur mobile (contrainte des navigateurs)

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + ":" + String(s).padStart(2, "0");
}

function decadeOf(year) {
  return Math.floor(year / 10) * 10;
}

function getFilteredSorted() {
  const q = document.getElementById("search").value.trim().toLowerCase();
  let list = allCartoons.filter((c) => c.name.toLowerCase().includes(q));

  if (currentDecade !== null) {
    list = list.filter((c) => c.releaseYear && decadeOf(c.releaseYear) === currentDecade);
  }

  if (currentSort === "year-desc") {
    list = list.slice().sort((a, b) => (b.releaseYear || 0) - (a.releaseYear || 0) || (a._order - b._order));
  } else if (currentSort === "year-asc") {
    list = list.slice().sort((a, b) => (a.releaseYear || 0) - (b.releaseYear || 0) || (a._order - b._order));
  } else {
    // video-desc (par défaut) : trie par numéro d'épisode (le plus récent en premier),
    // en gardant l'ordre d'apparition des dessins animés à l'intérieur d'une même vidéo.
    list = list.slice().sort((a, b) => ((b.episode || 0) - (a.episode || 0)) || (a._order - b._order));
  }

  return list;
}

function renderDecadeFilter() {
  const container = document.getElementById("decade-filter");
  const decades = Array.from(
    new Set(allCartoons.filter((c) => c.releaseYear).map((c) => decadeOf(c.releaseYear)))
  ).sort((a, b) => a - b);

  container.innerHTML = "";

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = "decade-btn";
  allBtn.textContent = "Toutes les années";
  allBtn.dataset.decade = "";
  container.appendChild(allBtn);

  decades.forEach((decade) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "decade-btn";
    btn.textContent = decade + "s";
    btn.dataset.decade = String(decade);
    container.appendChild(btn);
  });

  updateDecadeButtons();

  container.querySelectorAll(".decade-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      currentDecade = btn.dataset.decade === "" ? null : Number(btn.dataset.decade);
      updateDecadeButtons();
      renderGrid();
    });
  });
}

function updateDecadeButtons() {
  document.querySelectorAll(".decade-btn").forEach((btn) => {
    const isAll = btn.dataset.decade === "";
    const isActive = isAll ? currentDecade === null : Number(btn.dataset.decade) === currentDecade;
    btn.classList.toggle("active", isActive);
  });
}

function renderGrid() {
  const list = getFilteredSorted();
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");

  grid.innerHTML = "";

  if (list.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  list.forEach((item, index) => {
    const card = document.createElement("button");
    card.className = "cartoon-card";
    card.type = "button";

    const thumbWrap = document.createElement("div");
    thumbWrap.className = "thumb-wrap";

    const bg = document.createElement("div");
    bg.className = "thumb-bg";
    bg.style.backgroundImage = "url(\"" + item.image + "\")";

    const img = document.createElement("img");
    img.className = "thumb";
    img.src = item.image;
    img.alt = item.name;
    img.loading = "lazy";

    thumbWrap.appendChild(bg);
    thumbWrap.appendChild(img);

    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = '<p class="card-name"></p><p class="card-meta"></p>';
    body.querySelector(".card-name").textContent = item.name;
    body.querySelector(".card-meta").textContent = item.releaseYear ? String(item.releaseYear) : "";

    card.appendChild(thumbWrap);
    card.appendChild(body);
    card.addEventListener("click", () => openModal(list, index));

    // Effet de survol : la carte grossit et s'illumine.
    card.addEventListener("mouseenter", () => card.classList.add("hovered"));
    card.addEventListener("mouseleave", () => card.classList.remove("hovered"));

    grid.appendChild(card);
  });
}

function openModal(list, index) {
  currentModalList = list;
  currentModalIndex = index;
  loadModalItem();
  document.getElementById("modal").hidden = false;
  lockBodyScroll();
}

function loadModalItem() {
  const item = currentModalList[currentModalIndex];
  document.getElementById("modal-title").textContent = item.name;
  document.getElementById("modal-meta").textContent =
    "Évoqué dans \u00AB " + item.videoTitle + " \u00BB à " + formatTime(item.timestamp);
  document.getElementById("yt-frame").src =
    "https://www.youtube.com/embed/" + item.videoId + "?start=" + item.timestamp +
    "&autoplay=1&mute=1&playsinline=1&enablejsapi=1";
  isMuted = true;
  document.getElementById("modal-bg").style.backgroundImage =
    "url(\"https://img.youtube.com/vi/" + item.videoId + "/hqdefault.jpg\")";
  document.getElementById("modal-prev").disabled = currentModalIndex <= 0;
  document.getElementById("modal-next").disabled = currentModalIndex >= currentModalList.length - 1;
}

function showPrevInModal() {
  if (currentModalIndex > 0) {
    currentModalIndex -= 1;
    loadModalItem();
  }
}

function showNextInModal() {
  if (currentModalIndex < currentModalList.length - 1) {
    currentModalIndex += 1;
    loadModalItem();
  }
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.hidden = true;
  document.getElementById("yt-frame").src = "";
  unlockBodyScroll();
}

// Empêche la page principale de défiler/rebondir (effet "rubber-band" mobile) pendant
// que la fenêtre de prévisualisation est ouverte — c'est ce qui la faisait apparaître
// furtivement derrière la vidéo pendant un swipe.
let lockedScrollY = 0;

function lockBodyScroll() {
  lockedScrollY = window.scrollY;
  document.body.style.position = "fixed";
  document.body.style.top = "-" + lockedScrollY + "px";
  document.body.style.width = "100%";
}

function unlockBodyScroll() {
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  window.scrollTo(0, lockedScrollY);
}

document.getElementById("modal-prev").addEventListener("click", showPrevInModal);
document.getElementById("modal-next").addEventListener("click", showNextInModal);

let wheelLocked = false;
document.getElementById("modal").addEventListener("wheel", (e) => {
  e.preventDefault();
  if (wheelLocked) return;
  wheelLocked = true;
  setTimeout(() => { wheelLocked = false; }, 400);
  if (e.deltaY > 0) {
    showNextInModal();
  } else if (e.deltaY < 0) {
    showPrevInModal();
  }
}, { passive: false });

// Navigation au swipe vertical (mobile) : la vidéo suit le doigt en temps réel,
// puis "s'aimante" vers le suivant/précédent si le glissement est assez ample,
// ou revient à sa place sinon (comme sur TikTok). Un tap simple (peu de mouvement)
// coupe/réactive le son via l'API YouTube, puisqu'on ne peut plus taper directement
// sur les boutons du lecteur (la couche transparente les recouvre).
const modalCard = document.querySelector(".modal-card");
const touchCatcher = document.getElementById("touch-catcher");
let touchStartY = null;
let touchDeltaY = 0;

touchCatcher.addEventListener("touchstart", (e) => {
  touchStartY = e.touches[0].clientY;
  touchDeltaY = 0;
  modalCard.style.transition = "none";
}, { passive: true });

touchCatcher.addEventListener("touchmove", (e) => {
  if (touchStartY === null) return;
  e.preventDefault();
  touchDeltaY = e.touches[0].clientY - touchStartY;
  modalCard.style.transform = "translateY(" + touchDeltaY + "px)";
}, { passive: false });

touchCatcher.addEventListener("touchend", () => {
  if (touchStartY === null) return;
  touchStartY = null;
  modalCard.style.transition = "transform 0.25s ease";

  const tapThreshold = 10; // en dessous de ça, on considère que c'est un tap, pas un swipe
  const swipeThreshold = 90; // pixels à glisser avant que ça compte comme un swipe volontaire

  if (Math.abs(touchDeltaY) < tapThreshold) {
    modalCard.style.transform = "translateY(0)";
    toggleMute();
    return;
  }

  const goingUp = touchDeltaY < 0; // glisser vers le haut = dessin animé suivant

  if (Math.abs(touchDeltaY) > swipeThreshold) {
    const canMove = goingUp
      ? currentModalIndex < currentModalList.length - 1
      : currentModalIndex > 0;

    if (canMove) {
      // termine l'animation de sortie dans la direction du geste, puis change de contenu
      modalCard.style.transform = "translateY(" + (goingUp ? "-100%" : "100%") + ")";
      setTimeout(() => {
        goingUp ? showNextInModal() : showPrevInModal();
        modalCard.style.transition = "none";
        modalCard.style.transform = "translateY(" + (goingUp ? "100%" : "-100%") + ")";
        requestAnimationFrame(() => {
          modalCard.style.transition = "transform 0.25s ease";
          modalCard.style.transform = "translateY(0)";
        });
      }, 200);
      return;
    }
  }

  // pas assez de glissement (ou plus rien à afficher dans cette direction) : ça revient à sa place
  modalCard.style.transform = "translateY(0)";
});

function toggleMute() {
  const frame = document.getElementById("yt-frame");
  if (!frame.contentWindow) return;
  isMuted = !isMuted;
  frame.contentWindow.postMessage(
    JSON.stringify({ event: "command", func: isMuted ? "mute" : "unMute", args: [] }),
    "*"
  );
}

document.getElementById("close-modal").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});
document.addEventListener("keydown", (e) => {
  const modal = document.getElementById("modal");
  if (modal.hidden) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowDown") showNextInModal();
  if (e.key === "ArrowUp") showPrevInModal();
});

document.getElementById("search").addEventListener("input", renderGrid);
document.getElementById("sort").addEventListener("change", (e) => {
  currentSort = e.target.value;
  renderGrid();
});

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    allCartoons = data.map((item, index) => Object.assign({ _order: index }, item));
    renderDecadeFilter();
    renderGrid();
  })
  .catch(() => {
    document.getElementById("grid").innerHTML =
      '<p style="color:#ff6b6b">Impossible de charger data.json. Vérifie que le fichier est bien dans le même dossier.</p>';
  });
