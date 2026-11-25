import { buildCustomThumbSVG, escapeHtml } from "./content-utils.js";

export function createModals({
  data,
  state,
  modal,
  modalCloseBtn,
  modalShareBtn,
  modalBadge,
  modalTitle,
  modalMeta,
  modalBody,
  modalFooter,
  signal,
  syncUrlHash,
  getShareableUrl,
  showToast
}) {
  let videoSimTimer = null;

  function openResourceModal(item, skipHistory = false) {
    clearInterval(videoSimTimer);
    if (!skipHistory) syncUrlHash(`#item/${item.id}`);
    modalBadge.textContent = item.category;
    modalTitle.textContent = item.title;
    modalMeta.textContent = `Tingkat: ${item.level} • Resource Siap Pakai`;
    modalBody.innerHTML = `
      <p>${escapeHtml(item.summary)}</p>
      <div class="code-snippet">${escapeHtml(item.template)}</div>
    `;
    modalFooter.innerHTML = `
      <button type="button" class="btn-primary" id="copyTemplateBtn">Salin Templat</button>
    `;
    document.getElementById("copyTemplateBtn").addEventListener("click", () => {
      navigator.clipboard?.writeText(item.template);
      showToast("Templat berhasil disalin ke clipboard");
    });
    openModal();
  }

  function parseDurationToSec(duration) {
    const [minutes, seconds] = duration.split(":").map(Number);
    return (minutes || 0) * 60 + (seconds || 0);
  }

  function formatSecToTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainder = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
  }

  function openVideoModal(video, skipHistory = false) {
    clearInterval(videoSimTimer);
    if (!skipHistory) syncUrlHash(`#item/${video.id}`);
    const totalSec = parseDurationToSec(video.duration);
    let currentSec = 0;
    let isPlaying = true;
    let useYoutube = false;
    const videoIndex = data.knowledges.findIndex((item) => item.id === video.id);

    modalBadge.textContent = video.series;
    modalTitle.textContent = video.title;
    modalMeta.textContent = `Durasi: ${video.duration} • Topik: ${video.level}`;
    modalBody.innerHTML = `
      <div class="video-mode-bar">
        <span id="videoModeLabel">Mode: Pemutar Interaktif Per Bab</span>
        <div class="video-mode-actions">
          <a class="yt-external-link" id="ytExternalLink" href="https://www.youtube.com/watch?v=${encodeURIComponent(video.youtubeId)}" target="_blank" rel="noopener noreferrer">Buka di YouTube &nearr;</a>
          <button type="button" class="video-mode-toggle" id="toggleVideoModeBtn">Beralih ke Embed YouTube</button>
        </div>
      </div>

      <div class="video-player-shell" id="videoPlayerShell"></div>

      <p>${escapeHtml(video.summary)}</p>
      <p style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;">Daftar Bab Materi (Klik untuk lompat)</p>
      <ul class="chapter-list" id="modalChapterList">
        ${video.chapters
          .map(
            (chapter, index) => `
          <li>
            <button type="button" class="chapter-item-btn ${index === 0 ? "is-playing-chapter" : ""}" data-sec="${chapter.seconds}" data-ch-idx="${index}">
              <strong>${escapeHtml(chapter.label)}</strong>
              <span>${escapeHtml(chapter.time)}</span>
            </button>
          </li>
        `
          )
          .join("")}
      </ul>
    `;

    modalFooter.innerHTML = "";

    const playerShell = document.getElementById("videoPlayerShell");
    const modeLabel = document.getElementById("videoModeLabel");
    const toggleModeButton = document.getElementById("toggleVideoModeBtn");
    const youtubeLink = document.getElementById("ytExternalLink");
    const chapterButtons = Array.from(document.querySelectorAll(".chapter-item-btn"));

    const pauseSvg = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
    const playSvg = `<polygon points="6 4 20 12 6 20 6 4"/>`;

    function highlightChapterBySec(seconds) {
      let activeChapterIndex = 0;
      video.chapters.forEach((chapter, index) => {
        if (seconds >= chapter.seconds) activeChapterIndex = index;
      });
      chapterButtons.forEach((button, index) =>
        button.classList.toggle("is-playing-chapter", index === activeChapterIndex)
      );
      youtubeLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(video.youtubeId)}&t=${Math.floor(seconds)}s`;
      return activeChapterIndex;
    }

    function renderPlayerShell(startSec = 0) {
      clearInterval(videoSimTimer);
      currentSec = startSec;
      highlightChapterBySec(currentSec);

      if (useYoutube) {
        modeLabel.textContent = "Mode: Embed Video YouTube";
        toggleModeButton.textContent = "Kembali ke Pemutar Bab";
        playerShell.innerHTML = `
          <iframe
            src="https://www.youtube.com/embed/${encodeURIComponent(video.youtubeId)}?start=${Math.floor(currentSec)}&rel=0&playsinline=1"
            title="${escapeHtml(video.title)}"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        `;
        return;
      }

      modeLabel.textContent = "Mode: Pemutar Interaktif Per Bab";
      toggleModeButton.textContent = "Beralih ke Embed YouTube";
      playerShell.innerHTML = `
        <div class="video-screen-visual">
          ${buildCustomThumbSVG(video.palette, Math.max(0, videoIndex), "bg-art")}
          <div class="video-center-control">
            <button type="button" class="video-big-play" id="vidBigPlayBtn" aria-label="Jeda atau putar video">
              <svg id="vidBigIcon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">${pauseSvg}</svg>
            </button>
            <div class="video-active-caption" id="vidActiveCaption">${escapeHtml(video.chapters[0].label)}</div>
          </div>
        </div>
        <div class="video-controls-bar">
          <button type="button" class="vid-mini-btn" id="vidMiniPlayBtn" aria-label="Play atau Pause">
            <svg id="vidMiniIcon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">${pauseSvg}</svg>
          </button>
          <div class="vid-progress-track" id="vidProgressTrack" role="slider" aria-label="Progres video" aria-valuemin="0" aria-valuemax="${totalSec}" aria-valuenow="0" tabindex="0">
            <div class="vid-progress-fill" id="vidProgressFill"></div>
          </div>
          <span class="vid-timecode" id="vidTimecode">00:00 / ${escapeHtml(video.duration)}</span>
        </div>
      `;

      const bigPlayButton = document.getElementById("vidBigPlayBtn");
      const miniPlayButton = document.getElementById("vidMiniPlayBtn");
      const bigIcon = document.getElementById("vidBigIcon");
      const miniIcon = document.getElementById("vidMiniIcon");
      const progressTrack = document.getElementById("vidProgressTrack");
      const progressFill = document.getElementById("vidProgressFill");
      const timecode = document.getElementById("vidTimecode");
      const caption = document.getElementById("vidActiveCaption");

      function syncSimUI() {
        const percentage = Math.min(100, (currentSec / totalSec) * 100);
        progressFill.style.inlineSize = `${percentage}%`;
        progressTrack.setAttribute("aria-valuenow", String(Math.floor(currentSec)));
        timecode.textContent = `${formatSecToTime(currentSec)} / ${video.duration}`;

        const activeChapterIndex = highlightChapterBySec(currentSec);
        caption.textContent = video.chapters[activeChapterIndex].label;
        bigIcon.innerHTML = isPlaying ? pauseSvg : playSvg;
        miniIcon.innerHTML = isPlaying ? pauseSvg : playSvg;
      }

      function togglePlay() {
        isPlaying = !isPlaying;
        syncSimUI();
      }

      bigPlayButton.addEventListener("click", togglePlay);
      miniPlayButton.addEventListener("click", togglePlay);

      progressTrack.addEventListener("click", (event) => {
        const rect = progressTrack.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
        currentSec = Math.floor(ratio * totalSec);
        isPlaying = true;
        syncSimUI();
      });

      syncSimUI();
      videoSimTimer = setInterval(() => {
        if (!isPlaying) return;
        currentSec += 1;
        if (currentSec >= totalSec) {
          currentSec = 0;
          isPlaying = false;
        }
        syncSimUI();
      }, 1000);
    }

    toggleModeButton.addEventListener("click", () => {
      useYoutube = !useYoutube;
      renderPlayerShell(currentSec);
    });

    chapterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const targetSeconds = Number(button.dataset.sec) || 0;
        isPlaying = true;
        renderPlayerShell(targetSeconds);
      });
    });

    renderPlayerShell(0);
    openModal();
  }

  function openArticleModal(article, skipHistory = false) {
    clearInterval(videoSimTimer);
    if (!skipHistory) syncUrlHash(`#item/${article.id}`);
    modalBadge.textContent = article.tags.map((tag) => "#" + tag).join("  ");
    modalTitle.textContent = article.title;
    modalMeta.textContent = `${article.date} • ${article.readTime}`;
    modalBody.innerHTML = article.content.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("");
    modalFooter.innerHTML = `
      <button type="button" class="btn-primary" id="doneReadingBtn">Selesai Membaca</button>
    `;
    document.getElementById("doneReadingBtn").addEventListener("click", () => closeModal());
    openModal();
  }

  function openModal() {
    if (!modal.open) modal.showModal();
    modalCloseBtn.focus();
  }

  function closeModal(skipHistory = false) {
    clearInterval(videoSimTimer);
    if (modal.open) modal.close();
    if (!skipHistory) syncUrlHash(`#${state.activeTab}`);
  }

  modalShareBtn.addEventListener(
    "click",
    () => {
      navigator.clipboard?.writeText(getShareableUrl());
      showToast("Tautan materi disalin ke clipboard");
    },
    { signal }
  );
  modalCloseBtn.addEventListener("click", () => closeModal(), { signal });
  modal.addEventListener(
    "click",
    (event) => {
      if (event.target === modal) closeModal();
    },
    { signal }
  );
  modal.addEventListener("close", () => clearInterval(videoSimTimer), { signal });

  return { closeModal, openArticleModal, openResourceModal, openVideoModal };
}
