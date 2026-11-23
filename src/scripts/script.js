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
