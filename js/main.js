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
    xml = prepareXML();

    this.VpaidSource = xml.getElementsByTagName('MediaFile')[0].childNodes[0].nodeValue;
    this.configUrl = xml.getElementsByTagName('AdParameters')[0].childNodes[0].nodeValue;

    function prepareXML() {
        try {
            var _DOMParser = new DOMParser();
        } catch (err) {
        }

        if (_DOMParser) {
            return _DOMParser.parseFromString(xml, 'text/xml')
        }

        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.loadXML(xml);

        if (xmlDoc.parseError.errorCode != 0) {
            var myErr = xmlDoc.parseError;
            console.error("You have error " + myErr.reason);
            return;
        }

        return xmlDoc;
    }
};

Outstream.prototype.loadConfig = function () {
    var configUrl = this.getConfigUrl();
    return new Promise(function (resolve) {
        try {
            var xdr = new XDomainRequest()
        } catch (err) {
        }

        if (XMLHttpRequest && !xdr) {
            var xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
                if (xhttp.readyState == 4 && xhttp.status == 200) {
                    resolve(xhttp.responseText);
                }
            };

            xhttp.open("GET", configUrl, true);
            xhttp.send();
        } else {
            // Use Microsoft XDR
            xdr.onload = function () {
                resolve(xdr.responseText);
            };

            xdr.open("get", configUrl, true);
            setTimeout(function () {
                xdr.send();
            }, 0);
        }
    });
};

Outstream.prototype.options = function (options) {
    if (this._options || !options) {
        return this._options;
    }

    if (typeof options != "object") {
        console.error('Please set correct options');

        return;
    }

    function getVPAIDMode() {
        return Array.isArray(options.VPAIDMode) && !!options.VPAIDMode.length ? options.VPAIDMode : ['flash', 'js'];
    }

    function contentPageUrl() {
        var parentWindowLocationHref;

        try {
            parentWindowLocationHref = window.parent.location.href;
        } catch (err) {
            parentWindowLocationHref = "";
        }

        return encodeURIComponent(window.location.href != parentWindowLocationHref ? document.referrer : window.location.href);
    }

    options.contentPageUrl = contentPageUrl();
    options.VPAIDMode = getVPAIDMode();

    return this._options = options;
};

Outstream.prototype.init = function () {
    this.createVPAID();

    this.loadConfig().then(function (xml) {
            this.parseAndSaveConfig(xml);
            this.initVPAID();
        }.bind(this))
        .caught(function (err) {
            console.error(err);
            this.initVPAID();
        }.bind(this));
};

Outstream.prototype.initVPAID = function () {
    try {
        this.VPAIDClient.init(
            this.VpaidSource,
            this.configUrl,
            this.getConfigUrl()
        );

    } catch (err) {
        // try to use another mode
        var VPAIDMode = this.options().VPAIDMode,
            modeIndex = VPAIDMode.indexOf(this.mode);

        if (modeIndex != -1) {
            VPAIDMode.splice(modeIndex, 1);
            console.log("Switch VPAIdType , ERROR: " + err.message);

            this.init();
        }

        return;
    }

    this.initEventListener(this.VPAIDClient.eventManager);
};

Outstream.prototype.getConfigUrl = function () {
    var domain = this.options().isSSP ? "vast.vertamedia.com/" : "vast.videe.tv/",
        configUrl = "//" + domain +
            "?aid=" + this.options().aid +
            "&content_page_url=" + this.options().contentPageUrl +
            "&player_width=" + this.options().width +
            "&player_height=" + this.options().height +
            "&sid=" + this.options().sid +
            "&cd=" + new Date().getTime();

    if (this.mode == "js") {
        configUrl += "&vpaid_type=2";
    }

    return configUrl;
};

Outstream.prototype.createVPAID = function () {
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

    modeType = modeType in VPAIDFactory ? modeType : 'flash';

    try {
        this.VPAIDClient = new VPAIDFactory[modeType](this.options());
    } catch (err) {
        console.error(modeType + " init ERROR: " + err);
        return false;
    }

    return !!this.VPAIDClient;
};

Outstream.prototype.initEventListener = function (eventManager) {
    var context = this,
        proxyEvents = this.VPAIDClient.proxyEvents;

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
    this.events[eventName + ''] = this.events[eventName + ''] || [];
    this.events[eventName + ''].push(callback);

    return this;
};

Outstream.prototype.off = function (eventName) {
    delete this.events[eventName + ''];

    return this;
};

Outstream.prototype.trigger = function (eventName, data) {
    var length;

    if (!this.events[eventName] || !this.events[eventName].length) {
        return;
    }

    length = this.events[eventName].length;

    if (length == 1) {
        this.events[eventName][0].call(null, data);

        return;
    }

    if (length > 1) {
        for (var i = 0; i < length; i++) {
            this.events[eventName][i].call(null, data);
        }
    }
};

Outstream.prototype.destroy = function () {
    this.options.containerEl.innerHTML = ''
};

Outstream.prototype.callMethod = function (methodName, data) {
    methodName = this.mode == 'flash' ? 'videe_' + methodName : methodName;

    if (this.isVPAIDReady()) {
        return this.VPAIDClient.VPAID[methodName](data);
    }

    this.on('started', function () {
        this.VPAIDClient.VPAID[methodName](data);
    }.bind(this));
};

// Public VPAID methods
Outstream.prototype.startAd = function () {
    this.callMethod('startAd');

    return this;
};

Outstream.prototype.stopAd = function () {
    this.callMethod('stopAd');

    return this;
};

Outstream.prototype.skipAd = function () {
    this.callMethod('skipAd');

    return this;
};

Outstream.prototype.mute = function () {
    if (this.isVPAIDReady()) {
        clb.call(this);

        return;
    }

    this.on('started', function () {
        clb.call(this)
    }.bind(this));

    function clb() {
        var methodName = this.mode == 'flash' ? 'videe_getAdVolume' : 'getAdVolume';

        this.savedVolume = this.VPAIDClient.VPAID[methodName]();

        methodName = this.mode == 'flash' ? 'videe_setAdVolume' : 'setAdVolume';
        this.VPAIDClient.VPAID[methodName](0);
    }

    return this;
};

Outstream.prototype.unmute = function () {
    this.callMethod('setAdVolume', this.savedVolume || 1);

    return this;
};

Outstream.prototype.setAdVolume = function (val) {
    if (typeof val != 'number' || val != val) {
        return
    }

    this.callMethod('setAdVolume', val);

    return this;
};

Outstream.prototype.getAdVolume = function () {
    return this.callMethod('getAdVolume');
};

Outstream.prototype.pauseAd = function () {
    this.callMethod('pauseAd');

    return this;
};

Outstream.prototype.resumeAd = function () {
    this.callMethod('resumeAd');

    return this;
};

Outstream.prototype.isVPAIDReady = function () {
    return this.VPAIDClient && this.VPAIDClient.methodsState && this.VPAIDClient.VPAID;
};

Outstream.prototype.resizeAd = function () {
    var args = Array.prototype.slice.call(arguments),
        methodName = this.mode == 'flash' ? 'videe_resizeAd' : 'resizeAd';
    if (this.isVPAIDReady()) {
        this.VPAIDClient.VPAID[methodName].apply(null, args);

        return this;
    }

    this.on('started', function () {
        this.VPAIDClient.VPAID[methodName].apply(null, args);
    }.bind(this));

    return this;
};

// init
var root = root || window;
root.Outstream = Outstream;
