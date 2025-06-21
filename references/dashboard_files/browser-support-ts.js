"use strict";
(function (exports) {
    const Alkami = exports.Alkami;
    /**************************************************************************
    *    BROWSER SUPPORT CONFIGURATION
    **************************************************************************/
    const BROWSER_COMPATIBLE_MINIMUM_VERSION_FIREFOX = 59;
    const BROWSER_COMPATIBLE_MINIMUM_VERSION_SAFARI = 11;
    const BROWSER_COMPATIBLE_MINIMUM_VERSION_CHROME = 66;
    const BROWSER_COMPATIBLE_MINIMUM_VERSION_EDGE = 18;
    const BROWSER_COMPATIBLE_MINIMUM_VERSION_IOS = 11;
    const BROWSER_COMPATIBLE_MINIMUM_VERSION_ANDROID = 5;
    const browserMap = {
        edge: {
            versionVariable: 'edgeVersion',
            minSupportedVersion: BROWSER_COMPATIBLE_MINIMUM_VERSION_EDGE,
            download: 'https://www.google.com/search?q=download+microsoft+edge',
            enableCookies: 'https://www.google.com/search?q=enable+cookies+in+edge',
            enableJavascript: 'https://www.google.com/search?q=enable+javascript+in+edge',
            name: 'Edge',
            code: 'edge',
            getSupportedVersionText: function () { return '2 most recent versions'; }
        },
        firefox: {
            versionVariable: 'firefoxVersion',
            minSupportedVersion: BROWSER_COMPATIBLE_MINIMUM_VERSION_FIREFOX,
            download: 'https://www.google.com/search?q=download+firefox',
            enableCookies: 'https://www.google.com/search?q=enable+cookies+in+firefox',
            enableJavascript: 'https://www.google.com/search?q=enable+javascript+in+firefox',
            name: 'Mozilla Firefox',
            code: 'ff',
            getSupportedVersionText: function () { return '2 most recent versions'; }
        },
        chrome: {
            versionVariable: 'chromeVersion',
            minSupportedVersion: BROWSER_COMPATIBLE_MINIMUM_VERSION_CHROME,
            download: 'https://www.google.com/search?q=download+chrome',
            enableCookies: 'https://www.google.com/search?q=enable+cookies+in+chrome',
            enableJavascript: 'https://www.google.com/search?q=enable+javascript+in+chrome',
            name: 'Google Chrome',
            code: 'chrome',
            getSupportedVersionText: function () { return '2 most recent versions'; }
        },
        safari: {
            versionVariable: 'safariVersion',
            minSupportedVersion: BROWSER_COMPATIBLE_MINIMUM_VERSION_SAFARI,
            download: 'https://www.google.com/search?q=download+safari',
            enableCookies: 'https://www.google.com/search?q=enable+cookies+in+safari',
            enableJavascript: 'https://www.google.com/search?q=enable+javascript+in+safari',
            name: 'Safari',
            code: 'safari',
            getSupportedVersionText: function () { return '2 most recent versions'; }
        },
        opera: {
            versionVariable: 'operaVersion',
            name: 'Opera',
            code: 'opera',
            getSupportedVersionText: function () { return '2 most recent versions'; }
        }
    };
    const mobileBrowserMap = {
        android: {
            icon: 'android.png',
            minSupportedVersion: BROWSER_COMPATIBLE_MINIMUM_VERSION_ANDROID,
            name: 'Chrome for Android',
            code: 'Android',
            getSupportedVersionText: function () { return '2 most recent versions'; }
        },
        ios: {
            icon: 'apple.png',
            minSupportedVersion: BROWSER_COMPATIBLE_MINIMUM_VERSION_IOS,
            name: 'Mobile Safari for iOS devices',
            code: 'iOS',
            getSupportedVersionText: function () { return '2 most recent versions'; }
        }
    };
    /**************************************************************************
    *    END BROWSER SUPPORT CONFIGURATION
    **************************************************************************/
    // return object
    function getVersionAndName() {
        const ua = navigator.userAgent;
        let tem;
        let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (M[1] === "Chrome") {
            tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
            if (tem != null) {
                return { name: tem[1].replace("OPR", "Opera"), version: tem[2] };
            }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
        if ((tem = ua.match(/version\/(\d+)/i)) != null) {
            M.splice(1, 1, tem[1]);
        }
        return { name: M[0], version: parseFloat(M[1]) };
    }
    function getSupport() {
        const browserNameAndVersion = getVersionAndName();
        const isBrowserUnsupported = function () {
            let unsupported = true;
            if (browserNameAndVersion.name === 'Edge') {
                unsupported = (browserNameAndVersion.version < BROWSER_COMPATIBLE_MINIMUM_VERSION_EDGE);
            }
            else if (browserNameAndVersion.name === 'Chrome') {
                unsupported = (browserNameAndVersion.version < BROWSER_COMPATIBLE_MINIMUM_VERSION_CHROME);
            }
            else if (browserNameAndVersion.name === 'Firefox') {
                unsupported = (browserNameAndVersion.version < BROWSER_COMPATIBLE_MINIMUM_VERSION_FIREFOX);
            }
            else if (browserNameAndVersion.name === 'Safari') {
                unsupported = (browserNameAndVersion.version < BROWSER_COMPATIBLE_MINIMUM_VERSION_SAFARI);
            }
            else if (isTablet()) {
                unsupported = false;
            }
            return unsupported;
        };
        const userAgent = window.navigator.userAgent;
        const isMobile = /Mobile/i.test(userAgent) || /NATIVEAPP/i.test(userAgent);
        const isUnsupported = isBrowserUnsupported();
        const showPopup = isUnsupported;
        const hasCookies = areCookiesEnabled();
        const hasEncryption = !isUnsupported;
        let isMobileUnsupported = false;
        if (isMobile) {
            const isAndroid = /Android/i.test(userAgent);
            const isIos = /(iPad|iPhone)/i.test(userAgent);
            let version;
            if (isAndroid) {
                version = parseFloat(userAgent.match(/Android (\d+\.\d+)/i)[1]);
                isMobileUnsupported = version < BROWSER_COMPATIBLE_MINIMUM_VERSION_ANDROID;
            }
            else if (isIos) {
                version = parseFloat(userAgent.match(/OS (\d+)_\d+/i)[1]);
                isMobileUnsupported = version < BROWSER_COMPATIBLE_MINIMUM_VERSION_IOS;
            }
        }
        return {
            isMobile,
            isMobileUnsupported,
            isUnsupported,
            showPopup,
            hasCookies,
            hasEncryption,
        };
    }
    function isTablet() {
        return (/tabletapp/i.test(navigator.userAgent.toLowerCase()));
    }
    function displaySupportInfo() {
        const support = getSupport();
        const supported = !support.isUnsupported;
        const encryption = support.hasEncryption;
        const cookies = support.hasCookies;
        const supportEncryption = support.hasEncryption ? 'positive' : 'negative';
        const supportCookies = support.hasCookies ? 'positive' : 'negative';
        const supportJavascript = 'positive';
        const content = `
        <div class="iris-content">
            <div class="iris-card iris-card--flat mar-bottom--lg">
                <div class="iris-card__header">
                    <h4 class="iris-card__title">${(supported && cookies && encryption) ? "Your browser supports the minimum requirements" : "Your browser doesn\'t quite meet the minimum requirements"}</h4>
                </div>

                <div class="iris-card__content">
                    <div class="container-fluid pad-x--0">
                        <div class="row">
                            <div class="col-1">
                                <div class="iris-badge iris-badge--circular  iris-badge--${supportEncryption}"></div>
                            </div>
                            <div class="col-10">
                                <div>128-bit encryption ${encryption ? "is supported" : "may not be supported"}</div>
                            </div>
                        </div>   
                        <div class="row">
                            <div class="col-1">
                                <div class="iris-badge iris-badge--circular  iris-badge--${supportCookies}"></div>
                            </div>
                            <div class="col-10">
                                <div>Cookies ${cookies ? "are supported" : "are not supported"}</div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-1">
                                <div class="iris-badge iris-badge--circular  iris-badge--${supportJavascript}"></div>
                            </div>
                            <div class="col-10">
                                <div>Javascript is enabled</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <h3>Desktop Browsers</h3>
            <p class="mar-top--md mar-bottom--md">In order to provide a better and more secure online banking experience to our users, we support the following
                browsers:</p>
            <div class="container-fluid pad-x--0 pad-bottom--lg">
                ${getDesktopBrowserList()}
            </div>

            <h3 class="iris-card__title">Mobile Browsers</h3>
            <p class="mar-top--md mar-bottom--md">Online banking is designed to work with touch-based operating systems commonly found on tablet devices. We
                        support the following mobile operating systems:</p>
            <div class="container-fluid pad-x--0 pad-bottom--lg">
                    ${getMobileSupportedList()}
            </div>
            <h3 class="iris-card__title">Browser Features</h3>
            <p class="mar-top--md mar-bottom--md">The following features need to be enabled in your browser:</p>
            <div class="container-fluid pad-x--0 pad-bottom--lg">
                <div class="row">
                    <div class="col-3">
                        <div>Javascript</div>
                    </div>
                    <div class="col-6">
                        <div>View instructions for your browser</div>
                    </div>
                    <div class="col">
                        ${getInstructions("enableJavascript")}
                    </div>
                </div>
                <div class="row">
                    <div class="col-3">
                        <div>Cookies</div>
                    </div>
                    <div class="col-6">
                        <div>View instructions for your browser</div>
                    </div> 
                    <div class="col">
                        ${getInstructions("enableCookies")}                        
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <div>128-bit encryption</div>
                    </div>                            
                </div>
            </div>
        </div>`;
        const supportedBrowserModal = Alkami.Helpers.createDialog({
            id: 'supportedBrowser-modal',
            title: 'Browser Support',
            content: content,
            size: 'large',
            destroyOnclose: true,
            buttons: [{
                    text: 'Close',
                    handlerName: 'close',
                    closePrompt: true,
                }],
        });
        supportedBrowserModal.open = true;
        return supportedBrowserModal;
    }
    ;
    function getDesktopBrowserList() {
        return Object.values(browserMap)
            .filter((entry) => entry.minSupportedVersion !== undefined)
            .map((entry) => {
            return `<div class="row">
                            <div class="col-1">
                                <img width="20" height="20" src="https://assets.orb.alkamitech.com/production/assets/global/images/browser_unsupported/browsers/${entry.code}.png" title="${entry.name}" alt="${entry.name}" />
                            </div>
                            <div class="col-4">
                                <div>${entry.name}</div>
                            </div>
                            <div class="col">
                                <div>${entry.getSupportedVersionText()}</div>
                            </div>
                            <div class="col-3">
                                <div class="text--right">
                                    <a target="_blank" title="${entry.name}" href="${entry.download}">Download</a>
                                </div>
                            </div>
                        </div>`;
        }).join('');
    }
    ;
    function getMinimumSupportedBrowserList() {
        return Object.values(browserMap)
            .filter((entry) => entry.minSupportedVersion !== undefined)
            .map((entry) => {
            return `
                <div class="row">
                    <div class="col-1">
                        <img width="20" height="20" src="https://assets.orb.alkamitech.com/production/assets/global/images/browser_unsupported/browsers/${entry.code}.png" title="${entry.name}" alt="${entry.name}" />
                    </div>
                    <div class="col-4">
                        <div>${entry.name}</div>
                    </div>
                    <div class="col">
                        <div>version ${entry.minSupportedVersion} or above</div>
                    </div>
                    <div class="col-3">
                        <div class="text--right">
                            <a target="_blank" title="${entry.name}" href="${entry.download}">${getUpdateOrDownload(getVersionAndName().name, entry.name)}</a>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }
    ;
    function getEnableCookiesInstructionList() {
        return Object.values(browserMap)
            .filter((entry) => entry.minSupportedVersion !== undefined)
            .map((entry) => {
            return `
                <div class="row">
                    <div class="col-1">
                        <img width="20" height="20" src="https://assets.orb.alkamitech.com/production/assets/global/images/browser_unsupported/browsers/${entry.code}.png" title="${entry.name}" alt="${entry.name}" />
                    </div>
                    <div class="col-4">
                        <div>${entry.name}</div>
                    </div>
                    <div class="col-4">
                        <div>
                            <a target="_blank" title="${entry.name}" href="${entry.enableCookies}">Instructions</a>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }
    ;
    function getMobileSupportedList() {
        return Object.values(mobileBrowserMap)
            .filter((entry) => entry.minSupportedVersion !== undefined)
            .map((entry) => {
            return `
                <div class="row">
                    <div class="col-1">
                        <div>
                            <img width="20" height="20" src="https://assets.orb.alkamitech.com/production/assets/global/images/browser_unsupported/${entry.icon}" title="${entry.name}" alt="${entry.name}" />
                        </div>
                    </div>
                    <div class="col-5">
                        <div>${entry.name}</div>
                    </div>
                    <div class="col-6">
                        <div class="text--right">${entry.getSupportedVersionText()}</div>
                    </div>
                </div>`;
        }).join('');
    }
    ;
    function getInstructions(type) {
        const html = Object.values(browserMap)
            .filter((entry) => entry.minSupportedVersion !== undefined)
            .map((entry) => {
            return '<a target="_blank" class="' +
                entry.code +
                '" href="' +
                entry[type] +
                '"><img width="20" height="20"src="https://assets.orb.alkamitech.com/production/assets/global/images/browser_unsupported/browsers/' +
                entry.code + '.png" alt="' +
                entry.name + '" /></a> ';
        }).join('');
        return '<div class="instructions-container text--right">' + html + '</div>';
    }
    ;
    function displayUnsupportedMessage() {
        var content = `
        <div class="iris-content">
            <div class="iris-card iris-card--flat">
                <div class="iris-card__header mar-top--md">
                    <h3 class="iris-card__title">Please update your browser.</h3>
                </div>
                <div class="iris-card__content">
                    <p>
                        Our online banking site uses the latest technology and security standards supported by modern
                        browsers. In order to provide a better and more secure online banking experience to our users, we do not
                        support the browser you are using. We apologize for the inconvenience.
                    </p>
                    <p>
                        You may update to a newer version of your browser or download one of the supported browsers using
                        the links below. You will be on your way to a better, faster and safer online browsing experience in no time!
                    </p>
                    <div class="container-fluid pad-x--0 pad-bottom--lg">
                        ${getMinimumSupportedBrowserList()}
                    </div>
                    <p>
                        If you are using a supported browser, you may be using an extension that interferes with browser
                        detection. Try disabling your browser extensions and restarting your browser to resolve the problem.
                    </p>
                </div>
            </div>
            <div class="container-flux pad-x--0 pad-y--lg">
                <div class="row">
                    <div class="col-12">
                        <div class="text--center font-weight--bold font-color--info">OR</div>
                    </div>
                </div>
            </div>
            <div class="iris-card iris-card--flat mar-bottom--sm">
                <div class="iris-card__header mar-top--md">
                    <h3 class="iris-card__title">Continue without updating.</h3>
                </div>
                <div class="iris-card__content">
                    <p>Please keep in mind that there are certain risks associated with using an outdated browser:
                    <div class="container-fluid pad-x--0 pad-bottom--lg">
                        <div class="row pad-bottom--md">
                            <div class="col-4">
                                <span class="font-weight--bold">Security Issues</span>
                            </div>
                            <div class="col-8">
                                <span>Serious security flaws and lack of privacy features needed to keep your account safe and secure.</span>
                            </div>
                        </div>   
                        <div class="row pad-bottom--md">
                            <div class="col-4">
                            <span class="font-weight--bold">Bugs</span>
                            </div>
                            <div class="col-8">
                                <span>Bugs and limitations that may create problems when you use websites.</span>
                            </div>
                        </div>   
                        <div class="row pad-bottom--md">
                            <div class="col-4">
                                <span class="font-weight--bold">Missing Features</span>
                            </div>
                            <div class="col-8">
                                <span>Some features may not be available which may make websites harder to use.</span>
                            </div>
                        </div>   
                    </div>
                </div>
            </div>
        </div>`;
        const unsupportedBrowserModal = Alkami.Helpers.createDialog({
            id: 'unsupportedBrowser-modal',
            title: 'Browser Support',
            content: content,
            size: 'large',
            destroyOnclose: true,
            buttons: [{
                    text: 'Close',
                    handlerName: 'close',
                    closePrompt: true,
                }],
        });
        unsupportedBrowserModal.open = true;
        return unsupportedBrowserModal;
    }
    function getUpdateOrDownload(browserCode, browser) {
        return (browser.includes(browserCode)) ? 'update' : 'download';
    }
    function displayMobileUnsupportedMessage() {
        const content = `
        <div class="iris-content">
            <h3>Your mobile operating system is not supported.</h3>
            <p>
                Our online banking site uses the latest technology and security standards supported by modern browsers. In
                order to provide a better and more secure online banking experience to our users, we do not support the
                browser you are using. We apologize for the inconvenience.
            </p>
            <p>
                We support the following mobile operating systems:
            </p>
            <div class="container-fluid pad-x--0 pad-bottom--lg">
                <div class="row">
                    <div class="col-6">Mobile Safari for iOS devices</div>
                    <div class="col-6">iOS 11 or above</div>
                </div>
                <div class="row">
                    <div class="col-6">Chrome for Android</div>
                    <div class="col-6">Android 5.0 or above</div>
                </div>
            </div>
        </div>`;
        const unsupportedBrowserModal = Alkami.Helpers.createDialog({
            id: 'unsupportedBrowser-modal',
            title: 'Browser Support',
            content: content,
            size: 'large',
            destroyOnclose: true,
            buttons: [{
                    text: 'Close',
                    handlerName: 'close',
                    closePrompt: true,
                }],
        });
        unsupportedBrowserModal.open = true;
        return unsupportedBrowserModal;
    }
    function displayCookiesDisabledMessage() {
        const content = `
        <div class="iris-content">
            <h3>Please enable cookies.</h3>
            <p>
                Cookies need to be enabled in order for you to save settings and preferences. Please choose your browser below to
                view instructions on how to enable cookies. When you\'re done, refresh the page.
            </p>
            <div class="container-fluid pad-x--0 pad-bottom--lg">
                ${getEnableCookiesInstructionList()}
            </div>
        </div>`;
        const cookiesModal = Alkami.Helpers.createDialog({
            id: 'unsupportedBrowser-modal',
            title: 'Browser Support',
            content: content,
            size: 'large',
            destroyOnclose: true,
            buttons: [{
                    text: 'Close',
                    handlerName: 'close',
                    closePrompt: true,
                }],
        });
        cookiesModal.open = true;
        return cookiesModal;
    }
    function areCookiesEnabled() {
        var r = false;
        Alkami.Utils.CookieHelper.createCookie("testing", "moo", 1);
        if (Alkami.Utils.CookieHelper.readCookie("testing") != null) {
            r = true;
            Alkami.Utils.CookieHelper.eraseCookie("testing");
        }
        return r;
    }
    const browser = {
        BROWSER_COMPATIBLE_MINIMUM_VERSION_ANDROID,
        BROWSER_COMPATIBLE_MINIMUM_VERSION_CHROME,
        BROWSER_COMPATIBLE_MINIMUM_VERSION_EDGE,
        BROWSER_COMPATIBLE_MINIMUM_VERSION_FIREFOX,
        BROWSER_COMPATIBLE_MINIMUM_VERSION_IOS,
        BROWSER_COMPATIBLE_MINIMUM_VERSION_SAFARI,
        areCookiesEnabled,
        browserMap,
        displayCookiesDisabledMessage,
        displayMobileUnsupportedMessage,
        displaySupportInfo,
        displayUnsupportedMessage,
        getDesktopBrowserList,
        getEnableCookiesInstructionList,
        getInstructions,
        getMinimumSupportedBrowserList,
        getMobileSupportedList,
        getSupport,
        getUpdateOrDownload,
        getVersionAndName,
        isTablet,
        mobileBrowserMap,
    };
    Alkami.BrowserSupport = browser;
})(this);

//# sourceMappingURL=browser-support-ts.js.map
