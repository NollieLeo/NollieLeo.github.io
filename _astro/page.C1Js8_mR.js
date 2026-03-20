const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["_astro/mermaid.core.CTtXgtyC.js","_astro/preload-helper.BlTxHScW.js","_astro/SwupA11yPlugin.BIyElFLX.js","_astro/index.modern.D46RI4Wq.js","_astro/Swup.BWOMRtvc.js","_astro/SwupPreloadPlugin.BFr0xV-N.js","_astro/SwupScrollPlugin.DTcbGiCQ.js","_astro/SwupHeadPlugin.DvOZNxAa.js","_astro/SwupScriptsPlugin.DeeT9ppa.js"])))=>i.map(i=>d[i]);
import{_ as d}from"./preload-helper.BlTxHScW.js";function c(e){return JSON.parse(e,w)}function w(e,t){if(Array.isArray(t)&&t.length===2&&typeof t[1]=="string"){const o=t[0];if(t=t[1],o===":regex:"){const r=t.match(/\/(.*?)\/([a-z]*)?$/i)||[];return new RegExp(r[1],r[2]||"")}if(o===":function:")return new Function(`return (${t}).apply(this, arguments);`)}return t}function p(e,{timeoutFallback:t=1e3}={}){"requestIdleCallback"in window?window.requestIdleCallback(()=>e()):setTimeout(()=>e(),t)}function _(e){document.readyState==="complete"?setTimeout(()=>e(),0):window.addEventListener("load",()=>e())}function y(e,{delayAfterLoad:t=0}={}){_(()=>{t>0?setTimeout(()=>p(e),t):p(e)})}const h=()=>document.querySelectorAll("pre.mermaid").length>0;let l=null;async function k(){return l||(console.log("[astro-mermaid] Loading mermaid.js..."),l=d(()=>import("./mermaid.core.CTtXgtyC.js").then(e=>e.bH),__vite__mapDeps([0,1])).then(async({default:e})=>{const t=[];if(t&&t.length>0){console.log("[astro-mermaid] Registering",t.length,"icon packs");const o=t.map(r=>({name:r.name,loader:new Function("return "+r.loader)()}));await e.registerIconPacks(o)}return e}).catch(e=>{throw console.error("[astro-mermaid] Failed to load mermaid:",e),l=null,e}),l)}const u={startOnLoad:!1,theme:"default"},v={light:"default",dark:"dark"};async function g(){console.log("[astro-mermaid] Initializing mermaid diagrams...");const e=document.querySelectorAll("pre.mermaid");if(console.log("[astro-mermaid] Found",e.length,"mermaid diagrams"),e.length===0)return;const t=await k();let o=u.theme;{const r=document.documentElement.getAttribute("data-theme"),s=document.body.getAttribute("data-theme");o=v[r||s]||u.theme,console.log("[astro-mermaid] Using theme:",o,"from",r?"html":"body")}t.initialize({...u,theme:o,gitGraph:{mainBranchName:"main",showCommitLabel:!0,showBranches:!0,rotateCommitLabel:!0}});for(const r of e){if(r.hasAttribute("data-processed"))continue;r.hasAttribute("data-diagram")||r.setAttribute("data-diagram",r.textContent||"");const s=r.getAttribute("data-diagram")||"",i="mermaid-"+Math.random().toString(36).slice(2,11);console.log("[astro-mermaid] Rendering diagram:",i);try{const n=document.getElementById(i);n&&n.remove();const{svg:m}=await t.render(i,s);r.innerHTML=m,r.setAttribute("data-processed","true"),console.log("[astro-mermaid] Successfully rendered diagram:",i)}catch(n){console.error("[astro-mermaid] Mermaid rendering error for diagram:",i,n),r.innerHTML=`<div style="color: red; padding: 1rem; border: 1px solid red; border-radius: 0.5rem;">
        <strong>Error rendering diagram:</strong><br/>
        ${n.message||"Unknown error"}
      </div>`,r.setAttribute("data-processed","true")}}}h()?(console.log("[astro-mermaid] Mermaid diagrams detected on initial load"),g()):console.log("[astro-mermaid] No mermaid diagrams found on initial load");{const e=new MutationObserver(t=>{for(const o of t)o.type==="attributes"&&o.attributeName==="data-theme"&&(document.querySelectorAll("pre.mermaid[data-processed]").forEach(r=>{r.removeAttribute("data-processed")}),g())});e.observe(document.documentElement,{attributes:!0,attributeFilter:["data-theme"]}),e.observe(document.body,{attributes:!0,attributeFilter:["data-theme"]})}document.addEventListener("astro:after-swap",()=>{console.log("[astro-mermaid] View transition detected"),h()&&g()});const f=document.createElement("style");f.textContent=`
            /* Prevent layout shifts by setting minimum height */
            pre.mermaid {
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 2rem 0;
              padding: 1rem;
              background-color: transparent;
              border: none;
              overflow: auto;
              min-height: 200px; /* Prevent layout shift */
              position: relative;
            }
            
            /* Loading state with skeleton loader */
            pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 200% 100%;
              animation: shimmer 1.5s infinite;
            }
            
            /* Dark mode skeleton loader */
            [data-theme="dark"] pre.mermaid:not([data-processed]) {
              background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
              background-size: 200% 100%;
            }
            
            @keyframes shimmer {
              0% {
                background-position: -200% 0;
              }
              100% {
                background-position: 200% 0;
              }
            }
            
            /* Show processed diagrams with smooth transition */
            pre.mermaid[data-processed] {
              animation: none;
              background: transparent;
              min-height: auto; /* Allow natural height after render */
            }
            
            /* Ensure responsive sizing for mermaid SVGs */
            pre.mermaid svg {
              max-width: 100%;
              height: auto;
            }
            
            /* Optional: Add subtle background for better visibility */
            @media (prefers-color-scheme: dark) {
              pre.mermaid[data-processed] {
                background-color: rgba(255, 255, 255, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            @media (prefers-color-scheme: light) {
              pre.mermaid[data-processed] {
                background-color: rgba(0, 0, 0, 0.02);
                border-radius: 0.5rem;
              }
            }
            
            /* Respect user's color scheme preference */
            [data-theme="dark"] pre.mermaid[data-processed] {
              background-color: rgba(255, 255, 255, 0.02);
              border-radius: 0.5rem;
            }
            
            [data-theme="light"] pre.mermaid[data-processed] {
              background-color: rgba(0, 0, 0, 0.02);
              border-radius: 0.5rem;
            }
          `;document.head.appendChild(f);async function E(){const[e,t,o,r,s,i]=await Promise.all([d(()=>import("./Swup.BWOMRtvc.js").then(a=>a.S),[]).then(a=>a.default),d(()=>import("./SwupA11yPlugin.BIyElFLX.js"),__vite__mapDeps([2,3,4])).then(a=>a.default),d(()=>import("./SwupPreloadPlugin.BFr0xV-N.js"),__vite__mapDeps([5,3,4])).then(a=>a.default),d(()=>import("./SwupScrollPlugin.DTcbGiCQ.js"),__vite__mapDeps([6,3,4])).then(a=>a.default),d(()=>import("./SwupHeadPlugin.DvOZNxAa.js"),__vite__mapDeps([7,3])).then(a=>a.default),d(()=>import("./SwupScriptsPlugin.DeeT9ppa.js"),__vite__mapDeps([8,3])).then(a=>a.default)]),n=new e({ignoreVisit:(a,{el:b,event:A}={})=>b?.closest("[data-no-swup]"),animationSelector:'[class*="transition-swup-"]',containers:["main","#toc"],cache:!0,native:!1,plugins:[new t(c("{}")),new o(c('{"preloadHoveredLinks":true,"preloadVisibleLinks":false}')),new r(c("{}")),new s(c('{"awaitAssets":true}')),new i(c("{}"))]}),m=a=>document.dispatchEvent(new Event(a));n.hooks.before("content:replace",()=>m("astro:before-swap")),n.hooks.on("content:replace",()=>m("astro:after-swap")),n.hooks.on("page:view",()=>m("astro:page-load")),window.swup=n}y(E);
