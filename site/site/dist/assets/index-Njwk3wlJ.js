(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const o of e)if(o.type==="childList")for(const i of o.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&s(i)}).observe(document,{childList:!0,subtree:!0});function n(e){const o={};return e.integrity&&(o.integrity=e.integrity),e.referrerPolicy&&(o.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?o.credentials="include":e.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function s(e){if(e.ep)return;e.ep=!0;const o=n(e);fetch(e.href,o)}})();let r=[];async function m(){return r.length>0||(r=await(await fetch("/catalog.json")).json()),r}async function p(a){const t=await m();a.innerHTML=`
    <header class="header">
      <h1>Game Portal</h1>
      <p class="subtitle">A collection of browser games</p>
    </header>
    <main class="game-grid">
      ${t.map(n=>`
        <article class="game-card" data-slug="${n.slug}">
          <img src="${n.thumbnail}" alt="${n.title}" class="game-thumbnail" />
          <div class="game-info">
            <h2 class="game-title">${n.title}</h2>
            <p class="game-description">${n.description}</p>
            <div class="game-tags">${n.tags.map(s=>`<span class="tag">${s}</span>`).join("")}</div>
            <button class="play-button" data-slug="${n.slug}">Play</button>
          </div>
        </article>
      `).join("")}
    </main>
  `,a.querySelectorAll(".play-button").forEach(n=>{n.addEventListener("click",s=>{const e=s.target.dataset.slug;e&&(window.history.pushState({},"",`/play/${e}`),u())})}),a.querySelectorAll(".game-card").forEach(n=>{n.addEventListener("click",s=>{const e=s.target.dataset.slug;e&&(window.history.pushState({},"",`/play/${e}`),u())})})}async function g(a,t){const s=(await m()).find(e=>e.slug===t);if(!s){a.innerHTML=`
      <main class="game-detail">
        <h1>Game not found</h1>
        <p><a href="/">Return home</a></p>
      </main>
    `;return}a.innerHTML=`
    <header class="header">
      <a href="/" class="back-link">← Back to games</a>
      <h1>${s.title}</h1>
    </header>
    <main class="game-detail">
      <div class="game-header">
        <img src="${s.icon}" alt="${s.title}" class="game-icon" />
        <div class="game-meta">
          ${s.tags.map(e=>`<span class="tag">${e}</span>`).join("")}
        </div>
      </div>
      <div class="game-play">
        <iframe src="/${s.playPath}" class="game-frame" frameborder="0" allowfullscreen></iframe>
      </div>
      <section class="game-info">
        <h2>About</h2>
        <p>${s.description}</p>
        <h2>Controls</h2>
        <ul class="controls-list">
          ${s.controls.map(e=>`<li>${e}</li>`).join("")}
        </ul>
      </section>
    </main>
  `}function u(){const a=window.location.pathname,t=f(a);t?g(document.getElementById("app"),t):p(document.getElementById("app"))}function f(a){const t=a.match(/^\/play\/([^/]+)/);return t?t[1]:null}const l=document.getElementById("app");if(!l)throw new Error("App container not found");const d={"/":()=>p(l)};function h(a){const t=a.match(/^\/play\/([^/]+)/);return t?t[1]:null}function c(){const a=window.location.pathname,t=h(a);if(t){g(l,t);return}(d[a]||d["/"])()}window.addEventListener("hashchange",c);window.addEventListener("popstate",c);c();
