const PORTAL_DATA = {
  resources: [
    {
      id: "res-1",
      title: "System Prompt Architect Blueprint",
      category: "Prompt Engineering",
      level: "Pemula",
      description: "Kerangka menyusun instruksi sistem berstruktur (peran, batasan, format output, dan aturan verifikasi) agar respons LLM konsisten.",
      summary: "Templat ini memisahkan konteks tugas, batasan larangan, dan contoh keluaran sehingga model tidak melebar dari tujuan utama.",
      template: "PERAN: Bertindak sebagai [Spesialis Domain].\nTUJUAN: Hasilkan [Output Spesifik] berdasarkan data berikut.\nBATASAN:\n- Gunakan bahasa lugas tanpa basa-basi.\n- Tandai bagian yang belum terverifikasi.\nFORMAT: Sajikan dalam poin terstruktur."
    },
    {
      id: "res-2",
      title: "Riset Kompetitor & Validasi Ide 15 Menit",
      category: "Workflow Otomasi",
      level: "Menengah",
      description: "Rangkaian prompt berantai untuk memetakan celah pasar, keluhan pengguna nyata, dan posisi produk sebelum menulis kode.",
      summary: "Membantu kreator dan builder memvalidasi kebutuhan pasar menggunakan pola analisis masalah-solusi secara sistematis.",
      template: "Analisis 5 alternatif utama untuk [Ide Produk]. Susun tabel berisi: Kelebihan Utama, Keluhan Terbanyak Pengguna, Model Harga, dan 1 Celah yang Belum Terisi."
    },
    {
      id: "res-3",
      title: "MCP Server & Tool-Use Starter Kit",
      category: "AI Agent & MCP",
      level: "Lanjutan",
      description: "Panduan konfigurasi Model Context Protocol lokal untuk menghubungkan asisten AI ke file sistem, repositori, dan API.",
      summary: "Berisi struktur konfigurasi dasar serta checklist izin akses agar agent tetap aman saat membaca proyek lokal.",
      template: "{\n  \"mcpServers\": {\n    \"filesystem\": {\n      \"command\": \"npx\",\n      \"args\": [\"-y\", \"@modelcontextprotocol/server-filesystem\", \"./workspace\"]\n    }\n  }\n}"
    },
    {
      id: "res-4",
      title: "Anti-Slop Copywriting & Landing Page Audit",
      category: "Desain & Konten",
      level: "Pemula",
      description: "Daftar periksa untuk membersihkan frasa klise AI dan menggantinya dengan proposisi nilai yang konkret serta terukur.",
      summary: "Gunakan prompt audit ini setelah menyusun draf halaman web, penawaran klien, atau skrip konten.",
      template: "Tinjau teks berikut. Hapus kata klise (seperti 'revolusioner', 'seamless', 'unlock'). Ganti setiap klaim abstrak dengan fakta operasional atau manfaat langsung bagi pembaca."
    },
    {
      id: "res-5",
      title: "Peta Belajar AI 30 Hari Tanpa Background Coding",
      category: "Mulai dari Nol",
      level: "Pemula",
      description: "Kurikulum harian terarah dari memahami cara kerja token dan konteks hingga merakit otomasi sederhana pertama.",
      summary: "Dirancang khusus bagi kreator non-teknis agar tidak tersesat di tengah ratusan rilis tool AI setiap minggu.",
      template: "Minggu 1: Dasar Prompt & Struktur Konteks\nMinggu 2: Riset & Sintesis Dokumen Panjang\nMinggu 3: Otomasi Alur Kerja Konten\nMinggu 4: Merakit Mini-App Pertama dengan AI"
    },
    {
      id: "res-6",
      title: "PRD & Technical Spec Generator",
      category: "AI Agent & MCP",
      level: "Menengah",
      description: "Templat dokumen spesifikasi MVP agar AI coding assistant membangun fitur tepat sasaran tanpa melebar ke luar ruang lingkup.",
      summary: "Memaksa definisi fitur Wajib (v1), Ditunda (v2), dan Di luar cakupan sebelum proses pembuatan kode dimulai.",
      template: "# MVP Spec: [Nama Proyek]\n## 1. Masalah Utama\n## 2. Fitur Wajib v1 (Maksimal 3)\n## 3. Di Luar Cakupan v1\n## 4. Kriteria Selesai (Acceptance Criteria)"
    }
  ],
  knowledges: [
    {
      id: "vid-1",
      title: "Cara Berpikir Sistem: Mengubah Prompt Harian Menjadi Asset",
      series: "Fondasi AI Creator",
      level: "Mulai dari Nol",
      duration: "14:28",
      palette: ["#3b4cca", "#1e264d"],
      summary: "Memahami perbedaan antara sekadar bertanya ke AI dan merancang alur kerja berulang yang menghemat jam kerja setiap pekan.",
      chapters: [
        { time: "00:00", seconds: 0, label: "Kenapa hasil AI sering terasa generik" },
        { time: "04:15", seconds: 255, label: "Anatomi konteks, batasan, dan contoh" },
        { time: "09:40", seconds: 580, label: "Studi kasus merakit templat produksi" }
      ]
    },
    {
      id: "vid-2",
      title: "Membangun Landing Page Bersih dengan AI Tanpa Terlihat Template",
      series: "UI & Product Craft",
      level: "Desain & Konten",
      duration: "22:10",
      palette: ["#2563eb", "#17203d"],
      summary: "Teknik mengarahkan tipografi, kontras warna, ritme tata letak, dan mikro-interaksi agar hasil web terasa dirancang manusia.",
      chapters: [
        { time: "00:00", seconds: 0, label: "Membongkar pola visual khas AI default" },
        { time: "07:30", seconds: 450, label: "Memilih pasangan font serif dan sans" },
        { time: "15:12", seconds: 912, label: "Menerapkan filter kualitas sebelum rilis" }
      ]
    },
    {
      id: "vid-3",
      title: "Pengenalan AI Agent & MCP untuk Otomasi Tugas Lokal",
      series: "Agentic Workflow",
      level: "AI Agent & MCP",
      duration: "19:45",
      palette: ["#4f46e5", "#191e3a"],
      summary: "Bagaimana AI membaca dokumen proyek, menjalankan perintah terukur, dan menjaga memori antar sesi dengan aman.",
      chapters: [
        { time: "00:00", seconds: 0, label: "Apa itu Model Context Protocol (MCP)" },
        { time: "06:50", seconds: 410, label: "Menghubungkan tool lokal pertama" },
        { time: "14:05", seconds: 845, label: "Praktik keamanan dan batas izin akses" }
      ]
    },
    {
      id: "vid-4",
      title: "Merancang Pipeline Riset Konten & Distribusi Multi-Kanal",
      series: "Creator Operations",
      level: "Workflow Otomasi",
      duration: "16:52",
      palette: ["#0284c7", "#15223b"],
      summary: "Mengubah satu sesi riset mendalam menjadi artikel panjang, ringkasan visual, dan skrip video tanpa kehilangan suara asli penulis.",
      chapters: [
        { time: "00:00", seconds: 0, label: "Mengumpulkan sumber terverifikasi" },
        { time: "05:45", seconds: 345, label: "Ekstraksi sudut pandang unik" },
        { time: "11:30", seconds: 690, label: "Adaptasi format lintas platform" }
      ]
    },
    {
      id: "vid-5",
      title: "Vibe Coding Terstruktur: Dari Ide Kasar ke MVP Siap Uji",
      series: "Builder Track",
      level: "Mulai dari Nol",
      duration: "26:04",
      palette: ["#6366f1", "#181d38"],
      summary: "Alur kerja 5 tahap membangun aplikasi web modular menggunakan AI IDE tanpa terjebak bug berulang.",
      chapters: [
        { time: "00:00", seconds: 0, label: "Menulis PRD ringkas satu halaman" },
        { time: "08:20", seconds: 500, label: "Menyusun AGENTS.md dan MEMORY.md" },
        { time: "18:40", seconds: 1120, label: "Membangun dan menguji fitur satu per satu" }
      ]
    },
    {
      id: "vid-6",
      title: "Teknik Evaluasi Output LLM: Mengurangi Halusinasi pada Data",
      series: "Prompt Engineering",
      level: "Prompt Engineering",
      duration: "13:15",
      palette: ["#38bdf8", "#172542"],
      summary: "Pola verifikasi langkah demi langkah agar AI selalu mengutip sumber dan mengakui ketidakpastian data.",
      chapters: [
        { time: "00:00", seconds: 0, label: "Sumber utama halusinasi instruksi" },
        { time: "04:50", seconds: 290, label: "Pola Chain-of-Verification" },
        { time: "10:10", seconds: 610, label: "Checklist audit sebelum publikasi" }
      ]
    }
  ],
  articles: [
    {
      id: "art-1",
      title: "Mengapa Kebanyakan Kreator Gagal Memanfaatkan AI Secara Konsisten",
      excerpt: "Masalahnya jarang terletak pada kecanggihan model, melainkan ketiadaan standar konteks dan alur kerja yang terdokumentasi.",
      tags: ["Workflow Otomasi", "Mulai dari Nol"],
      readTime: "5 mnt baca",
      date: "18 Nov 2026",
      content: [
        "Sebagian besar pengguna membuka kolom chat AI dengan harapan satu kalimat singkat akan menghasilkan karya siap pakai. Ketika hasilnya terasa datar, kesimpulannya sering kali keliru: modelnya dianggap kurang pintar.",
        "Di AI Creator Labs, pendekatan yang kami gunakan adalah memperlakukan AI seperti rekan kerja baru yang sangat cepat namun belum mengenal konteks bisnis Anda. Begitu Anda menyediakan contoh nyata, batasan gaya bahasa, dan kriteria keberhasilan, kualitas keluarannya meningkat drastis.",
        "Mulailah dengan mendokumentasikan tiga tugas yang paling sering Anda ulang setiap minggu, lalu ubah masing-masing menjadi templat instruksi baku yang terus disempurnakan."
      ]
    },
    {
      id: "art-2",
      title: "Anatomi Prompt yang Jernih: Konteks, Batasan, dan Contoh",
      excerpt: "Tiga komponen inti yang membedakan instruksi spekulatif dengan sistem prompt yang dapat diandalkan berulang kali.",
      tags: ["Prompt Engineering", "Mulai dari Nol"],
      readTime: "6 mnt baca",
      date: "14 Nov 2026",
      content: [
        "Instruksi yang efektif tidak harus panjang berhalaman-halaman, tetapi harus spesifik pada titik keputusan yang paling rawan meleset.",
        "Pertama, tetapkan konteks pembaca dan tujuan akhir dokumen. Kedua, tuliskan batasan negatif secara eksplisit—hal-hal apa saja yang tidak boleh muncul dalam jawaban. Ketiga, sertakan satu contoh format keluaran yang ideal.",
        "Kombinasi tiga elemen ini memangkas waktu revisi hingga lebih dari separuh pada tugas penulisan maupun perancangan struktur data."
      ]
    },
    {
      id: "art-3",
      title: "Merancang Antarmuka Web Tenang di Tengah Kebisingan Visual AI",
      excerpt: "Bagaimana tipografi serif yang tepat, ruang kosong yang lega, dan kontras terukur menciptakan pengalaman belajar yang fokus.",
      tags: ["Desain & Konten"],
      readTime: "4 mnt baca",
      date: "10 Nov 2026",
      content: [
        "Halaman pembelajaran yang efektif tidak berteriak meminta perhatian lewat warna mencolok atau animasi berlebihan. Ia memberi ruang bagi mata untuk beristirahat dan memandu fokus secara alami.",
        "Penggunaan latar gelap bernuansa dingin membantu mengurangi kelelahan mata saat membaca materi panjang, selama hierarki kontras teks utama dan sekunder dijaga ketat.",
        "Setiap komponen interaktif—mulai dari tab navigasi hingga pintasan topik—harus langsung menjelaskan fungsinya tanpa perlu panduan tambahan."
      ]
    },
    {
      id: "art-4",
      title: "Dari Chat Biasa ke AI Agent: Kapan Anda Benar-Benar Membutuhkannya?",
      excerpt: "Panduan praktis membedakan tugas yang cukup selesai dengan satu prompt dan tugas yang layak diotomatisasi dengan agent.",
      tags: ["AI Agent & MCP", "Workflow Otomasi"],
      readTime: "7 mnt baca",
      date: "05 Nov 2026",
      content: [
        "Tidak semua alur kerja membutuhkan arsitektur multi-agent yang rumit. Jika suatu proses hanya terdiri dari dua langkah statis, rantai prompt sederhana jauh lebih stabil dan mudah dirawat.",
        "Agent baru memberikan nilai tambah nyata ketika tugas membutuhkan pengambilan keputusan dinamis, pembacaan file lokal berulang, atau verifikasi hasil lintas sumber sebelum menyusun laporan akhir.",
        "Kuncinya adalah menjaga manusia tetap memegang kendali persetujuan pada setiap aksi yang berdampak ke sistem eksternal."
      ]
    },
    {
      id: "art-5",
      title: "Menjaga Suara Asli Penulis Saat Menggunakan Asisten AI",
      excerpt: "Teknik melatih AI mengenali ritme kalimat, pilihan diksi, dan sudut pandang personal Anda tanpa terdengar seperti mesin.",
      tags: ["Desain & Konten", "Prompt Engineering"],
      readTime: "5 mnt baca",
      date: "01 Nov 2026",
      content: [
        "Ciri paling mudah dikenali dari tulisan AI mentah adalah penggunaan kata sifat berlebihan dan struktur paragraf yang selalu seragam.",
        "Untuk menghindarinya, kumpulkan tiga hingga lima tulisan terbaik yang pernah Anda buat sendiri sebagai acuan gaya, lalu minta AI mengekstrak pola panjang kalimat dan kosakata khas Anda.",
        "Gunakan AI sebagai mitra penyunting struktur dan penguji argumen, sementara keputusan akhir diksi tetap berada di tangan Anda."
      ]
    },
    {
      id: "art-6",
      title: "Checklist Sebelum Meluncurkan Produk Digital Berbasis AI",
      excerpt: "Enam titik pemeriksaan teknis dan pengalaman pengguna agar aplikasi ringan, responsif, dan bebas tautan mati.",
      tags: ["AI Agent & MCP", "Mulai dari Nol"],
      readTime: "4 mnt baca",
      date: "27 Okt 2026",
      content: [
        "Sebelum membagikan tautan proyek ke publik, uji seluruh alur interaksi pada layar ponsel berukuran kecil maupun monitor desktop.",
        "Pastikan tidak ada tombol pajangan tanpa fungsi, periksa keterbacaan teks di atas latar belakang visual, dan pastikan waktu muat awal tetap instan tanpa ketergantungan aset berat.",
        "Kualitas produk sering kali ditentukan oleh kerapian detail kecil yang tidak disadari pengguna secara sadar, namun langsung terasa nyaman saat digunakan."
      ]
    }
  ]
};
