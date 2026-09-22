# Redifit — landing page

Statyczna strona marketingowa aplikacji Redifit (`../../frontend`), gotowa do wdrożenia
na GitHub Pages. Cały deployowalny kod znajduje się w `site/` — to jedyny katalog,
który trzeba opublikować.

**Status:** makieta przed publikacją — treść zawiera jawnie oznaczone braki i dane
przykładowe (patrz niżej), a strony mają `<meta name="robots" content="noindex, nofollow">`.

## Struktura

```
site/
  index.html                     strona główna (PL)
  dla-trenerow.html               dla trenerów
  jak-to-dziala.html              jak to działa
  cennik.html                     cennik
  pytania.html                    pytania i odpowiedzi
  kontakt.html                    kontakt
  terms.html, privacy.html        regulamin, polityka prywatności
  404.html
  en/, uk/                        te same strony w EN i UK (slugi lokalizowane
                                   tam, gdzie było to jednoznacznie ustalone —
                                   np. for-trainers.html, dlya-treneriv.html)
  css/
    styles.css                    wspólny system: kolory, typografia, layout,
                                   komponenty używane na więcej niż jednej stronie
    home.css, trainers.css, how.css,
    pricing.css, faq.css, contact.css
                                   style specyficzne dla jednej podstrony
  scripts/
    script.js                     baner cookies + walidacja formularza
                                   kontaktowego (bez backendu, patrz niżej)
  assets/
    logo.webp                     prawdziwe logo z ../frontend/assets/images
    google-play.png, app-store.svg
```

27 plików HTML (9 podstron × 3 języki), 7 plików CSS, jeden plik JS bez zależności.

## Podgląd lokalny

Strona jest w pełni statyczna — wystarczy dowolny serwer plików, np.:

```bash
cd site
python3 -m http.server 8000
```

i otworzyć `http://localhost:8000/`.

## Wdrożenie na GitHub Pages

Ten katalog nie jest jeszcze repozytorium Git. Żeby wystawić stronę:

1. Zainicjować repo i wypchnąć zawartość `` (np. jako `docs/` na branchu
   `main`, albo cały branch `gh-pages`) — do ustalenia przy pierwszym wdrożeniu.
2. W ustawieniach repo na GitHubie włączyć Pages i wskazać ten branch/katalog.
3. Przed realną publikacją: ustalić docelową domenę, zamienić `noindex` na
   właściwe indeksowanie i zamknąć pozycje z listy `[NEEDS]` poniżej.

## Konwencja znaczników w treści

Treść pochodzi z materiału źródłowego (wireframe Claude Design + tłumaczenia
PL/EN/UK) i celowo zachowuje otwarte pozycje zamiast je zmyślać:

- `[NEEDS: ...]` — informacja do potwierdzenia lub uzupełnienia (np. realny
  cennik, dane kontaktowe, treść regulaminu od prawnika).
- `[DANE PRÓBNE]` / `[SAMPLE DATA]` / `[ТЕСТОВІ ДАНІ]` — liczba wymyślona na
  potrzeby makiety (np. liczba trenerów), do podmiany na realną.
- `[MOCK]` — element bez działającego backendu (formularz kontaktowy, kod QR).
- Sekcja z opiniami klientów (`#opinie`) ma celowo puste sloty — nie wymyślono
  żadnych cytatów, bo opinia nieistniejącej osoby to fałszywy dowód społeczny.

Żadnego z powyższych nie usuwać przy edycji treści bez realnego zamknięcia
danej pozycji.

## Formularz kontaktowy

`scripts/script.js` obsługuje walidację i stan sukcesu formularza kontaktowego
w całości po stronie przeglądarki — żadne dane nigdzie nie są wysyłane. Zanim
strona pójdzie na produkcję, formularz wymaga podpięcia pod realny endpoint
(patrz `[NEEDS]` w `kontakt.html`).

## Języki

Domyślny/źródłowy język to polski (`x-default`). Angielski i ukraiński to
natywne adaptacje, nie tłumaczenia dosłowne — konwencje (nieformalne „ty”,
formy neutralne płciowo, BLIK/Stripe/REDi FIT bez tłumaczenia) opisane były
w materiale źródłowym tłumaczeń, który towarzyszył pierwotnej makiecie.
