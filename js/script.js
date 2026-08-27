/* ==========================================================================
   Kevin.dev portfolio — script.js
   Small, dependency-free modules. Each init function owns one feature so
   it's easy to find and tweak later.
   ========================================================================== */

(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     Navbar: solid background on scroll + smooth-scroll for anchor links
     ------------------------------------------------------------------ */
  function initNavbar() {
    var navbar = document.getElementById("navbar");
    if (!navbar) return;

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
    if (!imageWrap || !hero || prefersReducedMotion) return;

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
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
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
    var DRAG_DAMPING = 0.55; // pointer movement -> lanyard movement ratio
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

    // Damped spring animation that eases (x, y, rot) back to (0, 0, 0)
    // after the user lets go — this is what makes the card feel like it
    // is really hanging from the strap instead of just snapping back.
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
      // Only respond to the primary button for mouse.
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

      // Carry a little velocity into the spring so release feels alive
      // rather than the card freezing mid-swing.
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

    // Keyboard fallback so the card is reachable without a mouse/touch —
    // arrow keys give it a little nudge and spring, Escape resets it.
    card.addEventListener("keydown", function (e) {
      var nudge = 18;
      if (e.key === "ArrowLeft") { state.rot = clamp(state.rot - nudge, -MAX_ROT, MAX_ROT); runSpring(); }
      if (e.key === "ArrowRight") { state.rot = clamp(state.rot + nudge, -MAX_ROT, MAX_ROT); runSpring(); }
      if (e.key === "Escape") { stopSpring(); state = { x: 0, y: 0, rot: 0 }; applyTransform(); }
    });
  }

  /* ------------------------------------------------------------------
     Contact form: lightweight client-side handling. No backend is wired
     up yet, so this just gives clear feedback — swap the TODO for a real
     fetch() call once you have somewhere to send the message.
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

      // TODO: replace with a real submit (fetch to your backend or a
      // form service like Formspree) once one is set up.
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
    initLanyard();
    initContactForm();
  });
})();
