
(() => {
  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const prefersDark = matchMedia("(prefers-color-scheme: dark)").matches;

  const THEME_KEY = "themeOverride";
  const root = document.documentElement;

  function applyTheme(mode){
    if(mode === "dark") root.setAttribute("data-theme","dark");
    else if(mode === "light") root.setAttribute("data-theme","light");
    else root.setAttribute("data-theme", prefersDark ? "dark" : "light");

    const btn = document.getElementById("themeToggle");
    if(btn){
      const current = root.getAttribute("data-theme");
      btn.textContent = current === "dark" ? "Lights off" : "Lights on";
    }
  }

  applyTheme(localStorage.getItem(THEME_KEY));

  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const current = root.getAttribute("data-theme");
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  matchMedia("(prefers-color-scheme: dark)")?.addEventListener?.("change", () => {
    if(!localStorage.getItem(THEME_KEY)) applyTheme(null);
  });

  // Reveal on scroll
  const els = [...document.querySelectorAll("[data-reveal]")];
  if(!prefersReduced && "IntersectionObserver" in window){
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.classList.add("revealed");
          io.unobserve(e.target);
        }
      });
    }, {threshold: .10, rootMargin: '0px 0px -6% 0px'});
    els.forEach(el => io.observe(el));
  } else {
    els.forEach(el => el.classList.add("revealed"));
  }

  // Active nav
  document.querySelector('[data-nav="home"]')?.setAttribute("aria-current","page");
})();


// About photo stack drag
(() => {
  const stack = document.querySelector("[data-photo-stack]");
  if(!stack) return;

  const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if(prefersReduced) return;

  const cards = [...stack.querySelectorAll(".photoCard")];
  cards.forEach((c,i)=> c.style.zIndex = String(10+i));

  cards.forEach(card => {
    card.addEventListener("pointerdown", (e) => {
      card.setPointerCapture?.(e.pointerId);

      const rect = stack.getBoundingClientRect();
      const r = card.getBoundingClientRect();
      const offsetX = e.clientX - r.left;
      const offsetY = e.clientY - r.top;

      // bring to front
      const maxZ = Math.max(...cards.map(p => Number(p.style.zIndex || 0)));
      card.style.zIndex = String(maxZ + 1);

      // convert transform-based placement to absolute pixels on first drag
      if(!card.dataset.abs){
        const left = r.left - rect.left;
        const top  = r.top  - rect.top;
        card.style.left = left + "px";
        card.style.top  = top + "px";
        card.style.transform = `rotate(${card.dataset.r || "0deg"})`;
        card.style.position = "absolute";
        card.dataset.abs = "1";
      }

      const move = (ev) => {
        const x = ev.clientX - rect.left - offsetX;
        const y = ev.clientY - rect.top - offsetY;

        // clamp slightly
        const pad = 10;
        const maxX = rect.width - r.width - pad;
        const maxY = rect.height - r.height - pad;

        const cx = Math.max(pad, Math.min(maxX, x));
        const cy = Math.max(pad, Math.min(maxY, y));
        card.style.left = cx + "px";
        card.style.top  = cy + "px";
      };

      const up = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
      };

      window.addEventListener("pointermove", move, { passive: true });
      window.addEventListener("pointerup", up, { once: true });
    });
  });
})();
