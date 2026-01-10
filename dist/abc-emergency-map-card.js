function t(t,e,i,o){var n,r=arguments.length,s=r<3?e:null===o?o=Object.getOwnPropertyDescriptor(e,i):o;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)s=Reflect.decorate(t,e,i,o);else for(var a=t.length-1;a>=0;a--)(n=t[a])&&(s=(r<3?n(s):r>3?n(e,i,s):n(e,i))||s);return r>3&&s&&Object.defineProperty(e,i,s),s}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,o=Symbol(),n=new WeakMap;let r=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==o)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(e,t))}return t}toString(){return this.cssText}};const s=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,o)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[o+1],t[0]);return new r(i,t,o)},a=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,o))(e)})(t):t,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,g=globalThis,m=g.trustedTypes,_=m?m.emptyScript:"",f=g.reactiveElementPolyfillSupport,y=(t,e)=>t,v={toAttribute(t,e){switch(e){case Boolean:t=t?_:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},b=(t,e)=>!l(t,e),w={attribute:!0,type:String,converter:v,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),g.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),o=this.getPropertyDescriptor(t,i,e);void 0!==o&&c(this.prototype,t,o)}}static getPropertyDescriptor(t,e,i){const{get:o,set:n}=d(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:o,set(e){const r=o?.call(this);n?.call(this,e),this.requestUpdate(t,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(a(t))}else void 0!==t&&e.push(a(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,o)=>{if(i)t.adoptedStyleSheets=o.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of o){const o=document.createElement("style"),n=e.litNonce;void 0!==n&&o.setAttribute("nonce",n),o.textContent=i.cssText,t.appendChild(o)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),o=this.constructor._$Eu(t,i);if(void 0!==o&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:v).toAttribute(e,i.type);this._$Em=t,null==n?this.removeAttribute(o):this.setAttribute(o,n),this._$Em=null}}_$AK(t,e){const i=this.constructor,o=i._$Eh.get(t);if(void 0!==o&&this._$Em!==o){const t=i.getPropertyOptions(o),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:v;this._$Em=o;const r=n.fromAttribute(e,t.type);this[o]=r??this._$Ej?.get(o)??r,this._$Em=null}}requestUpdate(t,e,i,o=!1,n){if(void 0!==t){const r=this.constructor;if(!1===o&&(n=this[t]),i??=r.getPropertyOptions(t),!((i.hasChanged??b)(n,e)||i.useDefault&&i.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:o,wrapped:n},r){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===o&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,o=this[e];!0!==t||this._$AL.has(e)||void 0===o||this.C(e,void 0,i,o)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[y("elementProperties")]=new Map,x[y("finalized")]=new Map,f?.({ReactiveElement:x}),(g.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,C=t=>t,A=$.trustedTypes,k=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,M="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+E,T=`<${S}>`,z=document,P=()=>z.createComment(""),I=t=>null===t||"object"!=typeof t&&"function"!=typeof t,D=Array.isArray,B="[ \t\n\f\r]",O=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,H=/-->/g,N=/>/g,U=RegExp(`>|${B}(?:([^\\s"'>=/]+)(${B}*=${B}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),R=/'/g,j=/"/g,F=/^(?:script|style|textarea|title)$/i,G=(t=>(e,...i)=>({_$litType$:t,strings:e,values:i}))(1),W=Symbol.for("lit-noChange"),Z=Symbol.for("lit-nothing"),q=new WeakMap,K=z.createTreeWalker(z,129);function V(t,e){if(!D(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(e):e}const J=(t,e)=>{const i=t.length-1,o=[];let n,r=2===e?"<svg>":3===e?"<math>":"",s=O;for(let e=0;e<i;e++){const i=t[e];let a,l,c=-1,d=0;for(;d<i.length&&(s.lastIndex=d,l=s.exec(i),null!==l);)d=s.lastIndex,s===O?"!--"===l[1]?s=H:void 0!==l[1]?s=N:void 0!==l[2]?(F.test(l[2])&&(n=RegExp("</"+l[2],"g")),s=U):void 0!==l[3]&&(s=U):s===U?">"===l[0]?(s=n??O,c=-1):void 0===l[1]?c=-2:(c=s.lastIndex-l[2].length,a=l[1],s=void 0===l[3]?U:'"'===l[3]?j:R):s===j||s===R?s=U:s===H||s===N?s=O:(s=U,n=void 0);const h=s===U&&t[e+1].startsWith("/>")?" ":"";r+=s===O?i+T:c>=0?(o.push(a),i.slice(0,c)+M+i.slice(c)+E+h):i+E+(-2===c?e:h)}return[V(t,r+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),o]};class Y{constructor({strings:t,_$litType$:e},i){let o;this.parts=[];let n=0,r=0;const s=t.length-1,a=this.parts,[l,c]=J(t,e);if(this.el=Y.createElement(l,i),K.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(o=K.nextNode())&&a.length<s;){if(1===o.nodeType){if(o.hasAttributes())for(const t of o.getAttributeNames())if(t.endsWith(M)){const e=c[r++],i=o.getAttribute(t).split(E),s=/([.?@])?(.*)/.exec(e);a.push({type:1,index:n,name:s[2],strings:i,ctor:"."===s[1]?it:"?"===s[1]?ot:"@"===s[1]?nt:et}),o.removeAttribute(t)}else t.startsWith(E)&&(a.push({type:6,index:n}),o.removeAttribute(t));if(F.test(o.tagName)){const t=o.textContent.split(E),e=t.length-1;if(e>0){o.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)o.append(t[i],P()),K.nextNode(),a.push({type:2,index:++n});o.append(t[e],P())}}}else if(8===o.nodeType)if(o.data===S)a.push({type:2,index:n});else{let t=-1;for(;-1!==(t=o.data.indexOf(E,t+1));)a.push({type:7,index:n}),t+=E.length-1}n++}}static createElement(t,e){const i=z.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,o){if(e===W)return e;let n=void 0!==o?i._$Co?.[o]:i._$Cl;const r=I(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,i,o)),void 0!==o?(i._$Co??=[])[o]=n:i._$Cl=n),void 0!==n&&(e=Q(t,n._$AS(t,e.values),n,o)),e}class X{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,o=(t?.creationScope??z).importNode(e,!0);K.currentNode=o;let n=K.nextNode(),r=0,s=0,a=i[0];for(;void 0!==a;){if(r===a.index){let e;2===a.type?e=new tt(n,n.nextSibling,this,t):1===a.type?e=new a.ctor(n,a.name,a.strings,this,t):6===a.type&&(e=new rt(n,this,t)),this._$AV.push(e),a=i[++s]}r!==a?.index&&(n=K.nextNode(),r++)}return K.currentNode=z,o}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class tt{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,o){this.type=2,this._$AH=Z,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=o,this._$Cv=o?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),I(t)?t===Z||null==t||""===t?(this._$AH!==Z&&this._$AR(),this._$AH=Z):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>D(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==Z&&I(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,o="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=Y.createElement(V(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===o)this._$AH.p(e);else{const t=new X(o,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=q.get(t.strings);return void 0===e&&q.set(t.strings,e=new Y(t)),e}k(t){D(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,o=0;for(const n of t)o===e.length?e.push(i=new tt(this.O(P()),this.O(P()),this,this.options)):i=e[o],i._$AI(n),o++;o<e.length&&(this._$AR(i&&i._$AB.nextSibling,o),e.length=o)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=C(t).nextSibling;C(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class et{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,o,n){this.type=1,this._$AH=Z,this._$AN=void 0,this.element=t,this.name=e,this._$AM=o,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=Z}_$AI(t,e=this,i,o){const n=this.strings;let r=!1;if(void 0===n)t=Q(this,t,e,0),r=!I(t)||t!==this._$AH&&t!==W,r&&(this._$AH=t);else{const o=t;let s,a;for(t=n[0],s=0;s<n.length-1;s++)a=Q(this,o[i+s],e,s),a===W&&(a=this._$AH[s]),r||=!I(a)||a!==this._$AH[s],a===Z?t=Z:t!==Z&&(t+=(a??"")+n[s+1]),this._$AH[s]=a}r&&!o&&this.j(t)}j(t){t===Z?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends et{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===Z?void 0:t}}let ot=class extends et{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==Z)}};class nt extends et{constructor(t,e,i,o,n){super(t,e,i,o,n),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??Z)===W)return;const i=this._$AH,o=t===Z&&i!==Z||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,n=t!==Z&&(i===Z||o);o&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const st=$.litHtmlPolyfillSupport;st?.(Y,tt),($.litHtmlVersions??=[]).push("3.3.2");const at=globalThis;class lt extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const o=i?.renderBefore??e;let n=o._$litPart$;if(void 0===n){const t=i?.renderBefore??null;o._$litPart$=n=new tt(e.insertBefore(P(),t),t,void 0,i??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}}lt._$litElement$=!0,lt.finalized=!0,at.litElementHydrateSupport?.({LitElement:lt});const ct=at.litElementPolyfillSupport;ct?.({LitElement:lt}),(at.litElementVersions??=[]).push("4.2.2");const dt=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:v,reflect:!1,hasChanged:b},pt=(t=ht,e,i)=>{const{kind:o,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===o&&((t=Object.create(t)).wrapped=!0),r.set(i.name,t),"accessor"===o){const{name:o}=i;return{set(i){const n=e.get.call(this);e.set.call(this,i),this.requestUpdate(o,n,t,!0,i)},init(e){return void 0!==e&&this.C(o,void 0,t,e),e}}}if("setter"===o){const{name:o}=i;return function(i){const n=this[o];e.call(this,i),this.requestUpdate(o,n,t,!0,i)}}throw Error("Unsupported decorator location: "+o)};function ut(t){return(e,i)=>"object"==typeof i?pt(t,e,i):((t,e,i)=>{const o=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),o?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function gt(t){return ut({...t,state:!0,attribute:!1})}const mt=s`
  :host {
    display: block;
  }

  ha-card {
    height: 100%;
    overflow: hidden;
    /* Theme-aware CSS custom properties for consistent styling */
    --map-shadow-color: rgba(0, 0, 0, 0.15);
    --map-border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  /* Dark theme adjustments */
  ha-card.theme-dark {
    --map-shadow-color: rgba(0, 0, 0, 0.4);
    --map-border-color: var(--divider-color, rgba(255, 255, 255, 0.12));
  }

  /* Light theme explicit styling (for clarity) */
  ha-card.theme-light {
    --map-shadow-color: rgba(0, 0, 0, 0.15);
    --map-border-color: var(--divider-color, rgba(0, 0, 0, 0.12));
  }

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 0;
    font-size: 1.2em;
    font-weight: 500;
  }

  .header-title {
    flex: 1;
  }

  /* Incident count badge */
  .incident-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 16px;
    color: #ffffff;
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
  }

  .incident-badge ha-icon {
    --mdc-icon-size: 16px;
  }

  .badge-count {
    font-weight: 700;
  }

  .badge-new {
    font-size: 11px;
    font-weight: 400;
    opacity: 0.9;
    margin-left: 4px;
    padding-left: 6px;
    border-left: 1px solid rgba(255, 255, 255, 0.3);
  }

  .map-wrapper {
    position: relative;
    width: 100%;
    height: 400px;
  }

  .map-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    height: 100%;
    width: 100%;
  }

  /* Ensure Leaflet container fills the map-container */
  .map-container .leaflet-container {
    height: 100% !important;
    width: 100% !important;
    border-radius: 0 0 var(--ha-card-border-radius, 12px)
      var(--ha-card-border-radius, 12px);
  }

  /* Loading state */
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: 16px;
    color: var(--primary-text-color, #333);
  }

  .loading-text {
    font-size: 14px;
    opacity: 0.7;
  }

  /* Error state */
  .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 400px;
    gap: 16px;
    color: var(--error-color, #cc0000);
    padding: 16px;
    text-align: center;
  }

  .error-container ha-icon {
    --mdc-icon-size: 48px;
  }

  .error-text {
    font-size: 14px;
    max-width: 300px;
  }

  /* Australian Warning System legend */
  .legend {
    background: var(--card-background-color, white);
    padding: 8px;
    border-radius: 4px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 4px 0;
    font-size: 12px;
  }

  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
  }

  /* Leaflet controls styling to match HA theme */
  .leaflet-control-zoom a {
    background: var(--card-background-color, white) !important;
    color: var(--primary-text-color, #333) !important;
  }

  .leaflet-control-zoom a:hover {
    background: var(--secondary-background-color, #f5f5f5) !important;
  }

  .leaflet-control-attribution {
    background: var(--card-background-color, rgba(255, 255, 255, 0.8)) !important;
    color: var(--secondary-text-color, #666) !important;
    font-size: 10px;
  }

  .leaflet-control-attribution a {
    color: var(--primary-color, #03a9f4) !important;
  }

  /* Entity marker styles */
  .entity-marker {
    background: transparent;
    border: none;
  }

  .entity-marker > div {
    transition: transform 0.2s ease;
  }

  .entity-marker:hover > div {
    transform: scale(1.1);
  }

  .entity-popup {
    font-size: 13px;
    line-height: 1.4;
  }

  .entity-popup strong {
    color: var(--primary-text-color, #333);
  }

  .entity-popup small {
    color: var(--secondary-text-color, #666);
  }

  /* Leaflet popup styling to match HA theme */
  .leaflet-popup-content-wrapper {
    background: var(--card-background-color, white);
    color: var(--primary-text-color, #333);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .leaflet-popup-tip {
    background: var(--card-background-color, white);
  }

  /* Leaflet tooltip styling */
  .leaflet-tooltip {
    background: var(--card-background-color, white);
    color: var(--primary-text-color, #333);
    border: none;
    border-radius: 4px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    padding: 4px 8px;
    font-size: 12px;
  }

  .leaflet-tooltip-top:before {
    border-top-color: var(--card-background-color, white);
  }

  /* Zone popup styles */
  .zone-popup {
    font-size: 13px;
    line-height: 1.4;
  }

  .zone-popup strong {
    color: var(--primary-text-color, #333);
  }

  .zone-popup small {
    color: var(--secondary-text-color, #666);
  }

  .zone-popup em {
    color: var(--secondary-text-color, #888);
    font-style: italic;
  }

  /* Fit to entities control button */
  .fit-control {
    margin-top: 10px;
  }

  .fit-control-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: var(--card-background-color, white) !important;
    color: var(--primary-text-color, #333) !important;
    text-decoration: none;
    cursor: pointer;
  }

  .fit-control-button:hover {
    background: var(--secondary-background-color, #f5f5f5) !important;
  }

  .fit-control-button ha-icon {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Incident popup styles */
  .incident-popup {
    font-size: 13px;
    line-height: 1.5;
    min-width: 180px;
    max-width: 300px;
  }

  .incident-popup-header {
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--divider-color, #e0e0e0);
  }

  .incident-popup-header strong {
    color: var(--primary-text-color, #333);
    font-size: 14px;
    font-weight: 600;
    word-wrap: break-word;
  }

  .incident-popup-body {
    color: var(--secondary-text-color, #666);
  }

  .incident-alert-badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 8px;
  }

  .incident-popup-row {
    margin: 4px 0;
    font-size: 12px;
  }

  .incident-popup-label {
    color: var(--secondary-text-color, #888);
    margin-right: 4px;
  }

  .incident-popup-advice {
    margin: 8px 0;
    padding: 8px;
    background: var(--secondary-background-color, #f5f5f5);
    border-radius: 4px;
    font-size: 12px;
    line-height: 1.4;
    max-height: 100px;
    overflow-y: auto;
  }

  .incident-popup-link {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid var(--divider-color, #e0e0e0);
  }

  .incident-popup-link a {
    color: var(--primary-color, #03a9f4);
    text-decoration: none;
    font-size: 12px;
    font-weight: 500;
  }

  .incident-popup-link a:hover {
    text-decoration: underline;
  }

  /* Responsive popup container */
  .incident-popup-container .leaflet-popup-content {
    margin: 12px;
  }

  .incident-popup-container .leaflet-popup-content-wrapper {
    padding: 0;
  }

  /* Incident animation keyframes */
  @keyframes incident-appear {
    0% {
      opacity: 0;
      filter: drop-shadow(0 0 0 transparent);
    }
    30% {
      opacity: 1;
      filter: drop-shadow(0 0 12px var(--incident-glow-color, rgba(255, 102, 0, 0.8)));
    }
    100% {
      opacity: 1;
      filter: drop-shadow(0 0 0 transparent);
    }
  }

  @keyframes incident-pulse {
    0%, 100% {
      filter: drop-shadow(0 0 0 transparent);
    }
    25% {
      filter: drop-shadow(0 0 8px var(--incident-glow-color, rgba(255, 102, 0, 0.8)));
    }
    50% {
      filter: drop-shadow(0 0 0 transparent);
    }
    75% {
      filter: drop-shadow(0 0 8px var(--incident-glow-color, rgba(255, 102, 0, 0.8)));
    }
  }

  @keyframes incident-glow-extreme {
    0%, 100% {
      filter: drop-shadow(0 0 4px rgba(204, 0, 0, 0.6));
    }
    50% {
      filter: drop-shadow(0 0 12px rgba(204, 0, 0, 0.9));
    }
  }

  /* Incident animation classes */
  .incident-layer-new {
    animation: incident-appear var(--incident-animation-duration, 2s) ease-out forwards;
  }

  .incident-layer-updated {
    animation: incident-pulse var(--incident-animation-duration, 2s) ease-in-out;
  }

  .incident-layer-extreme {
    animation: incident-glow-extreme 2s ease-in-out infinite;
  }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .incident-layer-new,
    .incident-layer-updated,
    .incident-layer-extreme {
      animation: none !important;
    }
  }

  /* Animation disabled via config */
  .animations-disabled .incident-layer-new,
  .animations-disabled .incident-layer-updated,
  .animations-disabled .incident-layer-extreme {
    animation: none !important;
  }

  /* ============================================
   * RESPONSIVE DESIGN
   * ============================================ */

  /* Responsive map height based on container size */
  @media (max-height: 500px) {
    .map-wrapper,
    .loading-container,
    .error-container {
      height: 250px;
    }
  }

  @media (min-height: 501px) and (max-height: 700px) {
    .map-wrapper,
    .loading-container,
    .error-container {
      height: 350px;
    }
  }

  @media (min-height: 701px) {
    .map-wrapper,
    .loading-container,
    .error-container {
      height: 400px;
    }
  }

  /* Mobile-specific adjustments */
  @media (max-width: 480px) {
    .card-header {
      padding: 12px 12px 0;
      font-size: 1em;
    }

    .incident-badge {
      padding: 3px 8px;
      font-size: 12px;
    }

    .badge-new {
      display: none; /* Hide "new" indicator on very small screens */
    }

    .incident-popup {
      min-width: 150px;
      max-width: 250px;
    }

    .incident-popup-advice {
      max-height: 80px;
    }
  }

  /* Tablet adjustments */
  @media (min-width: 481px) and (max-width: 768px) {
    .card-header {
      padding: 14px 14px 0;
    }
  }

  /* ============================================
   * ACCESSIBILITY - FOCUS INDICATORS
   * ============================================ */

  /* Global focus visible style for keyboard navigation */
  *:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }

  /* Leaflet control focus styles */
  .leaflet-control-zoom a:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4) !important;
    outline-offset: -2px;
  }

  .fit-control-button:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4) !important;
    outline-offset: -2px;
  }

  /* Popup close button focus */
  .leaflet-popup-close-button:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4) !important;
    outline-offset: 2px;
  }

  /* Link focus within popups */
  .incident-popup-link a:focus-visible {
    outline: 2px solid var(--primary-color, #03a9f4);
    outline-offset: 2px;
  }

  /* ============================================
   * ACCESSIBILITY - TOUCH TARGETS (WCAG 2.1 AA)
   * ============================================ */

  /* Ensure minimum 44x44px touch targets for mobile */
  @media (pointer: coarse) {
    .leaflet-control-zoom a {
      width: 44px !important;
      height: 44px !important;
      line-height: 44px !important;
      font-size: 22px !important;
    }

    .fit-control-button {
      width: 44px !important;
      height: 44px !important;
    }

    .leaflet-popup-close-button {
      width: 44px !important;
      height: 44px !important;
      font-size: 24px !important;
      padding: 0 !important;
      right: 0 !important;
      top: 0 !important;
    }
  }

  /* ============================================
   * ACCESSIBILITY - HIGH CONTRAST MODE
   * ============================================ */

  @media (prefers-contrast: more) {
    ha-card {
      border: 2px solid var(--primary-text-color, #000) !important;
    }

    .card-header {
      border-bottom: 2px solid var(--divider-color, #000);
    }

    .incident-badge {
      border: 2px solid currentColor;
    }

    .leaflet-control-zoom a {
      border: 2px solid var(--primary-text-color, #000) !important;
    }

    .fit-control-button {
      border: 2px solid var(--primary-text-color, #000) !important;
    }

    /* Increase popup contrast */
    .leaflet-popup-content-wrapper {
      border: 2px solid var(--primary-text-color, #000);
    }

    /* Stronger focus indicators */
    *:focus-visible {
      outline-width: 3px;
    }
  }

  /* ============================================
   * ACCESSIBILITY - SCREEN READER UTILITIES
   * ============================================ */

  /* Visually hidden but accessible to screen readers */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Live region for announcements */
  .sr-live-region {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  /* Skip link for keyboard navigation */
  .skip-link {
    position: absolute;
    top: -40px;
    left: 0;
    background: var(--primary-color, #03a9f4);
    color: white;
    padding: 8px 16px;
    z-index: 10000;
    text-decoration: none;
    font-weight: 500;
    border-radius: 0 0 4px 0;
    transition: top 0.2s ease;
  }

  .skip-link:focus {
    top: 0;
  }
`,_t="auto",ft={device_tracker:"mdi:cellphone",person:"mdi:account",geo_location:"mdi:map-marker"},yt={device_tracker:"#4CAF50",person:"#2196F3",geo_location:"#FF9800"},vt={extreme:"#cc0000",severe:"#ff6600",moderate:"#ffcc00",minor:"#3366cc"},bt={australian:{extreme:"#cc0000",severe:"#ff6600",moderate:"#ffcc00",minor:"#3366cc"},us_nws:{extreme:"#cc0000",severe:"#ff6600",moderate:"#ffcc00",minor:"#00bfff"},eu_meteo:{extreme:"#cc0000",severe:"#ff6600",moderate:"#ffcc00",minor:"#33cc33"},high_contrast:{extreme:"#990000",severe:"#cc5500",moderate:"#ccaa00",minor:"#003399"}};function wt(t,e){const i=["extreme","severe","moderate","minor"].includes(t)?t:"minor";return e?.alert_colors?.[i]?e.alert_colors[i]:e?.alert_color_preset&&bt[e.alert_color_preset]?bt[e.alert_color_preset][i]:vt[i]}const xt="1.9.4",$t=`https://unpkg.com/leaflet@${xt}/dist/leaflet.css`,Ct=`https://unpkg.com/leaflet@${xt}/dist/leaflet.js`;let At=null,kt=!1,Mt=null;async function Et(t){console.log("ABC Emergency Map: Injecting Leaflet CSS into shadow root");if(t.querySelector("style[data-leaflet-css]"))return void console.log("ABC Emergency Map: Leaflet CSS already injected");const e=await async function(){if(Mt)return Mt;const t=await fetch($t);if(!t.ok)throw new Error(`Failed to fetch Leaflet CSS: ${t.status}`);return Mt=await t.text(),Mt}();console.log("ABC Emergency Map: Fetched Leaflet CSS, length:",e.length);const i=document.createElement("style");i.setAttribute("data-leaflet-css","true"),i.textContent=e,t.insertBefore(i,t.firstChild),console.log("ABC Emergency Map: Leaflet CSS injected successfully")}async function St(){return At||(kt&&"undefined"!=typeof L?L:(At=(async()=>{try{if(await(t=$t,e="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=",new Promise((i,o)=>{if(document.querySelector(`link[href="${t}"]`))return void i();const n=document.createElement("link");n.rel="stylesheet",n.href=t,n.integrity=e,n.crossOrigin="anonymous",n.onload=()=>i(),n.onerror=()=>o(new Error(`Failed to load Leaflet CSS from ${t}`)),document.head.appendChild(n)})),await function(t,e){return new Promise((i,o)=>{if("undefined"!=typeof window&&"L"in window)return void i();const n=document.createElement("script");n.src=t,n.integrity=e,n.crossOrigin="anonymous",n.async=!0,n.onload=()=>i(),n.onerror=()=>o(new Error(`Failed to load Leaflet JS from ${t}`)),document.head.appendChild(n)})}(Ct,"sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="),"undefined"==typeof L)throw new Error("Leaflet loaded but L is undefined");return kt=!0,L}catch(t){throw At=null,t}var t,e})(),At))}const Tt={osm:{name:"OpenStreetMap",requiresApiKey:!1,light:{url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:19,subdomains:["a","b","c"]}},cartodb:{name:"CartoDB",requiresApiKey:!1,light:{url:"https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',maxZoom:20,subdomains:["a","b","c","d"]},dark:{url:"https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',maxZoom:20,subdomains:["a","b","c","d"]}},mapbox:{name:"Mapbox",requiresApiKey:!0,light:{url:"https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token={accessToken}",attribution:'&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:22},dark:{url:"https://api.mapbox.com/styles/v1/mapbox/dark-v11/tiles/{z}/{x}/{y}?access_token={accessToken}",attribution:'&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',maxZoom:22}}};function zt(t,e){const i=t.tile_provider??"osm";if("custom"===i)return function(t){if(!t.tile_url)return console.warn("ABC Emergency Map: Custom tile provider requires tile_url. Falling back to OSM."),Tt.osm.light;let e=t.tile_url;t.api_key&&e.includes("{accessToken}")&&(e=e.replace("{accessToken}",t.api_key));return{url:e,attribution:t.tile_attribution??"Custom tiles",maxZoom:19}}(t);const o=Tt[i];if(!o)return console.warn(`ABC Emergency Map: Unknown tile provider "${i}", falling back to OSM`),Tt.osm.light;if(o.requiresApiKey&&!t.api_key)return console.warn(`ABC Emergency Map: ${o.name} requires an API key. Falling back to OSM.`),Tt.osm.light;const n=e&&o.dark?o.dark:o.light;return t.api_key&&n.url.includes("{accessToken}")?{...n,url:n.url.replace("{accessToken}",t.api_key)}:n}const Pt=["device_tracker","person","geo_location"];function Lt(t){return Pt.includes(t)}function It(t){return t.split(".")[0]}function Dt(t,e){const i=It(t);if(!Lt(i))return null;if(!function(t){const e=t.attributes.latitude,i=t.attributes.longitude;return"number"==typeof e&&"number"==typeof i&&!isNaN(e)&&!isNaN(i)&&e>=-90&&e<=90&&i>=-180&&i<=180}(e))return null;const o=e.attributes;return{entityId:t,domain:i,name:o.friendly_name||t,latitude:o.latitude,longitude:o.longitude,picture:o.entity_picture,state:e.state,gpsAccuracy:o.gps_accuracy,battery:o.battery,lastUpdated:e.last_updated}}function Bt(t,e){const i=new Set,o=[],n=function(t,e){const i=[],o=new Set,n=[];e.entity&&n.push(e.entity),e.entities&&n.push(...e.entities);for(const e of n){if(o.has(e))continue;o.add(e);const n=t.states[e];if(!n)continue;const r=Dt(e,n);r&&i.push(r)}return i}(t,e);for(const t of n)i.has(t.entityId)||(i.add(t.entityId),o.push(t));if(e.geo_location_sources&&e.geo_location_sources.length>0){const n=function(t,e){const i=[];console.log("ABC Emergency Map: Processing geo_location_sources:",e);for(const o of e){const e=t.states[o];if(!e){console.warn(`ABC Emergency Map: Source entity not found: ${o}`);continue}console.log(`ABC Emergency Map: Source ${o} state:`,e.state,"attrs:",e.attributes);const n=e.attributes;Array.isArray(n.entity_ids)&&(console.log(`ABC Emergency Map: Found entity_ids in ${o}:`,n.entity_ids),i.push(...n.entity_ids)),Array.isArray(n.containing_entity_ids)&&(console.log(`ABC Emergency Map: Found containing_entity_ids in ${o}:`,n.containing_entity_ids),i.push(...n.containing_entity_ids)),n.entity_ids||n.containing_entity_ids||console.warn(`ABC Emergency Map: Source ${o} has no entity_ids or containing_entity_ids attribute`)}return console.log("ABC Emergency Map: Total entity IDs from sources:",i),[...new Set(i)]}(t,e.geo_location_sources),r=Object.keys(t.states).filter(t=>t.startsWith("geo_location."));console.log("ABC Emergency Map: All geo_location entities in hass.states:",r);for(const e of n){if(i.has(e))continue;i.add(e);const n=t.states[e];if(!n){console.warn(`ABC Emergency Map: Entity from source not found in hass.states: ${e}`);continue}const r=Dt(e,n);r?o.push(r):console.warn(`ABC Emergency Map: Entity ${e} has no valid coordinates`)}}return o}function Ot(t,e){const i=function(t,e){const i=yt[t.domain];return t.picture?`\n      width: ${e}px;\n      height: ${e}px;\n      border-radius: 50%;\n      border: 3px solid ${i};\n      background-image: url('${t.picture}');\n      background-size: cover;\n      background-position: center;\n      box-shadow: 0 2px 6px rgba(0,0,0,0.3);\n    `:`\n    width: ${e}px;\n    height: ${e}px;\n    border-radius: 50%;\n    background-color: ${i};\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    box-shadow: 0 2px 6px rgba(0,0,0,0.3);\n    color: white;\n    font-size: ${.5*e}px;\n  `}(t,e);if(t.picture)return`<div style="${i}"></div>`;return`\n    <div style="${i}">\n      <ha-icon icon="${ft[t.domain]}" style="--mdc-icon-size: ${.6*e}px;"></ha-icon>\n    </div>\n  `}function Ht(t){const e=[`<strong>${t.name}</strong>`,`<br><small>${t.entityId}</small>`,`<br>State: ${t.state}`];return void 0!==t.battery&&e.push(`<br>Battery: ${t.battery}%`),void 0!==t.gpsAccuracy&&e.push(`<br>GPS Accuracy: ${t.gpsAccuracy}m`),`<div class="entity-popup">${e.join("")}</div>`}class Nt{constructor(t){this._markers=new Map,this._markerSize=40,this._map=t}updateMarkers(t){const e=new Set(t.map(t=>t.entityId));for(const[t,i]of this._markers)e.has(t)||(i.remove(),this._markers.delete(t));for(const e of t)this._updateOrCreateMarker(e)}_updateOrCreateMarker(t){const e=[t.latitude,t.longitude],i=this._markers.get(t.entityId);if(i){i.setLatLng(e);const o=this._createIcon(t);i.setIcon(o),i.setPopupContent(Ht(t))}else{const i=this._createIcon(t),o=L.marker(e,{icon:i}).bindPopup(Ht(t)).addTo(this._map);o.bindTooltip(t.name,{permanent:!1,direction:"top",offset:[0,-this._markerSize/2]}),this._markers.set(t.entityId,o)}}_createIcon(t){return L.divIcon({className:"entity-marker",html:Ot(t,this._markerSize),iconSize:[this._markerSize,this._markerSize],iconAnchor:[this._markerSize/2,this._markerSize/2],popupAnchor:[0,-this._markerSize/2]})}getMarkerPositions(){const t=[];for(const e of this._markers.values()){const i=e.getLatLng();t.push([i.lat,i.lng])}return t}get markerCount(){return this._markers.size}clear(){for(const t of this._markers.values())t.remove();this._markers.clear()}destroy(){this.clear()}}function Ut(t){return t.startsWith("zone.")}function Rt(t,e){const i=e.attributes,o=i.latitude,n=i.longitude;return"number"!=typeof o||"number"!=typeof n||isNaN(o)||isNaN(n)?null:{entityId:t,name:i.friendly_name||t.replace("zone.",""),latitude:o,longitude:n,radius:"number"==typeof i.radius?i.radius:100,passive:!0===i.passive,icon:i.icon}}function jt(t){const e=[`<strong>${t.name}</strong>`,`<br><small>${t.entityId}</small>`,`<br>Radius: ${t.radius}m`];return t.passive&&e.push("<br><em>Passive zone</em>"),`<div class="zone-popup">${e.join("")}</div>`}class Ft{constructor(t,e){this._circles=new Map,this._map=t,this._config=e}updateConfig(t){this._config=t}updateZones(t){if(!1===this._config.show_zones)return void this.clear();const e=new Set(t.map(t=>t.entityId));for(const[t,i]of this._circles)e.has(t)||(i.remove(),this._circles.delete(t));for(const e of t)this._updateOrCreateCircle(e)}_updateOrCreateCircle(t){const e=[t.latitude,t.longitude],i=this._circles.get(t.entityId),o=this._config.zone_color??"#4285f4",n={color:o,fillColor:o,fillOpacity:this._config.zone_opacity??.2,weight:2,opacity:this._config.zone_border_opacity??.5,dashArray:t.passive?"5, 5":void 0};if(i)i.setLatLng(e),i.setRadius(t.radius),i.setStyle(n),i.setPopupContent(jt(t));else{const i=L.circle(e,{radius:t.radius,...n}).bindPopup(jt(t)).bindTooltip(t.name,{permanent:!1,direction:"center"}).addTo(this._map);this._circles.set(t.entityId,i)}}getZonePositions(){const t=[];for(const e of this._circles.values()){const i=e.getLatLng();t.push([i.lat,i.lng])}return t}get zoneCount(){return this._circles.size}clear(){for(const t of this._circles.values())t.remove();this._circles.clear()}destroy(){this.clear()}}class Gt{constructor(t,e){this._hasUserInteracted=!1,this._initialFitDone=!1,this._lastKnownPositions=[],this._map=t,this._config=e,this._setupUserInteractionTracking()}updateConfig(t){this._config=t}addFitControl(){this._fitControl||(this._fitControl=function(t){const e=L.Control.extend({options:{position:"topleft"},onAdd(){const e=L.DomUtil.create("div","leaflet-bar leaflet-control fit-control"),i=L.DomUtil.create("a","fit-control-button",e);return i.href="#",i.title="Fit to all entities",i.setAttribute("role","button"),i.setAttribute("aria-label","Fit map to show all entities"),i.innerHTML='<ha-icon icon="mdi:fit-to-screen" style="--mdc-icon-size: 18px;"></ha-icon>',L.DomEvent.disableClickPropagation(e),L.DomEvent.on(i,"click",e=>{L.DomEvent.preventDefault(e),t()}),e}});return new e}(()=>{this.fitToPositionsAndBounds(this._lastKnownPositions,this._lastKnownPolygonBounds,!0)}),this._fitControl.addTo(this._map))}removeFitControl(){this._fitControl&&(this._fitControl.remove(),this._fitControl=void 0)}fitToPositions(t,e=!1){this.fitToPositionsAndBounds(t,void 0,e)}fitToPositionsAndBounds(t,e,i=!1){this._lastKnownPositions=t,this._lastKnownPolygonBounds=e||void 0;if(!(this._config.auto_fit??true)&&!i&&this._initialFitDone)return;if(this._hasUserInteracted&&!i&&this._initialFitDone)return;const o=t.length>=1,n=e?.isValid();(o||n)&&(this._debounceTimer&&window.clearTimeout(this._debounceTimer),this._debounceTimer=window.setTimeout(()=>{this._performFitWithPolygons(t,e),this._initialFitDone=!0},i?0:300))}_performFitWithPolygons(t,e){const i=function(t){return void 0===t?[50,50]:"number"==typeof t?[t,t]:t}(this._config.fit_padding),o=this._config.fit_max_zoom??17;let n;n=e?.isValid()?L.latLngBounds(e.getSouthWest(),e.getNorthEast()):L.latLngBounds([]);for(const[e,i]of t)n.extend([e,i]);if(!n.isValid())return;if(n.getNorthEast().distanceTo(n.getSouthWest())<1){const t=n.getCenter(),e=Math.min(this._config.default_zoom??10,o);this._map.setView(t,e,{animate:!0})}else{this._map.fitBounds(n,{padding:i,maxZoom:o,animate:!0})}}_setupUserInteractionTracking(){this._map.on("dragstart",()=>{this._hasUserInteracted=!0}),this._map.on("zoomstart",()=>{})}resetUserInteraction(){this._hasUserInteracted=!1}destroy(){this._debounceTimer&&(window.clearTimeout(this._debounceTimer),this._debounceTimer=void 0),this.removeFitControl()}}async function Wt(t,e,i){const o=new Date,n=new Date(o.getTime()-60*i*60*1e3);try{const i=await t.callWS({type:"history/history_during_period",start_time:n.toISOString(),end_time:o.toISOString(),entity_ids:[e],minimal_response:!1,significant_changes_only:!1});if(!i||!i[e])return[];const r=[],s=i[e];for(const t of s){const e=t.attributes?.latitude,i=t.attributes?.longitude;"number"!=typeof e||"number"!=typeof i||isNaN(e)||isNaN(i)||r.push({timestamp:new Date(t.last_changed),latitude:e,longitude:i})}return r.sort((t,e)=>t.timestamp.getTime()-e.timestamp.getTime()),r}catch(t){return console.warn(`Failed to fetch history for ${e}:`,t),[]}}function Zt(t,e){if(0===t.length)return[];const i=[];let o=[t[0]];for(let n=1;n<t.length;n++){(t[n].timestamp.getTime()-t[n-1].timestamp.getTime())/6e4>e?(o.length>1&&i.push(o),o=[t[n]]):o.push(t[n])}return o.length>1&&i.push(o),i}function qt(t,e,i){const o=i.getTime()-e.getTime();if(0===o)return 1;return.8-.6*((i.getTime()-t.getTime())/o)}function Kt(t,e,i,o,n){if(e.length<2)return[];const r=[],s=new Date,a=new Date(s.getTime()-60*n*60*1e3),l=Math.max(1,Math.floor(e.length/10));for(let n=0;n<e.length-1;n+=l){const c=Math.min(n+l+1,e.length),d=e.slice(n,c);if(d.length<2)continue;const h=qt(d[Math.floor(d.length/2)].timestamp,a,s),p=d.map(t=>[t.latitude,t.longitude]),u=L.polyline(p,{color:i,weight:o,opacity:h,lineCap:"round",lineJoin:"round"}).addTo(t);r.push(u)}return r}class Vt{constructor(t,e){this._polylines=new Map,this._lastFetch=0,this._cachedHistory=new Map,this._map=t,this._config=e}updateConfig(t){this._config=t}async updateTrails(t,e){if(!(this._config.show_history??false))return void this.clear();const i=(this._config.history_entities??e).filter(t=>Lt(It(t))),o=Date.now();if(o-this._lastFetch<5e3)return void(this._fetchTimeout||(this._fetchTimeout=window.setTimeout(()=>{this._fetchTimeout=void 0,this.updateTrails(t,e)},5e3)));this._lastFetch=o,this._fetchTimeout&&(window.clearTimeout(this._fetchTimeout),this._fetchTimeout=void 0);const n=this._config.hours_to_show??24,r=this._config.history_line_weight??3,s=new Set(i);for(const t of this._polylines.keys())s.has(t)||this._removeTrail(t);for(const e of i){const i=It(e),o=yt[i]||"#888888",s=await Wt(t,e,n);if(s.length<2){this._removeTrail(e);continue}this._cachedHistory.set(e,{entityId:e,color:o,points:s}),this._removeTrail(e);const a=Zt(s,30),l=[];for(const t of a){const e=Kt(this._map,t,o,r,n);l.push(...e)}this._polylines.set(e,l)}}_removeTrail(t){const e=this._polylines.get(t);if(e){for(const t of e)t.remove();this._polylines.delete(t)}}getTrailPositions(){const t=[];for(const e of this._cachedHistory.values())for(const i of e.points)t.push([i.latitude,i.longitude]);return t}get trailCount(){return this._polylines.size}clear(){for(const t of this._polylines.keys())this._removeTrail(t);this._polylines.clear(),this._cachedHistory.clear()}destroy(){this._fetchTimeout&&(window.clearTimeout(this._fetchTimeout),this._fetchTimeout=void 0),this.clear()}}function Jt(t,e){const i=e.attributes,o=i.latitude,n=i.longitude;if("number"!=typeof o||"number"!=typeof n||isNaN(o)||isNaN(n))return null;const r=i.alert_level?.toLowerCase()||"minor",s=["extreme","severe","moderate","minor"].includes(r)?r:"minor";return{id:t,headline:i.friendly_name||t,latitude:o,longitude:n,alert_level:s,alert_text:i.alert_text||"",event_type:i.event_type||"unknown",has_polygon:!!i.geojson||!!i.geometry,geometry_type:i.geometry_type,last_updated:e.last_updated||e.last_changed,external_link:i.external_link||i.link||i.url||void 0}}function Yt(t){const e=t.attributes;if(e.geojson){const t=e.geojson;if(Qt(t))return t}if(e.geometry){const t=e.geometry;if(Qt(t))return t}return null}function Qt(t){if(!t||"object"!=typeof t)return!1;const e=t;if("string"!=typeof e.type)return!1;if(!Array.isArray(e.coordinates))return!1;return["Polygon","MultiPolygon","Point"].includes(e.type)}function Xt(t,e){return{type:"Feature",geometry:e,properties:{id:t.id,headline:t.headline,alert_level:t.alert_level,event_type:t.event_type,alert_text:t.alert_text}}}function te(t){const e=t.attributes,i=e.geojson||e.geometry;if(!i)return!1;const o=i.type||e.geometry_type;return"Polygon"===o||"MultiPolygon"===o||"GeometryCollection"===o}const ee={minor:0,moderate:1,severe:2,extreme:3};function ie(t){return ee[t]??0}class oe{constructor(t,e){this._layers=new Map,this._incidents=new Map,this._incidentHashes=new Map,this._knownEntityIds=new Set,this._previousGeometries=new Map,this._activeTransitions=new Map,this._map=t,this._config=e}_hashIncident(t){return`${t.alert_level}|${t.headline}|${t.alert_text}|${t.last_updated}`}_animationsEnabled(){return this._config.animations_enabled??true}_getAnimationDuration(){return(this._config.animation_duration??2e3)/1e3+"s"}_geometryTransitionsEnabled(){return this._config.geometry_transitions??true}_getTransitionDurationMs(){return this._config.transition_duration??500}_hashGeometry(t){return JSON.stringify(t.coordinates)}_hasGeometryChanged(t,e){const i=this._previousGeometries.get(t);return!!i&&this._hashGeometry(i)!==this._hashGeometry(e)}_interpolateCoordinates(t,e,i){const o=Math.max(t.length,e.length),n=this._resampleCoordinates(t,o),r=this._resampleCoordinates(e,o);return n.map((t,e)=>{const o=r[e];return[t[0]+(o[0]-t[0])*i,t[1]+(o[1]-t[1])*i]})}_resampleCoordinates(t,e){if(0===t.length)return[];if(t.length===e)return t;if(1===t.length)return Array(e).fill(t[0]);const i=[],o=t.length-1;for(let n=0;n<e;n++){const r=n/(e-1)*o,s=Math.floor(r),a=r-s;if(s>=o)i.push(t[o]);else{const e=t[s],o=t[s+1];i.push([e[0]+(o[0]-e[0])*a,e[1]+(o[1]-e[1])*a])}}return i}_interpolateGeometry(t,e,i){if(t.type!==e.type)return i<.5?t:e;if("Polygon"===t.type&&"Polygon"===e.type){const o=t.coordinates,n=e.coordinates,r=Math.max(o.length,n.length),s=[];for(let t=0;t<r;t++){s.push(this._interpolateCoordinates(o[t]||o[0]||[],n[t]||n[0]||[],i))}return{type:"Polygon",coordinates:s}}if("MultiPolygon"===t.type&&"MultiPolygon"===e.type){const o=t.coordinates,n=e.coordinates,r=Math.max(o.length,n.length),s=[];for(let t=0;t<r;t++){const e=o[t]||o[0]||[[]],r=n[t]||n[0]||[[]],a=Math.max(e.length,r.length),l=[];for(let t=0;t<a;t++){l.push(this._interpolateCoordinates(e[t]||e[0]||[],r[t]||r[0]||[],i))}s.push(l)}return{type:"MultiPolygon",coordinates:s}}return i<.5?t:e}_animateGeometryTransition(t,e,i,o,n){const r=this._activeTransitions.get(t);r&&cancelAnimationFrame(r);const s=this._getTransitionDurationMs(),a=performance.now(),l=this._layers.get(t);if(!l)return;const c=r=>{const d=Math.min((r-a)/s,1),h=1-Math.pow(1-d,3),p=this._interpolateGeometry(i,o,h),u=Xt(e,p);if(l.clearLayers(),l.addData(u),l.setStyle(n),d<1){const e=requestAnimationFrame(c);this._activeTransitions.set(t,e)}else this._activeTransitions.delete(t),this._previousGeometries.set(t,o)},d=requestAnimationFrame(c);this._activeTransitions.set(t,d)}updateConfig(t){this._config=t}updatePolygonsForEntities(t,e){console.log("ABC Emergency Map: updatePolygonsForEntities called with",e.length,"entities");const i=new Set(e);for(const[t,e]of this._layers)i.has(t)||(e.remove(),this._layers.delete(t),this._incidents.delete(t));const o=[];for(const i of e){const e=t.states[i];if(!e){console.log("ABC Emergency Map: Entity not found:",i);continue}if(console.log("ABC Emergency Map: Entity",i,"attributes:",{has_polygon:e.attributes.has_polygon,geometry_type:e.attributes.geometry_type,hasGeojson:!!e.attributes.geojson,hasGeometry:!!e.attributes.geometry}),!te(e)){console.log("ABC Emergency Map: No polygon data for",i);continue}const n=Jt(i,e);if(!n)continue;const r=Yt(e);if(!r){console.log("ABC Emergency Map: No geometry extracted for",i);const t=this._layers.get(i);t&&(t.remove(),this._layers.delete(i));continue}const s=!this._knownEntityIds.has(i),a=this._hashIncident(n),l=this._incidentHashes.get(i),c=!s&&l!==a;this._incidents.set(i,n),this._incidentHashes.set(i,a),this._knownEntityIds.add(i),o.push({entityId:i,entity:e,incident:n,geometry:r,isNew:s,isUpdated:c})}o.sort((t,e)=>ie(t.incident.alert_level)-ie(e.incident.alert_level)),console.log("ABC Emergency Map: Rendering order (bottom to top):",o.map(t=>`${t.entityId} (${t.incident.alert_level})`));for(const t of o){const e=this._layers.get(t.entityId);e&&(e.remove(),this._layers.delete(t.entityId))}for(const t of o)console.log("ABC Emergency Map: Rendering polygon for",t.entityId,"severity:",t.incident.alert_level,"type:",t.geometry.type),this._updatePolygonLayer(t.entityId,t.incident,t.geometry,t.isNew,t.isUpdated);console.log("ABC Emergency Map: Polygon rendering complete.",o.length,"entities with polygon data,",this._layers.size,"layers rendered")}_updatePolygonLayer(t,e,i,o=!1,n=!1){const r=this._layers.get(t),s=Xt(e,i),a=function(t,e){const i=wt(t,e);return{color:i,weight:2,opacity:.8,fillColor:i,fillOpacity:.35}}(e.alert_level,this._config),l=this._hasGeometryChanged(t,i),c=this._previousGeometries.get(t);if(r)l&&c&&this._geometryTransitionsEnabled()&&"Point"!==i.type?(this._animateGeometryTransition(t,e,c,i,a),n&&this._applyAnimation(r,e,"updated")):(r.clearLayers(),r.addData(s),r.setStyle(a),this._previousGeometries.set(t,i),n&&this._applyAnimation(r,e,"updated"));else{console.log("ABC Emergency Map: Creating GeoJSON layer for",t),console.log("ABC Emergency Map: Feature:",JSON.stringify(s,null,2)),console.log("ABC Emergency Map: Style:",a);try{const n=L.geoJSON(s,{style:()=>a,onEachFeature:(t,i)=>{this._bindPopup(i,e)}}).addTo(this._map);console.log("ABC Emergency Map: Layer created, bounds:",n.getBounds()),this._layers.set(t,n),this._previousGeometries.set(t,i),o&&this._applyAnimation(n,e,"new")}catch(t){console.error("ABC Emergency Map: Error creating GeoJSON layer:",t)}}if("extreme"===e.alert_level){const i=this._layers.get(t);i&&this._applyAnimation(i,e,"extreme")}}_bindPopup(t,e){const i=wt(e.alert_level,this._config),o=this._getAlertLabel(e.alert_level),n=function(t){if(!t)return"";const e=new Date(t);if(isNaN(e.getTime()))return"";const i=(new Date).getTime()-e.getTime(),o=Math.floor(i/6e4),n=Math.floor(i/36e5),r=Math.floor(i/864e5);return o<1?"Just now":1===o?"1 min ago":o<60?`${o} mins ago`:1===n?"1 hour ago":n<24?`${n} hours ago`:1===r?"1 day ago":`${r} days ago`}(e.last_updated),r=e.event_type&&"unknown"!==e.event_type?`<div class="incident-popup-row"><span class="incident-popup-label">Type:</span> ${this._escapeHtml(e.event_type)}</div>`:"",s=n?`<div class="incident-popup-row"><span class="incident-popup-label">Updated:</span> ${n}</div>`:"",a=e.alert_text?`<div class="incident-popup-advice">${this._escapeHtml(e.alert_text)}</div>`:"",l=e.external_link?`<div class="incident-popup-link"><a href="${this._escapeHtml(e.external_link)}" target="_blank" rel="noopener noreferrer">More Info →</a></div>`:"",c=`\n      <div class="incident-popup">\n        <div class="incident-popup-header" style="border-left: 4px solid ${i}; padding-left: 8px;">\n          <strong>${this._escapeHtml(e.headline)}</strong>\n        </div>\n        <div class="incident-popup-body">\n          <div class="incident-alert-badge" style="background: ${i}; color: ${this._getContrastColor(i)};">\n            ${o}\n          </div>\n          ${r}\n          ${s}\n          ${a}\n          ${l}\n        </div>\n      </div>\n    `;t.bindPopup(c,{maxWidth:300,minWidth:200,className:"incident-popup-container"})}_escapeHtml(t){const e=document.createElement("div");return e.textContent=t,e.innerHTML}_getContrastColor(t){const e=t.replace("#","");return(.299*parseInt(e.substring(0,2),16)+.587*parseInt(e.substring(2,4),16)+.114*parseInt(e.substring(4,6),16))/255>.5?"#000000":"#ffffff"}_getAlertLabel(t){return{extreme:"Emergency Warning",severe:"Watch and Act",moderate:"Advice",minor:"Information"}[t]||"Information"}_applyAnimation(t,e,i){this._animationsEnabled()&&t.eachLayer(t=>{const o=t.getElement?.();o&&this._applyAnimationToElement(o,e,i)})}_applyAnimationToElement(t,e,i){const o=wt(e.alert_level,this._config);switch(t.style.setProperty("--incident-glow-color",`${o}80`),t.style.setProperty("--incident-animation-duration",this._getAnimationDuration()),t.classList.remove("incident-layer-new","incident-layer-updated","incident-layer-extreme"),i){case"new":t.classList.add("incident-layer-new");break;case"updated":t.classList.add("incident-layer-updated");break;case"extreme":t.classList.add("incident-layer-extreme")}}getPolygonBounds(){if(0===this._layers.size)return null;let t=null;for(const e of this._layers.values()){const i=e.getBounds();i.isValid()&&(t?t.extend(i):t=i)}return t}getIncidentPositions(){const t=[];for(const e of this._incidents.values())t.push([e.latitude,e.longitude]);return t}get polygonCount(){return this._layers.size}get incidentCount(){return this._incidents.size}clear(){for(const t of this._activeTransitions.values())cancelAnimationFrame(t);this._activeTransitions.clear();for(const t of this._layers.values())t.remove();this._layers.clear(),this._incidents.clear(),this._incidentHashes.clear(),this._knownEntityIds.clear(),this._previousGeometries.clear()}destroy(){this.clear()}}const ne=[{value:"osm",label:"OpenStreetMap"},{value:"cartodb",label:"CartoDB"},{value:"mapbox",label:"Mapbox (requires API key)"},{value:"custom",label:"Custom URL"}],re=[{value:"auto",label:"Auto (from Home Assistant)"},{value:"light",label:"Always Light"},{value:"dark",label:"Always Dark"}],se=[{value:"australian",label:"Australian Warning System (Default)"},{value:"us_nws",label:"US National Weather Service"},{value:"eu_meteo",label:"European Meteorological"},{value:"high_contrast",label:"High Contrast (Accessibility)"},{value:"custom",label:"Custom Colors"}],ae=[{level:"extreme",label:"Emergency Warning"},{level:"severe",label:"Watch and Act"},{level:"moderate",label:"Advice"},{level:"minor",label:"Information"}];let le=class extends lt{static{this.styles=s`
    .editor-container {
      padding: 16px;
    }

    .section {
      margin-bottom: 24px;
    }

    .section-title {
      font-weight: 500;
      margin-bottom: 12px;
      color: var(--primary-text-color);
      border-bottom: 1px solid var(--divider-color);
      padding-bottom: 8px;
    }

    .form-row {
      margin-bottom: 16px;
    }

    .form-row-inline {
      display: flex;
      gap: 16px;
      margin-bottom: 16px;
    }

    .form-row-inline > * {
      flex: 1;
    }

    ha-textfield,
    ha-select {
      width: 100%;
    }

    ha-entity-picker {
      width: 100%;
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }

    .toggle-label {
      font-size: 14px;
    }

    .toggle-description {
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .slider-row {
      margin-bottom: 16px;
    }

    .slider-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .slider-label {
      font-size: 14px;
    }

    .slider-value {
      font-size: 14px;
      font-weight: 500;
      color: var(--primary-color);
    }

    ha-slider {
      width: 100%;
    }

    .source-help {
      padding: 12px;
      background: var(--card-background-color, #f5f5f5);
      border-radius: 4px;
      margin-top: 8px;
    }

    .help-text {
      font-size: 12px;
      color: var(--secondary-text-color);
      margin-bottom: 8px;
    }

    .help-list {
      margin: 0;
      padding-left: 20px;
      font-size: 12px;
      color: var(--secondary-text-color);
    }

    .help-list li {
      margin-bottom: 4px;
    }

    .help-list code {
      background: var(--code-background-color, rgba(0,0,0,0.1));
      padding: 2px 4px;
      border-radius: 2px;
      font-family: monospace;
      font-size: 11px;
    }

    .color-row {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }

    .color-swatch {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: 1px solid var(--divider-color);
      flex-shrink: 0;
    }

    .color-label {
      flex: 1;
      font-size: 14px;
    }

    .color-input {
      width: 80px;
      padding: 4px 8px;
      border: 1px solid var(--divider-color);
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
      background: var(--card-background-color);
      color: var(--primary-text-color);
    }

    .color-input:focus {
      outline: none;
      border-color: var(--primary-color);
    }

    .color-picker-wrapper {
      position: relative;
    }

    .color-picker {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .color-preview-row {
      display: flex;
      gap: 8px;
      margin-top: 12px;
      padding: 8px;
      background: var(--card-background-color);
      border-radius: 4px;
    }

    .color-preview-swatch {
      flex: 1;
      height: 24px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 500;
    }
  `}setConfig(t){this._config=t}render(){return this.hass&&this._config?G`
      <div class="editor-container">
        <!-- Basic Settings -->
        <div class="section">
          <div class="section-title">Basic Settings</div>

          <div class="form-row">
            <ha-textfield
              label="Title"
              .value=${this._config.title||""}
              @input=${this._valueChanged}
              .configKey=${"title"}
            ></ha-textfield>
          </div>

          <div class="form-row">
            <ha-entity-picker
              .hass=${this.hass}
              .value=${this._config.entity||""}
              .label=${"Primary Entity (optional)"}
              .includeDomains=${["person","device_tracker","geo_location"]}
              @value-changed=${this._entityChanged}
              allow-custom-entity
            ></ha-entity-picker>
          </div>
        </div>

        <!-- Map Settings -->
        <div class="section">
          <div class="section-title">Map Settings</div>

          ${this._renderSlider("Default Zoom","default_zoom",this._config.default_zoom??10,1,20)}

          <div class="form-row">
            <ha-select
              label="Tile Provider"
              .value=${this._config.tile_provider||"osm"}
              @selected=${this._tileProviderChanged}
              @closed=${t=>t.stopPropagation()}
            >
              ${ne.map(t=>G`
                  <mwc-list-item .value=${t.value}>
                    ${t.label}
                  </mwc-list-item>
                `)}
            </ha-select>
          </div>

          ${"mapbox"===this._config.tile_provider?G`
                <div class="form-row">
                  <ha-textfield
                    label="Mapbox API Key"
                    .value=${this._config.api_key||""}
                    @input=${this._valueChanged}
                    .configKey=${"api_key"}
                    type="password"
                  ></ha-textfield>
                </div>
              `:Z}

          ${"custom"===this._config.tile_provider?G`
                <div class="form-row">
                  <ha-textfield
                    label="Custom Tile URL"
                    .value=${this._config.tile_url||""}
                    @input=${this._valueChanged}
                    .configKey=${"tile_url"}
                    placeholder="https://{s}.tile.example.com/{z}/{x}/{y}.png"
                  ></ha-textfield>
                </div>
              `:Z}

          <div class="form-row">
            <ha-select
              label="Theme Mode"
              .value=${this._normalizeDarkMode(this._config.dark_mode)}
              @selected=${this._darkModeChanged}
              @closed=${t=>t.stopPropagation()}
            >
              ${re.map(t=>G`
                  <mwc-list-item .value=${t.value}>
                    ${t.label}
                  </mwc-list-item>
                `)}
            </ha-select>
          </div>

          ${this._renderToggle("Auto-fit Bounds","Automatically zoom to show all entities","auto_fit",this._config.auto_fit??!0)}
        </div>

        <!-- Display Options -->
        <div class="section">
          <div class="section-title">Display Options</div>

          ${this._renderToggle("Show Zones","Display Home Assistant zones on map","show_zones",this._config.show_zones??!0)}

          ${this._renderToggle("Show Warning Levels","Display ABC Emergency incident polygons","show_warning_levels",this._config.show_warning_levels??!0)}

          ${this._renderToggle("Hide Markers for Polygons","Don't show point markers for incidents with polygon boundaries","hide_markers_for_polygons",this._config.hide_markers_for_polygons??!0)}

          ${this._renderToggle("Show History Trails","Display movement history for entities","show_history",this._config.show_history??!1)}

          ${this._config.show_history?this._renderSlider("History Hours","hours_to_show",this._config.hours_to_show??24,1,168):Z}

          ${this._renderToggle("Show Badge","Display incident count badge in header","show_badge",this._config.show_badge??!0)}
        </div>

        <!-- Alert Colors -->
        <div class="section">
          <div class="section-title">Alert Colors</div>

          <div class="form-row">
            <ha-select
              label="Color Preset"
              .value=${this._getEffectivePreset()}
              @selected=${this._alertColorPresetChanged}
              @closed=${t=>t.stopPropagation()}
            >
              ${se.map(t=>G`
                  <mwc-list-item .value=${t.value}>
                    ${t.label}
                  </mwc-list-item>
                `)}
            </ha-select>
          </div>

          ${"custom"===this._getEffectivePreset()?this._renderCustomColors():Z}

          <!-- Color Preview -->
          <div class="color-preview-row">
            ${ae.map(({level:t,label:e})=>{const i=this._getEffectiveColor(t),o=this._getContrastColor(i);return G`
                <div
                  class="color-preview-swatch"
                  style="background: ${i}; color: ${o};"
                  title="${e}"
                >
                  ${t.charAt(0).toUpperCase()}
                </div>
              `})}
          </div>
        </div>

        <!-- Dynamic Entity Sources -->
        <div class="section">
          <div class="section-title">Dynamic Entity Sources (ABC Emergency)</div>

          <div class="form-row">
            <ha-textfield
              label="Geo-Location Sources (comma-separated)"
              .value=${(this._config.geo_location_sources??[]).join(", ")}
              @input=${this._geoLocationSourcesChanged}
              placeholder="sensor.abc_emergency_treehouse_incidents_total"
              helper="Sensors exposing entity_ids attribute for dynamic geo_location discovery"
            ></ha-textfield>
          </div>

          <div class="source-help">
            <div class="help-text">
              Configure sensors or binary_sensors that expose lists of geo_location entities:
            </div>
            <ul class="help-list">
              <li><code>sensor.*_incidents_total</code> - All incidents</li>
              <li><code>sensor.*_bushfires</code> - Bushfire incidents</li>
              <li><code>sensor.*_watch_and_acts</code> - Watch and Act level</li>
              <li><code>binary_sensor.*_inside_polygon</code> - Containing incidents</li>
            </ul>
          </div>
        </div>

        <!-- Animation Settings -->
        <div class="section">
          <div class="section-title">Animation Settings</div>

          ${this._renderToggle("Enable Animations","Pulse/glow effects for incidents","animations_enabled",this._config.animations_enabled??!0)}

          ${this._renderToggle("Geometry Transitions","Smooth polygon boundary transitions","geometry_transitions",this._config.geometry_transitions??!0)}

          ${this._config.geometry_transitions?this._renderSlider("Transition Duration (ms)","transition_duration",this._config.transition_duration??500,100,2e3):Z}
        </div>
      </div>
    `:G``}_renderToggle(t,e,i,o){return G`
      <div class="toggle-row">
        <div>
          <div class="toggle-label">${t}</div>
          <div class="toggle-description">${e}</div>
        </div>
        <ha-switch
          .checked=${o}
          @change=${t=>this._toggleChanged(t,i)}
        ></ha-switch>
      </div>
    `}_renderSlider(t,e,i,o,n){return G`
      <div class="slider-row">
        <div class="slider-header">
          <span class="slider-label">${t}</span>
          <span class="slider-value">${i}</span>
        </div>
        <ha-slider
          .value=${i}
          .min=${o}
          .max=${n}
          .step=${1}
          pin
          @change=${t=>this._sliderChanged(t,e)}
        ></ha-slider>
      </div>
    `}_valueChanged(t){const e=t.target,i=e.configKey,o=e.value;i&&this._updateConfig({[i]:o||void 0})}_entityChanged(t){this._updateConfig({entity:t.detail.value||void 0})}_tileProviderChanged(t){this._updateConfig({tile_provider:t.target.value})}_normalizeDarkMode(t){return void 0===t?"auto":"boolean"==typeof t?t?"dark":"light":t}_darkModeChanged(t){this._updateConfig({dark_mode:t.target.value})}_toggleChanged(t,e){const i=t.target;this._updateConfig({[e]:i.checked})}_sliderChanged(t,e){const i=t.target;this._updateConfig({[e]:Number(i.value)})}_geoLocationSourcesChanged(t){const e=t.target.value.trim();if(!e)return void this._updateConfig({geo_location_sources:void 0});const i=e.split(",").map(t=>t.trim()).filter(t=>t.length>0);this._updateConfig({geo_location_sources:i.length>0?i:void 0})}_getEffectivePreset(){return this._config?.alert_colors&&Object.keys(this._config.alert_colors).length>0?"custom":this._config?.alert_color_preset||"australian"}_getEffectiveColor(t){if(this._config?.alert_colors?.[t])return this._config.alert_colors[t];const e=this._config?.alert_color_preset||"australian";return bt[e]?.[t]||vt[t]}_getContrastColor(t){const e=t.replace("#","");return(.299*parseInt(e.substring(0,2),16)+.587*parseInt(e.substring(2,4),16)+.114*parseInt(e.substring(4,6),16))/255>.5?"#000000":"#ffffff"}_alertColorPresetChanged(t){const e=t.target.value;if("custom"===e){const t={};for(const{level:e}of ae)t[e]=this._getEffectiveColor(e);this._updateConfig({alert_color_preset:void 0,alert_colors:t})}else this._updateConfig({alert_color_preset:e,alert_colors:void 0})}_renderCustomColors(){return G`
      <div class="form-row">
        ${ae.map(({level:t,label:e})=>{const i=this._config?.alert_colors?.[t]||vt[t];return G`
            <div class="color-row">
              <input
                type="color"
                class="color-picker"
                .value=${i}
                @input=${e=>this._customColorChanged(e,t)}
              />
              <span class="color-label">${e}</span>
              <input
                type="text"
                class="color-input"
                .value=${i}
                @input=${e=>this._customColorTextChanged(e,t)}
                placeholder="#000000"
              />
            </div>
          `})}
      </div>
    `}_customColorChanged(t,e){this._updateAlertColor(e,t.target.value)}_customColorTextChanged(t,e){const i=t.target.value.trim();/^#[0-9A-Fa-f]{6}$/.test(i)&&this._updateAlertColor(e,i)}_updateAlertColor(t,e){this._updateConfig({alert_colors:{...this._config?.alert_colors||{},[t]:e}})}_updateConfig(t){if(!this._config)return;const e={...this._config,...t};this._config=e;const i=new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0});this.dispatchEvent(i)}};t([ut({attribute:!1})],le.prototype,"hass",void 0),t([gt()],le.prototype,"_config",void 0),le=t([dt("abc-emergency-map-card-editor")],le);const ce=[-25.2744,133.7751];let de=class extends lt{constructor(){super(...arguments),this._loadingState="loading",this._currentDarkMode=!1}static{this.styles=mt}setConfig(t){if(!t)throw new Error("Invalid configuration");this._config={title:"ABC Emergency Map",default_zoom:10,hours_to_show:24,dark_mode:_t,show_warning_levels:!0,...t}}render(){if(!this._config)return G`<ha-card>Invalid configuration</ha-card>`;return G`
      <ha-card class="${this._currentDarkMode?"theme-dark":"theme-light"}">
        <!-- Skip link for keyboard navigation -->
        <a
          href="#map-content-end"
          class="skip-link"
          @click=${this._handleSkipLink}
        >
          Skip map content
        </a>

        ${this._config.title?G`
            <div class="card-header">
              <span class="header-title" id="map-title">${this._config.title}</span>
            </div>
          `:""}
        <div
          class="map-wrapper"
          role="region"
          aria-label="${this._config.title||"Map"}"
        >
          ${this._renderMapContent()}
        </div>

        <!-- End marker for skip link -->
        <div id="map-content-end" tabindex="-1"></div>
      </ha-card>
    `}_handleSkipLink(t){t.preventDefault();const e=this.shadowRoot?.getElementById("map-content-end");e&&e.focus()}_renderMapContent(){switch(this._loadingState){case"loading":return G`
          <div class="loading-container" role="status" aria-label="Loading map">
            <ha-circular-progress indeterminate></ha-circular-progress>
            <div class="loading-text">Loading map...</div>
          </div>
        `;case"error":return G`
          <div class="error-container" role="alert">
            <ha-icon icon="mdi:alert-circle" aria-hidden="true"></ha-icon>
            <div class="error-text">
              ${this._errorMessage||"Failed to load map"}
            </div>
            <mwc-button @click=${this._retryLoad}>Retry</mwc-button>
          </div>
        `;default:return G`
          <div
            class="map-container"
            id="map"
            role="application"
            aria-label="Interactive emergency map. Use arrow keys to pan, plus and minus to zoom."
            tabindex="0"
            @keydown=${this._handleMapKeydown}
          ></div>
        `}}_handleMapKeydown(t){if(!this._map)return;const e=100;switch(t.key){case"ArrowUp":t.preventDefault(),this._map.panBy([0,-100]);break;case"ArrowDown":t.preventDefault(),this._map.panBy([0,e]);break;case"ArrowLeft":t.preventDefault(),this._map.panBy([-100,0]);break;case"ArrowRight":t.preventDefault(),this._map.panBy([e,0]);break;case"+":case"=":t.preventDefault(),this._map.zoomIn(1);break;case"-":case"_":t.preventDefault(),this._map.zoomOut(1);break;case"Home":if(t.preventDefault(),this._boundsManager){const t=[];this._markerManager&&t.push(...this._markerManager.getMarkerPositions()),this._zoneManager&&t.push(...this._zoneManager.getZonePositions()),this._incidentManager&&t.push(...this._incidentManager.getIncidentPositions()),this._boundsManager.fitToPositions(t,!0)}}}async firstUpdated(t){super.firstUpdated(t),await this._initializeMap()}updated(t){super.updated(t),t.has("hass")&&this._map&&(this._checkThemeChange(),this._updateTileLayer(),this._updateMapData())}_checkThemeChange(){const t=this._isDarkMode();t!==this._currentDarkMode&&(this._currentDarkMode=t,this._currentTileConfig=void 0)}disconnectedCallback(){super.disconnectedCallback(),this._removeThemeListener(),this._cleanup()}connectedCallback(){super.connectedCallback(),this._addThemeListener(),"ready"!==this._loadingState||this._map||this._initializeMap()}_addThemeListener(){this._boundThemeHandler=()=>{this._checkThemeChange(),this._map&&this._updateTileLayer()},window.addEventListener("settheme",this._boundThemeHandler),window.addEventListener("theme-changed",this._boundThemeHandler)}_removeThemeListener(){this._boundThemeHandler&&(window.removeEventListener("settheme",this._boundThemeHandler),window.removeEventListener("theme-changed",this._boundThemeHandler),this._boundThemeHandler=void 0)}async _initializeMap(){console.log("ABC Emergency Map: Initializing map (v2.0 - Shadow DOM CSS fix)"),this._loadingState="loading",this._errorMessage=void 0,this._currentDarkMode=this._isDarkMode();try{await St(),this.shadowRoot&&await Et(this.shadowRoot),this._loadingState="ready",await this.updateComplete;const t=this.shadowRoot?.getElementById("map");if(!t)throw new Error("Map container not found in shadow DOM");const e=this._getInitialCenter();this._map=L.map(t,{center:e,zoom:this._config?.default_zoom??4,zoomControl:!0,attributionControl:!0}),this._updateTileLayer(),this._markerManager=new Nt(this._map),this._zoneManager=new Ft(this._map,this._config),this._boundsManager=new Gt(this._map,this._config),this._boundsManager.addFitControl(),this._historyManager=new Vt(this._map,this._config),this._incidentManager=new oe(this._map,this._config),this._setupResizeObserver(t),this._handleResize(),this.hass&&this._updateMapData()}catch(t){console.error("ABC Emergency Map: Failed to initialize map:",t),this._loadingState="error",this._errorMessage=t instanceof Error?t.message:"Unknown error occurred"}}_getInitialCenter(){return void 0!==this.hass?.config?.latitude&&void 0!==this.hass?.config?.longitude?(console.log("ABC Emergency Map: Using HA home location:",this.hass.config.latitude,this.hass.config.longitude),[this.hass.config.latitude,this.hass.config.longitude]):(console.log("ABC Emergency Map: No HA location, using default:",ce),ce)}_isDarkMode(){const t=this._config?.dark_mode??_t;if("boolean"==typeof t)return t;switch(t){case"dark":return!0;case"light":return!1;default:return this._detectHADarkMode()}}_detectHADarkMode(){const t=this.hass?.themes;if(void 0!==t?.darkMode)return t.darkMode;if(window.matchMedia?.("(prefers-color-scheme: dark)").matches)return!0;const e=this.hass?.themes?.theme;return!(!e||!e.toLowerCase().includes("dark"))}_updateTileLayer(){if(!this._map||!this._config)return;const t=this._isDarkMode(),e=zt(this._config,t);this._currentTileConfig&&this._currentTileConfig.url===e.url&&this._currentTileConfig.attribution===e.attribution||(this._tileLayer&&this._tileLayer.remove(),this._tileLayer=L.tileLayer(e.url,{attribution:e.attribution,maxZoom:e.maxZoom,subdomains:e.subdomains}).addTo(this._map),this._currentTileConfig=e)}_setupResizeObserver(t){this._resizeObserver&&this._resizeObserver.disconnect(),this._resizeObserver=new ResizeObserver(()=>{this._resizeDebounce&&window.clearTimeout(this._resizeDebounce),this._resizeDebounce=window.setTimeout(()=>{this._handleResize()},100)}),this._resizeObserver.observe(t)}_handleResize(){this._map&&this._map.invalidateSize({animate:!1})}_cleanup(){this._resizeDebounce&&(window.clearTimeout(this._resizeDebounce),this._resizeDebounce=void 0),this._resizeObserver&&(this._resizeObserver.disconnect(),this._resizeObserver=void 0),this._tileLayer&&(this._tileLayer.remove(),this._tileLayer=void 0),this._markerManager&&(this._markerManager.destroy(),this._markerManager=void 0),this._zoneManager&&(this._zoneManager.destroy(),this._zoneManager=void 0),this._boundsManager&&(this._boundsManager.destroy(),this._boundsManager=void 0),this._historyManager&&(this._historyManager.destroy(),this._historyManager=void 0),this._incidentManager&&(this._incidentManager.destroy(),this._incidentManager=void 0),this._currentTileConfig=void 0,this._map&&(this._map.remove(),this._map=void 0)}async _retryLoad(){await this._initializeMap()}_updateMapData(){if(!this._map||!this.hass||!this._config)return;if(this._zoneManager){this._zoneManager.updateConfig(this._config);const t=function(t){const e=[];for(const i of Object.keys(t.states)){if(!Ut(i))continue;const o=Rt(i,t.states[i]);o&&e.push(o)}return e}(this.hass);console.log("ABC Emergency Map: Found zones:",t.length,t.map(t=>t.entityId)),this._zoneManager.updateZones(t)}const t=this._markerManager?Bt(this.hass,this._config):[];console.log("ABC Emergency Map: Found entities:",t.length,t.map(t=>t.entityId));const e=this._config.hide_markers_for_polygons??true?t.filter(t=>{const e=this.hass.states[t.entityId];if(!e)return!0;const i=e.attributes.geojson||e.attributes.geometry;if(!i)return!0;const o=i.type||e.attributes.geometry_type;return"Polygon"===o||"MultiPolygon"===o||"GeometryCollection"===o?(console.log("ABC Emergency Map: Skipping marker for polygon entity:",t.entityId,"type:",o),!1):("Point"===o&&console.log("ABC Emergency Map: Rendering Point geometry as marker:",t.entityId),!0)}):t;if(this._markerManager&&this._markerManager.updateMarkers(e),this._historyManager){this._historyManager.updateConfig(this._config);const t=e.map(t=>t.entityId);this._historyManager.updateTrails(this.hass,t)}if(this._incidentManager&&!1!==this._config.show_warning_levels){this._incidentManager.updateConfig(this._config);const e=t.map(t=>t.entityId);this._incidentManager.updatePolygonsForEntities(this.hass,e)}if(this._boundsManager){this._boundsManager.updateConfig(this._config);const t=[];this._markerManager&&t.push(...this._markerManager.getMarkerPositions()),this._zoneManager&&t.push(...this._zoneManager.getZonePositions());const e=this._incidentManager?.getPolygonBounds();console.log("ABC Emergency Map: Total positions for bounds:",t.length,t),console.log("ABC Emergency Map: Polygon bounds:",e?.toBBoxString()),this._boundsManager.fitToPositionsAndBounds(t,e)}}getCardSize(){return 5}static getConfigElement(){return document.createElement("abc-emergency-map-card-editor")}static getStubConfig(){return{type:"custom:abc-emergency-map-card",title:"ABC Emergency Map"}}};t([ut({attribute:!1})],de.prototype,"hass",void 0),t([gt()],de.prototype,"_config",void 0),t([gt()],de.prototype,"_loadingState",void 0),t([gt()],de.prototype,"_errorMessage",void 0),t([gt()],de.prototype,"_currentDarkMode",void 0),de=t([dt("abc-emergency-map-card")],de),window.customCards=window.customCards||[],window.customCards.push({type:"abc-emergency-map-card",name:"ABC Emergency Map Card",description:"Display ABC Emergency incident polygons on a Leaflet map with Australian Warning System colors",preview:!0});export{de as ABCEmergencyMapCard};
//# sourceMappingURL=abc-emergency-map-card.js.map
