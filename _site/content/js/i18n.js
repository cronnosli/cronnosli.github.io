/**
 * Very simple-translator 
 * 
 * This library is a simplified version based on https://github.com/andreasremdt/simple-translator
 * by Andreas Remdt.
 * 
 * Author: Douglas Cordeiro <cronnosli@gmail.com>
 * License: MIT (https://mit-license.org/)
 */
class I18nTranslator {
    /**
     * Initialize the Translator by providing options.
     *
     * @param {Object} options
     */
    constructor(options = {}) {
        if (typeof options != 'object' || Array.isArray(options)) {
            console.debug('INVALID_OPTIONS', options);
            options = {};
        }

        this.languages = new Map();
        this.config = Object.assign(I18nTranslator.defaultConfig, options);

        const { registerGlobally, detectLanguage } = this.config;

        if (registerGlobally) {
            this._globalObject[registerGlobally] = this.translateForKey.bind(this);
        }

        this._listener();
    }

    /**
    * Start listener.
    *
    */
    _listener() {
        document.querySelectorAll(this.config.languageSelector).forEach((languageSelector) => {
            languageSelector.addEventListener("click", () => {
                localStorage.setItem('userLanguagePreference', languageSelector.getAttribute(this.config.languageSelectorAttribute));
                this.translatePageTo(languageSelector.getAttribute(this.config.languageSelectorAttribute));
            })
        });
    }

    get _globalObject() {
        return window;
    }

    /**
     * Get a translated value from a JSON by providing a key. Additionally,
     * the target language can be specified as the second parameter.
     *
     * @param {String} key
     * @param {String} toLanguage
     * @return {String}
     */
    _getValueFromJSON(key, toLanguage) {
        const json = this.languages.get(toLanguage);

        return key.split('.').reduce((obj, i) => (obj ? obj[i] : null), json);
    }

    /**
     * Replace a given DOM nodes' attribute values (by default innerHTML) with
     * the translated text.
     *
     * @param {HTMLElement} element
     * @param {String} toLanguage
     */
    _replace(element, toLanguage) {
        const keys = element.getAttribute('data-i18n')?.split(/\s/g);
        const attributes = element?.getAttribute('data-i18n-attr')?.split(/\s/g);

        if (attributes && keys.length != attributes.length) {
            console.debug('MISMATCHING_ATTRIBUTES', keys, attributes, element);
        }

        keys.forEach((key, index) => {
            const text = this._getValueFromJSON(key, toLanguage);
            const attr = attributes ? attributes[index] : 'innerHTML';

            if (text) {
                if (attr == 'innerHTML') {
                    element[attr] = text;
                } else {
                    element.setAttribute(attr, text);
                }
            } else {
                console.debug('TRANSLATION_NOT_FOUND', key, toLanguage);
            }
        });
    }

    /**
     * Translate all DOM nodes that match the given selector into the
     * specified target language.
     *
     * @param {String} toLanguage The target language
     */
    translatePageTo(toLanguage = this.config.defaultLanguage) {
        if (typeof toLanguage != 'string') {
            console.debug('INVALID_PARAM_LANGUAGE', toLanguage);
            return;
        }

        if (toLanguage.length == 0) {
            console.debug('EMPTY_PARAM_LANGUAGE');
            return;
        }

        if (!this.languages.has(toLanguage)) {
            console.debug('NO_LANGUAGE_REGISTERED', toLanguage);
            return;
        }

        const elements =
            typeof this.config.selector == 'string'
                ? Array.from(document.querySelectorAll(this.config.selector))
                : this.config.selector;

        if (elements.length && elements.length > 0) {
            elements.forEach((element) => this._replace(element, toLanguage));
        } else if (elements.length == undefined) {
            this._replace(elements, toLanguage);
        }

        this._currentLanguage = toLanguage;
        document.documentElement.lang = toLanguage;

        if (this.config.persist) {
            localStorage.setItem(this.config.persistKey, toLanguage);
        }
    }

    /**
     * Translate a given key into the specified language if it exists
     * in the translation file. If not or if the language hasn't been added yet,
     * the return value is `null`.
     *
     * @param {String} key The key from the language file to translate
     * @param {String} toLanguage The target language
     * @return {(String|null)}
     */
    translateForKey(key, toLanguage = this.config.defaultLanguage) {
        if (typeof key != 'string') {
            console.debug('INVALID_PARAM_KEY', key);
            return null;
        }

        if (!this.languages.has(toLanguage)) {
            console.debug('NO_LANGUAGE_REGISTERED', toLanguage);
            return null;
        }

        const text = this._getValueFromJSON(key, toLanguage);

        if (!text) {
            console.debug('TRANSLATION_NOT_FOUND', key, toLanguage);
            return null;
        }

        return text;
    }

    /**
     * Add a translation resource to the Translator object. The language
     * can then be used to translate single keys or the entire page.
     *
     * @param {String} language The target language to add
     * @param {String} json The language resource file as JSON
     * @return {Object} Translator instance
     */
    add(language, json) {
        if (typeof language != 'string') {
            console.debug('INVALID_PARAM_LANGUAGE', language);
            return this;
        }

        if (language.length == 0) {
            console.debug('EMPTY_PARAM_LANGUAGE');
            return this;
        }

        if (Array.isArray(json) || typeof json != 'object') {
            console.debug('INVALID_PARAM_JSON', json);
            return this;
        }

        if (Object.keys(json).length == 0) {
            console.debug('EMPTY_PARAM_JSON');
            return this;
        }

        this.languages.set(language, json);
        return this;
    }

    /**
       * Fetch a translation resource from the web server. It can either fetch
       * a single resource or an array of resources. After all resources are fetched,
       * return a Promise.
       * If the optional, second parameter is set to true, the fetched translations
       * will be added to the Translator object.
       *
       * @param {String|Array} sources The files to fetch
       * @param {Boolean} save Save the translation to the Translator object
       * @return {(Promise|null)}
       */
    fetch(sources, save = true) {
        if (!Array.isArray(sources) && typeof sources != 'string') {
            console.debug('INVALID_PARAMETER_SOURCES', sources);
            return null;
        }

        if (!Array.isArray(sources)) {
            sources = [sources];
        }

        const urls = sources.map((source) => {
            const filename = source.replace(/\.json$/, '').replace(/^\//, '');
            const path = this.config.filesLocation.replace(/\/$/, '');

            return `${path}/${filename}.json`;
        });

        let requests = urls.map(url => axios.get(url));

        return axios.all(requests).then(axios.spread((...responses) => {
            return responses;
        })).then((languageFiles) => {
            languageFiles = languageFiles.filter((file) => file);
            if (save) {
                languageFiles.forEach((file, index) => {
                    this.add(sources[index], file.data);
                });
            }
            return languageFiles.length > 1 ? languageFiles : languageFiles[0];
        }).catch(errors => {
            console.log(errors);
        });
    }

    /**
     * Sets the default language of the translator instance.
     *
     * @param {String} language
     * @return {void}
     */
    setDefaultLanguage(language) {
        if (typeof language != 'string') {
            console.debug('INVALID_PARAM_LANGUAGE', language);
            return;
        }

        if (language.length == 0) {
            console.debug('EMPTY_PARAM_LANGUAGE');
            return;
        }

        if (!this.languages.has(language)) {
            console.debug('NO_LANGUAGE_REGISTERED', language);
            return null;
        }

        this.config.defaultLanguage = language;
    }

    /**
      * Return the currently selected language.
      *
      * @return {String}
      */
    get currentLanguage() {
        return this._currentLanguage || this.config.defaultLanguage;
    }

    /**
     * Returns the current default language;
     *
     * @return {String}
     */
    get defaultLanguage() {
        return this.config.defaultLanguage;
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
            detectLanguage: true,
            selector: '[data-i18n]',
            debug: false,
            registerGlobally: '__',
            persist: false,
            persistKey: 'preferred_language',
            filesLocation: '/content/i18n',
            languageSelector: '[data-language-selector="true"]',
            languageSelectorAttribute: 'data-language',
        };
    }
}

export default I18nTranslator;