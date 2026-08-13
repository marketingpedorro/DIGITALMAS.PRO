/* ==========================================================================
   WEBAS.ES ENGINE - SCRIPT PRINCIPAL MULTIDOMINIO Y USABILIDAD VISUAL (2026)
   Localización Total de 12 Secciones (Cero Residuos de Idioma)
   ========================================================================== */

let currentDominioKey = 'webas.es';

// 1. GESTIÓN DE MODO OSCURO / MODO CLARO (SALUD VISUAL WCAG)
function initTema() {
  const temaGuardado = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', temaGuardado);
  if (document.body) document.body.setAttribute('data-theme', temaGuardado);
  actualizarBotonTema(temaGuardado);
}

function toggleModoOscuro() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const nextTheme = (current === 'dark') ? 'light' : 'dark';
  
  document.documentElement.setAttribute('data-theme', nextTheme);
  if (document.body) document.body.setAttribute('data-theme', nextTheme);
  localStorage.setItem('theme', nextTheme);

  actualizarBotonTema(nextTheme);
}

function actualizarBotonTema(tema) {
  const isDark = (tema === 'dark');
  const txt = isDark ? '🌙 Modo Oscuro' : '☀️ Modo Claro';
  const btnTop = document.getElementById('theme-toggle-btn');
  const btnStandalone = document.getElementById('standalone-theme-btn');
  if (btnTop) btnTop.innerText = txt;
  if (btnStandalone) {
    btnStandalone.innerHTML = isDark ? '🌙' : '☀️';
    btnStandalone.title = isDark ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro';
  }
}

// 2. GESTIÓN DEL SIMULADOR MÓVIL (375PX POR DEFECTO PARA FACILITAR TESTING)
function toggleSimuladorCelular() {
  document.body.classList.toggle('mode-phone-active');
  const esCelular = document.body.classList.contains('mode-phone-active');
  
  const btnTop = document.getElementById('phone-sim-btn');
  const btnStandalone = document.getElementById('standalone-phone-btn');
  const badge = document.getElementById('mode-live-badge');

  const txtTop = esCelular ? '📱 Vista Celular (375px Realtime)' : '💻 Pantalla Completa Escritorio';

  if (btnTop) {
    btnTop.innerHTML = txtTop;
    btnTop.style.background = esCelular ? '#10B981' : '#0284C7';
  }
  if (btnStandalone) {
    btnStandalone.innerHTML = esCelular ? '💻' : '📱';
    btnStandalone.title = esCelular ? 'Voltar para Vista Escritório' : 'Simulador de Vista Celular (375px)';
    btnStandalone.style.background = esCelular ? 'rgba(16,185,129,0.25)' : 'rgba(255,255,255,0.05)';
  }
  if (badge) {
    badge.innerHTML = esCelular ? '📱 [VISTA MÓVIL EN REALTIME]' : '💻 [VISTA ESCRITORIO FLUIDA]';
    badge.style.color = esCelular ? '#06B6D4' : '#EAB308';
    badge.style.borderColor = esCelular ? '#06B6D4' : '#EAB308';
  }
}

// 3. ABRIR SITIO EN PESTAÑA INDEPENDIENTE MAXIMIZADA CON EL BOTÓN VERDE 🟢
function abrirSitioIndependiente() {
  const url = `sites/${encodeURIComponent(currentDominioKey)}/index.html`;
  window.open(url, '_blank');
}

// 4. VERIFICAR SI LA PÁGINA FUE ABIERTA CON UN SITIO O EN MODO STANDALONE
function checkStandaloneMode() {
  const urlParams = new URLSearchParams(window.location.search);
  const isStandalone = urlParams.get('standalone') === 'true';
  const siteParam = urlParams.get('site');

  if (siteParam && CONFIG_REGIONAL[siteParam]) {
    cambiarRegion(siteParam);
  } else if (typeof currentDominioKey !== 'undefined' && CONFIG_REGIONAL[currentDominioKey]) {
    cambiarRegion(currentDominioKey);
  } else {
    cambiarRegion('webas.es');
  }

  if (isStandalone) {
    const controlBar = document.getElementById('agency-control-bar');
    const statusBar = document.querySelector('.phone-status-bar');
    if (controlBar) controlBar.style.display = 'none';
    if (statusBar) statusBar.style.display = 'none';

    document.body.classList.remove('mode-phone-active');
    document.body.classList.add('mode-standalone');
  }
}

// Helper seguro para asignar texto por ID
function setTxt(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.innerText = val;
}

function setHtml(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.innerHTML = val;
}

// 5. CAMBIO DINÁMICO DE REGIÓN Y LOCALIZACIÓN TOTAL DE LAS 12 SECCIONES
function cambiarRegion(dominioKey) {
  const config = CONFIG_REGIONAL[dominioKey];
  if (!config) return;

  currentDominioKey = dominioKey;

  // Actualizar botones activos de la barra de control
  document.querySelectorAll('.control-group .ctrl-btn').forEach(btn => {
    const prefix = dominioKey.split('.')[0];
    if (btn.id === `btn-${prefix}`) {
      btn.classList.add('active');
    } else if (btn.id && btn.id.startsWith('btn-')) {
      btn.classList.remove('active');
    }
  });

  // Marca y Subtítulo de Posicionamiento
  setTxt('wb-brand-name', config.marca);
  setTxt('wb-brand-sub', config.taglineHeader);

  // Actualizar enlaces de la marca en el logo sin duplicar rutas en standalone
  const isStandaloneMode = window.location.pathname.includes('/sites/') || document.body.classList.contains('mode-standalone');
  document.querySelectorAll('.wf-brand-logo').forEach(logo => {
    logo.href = isStandaloneMode ? 'index.html' : `sites/${dominioKey}/index.html`;
  });

  // SECCIÓN 1: HERO
  setTxt('hero-badge', config.heroBadge);
  setTxt('hero-title', config.heroHeadline);
  setTxt('hero-sub', config.heroSub);
  
  const heroBtnPrimary = document.getElementById('hero-btn-primary');
  if (heroBtnPrimary) {
    heroBtnPrimary.innerText = config.heroBtnPrimary;
    heroBtnPrimary.href = `sites/${dominioKey}/pago.html?plan=pro`;
    heroBtnPrimary.removeAttribute("target");
  }

  setTxt('hero-btn-sec', config.heroBtnSec);
  setTxt('hero-trust', config.heroTrust);

  // SECCIÓN 2: EL PROBLEMA
  setTxt('prob-title', config.probTitle);
  setTxt('prob-sub', config.probSub);
  setTxt('prob-c1-t', config.probCard1Title);
  setTxt('prob-c1-txt', config.probCard1Text);
  setTxt('prob-c2-t', config.probCard2Title);
  setTxt('prob-c2-txt', config.probCard2Text);
  setTxt('prob-c3-t', config.probCard3Title);
  setTxt('prob-c3-txt', config.probCard3Text);

  // SECCIÓN 3: LA SOLUCIÓN
  setTxt('sol-title', config.solTitle);
  setTxt('sol-sub', config.solSub);
  setTxt('sol-c1-t', config.solCard1Title);
  setTxt('sol-c1-txt', config.solCard1Text);
  setTxt('sol-c2-t', config.solCard2Title);
  setTxt('sol-c2-txt', config.solCard2Text);
  setTxt('sol-c3-t', config.solCard3Title);
  setTxt('sol-c3-txt', config.solCard3Text);

  // SECCIÓN 4: CÓMO FUNCIONA
  setTxt('proc-title', config.procTitle);
  setTxt('proc-sub', config.procSub);
  setTxt('proc-s1-t', config.procStep1Title);
  setTxt('proc-s1-txt', config.procStep1Text);
  setTxt('proc-s2-t', config.procStep2Title);
  setTxt('proc-s2-txt', config.procStep2Text);
  setTxt('proc-s3-t', config.procStep3Title);
  setTxt('proc-s3-txt', config.procStep3Text);

  // SECCIÓN 5: PRECIOS Y PAQUETES (3 ESCALONES)
  setTxt('price-title', config.priceTitle);
  setTxt('price-sub', config.priceSub);
  
  // Tier 1: Low-Ticket
  setTxt('plan-low-t', config.planLowTitle);
  setTxt('plan-low-sub', config.planLowSub);
  setHtml('precio-low', `${config.planLowPrecio} <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">/ ${config.pais.includes('Brasil') ? 'pagamento único' : 'pago único'}</span>`);
  setTxt('plan-low-btn', config.planLowBtn);

  // Tier 2: Pro Recomendado
  setTxt('plan-pro-t', config.planProTitle);
  setTxt('plan-pro-sub', config.planProSub);
  setHtml('precio-pro', `${config.planProPrecio} <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">/ ${config.pais.includes('Brasil') ? 'pagamento único' : 'pago único'}</span>`);
  setTxt('plan-pro-btn', config.planProBtn);

  // Tier 3: Premium / Enterprise
  setTxt('plan-prem-t', config.planPremTitle);
  setTxt('plan-prem-sub', config.planPremSub);
  setHtml('precio-prem', `${config.planPremPrecio} <span style="font-size: 0.8rem; font-weight: 400; color: var(--text-muted);">/ ${config.pais.includes('Brasil') ? 'pagamento único' : 'pago único'}</span>`);
  setTxt('plan-prem-btn', config.planPremBtn);

  // Asignar enlaces directos de Checkout & Pago a las carpetas físicas independientes en sites/<dominio>/
  const btnLow = document.getElementById('plan-low-btn');
  const btnPro = document.getElementById('plan-pro-btn');
  const btnPrem = document.getElementById('plan-prem-btn');

  const isStandalone = window.location.pathname.includes('/sites/') || document.body.classList.contains('mode-standalone');
  if (btnLow) {
    btnLow.href = isStandalone ? 'pago.html?plan=low' : `sites/${dominioKey}/pago.html?plan=low`;
    btnLow.removeAttribute("target");
  }
  if (btnPro) {
    btnPro.href = isStandalone ? 'pago.html?plan=pro' : `sites/${dominioKey}/pago.html?plan=pro`;
    btnPro.removeAttribute("target");
  }
  if (btnPrem) {
    btnPrem.href = isStandalone ? 'pago.html?plan=prem' : `sites/${dominioKey}/pago.html?plan=prem`;
    btnPrem.removeAttribute("target");
  }

  // SECCIÓN 6: DIFERENCIALES
  setTxt('dif-title', config.difTitle);
  setTxt('dif-c1-t', config.difCard1Title);
  setTxt('dif-c1-txt', config.difCard1Text);
  setTxt('dif-c2-t', config.difCard2Title);
  setTxt('dif-c2-txt', config.difCard2Text);
  setTxt('dif-c3-t', config.difCard3Title);
  setTxt('dif-c3-txt', config.difCard3Text);

  // SECCIÓN 7: RESULTADOS
  setTxt('res-title', config.resTitle);
  setTxt('res-v1', config.resVal1); setTxt('res-l1', config.resLab1);
  setTxt('res-v2', config.resVal2); setTxt('res-l2', config.resLab2);
  setTxt('res-v3', config.resVal3); setTxt('res-l3', config.resLab3);
  setTxt('res-v4', config.resVal4); setTxt('res-l4', config.resLab4);

  // SECCIÓN 8: PORTFOLIO
  setTxt('port-title', config.portTitle);

  // SECCIÓN 9: FAQ
  setTxt('faq-title', config.faqTitle);

  // SECCIÓN 10: GARANTÍA
  setTxt('gar-title', config.garTitle);
  setTxt('gar-sub', config.garSub);

  // SECCIÓN 11: CTA FINAL
  setTxt('cta-title', config.ctaTitle);
  setTxt('cta-sub', config.ctaSub);

  // SECCIÓN 12: FOOTER
  setTxt('foot-desc', config.footDesc);
  setTxt('foot-cob', config.footCob);
  setTxt('footer-email', config.emailContacto);

  // ACTUALIZAR BARRA DE CONVERSIÓN FLOTANTE (STICKY OFFER BAR SOLO PARA SITIOS MATRIX)
  if (!window.location.pathname.includes('kixiki-lanches') && !document.body.classList.contains('site-kixiki')) {
    setTxt('sticky-offer-title', `🔥 ${config.planProTitle}`);
    setTxt('sticky-offer-price', config.planProPrecio);
    const stickyBtn = document.getElementById('sticky-offer-btn');
    if (stickyBtn) {
      const isStandalone = window.location.pathname.includes('/sites/') || document.body.classList.contains('mode-standalone');
      stickyBtn.href = isStandalone ? 'pago.html?plan=pro' : `sites/${dominioKey}/pago.html?plan=pro`;
      stickyBtn.removeAttribute("target");
      stickyBtn.innerHTML = `💳 ${config.pais.includes('Brasil') ? 'Garantir Plano Pro' : 'Garantizar Plan Pro'}`;
    }
  }

  console.log(`Localización total de 12 secciones aplicada para: ${config.marca} (${config.dominio})`);
}

// 6. CONTROLADOR DEL SCROLL PARA MOSTRAR LA BARRA FLOTANTE (REGLA 13.36)
function initStickyHeaderScroll() {
  const stickyBar = document.getElementById('sticky-header-bar');
  if (!stickyBar) return;

  const phoneWrapper = document.getElementById('phone-frame-wrapper');

  const handleScroll = () => {
    let scrollPos = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    if (phoneWrapper && document.body.classList.contains('mode-phone-active')) {
      scrollPos = phoneWrapper.scrollTop;
    }
    if (scrollPos > 30) {
      stickyBar.classList.add('visible');
    } else {
      stickyBar.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  document.addEventListener('scroll', handleScroll, { passive: true });
  if (phoneWrapper) {
    phoneWrapper.addEventListener('scroll', handleScroll, { passive: true });
  }
  setTimeout(handleScroll, 100);
  handleScroll();
}

function toggleFaq(element) {
  const item = element.parentElement;
  item.classList.toggle('active');
}

function handleLeadSubmit(event) {
  event.preventDefault();
  const confirmMsg = document.getElementById('lead-confirm-msg');
  if (confirmMsg) {
    confirmMsg.style.display = 'block';
  }
  alert("✅ ¡Gracias! Hemos recibido tu solicitud. Te enviaremos una propuesta personalizada en menos de 24 horas.");
}

// 7. LÓGICA DEL MODAL INTERACTIVO DE PAGO (REGLA 13.38)
let currentPlanSelected = 'pro';
let currentAliasToCopy = 'riosponce';

function abrirModalPago(planKey = 'pro') {
  currentPlanSelected = planKey;
  const config = CONFIG_REGIONAL[currentDominioKey];
  if (!config) return;

  const modal = document.getElementById('modal-pago');
  if (!modal) return;

  // Asignar título y precio según plan
  if (planKey === 'low') {
    setTxt('modal-plan-tag', 'OPCIÓN DE ENTRADA');
    setTxt('modal-plan-title', config.planLowTitle);
    setTxt('modal-plan-price', config.planLowPrecio);
  } else if (planKey === 'prem') {
    setTxt('modal-plan-tag', 'SISTEMA 360');
    setTxt('modal-plan-title', config.planPremTitle);
    setTxt('modal-plan-price', config.planPremPrecio);
  } else {
    setTxt('modal-plan-tag', 'RECOMENDADO DE CONVERSIÓN');
    setTxt('modal-plan-title', config.planProTitle);
    setTxt('modal-plan-price', config.planProPrecio);
  }

  // Personalizar según el país activo
  if (currentDominioKey === 'digitalmas.pro') {
    setTxt('modal-card-highlight', '💳 Pagamento Seguro no Cartão de Crédito');
    setTxt('modal-card-sub', 'Disponível em até 12x Sem Juros no cartão pelo Mercado Pago / Asaas.');
    setTxt('modal-transfer-intro', 'Pague com PIX instantâneo (Sem taxas):');
    setTxt('transfer-holder-name', 'Titular: Andres Sebastian Rios Ponce');
    setTxt('transfer-details-1', 'Chave PIX (Celular): +55 55 99712-0149');
    setTxt('transfer-details-2', 'CPF: 05353769953 (Nubank / Mercado Pago)');
    currentAliasToCopy = '+55 55 99712-0149';
  } else if (currentDominioKey === 'ofertasweb.com.ar') {
    setTxt('modal-card-highlight', '💳 Pago Seguro con Tarjeta o Mercado Pago');
    setTxt('modal-card-sub', 'Cobro inmediato con tarjeta o dinero en cuenta.');
    setTxt('modal-transfer-intro', 'Realizá tu transferencia directa (0% comisión):');
    setTxt('transfer-holder-name', 'Titular: Andrés Sebastián Rios Ponce');
    setTxt('transfer-details-1', 'Alias BNA (Banco Nación): riosponce');
    setTxt('transfer-details-2', 'Alias Mercado Pago: ofertasweb');
    currentAliasToCopy = 'riosponce';
  } else {
    setTxt('modal-card-highlight', '💳 Pago Seguro con Tarjeta o Bizum');
    setTxt('modal-card-sub', 'Procesamiento instantáneo mediante Stripe o Bizum.');
    setTxt('modal-transfer-intro', 'Transferencia bancaria directa SEPA / IBAN:');
    setTxt('transfer-holder-name', 'Titular: Andrés Sebastián Rios Ponce');
    setTxt('transfer-details-1', 'Método Móvil: Bizum / SEPA Instant');
    setTxt('transfer-details-2', 'Wise IBAN: Disponible previa factura');
    currentAliasToCopy = 'hola@webas.es';
  }

  // Enlace directo de confirmación a WhatsApp
  const btnWa = document.getElementById('btn-wa-confirm-receipt');
  if (btnWa && config.whatsappActivo) {
    btnWa.href = `https://wa.me/${config.whatsappNumero}?text=Hola!%20Acabo%20de%20realizar%20el%20pago/transferencia%20para%20el%20plan%20${encodeURIComponent(config.planProTitle)}...`;
    btnWa.target = "_blank";
  }

  modal.classList.add('active');
}

function cerrarModalPago() {
  const modal = document.getElementById('modal-pago');
  if (modal) modal.classList.remove('active');
}

function switchModalTab(tab) {
  const btnCard = document.getElementById('tab-btn-card');
  const btnTransfer = document.getElementById('tab-btn-transfer');
  const paneCard = document.getElementById('tab-content-card');
  const paneTransfer = document.getElementById('tab-content-transfer');

  if (tab === 'card') {
    btnCard.classList.add('active');
    btnTransfer.classList.remove('active');
    paneCard.classList.add('active');
    paneTransfer.classList.remove('active');
  } else {
    btnTransfer.classList.add('active');
    btnCard.classList.remove('active');
    paneTransfer.classList.add('active');
    paneCard.classList.remove('active');
  }
}

function copiarAliasTitular() {
  navigator.clipboard.writeText(currentAliasToCopy).then(() => {
    alert(`📋 Copiado al portapapeles: ${currentAliasToCopy}`);
  }).catch(() => {
    alert(`Dato de pago: ${currentAliasToCopy}`);
  });
}

function procesarPagoMercadoPago() {
  const config = CONFIG_REGIONAL[currentDominioKey];
  const url = (config && config.checkoutAutoUrl) ? config.checkoutAutoUrl : `gracias.html?site=${currentDominioKey}&status=success`;
  window.open(url, '_self');
}

function initCheckoutPage() {
  if (!window.location.pathname.includes('pago.html')) return;
  const urlParams = new URLSearchParams(window.location.search);
  const planKey = urlParams.get('plan') || 'pro';
  
  const pathParts = window.location.pathname.split('/');
  let dominio = 'webas.es';
  for (let part of pathParts) {
    if (part.includes('.')) { dominio = part; break; }
  }
  const config = (typeof CONFIG_REGIONAL !== 'undefined' && CONFIG_REGIONAL[dominio]) ? CONFIG_REGIONAL[dominio] : (typeof CONFIG_REGIONAL !== 'undefined' ? CONFIG_REGIONAL['webas.es'] : null);
  if (!config) return;

  let title = config.planProTitle;
  let sub = config.planProSub;
  let price = config.planProPrecio;
  let listHtml = config.proList || '';
  let badgeText = "RECOMENDADO DE CONVERSIÓN";

  if (planKey === 'low') {
    title = config.planLowTitle;
    sub = config.planLowSub;
    price = config.planLowPrecio;
    listHtml = config.lowList || '';
    badgeText = "EXPRESS WHATSAPP";
  } else if (planKey === 'prem') {
    title = config.planPremTitle;
    sub = config.planPremSub;
    price = config.planPremPrecio;
    listHtml = config.premList || '';
    badgeText = "SISTEMA 360 COMPLETO";
  }

  const badgeElem = document.getElementById('chk-plan-badge');
  const titleElem = document.getElementById('chk-plan-title');
  const subElem = document.getElementById('chk-plan-sub');
  const priceElem = document.getElementById('chk-plan-price');
  const listElem = document.getElementById('chk-plan-list');

  if (badgeElem) badgeElem.innerText = badgeText;
  if (titleElem) titleElem.innerText = title;
  if (subElem) subElem.innerText = sub;
  if (priceElem) priceElem.innerHTML = `${price} <span style="font-size: 0.85rem; font-weight: 400; color: var(--text-muted);">/ ${config.pais.includes('Brasil') ? 'pagamento único' : 'pago único'}</span>`;
  if (listElem && listHtml) listElem.innerHTML = listHtml;
}

// Inicializar tema, verificar si es pestaña standalone, activar scroll y checkout dinámico
document.addEventListener('DOMContentLoaded', () => {
  initTema();
  checkStandaloneMode();
  initStickyHeaderScroll();
  initCheckoutPage();
});

console.log("WEBAS Engine Script & Total 12-Section Localization Ready.");
