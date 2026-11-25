# Panduan Mengelola Konten Portal

Konten tiap menu sekarang ada di file terpisah dalam folder `content/`. Ubah file JSON sesuai menu; jangan mengedit `app.js` atau `index.html` untuk menambah materi biasa.

| Menu | File |
| --- | --- |
| Resources | `content/resources.json` |
| Knowledges / video | `content/knowledges.json` |
| Articles | `content/articles.json` |

Setiap file berisi daftar (array) objek. Untuk menambah item, salin satu objek yang sudah ada, tempel di dalam array, lalu ganti nilainya. Pastikan ada koma di antara dua objek, tetapi tidak setelah objek terakhir. JSON memakai tanda kutip ganda untuk nama field dan teks; jangan menambahkan komentar atau koma terakhir.

## Field tiap menu

### Resources

- `id`: ID unik, misalnya `res-7`. Jangan gunakan ulang ID yang sudah ada.
- `title`, `category`, `level`, `description`, `summary`, `template`: teks materi.

### Knowledges

- `id`: ID unik, misalnya `vid-7`.
- `title`, `series`, `level`, `duration`: judul, seri, kategori/level, dan durasi `MM:SS`.
- `youtubeId`: ID video YouTube 11 karakter, bukan URL lengkap.
- `palette`: dua warna hex enam digit untuk thumbnail, misalnya `["#3b4cca", "#1e264d"]`.
- `summary`: ringkasan video.
- `chapters`: daftar bab berurutan dengan `time` (`MM:SS`), `seconds` (detik dari awal, harus sesuai `time` dan tidak melebihi durasi), dan `label`.

### Articles

- `id`: ID unik, misalnya `art-7`.
- `title`, `excerpt`, `readTime`, `date`: judul, ringkasan, waktu baca, dan tanggal.
- `tags`: daftar tag teks, misalnya `["AI Agent & MCP", "Workflow Otomasi"]`.
- `content`: daftar paragraf teks; setiap elemen menjadi satu paragraf.

Nilai `id` wajib berisi huruf, angka, dan tanda hubung saja serta unik di seluruh konten karena dipakai untuk membuka dan membagikan detail materi. Filter kategori, level, dan tag akan mengikuti nilai yang ada di file konten.

## Memeriksa dan menerbitkan

1. Jalankan `node scripts/validate-content.mjs` untuk memeriksa format JSON, field wajib, ID duplikat, serta format durasi, ID YouTube, warna, dan bab video. Perbaiki semua pesan error sebelum melanjutkan.
2. Jalankan tes validator dengan `node --test scripts/content-schema.test.mjs`.
3. Jalankan situs melalui web server lokal; membuka `index.html` langsung sebagai `file://` tidak mendukung pemuatan konten JSON.
4. Periksa menu yang diubah, filter, pencarian, serta detail item di browser.
5. Publikasikan/deploy perubahan file JSON bersama situs agar perubahan terlihat oleh pengunjung.

## Struktur kode untuk pengembangan

- `app.js`: memuat konten, menyiapkan state, dan merender daftar menu.
- `modules/navigation.js`: perpindahan view, tombol navigasi, dan rute hash.
- `modules/search.js`: pencarian portal dan pintasan topik.
- `modules/modals.js`: detail resource/artikel dan pemutar video.
- `modules/effects.js`: transisi GSAP, interaksi Motion, Lenis, dan partikel.
- `modules/history.js` dan `modules/content-utils.js`: helper riwayat tautan dan konten bersama.
