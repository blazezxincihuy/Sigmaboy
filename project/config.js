// Isi dengan data dari Supabase: Project Settings > API
window.ZHXIN_CONFIG={
  supabaseUrl:'https://uerucpiqxygmpjdfntyp.supabase.co',        // contoh: https://abcdxyz.supabase.co
  supabaseAnonKey:'sb_publishable_n2hpAw_2YOWCxACYjb1qbg_luYQJD6j',     // anon public key (aman dipasang di halaman)
  // OPSIONAL - AI vision Gemini untuk scan screenshot (lebih akurat dari OCR biasa). Kosongkan = pakai OCR di browser.
  // Isi dengan URL Edge Function, contoh: 'https://abcdxyz.supabase.co/functions/v1/ocr-scan'
  // Cara deploy ada di supabase/functions/ocr-scan/index.ts
  aiOcrUrl:''
};
