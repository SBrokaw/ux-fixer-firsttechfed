/*eslint comma-dangle: ["error", "always"]*/
(function (global) {
    const $ = global.jQuery;

    const cmsModule = {};
    cmsModule.isLoaded = false; // If all of content has loaded and if specific content loading is ready

    cmsModule.legacyContentWrapper = '<div class="iris-content" data-id="{{instanceId}}" data-content-uid="{{contentUid}}">{{payload}}</div>';
    cmsModule.contentWrapper = '<div class="iris-content" data-instance-id="{{instanceId}}" data-content-uid="{{contentUid}}">{{payload}}</div>';

    cmsModule.cardInterstitials = {};
    cmsModule.contentAreaObjectsMap = {};

    cmsModule.fetchContent = function (specificTarget) {
        const contentAreas = [];

        // Determine what areas exist on page via class
        const contentAreaObjects = specificTarget || $('div.cms-content-area');
        contentAreaObjects.each(function () {
            const areaObject = $(this);
            var area = areaObject.data('cms-content-area');
            if (area) {
                area = area.toLowerCase();
                cmsModule.contentAreaObjectsMap[area] = areaObject;
                contentAreas.push(area);
            }
        });

        // Should only request interstitial content when not on a native device and we are not targetting a specific content
        if (!cmsModule.isNativeDevice() && !specificTarget) {
            contentAreas.push('interstitial');
        }

        var request = {
            path: window.location.pathname,
            areas: contentAreas,
        };

        var jsonRequest = JSON.stringify(request);
        // Retrieve content for areas on page
        return $.ajax({
            type: 'POST',
            url: '/Cms/FindAreaInstances',
            contentType: 'application/json;',
            dataType: 'json',
            data: jsonRequest,
        });
    };

    cmsModule.renderContent = function (contentResponse) {
        const isMobileWeb = cmsModule.isMobileWeb();
        const platform = isMobileWeb ? 'PhoneWeb' : 'DesktopWeb';

        if (contentResponse && contentResponse.AreaContent) {
            const areaContent = contentResponse.AreaContent;
            const renderedContent = [];

            for (let area in areaContent) {
                area = area.toLowerCase();
                const instances = areaContent[area];

                // If the area did not return any content then skip it
                if (!instances?.length) {
                    continue;
                }

                let content = [];

                if (area === 'interstitial') {
                    content = cmsModule.renderInterstitial(instances, isMobileWeb, false);
                } else if (area === 'carousel') {
                    content = cmsModule.renderCarousel(cmsModule.contentAreaObjectsMap[area], instances, isMobileWeb);
                } else if (area === 'top-ribbon') {
                    content = cmsModule.renderTopRibbon(cmsModule.contentAreaObjectsMap[area], instances);
                } else if (area === 'top-banner') {
                    content = cmsModule.renderTopBanner(cmsModule.contentAreaObjectsMap[area], instances, isMobileWeb);
                } else if (area === 'footer-custom') {
                    content = cmsModule.renderFooterCustom(cmsModule.contentAreaObjectsMap[area], instances);
                } else if (area === 'header-card' || area === 'body-card') {
                    content = cmsModule.renderCard(cmsModule.contentAreaObjectsMap[area], instances, isMobileWeb);
                } else if (area === 'article') {
                    content = cmsModule.renderArticle(cmsModule.contentAreaObjectsMap[area], instances, isMobileWeb);
                } else {
                    content = cmsModule.renderCustomArea(cmsModule.contentAreaObjectsMap[area], instances);
                }

                if (content) {
                    if (Array.isArray(content)) {
                        for (let i = 0; i < content.length; i++) {
                            renderedContent.push(content[i]);
                        }
                    } else {
                        renderedContent.push(content);
                    }
                }
            }

            //Save show interaction for all rendered content
            for (let i = 0; i < renderedContent.length; i++) {
                const content = renderedContent[i];
                cmsModule.saveInteraction(content.contentUid, content.instanceId, 'show', null, null, null, null, null, null, null, platform);
            }
        }

        // Create listeners for legacy interactions
        cmsModule.attachLegacyInteraction(platform, function (self, contentUid) {
            const href = self.attr('href');
            let act = true;
            if (href !== '#') {
                const url = cmsModule.appendContentUidToQueryString(href, contentUid);
                if (self.attr('target') !== '_blank') {
                    //If changing current window location don't act
                    act = false;
                    window.location.href = url;
                } else {
                    window.open(url);
                }
            }

            if (act) {
                //If we have an interstitial we need to act on it
                cmsModule.actOnInterstitial(self, isMobileWeb, contentUid);
            }
        });

        // Create listeners for new interactions
        const isNativeDevice = cmsModule.isNativeDevice();
        cmsModule.attachInteraction(platform, function (self, destinationUrl, destinationTarget, contentUid) {
            let act = true;
            if (destinationUrl && destinationTarget === 'newWindow' && !isMobileWeb && !isNativeDevice) {
                window.open(destinationUrl);
            } else if (destinationUrl) {
                //If changing current window location don't act
                act = false;
                window.location.href = destinationUrl;
            }

            if (act) {
                // If we have an interstitial we need to act on it
                // We always pass false for isMobile since with new interstitial there is no difference between mobile and desktop
                // In the past we used bootstrap prompt for mobile and iris for desktop
                cmsModule.actOnInterstitial(self, false, contentUid);

                //If we have a notification we need to act on it
                cmsModule.actOnNotification(self);
            }
        });
    };

    cmsModule.renderInterstitial = function (instances, isMobile, forCard, renderedHtml) {
        const instance = instances[0];
        const mimeType = instance.Content.MimeType.toLowerCase();
        const instanceId = instance.ID;
        const contentUid = instance.Content.Uid;
        const payload = instance.Data.Data;
        const isFirefox = navigator.userAgent ? (/firefox/.test(navigator.userAgent.toLowerCase())) : false;

        if (mimeType === 'application/html') {
            const intersitialWrapper = '<div class="iris-content__interstitial">{{payload}}</div>';
            const interstitialContent = cmsModule.legacyContentWrapper
                .replace('{{instanceId}}', instanceId)
                .replace('{{contentUid}}', contentUid)
                .replace('{{payload}}', intersitialWrapper.replace('{{payload}}', payload));
            if (isMobile) {
                const interstitialTemplate = '<div id="interstitial_prompt" class="card-container card-container-modal mobile-interstitial-modal"><div class="card">{{payload}}</div></div>';
                const intersitial = interstitialTemplate.replace('{{payload}}', interstitialContent);
                const intersitialObject = $(intersitial);
                $('body').append(intersitialObject);
                intersitialObject.show();
            } else {
                const interstitialTemplate = '<div id="interstitial_prompt" class="iris-prompt" aria-hidden="true" data-size="medium"><section class="iris-prompt__content"><div class="iris-prompt__body" style="padding: 0">{{payload}}</div></section></div>';
                const intersitial = interstitialTemplate.replace('{{payload}}', interstitialContent);
                const intersitialObject = $(intersitial);
                $('body').append(intersitialObject);
                var intersitialElement = document.getElementById('interstitial_prompt');
                intersitialPrompt = Alkami.Iris.PromptComponent.init(intersitialElement)[0];
                intersitialPrompt.freeze = true;
                intersitialPrompt.open = true;
            }
        } else if (mimeType === 'application/json') {
            const object = JSON.parse(payload);

            let interstitialId = 'interstitial_prompt';
            if (forCard) {
                interstitialId = interstitialId + '_' + contentUid; //TODO: this should always be added?
            }

            //Header
            const headerTemplate = '<header class="iris-prompt__header pad--0 mar-bottom--sm" style="{{style}}{{browser}}">{{image}}{{badge}}</header>';
            const badgeTemplate = '<div class="iris-badge iris-badge--circular iris-badge--polite sub-location--badge intersitial-prompt-badge instance-interaction-new" data-close data-interaction-kind="close" role="img" data-position="top-right"><span class="iris-badge__content font-icon-angle-right font-color--primary" data-icon-size="md"></span></div>';
            const header = headerTemplate
                .replace('{{image}}', cmsModule.constructImage(object.image, isMobile, ImageType.interstitial, object.headline))
                .replace('{{badge}}', forCard ? badgeTemplate : '')
                .replace('{{style}}', isMobile ? 'padding: unset;' : '')
                .replace('{{browser}}', isFirefox ? 'display: initial!important;' : '');//hack for the image within an interstitial, to force fill the x-axis of the prompt while using firefox


            //Body
            const interstitialTextId = interstitialId + '_description';
            const bodyTemplate = '<div class="iris-prompt__body pad-left--md pad-right--md">{{overline}}{{headline}}{{description}}</div>';
            const body = bodyTemplate
                .replace('{{overline}}', cmsModule.constructOverline(object.overline))
                .replace('{{headline}}', cmsModule.constructHeadline(object.headline))
                .replace('{{description}}', cmsModule.constructText(object.description, interstitialTextId));

            //Footer
            const footerTemplate = '<footer class="iris-prompt__footer block pad--md">{{positiveButton}}{{remindButton}}{{declineButton}}</footer>';
            const buttonTemplate = '<div class="row mar-top--md"><div class="col"><button class="iris-button iris-button--{{buttonStyle}} instance-interaction-new" data-size="full-width" {{dataClose}} {{interaction}} {{destination}}>{{buttonText}}</button></div></div>';
            let positive = '';
            const positiveButton = object.buttons.find(button => button.interaction.kind === 'accept' || button.interaction.kind === 'clickThrough');
            if (positiveButton) {
                positive = buttonTemplate
                    .replace('{{buttonKind}}', positiveButton.interaction.kind)
                    .replace('{{buttonStyle}}', positiveButton.style || 'primary')
                    .replace('{{dataClose}}', positiveButton.destination ? '' : 'data-close') // If there is a destination don't close dialog as they will be navigating to new page
                    .replace('{{interaction}}', cmsModule.constructInteractionAttributes(positiveButton.interaction))
                    .replace('{{destination}}', cmsModule.constructDestinationAttributes(positiveButton.destination))
                    .replace('{{buttonText}}', positiveButton.text);
            }

            let remind = '';
            const remindButton = object.buttons.find(button => button.interaction.kind === 'delay');
            if (remindButton) {
                remind = buttonTemplate
                    .replace('{{buttonKind}}', 'remind')
                    .replace('{{buttonStyle}}', remindButton.style || 'secondary')
                    .replace('{{dataClose}}', remindButton.destination ? '' : 'data-close') // If there is a destination don't close dialog as they will be navigating to new page
                    .replace('{{interaction}}', cmsModule.constructInteractionAttributes(remindButton.interaction))
                    .replace('{{destination}}', cmsModule.constructDestinationAttributes(remindButton.destination))
                    .replace('{{buttonText}}', remindButton.text);
            }

            let decline = '';
            const declineButton = object.buttons.find(button => button.interaction.kind === 'decline');
            if (declineButton) {
                decline = buttonTemplate
                    .replace('{{buttonKind}}', 'decline')
                    .replace('{{buttonStyle}}', declineButton.style || 'ghost')
                    .replace('{{dataClose}}', declineButton.destination ? '' : 'data-close') // If there is a destination don't close dialog as they will be navigating to new page
                    .replace('{{interaction}}', cmsModule.constructInteractionAttributes(declineButton.interaction))
                    .replace('{{destination}}', cmsModule.constructDestinationAttributes(declineButton.destination))
                    .replace('{{buttonText}}', declineButton.text);
            }

            const footer = footerTemplate
                .replace('{{positiveButton}}', positive)
                .replace('{{remindButton}}', remind)
                .replace('{{declineButton}}', decline);

            //Full interstitial
            const contentTemplate = '<section class="iris-prompt__content {{class}}">{{header}}{{body}}{{footer}}</section>';
            const content = contentTemplate
                .replace('{{class}}', isMobile ? 'intersitial-prompt-content-mobile' : 'intersitial-prompt-content')
                .replace('{{header}}', header)
                .replace('{{body}}', body)
                .replace('{{footer}}', footer);

            const intersitialTemplate = '<div class="iris-prompt {{class}}" style="{{style}}" id="{{interstitialId}}" aria-hidden="true" data-size="small">{{content}}</div>';
            const interstitial = cmsModule.contentWrapper
                .replace('{{instanceId}}', instanceId)
                .replace('{{contentUid}}', contentUid)
                .replace('{{payload}}', intersitialTemplate
                    .replace('{{class}}', isMobile ? 'intersitial-prompt-mobile' : 'intersitial-prompt')
                    .replace('{{style}}', isMobile ? 'width: 100%;' : 'width: 400px')
                    .replace('{{interstitialId}}', interstitialId)
                    .replace('{{content}}', content));

            const intersitialObject = $(interstitial);
            $('body').append(intersitialObject);
                       
            cmsModule.attachText(object.description, interstitialTextId, renderedHtml ? renderedHtml : instance.RenderedHtml[0]); //There should only be 1 html object

            var intersitialTarget = document.getElementById(interstitialId);
            intersitialPrompt = Alkami.Iris.PromptComponent.init(intersitialTarget)[0];
            intersitialPrompt.freeze = isMobile || forCard ? false : true;
            intersitialPrompt.open = !forCard;

            if (forCard) {
                cmsModule.cardInterstitials[contentUid] = intersitialPrompt;
            }
        }

        return {
            contentUid,
            instanceId,
        };
    };

    cmsModule.renderCarousel = function (areaObject, instances, isMobile) {
        const carouselTemplate = '<div class="carousel-wrapper"><div id="carousel2" class="carousel glide"><div class="carousel-inner glide__track" data-glide-el="track" aria-live=polite><ul class="cms-carousel-slides glide__slides">{{itemsHtml}}</ul></div>{{bulletsHtml}}</div></div>';
        const itemTemplate = '<li class="item glide__slide {{class}}"><div class="iris-content__carousel">{{payload}}</div></li>';
        const bulletsWrapper = '<div class="glide__bullets" data-glide-el="controls[nav]">{{buttonsHtml}}</div>';
        const buttonTemplate = '<button aria-controls="img_{{i}}" alt="{{buttonAltText}}" aria-label="{{buttonAriaText}}" data-glide-dir="={{index}}" class="glide__bullet"/>';

        const delay = areaObject.data('cms-content-carousel-delay') || 10000;
        let size = areaObject.data('cms-content-carousel-number') || 5;
        if (size > instances.length || size < 0) {
            size = instances.length;
        }

        let itemsHtml = '';
        let buttonsHtml = '';

        const contentRendered = [];

        for (let i = 0; i < size; i++) {
            const instance = instances[i];
            const mimeType = instance.Content.MimeType.toLowerCase();
            let item = '';
            if (mimeType === 'application/html') {
                item = itemTemplate
                    .replace('{{class}}', i === 0 ? 'active' : '')
                    .replace('{{payload}}', cmsModule.legacyContentWrapper
                        .replace('{{instanceId}}', instance.ID)
                        .replace('{{contentUid}}', instance.Content.Uid)
                        .replace('{{payload}}', instance.Data.Data));
            } else if (mimeType === 'application/json') {
                const bannerTemplate = '<div class="instance-interaction-new" {{interaction}} {{destination}}>{{image}}</div>';
                const imageTemplate = '<img class="{{imageClass}}" id="img_{{i}}" src="{{imageUrl}}" alt="{{altText}}" aria-label="{{ariaText}}" aria-live=polite>';

                const object = JSON.parse(instance.Data.Data);

                const imageUri = '/Cms/RetrieveImage?id=' + (isMobile ? object.image.mobileImageUri : object.image.desktopImageUri);

                let screenReader = '';
                let altText = '';
                if (object.image.description) {
                    screenReader = altText = object.image.description;
                } else {
                    screenReader = altText = (isMobile ? object.image.mobileImageUri : object.image.desktopImageUri).replace(/.*[\/\\]/, '');
                }
                altText = altText + ', ' + (i + 1) + ' of ' + size;

                const banner = bannerTemplate
                    .replace('{{interaction}}', cmsModule.constructInteractionAttributes(object.imageInteraction))
                    .replace('{{destination}}', cmsModule.constructDestinationAttributes(object.imageDestination))
                    .replace('{{image}}', imageTemplate
                        .replace('{{imageClass}}', size > 1 && isMobile ? 'padding-fix' : '')
                        .replace('{{imageUrl}}', imageUri)
                        .replace('{{altText}}', altText)
                        .replace('{{ariaText}}', altText)
                        .replace('{{i}}',i));

                item = itemTemplate
                    .replace('{{class}}', i === 0 ? 'active' : '')
                    .replace('{{payload}}', cmsModule.contentWrapper
                        .replace('{{instanceId}}', instance.ID)
                        .replace('{{contentUid}}', instance.Content.Uid)
                        .replace('{{payload}}', banner));
            }
            itemsHtml += item;

            let buttonAltText = 'carousel button';
            buttonAltText = buttonAltText + ', ' + (i + 1) + ' of ' + size;

            buttonsHtml += buttonTemplate
                .replace('{{buttonAltText}}', buttonAltText)
                .replace('{{buttonAriaText}}', buttonAltText)
                .replace('{{index}}', i)
                .replace('{{i}}',i);

            contentRendered.push({
                instanceId: instance.ID,
                contentUid: instance.Content.Uid,
            });
        }

        const bulletsHtml = bulletsWrapper.replace('{{buttonsHtml}}', size < 2 ? '' : buttonsHtml);

        const carousel = carouselTemplate
            .replace('{{itemsHtml}}', itemsHtml)
            .replace('{{bulletsHtml}}', bulletsHtml);

        areaObject.html(carousel);

        if (size > 1 && document.getElementById('carousel2')) {
            const glide = new Glide('#carousel2', {
                type: 'carousel',
                autoplay: delay,
            });

            let selfTrigger = false;

            glide.on('mount.after', function () {
                $('.glide__slide div.iris-content__carousel').on('click', function (e) {
                    if (!selfTrigger) {
                        $(this).find('.instance-interaction-new,.instance-interaction').each(function () {
                            selfTrigger = true;
                            $(this).trigger('click');
                            selfTrigger = false;
                        });

                        e.preventDefault();
                    }
                });
            });

            glide.mount();
        }

        return contentRendered;
    };

    cmsModule.renderTopRibbon = function (areaObject, instances) {
        const instance = instances[0];
        const mimeType = instance.Content.MimeType.toLowerCase();
        const instanceId = instance.ID;
        const contentUid = instance.Content.Uid;
        const payload = instance.Data.Data;

        if (mimeType === 'application/html') {
            const topRibbon = cmsModule.legacyContentWrapper
                .replace('{{instanceId}}', instanceId)
                .replace('{{contentUid}}', contentUid)
                .replace('{{payload}}', payload);
            areaObject.html(topRibbon);
        } else if (mimeType === 'application/json') {
            const topRibbonTemplate = '<div id="top_ribbon_system_alert" class="iris-notification iris-notification--baguette iris-notification--bulletin" role="alert"><div class="iris-notification__inner pad--xl">{{icon}}{{text}}{{dismiss}}</div></div>';
            const iconTemplate = '<div class="iris-notification__context"><span class="{{icon}}" aria-label="Alert" role="img" data-icon-size="xs"></span></div>';
            const textTemplate = '<p class="iris-notification__message mar--0">{{text}}</p>';
            const dismissTemplate = '<button class="iris-button iris-button--ghost iris-notification__action-button pad--0 instance-interaction-new" aria-label="Close Alert" {{interaction}}><span class="iris-button__icon font-icon-cancel-x" aria-hidden="true"></span></button>';

            const object = JSON.parse(payload);

            const icon = iconTemplate
                .replace('{{icon}}', object.icon);

            const text = textTemplate
                .replace('{{text}}', object.text);

            const dismiss = object.dismissible
                ? dismissTemplate.replace('{{interaction}}', cmsModule.constructInteractionAttributes(object.dismissInteraction))
                : '';

            const topRibbon = cmsModule.contentWrapper
                .replace('{{instanceId}}', instanceId)
                .replace('{{contentUid}}', contentUid)
                .replace('{{payload}}', topRibbonTemplate
                    .replace('{{icon}}', icon)
                    .replace('{{text}}', text)
                    .replace('{{dismiss}}', dismiss));
            areaObject.html(topRibbon);
        }

        return {
            contentUid,
            instanceId,
        };
    };

    cmsModule.renderTopBanner = function (areaObject, instances, isMobile) {
        const instance = instances[0];
        const mimeType = instance.Content.MimeType.toLowerCase();
        const instanceId = instance.ID;
        const contentUid = instance.Content.Uid;
        const payload = instance.Data.Data;

        if (mimeType === 'application/html') {
            const topBanner = cmsModule.legacyContentWrapper
                .replace('{{instanceId}}', instanceId)
                .replace('{{contentUid}}', contentUid)
                .replace('{{payload}}', payload);
            areaObject.html(topBanner);
        } else if (mimeType === 'application/json') {
            const topBannerTemplate = '<div class="instance-interaction-new" {{interaction}} {{destination}} aria-label="{{screenreader}}">{{image}}</div>';
            const imageTemplate = '<img src="{{imageUrl}}" alt="{{altText}}">';

            const object = JSON.parse(payload);

            const imageUri = '/Cms/RetrieveImage?id=' + (isMobile ? object.image.mobileImageUri : object.image.desktopImageUri);

            let screenReader = '';
            let altText = '';
            if (object.image.description) {
                screenReader = altText = object.image.description;
            } else {
                screenReader = altText = (isMobile ? object.image.mobileImageUri : object.image.desktopImageUri).replace(/.*[\/\\]/, '');
            }

            const banner = topBannerTemplate
                .replace('{{interaction}}', cmsModule.constructInteractionAttributes(object.imageInteraction))
                .replace('{{destination}}', cmsModule.constructDestinationAttributes(object.imageDestination))
                .replace('{{image}}', imageTemplate
                    .replace('{{imageUrl}}', imageUri)
                    .replace('{{altText}}', altText))
                .replace('{{screenreader}}', screenReader);

            const topBanner = cmsModule.contentWrapper
                .replace('{{instanceId}}', instanceId)
                .replace('{{contentUid}}', contentUid)
                .replace('{{payload}}', banner);

            areaObject.html(topBanner);
        }

        return {
            contentUid,
            instanceId,
        };
    };

    cmsModule.renderFooterCustom = function (areaObject, instances) {
        // This area only supports application/json content
        instances = instances.filter(inst => inst.Content.MimeType.toLowerCase() === 'application/json');
        if (!instances?.length) {
            return null;
        }

        const instance = instances[0];
        const instanceId = instance.ID;
        const contentUid = instance.Content.Uid;
        const payload = instance.Data.Data;
        const object = JSON.parse(payload);
        const content = object.content;
        let contentToInject = '';

        const footerCustomId = 'footer_custom_' + contentUid;
        if (content.format === 'text' || content.format === 'markdown') {
            contentToInject = '<div id="' + footerCustomId + '"></div>';
        } else if (content.format === 'html') {
            contentToInject = '<div id="' + footerCustomId + '">' + content.text + '</div>';
        }

        if (contentToInject) {
            const footerCustom = cmsModule.contentWrapper
                .replace('{{instanceId}}', instanceId)
                .replace('{{contentUid}}', contentUid)
                .replace('{{payload}}', contentToInject);
            areaObject.html(footerCustom);

            cmsModule.attachText(content, footerCustomId, instance.RenderedHtml[0]); //There should only be 1 html object
        }
        
        return {
            contentUid,
            instanceId,
        };
    };

    cmsModule.renderCard = function (areaObject, instances, isMobile) {
        // This area only supports application/json content
        instances = instances.filter(payload => payload.Content.MimeType.toLowerCase() === 'application/json');
        if (!instances?.length) {
            return null;
        }
        
        const instance = instances[0];
        const mimeType = instance.Content.MimeType.toLowerCase();
        const instanceId = instance.ID;
        const contentUid = instance.Content.Uid;
        const payload = instance.Data.Data;
        
        let card;
        const cardType = areaObject.data('cms-content-area').toLowerCase();
        const object = JSON.parse(payload);

        if (isMobile) {
            const cardTemplate = '<div class="card-container {{cardType}}-mobile" data-card-location="{{location}}">{{content}}</div>';
            const contentTemplate = '<div class="card card-full-width instance-interaction-new" data-interaction-kind="expand">{{header}}{{body}}</div>';
            const headerTemplate = '<div aria-label="{{screenreader}}"><img class="cardheader-mobile-image" src="{{imageUrl}}" alt="{{altText}}"></div>';
            const bodyTemplate = '<div class="pad-left--md pad-right--md pad-bottom--md">{{overline}}{{headline}}</div>';
            const overlineTemplate = '<p class="mar--0"><span class="font-size--xs font-weight--bold text--uppercase font-color--neutral-2">{{text}}</span></p>';
            const headlineTemplate = '<p class="mar--0"><span class="font-size--md font-weight--bold">{{text}}</span></p>';

            //Header
            let screenReader;
            let altText;

            if (object.image.description) {
                screenReader = altText = object.image.description;
            } else {
                screenReader = altText = object.headline;
            }
            const imageUri = '/Cms/RetrieveImage?id=' + (isMobile ? object.image.mobileImageUri : object.image.desktopImageUri);
            const header = headerTemplate
                .replace('{{imageUrl}}', imageUri)
                .replace('{{screenreader}}', screenReader)
                .replace('{{altText}}', altText);

            //Body
            const overline = object.overline ? overlineTemplate.replace('{{text}}', object.overline) : '';
            const headline = headlineTemplate.replace('{{text}}', object.headline);

            const body = bodyTemplate
                .replace('{{overline}}', overline)
                .replace('{{headline}}', headline);

            //Full Card
            const content = contentTemplate
                .replace('{{header}}', header)
                .replace('{{body}}', body);

            card = cmsModule.contentWrapper
                .replace('{{instanceId}}', instanceId)
                .replace('{{contentUid}}', contentUid)
                .replace('{{payload}}', cardTemplate
                    .replace('{{cardType}}', cardType)
                    .replace('{{location}}', window.location.pathname.toLowerCase()) //TODO This should be removed once we don't need to have location specific styles for cards
                    .replace('{{content}}', content));
        } else {
            
            const cardTemplate = '<div class="flex flex-justify--center {{cardType}}-desktop-{{padding}}">{{content}}</div>';
            const contentTemplate = '<div class="iris-card iris-card--shadow border--0 content-{{cardType}}-desktop instance-interaction-new {{margin}}" data-interaction-kind="expand"><div class="row flex-items--center flex-justify--center">{{image}}{{body}}{{button}}</div></div>';
            const imageTemplate = '<div class="col-auto" aria-label="{{screenreader}}"><img class="valign--middle content-card-desktop-image" src="{{imageUrl}}" alt="{{altText}}"></div>';
            const bodyTemplate = '<div class="col">{{overline}}{{headline}}</div>';
            const overlineTemplate = '<p class="mar--0"><span class="font-size--xs font-weight--bold text--uppercase font-color--neutral-2">{{text}}</span></p>';
            const headlineTemplate = '<p class="mar--0"><span class="font-size--md font-weight--bold">{{text}}</span></p>';
            const buttonTemplate = '<div class="col-auto flex flex-justify--end mar-right--lg"><button class="iris-button iris-button--ghost" aria-hidden="true"><span class="iris-button__icon font-icon-angle-right-circle"></span></button></div>';

            // Alignment based on nav bar
            const horizontalNavBar = document.getElementById('horizontal_nav_bar');

            // New nav bar is always horizontal
            // Old nav bar, if horizontal, will have this filled out
            var padding = horizontalNavBar !== undefined && horizontalNavBar !== null
                ? 'no-padding'
                : 'padding';

            // Image
            const imageUri = '/Cms/RetrieveImage?id=' + (isMobile ? object.image.mobileImageUri : object.image.desktopImageUri);
            let screenReader = '';
            let altText = '';
            if (object.image.description) {
                screenReader = altText = object.image.description;
            } else {
                screenReader = altText = object.headline;
            }
            const image = imageTemplate
                .replace('{{imageUrl}}', imageUri)
                .replace('{{screenreader}}', screenReader)
                .replace('{{altText}}', altText);

            // Body
            const overline = object.overline ? overlineTemplate.replace('{{text}}', object.overline) : '';
            const headline = headlineTemplate.replace('{{text}}', object.headline);

            const body = bodyTemplate
                .replace('{{overline}}', overline)
                .replace('{{headline}}', headline);

            // Button
            const button = buttonTemplate;

            // Full Card
            const content = contentTemplate
                .replace('{{cardType}}', cardType)
                .replace('{{margin}}', cardType === 'header-card' ? 'mar-top--xl' : '')
                .replace('{{image}}', image)
                .replace('{{body}}', body)
                .replace('{{button}}', button);

            card = cmsModule.contentWrapper
                .replace('{{instanceId}}', instanceId)
                .replace('{{contentUid}}', contentUid)
                .replace('{{payload}}', cardTemplate
                .replace('{{cardType}}', cardType)
                .replace('{{content}}', content))
                .replace('{{padding}}', padding);
        }

        const interstitialPayload = [
            {
                Content: {
                    MimeType: mimeType,
                    Uid: contentUid,
                },
                ID: instanceId,
                Data: {
                    Data: JSON.stringify(object.popover),
                },
            },
        ];
        
        cmsModule.renderInterstitial(interstitialPayload, isMobile, true, instance.RenderedHtml[0]);

        areaObject.html(card);

        return {
            contentUid,
            instanceId,
        };
    };

    cmsModule.renderArticle = function (areaObject, instances, isMobile) {

        const instance = instances.filter(inst => {
            const path = window.location.pathname.toLowerCase();
            const librarySubPath = "/library/";
            const contentId = path.substr(path.indexOf(librarySubPath) + librarySubPath.length);

            // Filter content by Id and MimeType
            return inst.ContentId.toString() === contentId && inst.Content.MimeType.toLowerCase() === 'application/json';
        })[0];
        if (!instance) {
            return null;
        }
        
        const instanceId = instance.ID;
        const contentUid = instance.Content.Uid;
        const payload = instance.Data.Data;
        let article;
        const textToAttach = [];
        const object = JSON.parse(payload);
        const header = '<div class="pad-left--md">{{overline}}{{headline}}</div>'
            .replace('{{overline}}', cmsModule.constructOverline(object.overline))
            .replace('{{headline}}', cmsModule.constructHeadline(object.headline));

        let innerContent = '<div class="row flex flex--row pad-left--md pad-right--md">';
        const itemTemplate = '<div class="{{blobClass}}">{{blob}}</div>';
        for (let i = 0; i < object.contents.length; i++) {
            const contentItem = object.contents[i];
            if (!contentItem || !contentItem.item || !contentItem.alignment) {
                continue;
            }
            const colWidthCss = isMobile
                ? 'col-12'
                : contentItem.alignment.width ? 'col-' + contentItem.alignment.width : 'col';

            switch (contentItem.item.type) {
                case 'image':
                    innerContent += itemTemplate
                        .replace('{{blobClass}}', colWidthCss)
                        .replace('{{blob}}', cmsModule.constructImage(contentItem.item, isMobile, ImageType.article, object.headline));
                    break;
                case 'formattedText':
                    const id = 'txt_' + contentUid + '_' + i + '_description';
                    textToAttach.push({
                        "description": contentItem.item,
                        "payloadIdentifier": id,
                    });
                    innerContent += itemTemplate
                        .replace('{{blobClass}}', colWidthCss)
                        .replace('{{blob}}', cmsModule.constructText(contentItem.item, id));
                    break;
                case 'button':
                    innerContent += itemTemplate
                        .replace('{{blobClass}}', colWidthCss + ' flex flex-justify--center pad-bottom--sm')
                        .replace('{{blob}}', cmsModule.constructCtaButton(contentItem.item, false));
                    break;
            }
        }
        innerContent += '</div>';

        const content = '<div class="card-container"><div class="card card-full-width"><div class="container"><div class="row">{{header}}</div><div class="row">{{content}}</div></div></div></div>'
            .replace('{{header}}', header)
            .replace('{{content}}', innerContent);

        article = cmsModule.contentWrapper
            .replace('{{instanceId}}', instanceId)
            .replace('{{contentUid}}', contentUid)
            .replace('{{payload}}', content);

        areaObject.html(article);
        for (let i = 0; i < textToAttach.length; i++) {
            const item = textToAttach[i];
            cmsModule.attachText(item.description, item.payloadIdentifier, instance.RenderedHtml[i]);
        }

        return {
            contentUid,
            instanceId,
        };
    };

    cmsModule.renderCustomArea = function (areaObject, instances) {
        const instance = instances[0];
        const mimeType = instance.Content.MimeType.toLowerCase();
        const instanceId = instance.ID;
        const contentUid = instance.Content.Uid;
        const payload = instance.Data.Data;

        //If there is custom area that we don't know about module will only handle it if the content is html
        if (mimeType === 'application/html') {
            const custom = cmsModule.legacyContentWrapper
                .replace('{{instanceId}}', instanceId)
                .replace('{{contentUid}}', contentUid)
                .replace('{{payload}}', payload);
            areaObject.html(custom);
        }

        return {
            contentUid,
            instanceId,
        };
    };


    cmsModule.attachLegacyInteraction = function (platform, always) {
        $('body').on('click', '.interstitial-interaction, .instance-interaction', function (e) {
            e.preventDefault();

            var self = $(this);

            var interactionType = this.className
                .replace('instance-interaction', '')
                .replace('interstitial-interaction', '')
                .match(/(?:interstitial|instance)-[-\w]+/)[0];

            const contentUid = self.closest('.iris-content').data('content-uid');
            const instanceId = self.closest('.iris-content').data('id');
            const delayType = self.data('remind_delay_type');
            const delayBy = self.data('remind_delay');

            //Because legacy interactions can contain any manner of urls we will not rely on interaction to resolve destination but just go to the url defined if any
            cmsModule.saveInteraction(contentUid, instanceId, interactionType, delayType, delayBy, null, null, null, null, null, platform).always(always(self, contentUid));
            return false;
        });
    };

    cmsModule.attachInteraction = function (platform, always) {
        $('body').on('click', '.instance-interaction-new', function (e) {
            e.preventDefault();

            var self = $(this);

            const contentUid = self.closest('.iris-content').data('content-uid');
            const instanceId = self.closest('.iris-content').data('instance-id');
            const interactionType = self.data('interaction-kind');
            const delayType = self.data('remind-delay-type');
            const delayBy = self.data('remind-delay');
            const destinationKind = self.data('destination-kind');
            const destinationUri = self.data('destination-uri');
            const destinationWidget = self.data('destination-widget');
            const destinationSubPath = self.data('destination-subpath');
            const destinationTarget = self.data('destination-target');
            const cardContent = cmsModule.cardInterstitials[contentUid];

            const jqxhr = cmsModule.saveInteraction(contentUid, instanceId, interactionType, delayType, delayBy, destinationKind, destinationUri, destinationWidget, destinationSubPath, destinationTarget, platform);

            // If a destination was passed to be resolved then we need to wait on interaction to be complete
            const synchronous = destinationKind && (destinationUri || destinationWidget);
            if (synchronous) {
                jqxhr.done(function (response) {
                    let destinationUrl = '';
                    if (response.HasError) {
                        console.log('The destination service returned with an error');
                    }
                    if (response) {
                        if (response.DestinationUrl) {
                            destinationUrl = response.DestinationUrl;
                        }
                    } else {
                        console.log('Failed to get an interaction response');
                    }
                    always(self, destinationUrl, destinationTarget, contentUid);
                });
            } else {
                always(self, null, null, contentUid);
            }
            if (cardContent && (interactionType === 'decline' || interactionType === 'delay' || interactionType === 'accept' || interactionType === 'clickThrough')) {
                const interactCard = $('[data-content-uid="' + contentUid + '"]>:not(.iris-prompt)').parent();
                if (interactCard) {
                    interactCard.hide();
                    interactCard.hidden = true;
                }

            }
            return false;
        });
    };

    cmsModule.attachText = function (description, payloadIdentifier, renderedHtml) {
        if (!description || !description.text || !description.format) {
            return;
        }

        if (description.format === 'text') {
            $('#' + payloadIdentifier).text(description.text);
        } else if (description.format === 'markdown') {
            try {
                //if the rendered html is available use that, otherwise pa
                if (renderedHtml) {
                    $('#' + payloadIdentifier).html(renderedHtml);
                }

                // Attach attributes to anchor tags so they open in a new window and track as clickThrough
                $('#' + payloadIdentifier + ' a:not([data-destination-target])')
                    .each((i, e) => {
                        $(e).attr('data-interaction-kind', 'clickThrough')
                            .attr('data-destination-kind', 'uri')
                            .attr('data-destination-uri', e.href)
                            .attr('data-destination-target', 'newWindow')
                            .attr('rel', 'noopener noreferrer')
                            .addClass('instance-interaction-new');
                    });
            } catch (e) {
                console.log('failed to make cms anchors open in a new window');
            }
        }
    };


    cmsModule.appendContentUidToQueryString = function (originalUrl, contentUid) {
        if (originalUrl === '#')
            return originalUrl;

        // test if there is already query string
        if (originalUrl.indexOf('?') > -1) {
            return originalUrl + '&alkami_contentuid=' + contentUid;
        } else {
            return originalUrl + '?alkami_contentuid=' + contentUid;
        }
    };

    cmsModule.saveInteraction = function (contentUid, instanceId, interactionType, delayType, delayBy, destinationKind, destinationUri, destinationWidget, destinationSubPath, destinationTarget, platform) {
        var request = {
            contentUid,
            instanceId,
            interactionType,
            delayType,
            delayBy,
            destinationKind,
            destinationUri,
            destinationWidget,
            destinationSubPath,
            destinationTarget,
            platform,
        };

        return $.ajax({
            type: 'POST',
            url: '/Cms/SaveInteraction',
            contentType: 'application/json;',
            dataType: 'json',
            data: JSON.stringify(request),
        });
    };

    cmsModule.actOnInterstitial = function (self, isMobile, contentUid) {
        const interstitialId = '#interstitial_prompt_' + contentUid;
        if (self.closest('#interstitial_prompt.iris-prompt,' + interstitialId + ',#interstitial_prompt.mobile-interstitial-modal').length > 0) {
            if (isMobile) {
                const interstitialModal = $('#interstitial_prompt');
                interstitialModal.hide();
            } else {
                if (cmsModule.cardInterstitials[contentUid]) {
                    cmsModule.cardInterstitials[contentUid].open = false;
                } else {
                    const element = document.getElementById('interstitial_prompt');
                    const interstitialPrompt = Alkami.Iris.Prompt.componentForElement(element);
                    interstitialPrompt.open = false;
                }
            }
        } else if (cmsModule.cardInterstitials[contentUid]) {
            // Open card interstitial
            cmsModule.cardInterstitials[contentUid].open = true;
        }
    };

    cmsModule.actOnNotification = function (self) {
        if (self.closest('#top_ribbon_system_alert.iris-notification').length > 0) {
            const element = document.getElementById('top_ribbon_system_alert');
            Alkami.Dom.fadeOut(element, 400, () => {
                if (element.parentElement) {
                    element.parentElement.removeChild(element);
                }
            });
        }
    };


    cmsModule.constructInteractionAttributes = function (interaction) {
        // data-interaction-kind="{{kind}}" data-remind-delay="{{delayBy}}" data-remind-delay-type="{{delayType}}"
        let interactionAttributes = '';

        if (!interaction || !interaction.kind) {
            return interactionAttributes;
        }

        interactionAttributes += 'data-interaction-kind="' + interaction.kind + '" ';

        if (interaction.delayBy) {
            interactionAttributes += 'data-remind-delay="' + interaction.delayBy + '" ';
        }

        if (interaction.delayType) {
            interactionAttributes += 'data-remind-delay-type="' + interaction.delayType + '"';
        }

        return interactionAttributes;
    };

    cmsModule.constructDestinationAttributes = function (destination) {
        // data-destination-kind="{{kind}}" data-destination-uri="{{uri}}" data-destination-widget="{{widget}}" data-destination-subpath="{{subpath}}" data-destination-target="{{target}}"
        let destinationAttributes = '';

        if (!destination || !destination.kind) {
            return destinationAttributes;
        }

        destinationAttributes += 'data-destination-kind="' + destination.kind + '" ';

        if (destination.uri) {
            destinationAttributes += 'data-destination-uri="' + destination.uri + '" ';
        }

        if (destination.widget) {
            destinationAttributes += 'data-destination-widget="' + destination.widget + '"';
        }

        if (destination.subpath) {
            destinationAttributes += 'data-destination-subpath="' + destination.subpath + '"';
        }

        if (destination.target) {
            destinationAttributes += 'data-destination-target="' + destination.target + '"';
        }

        return destinationAttributes;
    };

    cmsModule.constructOverline = function (text) {
        if (!text) {
            return '';
        }

        return '<p class="mar--0"><span class="font-size--xs font-weight--bold text--uppercase font-color--neutral-2">{{text}}</span></p>'
            .replace('{{text}}', text);
    };

    cmsModule.constructHeadline = function (text) {
        if (!text) {
            return '';
        }

        return '<p class="mar--0"><span class="font-size--md font-weight--bold">{{text}}</span></p>'
            .replace('{{text}}', text);
    };

    cmsModule.constructImage = function (img, isMobile, imageType, altTextDefault) {
        if (!img) {
            return '';
        }

        let imageStyle = '';
        let containerStyle = '';
        switch (imageType) {
            case ImageType.interstitial:
                imageStyle = 'intersitial-prompt-header-image';
                containerStyle = 'intersitial-container'
                break;
             case ImageType.card:
                imageStyle = 'valign--middle content-card-desktop-image';
                containerStyle = 'col-auto';
                break;
            case ImageType.article:
                imageStyle = 'content-article-image';
                containerStyle = 'content-article-image';
                break;
            case ImageType.banner:
            case ImageType.unknown:
            default:
                imageStyle = '';
                break;
        }

        let screenReader = '';
        let altText = '';
        if (img.description) {
            screenReader = altText = img.description;
        } else {
            screenReader = altText = altTextDefault;
        }

        const imageUri = '/Cms/RetrieveImage?id=' + (isMobile ? img.mobileImageUri : img.desktopImageUri);

        const image = '<div class="{{containerStyle}}" aria-label="{{screenreader}}"><img class="{{imageStyle}}" src="{{imageUrl}}" alt="{{altText}}"></div>'
            .replace('{{containerStyle}}', containerStyle)
            .replace('{{screenreader}}', screenReader)
            .replace('{{imageStyle}}', imageStyle)
            .replace('{{imageUrl}}', imageUri)
            .replace('{{altText}}', altText);

        return image;
    };

    cmsModule.constructText = function (description, payloadIdentifier) {
        if (!description || !description.text || !description.format) {
            return '';
        }

        let descriptionContent = '';
        if (description.format === 'text') {
            descriptionContent = '<p><span id="{{id}}" class="font-size--sm"></span></p>'
                .replace('{{id}}', payloadIdentifier);
        } else if (description.format === 'markdown') {
            descriptionContent = '<div id="{{id}}" class="font-size--sm"></div>'
                .replace('{{id}}', payloadIdentifier);
        } else if (description.format === 'html') {
            descriptionContent = description.text;
        }

        const payload = '<div>{{descriptionContent}}</div>'
            .replace('{{descriptionContent}}', descriptionContent);
        return payload;
    };

    cmsModule.constructCtaButton = function (btn, isFullWidth) {
        const button = '<button class="iris-button iris-button--{{buttonStyle}} instance-interaction-new" {{dataSize}}{{dataClose}}{{interaction}} {{destination}}>{{buttonText}}</button>'
            .replace('{{buttonKind}}', btn.interaction.kind)
            .replace('{{buttonStyle}}', btn.style || 'primary')
            .replace('{{dataSize}}', isFullWidth ? 'data-size="full-width" ' : '') // If the button background should take up the full column space
            .replace('{{dataClose}}', btn.destination ? '' : 'data-close ') // If there is a destination don't close dialog as they will be navigating to new page
            .replace('{{interaction}}', cmsModule.constructInteractionAttributes(btn.interaction))
            .replace('{{destination}}', cmsModule.constructDestinationAttributes(btn.destination))
            .replace('{{buttonText}}', btn.text);
        return button;
    };


    cmsModule.isNativeDevice = function () {
        let isNativeDevice = false;
        try {
            isNativeDevice = navigator.userAgent.indexOf('NATIVEAPP') > -1 || navigator.userAgent.indexOf('NATIVETABLET') > -1;
        } catch (e) {
            // Do nothing
        }
        return isNativeDevice;
    };

    cmsModule.isNativeRequest = function () {
        let isNativeRequest = false;
        try {
            isNativeRequest = cmsModule.isNativeDevice() && window.location.pathname === '/';
        } catch (e) {
            // Do nothing
        }
        return isNativeRequest;
    };

    cmsModule.isMobileWeb = function () {
        var isMobileWeb = false;
        try {
            isMobileWeb = window.location.pathname.split('/')[1].toLowerCase() === 'mobile';
        } catch (e) {
            //Do nothing
        }
        return isMobileWeb;
    };

    // LOAD!
    cmsModule.loadSpecificContent = function (e) {
        const content = cmsModule.fetchContent($(e.target));
        cmsModule.renderContent(content);
    };

    if (cmsModule.isNativeRequest()) {
        const always = function (self, contentUid) {
            //native requires a window location change or open event to determine what action is needed thereafter
            //if # link is sent then webview should be closed, else webview should show destination url as appropriate
            var href = self.attr('href');
            var url = cmsModule.appendContentUidToQueryString(href, contentUid);
            if (self.attr('target') !== '_blank') {
                window.location.href = url;
            } else {
                window.open(url);
            }
        };
        cmsModule.attachLegacyInteraction('NativePhone', always);
    } else { // Non-native load
        $.when(
           cmsModule.fetchContent(null) 
        ).then(function (contentToLoad) {
            if (contentToLoad) {
                cmsModule.renderContent(contentToLoad);
            }

            $('div.cms-content-area').on('cms-fetch-content', cmsModule.loadSpecificContent); // Register new areas to trigger specific content loading
            
            cmsModule.isLoaded = true;
        });
    }

    const ImageType = {
        "unknown": 0,
        "interstitial": 1,
        "card": 2,
        "banner": 3,
        "article": 4,
    };

})(window);