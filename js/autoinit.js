var onload = function () {
    var parser = {
        number: function (el, key) {
            var value = this.parse(el, key);

            return parseInt(value);
        },
        array: function (el, key) {
            var value = this.parse(el, key);
            if (!value) {
                return value;
            }

            return value.split(' ');
        },
        bool: function (el, key) {
            var value = this.parse(el, key);

            try {
                value = JSON.parse(value)
            } catch (err) {
                value = false
            }

            return !!value;
        },
        parse: function (el, key) {
            var value;

            try {
                value = el.getAttribute('data-outstream-' + key);
            } catch (e) {
                return undefined;
            }

            return value;
        }
    };

    (function () {
        var scriptTags = document.getElementsByTagName('script');

        for (var item in scriptTags) {
            var aid = parser.number(scriptTags[item], 'aid');

            if (!!aid && !isNaN(aid)) {
                initOutstream({
                    width: parser.number(scriptTags[item], 'width'),
                    height: parser.number(scriptTags[item], 'height'),
                    isSSP: parser.bool(scriptTags[item], 'SSP'),
                    VPAIDMode: parser.array(scriptTags[item], 'mode'),
                    aid: aid,
                    containerEl: createEl(scriptTags[item])
                });
            }
        }
    })();


    function initOutstream(options) {
        new Outstream({
            aid: options.aid,
            isSSP: options.isSSP,
            VPAIDMode: options.VPAIDMode,
            width: isNaN(options.width) ? 400 : options.width,
            height: isNaN(options.height) ? 300 : options.height,
            containerEl: options.containerEl
        })
    }

    function isNaN(val) {
        return val != val;
    }

    function createEl(el) {
        var adContainer = document.createElement("div"),
            parentEl = el.parentNode;

        if (parentEl.tagName.toUpperCase() == "HEAD") {
            document.body.appendChild(adContainer);

            return adContainer;
        }

        parentEl.insertBefore(adContainer, el);

        return adContainer;
    }
};

if (window !== top) {
    onload();
} else {
    window.onload = onload;
}
