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
            var DOMParser = DOMParser || '';
        } catch (err) {
        }

        if (DOMParser) {
            return new DOMParser().parseFromString(xhttp.responseText, 'text/xml')
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
    return new Promise(function (resolve, reject) {
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
        this.VPAID.init(
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

    this.initEventListener(this.VPAID.eventManager);
};

Outstream.prototype.getConfigUrl = function () {
    var domain = this.options().isSSP ? "vast.vertamedia.com/" : "vast.videe.tv/",
        configUrl = "//" + domain +
            "?aid=" + this.options().aid +
            "&content_page_url=" + encodeURIComponent(window.location.href) +
            "&player_width=" + this.options().width +
            "&player_height=" + this.options().height +
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
