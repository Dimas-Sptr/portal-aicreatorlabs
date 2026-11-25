export function createPortalHistory(state, isSandboxed) {
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
      // Ignore history mutation errors in restricted iframe environments.
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

  return { syncUrlHash, getShareableUrl };
}
