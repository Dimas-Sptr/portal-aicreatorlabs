# AI Creator Labs — Portal Materi Belajar AI

Portal publik satu pintu untuk menjelajahi **Resources** (toolkit & prompt), **Knowledges** (pustaka video pembelajaran dengan pemutar interaktif), dan **Articles** (arsip tulisan berdasarkan tag topik).

## Arsitektur Web Modern (Modern Web Guidance)
- **Native Top-Layer UI:** Menggunakan elemen `<dialog closedby="any">` dengan `.showModal()`, `::backdrop`, dan `@starting-style` serta `transition-behavior: allow-discrete` untuk animasi buka/tutup modal tanpa JavaScript focus-trapping manual.
- **Native Popover & Anchor Positioning:** Petunjuk pintasan `/` menggunakan atribut `popover="auto"` dan CSS Anchor Positioning (`position-anchor`, `position-area`).
- **Modern CSS Architecture:** Mengorganisasi stylesheet dengan `@layer`, native CSS nesting, warna perseptual `oklch()`, properti logis (`inline-size`, `block-size`, `margin-block`, `padding-inline`), satuan viewport dinamis `100dvh`, serta `text-wrap: balance` / `pretty`.
- **View Transitions & Clean Events:** Menggunakan `document.startViewTransition` untuk perpindahan antar-halaman dan `AbortController` `{ signal }` untuk manajemen event listener.
