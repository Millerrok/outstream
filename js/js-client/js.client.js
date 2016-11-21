function JsClient(options) {
    this.options = options;
    this.eventManager = new EventManager();
    this.methodsState = false;
    this.proxyEvents = ['loaded', 'error', 'complete', 'impression', 'started', 'paused', 'resize'];
}

JsClient.prototype.embed = function () {
    return [
        new Promise(function (resolve, reject) {
            this.iframe().addEventListener('load', function () {
                this.iFwindow = this.iframe().contentWindow;
                this.videoAdLayer().appendChild(this.videoTag());
                this.iFwindow.document.body.appendChild(this.videoAdLayer());
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
    if (!VpaidSource || !configUrl) {
        throw new Error('Set correct options');
    }

    if (!this.videoTag().canPlayType) {
        throw new Error('HTML5 video not support');
    }

    this.VpaidSource = VpaidSource;
    this.configUrl = configUrl;

    Promise.all(this.embed())
        .then(function () {
            this.VPAID = this.iFwindow.getVPAIDAd();
            this.initVPAID();
        }.bind(this))
        .caught(function (err) {
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
        this.methodsState = true;
        eventManager.trigger('started');
    }.bind(this), 'AdStarted');

    this.VPAID.subscribe(function () {
        eventManager.trigger('paused');
    }, 'AdPaused');

    this.VPAID.subscribe(function (err) {
        eventManager.trigger('error', err);
    }, 'AdError');

    this.VPAID.subscribe(function () {
        eventManager.trigger('playing');
    }, 'AdPlaying');

    this.VPAID.subscribe(function () {
        eventManager.trigger('impression');
    }, 'AdImpression');

    this.VPAID.subscribe(function () {
        eventManager.trigger('stopped');
        this.destroy();
    }.bind(this), 'AdStopped');

    this.VPAID.subscribe(function () {
        eventManager.trigger('resize');
    }, 'AdSizeChange');

    this.VPAID.subscribe(function () {
        eventManager.trigger('complete');
        this.VPAID.stopAd();
    }.bind(this), 'AdVideoComplete');

    this.VPAID.handshakeVersion(2);

    this.VPAID.initAd(
        this.options.width,
        this.options.height,
        'normal',
        0,
        this.configUrl,
        {
            videoSlotCanAutoPlay: true,
            videoSlot: this.videoTag(),
            slot: this.videoAdLayer()
        }
    );
};

JsClient.prototype.videoTag = function () {
    if (this._videoTag) {
        return this._videoTag;
    }

    this._videoTag = document.createElement('video');
    this._videoTag.setAttribute("width", "100%");
    this._videoTag.setAttribute("height", "100%");
    this._videoTag.style.position = 'absolute';

    return this._videoTag;
};

JsClient.prototype.videoAdLayer = function () {
    if (this._videoAdLayer) {
        return this._videoAdLayer;
    }

    this._videoAdLayer = document.createElement('div');
    this._videoAdLayer.setAttribute("width", this.options.width);
    this._videoAdLayer.setAttribute("height", this.options.height);

    return this._videoAdLayer;
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
    this._iFrame.setAttribute("allowfullscreen", "true");
    this._iFrame.src = "about:blank";
    this._iFrame.width = this.options.width;
    this._iFrame.height = this.options.height;
    this._iFrame.style.border = 'none';

    return this._iFrame;
};

JsClient.prototype.destroy = function () {
    delete this.VPAID;

    this._iFrame.parentNode.removeChild(this._iFrame);

    delete this._videoAdLayer;
    delete this._scriptTag;
    delete this._videoTag;
    delete this._iFrame;
};
