import I18nTranslator from '/content/js/i18n.js';

var i18n = new I18nTranslator({
    filesLocation: '/content/i18n',
});

i18n.fetch(['pt-br', 'en']).then(() => {
    i18n.translatePageTo('en');
});

axios.get('/content/resume/resume.json').then((res) => {
    i18n.add('settings', res.data).translatePageTo('settings');    
});

function verifyLgpd() {
    const lgpfConfirmation = localStorage.getItem('LgpdConfirmation');
    if (['checked'].indexOf(lgpfConfirmation) !== -1) {
        document.getElementById('LgpdBanner').classList.add('d-none');
    }
}

verifyLgpd();

document.getElementById('LgpdConfirm').addEventListener("click", () => {
    localStorage.setItem('LgpdConfirmation', 'checked');
    verifyLgpd();
});

document.querySelectorAll('[data-language-selector="true"]').forEach(function (languageSelector) {

    languageSelector.addEventListener("click", () => {
        i18n.translatePageTo(languageSelector.getAttribute('data-language'));
    })
});