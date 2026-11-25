export function createEffects({
  state,
  heroView,
  subViews,
  heroTabs,
  topTabs,
  topNavIndicator,
  prefersReducedMotion,
  signal
}) {
  let gsap = null;
  let Lenis = null;
  let motionAnimate = null;
  let motionHover = null;
  let motionPress = null;
  let lenis = null;
  let viewTransitionId = 0;
  let pendingView = null;

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
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.38,
        stagger: 0.055,
        ease: "power3.out",
        clearProps: "opacity,visibility,transform"
      }
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

  function scrollToTop() {
    if (lenis) {
      lenis.scrollTo(0);
    } else {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
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
        if (state.activeTab !== "home") moveUnderline(topTabs, topNavIndicator, state.activeTab);
      },
      { signal }
    );

    window.addEventListener(
      "pointermove",
      (event) => {
        pointer.targetX = event.clientX;
        pointer.targetY = event.clientY;
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
      for (const particle of particles) {
        if (!prefersReduced) {
          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.pulse += 0.025;

          const dx = particle.x - pointer.x;
          const dy = particle.y - pointer.y;
          const distance = Math.hypot(dx, dy);
          if (distance < pointerRadius && distance > 0) {
            const push = ((pointerRadius - distance) / pointerRadius) * 0.35;
            particle.x += (dx / distance) * push;
            particle.y += (dy / distance) * push;
          }

          if (particle.x < -10) particle.x = width + 10;
          if (particle.x > width + 10) particle.x = -10;
          if (particle.y < -10) particle.y = height + 10;
          if (particle.y > height + 10) particle.y = -10;
        }

        const currentAlpha = particle.alpha * (0.75 + 0.25 * Math.sin(particle.pulse));
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(204, 216, 255, ${currentAlpha.toFixed(3)})`;
        ctx.shadowColor = `rgba(158, 177, 255, ${Math.min(0.7, currentAlpha + 0.15).toFixed(3)})`;
        ctx.shadowBlur = particle.r > 1.5 ? 12 : 5;
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      if (!prefersReduced) requestAnimationFrame(draw);
    }

    draw();
  }

  function setAnimationModules(detail) {
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
  }

  return {
    animateStaggerItems,
    animateViewItems,
    bindMotionInteractions,
    getVisibleView,
    initParticles,
    moveUnderline,
    scrollToTop,
    setAnimationModules,
    transitionView
  };
}
