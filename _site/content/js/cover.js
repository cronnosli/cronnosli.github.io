import I18nTranslator from '/content/js/i18n.js';

class CoverBuilder {

    constructor(options = {}) {

        if (typeof options != 'object' || Array.isArray(options)) {
            console.debug('INVALID_OPTIONS', options);
            options = {};
        }

        this.config = Object.assign(CoverBuilder.defaultConfig, options);

        this.i18n = new I18nTranslator();
        this.translations = {};
        this._listener();
    }

    _listener() {
        document.querySelectorAll(this.config.languageSelector).forEach((languageSelector) => {
            languageSelector.addEventListener("click", () => {
                this.i18n.translatePageTo(languageSelector.getAttribute(this.config.languageSelectorAttribute));
            })
        });
    }

    async build() {
        const res = await axios.get('/content/resume/cover.json')
        this.translations = res.data.i18n;
        this.buildContact(res.data.contact);   
        this.buildLetter(res.data.letter);
        for (const i18n in this.translations) {
            this.i18n.add(i18n, this.translations[i18n]).translatePageTo(this.config.defaultLanguage);
        }
        console.log(res);
    }

    addTranslation(translation) {
        if (!this.translations.hasOwnProperty(translation.language)) {
            this.translations[translation.language] = {};
        } else if (!this.translations[translation.language].hasOwnProperty(translation.group)) {
            this.translations[translation.language][translation.group] = {};
        }
        this.translations[translation.language][translation.group][translation.item] = translation.value;
    }

    parseI18n(translations) {
        for (const language in translations.i18n) {
            this.addTranslation({
                language: language,
                group: translations.group,
                item: translations.item,
                value: translations.i18n[language],
            });
        }
    }

    buildContact(contact) {
        const contactList = document.getElementById(this.config.contactPrefix);
        let indexContact = 0;
        for (indexContact = 0; indexContact < contact.length; indexContact++) {
            const contactSettings = contact[indexContact];
            const newContact = document.createElement('li');
            newContact.setAttribute('class', 'mt-2');
            const item = this.config.contactPrefix + '.S' + indexContact;
            this.parseI18n({
                group: this.config.contactPrefix,
                item: 'S' + indexContact,
                i18n: contactSettings.i18n,
            });
            if (contactSettings.type === 'text') {
                newContact.appendChild(document.createTextNode(item));
                newContact.setAttribute('data-i18n', item);
            } else if (contactSettings.type === 'link') {
                const newContactLink = document.createElement('a');
                newContactLink.setAttribute('target', '_blank');
                newContactLink.setAttribute('class', 'text-secondary');
                newContactLink.setAttribute('href', contactSettings.link);
                newContactLink.setAttribute('data-i18n', item);
                newContactLink.appendChild(document.createTextNode(item));
                newContact.appendChild(newContactLink);
            } else {
                continue;
            }
            contactList.appendChild(newContact);
        }
    }

    buildLetter(letter) {
        const letterList = document.getElementById(this.config.letterPrefix);
        let indexLetter = 0;
        for (indexLetter = 0; indexLetter < letter.length; indexLetter++) {
            const letterSettings = letter[indexLetter];
            const letterEntry = document.createElement('li');
            letterEntry.setAttribute('class', 'mt-2 p-2');
            const item = this.config.letterPrefix + '.S' + indexLetter;
            this.parseI18n({
                group: this.config.letterPrefix,
                item: 'S' + indexLetter,
                i18n: letterSettings.i18n,
            });        
            letterEntry.appendChild(document.createTextNode(item));
            letterEntry.setAttribute('data-i18n', item);            
            letterList.appendChild(letterEntry);
        }
    }

    static get defaultConfig() {
        return {
            defaultLanguage: 'en',
            languageSelector: '[data-language-selector="true"]',
            languageSelectorAttribute: 'data-language',
            contactPrefix: 'contact',
            letterPrefix: 'letter',
        };
    }

}

export default CoverBuilder;