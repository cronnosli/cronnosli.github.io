import I18nTranslator from '/content/js/i18n.js';
import CookiesWarning from '/content/js/cookies.js';
import CoverBuilder from '/content/js/cover.js';

const userSelectedLanguage = localStorage.getItem('userLanguagePreference');
const defaultLanguage = userSelectedLanguage === null ? 'en' : userSelectedLanguage;

const resume = new CoverBuilder({
    defaultLanguage,
});

let i18n = new I18nTranslator({
    filesLocation: '/content/i18n',
});

await resume.build();
await i18n.fetch(['pt-br', 'en']);
i18n.translatePageTo(defaultLanguage);

const cookies = new CookiesWarning();

cookies.check();