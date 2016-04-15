window.onload = function () {
    (function () {
        var scriptTags = document.getElementsByTagName('script');

        for (var item in scriptTags) {
            var aid = parseAttr(scriptTags[item], 'aid');

            if (!!aid && !isNaN(aid)) {
                initOutstream({
                    width: parseAttr(scriptTags[item], 'width'),
                    height: parseAttr(scriptTags[item], 'height'),
                    aid: aid,
                    containerEl: createEl(scriptTags[item])
                });
            }
        }
    })();

    function parseAttr(el, key) {
        var value;

        try {
            value = parseInt(el.getAttribute('data-outstream-' + key));
        } catch (e) {
            return undefined;
        }

        return value;
    }

    function initOutstream(options) {
        new Outstream({
            aid: options.aid,
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
