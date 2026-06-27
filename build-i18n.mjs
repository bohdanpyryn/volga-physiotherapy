// Pre-renders per-language static pages from index.html (the Albanian source).
// Generates /en/, /it/, /ru/, /uk/ index.html with content already in that language,
// correct <html lang>, <title>, canonical, og tags. hreflang lives in the source head.
// Usage: npm i jsdom && node build-i18n.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { JSDOM } from 'jsdom';

const BASE = 'https://volgafizioterapi.com';
const html = readFileSync('index.html', 'utf8');
const translations = eval('(' + html.match(/const translations = (\{[\s\S]*?\n\});/)[1] + ')');

const labels = { sq: 'SQ', en: 'EN', it: 'IT', ru: 'RU', uk: 'UK' };
const locale = { en: 'en_US', it: 'it_IT', ru: 'ru_RU', uk: 'uk_UA' };
const desc = {
  en: "Professional physiotherapy in Durrës, Albania - manual therapy, sports rehabilitation, post-op recovery and pain management. Mon-Sat 09:00-20:00. Call +355 69 401 3013.",
  it: "Fisioterapia professionale a Durrës, Albania - terapia manuale, riabilitazione sportiva, recupero post-operatorio e gestione del dolore. Lun-Sab 09:00-20:00. +355 69 401 3013.",
  ru: "Профессиональная физиотерапия в Дурресе, Албания - мануальная терапия, спортивная реабилитация и управление болью. Пн-Сб 09:00-20:00. +355 69 401 3013.",
  uk: "Професійна фізіотерапія в Дурресі, Албанія - мануальна терапія, спортивна реабілітація та управління болем. Пн-Сб 09:00-20:00. +355 69 401 3013.",
};

for (const lang of ['en', 'it', 'ru', 'uk']) {
  const t = translations[lang];
  const dom = new JSDOM(html);
  const d = dom.window.document;

  d.querySelectorAll('[data-i18n]').forEach(el => { const k = el.getAttribute('data-i18n'); if (t[k] !== undefined) el.textContent = t[k]; });
  d.querySelectorAll('[data-i18n-html]').forEach(el => { const k = el.getAttribute('data-i18n-html'); if (t[k] !== undefined) el.innerHTML = t[k]; });
  d.querySelectorAll('[data-i18n-placeholder]').forEach(el => { const k = el.getAttribute('data-i18n-placeholder'); if (t[k] !== undefined) el.setAttribute('placeholder', t[k]); });

  d.documentElement.setAttribute('lang', lang);
  d.querySelector('title').textContent = t['page.title'];
  const url = `${BASE}/${lang}/`;
  d.querySelector('link[rel="canonical"]').setAttribute('href', url);
  const set = (sel, val) => { const e = d.querySelector(sel); if (e) e.setAttribute('content', val); };
  set('meta[property="og:url"]', url);
  set('meta[property="og:locale"]', locale[lang]);
  set('meta[property="og:title"]', t['page.title']);
  set('meta[name="twitter:title"]', t['page.title']);
  set('meta[name="description"]', desc[lang]);
  set('meta[property="og:description"]', desc[lang]);
  set('meta[name="twitter:description"]', desc[lang]);

  d.querySelectorAll('.lang-option').forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === lang));
  d.querySelectorAll('.mobile-lang-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-lang') === lang));
  const cur = d.querySelector('.lang-current'); if (cur) cur.textContent = labels[lang];

  // serialize + make relative asset paths root-absolute (so they resolve under /xx/)
  let out = dom.serialize()
    .replace(/url\((?!\/|https?:|#|data:|['"])/g, 'url(/')
    .replace(/(src|href)="(?!\/|https?:|#|mailto:|tel:|data:)/g, '$1="/');

  mkdirSync(lang, { recursive: true });
  writeFileSync(`${lang}/index.html`, out);
  console.log(`wrote ${lang}/index.html (${(out.length / 1024).toFixed(0)} KB)`);
}
