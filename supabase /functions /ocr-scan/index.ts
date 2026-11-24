// OPSIONAL: AI vision (Google Gemini) untuk scan screenshot hasil match (lebih akurat untuk nama pemain unik/Thai/Burma).
// Kunci API gratis/berbayar: https://aistudio.google.com/apikey
// Deploy:  supabase functions deploy ocr-scan
// Rahasia: supabase secrets set GEMINI_API_KEY=AIza...   (opsional: GEMINI_MODEL=gemini-2.5-flash)
// Lalu isi aiOcrUrl di project/config.js. Hanya admin yang sudah login yang bisa memanggilnya.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, status = 200) =>
  new Response(JSON.stringify(b), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const PROMPT = `Ini screenshot layar hasil akhir match Free Fire mode squad. Setiap baris peringkat berisi satu tim dengan 4 pemain dalam kotak 2x2, masing-masing dengan angka kill.
Baca SEMUA tim dari peringkat teratas ke terbawah, urutan pemain: kiri-atas, kanan-atas, kiri-bawah, kanan-bawah.
Tulis nama pemain persis seperti terlihat. Jika angka tidak terbaca, isi null (jangan menebak).
Balas HANYA JSON tanpa teks lain: {"teams":[{"place":1,"players":[{"name":"...","kills":3},{"name":"...","kills":3},{"name":"...","kills":1},{"name":"...","kills":2}]}]}`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  try {
    const sb = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: 'harus login admin' }, 401);

    const { image } = await req.json();
    const m = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+\/=]+)$/.exec(image ?? '');
    if (!m) return json({ error: 'gambar tidak valid' }, 400);
    if (m[2].length > 6_000_000) return json({ error: 'gambar terlalu besar' }, 413);

    const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: 'POST',
      headers: { 'x-goog-api-key': Deno.env.get('GEMINI_API_KEY')!, 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: m[1], data: m[2] } },
          { text: PROMPT },
        ] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    });
    const out = await r.json();
    if (!r.ok) return json({ error: out?.error?.message ?? `Gemini error ${r.status}` }, 502);
    const text: string = out?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text ?? '').join('') ?? '';
    const s = text.indexOf('{'), e = text.lastIndexOf('}');
    if (s < 0 || e < s) return json({ error: 'jawaban AI tidak terbaca' }, 502);
    const parsed = JSON.parse(text.slice(s, e + 1));
    if (!Array.isArray(parsed.teams)) return json({ error: 'format jawaban AI salah' }, 502);
    return json({ teams: parsed.teams });
  } catch (err) {
    return json({ error: String((err as Error)?.message ?? err) }, 500);
  }
});
