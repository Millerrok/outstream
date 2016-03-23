/**
 * @param options.aid {number}
 * @param options.width {number}
 * @param options.height {number}
 * @param options.containerEl {object}
 *
 * @param options {object}
 * @constructor
 */
function Outstream(options) {
    if (!getFlashVersion()) {
        console.error('Flash Player not installed!');

        return;
    }

    if (!options) {
        console.error('Create without options');

        return;
    }

    this.options = options || {};

    this.sdkUnique = null;
    this.id = Math.round(( new Date() ).getTime() / 10000 + Math.random() * 10000000);
    this.unitSrc = 'http://player.videe.tv/v2.1/resources/libs/videejs-player.swf';
    this.flashVersion = "10.0.0";
    this.params = {
        allowScriptAccess: "always",
        allowFullScreen: "true",
        wmode: 'transparent'
    };

    this.addWrapperEl();
    this.initWrapper();
    this.embedSWF();
}

Outstream.prototype.flashvars = function () {
    return {
        onReady: "window.VpaidflashWrappers[" + this.id + "].startFlashWrapper"
    }
};

Outstream.prototype.initWrapper = function () {
    try {
        new Wrapper(
            this.options.aid,
            this.options.width,
            this.options.height,
            this.options.sid
        ).wrap(this.id);
    } catch (err) {
        console.error(err)
    }
};

Outstream.prototype.addWrapperEl = function () {
    this.sdkUnique = 'SdkIntegration' + this.id;
    var blocker = document.createElement('div');
    blocker.className = 'flash-blocker';
    blocker.innerHTML = '<div id="' + this.sdkUnique + '"></div>';
    this.options.containerEl.appendChild(blocker);
};

Outstream.prototype.embedSWF = function () {
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
        console.log(err)
    }
};

Outstream.prototype.destroy = function(){
    this.options.containerEl.innerHTML = ''
};

var root = root ||window;
root.Outstream = Outstream;
