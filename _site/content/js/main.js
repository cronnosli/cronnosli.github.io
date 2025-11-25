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


const cookies = new CookiesWarning();

cookies.check();

const getCurrentLanguage = () => localStorage.getItem('userLanguagePreference') || 'en';
const pickI18n = (obj, lang) => (obj && (obj[lang] || obj.en || Object.values(obj)[0])) || '';

function buildDocx(resumeData, lang) {
    if (!window.docx) {
        console.error('docx library not loaded');
        return;
    }

    const { Document, Packer, Paragraph, HeadingLevel } = window.docx;
    const labels = {
        contact: { en: 'Contact', 'pt-br': 'Contato' },
        skills: { en: 'Skills', 'pt-br': 'Competências' },
        experience: { en: 'Experience', 'pt-br': 'Experiência' },
        languages: { en: 'Languages', 'pt-br': 'Idiomas' }
    };
    const green = '198754';

    const name = pickI18n(
        { en: resumeData.i18n.en.header.name, 'pt-br': resumeData.i18n['pt-br'].header.name },
        lang
    );
    const roleTitle = i18n.translateForKey('profession.title', lang) || '';
    const roleDescription = i18n.translateForKey('profession.description', lang) || '';

    const paragraphs = [
        new Paragraph({
            text: name,
            heading: HeadingLevel.HEADING_1,
            spacing: { after: 200 },
            color: green
        }),
        roleTitle ? new Paragraph({ text: roleTitle, heading: HeadingLevel.HEADING_2, spacing: { after: 100 } }) : null,
        roleDescription ? new Paragraph({ text: roleDescription, spacing: { after: 200 } }) : null,
        new Paragraph({
            text: pickI18n(labels.contact, lang),
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 100 },
            color: green
        })
    ].filter(Boolean);

    (resumeData.contact || []).forEach((item) => {
        const text = pickI18n(item.i18n, lang);
        if (text) {
            paragraphs.push(new Paragraph({ text, bullet: { level: 0 } }));
        }
    });

    const mainSkills = (resumeData['main-skills'] || []).map((s) => pickI18n(s.i18n, lang)).filter(Boolean).join(', ');
    const secondarySkills = (resumeData['secondary-skills'] || []).map((s) => pickI18n(s.i18n, lang)).filter(Boolean).join(', ');
    paragraphs.push(new Paragraph({ spacing: { before: 200 } }));
    paragraphs.push(new Paragraph({
        text: pickI18n(labels.skills, lang),
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
        color: green
    }));
    if (mainSkills) paragraphs.push(new Paragraph({ text: mainSkills }));
    if (secondarySkills) paragraphs.push(new Paragraph({ text: secondarySkills }));

    paragraphs.push(new Paragraph({ spacing: { before: 200 } }));
    paragraphs.push(new Paragraph({
        text: pickI18n(labels.experience, lang),
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 200 },
        color: green
    }));

    (resumeData.experience || []).forEach((exp) => {
        const title = `${pickI18n(exp.i18n, lang)} | ${exp.company}`;
        const end = exp.end ? exp.end : i18n.translateForKey('date.currently', lang) || 'Currently';
        const dateRange = `${exp.start} - ${end}`;
        paragraphs.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_3, spacing: { after: 50 } }));
        paragraphs.push(new Paragraph({ text: dateRange, spacing: { after: 50 } }));
        if (exp.context?.i18n) {
            paragraphs.push(new Paragraph({ text: pickI18n(exp.context.i18n, lang), spacing: { after: 50 } }));
        }
        if (Array.isArray(exp.description)) {
            exp.description.forEach((desc) => {
                paragraphs.push(new Paragraph({ text: pickI18n(desc.i18n, lang), bullet: { level: 0 } }));
            });
        }
        paragraphs.push(new Paragraph({ spacing: { after: 150 } }));
    });

    paragraphs.push(new Paragraph({ spacing: { before: 200 } }));
    paragraphs.push(new Paragraph({
        text: pickI18n(labels.languages, lang),
        heading: HeadingLevel.HEADING_2,
        spacing: { after: 100 },
        color: green
    }));
    (resumeData.languages || []).forEach((language) => {
        const name = pickI18n(language.name.i18n, lang);
        const level = pickI18n(language.proficiency.i18n, lang);
        paragraphs.push(new Paragraph({ text: `${name} - ${level}` }));
    });

    return new Document({
        sections: [{ children: paragraphs }]
    });
}

function downloadDocx() {
    const resumeData = resume.getResumeData();
    if (!resumeData) {
        console.error('Resume data not loaded');
        return;
    }
    const lang = getCurrentLanguage();
    const doc = buildDocx(resumeData, lang);
    const { Packer } = window.docx;
    Packer.toBlob(doc).then((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const filename = `Douglas-Cordeiro-Resume-${lang}.docx`;
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    });
}

const docxButton = document.getElementById('download-docx');
if (docxButton) {
    docxButton.addEventListener('click', downloadDocx);
}
