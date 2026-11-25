Promise.all([
  import("https://cdn.jsdelivr.net/npm/gsap@3.13.0/+esm"),
  import("https://cdn.jsdelivr.net/npm/lenis@1.3.11/+esm"),
  import("https://cdn.jsdelivr.net/npm/motion-dom@12.23.12/+esm")
])
  .then(([gsapModule, lenisModule, motionModule]) => {
    document.dispatchEvent(
      new CustomEvent("portal-animations-ready", {
        detail: {
          gsap: gsapModule.gsap,
          Lenis: lenisModule.default,
          animate: motionModule.animate,
          hover: motionModule.hover,
          press: motionModule.press
        }
      })
    );
  })
  .catch((error) => {
    console.error("Animasi tidak dapat dimuat; portal tetap berfungsi tanpa animasi.", error);
  });
