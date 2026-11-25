import { validatePortalData } from "./content-schema.mjs";
import { buildCustomThumbSVG, escapeHtml } from "./modules/content-utils.js";
import { createPortalHistory } from "./modules/history.js";
import { createEffects } from "./modules/effects.js";
import { createModals } from "./modules/modals.js";
import { createNavigation } from "./modules/navigation.js";
import { createPortalSearch } from "./modules/search.js";

async function loadPortalData() {
  const collections = ["resources", "knowledges", "articles"];
  const data = await Promise.all(
    collections.map(async (collection) => {
      const response = await fetch(new URL(`content/${collection}.json`, document.baseURI));
      if (!response.ok) {
        throw new Error(`content/${collection}.json returned ${response.status}`);
      }

      const items = await response.json();
      if (!Array.isArray(items)) {
        throw new TypeError(`content/${collection}.json must contain an array`);
      }
      return [collection, items];
    })
  );
  const portalData = Object.fromEntries(data);
  const validationErrors = validatePortalData(portalData);
  if (validationErrors.length > 0) {
    throw new Error(`Content validation failed:\n${validationErrors.join("\n")}`);
  }
  return portalData;
}

const animationReady = new Promise((resolve) => {
  document.addEventListener("portal-animations-ready", ({ detail }) => resolve(detail), { once: true });
});

(async function () {
  let PORTAL_DATA;
  try {
    PORTAL_DATA = await loadPortalData();
  } catch (error) {
    const appError = document.getElementById("appError");
    appError.hidden = false;
    appError.textContent =
      "Konten portal gagal dimuat atau formatnya tidak valid. Periksa file JSON di folder content dan jalankan validasi sebelum menerbitkan.";
    console.error("Gagal memuat atau memvalidasi konten portal:", error);
    return;
  }

  const controller = new AbortController();
  const { signal } = controller;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const isSandboxed = (() => {
    try {
      return window.location.protocol === "about:" || window.location.href.startsWith("about:");
    } catch {
      return true;
    }
  })();

  const state = {
    activeTab: "home",
    resourceFilter: "Semua",
    videoFilter: "Semua",
    articleTag: "Semua",
    searchQuery: "",
    currentDeepHash: "#home"
  };

  const topbar = document.getElementById("topbar");
  const heroView = document.getElementById("heroView");
  const heroTabs = Array.from(document.querySelectorAll(".hero-tab"));
  const topTabs = Array.from(document.querySelectorAll(".nav-tab"));
  const heroTabLine = document.getElementById("heroTabLine");
  const topNavIndicator = document.getElementById("topNavIndicator");

  const subViews = {
    resources: document.getElementById("view-resources"),
    knowledges: document.getElementById("view-knowledges"),
    articles: document.getElementById("view-articles")
  };

  const shortcutBtns = Array.from(document.querySelectorAll(".capsule-btn"));
  const chatForm = document.getElementById("portalChatForm");
  const chatInput = document.getElementById("portalChatInput");
  const chatFeedback = document.getElementById("chatFeedback");
  const instantResults = document.getElementById("instantResults");

  const modal = document.getElementById("detailModal");
  const modalCloseBtn = document.getElementById("modalCloseBtn");
  const modalShareBtn = document.getElementById("modalShareBtn");
  const modalBadge = document.getElementById("modalBadge");
  const modalTitle = document.getElementById("modalTitle");
  const modalMeta = document.getElementById("modalMeta");
  const modalBody = document.getElementById("modalBody");
  const modalFooter = document.getElementById("modalFooter");
  const toastEl = document.getElementById("toast");

  let toastTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-shown"), 2600);
  }

  const { syncUrlHash, getShareableUrl } = createPortalHistory(state, isSandboxed);
  const effects = createEffects({
    state,
    heroView,
    subViews,
    heroTabs,
    topTabs,
    topNavIndicator,
    prefersReducedMotion,
    signal
  });
  const modals = createModals({
    data: PORTAL_DATA,
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
  });
  const navigation = createNavigation({
    data: PORTAL_DATA,
    state,
    topbar,
    heroView,
    heroTabs,
    topTabs,
    heroTabLine,
    topNavIndicator,
    subViews,
    instantResults,
    chatInput,
    modal,
    signal,
    isSandboxed,
    syncUrlHash,
    effects,
    closeModal: modals.closeModal,
    openResourceModal: modals.openResourceModal,
    openVideoModal: modals.openVideoModal,
    openArticleModal: modals.openArticleModal
  });
  createPortalSearch({
    data: PORTAL_DATA,
    state,
    chatForm,
    chatInput,
    chatFeedback,
    instantResults,
    shortcutBtns,
    signal,
    escapeHtml,
    setActiveView: navigation.setActiveView,
    openResourceModal: modals.openResourceModal,
    openVideoModal: modals.openVideoModal,
    openArticleModal: modals.openArticleModal
  });

  function renderResources() {
    const categories = ["Semua", ...new Set(PORTAL_DATA.resources.map((r) => r.category))];
    const filterContainer = document.getElementById("resourceFilters");
    filterContainer.innerHTML = categories
      .map(
        (cat) => `
        <button type="button" class="filter-chip ${state.resourceFilter === cat ? "is-active" : ""}" data-cat="${escapeHtml(cat)}">
          ${escapeHtml(cat)}
        </button>
      `
      )
      .join("");

    filterContainer.querySelectorAll(".filter-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.resourceFilter = btn.dataset.cat;
        renderResources();
      });
    });

    const filtered =
      state.resourceFilter === "Semua"
        ? PORTAL_DATA.resources
        : PORTAL_DATA.resources.filter((r) => r.category === state.resourceFilter);

    const grid = document.getElementById("resourcesGrid");
    grid.innerHTML = filtered
      .map(
        (item) => `
        <button type="button" class="resource-card" data-res-id="${item.id}">
          <div>
            <div class="resource-top">
              <span class="resource-cat">${escapeHtml(item.category)}</span>
              <span class="resource-level">${escapeHtml(item.level)}</span>
            </div>
            <h3 class="resource-title">${escapeHtml(item.title)}</h3>
            <p class="resource-desc">${escapeHtml(item.description)}</p>
          </div>
          <div class="resource-foot">
            <span>Buka detail &amp; templat</span>
            <span aria-hidden="true">&rarr;</span>
          </div>
        </button>
      `
      )
      .join("");

    grid.querySelectorAll(".resource-card").forEach((card) => {
      card.addEventListener("click", () => {
        const found = PORTAL_DATA.resources.find((r) => r.id === card.dataset.resId);
        if (found) modals.openResourceModal(found);
      });
    });
    if (!grid.closest(".subpage-view").hidden) effects.animateStaggerItems(grid, ".resource-card");
    effects.bindMotionInteractions(grid.querySelectorAll(".resource-card"));
  }

  function renderVideos() {
    const topics = ["Semua", ...new Set(PORTAL_DATA.knowledges.map((v) => v.level))];
    const filterContainer = document.getElementById("videoFilters");
    filterContainer.innerHTML = topics
      .map(
        (topic) => `
        <button type="button" class="filter-chip ${state.videoFilter === topic ? "is-active" : ""}" data-topic="${escapeHtml(topic)}">
          ${escapeHtml(topic)}
        </button>
      `
      )
      .join("");

    filterContainer.querySelectorAll(".filter-chip").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.videoFilter = btn.dataset.topic;
        renderVideos();
      });
    });

    const filtered =
      state.videoFilter === "Semua"
        ? PORTAL_DATA.knowledges
        : PORTAL_DATA.knowledges.filter((v) => v.level === state.videoFilter);

    const grid = document.getElementById("videosGrid");
    grid.innerHTML = filtered
      .map(
        (vid, idx) => `
        <button type="button" class="video-card" data-vid-id="${vid.id}">
          <div class="video-thumb">
            ${buildCustomThumbSVG(vid.palette, idx)}
            <div class="video-play-badge">
              <span class="play-circle">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>
              </span>
            </div>
            <span class="video-duration">${escapeHtml(vid.duration)}</span>
          </div>
          <div class="video-info">
            <span class="video-series">${escapeHtml(vid.series)}</span>
            <h3 class="video-title">${escapeHtml(vid.title)}</h3>
            <p class="video-summary">${escapeHtml(vid.summary)}</p>
          </div>
        </button>
      `
      )
      .join("");

    grid.querySelectorAll(".video-card").forEach((card) => {
      card.addEventListener("click", () => {
        const found = PORTAL_DATA.knowledges.find((v) => v.id === card.dataset.vidId);
        if (found) modals.openVideoModal(found);
      });
    });
    if (!grid.closest(".subpage-view").hidden) effects.animateStaggerItems(grid, ".video-card");
  }

  function renderArticles() {
    const tagCounts = { Semua: PORTAL_DATA.articles.length };
    PORTAL_DATA.articles.forEach((art) => {
      art.tags.forEach((t) => {
        tagCounts[t] = (tagCounts[t] || 0) + 1;
      });
    });

    const tagCloud = document.getElementById("articleTagCloud");
    tagCloud.innerHTML = Object.entries(tagCounts)
      .map(
        ([tag, count]) => `
        <button type="button" class="tag-pill ${state.articleTag === tag ? "is-active" : ""}" data-tag="${escapeHtml(tag)}">
          <span>${tag === "Semua" ? "Semua Topik" : "#" + escapeHtml(tag)}</span>
          <span class="tag-num">${count}</span>
        </button>
      `
      )
      .join("");

    tagCloud.querySelectorAll(".tag-pill").forEach((pill) => {
      pill.addEventListener("click", () => {
        state.articleTag = pill.dataset.tag;
        renderArticles();
      });
    });

    const filtered =
      state.articleTag === "Semua"
        ? PORTAL_DATA.articles
        : PORTAL_DATA.articles.filter((a) => a.tags.includes(state.articleTag));

    document.getElementById("activeTagLabel").textContent =
      state.articleTag === "Semua"
        ? "Menampilkan seluruh arsip tulisan"
        : `Tag terpilih: #${state.articleTag}`;
    document.getElementById("articleCount").textContent = `${filtered.length} tulisan`;

    const list = document.getElementById("articlesList");
    list.innerHTML = filtered
      .map(
        (art) => `
        <button type="button" class="article-row" data-art-id="${art.id}">
          <div class="article-row-main">
            <div class="article-tags-inline">
              ${art.tags.map((t) => `<span class="article-tag-mini">#${escapeHtml(t)}</span>`).join("")}
            </div>
            <h3 class="article-title">${escapeHtml(art.title)}</h3>
            <p class="article-excerpt">${escapeHtml(art.excerpt)}</p>
          </div>
          <div class="article-meta-right">
            <span>${escapeHtml(art.readTime)}</span>
            <span>&bull;</span>
            <span>${escapeHtml(art.date)}</span>
          </div>
        </button>
      `
      )
      .join("");

    list.querySelectorAll(".article-row").forEach((row) => {
      row.addEventListener("click", () => {
        const found = PORTAL_DATA.articles.find((a) => a.id === row.dataset.artId);
        if (found) modals.openArticleModal(found);
      });
    });
    if (!list.closest(".subpage-view").hidden) effects.animateStaggerItems(list, ".article-row");
  }

  renderResources();
  renderVideos();
  renderArticles();
  effects.bindMotionInteractions(shortcutBtns);
  effects.bindMotionInteractions([document.querySelector(".chat-input-wrap")]);
  effects.initParticles();
  syncUrlHash("#home", true);

  animationReady.then((detail) => {
    effects.setAnimationModules(detail);
    effects.bindMotionInteractions(shortcutBtns);
    effects.bindMotionInteractions([document.querySelector(".chat-input-wrap")]);
    effects.bindMotionInteractions(document.querySelectorAll(".resource-card"));
    effects.animateViewItems(effects.getVisibleView());
  });
})();
