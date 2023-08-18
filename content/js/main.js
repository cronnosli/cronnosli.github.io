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

await resume.build();
await i18n.fetch(['pt-br', 'en']);
await i18n.translatePageTo(userSelectedLanguage === null ? 'en' : userSelectedLanguage);


async function generatePDF() {
    const pdfContentEl = document.getElementById('pdf-content');

const doc = new jsPDF();

    await doc.html(pdfContentEl.innerHTML).save('test.pdf');    
}

document.getElementById('download').addEventListener('click', function () {
    generatePDF();
});

const cookies = new CookiesWarning();

cookies.check();