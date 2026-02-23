import { SITES } from "./sites.js";

(() => {
  const logo = document.getElementById("logo");
  const avatar = document.getElementById("avatar");
  const grid = document.getElementById("service-grid");
  const topBtns = Array.from(document.querySelectorAll(".top-btn"));
  const bg = document.querySelector(".bg");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bio = document.getElementById("profile-bio");

  const renderBio = () => {
    if (!bio) return;
    const text = bio.dataset.text || "";
    const safe = escapeHTML(text).replaceAll("\n", "<br>");
    bio.innerHTML = safe;
  };

  const typeBio = () => {
    if (!bio) return;
    const text = bio.dataset.text || "";
    if (!text) return;
    let i = 0;
    const speed = 45;
    const tick = () => {
      const slice = text.slice(0, i);
      bio.innerHTML = escapeHTML(slice).replaceAll("\n", "<br>");
      i += 1;
      if (i <= text.length) {
        setTimeout(tick, speed);
      }
    };
    tick();
  };

  // ====== 渲染入口卡片（来自 sites.js）======
  const renderSites = () => {
    grid.innerHTML = "";
    for (const s of SITES) {
      const a = document.createElement("a");
      a.className = "card";
      a.href = s.url;
      a.target = "_blank";
      a.rel = "noopener";

      a.innerHTML = `
        <div class="name"><i></i>${escapeHTML(s.name)}</div>
        <div class="domain">${escapeHTML(s.domain)}</div>
      `;
      grid.appendChild(a);
    }
  };

  // 防止名字里有特殊字符导致注入（顺手做一下）
  function escapeHTML(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  if (reduce) {
    renderBio();
  } else {
    typeBio();
  }
  renderSites();
  const cards = () => Array.from(document.querySelectorAll(".card"));

  // ========== 通用：鼠标位置变量（用于光晕）==========
  const setMouseVars = (el, e) => {
    const r = el.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * 100;
    const y = ((e.clientY - r.top) / r.height) * 100;
    el.style.setProperty("--mouse-x", x + "%");
    el.style.setProperty("--mouse-y", y + "%");
  };
  logo.addEventListener("pointermove", (e) => setMouseVars(logo, e));
  topBtns.forEach((btn) => btn.addEventListener("pointermove", (e) => setMouseVars(btn, e)));

  // ========== 点击墨晕 ripple（通用）==========
  const addRipple = (el, e) => {
    const r = el.getBoundingClientRect();
    const size = Math.max(r.width, r.height) * 1.45;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = (e.clientX - r.left) + "px";
    ripple.style.top = (e.clientY - r.top) + "px";

    el.appendChild(ripple);
    ripple.addEventListener("animationend", () => ripple.remove());
  };

  // 顶部按钮点击墨晕
  topBtns.forEach((btn) => btn.addEventListener("click", (e) => addRipple(btn, e)));

  // ========== 卡片光晕跟随 + 点击墨晕 ==========
  const bindCards = () => {
    cards().forEach((card) => {
      card.addEventListener("pointermove", (e) => {
        const r = card.getBoundingClientRect();
        const mx = ((e.clientX - r.left) / r.width) * 100;
        const my = ((e.clientY - r.top) / r.height) * 100;
        card.style.setProperty("--mx", mx + "%");
        card.style.setProperty("--my", my + "%");
      });
      card.addEventListener("click", (e) => addRipple(card, e));
    });
  };
  bindCards();

  // 头像轻微反馈（克制）
  avatar.addEventListener("pointerenter", () => {
    if (reduce) return;
    avatar.style.transform = "translateY(-2px) scale(1.02)";
    avatar.style.filter = "grayscale(.05) contrast(1.08)";
  });
  avatar.addEventListener("pointerleave", () => {
    avatar.style.transform = "";
    avatar.style.filter = "";
  });

  // ========== 弹层：联系我 / 关于 ==========
  const overlay = document.getElementById("overlay");
  const panelTitle = document.getElementById("panel-title");
  const panelBody = document.getElementById("panel-body");
  const panelClose = document.getElementById("panel-close");

  const content = {
    contact: {
      title: "联系我",
      body: `
        <div>
          <div>邮箱：<a href="mailto:your@email.com">your@email.com</a></div>
          <div>Telegram：<a href="#" onclick="return false">@your_id</a></div>
          <div>站点：<a href="https://031003.xyz" target="_blank" rel="noopener">031003.xyz</a></div>
          <div style="margin-top:10px;color:rgba(29,29,29,.5);letter-spacing:.08em;">（信息可在 app.js 里替换）</div>
        </div>
      `,
    },
    about: {
      title: "关于",
      body: `
        <div>
          <div>这里是 HY 的水墨角落：随笔、笔记与一些小工具入口。</div>
          <div>风格克制，动效轻微；希望每一次停留都像墨落宣纸。</div>
        </div>
      `,
    },
  };

  const openPanel = (key) => {
    const item = content[key];
    if (!item) return;
    panelTitle.textContent = item.title;
    panelBody.innerHTML = item.body;
    overlay.classList.add("show");
    overlay.setAttribute("aria-hidden", "false");
  };

  const closePanel = () => {
    overlay.classList.remove("show");
    overlay.setAttribute("aria-hidden", "true");
  };

  document.getElementById("btn-contact").addEventListener("click", () => openPanel("contact"));
  document.getElementById("btn-about").addEventListener("click", () => openPanel("about"));
  panelClose.addEventListener("click", closePanel);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePanel();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closePanel();
  });

  // ========== 背景轻微跟随鼠标（很克制）==========
  if (!reduce) {
    window.addEventListener(
      "pointermove",
      (e) => {
        const x = (e.clientX / innerWidth - 0.5) * 10;
        const y = (e.clientY / innerHeight - 0.5) * 10;
        bg.style.setProperty("--bgx", x + "px");
        bg.style.setProperty("--bgy", y + "px");
      },
      { passive: true }
    );
  }

  // ========== 鼠标墨迹尾巴（Canvas）==========
  if (!reduce) {
    const canvas = document.getElementById("ink-canvas");
    const ctx = canvas.getContext("2d", { alpha: true });

    let dpr = Math.max(1, window.devicePixelRatio || 1);
    const resize = () => {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(innerWidth * dpr);
      canvas.height = Math.floor(innerHeight * dpr);
      canvas.style.width = innerWidth + "px";
      canvas.style.height = innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    window.addEventListener("resize", resize, { passive: true });
    resize();

    const drops = [];
    const addDrop = (x, y, strength = 1) => {
      const count = 2 + Math.floor(strength * 2);
      for (let i = 0; i < count; i++) {
        drops.push({
          x: x + (Math.random() - 0.5) * 10,
          y: y + (Math.random() - 0.5) * 10,
          r: 6 + Math.random() * 14 * strength,
          a: 0.10 + Math.random() * 0.10,
          life: 1,
          bleed: 0.6 + Math.random() * 0.9,
        });
      }
    };

    let lastT = 0;
    const tick = (t) => {
      const dt = Math.min(0.033, (t - lastT) / 1000 || 0.016);
      lastT = t;

      ctx.clearRect(0, 0, innerWidth, innerHeight);

      for (let i = drops.length - 1; i >= 0; i--) {
        const p = drops[i];
        p.life -= dt * 0.55;
        p.r += dt * 16 * p.bleed;
        p.a *= 1 - dt * 0.9;

        if (p.life <= 0.02 || p.a <= 0.006) {
          drops.splice(i, 1);
          continue;
        }

        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r);
        g.addColorStop(0, `rgba(0,0,0,${p.a})`);
        g.addColorStop(0.45, `rgba(0,0,0,${p.a * 0.45})`);
        g.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    let lastAdd = 0;
    window.addEventListener(
      "pointermove",
      (e) => {
        const now = performance.now();
        if (now - lastAdd < 16) return;
        lastAdd = now;

        const strength = e.pressure ? 0.65 + e.pressure : 1;
        addDrop(e.clientX, e.clientY, 0.7 * strength);
      },
      { passive: true }
    );

    window.addEventListener(
      "pointerdown",
      (e) => {
        addDrop(e.clientX, e.clientY, 1.25);
      },
      { passive: true }
    );
  }
})();
