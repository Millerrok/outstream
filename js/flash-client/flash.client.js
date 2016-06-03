function FlashClient(options) {
    if (!getFlashVersion()) {
        throw new Error('Flash Player not installed!');
    }

    this.eventManager;
    this.sdkUnique = null;
    this.id = Math.round(( new Date() ).getTime() / 10000 + Math.random() * 10000000);
    this.unitSrc = 'http://player.videe.tv/v2.1/resources/libs/videejs-player.swf';
    this.flashVersion = "10.0.0";
    this.params = {
        allowScriptAccess: "always",
        allowFullScreen: "true",
        wmode: 'transparent'
    };

    this.proxyEvents = ['loaded', 'error', 'complete', 'started', 'resumed', 'paused', 'mute', 'unmute'];

    this.options = options;
}

FlashClient.prototype.init = function (VpaidSource, configUrl, vastUrl) {
    if(VpaidSource && !this.checkUnitSource(VpaidSource)){
        throw new Error('unit not SWF');
    }

    this.addWrapperEl();
    this.initWrapper(vastUrl);
    this.embedSWF();
};

FlashClient.prototype.checkUnitSource = function (VpaidSource){
    return VpaidSource.indexOf('.swf') != -1;
};

FlashClient.prototype.embedSWF = function () {
    try {
        swfobject.embedSWF(
            this.unitSrc,
            this.sdkUnique,
            this.options.width,
            this.options.height,
            this.flashVersion,
            undefined,
            this.flashvars(),
            this.params,
            {}
        );
    } catch (err) {
        console.error(err)
    }
};

FlashClient.prototype.initWrapper = function (vastUrl) {
    try {
        this.eventManager = new Wrapper(
            this.options.aid,
            this.options.width,
            this.options.height,
            this.options.sid,
            vastUrl
        ).wrap(this.id);
    } catch (err) {
        console.error(err)
    }
};

FlashClient.prototype.addWrapperEl = function () {
    var blocker = document.createElement('div');

    this.sdkUnique = 'SdkIntegration' + this.id;
    blocker.className = 'flash-blocker';
    blocker.innerHTML = '<div id="' + this.sdkUnique + '"></div>';
    this.options.containerEl.appendChild(blocker);
};

FlashClient.prototype.flashvars = function () {
    return {
        onReady: "window.VpaidflashWrappers[" + this.id + "].startFlashWrapper"
    }
};