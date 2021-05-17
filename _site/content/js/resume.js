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
        return axios.get('/content/resume/resume.json').then((res) => {
            this.translations = res.data.i18n;
            this.buildContact(res.data.contact);
            this.buildEducation(res.data.education);
            this.buildReference(res.data.reference);
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

    /**
     * Build Resume reference
     * 
     * @param {Object} reference
     */
    buildReference(reference) {
        const referenceList = document.getElementById(this.config.referencePrefix);
        let indexReference = 0;
        for (indexReference = 0; indexReference < education.length; indexReference++) {
            const referenceSettings = reference[indexReference];
            const item = this.config.referencePrefix + '.S' + indexReference;
            this.parseI18n({
                group: this.config.referencePrefix,
                item: 'S' + indexReference,
                i18n: referenceSettings.i18n,
            });
            const newEducationUlLi0 = document.createElement('li');
            newEducationUlLi0.setAttribute('class', 'mt-2');
            newEducationUlLi0.innerHTML = start + ' - ' + end;
            const newEducationUlLi1 = document.createElement('li');
            newEducationUlLi1.setAttribute('class', 'mt-0');
            newEducationUlLi1.appendChild(document.createTextNode(institution));
            const newEducationUlLi2 = document.createElement('li');
            newEducationUlLi2.setAttribute('class', 'mt-0');
            newEducationUlLi2.setAttribute('data-i18n', item);
            newEducationUlLi2.appendChild(document.createTextNode(item));
            referenceList.appendChild(newEducationUlLi0);
            referenceList.appendChild(newEducationUlLi1);
            referenceList.appendChild(newEducationUlLi2);
        }
    }

    /**
     * Build Resume education
     * 
     * @param {Object} education
     */
    buildEducation(education) {
        const educationList = document.getElementById(this.config.educationPrefix);
        let indexEducation = 0;
        for (indexEducation = 0; indexEducation < education.length; indexEducation++) {
            const educationSettings = education[indexEducation];
            const start = educationSettings.start;
            const end = educationSettings.hasOwnProperty('end') ? educationSettings.end : '<span data-i18n="date.currently" class="text-capitalize"></span>';
            const institution = educationSettings.institution;
            const item = this.config.educationPrefix + '.S' + indexEducation;
            this.parseI18n({
                group: this.config.educationPrefix,
                item: 'S' + indexEducation,
                i18n: educationSettings.i18n,
            });
            const newEducation = document.createElement('div');
            newEducation.setAttribute('class', 'col-md-12 fw-normal bg-secondary ps-4 pb-2 pt-2 pe-2');
            const newEducationUl = document.createElement('ul');
            newEducationUl.setAttribute('class', 'list-unstyled');
            const newEducationUlLi0 = document.createElement('li');
            newEducationUlLi0.setAttribute('class', 'mt-2');
            newEducationUlLi0.innerHTML = start + ' - ' + end;
            const newEducationUlLi1 = document.createElement('li');
            newEducationUlLi1.setAttribute('class', 'mt-0');
            newEducationUlLi1.appendChild(document.createTextNode(institution));
            const newEducationUlLi2 = document.createElement('li');
            newEducationUlLi2.setAttribute('class', 'mt-0');
            newEducationUlLi2.setAttribute('data-i18n', item);
            newEducationUlLi2.appendChild(document.createTextNode(item));
            newEducationUl.appendChild(newEducationUlLi0);
            newEducationUl.appendChild(newEducationUlLi1);
            newEducationUl.appendChild(newEducationUlLi2);
            newEducation.appendChild(newEducationUl);
            educationList.appendChild(newEducation);
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
            contactPrefix: 'contact',
            referencePrefix: 'reference',
            educationPrefix: 'education',
            referencePrefix: 'reference',
        };
    }

}

export default ResumeBuilder;