/**
 * @param aid {number}
 * @param width {number}
 * @param height {number}
 * @param sid {number}
 * @constructor
 */
function Wrapper(aid, width, height, sid) {
    if(!aid){
        throw new Error('Set aid')
    }

    this.host = encodeURIComponent(window.location.host);
    this.cd = new Date().getTime();
    this.height = height || 300;
    this.width = width || 400;
    this.sid = sid || 0;
    this.aid = aid;
}

Wrapper.prototype.wrap = function (adId) {
    var config = this.getConfig(adId),
        width = this.width,
        height = this.height;

    if (!window.VpaidflashWrappers) {
        window.VpaidflashWrappers = {}
    }

    window.VpaidflashWrappers[adId] = {};

    var wrapper = window.VpaidflashWrappers[adId];

    wrapper.adLoadedClosure = function () {
        window["SdkIntegration" + adId].startAd();
    };

    wrapper.startFlashWrapper = function () {
        var SdkIntegration = window["SdkIntegration" + adId];
        SdkIntegration.width = width;
        SdkIntegration.height = height;
        SdkIntegration.loadAd(config);
    };
};

Wrapper.prototype.getConfig = function (adId) {
    var tpl = "window.VpaidflashWrappers[" + adId + "]";

    return JSON.stringify({
        adLoadedClosure: tpl + ".adLoadedClosure",
        volume: 1,
        width: this.width,
        height: this.height,
        vastUrl: this.getVastUrl()
    })
};

Wrapper.prototype.getVastUrl = function () {
    return 'http://vast.videe.tv/vast-proxy/?aid=' + this.aid +
        '&content_page_url=' + this.host +
        '&player_height=' + this.height +
        '&player_width=' + this.width +
        '&sid=' + this.sid +
        '&cb=' + this.cd
};
