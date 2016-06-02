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
    if (!options) {
        console.error('Create without options');

        return;
    }

    this.options(options || {});
    this.events = {};
    this.init();
}

/**
 * Pr save MediaFile and AdParameters
 * @param xml {string}
 */
Outstream.prototype.parseAndSaveConfig = function (xml) {
    this.VpaidSource = xml.getElementsByTagName('MediaFile')[0].childNodes[0].nodeValue;
    this.configUrl = xml.getElementsByTagName('AdParameters')[0].childNodes[0].nodeValue;
};

Outstream.prototype.loadConfig = function () {
    return new Promise(function (resolve, reject) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            if (xhttp.readyState == 4 && xhttp.status == 200) {

                resolve(new DOMParser().parseFromString(xhttp.responseText, 'text/xml'));
            }
        };

        xhttp.open("GET", this.getConfigUrl(), true);
        xhttp.send();
    }.bind(this));
};

Outstream.prototype.options = function (options) {
    if (this._options || !options) {
        return this._options;
    }

    if (!(typeof options == "object" && Object.keys(options).length > 0)) {
        console.error('Please set correct options');

        return;
    }

    function getVPAIDMode() {
        return Array.isArray(options.VPAIDMode) && !!options.VPAIDMode.length ? options.VPAIDMode : ['flash', 'js'];
    }

    options.VPAIDMode = getVPAIDMode();

    return this._options = options;
};

Outstream.prototype.init = function () {
    this.initVPAID();

    this.loadConfig().then(function (xml) {
            this.parseAndSaveConfig(xml);
            this.VPAID.init(
                this.VpaidSource,
                this.configUrl,
                this.getConfigUrl()
            );

            this.initEventListener(this.VPAID.eventManager);
        }.bind(this))
        .catch(function (err) {
            console.error(err);
        });
};

Outstream.prototype.getConfigUrl = function () {
    var domain,
        configUrl;

    if (this._configUrl) {
        return this._configUrl;
    }

    domain = this.options().isSSP ? "vast.vertamedia.com/" : "vast.videe.tv/";
    configUrl = "//" + domain +
        "?aid=" + this.options().aid +
        "&content_page_url=" + encodeURIComponent(window.location.href)+
        "&player_width=" + this.options().width +
        "&player_height=" + this.options().height +
        "&cd=" + new Date().getTime();

    if (this.mode == "js") {
        configUrl += "&vpaid_type=2";
    }

    return this._configUrl = configUrl;
};

Outstream.prototype.initVPAID = function () {
    var VPAIDMode = this.options().VPAIDMode;
    for (var index in VPAIDMode) {
        if (this.useMode(VPAIDMode[index])) {
            this.mode = VPAIDMode[index];
            return;
        }
    }
};

Outstream.prototype.useMode = function (modeType) {
    var VPAIDFactory = {
        flash: function (options) {
            return new FlashClient(options);
        },
        js: function (options) {
            return new JsClient(options);
        }
    };

    modeType = Object.keys(VPAIDFactory).indexOf(modeType) != -1 ? modeType : 'flash';

    try {
        this.VPAID = new VPAIDFactory[modeType](this.options());
    } catch (err) {
        console.error(modeType + " init ERROR: " + err);
        return false;
    }

    return !!this.VPAID;
};

Outstream.prototype.initEventListener = function (eventManager) {
    var context = this,
        proxyEvents = this.VPAID.proxyEvents;


    for (var i in proxyEvents) {
        initEvent(proxyEvents[i]);
    }

    function initEvent(proxyEvent) {
        eventManager.on(proxyEvent, function (data) {
            context.trigger(proxyEvent, data);
        });
    }
};

Outstream.prototype.on = function (eventName, callback) {
    this.events[eventName + ''] = callback;
    return this;
};

Outstream.prototype.off = function (eventName) {
    delete this.events[eventName + ''];

    return this;
};

Outstream.prototype.trigger = function (eventName, data) {
    var callback = this.events[eventName];

    if (!callback) {
        return;
    }

    callback.call(this, data);
};

Outstream.prototype.destroy = function () {
    this.options.containerEl.innerHTML = ''
};

var root = root || window;
root.Outstream = Outstream;
