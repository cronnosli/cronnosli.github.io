import I18nTranslator from '/content/js/i18n.js';
import CookiesWarning from '/content/js/cookies.js';
import ResumeBuilder from '/content/js/resume.js';
const userSelectedLanguage = localStorage.getItem('userLanguagePreference');

const resume = new ResumeBuilder({
    defaultLanguage: userSelectedLanguage === null ? 'en' : userSelectedLanguage,
});

let i18n = new I18nTranslator({
    filesLocation: '/content/i18n',
});

resume.build().then(() => {
    i18n.fetch(['pt-br', 'en']).then(() => {
        i18n.translatePageTo(userSelectedLanguage === null ? 'en' : userSelectedLanguage);
    })
});

const cookies = new CookiesWarning();

cookies.check();