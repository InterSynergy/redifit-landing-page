// Redifit landing — konfiguracja Eleventy.
//
// Teksty:   src/_data/i18n/<lang>.json  (te same klucze w każdym języku)
// Języki:   src/_data/languages.json
// Wspólne:  src/_data/site.json        (kontakt, sociale, ...)
//
// W szablonach:
//   {% t "home.hero.h1" %}      tekst (może zawierać HTML)
//   {% tp "faq.….a" %}           tekst z akapitami (pusta linia w JSON = nowy akapit)
//   {% ta "home.hero.img_alt" %} tekst do atrybutu (escapowany)
//   {% url "faq" %}             link do strony w bieżącym języku
//   {% url "faq", "en" %}       link do strony w innym języku
//   {% asset "css/styles.css" %} ścieżka do pliku statycznego
//
// W tekstach (JSON) można używać:
//   {url:faq}  {url:faq#sekcja}  {url:faq@en}   — link do strony
//   {site:contact.email}                         — wartość z site.json
//   {num:pricing.onlineFeeFixed}                 — liczba z site.json w formacie języka (0,49 / 0.49)

import fs from "node:fs";
import path from "node:path";

const SRC = "src";
const DATA = path.join(SRC, "_data");

let languages = [];
let i18n = {};
let site = {};

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (e) {
    throw new Error(`Błąd w pliku ${file}: ${e.message}`);
  }
}

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}

function loadData() {
  languages = readJson(path.join(DATA, "languages.json"));
  site = readJson(path.join(DATA, "site.json"));
  i18n = {};
  for (const l of languages) i18n[l.code] = readJson(path.join(DATA, "i18n", `${l.code}.json`));

  // Każdy język musi mieć dokładnie te same klucze co pierwszy (domyślny).
  const base = languages[0].code;
  const baseKeys = Object.keys(flatten(i18n[base]));
  const problems = [];
  for (const l of languages.slice(1)) {
    const keys = new Set(Object.keys(flatten(i18n[l.code])));
    const missing = baseKeys.filter((k) => !keys.has(k));
    const extra = [...keys].filter((k) => !baseKeys.includes(k));
    if (missing.length) problems.push(`${l.code}.json — brakuje kluczy:\n  ${missing.join("\n  ")}`);
    if (extra.length) problems.push(`${l.code}.json — klucze nieobecne w ${base}.json:\n  ${extra.join("\n  ")}`);
  }
  if (problems.length) throw new Error("Niezgodne tłumaczenia:\n" + problems.join("\n"));
}

// Język i "głębokość" strony liczone z jej adresu (/en/faq.html → en, ../).
function pageContext(page) {
  const url = page?.url || "/";
  const first = url.split("/").filter(Boolean)[0] || "";
  const lang = languages.find((l) => l.dir && l.dir === first + "/") || languages[0];
  const depth = (url.match(/\//g) || []).length - 1;
  return { lang: lang.code, dir: lang.dir, base: "../".repeat(Math.max(depth, 0)) };
}

function pageUrl(ctx, key, langCode) {
  const lc = langCode || ctx.lang;
  const lang = languages.find((l) => l.code === lc);
  if (!lang) throw new Error(`Nieznany język "${lc}"`);
  const slug = i18n[lc].slugs?.[key];
  if (!slug) throw new Error(`Brak sluga strony "${key}" w ${lc}.json`);
  // ten sam katalog → sam plik (faq.html), inny → przez korzeń (../uk/faq.html)
  return lang.dir === ctx.dir ? `${slug}.html` : `${ctx.base}${lang.dir}${slug}.html`;
}

function lookup(lang, key) {
  const v = key.split(".").reduce((o, k) => (o == null ? undefined : o[k]), i18n[lang]);
  if (typeof v !== "string") throw new Error(`Brak tekstu "${key}" w ${lang}.json`);
  return v;
}

function resolvePlaceholders(text, ctx) {
  return text
    .replace(/\{url:([\w-]+)(?:@([\w-]+))?(#[^}]*)?\}/g, (_, key, lc, frag) => pageUrl(ctx, key, lc) + (frag || ""))
    .replace(/\{num:([\w.]+)\}/g, (_, p) => formatNumber(siteValue(p), ctx.lang))
    .replace(/\{site:([\w.]+)\}/g, (_, p) => {
      const v = p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), site);
      if (v == null) throw new Error(`Brak wartości "${p}" w site.json`);
      return v;
    });
}

function siteValue(p) {
  const v = p.split(".").reduce((o, k) => (o == null ? undefined : o[k]), site);
  if (v == null) throw new Error(`Brak wartości "${p}" w site.json`);
  return v;
}

// Liczba z site.json zapisana zgodnie z językiem strony: 0.49 → „0,49” (pl, uk), „0.49” (en).
function formatNumber(v, lang) {
  if (typeof v !== "number") throw new Error(`{num:…} wymaga liczby w site.json, jest: ${JSON.stringify(v)}`);
  const decimals = (String(v).split(".")[1] || "").length;
  return new Intl.NumberFormat(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).format(v);
}

const escapeAttr = (s) => s.replace(/&(?![#\w]+;)/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.before", loadData);
  loadData();

  eleventyConfig.addShortcode("t", function (key) {
    const ctx = pageContext(this.page);
    return resolvePlaceholders(lookup(ctx.lang, key), ctx);
  });
  eleventyConfig.addShortcode("ta", function (key) {
    const ctx = pageContext(this.page);
    return escapeAttr(resolvePlaceholders(lookup(ctx.lang, key), ctx));
  });
  // Tekst z akapitami: w JSON-ie akapity oddziela pusta linia ("\n\n") → <p>…</p><p>…</p>
  eleventyConfig.addShortcode("tp", function (key) {
    const ctx = pageContext(this.page);
    return resolvePlaceholders(lookup(ctx.lang, key), ctx)
      .split(/\n\s*\n/)
      .map((para) => `<p>${para.trim()}</p>`)
      .join("");
  });

  // Dane strukturalne FAQPage (schema.org) z pytań w i18n → faq.<sekcja>.groups.*.questions.*
  eleventyConfig.addShortcode("faqJsonLd", function (...sections) {
    const ctx = pageContext(this.page);
    const strip = (html) => html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const entities = [];
    for (const sec of sections) {
      for (const g of Object.values(i18n[ctx.lang].faq[sec].groups)) {
        for (const q of Object.values(g.questions)) {
          entities.push({
            "@type": "Question",
            name: strip(resolvePlaceholders(q.q, ctx)),
            acceptedAnswer: { "@type": "Answer", text: strip(resolvePlaceholders(q.a, ctx)) },
          });
        }
      }
    }
    const json = JSON.stringify({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: entities }, null, 2);
    return `<script type="application/ld+json">\n${json.replace(/</g, "\\u003c")}\n</script>`;
  });

  eleventyConfig.addShortcode("url", function (key, langCode) {
    return pageUrl(pageContext(this.page), key, langCode);
  });
  eleventyConfig.addShortcode("asset", function (p) {
    return pageContext(this.page).base + p;
  });

  eleventyConfig.addPassthroughCopy({ [`${SRC}/css`]: "css", [`${SRC}/scripts`]: "scripts", [`${SRC}/assets`]: "assets" });
  eleventyConfig.addWatchTarget(DATA);

  return {
    dir: { input: SRC, output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
  };
}
