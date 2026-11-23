// Każda strona w tym katalogu jest generowana raz dla każdego języka z _data/languages.json.
// Adres = katalog języka + slug z _data/i18n/<lang>.json → "slugs".
export default {
  layout: "layouts/base.njk",
  pagination: { data: "languages", size: 1, alias: "lang" },
  permalink: (data) => `${data.lang.dir}${data.i18n[data.lang.code].slugs[data.pageKey]}.html`,
};
