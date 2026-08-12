let allCartoons = [];
let currentSort = "video-desc"; // état par défaut : groupé par vidéo, épisode le plus récent en premier
let currentDecade = null; // ex. 2000, 2010... null = toutes
let currentModalList = [];
let currentModalIndex = -1;

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
}

function loadModalItem() {
  const item = currentModalList[currentModalIndex];
  document.getElementById("modal-title").textContent = item.name;
  document.getElementById("modal-meta").textContent =
    "Évoqué dans \u00AB " + item.videoTitle + " \u00BB à " + formatTime(item.timestamp);
  document.getElementById("yt-frame").src =
    "https://www.youtube.com/embed/" + item.videoId + "?start=" + item.timestamp + "&autoplay=1";
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

// Navigation au swipe vertical (mobile) : équivalent tactile de la molette.
let touchStartY = null;
document.getElementById("modal").addEventListener("touchstart", (e) => {
  touchStartY = e.touches[0].clientY;
});
document.getElementById("modal").addEventListener("touchend", (e) => {
  if (touchStartY === null) return;
  const deltaY = e.changedTouches[0].clientY - touchStartY;
  touchStartY = null;
  if (Math.abs(deltaY) < 50) return; // ignore les petits mouvements (tap, léger tremblement)
  if (deltaY < 0) {
    showNextInModal();
  } else {
    showPrevInModal();
  }
});

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
