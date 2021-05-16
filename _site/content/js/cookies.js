/**
 * Cookies warning 
 *  
 * Author: Douglas Cordeiro <cronnosli@gmail.com>
 * License: MIT (https://mit-license.org/)
 */
class CookiesWarning {
    /**
     * Cookies warning.
     *
     */
    constructor() {
        this._listener();
    }

    /**
     * Start listener for cookies warning.
     *
     */
    _listener() {
        document.getElementById('cookiesConfirm').addEventListener("click", () => {
            localStorage.setItem('cookiesConfirmation', 'checked');
            this.check();
        });
    }

    /**
     * Check cookies warning acceptance
     */
    check() {
        const cookiesConfirmation = localStorage.getItem('cookiesConfirmation');
        if (['checked'].indexOf(cookiesConfirmation) !== -1) {
            document.getElementById('cookiesBanner').classList.add('d-none');
        }
    }

}

export default CookiesWarning;