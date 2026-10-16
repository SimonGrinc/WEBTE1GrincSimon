!function(e,t,n){"function"==typeof define&&define.amd?define(["jquery"],(function(i){return n(i,e,t),i.mobile})):n(e.jQuery,e,t)}(this,document,(function(e,t,n,i){
/*!
 * jQuery Mobile Namespace @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
var o;o=function(e){return e.mobile={version:"@VERSION"},e.mobile},"function"==typeof define&&define.amd?define("ns",["jquery"],o):o(e),
/*!
 * jQuery Mobile Defaults @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("defaults",["jquery","./ns"],t):t(e)}((function(e){return e.extend(e.mobile,{hideUrlBar:!0,keepNative:":jqmData(role='none'), :jqmData(role='nojs')",ajaxEnabled:!0,hashListeningEnabled:!0,linkBindingEnabled:!0,defaultPageTransition:"fade",maxTransitionWidth:!1,defaultDialogTransition:"pop",pageLoadErrorMessage:"Error Loading Page",pageLoadErrorMessageTheme:"a",phonegapNavigationEnabled:!1,autoInitializePage:!0,pushStateEnabled:!0,ignoreContentEnabled:!1,pageContainer:e(),allowCrossDomainPages:!1,dialogHashKey:"&ui-state=dialog"})})),
/*!
 * jQuery Mobile Data @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("data",["jquery","./ns"],t):t(e)}((function(e){var n={},o=e.find,a=/(?:\{[\s\S]*\}|\[[\s\S]*\])$/,r=/:jqmData\(([^)]*)\)/g;return e.extend(e.mobile,{ns:!1===e.mobileBackcompat?"ui-":"",getAttribute:function(n,i){var o;(n=n.jquery?n[0]:n)&&n.getAttribute&&(o=n.getAttribute("data-"+e.mobile.ns+i));try{o="true"===o||"false"!==o&&("null"===o?null:+o+""===o?+o:a.test(o)?t.JSON.parse(o):o)}catch(e){}return o},nsNormalizeDict:n,nsNormalize:function(t){return n[t]||(n[t]=e.camelCase(e.mobile.ns+t))},closestPageData:function(e){return e.closest(":jqmData(role='page'), :jqmData(role='dialog')").data("mobile-page")}}),e.fn.jqmData=function(t,n){var o;return void 0!==t&&(t&&(t=e.mobile.nsNormalize(t)),o=arguments.length<2||n===i?this.data(t):this.data(t,n)),o},e.jqmData=function(t,n,i){var o;return void 0!==n&&(o=e.data(t,n?e.mobile.nsNormalize(n):n,i)),o},e.fn.jqmRemoveData=function(t){return this.removeData(e.mobile.nsNormalize(t))},e.jqmRemoveData=function(t,n){return e.removeData(t,e.mobile.nsNormalize(n))},e.find=function(t,n,i,a){return t.indexOf(":jqmData")>-1&&(t=t.replace(r,"[data-"+(e.mobile.ns||"")+"$1]")),o.call(this,t,n,i,a)},e.extend(e.find,o),e.mobile})),function(t){"function"==typeof define&&define.amd?define("jquery-ui/version",["jquery"],t):t(e)}((function(e){return e.ui=e.ui||{},e.ui.version="1.12.1"})),
/*!
 * jQuery UI Keycode 1.12.1
 * http://jqueryui.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("jquery-ui/keycode",["jquery","./version"],t):t(e)}((function(e){return e.ui.keyCode={BACKSPACE:8,COMMA:188,DELETE:46,DOWN:40,END:35,ENTER:13,ESCAPE:27,HOME:36,LEFT:37,PAGE_DOWN:34,PAGE_UP:33,PERIOD:190,RIGHT:39,SPACE:32,TAB:9,UP:38}})),
/*!
 * jQuery Mobile Helpers @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("helpers",["jquery","./ns","jquery-ui/keycode"],t):t(e)}((function(e){return e.extend(e.mobile,{window:e(t),document:e(n),keyCode:e.ui.keyCode,behaviors:{},focusPage:function(e){var t=e.find("[autofocus]");t.length||(t=e.find(".ui-title").eq(0)),t.length||(t=e),t.focus()},silentScroll:function(n){e.mobile.window.scrollTop()>0||("number"!==e.type(n)&&(n=e.mobile.defaultHomeScroll),e.event.special.scrollstart.enabled=!1,setTimeout((function(){t.scrollTo(0,n),e.mobile.document.trigger("silentscroll",{x:0,y:n})}),20),setTimeout((function(){e.event.special.scrollstart.enabled=!0}),150))},getClosestBaseUrl:function(t){var n=e(t).closest(".ui-page").jqmData("url"),i=e.mobile.path.documentBase.hrefNoHash;return e.mobile.base.dynamicBaseEnabled&&n&&e.mobile.path.isPath(n)||(n=i),e.mobile.path.makeUrlAbsolute(n,i)},removeActiveLinkClass:function(t){!e.mobile.activeClickedLink||e.mobile.activeClickedLink.closest(".ui-page-active").length&&!t||e.mobile.activeClickedLink.removeClass("ui-button-active"),e.mobile.activeClickedLink=null},enhanceable:function(e){return this.haveParents(e,"enhance")},hijackable:function(e){return this.haveParents(e,"ajax")},haveParents:function(t,n){if(!e.mobile.ignoreContentEnabled)return t;var i,o,a,r,s=t.length,u=e();for(r=0;r<s;r++){for(o=t.eq(r),a=!1,i=t[r];i;){if("false"===(i.getAttribute?i.getAttribute("data-"+e.mobile.ns+n):"")){a=!0;break}i=i.parentNode}a||(u=u.add(o))}return u},getScreenHeight:function(){return t.innerHeight||e.mobile.window.height()},resetActivePageHeight:function(n){var i=e(".ui-page-active"),o=i.height(),a=i.outerHeight(!0);n=function(t,n){var i=t.parent(),o=[],a=function(){var t=e(this),n=e.mobile.toolbar&&t.data("mobile-toolbar")?t.toolbar("option"):{position:t.attr("data-"+e.mobile.ns+"position"),updatePagePadding:!1!==t.attr("data-"+e.mobile.ns+"update-page-padding")};return!("fixed"===n.position&&!0===n.updatePagePadding)},r=i.children(":jqmData(type='header')").filter(a),s=t.children(":jqmData(type='header')"),u=i.children(":jqmData(type='footer')").filter(a),c=t.children(":jqmData(type='footer')");return 0===s.length&&r.length>0&&(o=o.concat(r.toArray())),0===c.length&&u.length>0&&(o=o.concat(u.toArray())),e.each(o,(function(t,i){n-=e(i).outerHeight()})),Math.max(0,n)}(i,"number"==typeof n?n:e(t).height()),i.css("min-height",""),i.height()<n&&i.css("min-height",n-(a-o))},loading:function(){var t=this.loading._widget||e.mobile.loader().element,n=t.loader.apply(t,arguments);return this.loading._widget=t,n},isElementCurrentlyVisible:function(i){if(!(i="string"==typeof i?e(i)[0]:i[0]))return!0;var o=i.getBoundingClientRect();return o.bottom>0&&o.right>0&&o.top<(t.innerHeight||n.documentElement.clientHeight)&&o.left<(t.innerWidth||n.documentElement.clientWidth)}}),e.addDependents=function(t,n){var i=e(t),o=i.jqmData("dependents")||e();i.jqmData("dependents",e(o).add(n))},e.fn.extend({removeWithDependents:function(){e.removeWithDependents(this)},addDependents:function(t){e.addDependents(this,t)},getEncodedText:function(){return e("<a>").text(this.text()).html()},jqmEnhanceable:function(){return e.mobile.enhanceable(this)},jqmHijackable:function(){return e.mobile.hijackable(this)}}),e.removeWithDependents=function(t){var n=e(t);(n.jqmData("dependents")||e()).remove(),n.remove()},e.addDependents=function(t,n){var i=e(t),o=i.jqmData("dependents")||e();i.jqmData("dependents",e(o).add(n))},e.find.matches=function(t,n){return e.find(t,null,null,n)},e.find.matchesSelector=function(t,n){return e.find(n,null,null,[t]).length>0},e.mobile})),
/*!
 * jQuery Mobile Core @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(e){"function"==typeof define&&define.amd&&define("core",["./defaults","./data","./helpers"],e)}((function(){})),
/*!
 * jQuery Mobile Match Media Polyfill @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("media",["jquery","./core"],t):t(e)}((function(e){var i,o,a,r,s,u;
/*! matchMedia() polyfill - Test a CSS media type/query in JS. Authors & copyright (c) 2012: Scott Jehl, Paul Irish, Nicholas Zakas. Dual MIT/BSD license */
return t.matchMedia=t.matchMedia||(a=(i=n).documentElement,r=a.firstElementChild||a.firstChild,s=i.createElement("body"),(u=i.createElement("div")).id="mq-test-1",u.style.cssText="position:absolute;top:-100em",s.style.background="none",s.appendChild(u),function(e){return u.innerHTML='&shy;<style media="'+e+'"> #mq-test-1 { width: 42px; }</style>',a.insertBefore(s,r),o=42===u.offsetWidth,a.removeChild(s),{matches:o,media:e}}),e.mobile.media=function(e){var n=t.matchMedia(e);return n&&n.matches},e.mobile.media})),
/*!
 * jQuery Mobile Touch Support Test @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("support/touch",["jquery","../ns"],t):t(e)}((function(e){var t={touch:"ontouchend"in n};return e.mobile.support=e.mobile.support||{},e.extend(e.support,t),e.extend(e.mobile.support,t),e.support})),
/*!
 * jQuery Mobile Orientation @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("support/orientation",["jquery"],t):t(e)}((function(e){return e.extend(e.support,{orientation:"orientation"in t&&"onorientationchange"in t}),e.support})),
/*!
 * jQuery Mobile Support Tests @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("support",["jquery","./core","./media","./support/touch","./support/orientation"],t):t(e)}((function(e){var o,a=e("<body>").prependTo("html"),r=a[0].style,s=["Webkit","Moz","O"],u="palmGetResource"in t,c=t.operamini&&"[object OperaMini]"==={}.toString.call(t.operamini);function l(e){var t,n=e.charAt(0).toUpperCase()+e.substr(1),o=(e+" "+s.join(n+" ")+n).split(" ");for(t in o)if(r[o[t]]!==i)return!0}var d,f,p,h,m,v,g,b,y,w,E,T,D,x,j=t.blackberry&&!l("-webkit-transform");return e.extend(e.mobile,{browser:{}}),e.mobile.browser.oldIE=function(){var e=3,t=n.createElement("div"),i=t.all||[];do{t.innerHTML="\x3c!--[if gt IE "+ ++e+"]><br><![endif]--\x3e"}while(i[0]);return e>4?e:!e}(),e.mobile.browser.newIEMobile=(d=n.createElement("div"),!e.mobile.browser.oldIE&&"onmsgesturehold"in d&&"ontouchstart"in d&&"onpointerdown"in d),e.extend(e.support,{pushState:"pushState"in history&&"replaceState"in history&&!(t.navigator.userAgent.indexOf("Firefox")>=0&&t.top!==t)&&-1===t.navigator.userAgent.search(/CriOS/),mediaquery:e.mobile.media("only all"),cssPseudoElement:!!l("content"),touchOverflow:!!l("overflowScrolling"),cssTransform3d:function(){var o,r,u,c="transform-3d",l=e.mobile.media("(-"+s.join("-"+c+"),(-")+"-"+c+"),("+c+")");if(l)return!!l;for(u in o=n.createElement("div"),r={MozTransform:"-moz-transform",transform:"transform"},a.append(o),r)o.style[u]!==i&&(o.style[u]="translate3d( 100px, 1px, 1px )",l=t.getComputedStyle(o).getPropertyValue(r[u]));return!!l&&"none"!==l}(),boxShadow:!!l("boxShadow")&&!j,fixedPosition:(v=t,g=navigator.userAgent,b=navigator.platform,y=g.match(/AppleWebKit\/([0-9]+)/),w=!!y&&y[1],E=g.match(/Fennec\/([0-9]+)/),T=!!E&&E[1],D=g.match(/Opera Mobi\/([0-9]+)/),x=!!D&&D[1],!((b.indexOf("iPhone")>-1||b.indexOf("iPad")>-1||b.indexOf("iPod")>-1)&&w&&w<534||v.operamini&&"[object OperaMini]"==={}.toString.call(v.operamini)||D&&x<7458||g.indexOf("Android")>-1&&w&&w<533||T&&T<6||"palmGetResource"in t&&w&&w<534||g.indexOf("MeeGo")>-1&&g.indexOf("NokiaBrowser/8.5.0")>-1)),scrollTop:("pageXOffset"in t||"scrollTop"in n.documentElement||"scrollTop"in a[0])&&!u&&!c,cssPointerEvents:(p=n.createElement("x"),h=n.documentElement,m=t.getComputedStyle,"pointerEvents"in p.style&&(p.style.pointerEvents="auto",p.style.pointerEvents="x",h.appendChild(p),f=m&&"auto"===m(p,"").pointerEvents,h.removeChild(p),!!f)),boundingRect:void 0!==n.createElement("div").getBoundingClientRect,inlineSVG:function(){var n=t,i=!(!n.document.createElementNS||!n.document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect||n.opera&&-1===navigator.userAgent.indexOf("Chrome")),o=function(t){t&&i||e("html").addClass("ui-nosvg")},a=new n.Image;a.onerror=function(){o(!1)},a.onload=function(){o(1===a.width&&1===a.height)},a.src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw=="}}),a.remove(),o=function(){var e=t.navigator.userAgent;return e.indexOf("Nokia")>-1&&(e.indexOf("Symbian/3")>-1||e.indexOf("Series60/5")>-1)&&e.indexOf("AppleWebKit")>-1&&e.match(/(BrowserNG|NokiaBrowser)\/7\.[0-3]/)}(),e.mobile.gradeA=function(){return(e.support.mediaquery&&e.support.cssPseudoElement||e.mobile.browser.oldIE&&e.mobile.browser.oldIE>=8)&&(e.support.boundingRect||null!==e.fn.jquery.match(/1\.[0-7+]\.[0-9+]?/))},e.mobile.ajaxBlacklist=t.blackberry&&!t.WebKitPoint||c||o,o&&e((function(){e("head link[rel='stylesheet']").attr("rel","alternate stylesheet").attr("rel","stylesheet")})),e.support.boxShadow||e("html").addClass("ui-noboxshadow"),e.support})),
/*!
 * jQuery Mobile Navigate Event @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("events/navigate",["jquery","./../ns","./../support"],t):t(e)}((function(e){var t,n=e.mobile.window,o=function(){};return e.event.special.beforenavigate={setup:function(){n.on("navigate",o)},teardown:function(){n.off("navigate",o)}},e.event.special.navigate=t={bound:!1,pushStateEnabled:!0,originalEventName:i,isPushStateEnabled:function(){return e.support.pushState&&!0===e.mobile.pushStateEnabled&&this.isHashChangeEnabled()},isHashChangeEnabled:function(){return!0===e.mobile.hashListeningEnabled},popstate:function(t){var i,o,a;t.isDefaultPrevented()||(i=new e.Event("navigate"),o=new e.Event("beforenavigate"),a=t.originalEvent.state||{},o.originalEvent=t,n.trigger(o),o.isDefaultPrevented()||(t.historyState&&e.extend(a,t.historyState),i.originalEvent=t,setTimeout((function(){n.trigger(i,{state:a})}),0)))},hashchange:function(t){var i=new e.Event("navigate"),o=new e.Event("beforenavigate");o.originalEvent=t,n.trigger(o),o.isDefaultPrevented()||(i.originalEvent=t,n.trigger(i,{state:t.hashchangeState||{}}))},setup:function(){t.bound||(t.bound=!0,t.isPushStateEnabled()?(t.originalEventName="popstate",n.bind("popstate.navigate",t.popstate)):t.isHashChangeEnabled()&&(t.originalEventName="hashchange",n.bind("hashchange.navigate",t.hashchange)))}},e.event.special.navigate})),
/*!
 * jQuery Mobile Virtual Mouse @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("vmouse",["jquery"],t):t(e)}((function(e){var t,o,a="virtualMouseBindings",r="virtualTouchID",s="clientX clientY pageX pageY screenX screenY".split(" "),u="vmouseover vmousedown vmousemove vmouseup vclick vmouseout vmousecancel".split(" "),c="altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),l=e.event.mouseHooks?e.event.mouseHooks.props:[],d=c.concat(l),f={},p=0,h=0,m=0,v=!1,g=[],b=!1,y=!1,w="addEventListener"in n,E=e(n),T=1,D=0;function x(e){for(;e&&void 0!==e.originalEvent;)e=e.originalEvent;return e}function j(t){for(var n,i,o={};t;){for(i in n=e.data(t,a))n[i]&&(o[i]=o.hasVirtualBinding=!0);t=t.parentNode}return o}function P(){y=!0}function q(){D=0,g.length=0,b=!1,P()}function A(){y=!1}function k(){p&&(clearTimeout(p),p=0)}function S(){k(),p=setTimeout((function(){p=0,q()}),e.vmouse.resetTimerDuration)}function C(t,n,o){var r;return(o&&o[t]||!o&&function(t,n){for(var i;t;){if((i=e.data(t,a))&&(!n||i[n]))return t;t=t.parentNode}return null}(n.target,t))&&(r=function(t,n){var o,a,r,u,l,f,p,h,m,v=t.type;if((t=e.Event(t)).type=n,o=t.originalEvent,a=c,v.search(/^(mouse|click)/)>-1&&(a=d),o)for(p=a.length;p;)t[u=a[--p]]=o[u];if(v.search(/mouse(down|up)|click/)>-1&&!t.which&&(t.which=1),-1!==v.search(/^touch/)&&(v=(r=x(o)).touches,l=r.changedTouches,f=v&&v.length?v[0]:l&&l.length?l[0]:i))for(h=0,m=s.length;h<m;h++)t[u=s[h]]=f[u];return t}(n,t),e(n.target).trigger(r)),r}function O(t){var n,i=e.data(t.target,r);"click"===t.type&&"touchstart"===e.data(t.target,"lastTouchType")&&setTimeout((function(){"touchstart"===e.data(t.target,"lastTouchType")&&(q(),delete e.data(t.target).lastTouchType,O(t))}),e.vmouse.maximumTimeBetweenTouches),b||D&&D===i||(n=C("v"+t.type,t))&&(n.isDefaultPrevented()&&t.preventDefault(),n.isPropagationStopped()&&t.stopPropagation(),n.isImmediatePropagationStopped()&&t.stopImmediatePropagation())}function M(t){var n,i,o,a=x(t).touches;a&&1===a.length&&(i=j(n=t.target),e.data(t.target,"lastTouchType",t.type),i.hasVirtualBinding&&(D=T++,e.data(n,r,D),k(),A(),v=!1,o=x(t).touches[0],h=o.pageX,m=o.pageY,C("vmouseover",t,i),C("vmousedown",t,i)))}function N(t){y||(v||C("vmousecancel",t,j(t.target)),e.data(t.target,"lastTouchType",t.type),v=!0,S())}function B(t){if(!y){var n=x(t).touches[0],i=v,o=e.vmouse.moveDistanceThreshold,a=j(t.target);e.data(t.target,"lastTouchType",t.type),(v=v||Math.abs(n.pageX-h)>o||Math.abs(n.pageY-m)>o)&&!i&&C("vmousecancel",t,a),C("vmousemove",t,a),S()}}function H(t){if(!y&&e.data(t.target,"lastTouchType")!==i){P(),delete e.data(t.target).lastTouchType;var n,o,a=j(t.target);C("vmouseup",t,a),v||(n=C("vclick",t,a))&&n.isDefaultPrevented()&&(o=x(t).changedTouches[0],g.push({touchID:D,x:o.clientX,y:o.clientY}),b=!0),C("vmouseout",t,a),v=!1,S()}}function I(t){var n,i=e.data(t,a);if(i)for(n in i)if(i[n])return!0;return!1}function z(){}function L(t){var n=t.substr(1);return{setup:function(){I(this)||e.data(this,a,{}),e.data(this,a)[t]=!0,f[t]=(f[t]||0)+1,1===f[t]&&E.bind(n,O),e(this).bind(n,z),w&&(f.touchstart=(f.touchstart||0)+1,1===f.touchstart&&E.bind("touchstart",M).bind("touchend",H).bind("touchmove",B).bind("scroll",N))},teardown:function(){--f[t],f[t]||E.unbind(n,O),w&&(--f.touchstart,f.touchstart||E.unbind("touchstart",M).unbind("touchmove",B).unbind("touchend",H).unbind("scroll",N));var i=e(this),o=e.data(this,a);o&&(o[t]=!1),i.unbind(n,z),I(this)||i.removeData(a)}}}for(e.vmouse={moveDistanceThreshold:10,clickDistanceThreshold:10,resetTimerDuration:1500,maximumTimeBetweenTouches:100},o=0;o<u.length;o++)e.event.special[u[o]]=L(u[o]);w&&n.addEventListener("click",(function(n){var i,o,a,s,u,c=g.length,l=n.target;if(c)for(i=n.clientX,o=n.clientY,t=e.vmouse.clickDistanceThreshold,a=l;a;){for(s=0;s<c;s++)if(u=g[s],0,a===l&&Math.abs(u.x-i)<t&&Math.abs(u.y-o)<t||e.data(a,r)===u.touchID)return n.preventDefault(),void n.stopPropagation();a=a.parentNode}}),!0)})),
/*!
 * jQuery Mobile Touch Events @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("events/touch",["jquery","../vmouse","../support/touch"],t):t(e)}((function(e){var o=e(n),a=e.mobile.support.touch,r=a?"touchstart":"mousedown",s=a?"touchend":"mouseup",u=a?"touchmove":"mousemove";function c(t,n,o,a){var r=o.type;o.type=n,a?e.event.trigger(o,i,t):e.event.dispatch.call(t,o),o.type=r}return e.each("touchstart touchmove touchend tap taphold swipe swipeleft swiperight".split(" "),(function(t,n){e.fn[n]=function(e){return e?this.bind(n,e):this.trigger(n)},e.attrFn&&(e.attrFn[n]=!0)})),e.event.special.tap={tapholdThreshold:750,emitTapOnTaphold:!0,setup:function(){var t=this,n=e(t),i=!1;n.bind("vmousedown",(function(a){if(i=!1,a.which&&1!==a.which)return!0;var r,s,u=a.target;function l(){r&&(n.bind("vclick",s),clearTimeout(r))}function d(){l(),n.unbind("vclick",s).unbind("vmouseup",l),o.unbind("vmousecancel",d)}s=function(e){d(),i||u!==e.target?i&&e.preventDefault():c(t,"tap",e)},n.bind("vmouseup",l),o.bind("vmousecancel",d),r=setTimeout((function(){e.event.special.tap.emitTapOnTaphold||(i=!0),r=0,c(t,"taphold",e.Event("taphold",{target:u}))}),e.event.special.tap.tapholdThreshold)}))},teardown:function(){e(this).unbind("vmousedown").unbind("vclick").unbind("vmouseup"),o.unbind("vmousecancel")}},e.event.special.swipe={scrollSupressionThreshold:30,durationThreshold:1e3,horizontalDistanceThreshold:t.devicePixelRatio>=2?15:30,verticalDistanceThreshold:t.devicePixelRatio>=2?15:30,getLocation:function(e){var n=t.pageXOffset,i=t.pageYOffset,o=e.clientX,a=e.clientY;return 0===e.pageY&&Math.floor(a)>Math.floor(e.pageY)||0===e.pageX&&Math.floor(o)>Math.floor(e.pageX)?(o-=n,a-=i):(a<e.pageY-i||o<e.pageX-n)&&(o=e.pageX-n,a=e.pageY-i),{x:o,y:a}},start:function(t){var n=t.originalEvent.touches?t.originalEvent.touches[0]:t,i=e.event.special.swipe.getLocation(n);return{time:(new Date).getTime(),coords:[i.x,i.y],origin:e(t.target)}},stop:function(t){var n=t.originalEvent.touches?t.originalEvent.touches[0]:t,i=e.event.special.swipe.getLocation(n);return{time:(new Date).getTime(),coords:[i.x,i.y]}},handleSwipe:function(t,n,i,o){if(n.time-t.time<e.event.special.swipe.durationThreshold&&Math.abs(t.coords[0]-n.coords[0])>e.event.special.swipe.horizontalDistanceThreshold&&Math.abs(t.coords[1]-n.coords[1])<e.event.special.swipe.verticalDistanceThreshold){var a=t.coords[0]>n.coords[0]?"swipeleft":"swiperight";return c(i,"swipe",e.Event("swipe",{target:o,swipestart:t,swipestop:n}),!0),c(i,a,e.Event(a,{target:o,swipestart:t,swipestop:n}),!0),!0}return!1},eventInProgress:!1,setup:function(){var t,n=this,i=e(n),a={};(t=e.data(this,"mobile-events"))||(t={length:0},e.data(this,"mobile-events",t)),t.length++,t.swipe=a,a.start=function(t){if(!e.event.special.swipe.eventInProgress){e.event.special.swipe.eventInProgress=!0;var i,r=e.event.special.swipe.start(t),c=t.target,l=!1;a.move=function(t){r&&!t.isDefaultPrevented()&&(i=e.event.special.swipe.stop(t),l||(l=e.event.special.swipe.handleSwipe(r,i,n,c))&&(e.event.special.swipe.eventInProgress=!1),Math.abs(r.coords[0]-i.coords[0])>e.event.special.swipe.scrollSupressionThreshold&&t.preventDefault())},a.stop=function(){l=!0,e.event.special.swipe.eventInProgress=!1,o.off(u,a.move),a.move=null},o.on(u,a.move).one(s,a.stop)}},i.on(r,a.start)},teardown:function(){var t,n;(t=e.data(this,"mobile-events"))&&(n=t.swipe,delete t.swipe,t.length--,0===t.length&&e.removeData(this,"mobile-events")),n&&(n.start&&e(this).off(r,n.start),n.move&&o.off(u,n.move),n.stop&&o.off(s,n.stop))}},e.each({taphold:"tap",swipeleft:"swipe.left",swiperight:"swipe.right"},(function(t,n){e.event.special[t]={setup:function(){e(this).bind(n,e.noop)},teardown:function(){e(this).unbind(n)}}})),e.event.special})),
/*!
 * jQuery Mobile Scroll Events @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("events/scroll",["jquery"],t):t(e)}((function(e){var t="touchmove scroll";return e.each(["scrollstart","scrollstop"],(function(t,n){e.fn[n]=function(e){return e?this.bind(n,e):this.trigger(n)},e.attrFn&&(e.attrFn[n]=!0)})),e.event.special.scrollstart={enabled:!0,setup:function(){var n,i,o=this,a=e(o);function r(t,i){var a=t.type;n=i,t.type=n?"scrollstart":"scrollstop",e.event.dispatch.call(o,t),t.type=a}var s=e.event.special.scrollstart.handler=function(t){e.event.special.scrollstart.enabled&&(n||r(t,!0),clearTimeout(i),i=setTimeout((function(){r(t,!1)}),50))};a.on(t,s)},teardown:function(){e(this).off(t,e.event.special.scrollstart.handler)}},e.each({scrollstop:"scrollstart"},(function(t,n){e.event.special[t]={setup:function(){e(this).bind(n,e.noop)},teardown:function(){e(this).unbind(n)}}})),e.event.special})),
/*!
 * jQuery Mobile Throttled Resize @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("events/throttledresize",["jquery"],t):t(e)}((function(e){var t,n,i,o=0,a=function(){n=(new Date).getTime(),(i=n-o)>=250?(o=n,e(this).trigger("throttledresize")):(t&&clearTimeout(t),t=setTimeout(a,250-i))};return e.event.special.throttledresize={setup:function(){e(this).bind("resize",a)},teardown:function(){e(this).unbind("resize",a)}},e.event.special.throttledresize})),
/*!
 * jQuery Mobile Orientation Change Event @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(t){"function"==typeof define&&define.amd?define("events/orientationchange",["jquery","../support/orientation","./throttledresize"],t):t(e)}((function(e){var i,o,a,r,s,u,c=e(t),l="orientationchange",d={0:!0,180:!0};function f(){var e=i();e!==o&&(o=e,c.trigger(l))}return e.support.orientation&&(50,a=(s=t.innerWidth||c.width())>(u=t.innerHeight||c.height())&&s-u>50,r=d[t.orientation],(a&&r||!a&&!r)&&(d={"-90":!0,90:!0})),e.event.special.orientationchange=e.extend({},e.event.special.orientationchange,{setup:function(){if(e.support.orientation&&!e.event.special.orientationchange.disabled)return!1;o=i(),c.bind("throttledresize",f)},teardown:function(){if(e.support.orientation&&!e.event.special.orientationchange.disabled)return!1;c.unbind("throttledresize",f)},add:function(e){var t=e.handler;e.handler=function(e){return e.orientation=i(),t.apply(this,arguments)}}}),e.event.special.orientationchange.orientation=i=function(){var i=n.documentElement;return(e.support.orientation?d[t.orientation]:i&&i.clientWidth/i.clientHeight<1.1)?"portrait":"landscape"},e.fn[l]=function(e){return e?this.bind(l,e):this.trigger(l)},e.attrFn&&(e.attrFn[l]=!0),e.event.special})),
/*!
 * jQuery Mobile Events @VERSION
 * http://jquerymobile.com
 *
 * Copyright jQuery Foundation and other contributors
 * Released under the MIT license.
 * http://jquery.org/license
 */
function(e){"function"==typeof define&&define.amd&&define("events",["jquery","./events/navigate","./events/touch","./events/scroll","./events/orientationchange"],e)}((function(){}))}));