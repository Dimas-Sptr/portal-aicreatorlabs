export function createNavigation({
  data,
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
  closeModal,
  openResourceModal,
  openVideoModal,
  openArticleModal
}) {
  function setActiveView(viewName, options = {}) {
    const outgoingView = [heroView, ...Object.values(subViews)].find((view) => !view.hidden);
    const incomingView = viewName === "home" ? heroView : subViews[viewName];
    if (!incomingView) return;
    state.activeTab = viewName;
    const isHome = viewName === "home";

    heroTabs.forEach((button) => {
      const match = !isHome && button.dataset.tab === viewName;
      button.classList.toggle("is-active", match);
      if (match) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    topTabs.forEach((button) => {
      const match = !isHome && button.dataset.tab === viewName;
      button.classList.toggle("is-active", match);
      if (match) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });

    if (isHome) {
      topbar.classList.remove("is-visible");
      effects.moveUnderline(heroTabs, heroTabLine, null);
      if (!options.skipHistory) syncUrlHash("#home");
    } else {
      topbar.classList.add("is-visible");
      instantResults.hidden = true;
      requestAnimationFrame(() => effects.moveUnderline(topTabs, topNavIndicator, viewName));
      if (!options.skipHistory) syncUrlHash(`#${viewName}`);
      if (!options.skipScroll) effects.scrollToTop();
    }

    effects.transitionView(outgoingView, incomingView);
  }

  heroTabs.forEach((button) => {
    button.addEventListener("mouseenter", () => effects.moveUnderline(heroTabs, heroTabLine, button.dataset.tab), { signal });
    button.addEventListener("focus", () => effects.moveUnderline(heroTabs, heroTabLine, button.dataset.tab), { signal });
    button.addEventListener("click", () => setActiveView(button.dataset.tab), { signal });
  });

  const heroNavContainer = document.querySelector(".hero-nav");
  if (heroNavContainer) {
    heroNavContainer.addEventListener(
      "mouseleave",
      () => effects.moveUnderline(heroTabs, heroTabLine, state.activeTab === "home" ? null : state.activeTab),
      { signal }
    );
  }

  topTabs.forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.tab), { signal });
  });

  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.addEventListener("click", () => setActiveView(button.dataset.nav), { signal });
  });

  const returnHome = () => {
    setActiveView("home");
    effects.scrollToTop();
  };
  document.getElementById("btnReturnHome").addEventListener("click", returnHome, { signal });
  document.getElementById("btnHomePill").addEventListener("click", returnHome, { signal });

  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "/" && document.activeElement !== chatInput && !modal.open) {
        event.preventDefault();
        if (state.activeTab !== "home") setActiveView("home");
        chatInput.focus();
      }
    },
    { signal }
  );

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
      const resource = data.resources.find((item) => item.id === itemId);
      if (resource) {
        setActiveView("resources", { skipHistory: true, skipScroll: true });
        openResourceModal(resource, true);
        return;
      }
      const video = data.knowledges.find((item) => item.id === itemId);
      if (video) {
        setActiveView("knowledges", { skipHistory: true, skipScroll: true });
        openVideoModal(video, true);
        return;
      }
      const article = data.articles.find((item) => item.id === itemId);
      if (article) {
        setActiveView("articles", { skipHistory: true, skipScroll: true });
        openArticleModal(article, true);
      }
    }
  }

  if (!isSandboxed) window.addEventListener("hashchange", handleHashRoute, { signal });

  return { handleHashRoute, setActiveView };
}
