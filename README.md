# Redifit — landing page

Strona marketingowa aplikacji REDi FIT (`../../frontend`). Strony są generowane
przez [Eleventy](https://www.11ty.dev/) z jednego zestawu szablonów, a wszystkie
teksty są w plikach JSON, osobno dla każdego języka.

**Status:** makieta przed publikacją. Treść zawiera jawnie oznaczone braki i dane
przykładowe (patrz niżej), a strony mają `noindex, nofollow` (`src/_data/site.json` → `robots`).

## Szybki start

```bash
npm install        # raz
npm start          # podgląd na http://localhost:8080 z odświeżaniem na żywo
npm run build      # gotowa strona w _site/
```

Wymagany Node.js 18+ (CI używa 22).

## Gdzie co jest

```
src/
  _data/
    i18n/pl.json, en.json, uk.json   ← WSZYSTKIE TEKSTY strony, po jednym pliku na język
    languages.json                   ← lista języków (kod, katalog, etykieta w przełączniku)
    site.json                        ← dane wspólne: e-mail, telefon, sociale, robots
  pages/                             ← 1 szablon na podstronę, generowany dla każdego języka
    home.njk, find.njk (Szukam trenera), trainers.njk, pricing.njk,
    faq.njk, contact.njk, terms.njk, privacy.njk, notfound.njk (404)
    pages.11tydata.js                ← reguła: strona × język → adres
  _includes/
    layouts/base.njk                 ← <head>, wspólny szkielet
    partials/header.njk, footer.njk, cookie.njk, lang-switch.njk
  css/, scripts/, assets/            ← kopiowane bez zmian do _site/
eleventy.config.js                   ← shortcode'y t / ta / url / asset + walidacja tłumaczeń
_site/                               ← wynik (nie edytować, nie commitować)
```

## Edycja tekstów

Teksty są w `src/_data/i18n/<język>.json`, pogrupowane jak strona:
`strona → sekcja → element`, np. `home.hero.h1`, `faq.faq_klient.summary_3`.
Nazwy sekcji odpowiadają `id` sekcji w HTML (`#hero`, `#kroki`, `#t-zasady`, …).

- **Zmiana tekstu**: zmień wartość w JSON-ie danego języka.
- **Tekst może zawierać HTML** (np. `<strong>`, link). Linki do innych podstron
  zapisuj jako `{url:faq}`, `{url:faq#faq-trener}` albo `{url:home@en}`, a nie jako
  ścieżkę. Adres policzy się sam dla każdego języka.
- **Dane wspólne** (e-mail, telefon) są w `site.json`. W tekście można się do nich
  odwołać przez `{site:contact.email}`.
- **Adresy podstron** są w każdym pliku językowym w `"slugs"`
  (np. `"find": "szukam-trenera"` → `/szukam-trenera.html`).

Wszystkie języki muszą mieć **te same klucze**. Jeśli w którymś pliku brakuje klucza
albo jest nadmiarowy, `npm run build` / `npm start` zatrzyma się i wypisze listę.

### Nowy język

1. Skopiuj `src/_data/i18n/en.json` jako np. `de.json` i przetłumacz wartości
   (także `"slugs"`, jeśli adresy mają być w nowym języku).
2. Dopisz język do `src/_data/languages.json`, np. `{ "code": "de", "dir": "de/", "label": "DE", "name": "Deutsch" }`.
3. `npm run build`. Strony `de/…` i pozycja w przełączniku języka pojawią się same.

### W szablonach

| Zapis | Co robi |
|---|---|
| `{% t "home.hero.h1" %}` | tekst w bieżącym języku (HTML dozwolony) |
| `{% ta "home.hero.img_alt" %}` | tekst do atrybutu (`alt`, `title`, `aria-label`) |
| `{% url "faq" %}` / `{% url "faq", "en" %}` | link do podstrony w bieżącym / wskazanym języku |
| `{% asset "css/styles.css" %}` | ścieżka do pliku statycznego |
| `{{ site.contact.email }}` | wartość z `site.json` |

Linki są względne, więc strona działa także pod podkatalogiem (np. `user.github.io/repo/`).

## Wdrożenie na GitHub Pages

Workflow `.github/workflows/deploy.yml` buduje stronę i publikuje `_site/` przy każdym
pushu na `main`. W ustawieniach repozytorium: **Settings → Pages → Source: GitHub Actions**.

Przed realną publikacją: ustalić docelową domenę, zmienić `robots` w `site.json`
na indeksowanie i zamknąć pozycje `[NEEDS]`.

## Konwencja znaczników w treści

- `[NEEDS: ...]`: informacja do potwierdzenia lub uzupełnienia.
- `[DANE PRÓBNE]` / `[SAMPLE DATA]` / `[ТЕСТОВІ ДАНІ]`: liczba wymyślona na potrzeby makiety.
- `[MOCK]`: element bez działającego backendu (formularz kontaktowy, kod QR).
- Sekcja z opiniami (`#opinie`) ma celowo puste sloty. Nie wymyślamy opinii.

Klient zatwierdził usunięcie części tych znaczników. Lista zadań z jego uwag jest w
`../docs/landing-zadania.md`.

## Formularz kontaktowy

`src/scripts/script.js` obsługuje walidację i stan sukcesu formularza w przeglądarce.
Nic nie jest wysyłane (decyzja: na razie bez wysyłki).

## Języki

Język domyślny to polski. Angielski i ukraiński to adaptacje (nieformalne „ty”, formy
neutralne płciowo, BLIK/Stripe/REDi FIT bez tłumaczenia). Nowe teksty EN/UK wymagają
przeglądu native speakera przed publikacją.
