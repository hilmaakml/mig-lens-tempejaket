/**
 * Indonesian message catalog. This object is the key contract: `MessageKey` is derived
 * from it and `en.ts` must supply exactly the same keys (CONVENTIONS.md 13.3).
 *
 * Safety-critical wording (upload warning, OCR review notice, payment recommendation,
 * verification message, complaint hand-off, product limitation) is copied verbatim from
 * PRD Appendix A and must not be reworded without a reviewed content change.
 */
export const idMessages = {
  // ---------------------------------------------------------------- app shell
  'app.name': 'MigranShield',
  'app.tagline': 'Periksa bukti sebelum membayar',
  'app.description':
    'MigranShield membantu menguraikan klaim dalam tawaran kerja ke luar negeri dan menunjukkan informasi yang masih perlu Anda verifikasi.',
  'app.skip_to_content': 'Lewati ke konten utama',
  'app.language_picker': 'Pilih bahasa / Choose language',
  'app.language_selected': 'Bahasa aktif: {language}',
  'app.language_indonesian': 'Bahasa Indonesia',
  'app.language_english': 'Bahasa Inggris',
  'app.back': 'Kembali',
  'app.demo_badge': 'Contoh hasil prototipe',
  'app.demo_badge_short': 'Contoh prototipe',

  'nav.home': 'Beranda',
  'nav.check': 'Periksa',
  'nav.learn': 'Latihan',
  'nav.history': 'Riwayat',
  'nav.label': 'Navigasi utama',

  // ---------------------------------------------------------------- statuses
  'status.source_match': 'Sesuai dengan sumber',
  'status.unverified': 'Belum dapat diverifikasi',
  'status.mismatch': 'Tidak sesuai',
  'status.risk_indicator': 'Indikator risiko ditemukan',

  'method.exact': 'Perbandingan persis',
  'method.normalized': 'Perbandingan setelah penyeragaman format',
  'method.partial': 'Perbandingan sebagian',
  'method.manual': 'Perlu diperiksa manual',
  'method.rule_based': 'Berdasarkan aturan',

  'tier.official_primary': 'Catatan resmi utama',
  'tier.official_guidance': 'Panduan atau kanal resmi',
  'tier.user_provided': 'Informasi dari pengguna',
  'tier.community_signal': 'Laporan komunitas',

  'category.company': 'Perusahaan / P3MI',
  'category.contact': 'Identitas & kanal penghubung',
  'category.vacancy': 'Lowongan',
  'category.contract': 'Kontrak',
  'category.visa': 'Visa',
  'category.payment': 'Biaya & pembayaran',
  'category.time_pressure': 'Tekanan waktu',

  // ---------------------------------------------------------------- sources
  'source.user_information': 'Informasi pengguna',
  'source.unknown': 'Sumber tidak dikenal',
  'source.siskop2mi_p3mi.name': 'SISKOP2MI — daftar P3MI',
  'source.siskop2mi_p3mi.purpose': 'Identitas dan detail perusahaan penempatan.',
  'source.siskop2mi_p3mi.limitation':
    'Terdaftarnya sebuah perusahaan tidak membuktikan bahwa orang yang menghubungi Anda mewakili perusahaan itu.',
  'source.siskop2mi_sanctions.name': 'SISKOP2MI — sanksi administratif',
  'source.siskop2mi_sanctions.purpose':
    'Status sanksi administratif perusahaan penempatan.',
  'source.siskop2mi_sanctions.limitation':
    'Status dapat berubah. Tanggal pengambilan data wajib diperhatikan.',
  'source.siskop2mi_vacancies.name': 'SISKOP2MI — daftar lowongan',
  'source.siskop2mi_vacancies.purpose': 'Pencocokan P3MI, posisi, dan negara tujuan.',
  'source.siskop2mi_vacancies.limitation':
    'Lowongan yang tidak ditemukan tidak membuktikan lowongan itu palsu.',
  'source.jdih.name': 'JDIH KP2MI/BP2MI',
  'source.jdih.purpose': 'Aturan biaya penempatan dan keputusan resmi.',
  'source.jdih.limitation':
    'Keberlakuan dan status aturan perlu ditinjau oleh orang yang berwenang.',
  'source.permen_17_2025.name': 'Permen P2MI/BP2MI No. 17 Tahun 2025',
  'source.permen_17_2025.purpose': 'Rujukan awal tata kelola biaya penempatan.',
  'source.permen_17_2025.limitation':
    'Jangan disederhanakan menjadi “semua biaya boleh” atau “semua biaya dilarang”. Ketentuan berbeda menurut negara tujuan, skema penempatan, dan jabatan.',
  'source.cekrekening.name': 'CekRekening',
  'source.cekrekening.purpose':
    'Pemeriksaan mandiri terhadap rekening bank atau e-wallet yang pernah dilaporkan.',
  'source.cekrekening.limitation':
    'Tidak adanya laporan tidak berarti rekening aman atau resmi.',
  'source.aduannomor.name': 'AduanNomor',
  'source.aduannomor.purpose':
    'Pemeriksaan mandiri terhadap nomor telepon yang pernah dilaporkan.',
  'source.aduannomor.limitation': 'Tidak adanya laporan tidak berarti nomor itu resmi.',
  'source.peduli_wni.name': 'Peduli WNI — Kemlu RI',
  'source.peduli_wni.purpose': 'Arahan konsuler dan prosedural bagi WNI di luar negeri.',
  'source.peduli_wni.limitation':
    'Sebagian layanan memerlukan pendaftaran atau akses institusional.',
  'source.kp2mi_complaint.name': 'Kanal pengaduan KP2MI/BP2MI',
  'source.kp2mi_complaint.purpose':
    'Pengaduan dugaan pelanggaran perekrutan atau penempatan.',
  'source.kp2mi_complaint.limitation':
    'Tautan pengaduan digital resmi belum ditinjau dan dimasukkan ke daftar sumber yang disetujui.',

  'source.retrieved_at': 'Data diambil: {date}',
  'source.checked_at': 'Diperiksa: {date}',
  'source.snapshot_note': 'Berdasarkan data uji yang diperbarui pada {date}.',
  'source.stale_note':
    'Data acuan sudah melewati batas kesegaran. Hasil ini tidak boleh dianggap pemeriksaan terkini.',
  'source.not_available': 'Belum dapat diperiksa',
  'source.open_external': 'Buka {name}',
  'source.destination_domain': 'Tujuan: {domain}',

  // ---------------------------------------------------------------- claims
  'claim.not_provided': 'Belum diisi',
  'claim.personal_account': 'Rekening pribadi',
  'claim.fee_breakdown_not_provided': 'Rincian biaya tertulis belum diberikan',
  'claim.same_day_deadline': 'Diminta membayar hari ini',
  'claim.recipient_differs': 'Penerima pembayaran berbeda dari perjanjian',
  'claim.purpose_differs': 'Tujuan atau nominal berbeda dari perjanjian',
  'claim.contract.provided': 'Draf kontrak sudah ada',
  'claim.contract.not_provided': 'Draf kontrak belum ada',
  'claim.contract.unknown': 'Status kontrak belum diisi',
  'claim.visa.provided': 'Dokumen visa sudah ada',
  'claim.visa.not_provided': 'Dokumen visa belum ada',
  'claim.visa.unknown': 'Status visa belum diisi',

  // ---------------------------------------------------------------- missing info
  'missing.contact_handle': 'Nomor atau akun yang menghubungi Anda.',
  'missing.official_contact_confirmation':
    'Konfirmasi dari kantor resmi bahwa kontak ini benar mewakili mereka.',
  'missing.account_type': 'Jenis rekening tujuan pembayaran.',
  'missing.official_payment_destination':
    'Tujuan pembayaran resmi beserta bukti tertulisnya.',
  'missing.written_fee_breakdown': 'Rincian biaya tertulis dari perusahaan.',
  'missing.deadline_information': 'Informasi tenggat pembayaran.',
  'missing.deadline_justification': 'Alasan resmi dan tertulis untuk tenggat waktu itu.',
  'missing.written_agreement': 'Perjanjian tertulis untuk dibandingkan.',
  'missing.recipient_explanation': 'Penjelasan tertulis mengapa penerima berbeda.',
  'missing.agreement_comparison':
    'Perbandingan dengan nominal dan tujuan pada perjanjian.',
  'missing.company_name': 'Nama perusahaan atau P3MI.',
  'missing.official_company_record': 'Catatan perusahaan pada sumber resmi.',
  'missing.sanction_confirmation': 'Konfirmasi status sanksi terkini.',
  'missing.licence_reconfirmation': 'Konfirmasi ulang nomor izin pada sumber resmi.',
  'missing.official_contact_list': 'Daftar kontak resmi perusahaan.',
  'missing.person_identity_confirmation':
    'Bukti bahwa orang yang memakai kontak ini benar bekerja untuk perusahaan itu.',
  'missing.vacancy_fields': 'Posisi, negara tujuan, dan nama perusahaan.',
  'missing.official_vacancy_link': 'Tautan lowongan resmi.',
  'missing.vacancy_detail_confirmation': 'Konfirmasi detail lowongan ke kanal resmi.',
  'missing.vacancy_country_explanation':
    'Penjelasan mengapa negara tujuan berbeda dari lowongan yang terdaftar.',
  'missing.contract_draft': 'Draf kontrak kerja tertulis.',
  'missing.contract_authenticity': 'Konfirmasi keaslian dan kelengkapan kontrak.',
  'missing.visa_type': 'Jenis dan proses visa yang akan digunakan.',
  'missing.visa_authenticity': 'Konfirmasi keaslian dokumen visa melalui kanal resmi.',

  // ---------------------------------------------------------------- company check
  'check.company.reason_missing_input':
    'Nama perusahaan belum diisi sehingga belum ada yang dapat dibandingkan.',
  'check.company.reason_source_unavailable':
    'Belum ada kumpulan data resmi yang disetujui di dalam aplikasi ini, sehingga nama perusahaan belum dapat diperiksa secara otomatis.',
  'check.company.reason_not_found':
    'Nama ini tidak ditemukan dalam cakupan sumber yang diperiksa.',
  'check.company.reason_match':
    'Nama perusahaan cocok dengan satu entri pada data yang diperiksa setelah penyeragaman format.',
  'check.company.reason_stale':
    'Entri yang cocok berasal dari data yang sudah melewati batas kesegaran, sehingga tidak dapat dianggap pemeriksaan terkini.',
  'check.company.finding_not_in_scope':
    'Tidak ditemukan dalam cakupan sumber yang diperiksa',
  'check.company.limitation':
    'Pemeriksaan ini hanya membandingkan nama. Ia tidak membuktikan kontak, lowongan, kontrak, visa, atau rekening apa pun.',
  'check.company.limitation_source_unavailable':
    'Karena sumber belum dapat diperiksa, hasil ini bukan berarti perusahaan tidak terdaftar.',
  'check.company.limitation_not_found':
    'Tidak ditemukan bukan berarti perusahaan ilegal. Cakupan sumber yang diperiksa terbatas.',
  'check.company.limitation_match':
    'Perusahaan yang terdaftar tidak membuktikan bahwa orang yang menghubungi Anda mewakili perusahaan itu.',
  'check.company.next_action_missing':
    'Isi nama perusahaan seperti tertulis pada tawaran.',
  'check.company.next_action_manual':
    'Buka direktori P3MI resmi dan cari nama perusahaan itu sendiri.',
  'check.company.next_action_match':
    'Buka sumber resmi, lalu cocokkan alamat kantor dan nomor izin dengan yang disebut penawar.',

  // ---------------------------------------------------------------- contact check
  'check.contact.reason_missing_input':
    'Nomor atau akun penghubung belum diisi atau belum dapat dibaca.',
  'check.contact.reason_no_record':
    'Belum ada catatan perusahaan yang cocok, sehingga kontak ini belum dapat dibandingkan dengan kontak resmi mana pun.',
  'check.contact.reason_not_listed':
    'Kontak ini tidak tercantum pada daftar kontak resmi yang diperiksa. Daftar tersebut belum tentu memuat seluruh kontak sah perusahaan.',
  'check.contact.reason_mismatch':
    'Sumber menyatakan daftar kontaknya lengkap, dan kontak ini berbeda dari kontak resmi yang tercantum.',
  'check.contact.reason_listed':
    'Kontak ini sama dengan salah satu kontak resmi yang tercantum pada sumber yang diperiksa.',
  'check.contact.finding_listed': 'Cocok dengan kontak yang tercantum pada sumber',
  'check.contact.finding_not_listed': 'Tidak tercantum pada sumber yang diperiksa',
  'check.contact.finding_not_listed_complete':
    'Berbeda dari kontak yang tercantum pada sumber',
  'check.contact.limitation':
    'Perusahaannya dapat saja ditemukan, tetapi identitas orang yang menghubungi Anda belum terbukti mewakili perusahaan tersebut.',
  'check.contact.limitation_listed':
    'Nomor yang sama dengan kontak resmi tidak membuktikan siapa orang yang memakainya saat ini.',
  'check.contact.next_action':
    'Hubungi kantor resmi memakai kontak dari sumber resmi — bukan nomor yang menghubungi Anda — lalu tanyakan apakah kontak ini benar mewakili mereka.',
  'check.contact.next_action_listed':
    'Tetap hubungi kantor resmi untuk memastikan siapa orang yang memakai kontak ini.',

  // ---------------------------------------------------------------- vacancy check
  'check.vacancy.reason_missing_input':
    'Posisi, negara tujuan, atau nama perusahaan belum lengkap.',
  'check.vacancy.reason_source_unavailable':
    'Sumber lowongan resmi belum dapat diperiksa dari dalam aplikasi ini.',
  'check.vacancy.reason_not_found':
    'Tidak ada lowongan yang cocok di dalam cakupan data yang diperiksa.',
  'check.vacancy.reason_match':
    'Posisi dan negara tujuan cocok dengan satu lowongan pada data yang diperiksa.',
  'check.vacancy.reason_mismatch':
    'Posisi yang sama ditemukan untuk perusahaan ini, tetapi negara tujuannya berbeda dari tawaran.',
  'check.vacancy.finding_not_in_scope':
    'Tidak ditemukan dalam cakupan sumber yang diperiksa',
  'check.vacancy.limitation':
    'Lowongan yang tidak ditemukan tidak membuktikan lowongan itu palsu, dan lowongan yang ditemukan tidak membuktikan tawaran yang Anda terima berasal darinya.',
  'check.vacancy.next_action': 'Minta tautan lowongan resmi kepada perusahaan.',
  'check.vacancy.next_action_match':
    'Cocokkan detail lowongan resmi itu dengan isi tawaran yang Anda terima.',

  // ---------------------------------------------------------------- contract & visa
  'check.contract.reason_provided':
    'Draf kontrak sudah Anda terima, tetapi isi dan keasliannya belum diperiksa oleh MigranShield.',
  'check.contract.reason_not_provided': 'Draf kontrak kerja tertulis belum diberikan.',
  'check.contract.reason_unknown': 'Status kontrak belum diisi.',
  'check.contract.limitation':
    'Dokumen telah tersedia, tetapi keasliannya belum dapat diverifikasi oleh MigranShield. Konfirmasikan melalui kanal resmi.',
  'check.contract.next_action':
    'Minta draf kontrak kerja tertulis sebelum melakukan tindakan apa pun.',
  'check.contract.next_action_provided':
    'Periksa kelengkapan kontrak: identitas pemberi kerja, pekerjaan, upah, durasi, dan komponen biaya.',
  'check.visa.reason_provided':
    'Dokumen visa disebut sudah ada, tetapi keasliannya belum dapat diperiksa dari gambar atau keterangan.',
  'check.visa.reason_not_provided': 'Dokumen dan jenis visa belum tersedia.',
  'check.visa.reason_unknown': 'Status visa belum diisi.',
  'check.visa.limitation':
    'Dokumen telah tersedia, tetapi keasliannya belum dapat diverifikasi oleh MigranShield. Konfirmasikan melalui kanal resmi.',
  'check.visa.next_action':
    'Minta penjelasan jenis dan proses visa, lalu konfirmasi ke kanal resmi negara tujuan.',

  // ---------------------------------------------------------------- payment rules
  'rule.payment_contact_unverified.reason':
    'Orang atau nomor yang meminta pembayaran belum terbukti mewakili perusahaan.',
  'rule.payment_contact_unverified.reason_missing':
    'Kontak penghubung belum diisi sehingga aturan ini belum dapat dinilai.',
  'rule.payment_contact_unverified.finding': 'Kontak pengirim belum dapat diverifikasi',
  'rule.payment_contact_unverified.limitation':
    'Kontak yang belum terverifikasi bukan bukti penipuan; ia adalah informasi yang masih harus dikonfirmasi.',
  'rule.payment_contact_unverified.next_action':
    'Konfirmasikan identitas penghubung melalui kontak resmi yang Anda dapatkan sendiri dari sumber resmi.',
  'rule.payment_personal_account.reason':
    'Pembayaran diminta ke rekening pribadi yang belum dapat dicocokkan dengan tujuan pembayaran resmi.',
  'rule.payment_personal_account.reason_missing':
    'Jenis rekening tujuan belum diisi sehingga aturan ini belum dapat dinilai.',
  'rule.payment_personal_account.finding':
    'Pembayaran ke rekening pribadi yang belum terverifikasi',
  'rule.payment_personal_account.limitation':
    'Pembayaran ke rekening pribadi tidak selalu berarti penipuan, tetapi uang yang sudah dikirim ke rekening pribadi sulit ditarik kembali.',
  'rule.payment_personal_account.next_action':
    'Minta tujuan pembayaran resmi atas nama perusahaan beserta bukti tertulisnya.',
  'rule.payment_no_fee_breakdown.reason':
    'Belum ada rincian biaya tertulis yang menjelaskan komponen dan dasar penagihannya.',
  'rule.payment_no_fee_breakdown.reason_missing':
    'Ketersediaan rincian biaya tertulis belum diisi sehingga aturan ini belum dapat dinilai.',
  'rule.payment_no_fee_breakdown.finding': 'Rincian biaya tertulis belum diberikan',
  'rule.payment_no_fee_breakdown.limitation':
    'Besaran biaya penempatan yang boleh dibebankan berbeda menurut negara tujuan, skema, dan jabatan. MigranShield tidak menyatakan bahwa PMI tidak boleh dibebani biaya apa pun.',
  'rule.payment_no_fee_breakdown.next_action':
    'Minta rincian biaya tertulis beserta dasar aturannya sebelum membayar.',
  'rule.time_pressure.reason':
    'Anda diminta memindahkan uang pada hari yang sama, sehingga tidak ada waktu untuk verifikasi.',
  'rule.time_pressure.reason_missing':
    'Tenggat pembayaran belum diisi sehingga aturan ini belum dapat dinilai.',
  'rule.time_pressure.finding': 'Diminta melakukan transfer pada hari yang sama',
  'rule.time_pressure.limitation':
    'Tenggat yang mendesak tidak selalu berarti penipuan, tetapi tenggat resmi biasanya dapat dijelaskan secara tertulis.',
  'rule.time_pressure.next_action':
    'Minta alasan tenggat itu secara tertulis, dan jangan membayar sebelum verifikasi selesai.',
  'rule.payment_recipient_differs.reason':
    'Penerima pembayaran berbeda dari pihak yang disebut dalam perjanjian yang Anda tinjau.',
  'rule.payment_recipient_differs.reason_missing':
    'Belum ada perjanjian tertulis yang dapat dibandingkan dengan penerima pembayaran.',
  'rule.payment_recipient_differs.finding': 'Penerima pembayaran berbeda dari perjanjian',
  'rule.payment_recipient_differs.limitation':
    'Perbedaan penerima dapat memiliki penjelasan sah, tetapi penjelasan itu harus tertulis dan dapat diverifikasi.',
  'rule.payment_recipient_differs.next_action':
    'Minta penjelasan tertulis dan konfirmasi ke kantor resmi sebelum mengirim uang.',
  'rule.payment_purpose_differs.reason':
    'Tujuan atau nominal pembayaran berbeda dari yang tertulis pada perjanjian.',
  'rule.payment_purpose_differs.reason_missing':
    'Belum ada perjanjian tertulis yang dapat dibandingkan dengan tujuan pembayaran.',
  'rule.payment_purpose_differs.finding': 'Tujuan atau nominal berbeda dari perjanjian',
  'rule.payment_purpose_differs.limitation':
    'Perubahan biaya dapat terjadi, tetapi perubahan resmi selalu dapat ditunjukkan secara tertulis.',
  'rule.payment_purpose_differs.next_action':
    'Minta perjanjian yang diperbarui secara tertulis sebelum membayar.',

  // ---------------------------------------------------------------- home
  'home.hero.eyebrow': 'PERIKSA SEBELUM BAYAR',
  'home.hero.title': 'Sudah dapat tawaran kerja ke luar negeri?',
  'home.hero.body':
    'Unggah chat atau poster tawaran. MigranShield membantu menguraikan klaimnya dan menunjukkan apa yang masih perlu Anda verifikasi.',
  'home.hero.cta': 'Periksa Tawaran',
  'home.scope_notice':
    'MigranShield memetakan bukti dan informasi yang masih kurang. Aplikasi ini tidak menjamin sebuah tawaran aman maupun menyatakan sebuah tawaran pasti penipuan.',
  'home.privacy_reminder':
    'Sebelum mengunggah: jangan unggah KTP, paspor, nomor identitas, atau dokumen yang memuat data pribadi sensitif.',
  'home.learning.title': 'Latihan Literasi Digital',
  'home.learning.body': 'Kenali pola manipulasi dan cara verifikasi mandiri.',
  'home.progress.title': 'Kesiapan verifikasi',
  'home.progress.value': '{done}/{total}',
  'home.progress.body': '{done} dari {total} langkah verifikasi inti sudah Anda latih.',
  'home.scenario.section': 'Skenario komposit',
  'home.scenario.note': 'Disusun dari pola kasus yang dilaporkan — bukan individu nyata.',
  'home.scenario.title': '“Siti” — caregiver Taiwan',
  'home.scenario.quote': '“Dia tahu nama dan alamat saya, jadi saya kira resmi…”',

  // ---------------------------------------------------------------- upload
  'upload.title': 'Unggah Tawaran',
  'upload.privacy_warning_title': 'Jaga data pribadi Anda.',
  'upload.privacy_warning':
    'Jangan unggah KTP, paspor, nomor identitas, atau dokumen yang memuat data pribadi sensitif.',
  'upload.dropzone_title': 'Unggah chat, poster, atau tawaran',
  'upload.formats': 'JPG, PNG, atau WebP (maksimal 10 MB)',
  'upload.method_camera': 'Kamera',
  'upload.method_file': 'File',
  'upload.method_manual': 'Tulis Manual',
  'upload.ai_note':
    'Pembacaan teks berjalan di perangkat Anda dan hanya membantu mengisi formulir. Anda tetap memeriksa dan memperbaikinya di langkah berikutnya.',
  'upload.local_note':
    'Gambar tidak dikirim ke server MigranShield. Pembacaan teks berjalan di peramban Anda.',
  'upload.demo_button': 'Gunakan contoh tawaran (demo)',
  'upload.demo_note':
    'Contoh tawaran memakai data uji yang sepenuhnya fiktif dan diberi label “Contoh hasil prototipe”.',
  'upload.selected_file': 'Berkas dipilih: {name}',
  'upload.start_ocr': 'Baca teks dari gambar',
  'upload.ocr_progress': 'Membaca teks… {percent}%',
  'upload.ocr_cancel': 'Batalkan pembacaan',
  'upload.ocr_failed_title': 'Teks tidak dapat dibaca',
  'upload.ocr_failed_body':
    'Pembacaan teks tidak dapat diselesaikan di perangkat ini. Informasi Anda tidak hilang — lanjutkan dengan mengisi formulir secara manual.',
  'upload.ocr_manual_fallback': 'Isi manual saja',
  'upload.error.too_large':
    'Ukuran berkas melebihi 10 MB. Pilih gambar yang lebih kecil.',
  'upload.error.unsupported':
    'Format berkas tidak didukung. Gunakan JPG, PNG, atau WebP.',
  'upload.error.signature': 'Isi berkas tidak cocok dengan formatnya. Pilih gambar lain.',
  'upload.error.decode': 'Gambar tidak dapat dibuka. Pilih gambar lain.',
  'upload.error.dimensions':
    'Ukuran gambar terlalu besar untuk diproses di perangkat ini. Pilih gambar lain.',
  'upload.error_title': 'Berkas belum dapat digunakan',

  // ---------------------------------------------------------------- confirmation
  'confirm.title': 'Konfirmasi Informasi',
  'confirm.notice':
    'Periksa kembali informasi berikut. Sistem dapat keliru membaca teks pada gambar.',
  'confirm.needs_check': 'perlu dicek',
  'confirm.empty': 'Belum diisi',
  'confirm.extraction_source': 'Sumber pengisian: {source}',
  'confirm.extraction_source_ocr': 'pembacaan teks di perangkat Anda',
  'confirm.extraction_source_manual': 'isian manual Anda',
  'confirm.extraction_source_demo': 'contoh tawaran (data uji)',
  'confirm.submit': 'Lanjutkan pemeriksaan',
  'confirm.back_to_upload': 'Kembali ke langkah unggah',
  'confirm.section_offer': 'Tawaran',
  'confirm.section_contact': 'Kontak penghubung',
  'confirm.section_payment': 'Pembayaran',
  'confirm.section_documents': 'Dokumen dan tenggat',
  'confirm.validation_summary': 'Periksa {count} isian berikut sebelum melanjutkan.',

  'field.companyName': 'Perusahaan / P3MI',
  'field.recruiterName': 'Nama perekrut',
  'field.position': 'Posisi pekerjaan',
  'field.destinationCountry': 'Negara tujuan',
  'field.offerOrigin': 'Asal tawaran',
  'field.contactChannel': 'Jenis kanal penghubung',
  'field.contactHandle': 'Nomor / akun penghubung',
  'field.paymentAmount': 'Nominal biaya diminta',
  'field.paymentPurpose': 'Alasan pembayaran',
  'field.paymentRecipient': 'Nama penerima',
  'field.accountType': 'Jenis rekening',
  'field.writtenFeeBreakdown': 'Rincian biaya tertulis',
  'field.receipt': 'Kuitansi atau bukti pembayaran',
  'field.recipientVsAgreement': 'Penerima dibanding perjanjian tertulis',
  'field.purposeVsAgreement': 'Tujuan/nominal dibanding perjanjian tertulis',
  'field.officialChannelConfirmation': 'Konfirmasi lewat kanal resmi',
  'field.contractStatus': 'Status kontrak',
  'field.visaStatus': 'Status visa',
  'field.visaType': 'Jenis visa',
  'field.timePressure': 'Tenggat pembayaran',
  'field.paymentDeadlineNote': 'Catatan tenggat',

  'option.account.personal': 'Rekening pribadi',
  'option.account.company': 'Rekening perusahaan',
  'option.account.unknown': 'Belum diketahui',
  'option.document.provided': 'Sudah ada',
  'option.document.not_provided': 'Belum ada',
  'option.document.unknown': 'Belum diketahui',
  'option.agreement.same': 'Sama dengan perjanjian',
  'option.agreement.different': 'Berbeda dari perjanjian',
  'option.agreement.unknown': 'Belum ada perjanjian tertulis',
  'option.confirmation.done': 'Sudah dikonfirmasi',
  'option.confirmation.not_done': 'Belum dikonfirmasi',
  'option.confirmation.unknown': 'Belum diketahui',
  'option.time.same_day': 'Hari ini juga',
  'option.time.within_days': 'Beberapa hari lagi',
  'option.time.no_deadline': 'Tidak ada tenggat',
  'option.time.unknown': 'Belum diketahui',
  'option.channel.whatsapp': 'WhatsApp',
  'option.channel.phone': 'Telepon',
  'option.channel.sms': 'SMS',
  'option.channel.email': 'Email',
  'option.channel.social': 'Media sosial',
  'option.channel.unknown': 'Belum diketahui',

  // ---------------------------------------------------------------- result
  'result.title': 'Hasil Pemeriksaan',
  'result.recommendation.delay_payment.headline': 'Tunda pembayaran dulu',
  'result.recommendation.delay_payment.body':
    'Tunda pembayaran sampai identitas penghubung, rincian biaya, dan tujuan pembayaran dapat diverifikasi melalui kanal resmi.',
  'result.recommendation.verify_before_acting.headline':
    'Verifikasi dulu sebelum bertindak',
  'result.recommendation.verify_before_acting.body':
    'Masih ada bagian yang belum dapat diverifikasi. Lengkapi bukti melalui kanal resmi sebelum membayar, mengirim dokumen, menandatangani, atau berangkat.',
  'result.recommendation.no_indicator_triggered.headline':
    'Tidak ada indikator risiko yang terpicu',
  'result.recommendation.no_indicator_triggered.body':
    'Dari informasi yang Anda konfirmasi, tidak ada aturan yang terpicu. Ini bukan jaminan bahwa tawaran aman. Tetap verifikasi melalui kanal resmi sebelum membayar atau berangkat.',
  'result.indicator_count': '{count} indikator risiko ditemukan',
  'result.indicator_count_zero': 'Tidak ada indikator risiko yang terpicu',
  'result.indicator_list_label': 'Daftar indikator risiko yang terpicu',
  'result.section_verification': 'Verifikasi',
  'result.section_evidence': 'Peta bukti',
  'result.section_actions': 'Tindakan aman',
  'result.company_card': 'Perusahaan / P3MI',
  'result.contact_card': 'Kanal Penghubung',
  'result.company_found_badge': 'Ditemukan di sumber resmi',
  'result.contact_separation_notice':
    'Perusahaannya ditemukan, tetapi identitas orang yang menghubungi Anda belum terbukti mewakili perusahaan tersebut.',
  'result.next_step_label': 'Langkah berikutnya',
  'result.payment_check': 'Pemeriksaan Pembayaran',
  'result.payment_check_summary': '{amount} · {account}',
  'result.payment_item.amount': 'Nominal pembayaran',
  'result.payment_item.purpose': 'Alasan pembayaran',
  'result.payment_item.recipient': 'Nama penerima',
  'result.payment_item.account_type': 'Jenis rekening',
  'result.payment_item.fee_breakdown': 'Rincian biaya tertulis',
  'result.payment_item.receipt': 'Kuitansi / bukti',
  'result.payment_item.time_pressure': 'Tekanan waktu',
  'result.payment_item.official_confirmation': 'Konfirmasi kanal resmi',
  'result.payment_badge_risk': 'indikator risiko',
  'result.payment_badge_unknown': 'belum ada',
  'result.payment_badge_info': 'informasi',
  'result.evidence_claim': 'Klaim',
  'result.evidence_finding': 'Temuan',
  'result.evidence_status': 'Status',
  'result.evidence_reason': 'Alasan',
  'result.evidence_source': 'Sumber',
  'result.evidence_method': 'Metode perbandingan',
  'result.evidence_missing': 'Masih kurang',
  'result.evidence_limitation': 'Batas pemeriksaan ini',
  'result.evidence_next': 'Berikutnya',
  'result.evidence_rule': 'Aturan {ruleId} versi {ruleVersion}',
  'result.evidence_snapshot': 'Versi data: {snapshotId}',
  'result.action_message': 'Buat pesan verifikasi',
  'result.action_sources': 'Lihat sumber resmi',
  'result.action_share': 'Bagikan ringkasan',
  'result.action_contact': 'Hubungi melalui kontak resmi',
  'result.action_complaint': 'Laporkan tawaran atau kontak mencurigakan',
  'result.exercise_eyebrow': 'LATIHAN PERSONAL',
  'result.exercise_title': 'Latih bagian yang masih perlu Anda verifikasi.',
  'result.exercise_reason':
    'Latihan ini direkomendasikan berdasarkan bagian yang masih perlu Anda verifikasi.',
  'result.exercise_cta': 'Mulai latihan personal',
  'result.limitation':
    'MigranShield membantu menguraikan klaim, membandingkan bukti, dan menunjukkan informasi yang masih perlu diverifikasi. Hasil ini bukan keputusan hukum atau jaminan bahwa suatu tawaran aman maupun penipuan.',
  'result.no_state_title': 'Data pemeriksaan tidak tersedia lagi',
  'result.no_state_body':
    'Informasi tawaran hanya disimpan di memori selama sesi berjalan dan hilang ketika halaman dimuat ulang. Tidak ada data Anda yang tersimpan. Mulai kembali dari langkah unggah atau isian manual.',
  'result.no_state_cta': 'Mulai pemeriksaan baru',

  // ---------------------------------------------------------------- official channels
  'channels.title': 'Kanal Resmi',
  'channels.intro':
    'Tombol berikut mengarahkan Anda ke layanan resmi untuk verifikasi mandiri. MigranShield tidak membuat laporan otomatis dan tidak mengirim isi tawaran Anda.',
  'channels.section_verify': 'Untuk verifikasi mandiri',
  'channels.section_complaint': 'Kanal pengaduan resmi',
  'channels.official_contact_title': 'Kontak resmi perusahaan',
  'channels.official_contact_body':
    'Hubungi nomor kantor yang tercantum pada sumber resmi, bukan nomor yang menghubungi Anda.',
  'channels.official_contact_unavailable':
    'Belum ada kontak resmi dari sumber yang disetujui untuk ditampilkan. Cari sendiri kontak kantor pada direktori resmi.',
  'channels.recommended': 'Direkomendasikan untuk kasus Anda',
  'channels.report_object': 'Yang dapat dilaporkan',
  'channels.why': 'Mengapa kanal ini relevan',
  'channels.evidence_hint': 'Bukti yang mungkin perlu Anda siapkan',
  'channels.limitation': 'Batas layanan ini',
  'channels.handoff_notice':
    'Anda akan membuka layanan resmi di luar MigranShield. MigranShield tidak mengirim laporan atau data tawaran secara otomatis. Periksa kembali informasi yang ingin Anda berikan pada layanan tersebut.',
  'channels.unavailable_title': 'Kanal pengaduan digital belum tersedia',
  'channels.unavailable_body':
    'Belum ada tautan pengaduan digital resmi yang sudah ditinjau dan dimasukkan ke daftar sumber yang disetujui. MigranShield tidak akan menampilkan tautan yang belum diverifikasi.',
  'channels.alternative': 'Alternatif resmi yang tersedia',
  'channels.no_data_transmitted':
    'Tidak ada isi tawaran, nomor, rekening, atau hasil pemeriksaan yang dikirim ke layanan tersebut oleh MigranShield.',

  // ---------------------------------------------------------------- complaints
  'complaint.aduannomor.object': 'Nomor telepon atau akun yang menghubungi Anda.',
  'complaint.aduannomor.why':
    'Layanan ini dipakai untuk memeriksa dan melaporkan nomor telepon yang diduga dipakai untuk penipuan.',
  'complaint.aduannomor.evidence':
    'Nomor lengkap, tangkapan layar percakapan, dan waktu kejadian. Siapkan sendiri; MigranShield tidak melampirkannya.',
  'complaint.aduannomor.limitation':
    'Tidak adanya laporan pada layanan ini tidak membuktikan bahwa nomor tersebut resmi.',
  'complaint.aduannomor.recommended_because':
    'Direkomendasikan karena identitas kontak penghubung belum dapat diverifikasi.',
  'complaint.cekrekening.object': 'Rekening bank atau e-wallet tujuan pembayaran.',
  'complaint.cekrekening.why':
    'Layanan ini dipakai untuk memeriksa dan melaporkan rekening yang diduga dipakai untuk tindak pidana.',
  'complaint.cekrekening.evidence':
    'Nomor rekening, nama pemilik, bukti transaksi bila ada. Siapkan sendiri; MigranShield tidak melampirkannya.',
  'complaint.cekrekening.limitation':
    'Tidak adanya laporan pada layanan ini tidak membuktikan bahwa rekening aman atau resmi.',
  'complaint.cekrekening.recommended_because':
    'Direkomendasikan karena pembayaran diminta ke rekening yang belum dapat diverifikasi.',
  'complaint.kp2mi.object':
    'Dugaan pelanggaran perekrutan atau penempatan oleh P3MI atau perantara.',
  'complaint.kp2mi.why':
    'Perekrutan dan penempatan pekerja migran diawasi oleh KP2MI/BP2MI.',
  'complaint.kp2mi.evidence':
    'Identitas perusahaan atau perantara, isi tawaran, dan kronologi. Siapkan sendiri; MigranShield tidak melampirkannya.',
  'complaint.kp2mi.limitation':
    'Melaporkan bukan berarti laporan langsung diterima, diselidiki, atau diselesaikan.',
  'complaint.kp2mi.recommended_because':
    'Direkomendasikan karena tawaran ini menyangkut perusahaan penempatan dan lowongan kerja luar negeri.',
  'complaint.peduli_wni.object':
    'Kebutuhan bantuan konsuler atau prosedural bagi WNI di luar negeri.',
  'complaint.peduli_wni.why':
    'Perwakilan RI di luar negeri menangani bantuan konsuler bagi WNI.',
  'complaint.peduli_wni.evidence':
    'Identitas diri, lokasi, dan uraian keadaan. Siapkan sendiri; MigranShield tidak melampirkannya.',
  'complaint.peduli_wni.limitation':
    'Sebagian layanan memerlukan pendaftaran atau informasi tambahan pada layanan resmi tersebut.',

  // ---------------------------------------------------------------- message
  'message.title': 'Pesan Verifikasi',
  'message.intro':
    'Kirim pesan ini ke kontak resmi perusahaan untuk meminta bukti sebelum Anda mengambil tindakan apa pun.',
  'message.preview_label': 'Pratinjau pesan',
  'message.body':
    'Mohon kirimkan tautan lowongan resmi, nama dan nomor izin P3MI, draf kontrak, rincian biaya tertulis, serta kontak kantor resmi yang dapat saya hubungi untuk melakukan verifikasi.',
  'message.copy': 'Salin pesan',
  'message.copied': 'Pesan disalin.',
  'message.copy_failed':
    'Pesan belum dapat disalin. Salin manual dari pratinjau di atas.',
  'message.view_channels': 'Lihat kontak resmi',

  // ---------------------------------------------------------------- share
  'share.title': 'Bagikan Ringkasan',
  'share.privacy_note':
    'Ringkasan ini tidak memuat gambar asli, teks hasil pembacaan, nomor telepon lengkap, nomor rekening, nomor identitas, atau nama lengkap Anda.',
  'share.preview_label': 'Pratinjau ringkasan',
  'share.recommendation': 'Rekomendasi: {recommendation}',
  'share.position': 'Posisi: {position}',
  'share.country': 'Negara tujuan: {country}',
  'share.contact': 'Kontak penghubung: {contact} (disamarkan)',
  'share.indicators': '{count} indikator risiko ditemukan',
  'share.category_line': '{category}: {status}',
  'share.checked_at': 'Diperiksa: {date}',
  'share.footer': 'MigranShield · bukan keputusan hukum',
  'share.copy': 'Salin ringkasan',
  'share.copied': 'Ringkasan disalin.',
  'share.share_menu': 'Bagikan ke keluarga atau pendamping',
  'share.share_warning':
    'Menu berbagi milik perangkat atau peramban berada di luar kendali MigranShield.',

  // ---------------------------------------------------------------- learning
  'learn.title': 'Latihan Literasi',
  'learn.intro':
    'Latihan ini direkomendasikan berdasarkan bagian yang masih perlu Anda verifikasi.',
  'learn.intro_no_result':
    'Belum ada hasil pemeriksaan pada sesi ini. Anda tetap dapat mencoba seluruh latihan di bawah.',
  'learn.recommended_for_you': 'Direkomendasikan untuk Anda',
  'learn.all_exercises': 'Semua latihan',
  'learn.no_scenario_yet': 'Skenario latihan untuk bagian ini belum tersedia.',
  'learn.pattern_cta': 'Pelajari pola manipulasi',
  'learn.progress_label': 'Sudah dikenali dalam {done} dari {total} latihan.',
  'exercise.identity_misuse.title': 'Pencatutan Identitas Lembaga',
  'exercise.identity_misuse.reason': 'Karena kontak penghubung belum dapat diverifikasi.',
  'exercise.urgency.title': 'Urgensi dan Tekanan Waktu',
  'exercise.urgency.reason': 'Karena Anda ditekan untuk membayar hari ini.',
  'exercise.written_evidence.title': 'Meminta Bukti Tertulis',
  'exercise.written_evidence.reason': 'Karena kontrak belum tersedia.',
  'exercise.payment_destination.title': 'Memeriksa Tujuan Pembayaran',
  'exercise.payment_destination.reason': 'Karena pembayaran diminta ke rekening pribadi.',

  // ---------------------------------------------------------------- simulation
  'sim.title': 'Simulasi Perekrut',
  'sim.badge': 'Latihan',
  'sim.scenario': 'Skenario: tawaran caregiver Taiwan (komposit)',
  'sim.message':
    '“Selamat! Anda lolos seleksi caregiver di Taiwan. Kuota tinggal 2 — transfer biaya administrasi Rp7.500.000 hari ini juga agar slot tidak hangus.”',
  'sim.tactic_authority': 'Taktik otoritas',
  'sim.tactic_urgency': 'Taktik urgensi',
  'sim.question': 'Apa respons paling aman?',
  'sim.option_transfer': 'Baik, saya transfer sekarang juga.',
  'sim.option_verify':
    'Saya perlu verifikasi dulu. Mohon kirim nama dan nomor izin P3MI resmi, kontrak kerja, dan rincian biaya tertulis.',
  'sim.option_negotiate': 'Bisa kurang tidak biayanya?',
  'sim.safe_title': 'Tepat. Anda menunda dan meminta bukti resmi.',
  'sim.safe_body':
    'Menunda untuk verifikasi memutus taktik urgensi. Minta nama dan nomor izin P3MI, kontrak, serta rincian biaya melalui kanal resmi sebelum tindakan apa pun.',
  'sim.unsafe_title': 'Hati-hati — ini yang diincar pelaku penipuan.',
  'sim.unsafe_body':
    'Mentransfer sekarang atau menawar harga sama-sama melewati verifikasi. Uang yang sudah masuk ke rekening pribadi hampir mustahil ditarik kembali.',
  'sim.retry': 'Coba respons lain',
  'sim.see_patterns': 'Lihat pembongkaran pola',

  // ---------------------------------------------------------------- patterns
  'pattern.title': 'Pembongkaran Pola',
  'pattern.intro':
    'Banyak kasus yang dipelajari memakai kombinasi pola berikut. Mengenali urutannya membantu Anda berhenti dan memverifikasi.',
  'pattern.authority.title': 'Otoritas',
  'pattern.authority.quote': '“Anda lolos seleksi caregiver di Taiwan…”',
  'pattern.authority.body':
    'Mengaku dari instansi atau agen resmi supaya Anda percaya tanpa mengecek.',
  'pattern.urgency.title': 'Urgensi',
  'pattern.urgency.quote': '“Kuota tinggal 2 — hari ini juga.”',
  'pattern.urgency.body':
    'Menekan waktu agar Anda tidak sempat berpikir jernih atau memverifikasi.',
  'pattern.skip.title': 'Melewati prosedur',
  'pattern.skip.quote': '“Tidak perlu kontrak dulu, urus belakangan.”',
  'pattern.skip.body':
    'Melompati kontrak kerja dan proses P3MI resmi — langkah yang seharusnya wajib.',
  'pattern.payment.title': 'Minta bayar',
  'pattern.payment.quote': '“Transfer Rp7.500.000 ke rekening ini.”',
  'pattern.payment.body':
    'Ujungnya sering sama: uang ke rekening pribadi sebelum bukti apa pun diberikan.',
  'pattern.closing':
    'Permintaan pembayaran ke rekening pribadi yang belum dapat diverifikasi merupakan indikator risiko.',
  'pattern.scenario_cta': 'Lihat skenario komposit',

  // ---------------------------------------------------------------- scenario
  'scenario.title': 'Skenario Komposit',
  'scenario.notice':
    'Skenario komposit berdasarkan pola kasus yang dilaporkan. Bukan individu nyata; nama dan detail disamarkan.',
  'scenario.illustration': 'ilustrasi komposit',
  'scenario.name': '“Siti” (komposit)',
  'scenario.subtitle': 'Pola kasus caregiver, Taiwan',
  'scenario.quote':
    'Dia tahu nama lengkap dan alamat saya, jadi saya kira ini resmi. Padahal itu hanya cara membuat saya percaya tanpa mengecek.',
  'scenario.lessons': 'Yang bisa dipelajari',
  'scenario.lesson_1':
    'Mengetahui data pribadi Anda bukan tanda resmi — data mudah bocor atau diperjualbelikan.',
  'scenario.lesson_2':
    '“Hari ini juga” adalah taktik urgensi — alasan untuk berhenti dan mengecek, bukan untuk buru-buru.',
  'scenario.lesson_3':
    'Pembayaran ke rekening pribadi tanpa rincian tertulis berarti berhenti dan verifikasi ke kanal resmi.',
  'scenario.cta': 'Latih skenario ini',

  // ---------------------------------------------------------------- progress
  'progress.title': 'Kemajuan',
  'progress.readiness_title': 'Kesiapan verifikasi',
  'progress.readiness_body':
    'Dihitung dari {total} langkah verifikasi inti: perusahaan, kontak, kontrak, biaya, dan tekanan waktu. Anda sudah melatih {done} dari {total}.',
  'progress.per_tactic': 'Kemajuan per latihan',
  'progress.history': 'Riwayat pemeriksaan',
  'progress.history_note':
    'Riwayat disimpan di perangkat Anda sendiri dan hanya memuat tanggal, jumlah indikator, serta versi aturan. Isi tawaran, nama, nomor, dan nominal tidak pernah disimpan. Maksimal 20 pemeriksaan terakhir.',
  'progress.history_empty':
    'Belum ada pemeriksaan. Riwayat akan muncul di sini setelah Anda menyelesaikan pemeriksaan tawaran.',
  'progress.history_entry': 'Pemeriksaan tawaran',
  'progress.indicator_badge': '{count} indikator risiko',
  'progress.reset': 'Hapus kemajuan dan riwayat',
  'progress.reset_confirm':
    'Kemajuan latihan dan seluruh riwayat pemeriksaan di perangkat ini akan dihapus dan tidak dapat dikembalikan. Pilihan bahasa tetap tersimpan.',
  'progress.reset_confirm_action': 'Ya, hapus sekarang',
  'progress.reset_cancel': 'Batal',
  'progress.reset_done': 'Kemajuan dan riwayat dihapus.',

  // ---------------------------------------------------------------- errors
  'error.title': 'Terjadi kesalahan',
  'error.body':
    'Langkah ini tidak dapat diselesaikan. Informasi yang sudah Anda isi pada sesi ini tetap berlaku kecuali dinyatakan lain.',
  'error.retry': 'Coba lagi',
  'error.not_found_title': 'Halaman tidak ditemukan',
  'error.not_found_body': 'Halaman yang Anda tuju tidak tersedia.',
  'error.go_home': 'Kembali ke beranda',
  'offline.title': 'Anda sedang luring',
  'offline.body':
    'Sebagian isi aplikasi tersedia luring. Pemeriksaan yang memerlukan sumber resmi baru dapat dilakukan setelah koneksi kembali.',
} as const;

export type IdMessages = typeof idMessages;
