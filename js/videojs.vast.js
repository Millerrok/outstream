(function (window, vjs, vast, undefined) {
    'use strict';

    var extend = function (obj) {
            var arg, i, k;
            for (i = 1; i < arguments.length; i++) {
                arg = arguments[i];
                for (k in arg) {
                    if (arg.hasOwnProperty(k)) {
                        obj[k] = arg[k];
                    }
                }
            }
            return obj;
        },

        defaults = {
            // seconds before skip button shows, negative values to disable skip button altogether
            skip: 2, //TODO Change skip to 5s
            bitrate: 1000, //advised bitrate for VPAID ads
            viewMode: 'normal', //view mode for VPAID ads. Possible values: normal, thumbnail, fullscreen
            vpaidElement: undefined //html element used for vpaid ads
        },

        Vast = function (player, settings, VpaidOpts) {

            var playerId = settings.playerId;

            if (!window.VpaidflashWrappers) {
                window.VpaidflashWrappers = {}
            }

            window.VpaidflashWrappers[playerId] = {};

            // Reference
            var wrapper = window.VpaidflashWrappers[playerId];

            wrapper.pause = function () {
                player.el_.getElementsByTagName('video')[0].style.display = 'none';
                ga('send', 'event', 'VPAID', 'pauseRequested');
            };
            wrapper.resume = function () {
                player.el_.getElementsByTagName('video')[0].style.display = 'block';
                player.play();
                player.controls(true);
                ga('send', 'event', 'VPAID', 'resume');
            };
            wrapper.adStarted = function () {
                player.ads.isAdLoaded = true;
                player.trigger("vpaid_ad_started");
                if(player.techName == "Flash"){
                    document.getElementsByTagName("object")[0].style.width="1%"
                    document.getElementsByTagName("object")[0].style.height="1%"
                }
                player.pause();
                player.controls(false);
                ga('send', 'event', 'VPAID', 'started');
            };
            wrapper.adError = function (e) {
                player.el_.getElementsByTagName('video')[0].style.display = 'block'
                player.trigger("vpaid_ad_error", e);
                if (player.options_.autoplay || player.hasStarted()) {
                    player.play();
                }

                player.ads.isAdLoaded = true;
                player.controls(true);
                player.ads.endLinearAdMode();
                ga('send', 'event', 'VPAID', 'error',e);
            };
            wrapper.adComplete = function () {
                player.trigger("vpaid_ad_complete");
                if(player.techName == "Flash"){
                    document.getElementsByTagName("object")[0].style.width="100%"
                    document.getElementsByTagName("object")[0].style.height="100%"
                    player.play();
                    player.controls(true);

                }else{
                    player.el_.getElementsByTagName('video')[0].style.display = 'block'
                }
                player.ads.endLinearAdMode();
                ga('send', 'event', 'VPAID', 'complete');
            };
            wrapper.adVideoLength = function () {
                return Math.round(player.currentTime()*1000);
            };

            wrapper.linearChangedClosure = function(){
                player.trigger("vpaid_ad_lineral_changed");
            };

            wrapper.clickedClosure = function(){
                player.trigger("vpaid_ad_clicked");
            };

            wrapper.skippedClosure = function(){
                player.trigger("vpaid_ad_skipped");
            };

            wrapper.pausedClosure = function(){
                player.trigger("vpaid_ad_paused");
            };

            wrapper.resumedClosure = function(){
                player.trigger("vpaid_ad_resumed");
            };

            wrapper.adTimeClosure = function(){
                player.trigger("vpaid_ad_time");
            };

            wrapper.adLog = function (params) {};

            /*
             clickClosure:"",
             impressionClosure:"",
             adLoaderError:"",
             adManagerError:"",
             */
            wrapper.clickClosure = function (){
                player.trigger("vpaid_ad_clicked");
            };
            wrapper.impressionClosure = function (){
                player.trigger("vpaid_impression");
            };
            wrapper.adLoaderError  = function (){
                player.trigger("vpaid_adloader_error");
            };
            wrapper.adManagerError = function (){
                player.trigger("vpaid_admanager_error");
            };
            wrapper.adLoadedClosure = function () {
                player.trigger("vpaid_ad_loaded");
                player.ads.vpaidDefer.resolve();
            };

            wrapper.startFlashWrapper = function () {
                player.trigger('flash:wrapper:start');

                if(!wrapper.xml){
                    ga("send","event","VPAID",'error','Error during loading vast.');
                    return;
                }

                var isAsyncPaused = settings.async && player.paused();
                if (!settings.background && !isAsyncPaused) {
                    player.pause();
                    player.controls(false);
                }

                var w = player.width() , h = player.height();
                var SdkIntegration = window["SdkIntegration" + settings.playerId];

                var tpl = "window.VpaidflashWrappers[" + settings.playerId + "]";
                this.config = {
                    contentPauseRequestClosure: tpl + ".pause",
                    contentResumeRequestClosure: tpl + ".resume",
                    adStartedClosure: tpl + ".adStarted",
                    adErrorClosure: tpl + ".adError",
                    adCompleteClosure: tpl + ".adComplete",
                    adVideoLength: tpl + ".adVideoLength",
                    adLogClosure: tpl + ".adLog",
                    clickClosure: tpl + ".clickClosure",
                    impressionClosure: tpl + ".impressionClosure",
                    adLoaderError: tpl + ".adLoaderError",
                    adManagerError: tpl + ".adManagerError",
                    adLoadedClosure: tpl + ".adLoadedClosure",
                    volume: 1,
                    width: w,
                    height: h,
                    vastResponse: encodeURIComponent(window.VpaidflashWrappers[playerId].xml)
                };

                SdkIntegration.width = w;
                SdkIntegration.height = h;

                SdkIntegration.loadAd(JSON.stringify(VpaidflashWrappers[playerId].config));
            };

            // return vast plugin
            return {
                createSourceObjects: function (media_files) {
                    var sourcesByFormat = {}, i, j, tech;
                    var techOrder = player.options().techOrder;
                    for (i = 0, j = techOrder.length; i < j; i++) {
                        var techName = techOrder[i].charAt(0).toUpperCase() + techOrder[i].slice(1);
                        tech = window.videojs[techName];

                        // Check if the current tech is defined before continuing
                        if (!tech) {
                            continue;
                        }

                        // Check if the browser supports this technology
                        if (tech.isSupported()) {
                            // Loop through each source object
                            for (var a = 0, b = media_files.length; a < b; a++) {
                                var media_file = media_files[a];
                                var source = {type: media_file.mimeType, src: media_file.fileURL};
                                // Check if source can be played with this technology
                                if (tech.canPlaySource(source)) {
                                    if (sourcesByFormat[techOrder[i]] === undefined) {
                                        sourcesByFormat[techOrder[i]] = [];
                                    }
                                    sourcesByFormat[techOrder[i]].push({
                                        type: media_file.mimeType,
                                        src: media_file.fileURL,
                                        width: media_file.width,
                                        height: media_file.height
                                    });
                                } else if (tech.canPlaySource(source) == false && media_file.mimeType == "application/x-shockwave-flash") { /*TODO переписать условие*/
                                    if (sourcesByFormat[techOrder[i]] === undefined) {
                                        sourcesByFormat[techOrder[i]] = [];
                                    }
                                    sourcesByFormat[techOrder[i]].push({
                                        type: media_file.mimeType,
                                        src: media_file.fileURL,
                                        width: media_file.width,
                                        height: media_file.height,
                                        apiFramework: media_file.apiFramework
                                    });
                                }
                            }
                        }
                    }
                    // Create sources in preferred format order
                    var sources = [];
                    for (j = 0; j < techOrder.length; j++) {
                        tech = techOrder[j];
                        if (sourcesByFormat[tech] !== undefined) {
                            for (i = 0; i < sourcesByFormat[tech].length; i++) {
                                sources.push(sourcesByFormat[tech][i]);
                            }
                        }
                    }
                    return sources;
                },
                createStaticObject: function (creative) {
                    var sources = [];
                    for (var a = 0; a < creative.staticResources.length; a++) {
                        var source = {
                            type: creative.staticResources[a].mimeType,
                            src: creative.staticResources[a].fileURL,
                            width: creative.staticResources[a].width,
                            height: creative.staticResources[a].height,
                            clickThrough: creative.ClickThroughURLTemplate
                        };
                        sources.push(source);
                    }
                    return sources;
                },
                getContent: function () {
                    /**
                     * frequency capping for req
                     */
                    if (
                        this.videeAdvertsLastCalled &&
                        (Math.floor( (new Date()).getTime()/1000 ) - this.videeAdvertsLastCalled) < 1
                    ) {
                        return;
                    }
                    this.videeAdvertsLastCalled = Math.floor( (new Date()).getTime()/1000 );
                    /*
                     * change vast cb
                     */
                    settings.url = settings.url.replace(/cb=\d+/,"cb="+ Math.floor(Math.random() * (99999999 - 1)) + 1);
                    player.trigger("vast_ad_request");
                    // query vast url given in settings
                    vast.client.get(settings.url, settings.playerId, function (response) {
                        var error;

                        if (response) {
                            player.vastResponse = response;
                            player.vastResponse.currentSequence = 1;
                            // we got a response, deal with it
                            for (var adIdx = 0; adIdx < response.ads.length; adIdx++) {
                                var ad = response.ads[adIdx];
                                player.vast.companion = undefined;

                                for (var creaIdx = 0; creaIdx < ad.creatives.length; creaIdx++) {
                                    var creative = ad.creatives[creaIdx], foundCreative = false, foundCompanion = false;

                                    if (creative.type === "linear" && !foundCreative) {
                                        if (creative.mediaFiles.length) {
                                            //player.vast.sources = player.vast.createSourceObjects(creative.mediaFiles);

                                            player.vast.setAdSources();
                                            if (!player.vast.sources.length) {
                                                player.trigger('adscanceled');
                                                return;
                                            }
                                            player.trigger("vpaid_ad_response");
                                            player.vastTracker = new vast.tracker(ad, creative);
                                            foundCreative = true;
                                        }
                                    } else if (creative.type === "companion" && !foundCompanion) {
                                        //player.vast.companion = creative;
                                        player.vast.setCompanion();
                                        //player.vast.showCompanionResources(player.vast.companion);
                                        foundCompanion = true;
                                    } else if (creative.type === "nonlinear" && !foundCreative) {
                                        if (creative.staticResources.length) {
                                            player.vast.nonlinearObjects = player.vast.createStaticObject(creative);
                                            if (!player.vast.nonlinearObjects.length) {
                                                player.trigger('adscanceled');
                                                return;
                                            }
                                            //player.vast.nonlinear = creative;
                                            player.vastTracker = new vast.tracker(ad, creative);

                                            foundCreative = true;
                                        }
                                    }
                                }

                                if (player.vastTracker) {
                                    // vast tracker and content is ready to go, trigger event
                                    player.ads.vastDefer.resolve();
                                    error = null;
                                    break;
                                } else {
                                    error = new Error('No ads found in VAST');
                                    // Inform ad server we can't find suitable media file for this ad
                                    vast.util.track(ad.errorURLTemplates, {ERRORCODE: 403});
                                }
                            }
                        }
                        else {
                            error = new Error('No VAST response from Ad server');
                        }

                        if (error) {
                            // No preroll, cancel ads
                            player.ads.vastDefer.reject(error);
                        }
                    });

                    return player.ads.vastDefer.promise;
                },

                setAdSources: function () {
                    player.vast.sources = player.vast.createSourceObjects(player.vastResponse.ads[player.vastResponse.currentSequence - 1].creatives[0].mediaFiles);
                },
                setCompanion: function () {

                    player.vast.companion = player.vastResponse.ads[player.vastResponse.currentSequence - 1].creatives[player.vastResponse.ads[player.vastResponse.currentSequence - 1].creatives.length-1];
                    player.vast.showCompanionResources(player.vast.companion);
                },
                removeCompanion: function () {
                    var ads = document.querySelectorAll('.vast-companion-ad');
                    for (var i = 0; i < ads.length; i++) {
                        var ad = ads[i];
                        ad.parentNode.removeChild(ad);
                    }
                },

                setupEvents: function () {

                    var errorOccurred = false,
                        canplayFn = function () {
                            player.vastTracker.load();
                        },
                        timeupdateFn = function () {
                            if (isNaN(player.vastTracker.assetDuration)) {
                                player.vastTracker.assetDuration = player.duration();
                            }
                            player.vastTracker.setProgress(player.currentTime());
                        },
                        pauseFn = function () {
                            player.vastTracker.setPaused(true);
                            player.one('play', function () {
                                player.vastTracker.setPaused(false);
                            });
                        },
                        errorFn = function () {
                            // Inform ad server we couldn't play the media file for this ad
                            vast.util.track(player.vastTracker.ad.errorURLTemplates, {ERRORCODE: 405});
                            errorOccurred = true;
                            player.trigger('ended');
                        },
                        mutedFn = function () {
                            player.vastTracker.setMuted(player.muted());
                        },
                        fullscreenFn = function () {
                            player.vastTracker.setFullscreen(player.isFullscreen())
                        };

                    player.on('canplay', canplayFn);
                    player.on('timeupdate', timeupdateFn);
                    player.on('pause', pauseFn);
                    player.on('error', errorFn);
                    player.on('volumechange', mutedFn);
                    player.on('fullscreenchange', fullscreenFn);

                    player.one('vast-preroll-removed', function () {
                        player.off('canplay', canplayFn);
                        player.off('timeupdate', timeupdateFn);
                        player.off('pause', pauseFn);
                        player.off('error', errorFn);
                        if (!errorOccurred) {
                            player.vastTracker.complete();
                        }
                    });
                },

                preroll: function () {
                    player.ads.startLinearAdMode();
                    player.vast.showControls = player.controls();
                    if (player.vast.showControls) {
                        player.controls(false);
                    }

                    // load linear ad sources and start playing them
                    player.src(player.vast.sources);

                    var clickthrough;
                    if (player.vastTracker.clickThroughURLTemplate) {
                        clickthrough = vast.util.resolveURLTemplates(
                            [player.vastTracker.clickThroughURLTemplate],
                            {
                                CACHEBUSTER: Math.round(Math.random() * 1.0e+10),
                                CONTENTPLAYHEAD: player.vastTracker.progressFormated()
                            }
                        )[0];
                    }
                    var blocker = window.document.createElement("a");
                    blocker.className = "vast-blocker";
                    blocker.href = clickthrough || "#";
                    blocker.target = "_blank";
                    blocker.onclick = function () {
                        if (player.paused()) {
                            player.play();
                            return false;
                        }
                        var clicktrackers = player.vastTracker.clickTrackingURLTemplate;
                        if (clicktrackers) {
                            player.vastTracker.trackURLs([clicktrackers]);
                        }
                        player.trigger("adclick");
                    };
                    player.vast.blocker = blocker;
                    player.el().insertBefore(blocker, player.controlBar.el());

                    var skipButton = window.document.createElement("div");
                    skipButton.className = "vast-skip-button";
                    if (settings.skip < 0) {
                        skipButton.style.display = "none";
                    }
                    player.vast.skipButton = skipButton;

                    player.el().appendChild(skipButton);

                    player.on("timeupdate", player.vast.timeupdate);

                    skipButton.onclick = function (e) {
                        if ((' ' + player.vast.skipButton.className + ' ').indexOf(' enabled ') >= 0) {
                            player.vastTracker.skip();
                            player.vast.nextAdCall();
                        }
                        if (window.Event.prototype.stopPropagation !== undefined) {
                            e.stopPropagation();
                        } else {
                            return false;
                        }
                    };

                    player.vast.setupEvents();

                    if (!(player.vastResponse.currentSequence < player.vastResponse.ads.length)) {
                        player.one('ended', player.vast.tearDown);
                    }

                    player.trigger('vast-preroll-ready');
                },

                nextAdCall: function () {
                    if (!(player.vastResponse.currentSequence < player.vastResponse.ads.length)) {
                        player.vast.tearDown();
                    } else {
                        player.trigger('ended');
                    }
                },

                removeClicks: function () {
                    player.vast.skipButton && player.vast.skipButton.parentNode.removeChild(player.vast.skipButton);
                    player.vast.collapseButton && player.vast.collapseButton.parentNode.removeChild(player.vast.collapseButton);
                    player.vast.expandButton && player.vast.expandButton.parentNode.removeChild(player.vast.expandButton);
                    player.vast.blocker && player.vast.blocker.parentNode.removeChild(player.vast.blocker);
                },

                embedSWF: function () {
                    var blocker = document.createElement('div');
                    blocker.className = 'flash-blocker';
                    var sdkUnique = 'SdkIntegration' + settings.playerId;
                    player.vast.blocker = blocker;
                    blocker.innerHTML='<div id="' + sdkUnique + '"></div>';
                    player.el().insertBefore(blocker, player.controlBar.el());
                    var flashvars = {
                        onReady: "window.VpaidflashWrappers[" + settings.playerId + "].startFlashWrapper"
                    };
                    var params = {
                        allowScriptAccess: "always",
                        allowFullScreen: "true",
                        wmode:'transparent'
                    };
                    var attributes = {};
                    var expressInstallSwfUrl;
                    var minimalFlashVersion = "10.0.0";

                    var w = player.width();
                    var h = player.height();

                    swfobject.embedSWF($$vdOptions$$.cdn.staticFiles + "/resources/libs/videejs-player.swf",
                        sdkUnique,
                        w,
                        h,
                        minimalFlashVersion,
                        expressInstallSwfUrl,
                        flashvars,
                        params,
                        attributes);
                    debugger;
                },

                prerollVPAID: function () {
                    player.ads.startLinearAdMode();
                    window['SdkIntegration' + settings.playerId].startAd();
                },

                // Companion Ads blocks
                showCompanionResources: function (creative) {
                    // iterate through companions and add them to body
                    var companionContent, param;
                    if(creative.variations)
                    for (var i = 0; i < creative.variations.length; i++) {
                        var companionBlock = document.createElement('div');
                        //document.body.appendChild(companionBlock);

                        // iterate through possible placeholders
                        for (var placeholderWidth in player.companionPlaceholders) {
                            // append creative to block that fits size of placeholder
                            var sizeDiff = Math.abs(parseInt(placeholderWidth) - creative.variations[i].width);
                            if (creative.variations[i].width <= parseInt(placeholderWidth) && sizeDiff < 50) {
                                var placeholder = document.getElementById(player.companionPlaceholders[placeholderWidth]);
                                placeholder.appendChild(companionBlock);
                            }
                        }

                        //"image/gif".match(/(.*)\//)[1]
                        if (creative.variations[i] && creative.variations[i].type) {

                            switch (creative.variations[i].type.split('/')[0]) {
                                case "IFrame":
                                    var iFrame = document.createElement('iframe');
                                    iFrame.src = creative.variations[i].staticResource;
                                    iFrame.width = creative.variations[i].width;
                                    iFrame.height = creative.variations[i].height;
                                    iFrame.frameBorder = "0";
                                    iFrame.scrolling = "no";
                                    companionBlock.appendChild(iFrame);
                                    break;
                                case "HTML":
                                    companionBlock.innerHTML = creative.variations[i].staticResource;
                                    break;
                                case "image":
                                    var companionClickThroughLink = document.createElement('a');
                                    companionClickThroughLink.href = creative.variations[i].companionClickThroughURLTemplate;
                                    companionClickThroughLink.target = '_blank';
                                    companionContent = document.createElement('img');
                                    companionContent.src = creative.variations[i].staticResource;
                                    companionClickThroughLink.appendChild(companionContent);
                                    companionClickThroughLink && companionBlock.appendChild(companionClickThroughLink);
                                    break;
                                case "application":
                                    companionContent = document.createElement('object');
                                    param = document.createElement('param');
                                    param.name = 'FlashVars';
                                    param.value = "clickTag=" + encodeURIComponent(creative.variations[i].companionClickThroughURLTemplate);
                                    companionContent.appendChild(param);
                                    //companionContent.style.pointerEvents = "none";
                                    companionContent.setAttribute("type", "application/x-shockwave-flash");
                                    companionContent.setAttribute("data", creative.variations[i].staticResource);
                                    companionBlock.appendChild(companionContent);
                            }
                        }
                        companionBlock.className = 'vast-companion-ad';
                        companionBlock.style.width = creative.variations[i].width;

                        if (companionContent) {
                            companionContent.className = 'vast-companion-content';
                            companionContent.width = creative.variations[i].width;
                            companionContent.height = creative.variations[i].height;
                        }
                    }
                },

                // Non linear overlay
                showStaticResource: function () {
                    player.ads.startNonLinearAdMode();
                    var clickthrough;
                    if (player.vastTracker.clickThroughURLTemplate) {
                        clickthrough = vast.util.resolveURLTemplates(
                            [player.vastTracker.clickThroughURLTemplate],
                            {
                                CACHEBUSTER: Math.round(Math.random() * 1.0e+10),
                                CONTENTPLAYHEAD: player.vastTracker.progressFormated()
                            }
                        )[0];
                    } else {
                        clickthrough = player.vastTracker.creative.ClickThroughURLTemplate
                    }

                    var overlay = window.document.createElement("a");
                    overlay.className = "vast-overlay";
                    overlay.href = clickthrough || "#";
                    overlay.target = "_blank";
                    overlay.style.width = player.vast.nonlinearObjects[0].width + 'px';
                    overlay.style.height = player.vast.nonlinearObjects[0].height + 'px';
                    overlay.onclick = function () {
                        var clicktrackers = player.vastTracker.clickTrackingURLTemplate;
                        if (clicktrackers) {
                            player.vastTracker.trackURLs([clicktrackers]);
                        }
                        player.trigger("adclick");
                    };
                    player.vast.blocker = overlay;
                    player.el().insertBefore(overlay, player.controlBar.el());

                    if (player.vast.nonlinearObjects[0].type.indexOf("image") != -1) {  /*todo array images impl*/
                        overlay.style.backgroundImage = "url(" + player.vast.nonlinearObjects[0].src + ")";
                    }
                    var collapseButton = document.createElement("div");
                    var expandButton = document.createElement("div");

                    collapseButton.className = "vast-button collapse";
                    expandButton.className = "vast-button expand";

                    player.vast.collapseButton = collapseButton;
                    player.vast.collapseButton.style.display = "block";
                    player.vast.collapseButton.innerHTML = "&times;";

                    player.vast.expandButton = expandButton;
                    player.vast.expandButton.innerHTML = "+";

                    player.el().appendChild(expandButton);

                    player.vast.blocker.appendChild(collapseButton);

                    player.on("timeupdate", player.vast.showingTime);

                    collapseButton.onclick = function (e) {
                        e.preventDefault();
                        player.off('timeupdate', player.vast.showingTime);
                        player.vastTracker.setCollapse(false);
                        player.vast.collapseExpandBanner(false);
                    };
                    expandButton.onclick = function (e) {
                        player.vastTracker.setCollapse(true);
                        player.vast.collapseExpandBanner(true);
                    };

                    player.vast.setupEvents();
                    player.vastTracker.load();
                    player.one('ended', player.vast.removeClicks);
                    player.one('ended', player.vast.tearDown);
                    player.trigger('vast-nonlinear-ready');
                },

                collapseExpandBanner: function (cond) {
                    player.vast.blocker && (player.vast.blocker.style.display = cond ? "block" : "none");
                    player.vast.expandButton && (player.vast.expandButton.style.display = cond ? "none" : "block");
                },
                showingTime: function () {
                    player.loadingSpinner.el().style.display = "none";
                    var timeLeft = Math.ceil(player.vastTracker.creative.minSuggestedDuration - player.currentTime());
                    if (timeLeft == -1) {
                        player.off('timeupdate', player.vast.showingTime);
                        return;
                    }
                    if (timeLeft <= 0) {
                        player.vast.collapseExpandBanner(false);
                    }
                },

                tearDown: function () {
                    // remove preroll buttons
                    player.vast.skipButton && player.vast.skipButton.parentNode.removeChild(player.vast.skipButton);
                    player.vast.collapseButton && player.vast.collapseButton.parentNode.removeChild(player.vast.collapseButton);
                    player.vast.expandButton && player.vast.expandButton.parentNode.removeChild(player.vast.expandButton);
                    player.vast.blocker && player.vast.blocker.parentNode.removeChild(player.vast.blocker);

                    // remove vast-specific events
                    player.off('timeupdate', player.vast.timeupdate);
                    player.off('ended', player.vast.tearDown);

                    // end ad mode
                    if (player.vastTracker.linear) {
                        player.ads.endLinearAdMode();
                    } else if (player.vastTracker.nonlinear) {
                        player.ads.endNonLinearAdMode();
                    }
                    player.vast.showControls = true;
                    // show player controls for video
                    if (player.vast.showControls) {
                        player.controls(true);
                    }

                    player.trigger('vast-preroll-removed');
                },

                timeupdate: function () {
                    player.loadingSpinner.el().style.display = "none";
                    var timeLeft = Math.ceil(settings.skip - player.currentTime());
                    if (timeLeft > 0) {
                        if (player.vastTracker.linear) {
                            player.vast.skipButton.innerHTML = "Skip in " + timeLeft + "...";
                        }
                    } else {
                        if (player.vastTracker.linear) {
                            if ((' ' + player.vast.skipButton.className + ' ').indexOf(' enabled ') === -1) {
                                player.vast.skipButton.className += " enabled";
                                player.vast.skipButton.innerHTML = "Skip";
                            }
                        }
                    }
                },

                removeFlashContainer: function () {
                    if (!player.ads.isAdLoaded && player.ads.background) {
                        return;
                    }

                    player.ads.isAdLoaded = false;
                    var playerEl = player.el();
                    var objectEl = playerEl.getElementsByTagName('object')[0];

                    if (objectEl) {
                        playerEl.removeChild(objectEl.parentNode);
                    }
                }
            };
        },

        vastPlugin = function (options) {
            var VpaidOpts;
            var vpaidObj;
            var player = this;
            var settings = extend({}, defaults, options || {});
            var vpaidListeners = {}, vpaidIFrame = null, vpaidPlayer = null, vpaidTrackInterval = -1, vpaidSeeker;

            // To prevent ad playing while video quality switches
            player.ads.isAdError = false;
            player.ads.onFirstVideoPlay = true;
            player.ads.isAdLoaded = false;
            player.ads.isAdPlayed = false;
            player.ads.async = settings.async;
            player.ads.background = settings.background;
            player.ads.vastDefer = Promise.defer();
            player.ads.vpaidDefer = Promise.defer();

            VpaidOpts = {
                vpaidObj: vpaidObj,
                vpaidListeners: vpaidListeners,
                vpaidIFrame: vpaidIFrame,
                vpaidPlayer: vpaidPlayer,
                vpaidTrackInterval: vpaidTrackInterval,
                vpaidSeeker: vpaidSeeker
            };
            // check that we have the ads plugin
            if (player.ads === undefined) {
                console.error('vast video plugin requires videojs-contrib-ads, vast plugin not initialized');
                return null;
            }
            // set up vast plugin, then set up events here
            player.vast = new Vast(player, settings, VpaidOpts);
            this.companionPlaceholders = settings.companionPlaceholders;

            player.on('vast-ready', function () {
                if (player.vastTracker.nonlinear) {
                    player.trigger('nonlinearadsready');
                } else {
                    player.trigger('adsready');
                }
            });

            player.on('vast-preroll-ready', function () {
                // start playing preroll, note: this should happen this way no matter what, even if autoplay
                //  has been disabled since the preroll function shouldn't run until the user/autoplay has
                //  caused the main video to trigger this preroll function
                player.play();
            });
            player.on('vast-nonlinear-ready', function () {
                player.play();
            });

            player.on('vast-preroll-removed', function () {
                // preroll done or removed, start playing the actual video
                player.play();
            });

            player.on('contentupdate', function () {
                player.ads.isAdLoaded = false;

                if (window.isAdBlocker) {
                    player.error('To view the video please disable AdBlock and reload the page');
                    player.pause();
                    console.error(new Error('Ads are blocked'));
                    return;
                }

                if (player.ads.isAdPlayed) {
                    return;
                }

                // videojs-ads triggers this when src changes
                player.vast.getContent(settings.url)
                .then(function () {
                    if (settings.async) {
                        player.vast.embedSWF();
                    } else {
                        // Fix for video.js 6596 line where they are triggering additional timeupdate
                        if (player.ads.onFirstVideoPlay && !settings.autoplay) {
                            player.one('play', function () {
                                player.vast.embedSWF();
                                player.ads.onFirstVideoPlay = false;
                            });
                        }
                        else {
                            player.one('timeupdate', function () {
                                player.vast.embedSWF();
                            });
                        }
                    }
                })
                .catch(function (err) {});

                Promise.all([player.ads.vastDefer.promise, player.ads.vpaidDefer.promise])
                .then(function () {
                    player.trigger('vast-ready');
                })
                .catch(function (err) {
                    console.error(err);
                    player.ads.isAdError = true;
                    player.trigger('adscanceled');
                });
            });
            player.on('player:video:change', function () {
                player.ads.isAdPlayed = false;
                player.ads.isAdError = false;
                player.ads.vastDefer = Promise.defer();
                player.ads.vpaidDefer = Promise.defer();
                player.vast.removeFlashContainer();
            });
            player.on('readyforpreroll', function () {
                // if we don't have a vast url, just bail out
                if (!settings.url) {
                    player.trigger('adscanceled');
                    return null;
                }
                if (player.vast.sources[0].apiFramework && player.vast.sources[0].apiFramework == 'VPAID') {
                    player.vast.prerollVPAID();
                } else {
                    // set up and start playing preroll
                    player.ads.isAdLoaded = true;
                    player.vast.preroll();
                }
                player.ads.isAdPlayed = true;

            });
            player.on('showoverlay', function () {
                player.vast.showStaticResource();
            });

            // return player to allow this plugin to be chained
            return player;
        };

    vjs.plugin('vast', vastPlugin);

}(window, videojs, DMVAST));