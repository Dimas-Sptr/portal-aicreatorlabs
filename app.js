(function () {
  const controller = new AbortController();
  const { signal } = controller;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let gsap = null;
  let Lenis = null;
  let motionAnimate = null;
  let motionHover = null;
  let motionPress = null;
  let lenis = null;
  let viewTransitionId = 0;
  let pendingView = null;

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
  let videoSimTimer = null;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-shown");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("is-shown"), 2600);
  }

  function syncUrlHash(hashValue, replace = false) {
    state.currentDeepHash = hashValue;
    if (isSandboxed) return;
    try {
      if (replace) {
        history.replaceState(null, "", hashValue);
      } else if (window.location.hash !== hashValue) {
        history.pushState(null, "", hashValue);
      }
    } catch {
      // Ignore history mutation errors in restricted iframe environments
    }
  }

  function getShareableUrl() {
    if (isSandboxed) return `https://aicreatorlabs.vercel.app/${state.currentDeepHash}`;
    try {
      const base = window.location.href.split("#")[0];
      return `${base}${state.currentDeepHash}`;
    } catch {
      return `https://aicreatorlabs.vercel.app/${state.currentDeepHash}`;
    }
  }

  function moveUnderline(tabs, lineEl, targetTabName) {
    if (!lineEl) return;
    if (!targetTabName || targetTabName === "home") {
      lineEl.classList.remove("is-visible");
      if (gsap && !prefersReducedMotion) {
        gsap.to(lineEl, { width: 0, autoAlpha: 0, duration: 0.18, ease: "power2.out", overwrite: true });
      } else {
        lineEl.style.inlineSize = "0px";
      }
      return;
    }
    const activeBtn = tabs.find((btn) => btn.dataset.tab === targetTabName);
    if (!activeBtn) return;
    lineEl.classList.add("is-visible");
    if (gsap && !prefersReducedMotion) {
      gsap.to(lineEl, {
        x: activeBtn.offsetLeft,
        width: activeBtn.offsetWidth,
        autoAlpha: 1,
        duration: 0.3,
        ease: "power3.out",
        overwrite: true
      });
    } else {
      lineEl.style.inlineSize = activeBtn.offsetWidth + "px";
      lineEl.style.transform = `translateX(${activeBtn.offsetLeft}px)`;
    }
  }

  function getVisibleView() {
    return [heroView, ...Object.values(subViews)].find((view) => !view.hidden);
  }

  function animateStaggerItems(container, selector) {
    if (!gsap || prefersReducedMotion || !container) return;
    const items = container.querySelectorAll(selector);
    if (!items.length) return;
    gsap.fromTo(
      items,
      { autoAlpha: 0, y: 14 },
      { autoAlpha: 1, y: 0, duration: 0.38, stagger: 0.055, ease: "power3.out", clearProps: "opacity,visibility,transform" }
    );
  }

  function animateViewItems(view) {
    if (view === subViews.resources) animateStaggerItems(view, ".resource-card");
    if (view === subViews.knowledges) animateStaggerItems(view, ".video-card");
    if (view === subViews.articles) animateStaggerItems(view, ".article-row");
  }

  function transitionView(outgoingView, incomingView) {
    const transitionId = ++viewTransitionId;
    if (pendingView) {
      gsap?.killTweensOf(pendingView);
      pendingView.hidden = true;
      if (gsap) gsap.set(pendingView, { clearProps: "opacity,visibility,transform" });
      pendingView = null;
    }

    const showIncomingView = () => {
      if (transitionId !== viewTransitionId) return;
      if (outgoingView) {
        outgoingView.hidden = true;
        if (gsap) gsap.set(outgoingView, { clearProps: "opacity,visibility,transform" });
      }
      incomingView.hidden = false;
      if (gsap && !prefersReducedMotion) {
        pendingView = incomingView;
        gsap.fromTo(
          incomingView,
          { autoAlpha: 0, y: 14 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.36,
            ease: "power3.out",
            onComplete: () => {
              if (transitionId !== viewTransitionId) return;
              gsap.set(incomingView, { clearProps: "opacity,visibility,transform" });
              pendingView = null;
            }
          }
        );
      }
      requestAnimationFrame(() => animateViewItems(incomingView));
    };

    if (outgoingView === incomingView) {
      incomingView.hidden = false;
      requestAnimationFrame(() => animateViewItems(incomingView));
      return;
    }

    if (gsap && outgoingView && !outgoingView.hidden && !prefersReducedMotion) {
      gsap.killTweensOf(outgoingView);
      gsap.to(outgoingView, {
        autoAlpha: 0,
        y: -10,
        duration: 0.14,
        ease: "power1.in",
        overwrite: true,
        onComplete: showIncomingView
      });
    } else {
      showIncomingView();
    }
  }

  function setActiveView(viewName, options = {}) {
    const outgoingView = getVisibleView();
    const incomingView = viewName === "home" ? heroView : subViews[viewName];
    if (!incomingView) return;
    state.activeTab = viewName;
    const isHome = viewName === "home";

    heroTabs.forEach((btn) => {
      const match = !isHome && btn.dataset.tab === viewName;
      btn.classList.toggle("is-active", match);
      if (match) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });

    topTabs.forEach((btn) => {
      const match = !isHome && btn.dataset.tab === viewName;
      btn.classList.toggle("is-active", match);
      if (match) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });

    if (isHome) {
      topbar.classList.remove("is-visible");
      moveUnderline(heroTabs, heroTabLine, null);
      if (!options.skipHistory) syncUrlHash("#home");
    } else {
      topbar.classList.add("is-visible");
      instantResults.hidden = true;
      requestAnimationFrame(() => {
        moveUnderline(topTabs, topNavIndicator, viewName);
      });
      if (!options.skipHistory) syncUrlHash(`#${viewName}`);
      if (!options.skipScroll) {
        scrollToTop();
      }
    }
    transitionView(outgoingView, incomingView);
  }

  function scrollToTop() {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }

  heroTabs.forEach((btn) => {
    btn.addEventListener("mouseenter", () => moveUnderline(heroTabs, heroTabLine, btn.dataset.tab), { signal });
    btn.addEventListener("focus", () => moveUnderline(heroTabs, heroTabLine, btn.dataset.tab), { signal });
    btn.addEventListener("click", () => setActiveView(btn.dataset.tab), { signal });
  });

  const heroNavContainer = document.querySelector(".hero-nav");
  if (heroNavContainer) {
    heroNavContainer.addEventListener(
      "mouseleave",
      () => moveUnderline(heroTabs, heroTabLine, state.activeTab === "home" ? null : state.activeTab),
      { signal }
    );
  }

  topTabs.forEach((btn) => {
    btn.addEventListener("click", () => setActiveView(btn.dataset.tab), { signal });
  });

  document.querySelectorAll("[data-nav]").forEach((btn) => {
    btn.addEventListener("click", () => setActiveView(btn.dataset.nav), { signal });
  });

  document.getElementById("btnReturnHome").addEventListener(
    "click",
    () => {
      setActiveView("home");
      scrollToTop();
    },
    { signal }
  );

  document.getElementById("btnHomePill").addEventListener(
    "click",
    () => {
      setActiveView("home");
      scrollToTop();
    },
    { signal }
  );

  shortcutBtns.forEach((btn) => {
    btn.addEventListener(
      "click",
      () => {
        const topic = btn.dataset.shortcut;
        shortcutBtns.forEach((b) => b.classList.toggle("is-selected", b === btn));
        chatInput.value = topic;
        chatFeedback.textContent = `Filter: ${topic}`;
        runPortalSearch(topic);
      },
      { signal }
    );
  });

  function runPortalSearch(rawQuery) {
    const q = rawQuery.trim().toLowerCase();
    state.searchQuery = q;

    if (!q) {
      instantResults.hidden = true;
      chatFeedback.textContent = "Siap menelusuri";
      shortcutBtns.forEach((b) => b.classList.remove("is-selected"));
      return;
    }

    const matches = [];

    PORTAL_DATA.resources.forEach((r) => {
      if (
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
      ) {
        matches.push({ type: "Resource", tab: "resources", item: r, sub: r.category });
      }
    });

    PORTAL_DATA.knowledges.forEach((v) => {
      if (
        v.title.toLowerCase().includes(q) ||
        v.level.toLowerCase().includes(q) ||
        v.summary.toLowerCase().includes(q)
      ) {
        matches.push({ type: "Video", tab: "knowledges", item: v, sub: `${v.duration} • ${v.series}` });
      }
    });

    PORTAL_DATA.articles.forEach((a) => {
      if (
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
      ) {
        matches.push({ type: "Article", tab: "articles", item: a, sub: a.tags.join(", ") });
      }
    });

    chatFeedback.textContent = `${matches.length} materi ditemukan`;

    if (state.activeTab !== "home") {
      setActiveView("home", { skipScroll: true });
    }

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
            (m, idx) => `
          <button type="button" class="instant-item" data-match-idx="${idx}">
            <div>
              <span class="instant-item-title">${escapeHtml(m.item.title)}</span>
              <span class="instant-item-sub">${escapeHtml(m.sub)}</span>
            </div>
            <span class="instant-type">${m.type}</span>
          </button>
        `
          )
          .join("")}
      `;

      instantResults.querySelectorAll(".instant-item").forEach((el) => {
        el.addEventListener("click", () => {
          const picked = matches[Number(el.dataset.matchIdx)];
          if (!picked) return;
          if (picked.type === "Resource") openResourceModal(picked.item);
          if (picked.type === "Video") openVideoModal(picked.item);
          if (picked.type === "Article") openArticleModal(picked.item);
        });
      });
    }

    const clearBtn = document.getElementById("clearSearchBtn");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        chatInput.value = "";
        runPortalSearch("");
      });
    }
  }

  chatInput.addEventListener("input", (e) => runPortalSearch(e.target.value), { signal });
  chatForm.addEventListener(
    "submit",
    (e) => {
      e.preventDefault();
      runPortalSearch(chatInput.value);
    },
    { signal }
  );

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key === "/" && document.activeElement !== chatInput && !modal.open) {
        e.preventDefault();
        if (state.activeTab !== "home") setActiveView("home");
        chatInput.focus();
      }
    },
    { signal }
  );

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
        if (found) openResourceModal(found);
      });
    });
    if (!grid.closest(".subpage-view").hidden) animateStaggerItems(grid, ".resource-card");
    bindMotionInteractions(grid.querySelectorAll(".resource-card"));
  }

  function buildCustomThumbSVG(palette, index, extraClass = "") {
    const [c1, c2] = palette;
    return `
      <svg class="${extraClass}" viewBox="0 0 640 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <linearGradient id="vg-${index}-${extraClass || "card"}" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="${c1}" stop-opacity="0.55"/>
            <stop offset="100%" stop-color="${c2}" stop-opacity="0.95"/>
          </linearGradient>
        </defs>
        <rect width="640" height="360" fill="#0d1120"/>
        <rect width="640" height="360" fill="url(#vg-${index}-${extraClass || "card"})"/>
        <circle cx="${140 + index * 55}" cy="${110 + (index % 3) * 40}" r="145" fill="${c1}" fill-opacity="0.22"/>
        <circle cx="${500 - index * 35}" cy="260" r="110" stroke="rgba(255,255,255,0.14)" stroke-width="1.5" fill="none"/>
        <path d="M40 300 Q 220 ${180 + index * 15}, 600 240" stroke="rgba(255,255,255,0.16)" stroke-width="1.5" fill="none"/>
      </svg>
    `;
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
        if (found) openVideoModal(found);
      });
    });
    if (!grid.closest(".subpage-view").hidden) animateStaggerItems(grid, ".video-card");
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
        if (found) openArticleModal(found);
      });
    });
    if (!list.closest(".subpage-view").hidden) animateStaggerItems(list, ".article-row");
  }

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

  function parseDurationToSec(dur) {
    const [m, s] = dur.split(":").map(Number);
    return (m || 0) * 60 + (s || 0);
  }

  function formatSecToTime(sec) {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function openVideoModal(vid, skipHistory = false) {
    clearInterval(videoSimTimer);
    if (!skipHistory) syncUrlHash(`#item/${vid.id}`);
    const totalSec = parseDurationToSec(vid.duration);
    let currentSec = 0;
    let isPlaying = true;
    let useYoutube = false;
    const vidIdx = PORTAL_DATA.knowledges.findIndex((v) => v.id === vid.id);

    modalBadge.textContent = vid.series;
    modalTitle.textContent = vid.title;
    modalMeta.textContent = `Durasi: ${vid.duration} • Topik: ${vid.level}`;
    modalBody.innerHTML = `
      <div class="video-mode-bar">
        <span id="videoModeLabel">Mode: Pemutar Interaktif Per Bab</span>
        <div class="video-mode-actions">
          <a class="yt-external-link" id="ytExternalLink" href="https://www.youtube.com/watch?v=${encodeURIComponent(vid.youtubeId)}" target="_blank" rel="noopener noreferrer">Buka di YouTube &nearr;</a>
          <button type="button" class="video-mode-toggle" id="toggleVideoModeBtn">Beralih ke Embed YouTube</button>
        </div>
      </div>

      <div class="video-player-shell" id="videoPlayerShell"></div>

      <p>${escapeHtml(vid.summary)}</p>
      <p style="font-family:var(--font-mono);font-size:0.78rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.08em;">Daftar Bab Materi (Klik untuk lompat)</p>
      <ul class="chapter-list" id="modalChapterList">
        ${vid.chapters
          .map(
            (ch, idx) => `
          <li>
            <button type="button" class="chapter-item-btn ${idx === 0 ? "is-playing-chapter" : ""}" data-sec="${ch.seconds}" data-ch-idx="${idx}">
              <strong>${escapeHtml(ch.label)}</strong>
              <span>${escapeHtml(ch.time)}</span>
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
    const toggleModeBtn = document.getElementById("toggleVideoModeBtn");
    const ytExternalLink = document.getElementById("ytExternalLink");
    const chapterBtns = Array.from(document.querySelectorAll(".chapter-item-btn"));

    const pauseSvg = `<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>`;
    const playSvg = `<polygon points="6 4 20 12 6 20 6 4"/>`;

    function highlightChapterBySec(sec) {
      let activeChIdx = 0;
      vid.chapters.forEach((ch, i) => {
        if (sec >= ch.seconds) activeChIdx = i;
      });
      chapterBtns.forEach((b, i) => b.classList.toggle("is-playing-chapter", i === activeChIdx));
      ytExternalLink.href = `https://www.youtube.com/watch?v=${encodeURIComponent(vid.youtubeId)}&t=${Math.floor(sec)}s`;
      return activeChIdx;
    }

    function renderPlayerShell(startSec = 0) {
      clearInterval(videoSimTimer);
      currentSec = startSec;
      highlightChapterBySec(currentSec);

      if (useYoutube) {
        modeLabel.textContent = "Mode: Embed Video YouTube";
        toggleModeBtn.textContent = "Kembali ke Pemutar Bab";
        playerShell.innerHTML = `
          <iframe
            src="https://www.youtube.com/embed/${encodeURIComponent(vid.youtubeId)}?start=${Math.floor(currentSec)}&rel=0&playsinline=1"
            title="${escapeHtml(vid.title)}"
            referrerpolicy="strict-origin-when-cross-origin"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        `;
        return;
      }

      modeLabel.textContent = "Mode: Pemutar Interaktif Per Bab";
      toggleModeBtn.textContent = "Beralih ke Embed YouTube";
      playerShell.innerHTML = `
        <div class="video-screen-visual">
          ${buildCustomThumbSVG(vid.palette, Math.max(0, vidIdx), "bg-art")}
          <div class="video-center-control">
            <button type="button" class="video-big-play" id="vidBigPlayBtn" aria-label="Jeda atau putar video">
              <svg id="vidBigIcon" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">${pauseSvg}</svg>
            </button>
            <div class="video-active-caption" id="vidActiveCaption">${escapeHtml(vid.chapters[0].label)}</div>
          </div>
        </div>
        <div class="video-controls-bar">
          <button type="button" class="vid-mini-btn" id="vidMiniPlayBtn" aria-label="Play atau Pause">
            <svg id="vidMiniIcon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">${pauseSvg}</svg>
          </button>
          <div class="vid-progress-track" id="vidProgressTrack" role="slider" aria-label="Progres video" aria-valuemin="0" aria-valuemax="${totalSec}" aria-valuenow="0" tabindex="0">
            <div class="vid-progress-fill" id="vidProgressFill"></div>
          </div>
          <span class="vid-timecode" id="vidTimecode">00:00 / ${escapeHtml(vid.duration)}</span>
        </div>
      `;

      const bigPlayBtn = document.getElementById("vidBigPlayBtn");
      const miniPlayBtn = document.getElementById("vidMiniPlayBtn");
      const bigIcon = document.getElementById("vidBigIcon");
      const miniIcon = document.getElementById("vidMiniIcon");
      const progressTrack = document.getElementById("vidProgressTrack");
      const progressFill = document.getElementById("vidProgressFill");
      const timecodeEl = document.getElementById("vidTimecode");
      const captionEl = document.getElementById("vidActiveCaption");

      function syncSimUI() {
        const pct = Math.min(100, (currentSec / totalSec) * 100);
        progressFill.style.inlineSize = `${pct}%`;
        progressTrack.setAttribute("aria-valuenow", String(Math.floor(currentSec)));
        timecodeEl.textContent = `${formatSecToTime(currentSec)} / ${vid.duration}`;

        const activeChIdx = highlightChapterBySec(currentSec);
        captionEl.textContent = vid.chapters[activeChIdx].label;

        bigIcon.innerHTML = isPlaying ? pauseSvg : playSvg;
        miniIcon.innerHTML = isPlaying ? pauseSvg : playSvg;
      }

      function togglePlay() {
        isPlaying = !isPlaying;
        syncSimUI();
      }

      bigPlayBtn.addEventListener("click", togglePlay);
      miniPlayBtn.addEventListener("click", togglePlay);

      progressTrack.addEventListener("click", (e) => {
        const rect = progressTrack.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
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

    toggleModeBtn.addEventListener("click", () => {
      useYoutube = !useYoutube;
      renderPlayerShell(currentSec);
    });

    chapterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const targetSec = Number(btn.dataset.sec) || 0;
        isPlaying = true;
        renderPlayerShell(targetSec);
      });
    });

    renderPlayerShell(0);
    openModal();
  }

  function openArticleModal(art, skipHistory = false) {
    clearInterval(videoSimTimer);
    if (!skipHistory) syncUrlHash(`#item/${art.id}`);
    modalBadge.textContent = art.tags.map((t) => "#" + t).join("  ");
    modalTitle.textContent = art.title;
    modalMeta.textContent = `${art.date} • ${art.readTime}`;
    modalBody.innerHTML = art.content.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
    modalFooter.innerHTML = `
      <button type="button" class="btn-primary" id="doneReadingBtn">Selesai Membaca</button>
    `;
    document.getElementById("doneReadingBtn").addEventListener("click", () => closeModal());
    openModal();
  }

  function openModal() {
    if (!modal.open) {
      modal.showModal();
    }
    modalCloseBtn.focus();
  }

  function closeModal(skipHistory = false) {
    clearInterval(videoSimTimer);
    if (modal.open) {
      modal.close();
    }
    if (!skipHistory) {
      syncUrlHash(`#${state.activeTab}`);
    }
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
    (e) => {
      if (e.target === modal) closeModal();
    },
    { signal }
  );
  modal.addEventListener("close", () => clearInterval(videoSimTimer), { signal });

  function handleHashRoute() {
    if (isSandboxed) return;
    let hash = "";
    try {
      hash = window.location.hash.replace(/^#/, "");
    } catch {
      return;
    }

    if (!hash || hash === "home") {
      closeModal(true);
      setActiveView("home", { skipHistory: true });
      return;
    }

    if (["resources", "knowledges", "articles"].includes(hash)) {
      closeModal(true);
      setActiveView(hash, { skipHistory: true });
      return;
    }

    if (hash.startsWith("item/")) {
      const itemId = hash.slice(5);
      const res = PORTAL_DATA.resources.find((r) => r.id === itemId);
      if (res) {
        setActiveView("resources", { skipHistory: true, skipScroll: true });
        openResourceModal(res, true);
        return;
      }
      const vid = PORTAL_DATA.knowledges.find((v) => v.id === itemId);
      if (vid) {
        setActiveView("knowledges", { skipHistory: true, skipScroll: true });
        openVideoModal(vid, true);
        return;
      }
      const art = PORTAL_DATA.articles.find((a) => a.id === itemId);
      if (art) {
        setActiveView("articles", { skipHistory: true, skipScroll: true });
        openArticleModal(art, true);
      }
    }
  }

  if (!isSandboxed) {
    window.addEventListener("hashchange", handleHashRoute, { signal });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function initParticles() {
    const canvas = document.getElementById("particleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const prefersReduced = prefersReducedMotion;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const pointer = {
      x: width * 0.5,
      y: height * 0.35,
      targetX: width * 0.5,
      targetY: height * 0.35
    };

    const count = Math.min(110, Math.floor((width * height) / 15000));
    const particles = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.6 + 0.5,
      vx: (Math.random() - 0.5) * 0.32,
      vy: (Math.random() - 0.5) * 0.32 - 0.07,
      alpha: Math.random() * 0.45 + 0.15,
      pulse: Math.random() * Math.PI * 2
    }));

    window.addEventListener(
      "resize",
      () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        if (state.activeTab !== "home") {
          moveUnderline(topTabs, topNavIndicator, state.activeTab);
        }
      },
      { signal }
    );

    window.addEventListener(
      "pointermove",
      (e) => {
        pointer.targetX = e.clientX;
        pointer.targetY = e.clientY;
      },
      { passive: true, signal }
    );

    function draw() {
      ctx.clearRect(0, 0, width, height);

      if (!prefersReduced) {
        pointer.x += (pointer.targetX - pointer.x) * 0.12;
        pointer.y += (pointer.targetY - pointer.y) * 0.12;
      }

      const pointerRadius = 180;
      for (const p of particles) {
        if (!prefersReduced) {
          p.x += p.vx;
          p.y += p.vy;
          p.pulse += 0.025;

          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const dist = Math.hypot(dx, dy);
          if (dist < pointerRadius && dist > 0) {
            const push = ((pointerRadius - dist) / pointerRadius) * 0.35;
            p.x += (dx / dist) * push;
            p.y += (dy / dist) * push;
          }

          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;
        }

        const currentAlpha = p.alpha * (0.75 + 0.25 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(204, 216, 255, ${currentAlpha.toFixed(3)})`;
        ctx.shadowColor = `rgba(158, 177, 255, ${Math.min(0.7, currentAlpha + 0.15).toFixed(3)})`;
        ctx.shadowBlur = p.r > 1.5 ? 12 : 5;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      if (!prefersReduced) {
        requestAnimationFrame(draw);
      }
    }

    draw();
  }

  function bindMotionInteractions(elements) {
    if (!motionAnimate || !motionHover || !motionPress || prefersReducedMotion) return;
    Array.from(elements).filter(Boolean).forEach((element) => {
      motionHover(element, () => {
        motionAnimate(element, { scale: 1.025, y: -2 }, { duration: 0.18, ease: "easeOut" });
        return () => motionAnimate(element, { scale: 1, y: 0 }, { duration: 0.2, ease: "easeOut" });
      });
      motionPress(element, () => {
        motionAnimate(element, { scale: 0.97 }, { duration: 0.1, ease: "easeOut" });
        return () => motionAnimate(element, { scale: 1 }, { duration: 0.16, ease: "easeOut" });
      });
    });
  }

  renderResources();
  renderVideos();
  renderArticles();
  bindMotionInteractions(shortcutBtns);
  bindMotionInteractions([document.querySelector(".chat-input-wrap")]);
  initParticles();
  syncUrlHash("#home", true);

  document.addEventListener("portal-animations-ready", ({ detail }) => {
    gsap = detail.gsap;
    Lenis = detail.Lenis;
    motionAnimate = detail.animate;
    motionHover = detail.hover;
    motionPress = detail.press;

    if (prefersReducedMotion) return;

    document.documentElement.classList.add("has-gsap");
    lenis = new Lenis({ autoRaf: false, smoothWheel: true, syncTouch: false });
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    moveUnderline(topTabs, topNavIndicator, state.activeTab);
    bindMotionInteractions(shortcutBtns);
    bindMotionInteractions([document.querySelector(".chat-input-wrap")]);
    bindMotionInteractions(document.querySelectorAll(".resource-card"));
    animateViewItems(getVisibleView());
  });
})();
