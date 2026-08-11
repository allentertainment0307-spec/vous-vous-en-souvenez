let allCartoons = [];

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m + ":" + String(s).padStart(2, "0");
}

function renderGrid(list) {
  const grid = document.getElementById("grid");
  const empty = document.getElementById("empty");
  const count = document.getElementById("count");

  grid.innerHTML = "";
  count.textContent = list.length + (list.length > 1 ? " dessins animés" : " dessin animé");

  if (list.length === 0) {
    empty.hidden = false;
    return;
  }
  empty.hidden = true;

  list.forEach((item) => {
    const card = document.createElement("button");
    card.className = "cartoon-card";
    card.type = "button";

    const img = document.createElement("img");
    img.className = "thumb";
    img.src = item.image;
    img.alt = item.name;
    img.loading = "lazy";

    const body = document.createElement("div");
    body.className = "card-body";
    body.innerHTML = '<p class="card-name"></p><p class="card-time"></p>';
    body.querySelector(".card-name").textContent = item.name;
    body.querySelector(".card-time").textContent = "\u25B6 " + formatTime(item.timestamp);

    card.appendChild(img);
    card.appendChild(body);
    card.addEventListener("click", () => openModal(item));
    grid.appendChild(card);
  });
}

function openModal(item) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-title").textContent = item.name;
  document.getElementById("modal-meta").textContent =
    "Évoqué dans \u00AB " + item.videoTitle + " \u00BB à " + formatTime(item.timestamp);
  document.getElementById("yt-frame").src =
    "https://www.youtube.com/embed/" + item.videoId + "?start=" + item.timestamp + "&autoplay=1";
  modal.hidden = false;
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.hidden = true;
  document.getElementById("yt-frame").src = "";
}

document.getElementById("close-modal").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", (e) => {
  if (e.target.id === "modal") closeModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

document.getElementById("search").addEventListener("input", (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = allCartoons.filter((c) => c.name.toLowerCase().includes(q));
  renderGrid(filtered);
});

fetch("data.json")
  .then((res) => res.json())
  .then((data) => {
    allCartoons = data;
    renderGrid(allCartoons);
  })
  .catch(() => {
    document.getElementById("grid").innerHTML =
      '<p style="color:#c0392b">Impossible de charger data.json. Vérifie que le fichier est bien dans le même dossier.</p>';
  });
