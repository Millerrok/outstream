!function(e,t){function i(e){return a()?e?(this.options=e||{},this.sdkUnique=null,this.id=Math.round((new Date).getTime()/1e4+1e7*Math.random()),this.unitSrc="http://192.168.1.130:3000/resources/libs/videejs-player.swf",this.flashVersion="10.0.0",this.params={allowScriptAccess:"always",allowFullScreen:"true",wmode:"transparent"},this.addWrapperEl(),this.initWrapper(),void this.embedSWF()):void console.error("Create without options"):void console.error("Flash Player not installed!")}function n(e,t,i,n){if(!e)throw new Error("Set aid");this.host=encodeURIComponent(window.location.host),this.cd=(new Date).getTime(),this.height=i||300,this.width=t||400,this.sid=n||0,this.aid=e}i.prototype.flashvars=function(){return{onReady:"window.VpaidflashWrappers["+this.id+"].startFlashWrapper"}},i.prototype.initWrapper=function(){try{new n(this.options.aid,this.options.width,this.options.height,this.options.sid).wrap(this.id)}catch(e){console.error(e)}},i.prototype.addWrapperEl=function(){this.sdkUnique="SdkIntegration"+this.id;var e=document.createElement("div");e.className="flash-blocker",e.innerHTML='<div id="'+this.sdkUnique+'"></div>',this.options.containerEl.appendChild(e)},i.prototype.embedSWF=function(){try{r.embedSWF(this.unitSrc,this.sdkUnique,this.options.width,this.options.height,this.flashVersion,t,this.flashvars(),this.params,{})}catch(e){console.log(e)}},i.prototype.destroy=function(){this.options.containerEl.innerHTML=""};var e=e||window;e.Outstream=i,n.prototype.wrap=function(e){var t=this.getConfig(e),i=this.width,n=this.height;window.VpaidflashWrappers||(window.VpaidflashWrappers={}),window.VpaidflashWrappers[e]={};var a=window.VpaidflashWrappers[e];a.adLoadedClosure=function(){window["SdkIntegration"+e].startAd()},a.startFlashWrapper=function(){var a=window["SdkIntegration"+e];a.width=i,a.height=n,a.loadAd(t)}},n.prototype.getConfig=function(e){var t="window.VpaidflashWrappers["+e+"]";return JSON.stringify({adLoadedClosure:t+".adLoadedClosure",volume:1,width:this.width,height:this.height,vastUrl:this.getVastUrl()})},n.prototype.getVastUrl=function(){return"http://vast.videe.tv/vast-proxy/?aid="+this.aid+"&content_page_url="+this.host+"&player_height="+this.height+"&player_width="+this.width+"&sid="+this.sid+"&cb="+this.cd};var a=function(){var e,t,i="Shockwave",n="Flash",a=i+" "+n,r=i+n+"."+i+n,o="application/x-shockwave-flash",s=navigator,l=parseFloat,d=s.plugins,c=s.mimeTypes;if(d&&"object"==typeof d[a]){if(e=d[a].description,e&&(!c||!c[o]||c[o].enabledPlugin))return l(e.replace(/^.*\s+(\S+)\s+\S+$/,"$1"))}else if(window.ActiveXObject)try{if(t=new ActiveXObject(r),t&&(e=t.GetVariable("$version")))return l(e.replace(/^\S+\s+(\d+),(\d+).*$/i,"$1.$2"))}catch(p){}return-1},r=function(){function e(){if(!J&&document.getElementsByTagName("body")[0]){try{var e,t=m("span");t.style.display="none",e=P.getElementsByTagName("body")[0].appendChild(t),e.parentNode.removeChild(e),e=null,t=null}catch(i){return}J=!0;for(var n=H.length,a=0;n>a;a++)H[a]()}}function i(e){J?e():H[H.length]=e}function n(e){if(typeof j.addEventListener!=O)j.addEventListener("load",e,!1);else if(typeof P.addEventListener!=O)P.addEventListener("load",e,!1);else if(typeof j.attachEvent!=O)S(j,"onload",e);else if("function"==typeof j.onload){var t=j.onload;j.onload=function(){t(),e()}}else j.onload=e}function a(){var e=P.getElementsByTagName("body")[0],t=m(W);t.setAttribute("style","visibility: hidden;"),t.setAttribute("type",U);var i=e.appendChild(t);if(i){var n=0;!function a(){if(typeof i.GetVariable!=O)try{var r=i.GetVariable("$version");r&&(r=r.split(" ")[1].split(","),Q.pv=[b(r[0]),b(r[1]),b(r[2])])}catch(s){Q.pv=[8,0,0]}else if(10>n)return n++,void setTimeout(a,10);e.removeChild(t),i=null,o()}()}else o()}function o(){var e=X.length;if(e>0)for(var t=0;e>t;t++){var i=X[t].id,n=X[t].callbackFn,a={success:!1,id:i};if(Q.pv[0]>0){var r=g(i);if(r)if(!C(X[t].swfVersion)||Q.wk&&Q.wk<312)if(X[t].expressInstall&&l()){var o={};o.data=X[t].expressInstall,o.width=r.getAttribute("width")||"0",o.height=r.getAttribute("height")||"0",r.getAttribute("class")&&(o.styleclass=r.getAttribute("class")),r.getAttribute("align")&&(o.align=r.getAttribute("align"));for(var p={},f=r.getElementsByTagName("param"),h=f.length,u=0;h>u;u++)"movie"!=f[u].getAttribute("name").toLowerCase()&&(p[f[u].getAttribute("name")]=f[u].getAttribute("value"));d(o,p,i,n)}else c(r),n&&n(a);else A(i,!0),n&&(a.success=!0,a.ref=s(i),a.id=i,n(a))}else if(A(i,!0),n){var v=s(i);v&&typeof v.SetVariable!=O&&(a.success=!0,a.ref=v,a.id=v.id),n(a)}}}function s(e){var t=null,i=g(e);return i&&"OBJECT"===i.nodeName.toUpperCase()&&(t=typeof i.SetVariable!==O?i:i.getElementsByTagName(W)[0]||i),t}function l(){return!_&&C("6.0.65")&&(Q.win||Q.mac)&&!(Q.wk&&Q.wk<312)}function d(e,t,i,n){var a=g(i);if(i=w(i),_=!0,L=n||null,F={success:!1,id:i},a){"OBJECT"==a.nodeName.toUpperCase()?(k=p(a),N=null):(k=a,N=i),e.id=M,(typeof e.width==O||!/%$/.test(e.width)&&b(e.width)<310)&&(e.width="310"),(typeof e.height==O||!/%$/.test(e.height)&&b(e.height)<137)&&(e.height="137");var r=Q.ie?"ActiveX":"PlugIn",o="MMredirectURL="+encodeURIComponent(j.location.toString().replace(/&/g,"%26"))+"&MMplayerType="+r+"&MMdoctitle="+encodeURIComponent(P.title.slice(0,47)+" - Flash Player Installation");if(typeof t.flashvars!=O?t.flashvars+="&"+o:t.flashvars=o,Q.ie&&4!=a.readyState){var s=m("div");i+="SWFObjectNew",s.setAttribute("id",i),a.parentNode.insertBefore(s,a),a.style.display="none",v(a)}h(e,t,i)}}function c(e){if(Q.ie&&4!=e.readyState){e.style.display="none";var t=m("div");e.parentNode.insertBefore(t,e),t.parentNode.replaceChild(p(e),t),v(e)}else e.parentNode.replaceChild(p(e),e)}function p(e){var t=m("div");if(Q.win&&Q.ie)t.innerHTML=e.innerHTML;else{var i=e.getElementsByTagName(W)[0];if(i){var n=i.childNodes;if(n)for(var a=n.length,r=0;a>r;r++)1==n[r].nodeType&&"PARAM"==n[r].nodeName||8==n[r].nodeType||t.appendChild(n[r].cloneNode(!0))}}return t}function f(e,t){var i=m("div");return i.innerHTML="<object classid='clsid:D27CDB6E-AE6D-11cf-96B8-444553540000'><param name='movie' value='"+e+"'>"+t+"</object>",i.firstChild}function h(e,t,i){var n,a=g(i);if(i=w(i),Q.wk&&Q.wk<312)return n;if(a){var r,o,s,l=m(Q.ie?"div":W);typeof e.id==O&&(e.id=i);for(s in t)t.hasOwnProperty(s)&&"movie"!==s.toLowerCase()&&u(l,s,t[s]);Q.ie&&(l=f(e.data,l.innerHTML));for(r in e)e.hasOwnProperty(r)&&(o=r.toLowerCase(),"styleclass"===o?l.setAttribute("class",e[r]):"classid"!==o&&"data"!==o&&l.setAttribute(r,e[r]));Q.ie?q[q.length]=e.id:(l.setAttribute("type",U),l.setAttribute("data",e.data)),a.parentNode.replaceChild(l,a),n=l}return n}function u(e,t,i){var n=m("param");n.setAttribute("name",t),n.setAttribute("value",i),e.appendChild(n)}function v(e){var t=g(e);t&&"OBJECT"==t.nodeName.toUpperCase()&&(Q.ie?(t.style.display="none",function i(){if(4==t.readyState){for(var e in t)"function"==typeof t[e]&&(t[e]=null);t.parentNode.removeChild(t)}else setTimeout(i,10)}()):t.parentNode.removeChild(t))}function y(e){return e&&e.nodeType&&1===e.nodeType}function w(e){return y(e)?e.id:e}function g(e){if(y(e))return e;var t=null;try{t=P.getElementById(e)}catch(i){}return t}function m(e){return P.createElement(e)}function b(e){return parseInt(e,10)}function S(e,t,i){e.attachEvent(t,i),G[G.length]=[e,t,i]}function C(e){e+="";var t=Q.pv,i=e.split(".");return i[0]=b(i[0]),i[1]=b(i[1])||0,i[2]=b(i[2])||0,t[0]>i[0]||t[0]==i[0]&&t[1]>i[1]||t[0]==i[0]&&t[1]==i[1]&&t[2]>=i[2]}function E(e,t,i,n){var a=P.getElementsByTagName("head")[0];if(a){var r="string"==typeof i?i:"screen";if(n&&(I=null,V=null),!I||V!=r){var o=m("style");o.setAttribute("type","text/css"),o.setAttribute("media",r),I=a.appendChild(o),Q.ie&&typeof P.styleSheets!=O&&P.styleSheets.length>0&&(I=P.styleSheets[P.styleSheets.length-1]),V=r}I&&(typeof I.addRule!=O?I.addRule(e,t):typeof P.createTextNode!=O&&I.appendChild(P.createTextNode(e+" {"+t+"}")))}}function A(e,t){if(z){var i=t?"visible":"hidden",n=g(e);J&&n?n.style.visibility=i:"string"==typeof e&&E("#"+e,"visibility:"+i)}}function T(e){var t=/[\\\"<>\.;]/,i=null!=t.exec(e);return i&&typeof encodeURIComponent!=O?encodeURIComponent(e):e}var k,N,L,F,I,V,O="undefined",W="object",$="Shockwave Flash",B="ShockwaveFlash.ShockwaveFlash",U="application/x-shockwave-flash",M="SWFObjectExprInst",x="onreadystatechange",j=window,P=document,R=navigator,D=!1,H=[],X=[],q=[],G=[],J=!1,_=!1,z=!0,Z=!1,Q=function(){var e=typeof P.getElementById!=O&&typeof P.getElementsByTagName!=O&&typeof P.createElement!=O,t=R.userAgent.toLowerCase(),i=R.platform.toLowerCase(),n=i?/win/.test(i):/win/.test(t),a=i?/mac/.test(i):/mac/.test(t),r=/webkit/.test(t)?parseFloat(t.replace(/^.*webkit\/(\d+(\.\d+)?).*$/,"$1")):!1,o="Microsoft Internet Explorer"===R.appName,s=[0,0,0],l=null;if(typeof R.plugins!=O&&typeof R.plugins[$]==W)l=R.plugins[$].description,l&&typeof R.mimeTypes!=O&&R.mimeTypes[U]&&R.mimeTypes[U].enabledPlugin&&(D=!0,o=!1,l=l.replace(/^.*\s+(\S+\s+\S+$)/,"$1"),s[0]=b(l.replace(/^(.*)\..*$/,"$1")),s[1]=b(l.replace(/^.*\.(.*)\s.*$/,"$1")),s[2]=/[a-zA-Z]/.test(l)?b(l.replace(/^.*[a-zA-Z]+(.*)$/,"$1")):0);else if(typeof j.ActiveXObject!=O)try{var d=new ActiveXObject(B);d&&(l=d.GetVariable("$version"),l&&(o=!0,l=l.split(" ")[1].split(","),s=[b(l[0]),b(l[1]),b(l[2])]))}catch(c){}return{w3:e,pv:s,wk:r,ie:o,win:n,mac:a}}();(function(){Q.w3&&((typeof P.readyState!=O&&("complete"===P.readyState||"interactive"===P.readyState)||typeof P.readyState==O&&(P.getElementsByTagName("body")[0]||P.body))&&e(),J||(typeof P.addEventListener!=O&&P.addEventListener("DOMContentLoaded",e,!1),Q.ie&&(P.attachEvent(x,function t(){"complete"==P.readyState&&(P.detachEvent(x,t),e())}),j==top&&!function i(){if(!J){try{P.documentElement.doScroll("left")}catch(t){return void setTimeout(i,0)}e()}}()),Q.wk&&!function n(){return J?void 0:/loaded|complete/.test(P.readyState)?void e():void setTimeout(n,0)}()))})();H[0]=function(){D?a():o()};(function(){Q.ie&&window.attachEvent("onunload",function(){for(var e=G.length,t=0;e>t;t++)G[t][0].detachEvent(G[t][1],G[t][2]);for(var i=q.length,n=0;i>n;n++)v(q[n]);for(var a in Q)Q[a]=null;Q=null;for(var o in r)r[o]=null;r=null})})();return{registerObject:function(e,t,i,n){if(Q.w3&&e&&t){var a={};a.id=e,a.swfVersion=t,a.expressInstall=i,a.callbackFn=n,X[X.length]=a,A(e,!1)}else n&&n({success:!1,id:e})},getObjectById:function(e){return Q.w3?s(e):void 0},embedSWF:function(e,t,n,a,r,o,s,c,p,f){var u=w(t),v={success:!1,id:u};Q.w3&&!(Q.wk&&Q.wk<312)&&e&&t&&n&&a&&r?(A(u,!1),i(function(){n+="",a+="";var i={};if(p&&typeof p===W)for(var y in p)i[y]=p[y];i.data=e,i.width=n,i.height=a;var w={};if(c&&typeof c===W)for(var g in c)w[g]=c[g];if(s&&typeof s===W)for(var m in s)if(s.hasOwnProperty(m)){var b=Z?encodeURIComponent(m):m,S=Z?encodeURIComponent(s[m]):s[m];typeof w.flashvars!=O?w.flashvars+="&"+b+"="+S:w.flashvars=b+"="+S}if(C(r)){var E=h(i,w,t);i.id==u&&A(u,!0),v.success=!0,v.ref=E,v.id=E.id}else{if(o&&l())return i.data=o,void d(i,w,t,f);A(u,!0)}f&&f(v)})):f&&f(v)},switchOffAutoHideShow:function(){z=!1},enableUriEncoding:function(e){Z=typeof e===O?!0:e},ua:Q,getFlashPlayerVersion:function(){return{major:Q.pv[0],minor:Q.pv[1],release:Q.pv[2]}},hasFlashPlayerVersion:C,createSWF:function(e,i,n){return Q.w3?h(e,i,n):t},showExpressInstall:function(e,t,i,n){Q.w3&&l()&&d(e,t,i,n)},removeSWF:function(e){Q.w3&&v(e)},createCSS:function(e,t,i,n){Q.w3&&E(e,t,i,n)},addDomLoadEvent:i,addLoadEvent:n,getQueryParamValue:function(e){var t=P.location.search||P.location.hash;if(t){if(/\?/.test(t)&&(t=t.split("?")[1]),null==e)return T(t);for(var i=t.split("&"),n=0;n<i.length;n++)if(i[n].substring(0,i[n].indexOf("="))==e)return T(i[n].substring(i[n].indexOf("=")+1))}return""},expressInstallCallback:function(){if(_){var e=g(M);e&&k&&(e.parentNode.replaceChild(k,e),N&&(A(N,!0),Q.ie&&(k.style.display="block")),L&&L(F)),_=!1}},version:"2.3"}}()}(window);