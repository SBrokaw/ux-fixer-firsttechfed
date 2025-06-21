"use strict";
// ******************************************
// ****** Localization related methods ******
// ******************************************
var Alkami = Alkami || {};
if (!Alkami.Localization) {
    (function (alkami) {
        class Localization {
            constructor() {
                this.SiteText = new SiteText();
            }
            includeSiteText(siteTextJSON) {
                Object.keys(siteTextJSON).forEach((key) => {
                    this.SiteText.set(key, siteTextJSON[key]);
                });
            }
        }
        class SiteText {
            constructor() {
                this._map = {};
            }
            get(key, ...replacements) {
                var value = "";
                if (this._map.hasOwnProperty(key)) {
                    value = this._map[key];
                    if (replacements.length > 0) {
                        value = value.replace(/{(\d+)}/g, (match, index) => {
                            if (typeof (replacements[index]) !== 'undefined')
                                return replacements[index].toString();
                            return match;
                        });
                    }
                }
                return value;
            }
            set(key, value) {
                this._map[key] = value;
                Object.defineProperty(this, key, {
                    get: () => { return this._map[key]; },
                    set: (newValue) => { console.warn('Setting of SiteText values is not honored'); },
                    configurable: true
                });
            }
        }
        alkami.Localization = new Localization();
    })(Alkami);
}

//# sourceMappingURL=localization-ts.js.map
