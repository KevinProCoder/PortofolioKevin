/* ==========================================================================
   Kevin.dev portfolio — script.js
   Small, dependency-free modules. Each init function owns one feature so
   it's easy to find and tweak later.
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

  /* ------------------------------------------------------------------
     Navbar: entrance animation + solid background on scroll +
     smooth-scroll for anchor links
     ------------------------------------------------------------------ */
  function initNavbar() {
    var navbar = document.getElementById("navbar");
    if (!navbar) return;

    // Entrance: trigger slide-down + fade-in after a short delay so it
    // feels intentional (not just a flash of content).
    if (prefersReducedMotion) {
      navbar.classList.add("navbar-loaded");
    } else {
      window.setTimeout(function () {
        navbar.classList.add("navbar-loaded");
      }, 80);
    }

    // Scrolled glass effect
    function onScroll() {
      if (window.scrollY > 24) {
        navbar.classList.add("scrolled");
      } else {
        navbar.classList.remove("scrolled");
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    // Smooth scroll for in-page links (nav + mobile menu + footer + CTAs)
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var navHeight = navbar.offsetHeight;
        var top = target.getBoundingClientRect().top + window.scrollY - (navHeight - 8);
        window.scrollTo({ top: top, behavior: prefersReducedMotion ? "auto" : "smooth" });
        history.pushState(null, "", id);
      });
    });
  }

  /* ------------------------------------------------------------------
     Active-section indicator in the nav (desktop + mobile link lists)
     ------------------------------------------------------------------ */
  function initActiveSection() {
    var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
    var navLinks = document.querySelectorAll(".nav-link, .mobile-menu__link");
    if (!sections.length || !navLinks.length) return;

    function setActive(id) {
      navLinks.forEach(function (link) {
        link.classList.toggle("active", link.dataset.section === id);
      });
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ------------------------------------------------------------------
     Mobile hamburger menu
     ------------------------------------------------------------------ */
  function initMobileMenu() {
    var toggle = document.getElementById("menu-toggle");
    var menu = document.getElementById("mobile-menu");
    var icon = document.getElementById("menu-icon");
    if (!toggle || !menu) return;

    function closeMenu() {
      menu.classList.remove("open");
      menu.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-expanded", "false");
      if (icon) icon.textContent = "menu";
      document.body.style.overflow = "";
    }

    function openMenu() {
      menu.classList.add("open");
      menu.setAttribute("aria-hidden", "false");
      toggle.setAttribute("aria-expanded", "true");
      if (icon) icon.textContent = "close";
      document.body.style.overflow = "hidden";
    }

    toggle.addEventListener("click", function () {
      if (menu.classList.contains("open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    menu.querySelectorAll(".mobile-menu__link, .btn-solid").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });
  }

  /* ------------------------------------------------------------------
     Hero intro: fade/stagger in on load, plus a gentle mouse parallax
     on desktop only.
     ------------------------------------------------------------------ */
  function initHeroIntro() {
    var copy = document.getElementById("hero-copy");
    var imageWrap = document.getElementById("hero-image-wrap");
    if (copy) copy.classList.add("ready");
    if (imageWrap) imageWrap.classList.add("ready");
  }

  function initHeroParallax() {
    var imageWrap = document.getElementById("hero-image-wrap");
    var hero = document.getElementById("home");
    if (!imageWrap || !hero || prefersReducedMotion || isTouchDevice) return;

    // Only enable on devices with a fine pointer (real mouse), so we
    // don't fight with touch scrolling on phones/tablets.
    if (!window.matchMedia("(pointer: fine)").matches) return;

    var ticking = false;
    var targetX = 0;
    var targetY = 0;
    var currentX = 0;
    var currentY = 0;

    hero.addEventListener("mousemove", function (e) {
      var rect = hero.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = relX * 14; // keep it subtle
      targetY = relY * 10;

      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });

    hero.addEventListener("mouseleave", function () {
      targetX = 0;
      targetY = 0;
      if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });

    function updateParallax() {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      imageWrap.style.transform = "translate(" + currentX + "px, " + currentY + "px)";

      if (Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
        window.requestAnimationFrame(updateParallax);
      } else {
        ticking = false;
      }
    }
  }

  /* ------------------------------------------------------------------
     Scroll animations: reveal [data-animate] elements once, the first
     time they enter the viewport. Supports per-element data-delay (ms).
     ------------------------------------------------------------------ */
  function initScrollAnimations() {
    var items = document.querySelectorAll("[data-animate]");
    if (!items.length) return;

    if (prefersReducedMotion) {
      items.forEach(function (el) {
        el.classList.add("in-view");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var delay = parseInt(el.dataset.delay || "0", 10);
          window.setTimeout(function () {
            el.classList.add("in-view");
          }, delay);
          obs.unobserve(el);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );

    items.forEach(function (el) {
      observer.observe(el);
    });

    // The lanyard-stage wrapper also needs its own "in-view" flag so the
    // drag hint text can fade in once, without being an [data-animate] item.
    var lanyardStage = document.getElementById("lanyard-stage");
    if (lanyardStage) {
      var stageObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );
      stageObserver.observe(lanyardStage);
    }
  }

  /* ------------------------------------------------------------------
     Particle canvas: floating glowing dots themed as a developer/tech
     background. Uses requestAnimationFrame and pauses when tab is
     hidden to save CPU.
     ------------------------------------------------------------------ */
  function initParticles() {
    var canvas = document.getElementById("particle-canvas");
    if (!canvas || prefersReducedMotion) return;

    var ctx = canvas.getContext("2d");
    var particles = [];
    var animFrame = null;
    var isVisible = true;

    // Adjust count for device capability
    var PARTICLE_COUNT = isTouchDevice ? 20 : 45;
    var COLORS = ["rgba(173, 198, 255,", "rgba(77, 142, 255,", "rgba(194, 212, 255,"];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticle() {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 1.8 + 0.4,          // 0.4 – 2.2 px
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        opacity: Math.random() * 0.25 + 0.08,        // 0.08 – 0.33
        speedX: (Math.random() - 0.5) * 0.35,        // very slow drift
        speedY: (Math.random() - 0.5) * 0.35,
        pulseSpeed: Math.random() * 0.008 + 0.003,   // breathing speed
        pulseOffset: Math.random() * Math.PI * 2,    // random phase
        // Occasional soft connecting line — stored as reference index
        connectTo: Math.random() > 0.75 ? Math.floor(Math.random() * PARTICLE_COUNT) : -1
      };
    }

    function initParticleList() {
      particles = [];
      for (var i = 0; i < PARTICLE_COUNT; i++) {
        particles.push(createParticle());
      }
    }

    function drawLine(a, b) {
      var dx = a.x - b.x;
      var dy = a.y - b.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 180) return; // Only draw lines for close neighbours
      var lineOpacity = (1 - dist / 180) * 0.07;
      ctx.beginPath();
      ctx.strokeStyle = "rgba(173, 198, 255, " + lineOpacity + ")";
      ctx.lineWidth = 0.5;
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    var tick = 0;

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      tick += 1;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        // Slow drift
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around edges
        if (p.x < -4) p.x = canvas.width + 4;
        if (p.x > canvas.width + 4) p.x = -4;
        if (p.y < -4) p.y = canvas.height + 4;
        if (p.y > canvas.height + 4) p.y = -4;

        // Pulse opacity
        var pulse = Math.sin(tick * p.pulseSpeed + p.pulseOffset) * 0.1;
        var currentOpacity = Math.max(0, Math.min(1, p.opacity + pulse));

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color + currentOpacity + ")";
        ctx.fill();

        // Subtle soft glow on larger particles
        if (p.radius > 1.4) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = p.color + (currentOpacity * 0.12) + ")";
          ctx.fill();
        }

        // Soft connector lines
        if (p.connectTo >= 0 && p.connectTo !== i && particles[p.connectTo]) {
          drawLine(p, particles[p.connectTo]);
        }
      }

      if (isVisible) {
        animFrame = window.requestAnimationFrame(draw);
      }
    }

    // Pause when tab is hidden to save resources
    document.addEventListener("visibilitychange", function () {
      isVisible = !document.hidden;
      if (isVisible && !animFrame) {
        animFrame = window.requestAnimationFrame(draw);
      }
    });

    // Debounced resize
    var resizeTimer;
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        resize();
        initParticleList();
      }, 200);
    }, { passive: true });

    resize();
    initParticleList();
    animFrame = window.requestAnimationFrame(draw);
  }

  /* ------------------------------------------------------------------
     Card 3D tilt: subtle perspective tilt following the cursor.
     Works on project cards, skill cards, and poster cards.
     Disabled on touch devices automatically.
     ------------------------------------------------------------------ */
  function initCardTilt() {
    if (prefersReducedMotion || isTouchDevice) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    var TILT_MAX = 3;     // degrees max rotation
    var PERSPECTIVE = "600px";

    var cards = document.querySelectorAll(".project-card, .skill-card, .poster-card");
    cards.forEach(function (card) {
      var targetRX = 0, targetRY = 0;
      var currentRX = 0, currentRY = 0;
      var raf = null;

      function lerp(a, b, t) {
        return a + (b - a) * t;
      }

      function animate() {
        currentRX = lerp(currentRX, targetRX, 0.1);
        currentRY = lerp(currentRY, targetRY, 0.1);

        card.style.transform =
          "perspective(" + PERSPECTIVE + ") " +
          "rotateX(" + currentRX.toFixed(2) + "deg) " +
          "rotateY(" + currentRY.toFixed(2) + "deg) " +
          "translateZ(4px)";

        // Keep animating until settled
        if (
          Math.abs(targetRX - currentRX) > 0.01 ||
          Math.abs(targetRY - currentRY) > 0.01
        ) {
          raf = window.requestAnimationFrame(animate);
        } else {
          raf = null;
        }
      }

      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var relX = (e.clientX - rect.left) / rect.width - 0.5;   // -0.5 to 0.5
        var relY = (e.clientY - rect.top) / rect.height - 0.5;

        targetRY = relX * TILT_MAX * 2;
        targetRX = -relY * TILT_MAX * 2;

        if (!raf) raf = window.requestAnimationFrame(animate);
      });

      card.addEventListener("mouseleave", function () {
        targetRX = 0;
        targetRY = 0;
        if (!raf) raf = window.requestAnimationFrame(animate);
      });
    });
  }

  /* ------------------------------------------------------------------
     Lanyard: physics-inspired drag with Pointer Events, so it works the
     same for mouse, touch and pen. The card swings on spring-back after
     release.
     ------------------------------------------------------------------ */
  function initLanyard() {
    var wrapper = document.getElementById("lanyard-wrapper");
    var card = document.getElementById("lanyard-card");
    var section = document.getElementById("about");
    if (!wrapper || !card || !section) return;

    // Drop-in animation, once, when the About section first appears.
    var dropObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            wrapper.classList.add("visible");
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );
    dropObserver.observe(section);

    if (prefersReducedMotion) {
      // Keep it a static, legible ID card — no drag physics.
      wrapper.style.opacity = "1";
      return;
    }

    // Current transform state of the whole lanyard (strap + clip + card).
    var state = { x: 0, y: 0, rot: 0 };
    var velocity = { x: 0, y: 0, rot: 0 };
    var pointerStart = { x: 0, y: 0 };
    var stateAtDragStart = { x: 0, y: 0, rot: 0 };
    var dragging = false;
    var springFrame = null;

    var MAX_X = 70;
    var MAX_Y = 40;
    var MAX_ROT = 28;
    var DRAG_DAMPING = 0.55;
    var SPRING_STIFFNESS = 0.12;
    var SPRING_DAMPING = 0.78;

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function applyTransform() {
      wrapper.style.transform =
        "translate(" + state.x.toFixed(2) + "px, " + state.y.toFixed(2) + "px) " +
        "rotate(" + state.rot.toFixed(2) + "deg)";
    }

    function stopSpring() {
      if (springFrame) {
        window.cancelAnimationFrame(springFrame);
        springFrame = null;
      }
    }

    function runSpring() {
      velocity.x += -state.x * SPRING_STIFFNESS;
      velocity.y += -state.y * SPRING_STIFFNESS;
      velocity.rot += -state.rot * SPRING_STIFFNESS;

      velocity.x *= SPRING_DAMPING;
      velocity.y *= SPRING_DAMPING;
      velocity.rot *= SPRING_DAMPING;

      state.x += velocity.x;
      state.y += velocity.y;
      state.rot += velocity.rot;

      applyTransform();

      var atRest =
        Math.abs(state.x) < 0.05 && Math.abs(velocity.x) < 0.05 &&
        Math.abs(state.y) < 0.05 && Math.abs(velocity.y) < 0.05 &&
        Math.abs(state.rot) < 0.05 && Math.abs(velocity.rot) < 0.05;

      if (atRest) {
        state.x = 0; state.y = 0; state.rot = 0;
        velocity.x = 0; velocity.y = 0; velocity.rot = 0;
        applyTransform();
        springFrame = null;
        return;
      }

      springFrame = window.requestAnimationFrame(runSpring);
    }

    function onPointerDown(e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;

      stopSpring();
      dragging = true;
      pointerStart.x = e.clientX;
      pointerStart.y = e.clientY;
      stateAtDragStart.x = state.x;
      stateAtDragStart.y = state.y;
      stateAtDragStart.rot = state.rot;
      velocity.x = 0; velocity.y = 0; velocity.rot = 0;

      card.setPointerCapture(e.pointerId);
      card.style.transition = "none";
    }

    function onPointerMove(e) {
      if (!dragging) return;

      var dx = e.clientX - pointerStart.x;
      var dy = e.clientY - pointerStart.y;

      state.x = clamp(stateAtDragStart.x + dx * DRAG_DAMPING, -MAX_X, MAX_X);
      state.y = clamp(stateAtDragStart.y + dy * DRAG_DAMPING * 0.6, -MAX_Y, MAX_Y);
      state.rot = clamp(dx * 0.12, -MAX_ROT, MAX_ROT);

      applyTransform();
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;

      var dx = e.clientX - pointerStart.x;
      velocity.rot = clamp(dx * 0.01, -6, 6);

      try {
        card.releasePointerCapture(e.pointerId);
      } catch (err) {
        /* pointer may already be released — safe to ignore */
      }

      runSpring();
    }

    card.addEventListener("pointerdown", onPointerDown);
    card.addEventListener("pointermove", onPointerMove);
    card.addEventListener("pointerup", onPointerUp);
    card.addEventListener("pointercancel", onPointerUp);

    card.addEventListener("keydown", function (e) {
      var nudge = 18;
      if (e.key === "ArrowLeft") { state.rot = clamp(state.rot - nudge, -MAX_ROT, MAX_ROT); runSpring(); }
      if (e.key === "ArrowRight") { state.rot = clamp(state.rot + nudge, -MAX_ROT, MAX_ROT); runSpring(); }
      if (e.key === "Escape") { stopSpring(); state = { x: 0, y: 0, rot: 0 }; applyTransform(); }
    });
  }

  /* ------------------------------------------------------------------
     Contact form: lightweight client-side handling.
     ------------------------------------------------------------------ */
  function initContactForm() {
    var form = document.querySelector(".contact-form");
    var status = document.getElementById("form-status");
    if (!form || !status) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!form.checkValidity()) {
        status.textContent = "Please fill in every field before sending.";
        return;
      }

      status.textContent = "Thanks! Your message is ready to send — hook this form up to your backend or a form service to deliver it.";
      form.reset();
    });
  }

  /* ------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initNavbar();
    initActiveSection();
    initMobileMenu();
    initHeroIntro();
    initHeroParallax();
    initScrollAnimations();
    initParticles();
    initCardTilt();
    initLanyard();
    initContactForm();
  });
})();
