/**
 * MARKETING PEDORRO — Motor de Interacción JavaScript Vanilla
 * 
 * Funciones modulares:
 * - initHorizontalStory()
 * - scrollToPanel(index, smooth)
 * - syncActivePanel()
 * - updatePanelInert(activeIndex)
 * - initPointerDrag()
 * - initKeyboardControls()
 * - initReducedMotion()
 * - initStickyHeader()
 */

(function () {
  'use strict';

  // Estado global de la aplicación
  const state = {
    rail: null,
    panels: [],
    stepButtons: [],
    prevBtn: null,
    nextBtn: null,
    currentIndex: 0,
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
    hasMoved: false,
    prefersReducedMotion: false,
    ticking: false
  };

  /**
   * Detección de preferencia de movimiento reducido
   */
  function initReducedMotion() {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    state.prefersReducedMotion = motionQuery.matches;

    motionQuery.addEventListener('change', (e) => {
      state.prefersReducedMotion = e.matches;
    });
  }

  /**
   * Desplazamiento controlado a un panel específico
   * @param {number} index - Índice del panel (0 a 4)
   * @param {boolean} smooth - Si debe animar el scroll
   */
  function scrollToPanel(index, smooth = true) {
    if (!state.rail || index < 0 || index >= state.panels.length) return;

    const targetPanel = state.panels[index];
    if (!targetPanel) return;

    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // En móvil, scroll vertical del documento
      const behavior = state.prefersReducedMotion || !smooth ? 'auto' : 'smooth';
      targetPanel.scrollIntoView({ behavior, block: 'start' });
      state.currentIndex = index;
      syncActivePanelUI(index);
    } else {
      // En desktop, desplazamiento horizontal dentro del carril
      const targetLeft = index * state.rail.clientWidth;
      const behavior = state.prefersReducedMotion || !smooth ? 'auto' : 'smooth';

      state.rail.scrollTo({
        left: targetLeft,
        behavior: behavior
      });

      state.currentIndex = index;
      syncActivePanelUI(index);
    }
  }

  /**
   * Actualiza los estados de UI: botones de paso, aria-current, clases activas y accesibilidad
   * @param {number} activeIndex
   */
  function syncActivePanelUI(activeIndex) {
    // 1. Actualizar clases at-0...at-4 para activar el motion editorial escalonado (Opción D)
    if (state.rail) {
      for (let i = 0; i <= 10; i++) {
        state.rail.classList.remove(`at-${i}`);
        if (state.rail.parentElement) {
          state.rail.parentElement.classList.remove(`at-${i}`);
        }
      }
      state.rail.classList.add(`at-${activeIndex}`);
      if (state.rail.parentElement) {
        state.rail.parentElement.classList.add(`at-${activeIndex}`);
      }
    }

    // 2. Actualizar botones de progreso y aria-current
    state.stepButtons.forEach((btn, idx) => {
      if (idx === activeIndex) {
        btn.setAttribute('aria-current', 'step');
        btn.classList.add('is-active');
      } else {
        btn.removeAttribute('aria-current');
        btn.classList.remove('is-active');
      }
    });

    // 3. Actualizar paneles (clase activa)
    state.panels.forEach((panel, idx) => {
      if (idx === activeIndex) {
        panel.classList.add('is-active');
      } else {
        panel.classList.remove('is-active');
      }
    });

    // 4. Actualizar botones Anterior / Siguiente
    if (state.prevBtn) {
      state.prevBtn.disabled = activeIndex === 0;
      state.prevBtn.setAttribute('aria-disabled', activeIndex === 0 ? 'true' : 'false');
    }
    if (state.nextBtn) {
      state.nextBtn.disabled = activeIndex === state.panels.length - 1;
      state.nextBtn.setAttribute('aria-disabled', activeIndex === state.panels.length - 1 ? 'true' : 'false');
    }

    // 5. Gestión de foco e inercia para evitar trampas de accesibilidad en paneles fuera de pantalla
    updatePanelInert(activeIndex);
  }

  /**
   * Gestiona el foco accesible de los paneles inactivos en desktop
   * @param {number} activeIndex
   */
  function updatePanelInert(activeIndex) {
    const isMobile = window.innerWidth <= 768;

    state.panels.forEach((panel, idx) => {
      const focusable = panel.querySelectorAll('button, a, input, select, textarea, [tabindex]');
      if (isMobile || idx === activeIndex) {
        panel.removeAttribute('aria-hidden');
        focusable.forEach((el) => {
          if (el.dataset.prevTabindex !== undefined) {
            el.setAttribute('tabindex', el.dataset.prevTabindex);
          } else {
            el.removeAttribute('tabindex');
          }
        });
      } else {
        // Fuera de vista en desktop: desactivar tabulación
        focusable.forEach((el) => {
          if (el.getAttribute('tabindex') !== '-1') {
            el.dataset.prevTabindex = el.getAttribute('tabindex') || '0';
            el.setAttribute('tabindex', '-1');
          }
        });
      }
    });
  }

  /**
   * Sincroniza el panel activo mediante requestAnimationFrame basado en la posición del scroll
   */
  function syncActivePanel() {
    if (!state.rail) return;

    if (window.innerWidth <= 768) return; // En móvil se maneja por flujo natural

    const clientWidth = state.rail.clientWidth;
    if (clientWidth <= 0) return;

    const calculatedIndex = Math.round(state.rail.scrollLeft / clientWidth);
    const clampedIndex = Math.max(0, Math.min(calculatedIndex, state.panels.length - 1));

    if (clampedIndex !== state.currentIndex) {
      state.currentIndex = clampedIndex;
      syncActivePanelUI(clampedIndex);
    }
  }

  /**
   * Interacción de arrastre con ratón/puntero (Drag to Scroll)
   */
  function initPointerDrag() {
    const rail = state.rail;
    if (!rail) return;

    rail.addEventListener('mousedown', (e) => {
      // No capturar el puntero si se clickea un botón, enlace o elemento interactivo
      if (e.target.closest('button, a, input, select, textarea, label')) {
        return;
      }

      state.isDragging = true;
      state.hasMoved = false;
      state.startX = e.pageX - rail.offsetLeft;
      state.scrollLeft = rail.scrollLeft;
      rail.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!state.isDragging) return;
      e.preventDefault();
      const x = e.pageX - rail.offsetLeft;
      const walk = (x - state.startX) * 1.4; // Multiplicador de fluidez
      rail.scrollLeft = state.scrollLeft - walk;

      if (Math.abs(x - state.startX) > 5) {
        state.hasMoved = true;
      }
    });

    window.addEventListener('mouseup', () => {
      if (!state.isDragging) return;
      state.isDragging = false;
      rail.classList.remove('is-dragging');

      // Al soltar, ajustar magnéticamente al panel más cercano
      if (window.innerWidth > 768) {
        const clientWidth = rail.clientWidth;
        const targetIndex = Math.round(rail.scrollLeft / clientWidth);
        scrollToPanel(targetIndex, true);
      }
    });
  }

  /**
   * Controles de teclado accesibles (ArrowLeft, ArrowRight, Home, End)
   */
  function initKeyboardControls() {
    window.addEventListener('keydown', (e) => {
      // Ignorar si el usuario está escribiendo en un input o formulario
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (!state.rail) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (state.currentIndex < state.panels.length - 1) {
          scrollToPanel(state.currentIndex + 1, true);
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        if (state.currentIndex > 0) {
          scrollToPanel(state.currentIndex - 1, true);
        }
      } else if (e.key === 'Home') {
        e.preventDefault();
        scrollToPanel(0, true);
      } else if (e.key === 'End') {
        e.preventDefault();
        scrollToPanel(state.panels.length - 1, true);
      }
    });
  }

  /**
   * Intercepta la rueda/trackpad sobre el carril horizontal en desktop
   */
  function initWheelScroll() {
    const rail = state.rail;
    if (!rail) return;

    rail.addEventListener('wheel', (e) => {
      if (window.innerWidth <= 768) return; // En móvil no interceptar

      // Prevenir el scroll vertical de la ventana y sumar el delta al scrollLeft
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      rail.scrollLeft += delta;

      if (!state.ticking) {
        window.requestAnimationFrame(() => {
          syncActivePanel();
          state.ticking = false;
        });
        state.ticking = true;
      }
    }, { passive: false });
  }

  /**
   * Inicializa la experiencia de storytelling horizontal (Alternativa C)
   */
  function initHorizontalStory() {
    const rail = document.getElementById('story-rail');
    if (!rail) return; // Si no estamos en alternativa-c.html, salir de forma segura

    state.rail = rail;
    state.panels = Array.from(rail.querySelectorAll('.story-panel'));
    state.stepButtons = Array.from(document.querySelectorAll('.story-step-btn'));
    state.prevBtn = document.getElementById('story-prev-btn');
    state.nextBtn = document.getElementById('story-next-btn');

    // Enlazar eventos de botones de paso
    state.stepButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const stepIndex = parseInt(btn.dataset.stepIndex, 10);
        if (!isNaN(stepIndex)) {
          scrollToPanel(stepIndex, true);
        }
      });
    });

    // Enlazar botones Anterior y Siguiente
    if (state.prevBtn) {
      state.prevBtn.addEventListener('click', () => {
        if (state.currentIndex > 0) {
          scrollToPanel(state.currentIndex - 1, true);
        }
      });
    }

    if (state.nextBtn) {
      state.nextBtn.addEventListener('click', () => {
        if (state.currentIndex < state.panels.length - 1) {
          scrollToPanel(state.currentIndex + 1, true);
        }
      });
    }

    // Botones de acción dentro de los capítulos (CTA de apertura, etc.)
    document.querySelectorAll('[data-jump-step]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetStep = parseInt(btn.dataset.jumpStep, 10);
        if (!isNaN(targetStep)) {
          scrollToPanel(targetStep, true);
        }
      });
    });

    // Evento de scroll nativo en el carril
    rail.addEventListener('scroll', () => {
      if (!state.ticking) {
        window.requestAnimationFrame(() => {
          syncActivePanel();
          state.ticking = false;
        });
        state.ticking = true;
      }
    }, { passive: true });

    // Inicializar subsistemas
    initPointerDrag();
    initKeyboardControls();
    initWheelScroll();

    // Sincronizar estado inicial
    syncActivePanelUI(0);

    // Reajustar en resize de pantalla
    window.addEventListener('resize', () => {
      syncActivePanelUI(state.currentIndex);
    });
  }

  /**
   * Inicialización del Selector de Pestañas del Atlas de Personajes (Acto 5)
   */
  function initCharacterTabs() {
    const tabButtons = document.querySelectorAll('.char-tab-btn');
    const tabPanels = document.querySelectorAll('.char-tab-panel');

    if (!tabButtons.length || !tabPanels.length) return;

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');

        // Actualizar botones
        tabButtons.forEach((b) => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-selected', 'true');

        // Actualizar paneles
        tabPanels.forEach((panel) => {
          if (panel.id === targetId) {
            panel.classList.add('active');
          } else {
            panel.classList.remove('active');
          }
        });
      });
    });
  }

  /**
   * Inicialización del Gatillo Interactivo Weby (ON / OFF)
   */
  function initWebyToggle() {
    const webyBtn = document.getElementById('webyTrigger');
    const webyBubble = document.getElementById('webyThoughts');
    const titoTitaStage = document.getElementById('titoTitaFloatingStage');

    if (!webyBtn) return;

    let isOn = true;

    webyBtn.addEventListener('click', () => {
      isOn = !isOn;
      const statusText = webyBtn.querySelector('.weby-btn-text');
      const pulseDot = webyBtn.querySelector('.weby-pulse-dot');

      if (isOn) {
        if (statusText) statusText.textContent = 'WEBY: ON';
        if (pulseDot) pulseDot.style.background = '#FFFFFF';
        if (webyBubble) {
          webyBubble.style.display = 'block';
          webyBubble.style.opacity = '1';
        }
        if (titoTitaStage) {
          titoTitaStage.style.opacity = '1';
          titoTitaStage.style.transform = 'scale(1)';
        }
      } else {
        if (statusText) statusText.textContent = 'WEBY: OFF (APAGADO)';
        if (pulseDot) pulseDot.style.background = '#666666';
        if (webyBubble) {
          webyBubble.style.display = 'none';
        }
        if (titoTitaStage) {
          titoTitaStage.style.opacity = '0.35';
          titoTitaStage.style.transform = 'scale(0.98)';
        }
      }
    });
  }

  /**
   * Navegación suave y mejoras para la Homepage vertical
   */
  function initHomepageFeatures() {
    // Resaltado de enlaces de anclaje
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach((link) => {
      link.addEventListener('click', (e) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            targetEl.scrollIntoView({
              behavior: state.prefersReducedMotion ? 'auto' : 'smooth',
              block: 'start'
            });
          }
        }
      });
    });

    initCharacterTabs();
    initWebyToggle();
  }

  /**
   * Inicialización global al cargar el DOM
   */
  function initApp() {
    initReducedMotion();
    initHorizontalStory();
    initHomepageFeatures();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
