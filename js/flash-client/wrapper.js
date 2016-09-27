/**
 * @param aid {number}
 * @param width {number}
 * @param height {number}
 * @param sid {number}
 * @param configUrl {string}
 * @constructor
 */
function Wrapper(aid, width, height, sid, configUrl) {
    if (!aid) {
        throw new Error('Set aid')
    }

    this.host = encodeURIComponent(window.location.href != window.parent.location.href ? document.referrer : window.location.href);
    this.cd = new Date().getTime();
    this.height = height || 300;
    this.width = width || 400;
    this.sid = sid || 0;
    this.aid = aid;
    this.configUrl = configUrl;
}

Wrapper.prototype.wrap = function (adId) {
    var config = this.getConfig(adId),
        eventManager = new EventManager(),
        width = this.width,
        height = this.height;

    if (!window.VpaidflashWrappers) {
        window.VpaidflashWrappers = {}
    }

    window.VpaidflashWrappers[adId] = {};

    window.VpaidflashWrappers[adId] = {
        adLoadedClosure: function () {
            eventManager.trigger('loaded');
            window["SdkIntegration" + adId].startAd();
        },
        adErrorClosure: function () {
            eventManager.trigger('error');
        },
        adCompleteClosure: function () {
            eventManager.trigger('complete');
        },
        pausedClosure: function () {
            eventManager.trigger('paused');
        },
        resumedClosure: function () {
            eventManager.trigger('resumed');
        },
        muteClosure: function () {
            eventManager.trigger('mute');
        },
        unmuteClosure: function () {
            eventManager.trigger('unmute');
        },
        adStartedClosure: function () {
            eventManager.trigger('started');
        },
        startFlashWrapper: function () {
            eventManager.trigger('ready');
            var SdkIntegration = window["SdkIntegration" + adId];
            SdkIntegration.width = width;
            SdkIntegration.height = height;
            SdkIntegration.loadAd(config);
        }
    };

    return eventManager;
};

Wrapper.prototype.getConfig = function (adId) {
    var tpl = "window.VpaidflashWrappers[" + adId + "]";
    return JSON.stringify({
        adCompleteClosure: tpl + ".adCompleteClosure",
        adStartedClosure: tpl + ".adStartedClosure",
        adLoadedClosure: tpl + ".adLoadedClosure",
        adErrorClosure: tpl + ".adErrorClosure",
        resumedClosure: tpl + ".resumedClosure",
        pausedClosure: tpl + ".pausedClosure",
        unmuteClosure: tpl + ".unmuteClosure",
        muteClosure: tpl + ".muteClosure",
        volume: 1,
        width: this.width,
        height: this.height,
        vastUrl: this.getVastUrl()
    })
};

Wrapper.prototype.getVastUrl = function () {
    return this.configUrl || '//vast.videe.tv/vast-proxy/?aid=' + this.aid +
        '&content_page_url=' + this.host +
        '&player_height=' + this.height +
        '&player_width=' + this.width +
        '&sid=' + this.sid +
        '&cb=' + this.cd
};
