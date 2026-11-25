export function createPortalSearch({
  data,
  state,
  chatForm,
  chatInput,
  chatFeedback,
  instantResults,
  shortcutBtns,
  signal,
  escapeHtml,
  setActiveView,
  openResourceModal,
  openVideoModal,
  openArticleModal
}) {
  function runPortalSearch(rawQuery) {
    const query = rawQuery.trim().toLowerCase();
    state.searchQuery = query;

    if (!query) {
      instantResults.hidden = true;
      chatFeedback.textContent = "Siap menelusuri";
      shortcutBtns.forEach((button) => button.classList.remove("is-selected"));
      return;
    }

    const matches = [];

    data.resources.forEach((resource) => {
      if (
        resource.title.toLowerCase().includes(query) ||
        resource.category.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query)
      ) {
        matches.push({ type: "Resource", item: resource, sub: resource.category });
      }
    });

    data.knowledges.forEach((video) => {
      if (
        video.title.toLowerCase().includes(query) ||
        video.level.toLowerCase().includes(query) ||
        video.summary.toLowerCase().includes(query)
      ) {
        matches.push({ type: "Video", item: video, sub: `${video.duration} • ${video.series}` });
      }
    });

    data.articles.forEach((article) => {
      if (
        article.title.toLowerCase().includes(query) ||
        article.excerpt.toLowerCase().includes(query) ||
        article.tags.some((tag) => tag.toLowerCase().includes(query))
      ) {
        matches.push({ type: "Article", item: article, sub: article.tags.join(", ") });
      }
    });

    chatFeedback.textContent = `${matches.length} materi ditemukan`;

    if (state.activeTab !== "home") setActiveView("home", { skipScroll: true });

    instantResults.hidden = false;
    if (matches.length === 0) {
      instantResults.innerHTML = `
        <div class="instant-header">
          <span>Hasil untuk "${escapeHtml(rawQuery)}"</span>
          <button type="button" class="instant-clear" id="clearSearchBtn">Reset</button>
        </div>
        <p style="padding:0.65rem 0.5rem;font-size:0.88rem;color:var(--text-secondary);">
          Belum ada materi yang cocok dengan kata kunci tersebut. Coba pilih salah satu topik kapsul di atas.
        </p>
      `;
    } else {
      instantResults.innerHTML = `
        <div class="instant-header">
          <span>${matches.length} materi relevan untuk "${escapeHtml(rawQuery)}"</span>
          <button type="button" class="instant-clear" id="clearSearchBtn">Tutup</button>
        </div>
        ${matches
          .slice(0, 6)
          .map(
            (match, index) => `
          <button type="button" class="instant-item" data-match-idx="${index}">
            <div>
              <span class="instant-item-title">${escapeHtml(match.item.title)}</span>
              <span class="instant-item-sub">${escapeHtml(match.sub)}</span>
            </div>
            <span class="instant-type">${match.type}</span>
          </button>
        `
          )
          .join("")}
      `;

      instantResults.querySelectorAll(".instant-item").forEach((element) => {
        element.addEventListener("click", () => {
          const picked = matches[Number(element.dataset.matchIdx)];
          if (!picked) return;
          if (picked.type === "Resource") openResourceModal(picked.item);
          if (picked.type === "Video") openVideoModal(picked.item);
          if (picked.type === "Article") openArticleModal(picked.item);
        });
      });
    }

    const clearButton = document.getElementById("clearSearchBtn");
    if (clearButton) {
      clearButton.addEventListener("click", () => {
        chatInput.value = "";
        runPortalSearch("");
      });
    }
  }

  shortcutBtns.forEach((button) => {
    button.addEventListener(
      "click",
      () => {
        const topic = button.dataset.shortcut;
        shortcutBtns.forEach((shortcut) => shortcut.classList.toggle("is-selected", shortcut === button));
        chatInput.value = topic;
        chatFeedback.textContent = `Filter: ${topic}`;
        runPortalSearch(topic);
      },
      { signal }
    );
  });

  chatInput.addEventListener("input", (event) => runPortalSearch(event.target.value), { signal });
  chatForm.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      runPortalSearch(chatInput.value);
    },
    { signal }
  );

  return { runPortalSearch };
}
