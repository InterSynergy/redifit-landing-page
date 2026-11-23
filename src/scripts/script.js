// Redifit landing — shared behaviour: cookie banner + mock contact forms.
// Both are placeholders: nothing is sent to a backend (see the "MOCK" tags in the copy).
(function () {
    var banner = document.querySelector('[data-cookie-banner]');
    if (banner) {
        var dismiss = function () {
            try {
                localStorage.setItem('redifit-cookie-choice', 'dismissed');
            } catch (e) {
            }
            banner.hidden = true;
        };
        var alreadyChosen = false;
        try {
            alreadyChosen = localStorage.getItem('redifit-cookie-choice') === 'dismissed';
        } catch (e) {
        }
        if (alreadyChosen) banner.hidden = true;
        banner.querySelectorAll('[data-cookie-accept]').forEach(function (btn) {
            btn.addEventListener('click', dismiss);
        });
        // „Ustawienia cookies” w stopce ponownie pokazuje baner
        document.querySelectorAll('[data-cookie-settings]').forEach(function (btn) {
            btn.addEventListener('click', function () {
                banner.hidden = false;
                var first = banner.querySelector('button');
                if (first) first.focus();
            });
        });
    }

    document.querySelectorAll('[data-mock-form]').forEach(function (form) {
        var successEl = document.getElementById(form.dataset.mockForm + '-success');
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var valid = true;
            form.querySelectorAll('[required]').forEach(function (field) {
                var errorEl = document.getElementById(field.id + '-error');
                var empty = !field.value.trim();
                var badEmail = field.type === 'email' && field.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value.trim());
                if (errorEl) errorEl.hidden = !(empty || badEmail);
                if (empty || badEmail) valid = false;
            });
            var consentBoxes = form.querySelectorAll('[data-consent]');
            var consentError = form.querySelector('[data-consent-error]');
            var consentOk = true;
            consentBoxes.forEach(function (box) {
                if (!box.checked) consentOk = false;
            });
            if (consentError) consentError.hidden = consentOk;
            if (!consentOk) valid = false;
            if (!valid) return;
            form.hidden = true;
            if (successEl) successEl.hidden = false;
        });
    });

    document.querySelectorAll('[data-mock-form-reset]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var success = btn.closest('[data-mock-form-success]');
            var form = document.getElementById(success.dataset.mockFormSuccess);
            if (form) {
                form.reset();
                form.hidden = false;
            }
            success.hidden = true;
        });
    });
})();

// Karuzela kategorii na stronie głównej (uwaga #18): przewija się sama co kilka sekund,
// zatrzymuje się po najechaniu, przy fokusie i po dotknięciu; bez animacji przy prefers-reduced-motion.
(function () {
    var INTERVAL = 3500;
    document.querySelectorAll('[data-carousel]').forEach(function (root) {
        var track = root.querySelector('[data-carousel-track]');
        if (!track) return;
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var paused = false;
        var timer = null;

        function step() {
            var item = track.querySelector('li');
            if (!item) return 0;
            var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return item.getBoundingClientRect().width + gap;
        }

        function move(dir) {
            var max = track.scrollWidth - track.clientWidth - 2;
            if (dir > 0 && track.scrollLeft >= max) {
                track.scrollTo({left: 0});
            } else if (dir < 0 && track.scrollLeft <= 2) {
                track.scrollTo({left: max});
            } else {
                track.scrollBy({left: dir * step()});
            }
        }

        function start() {
            if (reduced || timer) return;
            timer = setInterval(function () {
                if (!paused && !document.hidden) move(1);
            }, INTERVAL);
        }

        var prev = root.querySelector('[data-carousel-prev]');
        var next = root.querySelector('[data-carousel-next]');
        if (prev) prev.addEventListener('click', function () { move(-1); });
        if (next) next.addEventListener('click', function () { move(1); });

        root.addEventListener('mouseenter', function () { paused = true; });
        root.addEventListener('mouseleave', function () { paused = false; });
        root.addEventListener('focusin', function () { paused = true; });
        root.addEventListener('focusout', function () { paused = false; });
        track.addEventListener('touchstart', function () {
            paused = true;
            clearInterval(timer);
            timer = null;
        }, {passive: true});

        start();
    });
})();

// Przełącznik języka (<details data-lang-menu>): zamknij po kliknięciu obok i klawiszem Esc.
(function () {
    var menus = document.querySelectorAll('[data-lang-menu]');
    if (!menus.length) return;
    document.addEventListener('click', function (e) {
        menus.forEach(function (m) {
            if (m.open && !m.contains(e.target)) m.open = false;
        });
    });
    document.addEventListener('keydown', function (e) {
        if (e.key !== 'Escape') return;
        menus.forEach(function (m) {
            if (m.open) {
                m.open = false;
                m.querySelector('summary').focus();
            }
        });
    });
    // tylko jedna lista otwarta naraz
    menus.forEach(function (m) {
        m.addEventListener('toggle', function () {
            if (!m.open) return;
            menus.forEach(function (o) {
                if (o !== m) o.open = false;
            });
        });
    });
})();
