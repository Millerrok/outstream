function JsClient(options) {
    this.options = options;
    this.eventManager = new EventManager();
    this.proxyEvents = ['loaded', 'error', 'complete', 'started', 'paused'];
}

JsClient.prototype.embed = function () {
    return [
        new Promise(function (resolve, reject) {
            this.iframe().addEventListener('load',function () {
                this.iFwindow = this.iframe().contentWindow;
                this.iFwindow.document.body.appendChild(this.videoTag());
                this.iFwindow.document.body.appendChild(this.script());
                this.iFwindow.document.body.style.margin = 0;

                resolve();

            }.bind(this));
        }.bind(this)),

        new Promise(function (resolve, reject) {
            this.script().addEventListener('load', function () {
                resolve();
            }, false)
        }.bind(this))
    ]
};

JsClient.prototype.init = function (VpaidSource, configUrl) {
    this.VpaidSource = VpaidSource;
    this.configUrl = configUrl;

    Promise.all(this.embed())
        .then(function () {
            this.VPAID = this.iFwindow.getVPAIDAd();
            this.initVPAID();
        }.bind(this))
        .catch(function (err) {
            console.error(err);
        });

    this.options.containerEl.appendChild(this.iframe());
};

JsClient.prototype.initVPAID = function () {
    var eventManager = this.eventManager;

    this.VPAID.subscribe(function () {
        this.VPAID.startAd();

        eventManager.trigger('loaded');
    }.bind(this), 'AdLoaded');

    this.VPAID.subscribe(function () {
        eventManager.trigger('started');
    }, 'AdStarted');

    this.VPAID.subscribe(function () {
        eventManager.trigger('paused');
    }, 'AdPaused');

    this.VPAID.subscribe(function (err) {
        eventManager.trigger('error', err);
    }, 'AdError');

    this.VPAID.subscribe(function () {
        eventManager.trigger('complete');
    }, 'AdVideoComplete');

    this.VPAID.handshakeVersion(2);
    this.VPAID.initAd(
        this.options.width,
        this.options.height,
        'normal',
        0,
        this.configUrl,
        {
            videoSlotCanAutoPlay: true,
            videoSlot: this.videoTag()
        }
    )
};

JsClient.prototype.videoTag = function () {
    if (this._videoTag) {
        return this._videoTag;
    }

    this._videoTag = document.createElement('video');
    this._videoTag.width = this.options.width;
    this._videoTag.height = this.options.height;

    return this._videoTag;
};

JsClient.prototype.script = function () {
    if (this._scriptTag) {
        return this._scriptTag;
    }

    this._scriptTag = document.createElement('script');
    this._scriptTag.setAttribute("type", "text/javascript");
    this._scriptTag.setAttribute("src", this.VpaidSource);
    this._scriptTag.setAttribute("async", "");

    return this._scriptTag;
};

JsClient.prototype.iframe = function () {
    if (this._iFrame) {
        return this._iFrame;
    }

    this._iFrame = document.createElement('iFrame');
    this._iFrame.src = "about:blank";
    this._iFrame.width = this.options.width;
    this._iFrame.height = this.options.height;

    return this._iFrame;
};

