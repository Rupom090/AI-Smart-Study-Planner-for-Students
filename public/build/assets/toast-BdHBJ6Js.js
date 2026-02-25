import{r as p}from"./app-C4-pLAxr.js";let D={data:""},L=e=>{if(typeof window=="object"){let t=(e?e.querySelector("#_goober"):window._goober)||Object.assign(document.createElement("style"),{innerHTML:" ",id:"_goober"});return t.nonce=window.__nonce__,t.parentNode||(e||document.head).appendChild(t),t.firstChild}return e||D},S=/(?:([\u0080-\uFFFF\w-%@]+) *:? *([^{;]+?);|([^;}{]*?) *{)|(}\s*)/g,P=/\/\*[^]*?\*\/|  +/g,F=/\n+/g,g=(e,t)=>{let r="",o="",i="";for(let s in e){let a=e[s];s[0]=="@"?s[1]=="i"?r=s+" "+a+";":o+=s[1]=="f"?g(a,s):s+"{"+g(a,s[1]=="k"?"":t)+"}":typeof a=="object"?o+=g(a,t?t.replace(/([^,])+/g,n=>s.replace(/([^,]*:\S+\([^)]*\))|([^,])+/g,l=>/&/.test(l)?l.replace(/&/g,n):n?n+" "+l:l)):s):a!=null&&(s=/^--/.test(s)?s:s.replace(/[A-Z]/g,"-$&").toLowerCase(),i+=g.p?g.p(s,a):s+":"+a+";")}return r+(t&&i?t+"{"+i+"}":i)+o},u={},O=e=>{if(typeof e=="object"){let t="";for(let r in e)t+=r+O(e[r]);return t}return e},B=(e,t,r,o,i)=>{let s=O(e),a=u[s]||(u[s]=(l=>{let d=0,m=11;for(;d<l.length;)m=101*m+l.charCodeAt(d++)>>>0;return"go"+m})(s));if(!u[a]){let l=s!==e?e:(d=>{let m,b,h=[{}];for(;m=S.exec(d.replace(P,""));)m[4]?h.shift():m[3]?(b=m[3].replace(F," ").trim(),h.unshift(h[0][b]=h[0][b]||{})):h[0][m[1]]=m[2].replace(F," ").trim();return h[0]})(e);u[a]=g(i?{["@keyframes "+a]:l}:l,r?"":"."+a)}let n=r&&u.g?u.g:null;return r&&(u.g=u[a]),((l,d,m,b)=>{b?d.data=d.data.replace(b,l):d.data.indexOf(l)===-1&&(d.data=m?l+d.data:d.data+l)})(u[a],t,o,n),a},H=(e,t,r)=>e.reduce((o,i,s)=>{let a=t[s];if(a&&a.call){let n=a(r),l=n&&n.props&&n.props.className||/^go/.test(n)&&n;a=l?"."+l:n&&typeof n=="object"?n.props?"":g(n,""):n===!1?"":n}return o+i+(a??"")},"");function E(e){let t=this||{},r=e.call?e(t.p):e;return B(r.unshift?r.raw?H(r,[].slice.call(arguments,1),t.p):r.reduce((o,i)=>Object.assign(o,i&&i.call?i(t.p):i),{}):r,L(t.target),t.g,t.o,t.k)}let _,k,j;E.bind({g:1});let f=E.bind({k:1});function M(e,t,r,o){g.p=t,_=e,k=r,j=o}function y(e,t){let r=this||{};return function(){let o=arguments;function i(s,a){let n=Object.assign({},s),l=n.className||i.className;r.p=Object.assign({theme:k&&k()},n),r.o=/ *go\d+/.test(l),n.className=E.apply(r,o)+(l?" "+l:"");let d=e;return e[0]&&(d=n.as||e,delete n.as),j&&d[0]&&j(n),_(d,n)}return i}}var Z=e=>typeof e=="function",A=(e,t)=>Z(e)?e(t):e,q=(()=>{let e=0;return()=>(++e).toString()})(),Q=(()=>{let e;return()=>{if(e===void 0&&typeof window<"u"){let t=matchMedia("(prefers-reduced-motion: reduce)");e=!t||t.matches}return e}})(),R=20,I="default",N=(e,t)=>{let{toastLimit:r}=e.settings;switch(t.type){case 0:return{...e,toasts:[t.toast,...e.toasts].slice(0,r)};case 1:return{...e,toasts:e.toasts.map(a=>a.id===t.toast.id?{...a,...t.toast}:a)};case 2:let{toast:o}=t;return N(e,{type:e.toasts.find(a=>a.id===o.id)?1:0,toast:o});case 3:let{toastId:i}=t;return{...e,toasts:e.toasts.map(a=>a.id===i||i===void 0?{...a,dismissed:!0,visible:!1}:a)};case 4:return t.toastId===void 0?{...e,toasts:[]}:{...e,toasts:e.toasts.filter(a=>a.id!==t.toastId)};case 5:return{...e,pausedAt:t.time};case 6:let s=t.time-(e.pausedAt||0);return{...e,pausedAt:void 0,toasts:e.toasts.map(a=>({...a,pauseDuration:a.pauseDuration+s}))}}},W=[],Y={toasts:[],pausedAt:void 0,settings:{toastLimit:R}},v={},C=(e,t=I)=>{v[t]=N(v[t]||Y,e),W.forEach(([r,o])=>{r===t&&o(v[t])})},T=e=>Object.keys(v).forEach(t=>C(e,t)),G=e=>Object.keys(v).find(t=>v[t].toasts.some(r=>r.id===e)),z=(e=I)=>t=>{C(t,e)},J=(e,t="blank",r)=>({createdAt:Date.now(),visible:!0,dismissed:!1,type:t,ariaProps:{role:"status","aria-live":"polite"},message:e,pauseDuration:0,...r,id:r?.id||q()}),$=e=>(t,r)=>{let o=J(t,e,r);return z(o.toasterId||G(o.id))({type:2,toast:o}),o.id},c=(e,t)=>$("blank")(e,t);c.error=$("error");c.success=$("success");c.loading=$("loading");c.custom=$("custom");c.dismiss=(e,t)=>{let r={type:3,toastId:e};t?z(t)(r):T(r)};c.dismissAll=e=>c.dismiss(void 0,e);c.remove=(e,t)=>{let r={type:4,toastId:e};t?z(t)(r):T(r)};c.removeAll=e=>c.remove(void 0,e);c.promise=(e,t,r)=>{let o=c.loading(t.loading,{...r,...r?.loading});return typeof e=="function"&&(e=e()),e.then(i=>{let s=t.success?A(t.success,i):void 0;return s?c.success(s,{id:o,...r,...r?.success}):c.dismiss(o),i}).catch(i=>{let s=t.error?A(t.error,i):void 0;s?c.error(s,{id:o,...r,...r?.error}):c.dismiss(o)}),e};var K=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
 transform: scale(1) rotate(45deg);
  opacity: 1;
}`,U=f`
from {
  transform: scale(0);
  opacity: 0;
}
to {
  transform: scale(1);
  opacity: 1;
}`,V=f`
from {
  transform: scale(0) rotate(90deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(90deg);
	opacity: 1;
}`,X=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#ff4b4b"};
  position: relative;
  transform: rotate(45deg);

  animation: ${K} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;

  &:after,
  &:before {
    content: '';
    animation: ${U} 0.15s ease-out forwards;
    animation-delay: 150ms;
    position: absolute;
    border-radius: 3px;
    opacity: 0;
    background: ${e=>e.secondary||"#fff"};
    bottom: 9px;
    left: 4px;
    height: 2px;
    width: 12px;
  }

  &:before {
    animation: ${V} 0.15s ease-out forwards;
    animation-delay: 180ms;
    transform: rotate(90deg);
  }
`,ee=f`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,te=y("div")`
  width: 12px;
  height: 12px;
  box-sizing: border-box;
  border: 2px solid;
  border-radius: 100%;
  border-color: ${e=>e.secondary||"#e0e0e0"};
  border-right-color: ${e=>e.primary||"#616161"};
  animation: ${ee} 1s linear infinite;
`,re=f`
from {
  transform: scale(0) rotate(45deg);
	opacity: 0;
}
to {
  transform: scale(1) rotate(45deg);
	opacity: 1;
}`,ae=f`
0% {
	height: 0;
	width: 0;
	opacity: 0;
}
40% {
  height: 0;
	width: 6px;
	opacity: 1;
}
100% {
  opacity: 1;
  height: 10px;
}`,oe=y("div")`
  width: 20px;
  opacity: 0;
  height: 20px;
  border-radius: 10px;
  background: ${e=>e.primary||"#61d345"};
  position: relative;
  transform: rotate(45deg);

  animation: ${re} 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
  animation-delay: 100ms;
  &:after {
    content: '';
    box-sizing: border-box;
    animation: ${ae} 0.2s ease-out forwards;
    opacity: 0;
    animation-delay: 200ms;
    position: absolute;
    border-right: 2px solid;
    border-bottom: 2px solid;
    border-color: ${e=>e.secondary||"#fff"};
    bottom: 6px;
    left: 6px;
    height: 10px;
    width: 6px;
  }
`,se=y("div")`
  position: absolute;
`,ie=y("div")`
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 20px;
  min-height: 20px;
`,ne=f`
from {
  transform: scale(0.6);
  opacity: 0.4;
}
to {
  transform: scale(1);
  opacity: 1;
}`,le=y("div")`
  position: relative;
  transform: scale(0.6);
  opacity: 0.4;
  min-width: 20px;
  animation: ${ne} 0.3s 0.12s cubic-bezier(0.175, 0.885, 0.32, 1.275)
    forwards;
`,ce=({toast:e})=>{let{icon:t,type:r,iconTheme:o}=e;return t!==void 0?typeof t=="string"?p.createElement(le,null,t):t:r==="blank"?null:p.createElement(ie,null,p.createElement(te,{...o}),r!=="loading"&&p.createElement(se,null,r==="error"?p.createElement(X,{...o}):p.createElement(oe,{...o})))},de=e=>`
0% {transform: translate3d(0,${e*-200}%,0) scale(.6); opacity:.5;}
100% {transform: translate3d(0,0,0) scale(1); opacity:1;}
`,pe=e=>`
0% {transform: translate3d(0,0,-1px) scale(1); opacity:1;}
100% {transform: translate3d(0,${e*-150}%,-1px) scale(.6); opacity:0;}
`,me="0%{opacity:0;} 100%{opacity:1;}",ue="0%{opacity:1;} 100%{opacity:0;}",fe=y("div")`
  display: flex;
  align-items: center;
  background: #fff;
  color: #363636;
  line-height: 1.3;
  will-change: transform;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1), 0 3px 3px rgba(0, 0, 0, 0.05);
  max-width: 350px;
  pointer-events: auto;
  padding: 8px 10px;
  border-radius: 8px;
`,ge=y("div")`
  display: flex;
  justify-content: center;
  margin: 4px 10px;
  color: inherit;
  flex: 1 1 auto;
  white-space: pre-line;
`,ye=(e,t)=>{let r=e.includes("top")?1:-1,[o,i]=Q()?[me,ue]:[de(r),pe(r)];return{animation:t?`${f(o)} 0.35s cubic-bezier(.21,1.02,.73,1) forwards`:`${f(i)} 0.4s forwards cubic-bezier(.06,.71,.55,1)`}};p.memo(({toast:e,position:t,style:r,children:o})=>{let i=e.height?ye(e.position||t||"top-center",e.visible):{opacity:0},s=p.createElement(ce,{toast:e}),a=p.createElement(ge,{...e.ariaProps},A(e.message,e));return p.createElement(fe,{className:e.className,style:{...i,...r,...e.style}},typeof o=="function"?o({icon:s,message:a}):p.createElement(p.Fragment,null,s,a))});M(p.createElement);E`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;var w=c;const x={success:{duration:3e3,style:{background:"#10B981",color:"#fff"},iconTheme:{primary:"#fff",secondary:"#10B981"}},error:{duration:4e3,style:{background:"#EF4444",color:"#fff"},iconTheme:{primary:"#fff",secondary:"#EF4444"}},loading:{style:{background:"#3B82F6",color:"#fff"}}},he={success:e=>{w.success(e,x.success)},error:e=>{w.error(e,x.error)},loading:e=>w.loading(e,x.loading),promise:(e,t)=>w.promise(e,t,{success:x.success,error:x.error,loading:x.loading}),dismiss:e=>{w.dismiss(e)}};export{he as s};
