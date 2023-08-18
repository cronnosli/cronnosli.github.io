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
            res.data['experience'].prefix = this.config.experiencePrefix;
            this.buildExperience(res.data['experience']);            
            res.data['main-skills'].prefix = this.config.mainSkills;
            res.data['secondary-skills'].prefix = this.config.secondarySkills;
            this.buildSkill(res.data['main-skills']);
            this.buildSkill(res.data['secondary-skills']);
            this.buildLanguages(res.data.languages);
            return this.translations;
        }).then((translations) => {
            for (const i18n in translations) {
                this.i18n.add(i18n, translations[i18n]).translatePageTo(this.config.defaultLanguage);
            }
        });
    }

    /**
     * Build Resume languages
     */
    buildLanguages(languages) {
        const languageList = document.getElementById('languages');
        let indexLanguage = 0;
        for (indexLanguage = 0; indexLanguage < languages.length; indexLanguage++) {
            const languageSettings = languages[indexLanguage];
            console.log('languages.S' + indexLanguage, languageSettings);
            const name = languageSettings.name;
            this.parseI18n({
                group: 'languages',
                item: 'S' + indexLanguage + 'Lname',
                i18n: name.i18n,
            });
            const newLanguage = document.createElement('div');
            newLanguage.setAttribute('class', 'col-md-12 fw-normal ps-4');
            const newLanguageName = document.createElement('span');
            newLanguageName.setAttribute('class', '');
            newLanguageName.setAttribute('data-i18n', 'languages.S' + indexLanguage + 'Lname');
            newLanguageName.appendChild(document.createTextNode('languages.S' + indexLanguage + 'Lname'));
            const newLanguageLevelSeparator = document.createElement('span');
            newLanguageLevelSeparator.appendChild(document.createTextNode(': '));
            const newLanguageLevelQECR = document.createElement('span');
            newLanguageLevelQECR.setAttribute('class', 'text-capitalize');
            newLanguageLevelQECR.appendChild(document.createTextNode(' (' + languageSettings.level + ')'));
            const newLanguageLevelProficiency = document.createElement('span');
            this.parseI18n({
                group: 'languages',
                item: 'S' + indexLanguage + 'Llevel',
                i18n: languageSettings.proficiency.i18n,
            });
            newLanguageLevelProficiency.setAttribute('data-i18n', 'languages.S' + indexLanguage + 'Llevel');
            newLanguageLevelProficiency.appendChild(document.createTextNode('languages.S' + indexLanguage + 'Llevel'));

            //newLanguageLevel.setAttribute('class', '');
            newLanguage.appendChild(newLanguageName);
            newLanguage.appendChild(newLanguageLevelSeparator);
            newLanguage.appendChild(newLanguageLevelProficiency);
            newLanguage.appendChild(newLanguageLevelQECR);
            languageList.appendChild(newLanguage);
        }
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
        for (indexReference = 0; indexReference < reference.length; indexReference++) {
            const referenceSettings = reference[indexReference];
            const item = this.config.referencePrefix + '.S' + indexReference;
            this.parseI18n({
                group: this.config.referencePrefix,
                item: 'S' + indexReference,
                i18n: referenceSettings.i18n,
            });
            const newReferenceLi0 = document.createElement('li');
            newReferenceLi0.setAttribute('class', 'mt-4');
            newReferenceLi0.appendChild(document.createTextNode(referenceSettings.name + ','));
            const newReferenceLi1 = document.createElement('li');
            newReferenceLi1.setAttribute('class', 'mt-0');
            newReferenceLi1.setAttribute('data-i18n', item);
            newReferenceLi1.appendChild(document.createTextNode(item));
            const newReferenceLi2 = document.createElement('li');
            newReferenceLi2.setAttribute('class', 'mt-0');
            newReferenceLi2.appendChild(document.createTextNode(referenceSettings.hasOwnProperty('company') ? referenceSettings.company : ''));
            const newReferenceLi3 = document.createElement('li');
            newReferenceLi3.setAttribute('class', 'mt-0');
            newReferenceLi3.appendChild(document.createTextNode(referenceSettings.contact));
            referenceList.appendChild(newReferenceLi0);
            referenceList.appendChild(newReferenceLi1);
            if (referenceSettings.hasOwnProperty('company')) { referenceList.appendChild(newReferenceLi2); }
            referenceList.appendChild(newReferenceLi3);
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
     * Build Resume experience
     * 
     * @param {Object} experience
     */
    buildExperience(experience) {
        const experienceList = document.getElementById(experience.prefix);
        let indexExperience = 0;        
        for (indexExperience = 0; indexExperience < experience.length; indexExperience++) {
            const experienceSettings = experience[indexExperience];
            const start = experienceSettings.start;
            const company = experienceSettings.company;
            const end = experienceSettings.hasOwnProperty('end') ? experienceSettings.end : '<span data-i18n="date.currently" class="text-capitalize"></span>';
            const experienceHead = start + ' - ' + end + ' ' + company + '.';
            const item = experience.prefix + '.S' + indexExperience;
            this.parseI18n({
                group: experience.prefix,
                item: 'S' + indexExperience,
                i18n: experienceSettings.i18n,
            });
            const newExperience = document.createElement('div');
            newExperience.setAttribute('class', 'row align-items-md-stretch ps-4 fs-6');
            const newExperienceHead = document.createElement('div');
            newExperienceHead.setAttribute('class', 'col-md-12 fw-bold ps-4');
            newExperienceHead.innerHTML = experienceHead;

            const newExperienceSeparator = document.createElement('div');
            newExperienceSeparator.setAttribute('class', 'position-relative mt-4 pe-4');
            const newExperienceSeparatorRow = document.createElement('div');
            newExperienceSeparatorRow.setAttribute('class', 'row align-items-md-stretch ps-4 pe-4');
            const newExperienceSeparatorCol = document.createElement('div');
            newExperienceSeparatorCol.setAttribute('class', 'bg-secondary separator-bar-experience');
            newExperienceSeparatorRow.appendChild(newExperienceSeparatorCol);
            newExperienceSeparator.appendChild(newExperienceSeparatorRow);
            const newExperienceProfession = document.createElement('div');
            newExperienceProfession.setAttribute('class', 'col-md-12 fw-normal ps-4');
            newExperienceProfession.setAttribute('data-i18n', item);
            newExperienceProfession.appendChild(document.createTextNode(item));
            const newExperienceDescription = document.createElement('div');
            const newExperienceContext = document.createElement('div');
            newExperienceContext.setAttribute('class', 'col-md-12 fw-normal ps-4');            
            this.parseI18n({
                group: experience.prefix,
                item: 'S' + indexExperience + 'Lcontext',
                i18n: experienceSettings.context.i18n,
            });
            newExperienceContext.setAttribute('data-i18n', experience.prefix + '.S' + indexExperience + 'Lcontext');
            newExperienceContext.setAttribute('class', 'p-3 mt-1 mb-1 fw-bold fs-7 text-justify');
            newExperienceDescription.appendChild(newExperienceContext);
            if (experienceSettings.hasOwnProperty('technologies')) {
                const newExperienceTechnologies = document.createElement('div');
                newExperienceTechnologies.setAttribute('class', 'fw-normal ps-0 fw-bold fst-italic');
                const newExperienceTechnologiesList = document.createElement('span');
                this.parseI18n({
                    group: experience.prefix,
                    item: 'S' + indexExperience + 'Ltechnologies',
                    i18n: experienceSettings.technologies.i18n,
                });
                newExperienceTechnologiesList.setAttribute('data-i18n', experience.prefix + '.S' + indexExperience + 'Ltechnologies');
                const technologiesNode = document.createElement('span');
                technologiesNode.setAttribute('class', 'text-capitalize fw-normal ps-0 fw-bold fst-italic');
                technologiesNode.setAttribute('data-i18n', 'experience.technologies');
                newExperienceTechnologies.appendChild(technologiesNode);
                newExperienceDescription.appendChild(newExperienceTechnologies);
                newExperienceTechnologies.appendChild(newExperienceTechnologiesList);
            }

            newExperienceDescription.setAttribute('class', 'col-md-12 fw-normal ps-4');
            const newExperienceDescriptionList = document.createElement('ul');
            for (const description in experienceSettings.description) {
                const descriptionItem = experience.prefix + '.S' + indexExperience + 'L' + description;
                this.parseI18n({
                    group: experience.prefix,
                    item: 'S' + indexExperience + 'L' + description,
                    i18n: experienceSettings.description[description].i18n,
                });
                const newExperienceDescriptionListLi = document.createElement('li');
                newExperienceDescriptionListLi.setAttribute('class', 'mt-0 fw-normal');
                newExperienceDescriptionListLi.setAttribute('data-i18n', descriptionItem);
                newExperienceDescriptionListLi.appendChild(document.createTextNode(descriptionItem));
                newExperienceDescriptionList.appendChild(newExperienceDescriptionListLi);
            }

            newExperienceDescription.appendChild(newExperienceDescriptionList);
            newExperience.appendChild(newExperienceHead);
            newExperience.appendChild(newExperienceProfession);
            newExperience.appendChild(newExperienceDescription);
            newExperience.appendChild(newExperienceSeparator);
            experienceList.appendChild(newExperience);            
        }
    }

    /**
     * Build Resume skill
     * 
     * @param {Object} skill
     */
    buildSkill(skill) {
        const skillList = document.getElementById(skill.prefix);
        let indexSkill = 0;
        for (indexSkill = 0; indexSkill < skill.length; indexSkill++) {
            const skillSettings = skill[indexSkill];
            const item = skill.prefix + '.S' + skill.prefix + indexSkill;
            this.parseI18n({
                group: skill.prefix,
                item: 'S' + skill.prefix + indexSkill,
                i18n: skillSettings.i18n,
            });
            const years =  '(' + skillSettings.years + '&nbsp;<span data-i18n="date.year"></span>' + (skillSettings.years > 1 ? 's' : '') + ')';
            const newSkill = document.createElement('div');
            newSkill.setAttribute('class', 'row pt-4 align-items-md-stretch');
            const newSkillName = document.createElement('div');
            newSkillName.setAttribute('class', 'col-md-3 ps-4');
            const newSkillNameValue = document.createElement('div');
            newSkillNameValue.setAttribute('class', 'pe-1');
            newSkillNameValue.setAttribute('data-i18n', item);
            const newSkillYears = document.createElement('div');
            newSkillYears.setAttribute('class', 'text-lowercase');
            newSkillYears.innerHTML = years;
            newSkillName.appendChild(newSkillNameValue);
            newSkillName.appendChild(newSkillYears);



            const newSkillPoint = document.createElement('div');
            newSkillPoint.setAttribute('class', 'col-md-8 ps-4');
            const newSkillPointProgress = document.createElement('div');
            newSkillPointProgress.setAttribute('class', 'progress');
            newSkillPoint.appendChild(newSkillPointProgress);
            const newSkillPointProgressBar = document.createElement('div');            
            newSkillPointProgressBar.setAttribute('class', 'progress-bar bg-success');
            newSkillPointProgressBar.setAttribute('role', 'progressbar');
            newSkillPointProgressBar.setAttribute('style', 'width: ' + (skillSettings.skill*20) + '%');
            newSkillPointProgressBar.setAttribute('aria-valuenow', skillSettings.skill*20);
            newSkillPointProgressBar.setAttribute('aria-valuemin', '0');
            newSkillPointProgressBar.setAttribute('aria-valuemax', '100');
            const points = document.createElement('div');
            points.setAttribute('class', 'text-light text-start ps-5');          
            points.appendChild(document.createTextNode(skillSettings.skill));
            newSkillPointProgressBar.appendChild(points);
            newSkillPointProgress.appendChild(newSkillPointProgressBar);
            newSkill.appendChild(newSkillName);
            newSkill.appendChild(newSkillPoint);
            skillList.appendChild(newSkill);
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
            educationPrefix: 'education',
            referencePrefix: 'reference',
            experiencePrefix: 'experience',
            mainSkills: 'main-skills',
            secondarySkills: 'secondary-skills',
        };
    }

}

export default ResumeBuilder;