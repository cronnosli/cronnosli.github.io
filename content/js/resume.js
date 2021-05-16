import I18nTranslator from '/content/js/i18n.js';

/**
 * ResumeBuilder 
 *  
 * Author: Douglas Cordeiro <cronnosli@gmail.com>
 * License: MIT (https://mit-license.org/)
 */
class ResumeBuilder {
    /**
     * Create Resume Builder.
     *
     * @param {Object} options
     */
    constructor(options = {}) {

        if (typeof options != 'object' || Array.isArray(options)) {
            console.debug('INVALID_OPTIONS', options);
            options = {};
        }

        this.config = Object.assign(ResumeBuilder.defaultConfig, options);

        this.i18n = new I18nTranslator();
        this.translations = {};
        this._listener();
    }

    /**
     * Start listener.
     *
     */
    _listener() {
        document.querySelectorAll(this.config.languageSelector).forEach((languageSelector) => {
            languageSelector.addEventListener("click", () => {
                this.i18n.translatePageTo(languageSelector.getAttribute(this.config.languageSelectorAttribute));
            })
        });
    }


    /**
     * Build Resume data
     */
    build() {
        axios.get('/content/resume/resume.json').then((res) => {
            this.translations = res.data.i18n;
            this.buildContact(res.data.contact);
            return this.translations;
        }).then((translations) => {
            for (const i18n in translations) {
                console.log(i18n);
                this.i18n.add(i18n, translations[i18n]).translatePageTo(this.config.defaultLanguage);
            }
        });
    }

    /**
     * Add translation
     * 
     * @param {Object} translation
     */
    addTranslation(translation) {
        if (!this.translations.hasOwnProperty(translation.language)) {
            this.translations[translation.language] = {};
        } else if (!this.translations[translation.language].hasOwnProperty(translation.group)) {
            this.translations[translation.language][translation.group] = {};
        }
        this.translations[translation.language][translation.group][translation.item] = translation.value;
    }

    /**
     * Parse i18 element
     * 
     * @param {Object} translations
     */
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

    /**
     * Build Resume contact
     * 
     * @param {Object} contact
     */
    buildContact(contact) {
        const contactList = document.getElementById(this.config.contactPrefix);
        let indexContact = 0;
        for (indexContact = 0; indexContact < contact.length; indexContact++) {
            const contactSettings = contact[indexContact];
            const newContact = document.createElement('li');
            newContact.setAttribute('class', 'mt-2');
            const item = this.config.contactPrefix + '.S' + indexContact; {
                this.parseI18n({
                    group: this.config.contactPrefix,
                    item: 'S' + indexContact,
                    i18n: contactSettings.i18n,
                });
            }
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

    /**
     * Return the default config object whose keys can be overriden
     * by the user's config passed to the constructor.
     *
     * @return {Object}
     */
    static get defaultConfig() {
        return {
            defaultLanguage: 'en',
            languageSelector: '[data-language-selector="true"]',
            languageSelectorAttribute: 'data-language',
            contactPrefix: 'contact'
        };
    }

}

export default ResumeBuilder;