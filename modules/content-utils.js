export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildCustomThumbSVG(palette, index, extraClass = "") {
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
