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

    this.events = {};
    this.addWrapperEl();
    this.initEventListener(this.initWrapper());
    this.embedSWF();
}

Outstream.prototype.flashvars = function () {
    return {
        onReady: "window.VpaidflashWrappers[" + this.id + "].startFlashWrapper"
    }
};

Outstream.prototype.initWrapper = function () {
    try {
        return new Wrapper(
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

Outstream.prototype.initEventListener = function (eventManager) {
    var context = this,
        proxyEvents = ['loaded','error','complete','started','resumed','paused','mute','unmute'];

    for(var i in proxyEvents){
        initEvent(proxyEvents[i]);
    }

    function initEvent(proxyEvent){
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

var root = root ||window;
if(!root.console){
    root.console = {
        log: function(a){
            alert(a);
        },
        error: function(a){
            alert(a);
        }
    };
}

if (!root.JSON) {
    root.JSON = {
        parse: function(sJSON) { return eval('(' + sJSON + ')'); },
        stringify: (function () {
            var toString = Object.prototype.toString;
            var isArray = Array.isArray || function (a) { return toString.call(a) === '[object Array]'; };
            var escMap = {'"': '\\"', '\\': '\\\\', '\b': '\\b', '\f': '\\f', '\n': '\\n', '\r': '\\r', '\t': '\\t'};
            var escFunc = function (m) { return escMap[m] || '\\u' + (m.charCodeAt(0) + 0x10000).toString(16).substr(1); };
            var escRE = /[\\"\u0000-\u001F\u2028\u2029]/g;
            return function stringify(value) {
                if (value == null) {
                    return 'null';
                } else if (typeof value === 'number') {
                    return isFinite(value) ? value.toString() : 'null';
                } else if (typeof value === 'boolean') {
                    return value.toString();
                } else if (typeof value === 'object') {
                    if (typeof value.toJSON === 'function') {
                        return stringify(value.toJSON());
                    } else if (isArray(value)) {
                        var res = '[';
                        for (var i = 0; i < value.length; i++)
                            res += (i ? ', ' : '') + stringify(value[i]);
                        return res + ']';
                    } else if (toString.call(value) === '[object Object]') {
                        var tmp = [];
                        for (var k in value) {
                            if (value.hasOwnProperty(k))
                                tmp.push(stringify(k) + ': ' + stringify(value[k]));
                        }
                        return '{' + tmp.join(', ') + '}';
                    }
                }
                return '"' + value.toString().replace(escRE, escFunc) + '"';
            };
        })()
    };
}

/**
 * @param aid {number}
 * @param width {number}
 * @param height {number}
 * @param sid {number}
 * @constructor
 */
function Wrapper(aid, width, height, sid) {
    if (!aid) {
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
        eventManager = new EventManager();
    width = this.width,
        height = this.height;

    if (!window.VpaidflashWrappers) {
        window.VpaidflashWrappers = {}
    }

    window.VpaidflashWrappers[adId] = {};

    window.VpaidflashWrappers[adId] = {
        adLoadedClosure: function () {
            eventManager.trigger('loaded');
            window["SdkIntegration" + adId].startAd();
        },
        adErrorClosure: function () {
            eventManager.trigger('error');
        },
        adCompleteClosure: function () {
            eventManager.trigger('complete');
        },
        pausedClosure: function () {
            eventManager.trigger('paused');
        },
        resumedClosure: function () {
            eventManager.trigger('resumed');
        },
        muteClosure: function () {
            eventManager.trigger('mute');
        },
        unmuteClosure: function () {
            eventManager.trigger('unmute');
        },
        adStartedClosure: function () {
            eventManager.trigger('started');
        },
        startFlashWrapper: function () {
            var SdkIntegration = window["SdkIntegration" + adId];
            SdkIntegration.width = width;
            SdkIntegration.height = height;
            SdkIntegration.loadAd(config);
        }
    };

    return eventManager;
};

Wrapper.prototype.getConfig = function (adId) {
    var tpl = "window.VpaidflashWrappers[" + adId + "]";

    return JSON.stringify({
        adCompleteClosure: tpl + ".adCompleteClosure",
        adStartedClosure: tpl + ".adStartedClosure",
        adLoadedClosure: tpl + ".adLoadedClosure",
        adErrorClosure: tpl + ".adErrorClosure",
        resumedClosure: tpl + ".resumedClosure",
        pausedClosure: tpl + ".pausedClosure",
        unmuteClosure: tpl + ".unmuteClosure",
        muteClosure: tpl + ".muteClosure",
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

function EventManager() {
    this.events = {};
}

EventManager.prototype.on = function (eventName, callback) {
    this.events[eventName + ''] = callback;
};

EventManager.prototype.trigger = function (eventName, data) {
    var callback = this.events[eventName];

    if (!callback) {
        return;
    }

    callback.call(null, data);
};
/* Flash detection from SWFObject: code.google.com/p/swfobject
 * Released under the MIT License 
 * @returns a version number or -1 if no player
 */
var getFlashVersion = function() {
	
		var SW = "Shockwave",
			FLASH = "Flash",
			SHOCKWAVE_FLASH = SW + " " + FLASH,
			SHOCKWAVE_FLASH_AX = SW+FLASH+"."+SW+FLASH,
			FLASH_MIME_TYPE = "application/x-shockwave-flash",
			nav = navigator,
			parse = parseFloat,
			plugins = nav.plugins,
			mimes = nav.mimeTypes,
			d, a;
		if (!!plugins && typeof plugins[SHOCKWAVE_FLASH] == "object") {
			d = plugins[SHOCKWAVE_FLASH].description;
			if (!!d && !(!!mimes && !!mimes[FLASH_MIME_TYPE] && !mimes[FLASH_MIME_TYPE].enabledPlugin)) {
				return parse( d.replace(/^.*\s+(\S+)\s+\S+$/, "$1") );
			}
		}
		else if ( !!window.ActiveXObject ) {
			try {
				a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
				if (a) {
					d = a.GetVariable("$version");
					if (!!d) {
						return parse(d.replace(/^\S+\s+(\d+),(\d+).*$/i,'$1.$2'));
					}
				}
			}
			catch(e) {}
		}
		return -1;
		
};
/*!    SWFObject v2.3.20130521 <http://github.com/swfobject/swfobject>
    is released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
*/
var swfobject=function(){var D="undefined",r="object",T="Shockwave Flash",Z="ShockwaveFlash.ShockwaveFlash",q="application/x-shockwave-flash",S="SWFObjectExprInst",x="onreadystatechange",Q=window,h=document,t=navigator,V=false,X=[],o=[],P=[],K=[],I,p,E,B,L=false,a=false,m,G,j=true,l=false,O=function(){var ad=typeof h.getElementById!=D&&typeof h.getElementsByTagName!=D&&typeof h.createElement!=D,ak=t.userAgent.toLowerCase(),ab=t.platform.toLowerCase(),ah=ab?/win/.test(ab):/win/.test(ak),af=ab?/mac/.test(ab):/mac/.test(ak),ai=/webkit/.test(ak)?parseFloat(ak.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):false,aa=t.appName==="Microsoft Internet Explorer",aj=[0,0,0],ae=null;if(typeof t.plugins!=D&&typeof t.plugins[T]==r){ae=t.plugins[T].description;if(ae&&(typeof t.mimeTypes!=D&&t.mimeTypes[q]&&t.mimeTypes[q].enabledPlugin)){V=true;aa=false;ae=ae.replace(/^.*\s+(\S+\s+\S+$)/,"$1");aj[0]=n(ae.replace(/^(.*)\..*$/,"$1"));aj[1]=n(ae.replace(/^.*\.(.*)\s.*$/,"$1"));aj[2]=/[a-zA-Z]/.test(ae)?n(ae.replace(/^.*[a-zA-Z]+(.*)$/,"$1")):0}}else{if(typeof Q.ActiveXObject!=D){try{var ag=new ActiveXObject(Z);if(ag){ae=ag.GetVariable("$version");if(ae){aa=true;ae=ae.split(" ")[1].split(",");aj=[n(ae[0]),n(ae[1]),n(ae[2])]}}}catch(ac){}}}return{w3:ad,pv:aj,wk:ai,ie:aa,win:ah,mac:af}}(),i=function(){if(!O.w3){return}if((typeof h.readyState!=D&&(h.readyState==="complete"||h.readyState==="interactive"))||(typeof h.readyState==D&&(h.getElementsByTagName("body")[0]||h.body))){f()}if(!L){if(typeof h.addEventListener!=D){h.addEventListener("DOMContentLoaded",f,false)}if(O.ie){h.attachEvent(x,function aa(){if(h.readyState=="complete"){h.detachEvent(x,aa);f()}});if(Q==top){(function ac(){if(L){return}try{h.documentElement.doScroll("left")}catch(ad){setTimeout(ac,0);return}f()}())}}if(O.wk){(function ab(){if(L){return}if(!/loaded|complete/.test(h.readyState)){setTimeout(ab,0);return}f()}())}}}();function f(){if(L||!document.getElementsByTagName("body")[0]){return}try{var ac,ad=C("span");ad.style.display="none";ac=h.getElementsByTagName("body")[0].appendChild(ad);ac.parentNode.removeChild(ac);ac=null;ad=null}catch(ae){return}L=true;var aa=X.length;for(var ab=0;ab<aa;ab++){X[ab]()}}function M(aa){if(L){aa()}else{X[X.length]=aa}}function s(ab){if(typeof Q.addEventListener!=D){Q.addEventListener("load",ab,false)}else{if(typeof h.addEventListener!=D){h.addEventListener("load",ab,false)}else{if(typeof Q.attachEvent!=D){g(Q,"onload",ab)}else{if(typeof Q.onload=="function"){var aa=Q.onload;Q.onload=function(){aa();ab()}}else{Q.onload=ab}}}}}function Y(){var aa=h.getElementsByTagName("body")[0];var ae=C(r);ae.setAttribute("style","visibility: hidden;");ae.setAttribute("type",q);var ad=aa.appendChild(ae);if(ad){var ac=0;(function ab(){if(typeof ad.GetVariable!=D){try{var ag=ad.GetVariable("$version");if(ag){ag=ag.split(" ")[1].split(",");O.pv=[n(ag[0]),n(ag[1]),n(ag[2])]}}catch(af){O.pv=[8,0,0]}}else{if(ac<10){ac++;setTimeout(ab,10);return}}aa.removeChild(ae);ad=null;H()}())}else{H()}}function H(){var aj=o.length;if(aj>0){for(var ai=0;ai<aj;ai++){var ab=o[ai].id;var ae=o[ai].callbackFn;var ad={success:false,id:ab};if(O.pv[0]>0){var ah=c(ab);if(ah){if(F(o[ai].swfVersion)&&!(O.wk&&O.wk<312)){w(ab,true);if(ae){ad.success=true;ad.ref=z(ab);ad.id=ab;ae(ad)}}else{if(o[ai].expressInstall&&A()){var al={};al.data=o[ai].expressInstall;al.width=ah.getAttribute("width")||"0";al.height=ah.getAttribute("height")||"0";if(ah.getAttribute("class")){al.styleclass=ah.getAttribute("class")}if(ah.getAttribute("align")){al.align=ah.getAttribute("align")}var ak={};var aa=ah.getElementsByTagName("param");var af=aa.length;for(var ag=0;ag<af;ag++){if(aa[ag].getAttribute("name").toLowerCase()!="movie"){ak[aa[ag].getAttribute("name")]=aa[ag].getAttribute("value")}}R(al,ak,ab,ae)}else{b(ah);if(ae){ae(ad)}}}}}else{w(ab,true);if(ae){var ac=z(ab);if(ac&&typeof ac.SetVariable!=D){ad.success=true;ad.ref=ac;ad.id=ac.id}ae(ad)}}}}}X[0]=function(){if(V){Y()}else{H()}};function z(ac){var aa=null,ab=c(ac);if(ab&&ab.nodeName.toUpperCase()==="OBJECT"){if(typeof ab.SetVariable!==D){aa=ab}else{aa=ab.getElementsByTagName(r)[0]||ab}}return aa}function A(){return !a&&F("6.0.65")&&(O.win||O.mac)&&!(O.wk&&O.wk<312)}function R(ad,ae,aa,ac){var ah=c(aa);aa=W(aa);a=true;E=ac||null;B={success:false,id:aa};if(ah){if(ah.nodeName.toUpperCase()=="OBJECT"){I=J(ah);p=null}else{I=ah;p=aa}ad.id=S;if(typeof ad.width==D||(!/%$/.test(ad.width)&&n(ad.width)<310)){ad.width="310"}if(typeof ad.height==D||(!/%$/.test(ad.height)&&n(ad.height)<137)){ad.height="137"}var ag=O.ie?"ActiveX":"PlugIn",af="MMredirectURL="+encodeURIComponent(Q.location.toString().replace(/&/g,"%26"))+"&MMplayerType="+ag+"&MMdoctitle="+encodeURIComponent(h.title.slice(0,47)+" - Flash Player Installation");if(typeof ae.flashvars!=D){ae.flashvars+="&"+af}else{ae.flashvars=af}if(O.ie&&ah.readyState!=4){var ab=C("div");
aa+="SWFObjectNew";ab.setAttribute("id",aa);ah.parentNode.insertBefore(ab,ah);ah.style.display="none";y(ah)}u(ad,ae,aa)}}function b(ab){if(O.ie&&ab.readyState!=4){ab.style.display="none";var aa=C("div");ab.parentNode.insertBefore(aa,ab);aa.parentNode.replaceChild(J(ab),aa);y(ab)}else{ab.parentNode.replaceChild(J(ab),ab)}}function J(af){var ae=C("div");if(O.win&&O.ie){ae.innerHTML=af.innerHTML}else{var ab=af.getElementsByTagName(r)[0];if(ab){var ag=ab.childNodes;if(ag){var aa=ag.length;for(var ad=0;ad<aa;ad++){if(!(ag[ad].nodeType==1&&ag[ad].nodeName=="PARAM")&&!(ag[ad].nodeType==8)){ae.appendChild(ag[ad].cloneNode(true))}}}}}return ae}function k(aa,ab){var ac=C("div");ac.innerHTML="<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='"+aa+"'>"+ab+"</object>";return ac.firstChild}function u(ai,ag,ab){var aa,ad=c(ab);ab=W(ab);if(O.wk&&O.wk<312){return aa}if(ad){var ac=(O.ie)?C("div"):C(r),af,ah,ae;if(typeof ai.id==D){ai.id=ab}for(ae in ag){if(ag.hasOwnProperty(ae)&&ae.toLowerCase()!=="movie"){e(ac,ae,ag[ae])}}if(O.ie){ac=k(ai.data,ac.innerHTML)}for(af in ai){if(ai.hasOwnProperty(af)){ah=af.toLowerCase();if(ah==="styleclass"){ac.setAttribute("class",ai[af])}else{if(ah!=="classid"&&ah!=="data"){ac.setAttribute(af,ai[af])}}}}if(O.ie){P[P.length]=ai.id}else{ac.setAttribute("type",q);ac.setAttribute("data",ai.data)}ad.parentNode.replaceChild(ac,ad);aa=ac}return aa}function e(ac,aa,ab){var ad=C("param");ad.setAttribute("name",aa);ad.setAttribute("value",ab);ac.appendChild(ad)}function y(ac){var ab=c(ac);if(ab&&ab.nodeName.toUpperCase()=="OBJECT"){if(O.ie){ab.style.display="none";(function aa(){if(ab.readyState==4){for(var ad in ab){if(typeof ab[ad]=="function"){ab[ad]=null}}ab.parentNode.removeChild(ab)}else{setTimeout(aa,10)}}())}else{ab.parentNode.removeChild(ab)}}}function U(aa){return(aa&&aa.nodeType&&aa.nodeType===1)}function W(aa){return(U(aa))?aa.id:aa}function c(ac){if(U(ac)){return ac}var aa=null;try{aa=h.getElementById(ac)}catch(ab){}return aa}function C(aa){return h.createElement(aa)}function n(aa){return parseInt(aa,10)}function g(ac,aa,ab){ac.attachEvent(aa,ab);K[K.length]=[ac,aa,ab]}function F(ac){ac+="";var ab=O.pv,aa=ac.split(".");aa[0]=n(aa[0]);aa[1]=n(aa[1])||0;aa[2]=n(aa[2])||0;return(ab[0]>aa[0]||(ab[0]==aa[0]&&ab[1]>aa[1])||(ab[0]==aa[0]&&ab[1]==aa[1]&&ab[2]>=aa[2]))?true:false}function v(af,ab,ag,ae){var ad=h.getElementsByTagName("head")[0];if(!ad){return}var aa=(typeof ag=="string")?ag:"screen";if(ae){m=null;G=null}if(!m||G!=aa){var ac=C("style");ac.setAttribute("type","text/css");ac.setAttribute("media",aa);m=ad.appendChild(ac);if(O.ie&&typeof h.styleSheets!=D&&h.styleSheets.length>0){m=h.styleSheets[h.styleSheets.length-1]}G=aa}if(m){if(typeof m.addRule!=D){m.addRule(af,ab)}else{if(typeof h.createTextNode!=D){m.appendChild(h.createTextNode(af+" {"+ab+"}"))}}}}function w(ad,aa){if(!j){return}var ab=aa?"visible":"hidden",ac=c(ad);if(L&&ac){ac.style.visibility=ab}else{if(typeof ad==="string"){v("#"+ad,"visibility:"+ab)}}}function N(ab){var ac=/[\\\"<>\.;]/;var aa=ac.exec(ab)!=null;return aa&&typeof encodeURIComponent!=D?encodeURIComponent(ab):ab}var d=function(){if(O.ie){window.attachEvent("onunload",function(){var af=K.length;for(var ae=0;ae<af;ae++){K[ae][0].detachEvent(K[ae][1],K[ae][2])}var ac=P.length;for(var ad=0;ad<ac;ad++){y(P[ad])}for(var ab in O){O[ab]=null}O=null;for(var aa in swfobject){swfobject[aa]=null}swfobject=null})}}();return{registerObject:function(ae,aa,ad,ac){if(O.w3&&ae&&aa){var ab={};ab.id=ae;ab.swfVersion=aa;ab.expressInstall=ad;ab.callbackFn=ac;o[o.length]=ab;w(ae,false)}else{if(ac){ac({success:false,id:ae})}}},getObjectById:function(aa){if(O.w3){return z(aa)}},embedSWF:function(af,al,ai,ak,ab,ae,ad,ah,aj,ag){var ac=W(al),aa={success:false,id:ac};if(O.w3&&!(O.wk&&O.wk<312)&&af&&al&&ai&&ak&&ab){w(ac,false);M(function(){ai+="";ak+="";var an={};if(aj&&typeof aj===r){for(var aq in aj){an[aq]=aj[aq]}}an.data=af;an.width=ai;an.height=ak;var ar={};if(ah&&typeof ah===r){for(var ao in ah){ar[ao]=ah[ao]}}if(ad&&typeof ad===r){for(var am in ad){if(ad.hasOwnProperty(am)){var ap=(l)?encodeURIComponent(am):am,at=(l)?encodeURIComponent(ad[am]):ad[am];if(typeof ar.flashvars!=D){ar.flashvars+="&"+ap+"="+at}else{ar.flashvars=ap+"="+at}}}}if(F(ab)){var au=u(an,ar,al);if(an.id==ac){w(ac,true)}aa.success=true;aa.ref=au;aa.id=au.id}else{if(ae&&A()){an.data=ae;R(an,ar,al,ag);return}else{w(ac,true)}}if(ag){ag(aa)}})}else{if(ag){ag(aa)}}},switchOffAutoHideShow:function(){j=false},enableUriEncoding:function(aa){l=(typeof aa===D)?true:aa},ua:O,getFlashPlayerVersion:function(){return{major:O.pv[0],minor:O.pv[1],release:O.pv[2]}},hasFlashPlayerVersion:F,createSWF:function(ac,ab,aa){if(O.w3){return u(ac,ab,aa)}else{return undefined}},showExpressInstall:function(ac,ad,aa,ab){if(O.w3&&A()){R(ac,ad,aa,ab)}},removeSWF:function(aa){if(O.w3){y(aa)}},createCSS:function(ad,ac,ab,aa){if(O.w3){v(ad,ac,ab,aa)}},addDomLoadEvent:M,addLoadEvent:s,getQueryParamValue:function(ad){var ac=h.location.search||h.location.hash;
if(ac){if(/\?/.test(ac)){ac=ac.split("?")[1]}if(ad==null){return N(ac)}var ab=ac.split("&");for(var aa=0;aa<ab.length;aa++){if(ab[aa].substring(0,ab[aa].indexOf("="))==ad){return N(ab[aa].substring((ab[aa].indexOf("=")+1)))}}}return""},expressInstallCallback:function(){if(a){var aa=c(S);if(aa&&I){aa.parentNode.replaceChild(I,aa);if(p){w(p,true);if(O.ie){I.style.display="block"}}if(E){E(B)}}a=false}},version:"2.3"}}();

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImF1dG9pbml0LmpzIiwibWFpbi5qcyIsInBvbGlmaWxsLmpzIiwid3JhcHBlci5qcyIsInZlbmRvci9mbGFzaGRldGVjdC9mbGFzaGRldGVjdC5qcyIsInZlbmRvci9zd2ZvYmplY3Qvc3dmb2JqZWN0LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDbERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJvdXRzdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJ3aW5kb3cub25sb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzY3JpcHRUYWdzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuXG4gICAgICAgIGZvciAodmFyIGl0ZW0gaW4gc2NyaXB0VGFncykge1xuICAgICAgICAgICAgdmFyIGFpZCA9IHBhcnNlQXR0cihzY3JpcHRUYWdzW2l0ZW1dLCAnYWlkJyk7XG5cbiAgICAgICAgICAgIGlmICghIWFpZCAmJiAhaXNOYU4oYWlkKSkge1xuICAgICAgICAgICAgICAgIGluaXRPdXRzdHJlYW0oe1xuICAgICAgICAgICAgICAgICAgICB3aWR0aDogcGFyc2VBdHRyKHNjcmlwdFRhZ3NbaXRlbV0sICd3aWR0aCcpLFxuICAgICAgICAgICAgICAgICAgICBoZWlnaHQ6IHBhcnNlQXR0cihzY3JpcHRUYWdzW2l0ZW1dLCAnaGVpZ2h0JyksXG4gICAgICAgICAgICAgICAgICAgIGFpZDogYWlkLFxuICAgICAgICAgICAgICAgICAgICBjb250YWluZXJFbDogY3JlYXRlRWwoc2NyaXB0VGFnc1tpdGVtXSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pKCk7XG5cbiAgICBmdW5jdGlvbiBwYXJzZUF0dHIoZWwsIGtleSkge1xuICAgICAgICB2YXIgdmFsdWU7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhbHVlID0gcGFyc2VJbnQoZWwuZ2V0QXR0cmlidXRlKCdkYXRhLW91dHN0cmVhbS0nICsga2V5KSk7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdE91dHN0cmVhbShvcHRpb25zKSB7XG4gICAgICAgIG5ldyBPdXRzdHJlYW0oe1xuICAgICAgICAgICAgYWlkOiBvcHRpb25zLmFpZCxcbiAgICAgICAgICAgIHdpZHRoOiBpc05hTihvcHRpb25zLndpZHRoKSA/IDQwMCA6IG9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGlzTmFOKG9wdGlvbnMuaGVpZ2h0KSA/IDMwMCA6IG9wdGlvbnMuaGVpZ2h0LFxuICAgICAgICAgICAgY29udGFpbmVyRWw6IG9wdGlvbnMuY29udGFpbmVyRWxcbiAgICAgICAgfSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBpc05hTih2YWwpIHtcbiAgICAgICAgcmV0dXJuIHZhbCAhPSB2YWw7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY3JlYXRlRWwoZWwpIHtcbiAgICAgICAgdmFyIGFkQ29udGFpbmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKSxcbiAgICAgICAgICAgIHBhcmVudEVsID0gZWwucGFyZW50Tm9kZTtcblxuICAgICAgICBpZiAocGFyZW50RWwudGFnTmFtZS50b1VwcGVyQ2FzZSgpID09IFwiSEVBRFwiKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGFkQ29udGFpbmVyKTtcblxuICAgICAgICAgICAgcmV0dXJuIGFkQ29udGFpbmVyO1xuICAgICAgICB9XG5cbiAgICAgICAgcGFyZW50RWwuaW5zZXJ0QmVmb3JlKGFkQ29udGFpbmVyLCBlbCk7XG5cbiAgICAgICAgcmV0dXJuIGFkQ29udGFpbmVyO1xuICAgIH1cbn07XG4iLCIvKipcbiAqIEBwYXJhbSBvcHRpb25zLmFpZCB7bnVtYmVyfVxuICogQHBhcmFtIG9wdGlvbnMud2lkdGgge251bWJlcn1cbiAqIEBwYXJhbSBvcHRpb25zLmhlaWdodCB7bnVtYmVyfVxuICogQHBhcmFtIG9wdGlvbnMuY29udGFpbmVyRWwge29iamVjdH1cbiAqXG4gKiBAcGFyYW0gb3B0aW9ucyB7b2JqZWN0fVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIE91dHN0cmVhbShvcHRpb25zKSB7XG4gICAgaWYgKCFnZXRGbGFzaFZlcnNpb24oKSkge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdGbGFzaCBQbGF5ZXIgbm90IGluc3RhbGxlZCEnKTtcblxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFvcHRpb25zKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0NyZWF0ZSB3aXRob3V0IG9wdGlvbnMnKTtcblxuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuc2RrVW5pcXVlID0gbnVsbDtcbiAgICB0aGlzLmlkID0gTWF0aC5yb3VuZCgoIG5ldyBEYXRlKCkgKS5nZXRUaW1lKCkgLyAxMDAwMCArIE1hdGgucmFuZG9tKCkgKiAxMDAwMDAwMCk7XG4gICAgdGhpcy51bml0U3JjID0gJ2h0dHA6Ly9wbGF5ZXIudmlkZWUudHYvdjIuMS9yZXNvdXJjZXMvbGlicy92aWRlZWpzLXBsYXllci5zd2YnO1xuICAgIHRoaXMuZmxhc2hWZXJzaW9uID0gXCIxMC4wLjBcIjtcbiAgICB0aGlzLnBhcmFtcyA9IHtcbiAgICAgICAgYWxsb3dTY3JpcHRBY2Nlc3M6IFwiYWx3YXlzXCIsXG4gICAgICAgIGFsbG93RnVsbFNjcmVlbjogXCJ0cnVlXCIsXG4gICAgICAgIHdtb2RlOiAndHJhbnNwYXJlbnQnXG4gICAgfTtcblxuICAgIHRoaXMuZXZlbnRzID0ge307XG4gICAgdGhpcy5hZGRXcmFwcGVyRWwoKTtcbiAgICB0aGlzLmluaXRFdmVudExpc3RlbmVyKHRoaXMuaW5pdFdyYXBwZXIoKSk7XG4gICAgdGhpcy5lbWJlZFNXRigpO1xufVxuXG5PdXRzdHJlYW0ucHJvdG90eXBlLmZsYXNodmFycyA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBvblJlYWR5OiBcIndpbmRvdy5WcGFpZGZsYXNoV3JhcHBlcnNbXCIgKyB0aGlzLmlkICsgXCJdLnN0YXJ0Rmxhc2hXcmFwcGVyXCJcbiAgICB9XG59O1xuXG5PdXRzdHJlYW0ucHJvdG90eXBlLmluaXRXcmFwcGVyID0gZnVuY3Rpb24gKCkge1xuICAgIHRyeSB7XG4gICAgICAgIHJldHVybiBuZXcgV3JhcHBlcihcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5haWQsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMud2lkdGgsXG4gICAgICAgICAgICB0aGlzLm9wdGlvbnMuaGVpZ2h0LFxuICAgICAgICAgICAgdGhpcy5vcHRpb25zLnNpZFxuICAgICAgICApLndyYXAodGhpcy5pZCk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZXJyKVxuICAgIH1cbn07XG5cbk91dHN0cmVhbS5wcm90b3R5cGUuYWRkV3JhcHBlckVsID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc2RrVW5pcXVlID0gJ1Nka0ludGVncmF0aW9uJyArIHRoaXMuaWQ7XG4gICAgdmFyIGJsb2NrZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBibG9ja2VyLmNsYXNzTmFtZSA9ICdmbGFzaC1ibG9ja2VyJztcbiAgICBibG9ja2VyLmlubmVySFRNTCA9ICc8ZGl2IGlkPVwiJyArIHRoaXMuc2RrVW5pcXVlICsgJ1wiPjwvZGl2Pic7XG4gICAgdGhpcy5vcHRpb25zLmNvbnRhaW5lckVsLmFwcGVuZENoaWxkKGJsb2NrZXIpO1xufTtcblxuT3V0c3RyZWFtLnByb3RvdHlwZS5lbWJlZFNXRiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgICBzd2ZvYmplY3QuZW1iZWRTV0YoXG4gICAgICAgICAgICB0aGlzLnVuaXRTcmMsXG4gICAgICAgICAgICB0aGlzLnNka1VuaXF1ZSxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy53aWR0aCxcbiAgICAgICAgICAgIHRoaXMub3B0aW9ucy5oZWlnaHQsXG4gICAgICAgICAgICB0aGlzLmZsYXNoVmVyc2lvbixcbiAgICAgICAgICAgIHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHRoaXMuZmxhc2h2YXJzKCksXG4gICAgICAgICAgICB0aGlzLnBhcmFtcyxcbiAgICAgICAgICAgIHt9XG4gICAgICAgICk7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICB9XG59O1xuXG5PdXRzdHJlYW0ucHJvdG90eXBlLmluaXRFdmVudExpc3RlbmVyID0gZnVuY3Rpb24gKGV2ZW50TWFuYWdlcikge1xuICAgIHZhciBjb250ZXh0ID0gdGhpcyxcbiAgICAgICAgcHJveHlFdmVudHMgPSBbJ2xvYWRlZCcsJ2Vycm9yJywnY29tcGxldGUnLCdzdGFydGVkJywncmVzdW1lZCcsJ3BhdXNlZCcsJ211dGUnLCd1bm11dGUnXTtcblxuICAgIGZvcih2YXIgaSBpbiBwcm94eUV2ZW50cyl7XG4gICAgICAgIGluaXRFdmVudChwcm94eUV2ZW50c1tpXSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaW5pdEV2ZW50KHByb3h5RXZlbnQpe1xuICAgICAgICBldmVudE1hbmFnZXIub24ocHJveHlFdmVudCwgZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICAgIGNvbnRleHQudHJpZ2dlcihwcm94eUV2ZW50LCBkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxufTtcblxuT3V0c3RyZWFtLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lICsgJyddID0gY2FsbGJhY2s7XG4gICAgcmV0dXJuIHRoaXM7XG59O1xuXG5PdXRzdHJlYW0ucHJvdG90eXBlLm9mZiA9IGZ1bmN0aW9uIChldmVudE5hbWUpIHtcbiAgICBkZWxldGUgdGhpcy5ldmVudHNbZXZlbnROYW1lICsgJyddO1xuICAgIHJldHVybiB0aGlzO1xufTtcblxuT3V0c3RyZWFtLnByb3RvdHlwZS50cmlnZ2VyID0gZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGF0YSkge1xuICAgIHZhciBjYWxsYmFjayA9IHRoaXMuZXZlbnRzW2V2ZW50TmFtZV07XG5cbiAgICBpZiAoIWNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjYWxsYmFjay5jYWxsKHRoaXMsIGRhdGEpO1xufTtcblxuT3V0c3RyZWFtLnByb3RvdHlwZS5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMub3B0aW9ucy5jb250YWluZXJFbC5pbm5lckhUTUwgPSAnJ1xufTtcblxudmFyIHJvb3QgPSByb290IHx8IHdpbmRvdztcbnJvb3QuT3V0c3RyZWFtID0gT3V0c3RyZWFtO1xuIiwidmFyIHJvb3QgPSByb290IHx8d2luZG93O1xuaWYoIXJvb3QuY29uc29sZSl7XG4gICAgcm9vdC5jb25zb2xlID0ge1xuICAgICAgICBsb2c6IGZ1bmN0aW9uKGEpe1xuICAgICAgICAgICAgYWxlcnQoYSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVycm9yOiBmdW5jdGlvbihhKXtcbiAgICAgICAgICAgIGFsZXJ0KGEpO1xuICAgICAgICB9XG4gICAgfTtcbn1cblxuaWYgKCFyb290LkpTT04pIHtcbiAgICByb290LkpTT04gPSB7XG4gICAgICAgIHBhcnNlOiBmdW5jdGlvbihzSlNPTikgeyByZXR1cm4gZXZhbCgnKCcgKyBzSlNPTiArICcpJyk7IH0sXG4gICAgICAgIHN0cmluZ2lmeTogKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciB0b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gICAgICAgICAgICB2YXIgaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKGEpIHsgcmV0dXJuIHRvU3RyaW5nLmNhbGwoYSkgPT09ICdbb2JqZWN0IEFycmF5XSc7IH07XG4gICAgICAgICAgICB2YXIgZXNjTWFwID0geydcIic6ICdcXFxcXCInLCAnXFxcXCc6ICdcXFxcXFxcXCcsICdcXGInOiAnXFxcXGInLCAnXFxmJzogJ1xcXFxmJywgJ1xcbic6ICdcXFxcbicsICdcXHInOiAnXFxcXHInLCAnXFx0JzogJ1xcXFx0J307XG4gICAgICAgICAgICB2YXIgZXNjRnVuYyA9IGZ1bmN0aW9uIChtKSB7IHJldHVybiBlc2NNYXBbbV0gfHwgJ1xcXFx1JyArIChtLmNoYXJDb2RlQXQoMCkgKyAweDEwMDAwKS50b1N0cmluZygxNikuc3Vic3RyKDEpOyB9O1xuICAgICAgICAgICAgdmFyIGVzY1JFID0gL1tcXFxcXCJcXHUwMDAwLVxcdTAwMUZcXHUyMDI4XFx1MjAyOV0vZztcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBzdHJpbmdpZnkodmFsdWUpIHtcbiAgICAgICAgICAgICAgICBpZiAodmFsdWUgPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ251bGwnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXNGaW5pdGUodmFsdWUpID8gdmFsdWUudG9TdHJpbmcoKSA6ICdudWxsJztcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB2YWx1ZS50b1N0cmluZygpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHZhbHVlLnRvSlNPTiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHN0cmluZ2lmeSh2YWx1ZS50b0pTT04oKSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXMgPSAnWyc7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgaSsrKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcyArPSAoaSA/ICcsICcgOiAnJykgKyBzdHJpbmdpZnkodmFsdWVbaV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlcyArICddJztcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0b1N0cmluZy5jYWxsKHZhbHVlKSA9PT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0bXAgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGsgaW4gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodmFsdWUuaGFzT3duUHJvcGVydHkoaykpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRtcC5wdXNoKHN0cmluZ2lmeShrKSArICc6ICcgKyBzdHJpbmdpZnkodmFsdWVba10pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAneycgKyB0bXAuam9pbignLCAnKSArICd9JztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gJ1wiJyArIHZhbHVlLnRvU3RyaW5nKCkucmVwbGFjZShlc2NSRSwgZXNjRnVuYykgKyAnXCInO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSkoKVxuICAgIH07XG59XG4iLCIvKipcbiAqIEBwYXJhbSBhaWQge251bWJlcn1cbiAqIEBwYXJhbSB3aWR0aCB7bnVtYmVyfVxuICogQHBhcmFtIGhlaWdodCB7bnVtYmVyfVxuICogQHBhcmFtIHNpZCB7bnVtYmVyfVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFdyYXBwZXIoYWlkLCB3aWR0aCwgaGVpZ2h0LCBzaWQpIHtcbiAgICBpZiAoIWFpZCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1NldCBhaWQnKVxuICAgIH1cblxuICAgIHRoaXMuaG9zdCA9IGVuY29kZVVSSUNvbXBvbmVudCh3aW5kb3cubG9jYXRpb24uaG9zdCk7XG4gICAgdGhpcy5jZCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDMwMDtcbiAgICB0aGlzLndpZHRoID0gd2lkdGggfHwgNDAwO1xuICAgIHRoaXMuc2lkID0gc2lkIHx8IDA7XG4gICAgdGhpcy5haWQgPSBhaWQ7XG59XG5cbldyYXBwZXIucHJvdG90eXBlLndyYXAgPSBmdW5jdGlvbiAoYWRJZCkge1xuICAgIHZhciBjb25maWcgPSB0aGlzLmdldENvbmZpZyhhZElkKSxcbiAgICAgICAgZXZlbnRNYW5hZ2VyID0gbmV3IEV2ZW50TWFuYWdlcigpO1xuICAgIHdpZHRoID0gdGhpcy53aWR0aCxcbiAgICAgICAgaGVpZ2h0ID0gdGhpcy5oZWlnaHQ7XG5cbiAgICBpZiAoIXdpbmRvdy5WcGFpZGZsYXNoV3JhcHBlcnMpIHtcbiAgICAgICAgd2luZG93LlZwYWlkZmxhc2hXcmFwcGVycyA9IHt9XG4gICAgfVxuXG4gICAgd2luZG93LlZwYWlkZmxhc2hXcmFwcGVyc1thZElkXSA9IHt9O1xuXG4gICAgd2luZG93LlZwYWlkZmxhc2hXcmFwcGVyc1thZElkXSA9IHtcbiAgICAgICAgYWRMb2FkZWRDbG9zdXJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBldmVudE1hbmFnZXIudHJpZ2dlcignbG9hZGVkJyk7XG4gICAgICAgICAgICB3aW5kb3dbXCJTZGtJbnRlZ3JhdGlvblwiICsgYWRJZF0uc3RhcnRBZCgpO1xuICAgICAgICB9LFxuICAgICAgICBhZEVycm9yQ2xvc3VyZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLnRyaWdnZXIoJ2Vycm9yJyk7XG4gICAgICAgIH0sXG4gICAgICAgIGFkQ29tcGxldGVDbG9zdXJlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBldmVudE1hbmFnZXIudHJpZ2dlcignY29tcGxldGUnKTtcbiAgICAgICAgfSxcbiAgICAgICAgcGF1c2VkQ2xvc3VyZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLnRyaWdnZXIoJ3BhdXNlZCcpO1xuICAgICAgICB9LFxuICAgICAgICByZXN1bWVkQ2xvc3VyZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLnRyaWdnZXIoJ3Jlc3VtZWQnKTtcbiAgICAgICAgfSxcbiAgICAgICAgbXV0ZUNsb3N1cmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGV2ZW50TWFuYWdlci50cmlnZ2VyKCdtdXRlJyk7XG4gICAgICAgIH0sXG4gICAgICAgIHVubXV0ZUNsb3N1cmU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGV2ZW50TWFuYWdlci50cmlnZ2VyKCd1bm11dGUnKTtcbiAgICAgICAgfSxcbiAgICAgICAgYWRTdGFydGVkQ2xvc3VyZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgZXZlbnRNYW5hZ2VyLnRyaWdnZXIoJ3N0YXJ0ZWQnKTtcbiAgICAgICAgfSxcbiAgICAgICAgc3RhcnRGbGFzaFdyYXBwZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBTZGtJbnRlZ3JhdGlvbiA9IHdpbmRvd1tcIlNka0ludGVncmF0aW9uXCIgKyBhZElkXTtcbiAgICAgICAgICAgIFNka0ludGVncmF0aW9uLndpZHRoID0gd2lkdGg7XG4gICAgICAgICAgICBTZGtJbnRlZ3JhdGlvbi5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgICAgICBTZGtJbnRlZ3JhdGlvbi5sb2FkQWQoY29uZmlnKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZXZlbnRNYW5hZ2VyO1xufTtcblxuV3JhcHBlci5wcm90b3R5cGUuZ2V0Q29uZmlnID0gZnVuY3Rpb24gKGFkSWQpIHtcbiAgICB2YXIgdHBsID0gXCJ3aW5kb3cuVnBhaWRmbGFzaFdyYXBwZXJzW1wiICsgYWRJZCArIFwiXVwiO1xuXG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgYWRDb21wbGV0ZUNsb3N1cmU6IHRwbCArIFwiLmFkQ29tcGxldGVDbG9zdXJlXCIsXG4gICAgICAgIGFkU3RhcnRlZENsb3N1cmU6IHRwbCArIFwiLmFkU3RhcnRlZENsb3N1cmVcIixcbiAgICAgICAgYWRMb2FkZWRDbG9zdXJlOiB0cGwgKyBcIi5hZExvYWRlZENsb3N1cmVcIixcbiAgICAgICAgYWRFcnJvckNsb3N1cmU6IHRwbCArIFwiLmFkRXJyb3JDbG9zdXJlXCIsXG4gICAgICAgIHJlc3VtZWRDbG9zdXJlOiB0cGwgKyBcIi5yZXN1bWVkQ2xvc3VyZVwiLFxuICAgICAgICBwYXVzZWRDbG9zdXJlOiB0cGwgKyBcIi5wYXVzZWRDbG9zdXJlXCIsXG4gICAgICAgIHVubXV0ZUNsb3N1cmU6IHRwbCArIFwiLnVubXV0ZUNsb3N1cmVcIixcbiAgICAgICAgbXV0ZUNsb3N1cmU6IHRwbCArIFwiLm11dGVDbG9zdXJlXCIsXG4gICAgICAgIHZvbHVtZTogMSxcbiAgICAgICAgd2lkdGg6IHRoaXMud2lkdGgsXG4gICAgICAgIGhlaWdodDogdGhpcy5oZWlnaHQsXG4gICAgICAgIHZhc3RVcmw6IHRoaXMuZ2V0VmFzdFVybCgpXG4gICAgfSlcbn07XG5cbldyYXBwZXIucHJvdG90eXBlLmdldFZhc3RVcmwgPSBmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuICdodHRwOi8vdmFzdC52aWRlZS50di92YXN0LXByb3h5Lz9haWQ9JyArIHRoaXMuYWlkICtcbiAgICAgICAgJyZjb250ZW50X3BhZ2VfdXJsPScgKyB0aGlzLmhvc3QgK1xuICAgICAgICAnJnBsYXllcl9oZWlnaHQ9JyArIHRoaXMuaGVpZ2h0ICtcbiAgICAgICAgJyZwbGF5ZXJfd2lkdGg9JyArIHRoaXMud2lkdGggK1xuICAgICAgICAnJnNpZD0nICsgdGhpcy5zaWQgK1xuICAgICAgICAnJmNiPScgKyB0aGlzLmNkXG59O1xuXG5mdW5jdGlvbiBFdmVudE1hbmFnZXIoKSB7XG4gICAgdGhpcy5ldmVudHMgPSB7fTtcbn1cblxuRXZlbnRNYW5hZ2VyLnByb3RvdHlwZS5vbiA9IGZ1bmN0aW9uIChldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdGhpcy5ldmVudHNbZXZlbnROYW1lICsgJyddID0gY2FsbGJhY2s7XG59O1xuXG5FdmVudE1hbmFnZXIucHJvdG90eXBlLnRyaWdnZXIgPSBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhKSB7XG4gICAgdmFyIGNhbGxiYWNrID0gdGhpcy5ldmVudHNbZXZlbnROYW1lXTtcblxuICAgIGlmICghY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNhbGxiYWNrLmNhbGwobnVsbCwgZGF0YSk7XG59OyIsIi8qIEZsYXNoIGRldGVjdGlvbiBmcm9tIFNXRk9iamVjdDogY29kZS5nb29nbGUuY29tL3Avc3dmb2JqZWN0XG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgXG4gKiBAcmV0dXJucyBhIHZlcnNpb24gbnVtYmVyIG9yIC0xIGlmIG5vIHBsYXllclxuICovXG52YXIgZ2V0Rmxhc2hWZXJzaW9uID0gZnVuY3Rpb24oKSB7XG5cdFxuXHRcdHZhciBTVyA9IFwiU2hvY2t3YXZlXCIsXG5cdFx0XHRGTEFTSCA9IFwiRmxhc2hcIixcblx0XHRcdFNIT0NLV0FWRV9GTEFTSCA9IFNXICsgXCIgXCIgKyBGTEFTSCxcblx0XHRcdFNIT0NLV0FWRV9GTEFTSF9BWCA9IFNXK0ZMQVNIK1wiLlwiK1NXK0ZMQVNILFxuXHRcdFx0RkxBU0hfTUlNRV9UWVBFID0gXCJhcHBsaWNhdGlvbi94LXNob2Nrd2F2ZS1mbGFzaFwiLFxuXHRcdFx0bmF2ID0gbmF2aWdhdG9yLFxuXHRcdFx0cGFyc2UgPSBwYXJzZUZsb2F0LFxuXHRcdFx0cGx1Z2lucyA9IG5hdi5wbHVnaW5zLFxuXHRcdFx0bWltZXMgPSBuYXYubWltZVR5cGVzLFxuXHRcdFx0ZCwgYTtcblx0XHRpZiAoISFwbHVnaW5zICYmIHR5cGVvZiBwbHVnaW5zW1NIT0NLV0FWRV9GTEFTSF0gPT0gXCJvYmplY3RcIikge1xuXHRcdFx0ZCA9IHBsdWdpbnNbU0hPQ0tXQVZFX0ZMQVNIXS5kZXNjcmlwdGlvbjtcblx0XHRcdGlmICghIWQgJiYgISghIW1pbWVzICYmICEhbWltZXNbRkxBU0hfTUlNRV9UWVBFXSAmJiAhbWltZXNbRkxBU0hfTUlNRV9UWVBFXS5lbmFibGVkUGx1Z2luKSkge1xuXHRcdFx0XHRyZXR1cm4gcGFyc2UoIGQucmVwbGFjZSgvXi4qXFxzKyhcXFMrKVxccytcXFMrJC8sIFwiJDFcIikgKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0ZWxzZSBpZiAoICEhd2luZG93LkFjdGl2ZVhPYmplY3QgKSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhID0gbmV3IEFjdGl2ZVhPYmplY3QoU0hPQ0tXQVZFX0ZMQVNIX0FYKTtcblx0XHRcdFx0aWYgKGEpIHtcblx0XHRcdFx0XHRkID0gYS5HZXRWYXJpYWJsZShcIiR2ZXJzaW9uXCIpO1xuXHRcdFx0XHRcdGlmICghIWQpIHtcblx0XHRcdFx0XHRcdHJldHVybiBwYXJzZShkLnJlcGxhY2UoL15cXFMrXFxzKyhcXGQrKSwoXFxkKykuKiQvaSwnJDEuJDInKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjYXRjaChlKSB7fVxuXHRcdH1cblx0XHRyZXR1cm4gLTE7XG5cdFx0XG59OyIsIi8qISAgICBTV0ZPYmplY3QgdjIuMy4yMDEzMDUyMSA8aHR0cDovL2dpdGh1Yi5jb20vc3dmb2JqZWN0L3N3Zm9iamVjdD5cbiAgICBpcyByZWxlYXNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UgPGh0dHA6Ly93d3cub3BlbnNvdXJjZS5vcmcvbGljZW5zZXMvbWl0LWxpY2Vuc2UucGhwPlxuKi9cbnZhciBzd2ZvYmplY3Q9ZnVuY3Rpb24oKXt2YXIgRD1cInVuZGVmaW5lZFwiLHI9XCJvYmplY3RcIixUPVwiU2hvY2t3YXZlIEZsYXNoXCIsWj1cIlNob2Nrd2F2ZUZsYXNoLlNob2Nrd2F2ZUZsYXNoXCIscT1cImFwcGxpY2F0aW9uL3gtc2hvY2t3YXZlLWZsYXNoXCIsUz1cIlNXRk9iamVjdEV4cHJJbnN0XCIseD1cIm9ucmVhZHlzdGF0ZWNoYW5nZVwiLFE9d2luZG93LGg9ZG9jdW1lbnQsdD1uYXZpZ2F0b3IsVj1mYWxzZSxYPVtdLG89W10sUD1bXSxLPVtdLEkscCxFLEIsTD1mYWxzZSxhPWZhbHNlLG0sRyxqPXRydWUsbD1mYWxzZSxPPWZ1bmN0aW9uKCl7dmFyIGFkPXR5cGVvZiBoLmdldEVsZW1lbnRCeUlkIT1EJiZ0eXBlb2YgaC5nZXRFbGVtZW50c0J5VGFnTmFtZSE9RCYmdHlwZW9mIGguY3JlYXRlRWxlbWVudCE9RCxhaz10LnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpLGFiPXQucGxhdGZvcm0udG9Mb3dlckNhc2UoKSxhaD1hYj8vd2luLy50ZXN0KGFiKTovd2luLy50ZXN0KGFrKSxhZj1hYj8vbWFjLy50ZXN0KGFiKTovbWFjLy50ZXN0KGFrKSxhaT0vd2Via2l0Ly50ZXN0KGFrKT9wYXJzZUZsb2F0KGFrLnJlcGxhY2UoL14uKndlYmtpdFxcLyhcXGQrKFxcLlxcZCspPykuKiQvLFwiJDFcIikpOmZhbHNlLGFhPXQuYXBwTmFtZT09PVwiTWljcm9zb2Z0IEludGVybmV0IEV4cGxvcmVyXCIsYWo9WzAsMCwwXSxhZT1udWxsO2lmKHR5cGVvZiB0LnBsdWdpbnMhPUQmJnR5cGVvZiB0LnBsdWdpbnNbVF09PXIpe2FlPXQucGx1Z2luc1tUXS5kZXNjcmlwdGlvbjtpZihhZSYmKHR5cGVvZiB0Lm1pbWVUeXBlcyE9RCYmdC5taW1lVHlwZXNbcV0mJnQubWltZVR5cGVzW3FdLmVuYWJsZWRQbHVnaW4pKXtWPXRydWU7YWE9ZmFsc2U7YWU9YWUucmVwbGFjZSgvXi4qXFxzKyhcXFMrXFxzK1xcUyskKS8sXCIkMVwiKTthalswXT1uKGFlLnJlcGxhY2UoL14oLiopXFwuLiokLyxcIiQxXCIpKTthalsxXT1uKGFlLnJlcGxhY2UoL14uKlxcLiguKilcXHMuKiQvLFwiJDFcIikpO2FqWzJdPS9bYS16QS1aXS8udGVzdChhZSk/bihhZS5yZXBsYWNlKC9eLipbYS16QS1aXSsoLiopJC8sXCIkMVwiKSk6MH19ZWxzZXtpZih0eXBlb2YgUS5BY3RpdmVYT2JqZWN0IT1EKXt0cnl7dmFyIGFnPW5ldyBBY3RpdmVYT2JqZWN0KFopO2lmKGFnKXthZT1hZy5HZXRWYXJpYWJsZShcIiR2ZXJzaW9uXCIpO2lmKGFlKXthYT10cnVlO2FlPWFlLnNwbGl0KFwiIFwiKVsxXS5zcGxpdChcIixcIik7YWo9W24oYWVbMF0pLG4oYWVbMV0pLG4oYWVbMl0pXX19fWNhdGNoKGFjKXt9fX1yZXR1cm57dzM6YWQscHY6YWosd2s6YWksaWU6YWEsd2luOmFoLG1hYzphZn19KCksaT1mdW5jdGlvbigpe2lmKCFPLnczKXtyZXR1cm59aWYoKHR5cGVvZiBoLnJlYWR5U3RhdGUhPUQmJihoLnJlYWR5U3RhdGU9PT1cImNvbXBsZXRlXCJ8fGgucmVhZHlTdGF0ZT09PVwiaW50ZXJhY3RpdmVcIikpfHwodHlwZW9mIGgucmVhZHlTdGF0ZT09RCYmKGguZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdfHxoLmJvZHkpKSl7ZigpfWlmKCFMKXtpZih0eXBlb2YgaC5hZGRFdmVudExpc3RlbmVyIT1EKXtoLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsZixmYWxzZSl9aWYoTy5pZSl7aC5hdHRhY2hFdmVudCh4LGZ1bmN0aW9uIGFhKCl7aWYoaC5yZWFkeVN0YXRlPT1cImNvbXBsZXRlXCIpe2guZGV0YWNoRXZlbnQoeCxhYSk7ZigpfX0pO2lmKFE9PXRvcCl7KGZ1bmN0aW9uIGFjKCl7aWYoTCl7cmV0dXJufXRyeXtoLmRvY3VtZW50RWxlbWVudC5kb1Njcm9sbChcImxlZnRcIil9Y2F0Y2goYWQpe3NldFRpbWVvdXQoYWMsMCk7cmV0dXJufWYoKX0oKSl9fWlmKE8ud2speyhmdW5jdGlvbiBhYigpe2lmKEwpe3JldHVybn1pZighL2xvYWRlZHxjb21wbGV0ZS8udGVzdChoLnJlYWR5U3RhdGUpKXtzZXRUaW1lb3V0KGFiLDApO3JldHVybn1mKCl9KCkpfX19KCk7ZnVuY3Rpb24gZigpe2lmKEx8fCFkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF0pe3JldHVybn10cnl7dmFyIGFjLGFkPUMoXCJzcGFuXCIpO2FkLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7YWM9aC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF0uYXBwZW5kQ2hpbGQoYWQpO2FjLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYWMpO2FjPW51bGw7YWQ9bnVsbH1jYXRjaChhZSl7cmV0dXJufUw9dHJ1ZTt2YXIgYWE9WC5sZW5ndGg7Zm9yKHZhciBhYj0wO2FiPGFhO2FiKyspe1hbYWJdKCl9fWZ1bmN0aW9uIE0oYWEpe2lmKEwpe2FhKCl9ZWxzZXtYW1gubGVuZ3RoXT1hYX19ZnVuY3Rpb24gcyhhYil7aWYodHlwZW9mIFEuYWRkRXZlbnRMaXN0ZW5lciE9RCl7US5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLGFiLGZhbHNlKX1lbHNle2lmKHR5cGVvZiBoLmFkZEV2ZW50TGlzdGVuZXIhPUQpe2guYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIixhYixmYWxzZSl9ZWxzZXtpZih0eXBlb2YgUS5hdHRhY2hFdmVudCE9RCl7ZyhRLFwib25sb2FkXCIsYWIpfWVsc2V7aWYodHlwZW9mIFEub25sb2FkPT1cImZ1bmN0aW9uXCIpe3ZhciBhYT1RLm9ubG9hZDtRLm9ubG9hZD1mdW5jdGlvbigpe2FhKCk7YWIoKX19ZWxzZXtRLm9ubG9hZD1hYn19fX19ZnVuY3Rpb24gWSgpe3ZhciBhYT1oLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXTt2YXIgYWU9QyhyKTthZS5zZXRBdHRyaWJ1dGUoXCJzdHlsZVwiLFwidmlzaWJpbGl0eTogaGlkZGVuO1wiKTthZS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIscSk7dmFyIGFkPWFhLmFwcGVuZENoaWxkKGFlKTtpZihhZCl7dmFyIGFjPTA7KGZ1bmN0aW9uIGFiKCl7aWYodHlwZW9mIGFkLkdldFZhcmlhYmxlIT1EKXt0cnl7dmFyIGFnPWFkLkdldFZhcmlhYmxlKFwiJHZlcnNpb25cIik7aWYoYWcpe2FnPWFnLnNwbGl0KFwiIFwiKVsxXS5zcGxpdChcIixcIik7Ty5wdj1bbihhZ1swXSksbihhZ1sxXSksbihhZ1syXSldfX1jYXRjaChhZil7Ty5wdj1bOCwwLDBdfX1lbHNle2lmKGFjPDEwKXthYysrO3NldFRpbWVvdXQoYWIsMTApO3JldHVybn19YWEucmVtb3ZlQ2hpbGQoYWUpO2FkPW51bGw7SCgpfSgpKX1lbHNle0goKX19ZnVuY3Rpb24gSCgpe3ZhciBhaj1vLmxlbmd0aDtpZihhaj4wKXtmb3IodmFyIGFpPTA7YWk8YWo7YWkrKyl7dmFyIGFiPW9bYWldLmlkO3ZhciBhZT1vW2FpXS5jYWxsYmFja0ZuO3ZhciBhZD17c3VjY2VzczpmYWxzZSxpZDphYn07aWYoTy5wdlswXT4wKXt2YXIgYWg9YyhhYik7aWYoYWgpe2lmKEYob1thaV0uc3dmVmVyc2lvbikmJiEoTy53ayYmTy53azwzMTIpKXt3KGFiLHRydWUpO2lmKGFlKXthZC5zdWNjZXNzPXRydWU7YWQucmVmPXooYWIpO2FkLmlkPWFiO2FlKGFkKX19ZWxzZXtpZihvW2FpXS5leHByZXNzSW5zdGFsbCYmQSgpKXt2YXIgYWw9e307YWwuZGF0YT1vW2FpXS5leHByZXNzSW5zdGFsbDthbC53aWR0aD1haC5nZXRBdHRyaWJ1dGUoXCJ3aWR0aFwiKXx8XCIwXCI7YWwuaGVpZ2h0PWFoLmdldEF0dHJpYnV0ZShcImhlaWdodFwiKXx8XCIwXCI7aWYoYWguZ2V0QXR0cmlidXRlKFwiY2xhc3NcIikpe2FsLnN0eWxlY2xhc3M9YWguZ2V0QXR0cmlidXRlKFwiY2xhc3NcIil9aWYoYWguZ2V0QXR0cmlidXRlKFwiYWxpZ25cIikpe2FsLmFsaWduPWFoLmdldEF0dHJpYnV0ZShcImFsaWduXCIpfXZhciBhaz17fTt2YXIgYWE9YWguZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJwYXJhbVwiKTt2YXIgYWY9YWEubGVuZ3RoO2Zvcih2YXIgYWc9MDthZzxhZjthZysrKXtpZihhYVthZ10uZ2V0QXR0cmlidXRlKFwibmFtZVwiKS50b0xvd2VyQ2FzZSgpIT1cIm1vdmllXCIpe2FrW2FhW2FnXS5nZXRBdHRyaWJ1dGUoXCJuYW1lXCIpXT1hYVthZ10uZ2V0QXR0cmlidXRlKFwidmFsdWVcIil9fVIoYWwsYWssYWIsYWUpfWVsc2V7YihhaCk7aWYoYWUpe2FlKGFkKX19fX19ZWxzZXt3KGFiLHRydWUpO2lmKGFlKXt2YXIgYWM9eihhYik7aWYoYWMmJnR5cGVvZiBhYy5TZXRWYXJpYWJsZSE9RCl7YWQuc3VjY2Vzcz10cnVlO2FkLnJlZj1hYzthZC5pZD1hYy5pZH1hZShhZCl9fX19fVhbMF09ZnVuY3Rpb24oKXtpZihWKXtZKCl9ZWxzZXtIKCl9fTtmdW5jdGlvbiB6KGFjKXt2YXIgYWE9bnVsbCxhYj1jKGFjKTtpZihhYiYmYWIubm9kZU5hbWUudG9VcHBlckNhc2UoKT09PVwiT0JKRUNUXCIpe2lmKHR5cGVvZiBhYi5TZXRWYXJpYWJsZSE9PUQpe2FhPWFifWVsc2V7YWE9YWIuZ2V0RWxlbWVudHNCeVRhZ05hbWUocilbMF18fGFifX1yZXR1cm4gYWF9ZnVuY3Rpb24gQSgpe3JldHVybiAhYSYmRihcIjYuMC42NVwiKSYmKE8ud2lufHxPLm1hYykmJiEoTy53ayYmTy53azwzMTIpfWZ1bmN0aW9uIFIoYWQsYWUsYWEsYWMpe3ZhciBhaD1jKGFhKTthYT1XKGFhKTthPXRydWU7RT1hY3x8bnVsbDtCPXtzdWNjZXNzOmZhbHNlLGlkOmFhfTtpZihhaCl7aWYoYWgubm9kZU5hbWUudG9VcHBlckNhc2UoKT09XCJPQkpFQ1RcIil7ST1KKGFoKTtwPW51bGx9ZWxzZXtJPWFoO3A9YWF9YWQuaWQ9UztpZih0eXBlb2YgYWQud2lkdGg9PUR8fCghLyUkLy50ZXN0KGFkLndpZHRoKSYmbihhZC53aWR0aCk8MzEwKSl7YWQud2lkdGg9XCIzMTBcIn1pZih0eXBlb2YgYWQuaGVpZ2h0PT1EfHwoIS8lJC8udGVzdChhZC5oZWlnaHQpJiZuKGFkLmhlaWdodCk8MTM3KSl7YWQuaGVpZ2h0PVwiMTM3XCJ9dmFyIGFnPU8uaWU/XCJBY3RpdmVYXCI6XCJQbHVnSW5cIixhZj1cIk1NcmVkaXJlY3RVUkw9XCIrZW5jb2RlVVJJQ29tcG9uZW50KFEubG9jYXRpb24udG9TdHJpbmcoKS5yZXBsYWNlKC8mL2csXCIlMjZcIikpK1wiJk1NcGxheWVyVHlwZT1cIithZytcIiZNTWRvY3RpdGxlPVwiK2VuY29kZVVSSUNvbXBvbmVudChoLnRpdGxlLnNsaWNlKDAsNDcpK1wiIC0gRmxhc2ggUGxheWVyIEluc3RhbGxhdGlvblwiKTtpZih0eXBlb2YgYWUuZmxhc2h2YXJzIT1EKXthZS5mbGFzaHZhcnMrPVwiJlwiK2FmfWVsc2V7YWUuZmxhc2h2YXJzPWFmfWlmKE8uaWUmJmFoLnJlYWR5U3RhdGUhPTQpe3ZhciBhYj1DKFwiZGl2XCIpO1xuYWErPVwiU1dGT2JqZWN0TmV3XCI7YWIuc2V0QXR0cmlidXRlKFwiaWRcIixhYSk7YWgucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoYWIsYWgpO2FoLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7eShhaCl9dShhZCxhZSxhYSl9fWZ1bmN0aW9uIGIoYWIpe2lmKE8uaWUmJmFiLnJlYWR5U3RhdGUhPTQpe2FiLnN0eWxlLmRpc3BsYXk9XCJub25lXCI7dmFyIGFhPUMoXCJkaXZcIik7YWIucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoYWEsYWIpO2FhLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKEooYWIpLGFhKTt5KGFiKX1lbHNle2FiLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKEooYWIpLGFiKX19ZnVuY3Rpb24gSihhZil7dmFyIGFlPUMoXCJkaXZcIik7aWYoTy53aW4mJk8uaWUpe2FlLmlubmVySFRNTD1hZi5pbm5lckhUTUx9ZWxzZXt2YXIgYWI9YWYuZ2V0RWxlbWVudHNCeVRhZ05hbWUocilbMF07aWYoYWIpe3ZhciBhZz1hYi5jaGlsZE5vZGVzO2lmKGFnKXt2YXIgYWE9YWcubGVuZ3RoO2Zvcih2YXIgYWQ9MDthZDxhYTthZCsrKXtpZighKGFnW2FkXS5ub2RlVHlwZT09MSYmYWdbYWRdLm5vZGVOYW1lPT1cIlBBUkFNXCIpJiYhKGFnW2FkXS5ub2RlVHlwZT09OCkpe2FlLmFwcGVuZENoaWxkKGFnW2FkXS5jbG9uZU5vZGUodHJ1ZSkpfX19fX1yZXR1cm4gYWV9ZnVuY3Rpb24gayhhYSxhYil7dmFyIGFjPUMoXCJkaXZcIik7YWMuaW5uZXJIVE1MPVwiPG9iamVjdCBjbGFzc2lkPSdjbHNpZDpEMjdDREI2RS1BRTZELTExY2YtOTZCOC00NDQ1NTM1NDAwMDAnPjxwYXJhbSBuYW1lPSdtb3ZpZScgdmFsdWU9J1wiK2FhK1wiJz5cIithYitcIjwvb2JqZWN0PlwiO3JldHVybiBhYy5maXJzdENoaWxkfWZ1bmN0aW9uIHUoYWksYWcsYWIpe3ZhciBhYSxhZD1jKGFiKTthYj1XKGFiKTtpZihPLndrJiZPLndrPDMxMil7cmV0dXJuIGFhfWlmKGFkKXt2YXIgYWM9KE8uaWUpP0MoXCJkaXZcIik6QyhyKSxhZixhaCxhZTtpZih0eXBlb2YgYWkuaWQ9PUQpe2FpLmlkPWFifWZvcihhZSBpbiBhZyl7aWYoYWcuaGFzT3duUHJvcGVydHkoYWUpJiZhZS50b0xvd2VyQ2FzZSgpIT09XCJtb3ZpZVwiKXtlKGFjLGFlLGFnW2FlXSl9fWlmKE8uaWUpe2FjPWsoYWkuZGF0YSxhYy5pbm5lckhUTUwpfWZvcihhZiBpbiBhaSl7aWYoYWkuaGFzT3duUHJvcGVydHkoYWYpKXthaD1hZi50b0xvd2VyQ2FzZSgpO2lmKGFoPT09XCJzdHlsZWNsYXNzXCIpe2FjLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsYWlbYWZdKX1lbHNle2lmKGFoIT09XCJjbGFzc2lkXCImJmFoIT09XCJkYXRhXCIpe2FjLnNldEF0dHJpYnV0ZShhZixhaVthZl0pfX19fWlmKE8uaWUpe1BbUC5sZW5ndGhdPWFpLmlkfWVsc2V7YWMuc2V0QXR0cmlidXRlKFwidHlwZVwiLHEpO2FjLnNldEF0dHJpYnV0ZShcImRhdGFcIixhaS5kYXRhKX1hZC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChhYyxhZCk7YWE9YWN9cmV0dXJuIGFhfWZ1bmN0aW9uIGUoYWMsYWEsYWIpe3ZhciBhZD1DKFwicGFyYW1cIik7YWQuc2V0QXR0cmlidXRlKFwibmFtZVwiLGFhKTthZC5zZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiLGFiKTthYy5hcHBlbmRDaGlsZChhZCl9ZnVuY3Rpb24geShhYyl7dmFyIGFiPWMoYWMpO2lmKGFiJiZhYi5ub2RlTmFtZS50b1VwcGVyQ2FzZSgpPT1cIk9CSkVDVFwiKXtpZihPLmllKXthYi5zdHlsZS5kaXNwbGF5PVwibm9uZVwiOyhmdW5jdGlvbiBhYSgpe2lmKGFiLnJlYWR5U3RhdGU9PTQpe2Zvcih2YXIgYWQgaW4gYWIpe2lmKHR5cGVvZiBhYlthZF09PVwiZnVuY3Rpb25cIil7YWJbYWRdPW51bGx9fWFiLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYWIpfWVsc2V7c2V0VGltZW91dChhYSwxMCl9fSgpKX1lbHNle2FiLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYWIpfX19ZnVuY3Rpb24gVShhYSl7cmV0dXJuKGFhJiZhYS5ub2RlVHlwZSYmYWEubm9kZVR5cGU9PT0xKX1mdW5jdGlvbiBXKGFhKXtyZXR1cm4oVShhYSkpP2FhLmlkOmFhfWZ1bmN0aW9uIGMoYWMpe2lmKFUoYWMpKXtyZXR1cm4gYWN9dmFyIGFhPW51bGw7dHJ5e2FhPWguZ2V0RWxlbWVudEJ5SWQoYWMpfWNhdGNoKGFiKXt9cmV0dXJuIGFhfWZ1bmN0aW9uIEMoYWEpe3JldHVybiBoLmNyZWF0ZUVsZW1lbnQoYWEpfWZ1bmN0aW9uIG4oYWEpe3JldHVybiBwYXJzZUludChhYSwxMCl9ZnVuY3Rpb24gZyhhYyxhYSxhYil7YWMuYXR0YWNoRXZlbnQoYWEsYWIpO0tbSy5sZW5ndGhdPVthYyxhYSxhYl19ZnVuY3Rpb24gRihhYyl7YWMrPVwiXCI7dmFyIGFiPU8ucHYsYWE9YWMuc3BsaXQoXCIuXCIpO2FhWzBdPW4oYWFbMF0pO2FhWzFdPW4oYWFbMV0pfHwwO2FhWzJdPW4oYWFbMl0pfHwwO3JldHVybihhYlswXT5hYVswXXx8KGFiWzBdPT1hYVswXSYmYWJbMV0+YWFbMV0pfHwoYWJbMF09PWFhWzBdJiZhYlsxXT09YWFbMV0mJmFiWzJdPj1hYVsyXSkpP3RydWU6ZmFsc2V9ZnVuY3Rpb24gdihhZixhYixhZyxhZSl7dmFyIGFkPWguZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdO2lmKCFhZCl7cmV0dXJufXZhciBhYT0odHlwZW9mIGFnPT1cInN0cmluZ1wiKT9hZzpcInNjcmVlblwiO2lmKGFlKXttPW51bGw7Rz1udWxsfWlmKCFtfHxHIT1hYSl7dmFyIGFjPUMoXCJzdHlsZVwiKTthYy5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJ0ZXh0L2Nzc1wiKTthYy5zZXRBdHRyaWJ1dGUoXCJtZWRpYVwiLGFhKTttPWFkLmFwcGVuZENoaWxkKGFjKTtpZihPLmllJiZ0eXBlb2YgaC5zdHlsZVNoZWV0cyE9RCYmaC5zdHlsZVNoZWV0cy5sZW5ndGg+MCl7bT1oLnN0eWxlU2hlZXRzW2guc3R5bGVTaGVldHMubGVuZ3RoLTFdfUc9YWF9aWYobSl7aWYodHlwZW9mIG0uYWRkUnVsZSE9RCl7bS5hZGRSdWxlKGFmLGFiKX1lbHNle2lmKHR5cGVvZiBoLmNyZWF0ZVRleHROb2RlIT1EKXttLmFwcGVuZENoaWxkKGguY3JlYXRlVGV4dE5vZGUoYWYrXCIge1wiK2FiK1wifVwiKSl9fX19ZnVuY3Rpb24gdyhhZCxhYSl7aWYoIWope3JldHVybn12YXIgYWI9YWE/XCJ2aXNpYmxlXCI6XCJoaWRkZW5cIixhYz1jKGFkKTtpZihMJiZhYyl7YWMuc3R5bGUudmlzaWJpbGl0eT1hYn1lbHNle2lmKHR5cGVvZiBhZD09PVwic3RyaW5nXCIpe3YoXCIjXCIrYWQsXCJ2aXNpYmlsaXR5OlwiK2FiKX19fWZ1bmN0aW9uIE4oYWIpe3ZhciBhYz0vW1xcXFxcXFwiPD5cXC47XS87dmFyIGFhPWFjLmV4ZWMoYWIpIT1udWxsO3JldHVybiBhYSYmdHlwZW9mIGVuY29kZVVSSUNvbXBvbmVudCE9RD9lbmNvZGVVUklDb21wb25lbnQoYWIpOmFifXZhciBkPWZ1bmN0aW9uKCl7aWYoTy5pZSl7d2luZG93LmF0dGFjaEV2ZW50KFwib251bmxvYWRcIixmdW5jdGlvbigpe3ZhciBhZj1LLmxlbmd0aDtmb3IodmFyIGFlPTA7YWU8YWY7YWUrKyl7S1thZV1bMF0uZGV0YWNoRXZlbnQoS1thZV1bMV0sS1thZV1bMl0pfXZhciBhYz1QLmxlbmd0aDtmb3IodmFyIGFkPTA7YWQ8YWM7YWQrKyl7eShQW2FkXSl9Zm9yKHZhciBhYiBpbiBPKXtPW2FiXT1udWxsfU89bnVsbDtmb3IodmFyIGFhIGluIHN3Zm9iamVjdCl7c3dmb2JqZWN0W2FhXT1udWxsfXN3Zm9iamVjdD1udWxsfSl9fSgpO3JldHVybntyZWdpc3Rlck9iamVjdDpmdW5jdGlvbihhZSxhYSxhZCxhYyl7aWYoTy53MyYmYWUmJmFhKXt2YXIgYWI9e307YWIuaWQ9YWU7YWIuc3dmVmVyc2lvbj1hYTthYi5leHByZXNzSW5zdGFsbD1hZDthYi5jYWxsYmFja0ZuPWFjO29bby5sZW5ndGhdPWFiO3coYWUsZmFsc2UpfWVsc2V7aWYoYWMpe2FjKHtzdWNjZXNzOmZhbHNlLGlkOmFlfSl9fX0sZ2V0T2JqZWN0QnlJZDpmdW5jdGlvbihhYSl7aWYoTy53Myl7cmV0dXJuIHooYWEpfX0sZW1iZWRTV0Y6ZnVuY3Rpb24oYWYsYWwsYWksYWssYWIsYWUsYWQsYWgsYWosYWcpe3ZhciBhYz1XKGFsKSxhYT17c3VjY2VzczpmYWxzZSxpZDphY307aWYoTy53MyYmIShPLndrJiZPLndrPDMxMikmJmFmJiZhbCYmYWkmJmFrJiZhYil7dyhhYyxmYWxzZSk7TShmdW5jdGlvbigpe2FpKz1cIlwiO2FrKz1cIlwiO3ZhciBhbj17fTtpZihhaiYmdHlwZW9mIGFqPT09cil7Zm9yKHZhciBhcSBpbiBhail7YW5bYXFdPWFqW2FxXX19YW4uZGF0YT1hZjthbi53aWR0aD1haTthbi5oZWlnaHQ9YWs7dmFyIGFyPXt9O2lmKGFoJiZ0eXBlb2YgYWg9PT1yKXtmb3IodmFyIGFvIGluIGFoKXthclthb109YWhbYW9dfX1pZihhZCYmdHlwZW9mIGFkPT09cil7Zm9yKHZhciBhbSBpbiBhZCl7aWYoYWQuaGFzT3duUHJvcGVydHkoYW0pKXt2YXIgYXA9KGwpP2VuY29kZVVSSUNvbXBvbmVudChhbSk6YW0sYXQ9KGwpP2VuY29kZVVSSUNvbXBvbmVudChhZFthbV0pOmFkW2FtXTtpZih0eXBlb2YgYXIuZmxhc2h2YXJzIT1EKXthci5mbGFzaHZhcnMrPVwiJlwiK2FwK1wiPVwiK2F0fWVsc2V7YXIuZmxhc2h2YXJzPWFwK1wiPVwiK2F0fX19fWlmKEYoYWIpKXt2YXIgYXU9dShhbixhcixhbCk7aWYoYW4uaWQ9PWFjKXt3KGFjLHRydWUpfWFhLnN1Y2Nlc3M9dHJ1ZTthYS5yZWY9YXU7YWEuaWQ9YXUuaWR9ZWxzZXtpZihhZSYmQSgpKXthbi5kYXRhPWFlO1IoYW4sYXIsYWwsYWcpO3JldHVybn1lbHNle3coYWMsdHJ1ZSl9fWlmKGFnKXthZyhhYSl9fSl9ZWxzZXtpZihhZyl7YWcoYWEpfX19LHN3aXRjaE9mZkF1dG9IaWRlU2hvdzpmdW5jdGlvbigpe2o9ZmFsc2V9LGVuYWJsZVVyaUVuY29kaW5nOmZ1bmN0aW9uKGFhKXtsPSh0eXBlb2YgYWE9PT1EKT90cnVlOmFhfSx1YTpPLGdldEZsYXNoUGxheWVyVmVyc2lvbjpmdW5jdGlvbigpe3JldHVybnttYWpvcjpPLnB2WzBdLG1pbm9yOk8ucHZbMV0scmVsZWFzZTpPLnB2WzJdfX0saGFzRmxhc2hQbGF5ZXJWZXJzaW9uOkYsY3JlYXRlU1dGOmZ1bmN0aW9uKGFjLGFiLGFhKXtpZihPLnczKXtyZXR1cm4gdShhYyxhYixhYSl9ZWxzZXtyZXR1cm4gdW5kZWZpbmVkfX0sc2hvd0V4cHJlc3NJbnN0YWxsOmZ1bmN0aW9uKGFjLGFkLGFhLGFiKXtpZihPLnczJiZBKCkpe1IoYWMsYWQsYWEsYWIpfX0scmVtb3ZlU1dGOmZ1bmN0aW9uKGFhKXtpZihPLnczKXt5KGFhKX19LGNyZWF0ZUNTUzpmdW5jdGlvbihhZCxhYyxhYixhYSl7aWYoTy53Myl7dihhZCxhYyxhYixhYSl9fSxhZGREb21Mb2FkRXZlbnQ6TSxhZGRMb2FkRXZlbnQ6cyxnZXRRdWVyeVBhcmFtVmFsdWU6ZnVuY3Rpb24oYWQpe3ZhciBhYz1oLmxvY2F0aW9uLnNlYXJjaHx8aC5sb2NhdGlvbi5oYXNoO1xuaWYoYWMpe2lmKC9cXD8vLnRlc3QoYWMpKXthYz1hYy5zcGxpdChcIj9cIilbMV19aWYoYWQ9PW51bGwpe3JldHVybiBOKGFjKX12YXIgYWI9YWMuc3BsaXQoXCImXCIpO2Zvcih2YXIgYWE9MDthYTxhYi5sZW5ndGg7YWErKyl7aWYoYWJbYWFdLnN1YnN0cmluZygwLGFiW2FhXS5pbmRleE9mKFwiPVwiKSk9PWFkKXtyZXR1cm4gTihhYlthYV0uc3Vic3RyaW5nKChhYlthYV0uaW5kZXhPZihcIj1cIikrMSkpKX19fXJldHVyblwiXCJ9LGV4cHJlc3NJbnN0YWxsQ2FsbGJhY2s6ZnVuY3Rpb24oKXtpZihhKXt2YXIgYWE9YyhTKTtpZihhYSYmSSl7YWEucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQoSSxhYSk7aWYocCl7dyhwLHRydWUpO2lmKE8uaWUpe0kuc3R5bGUuZGlzcGxheT1cImJsb2NrXCJ9fWlmKEUpe0UoQil9fWE9ZmFsc2V9fSx2ZXJzaW9uOlwiMi4zXCJ9fSgpO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
