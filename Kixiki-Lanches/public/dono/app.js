const API = {
  auth: "/api/auth",
  owner: "/api/kixiki-owner",
  metrics: "/api/kixiki-metrics",
  productImage: "/api/kixiki-product-image",
};

const TASK_COPY = [
  {
    id: "service-truth",
    letter: "A",
    title: "Entrega e área de atendimento",
    tip: "Confirme delivery, cobertura, horários e retirada. Só dados confirmados podem chegar à página pública.",
    view: "operation",
    action: "Confirmar operação",
  },
  {
    id: "operational-data",
    letter: "B",
    title: "Dados e evidências reais",
    tip: "Complete horários e ao menos um item real com preço, descrição e foto.",
    view: "catalog",
    action: "Atualizar dados",
  },
  {
    id: "google-reputation",
    letter: "C",
    title: "Rotina de reputação Google",
    tip: "Peça uma avaliação honesta a clientes reais e registre a rotina, sem sugerir nota.",
    view: "seo",
    action: "Abrir reputação",
  },
];

const DAY_LABELS = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

const CATALOG_GROUPS = [
  {
    id: "marmitas",
    title: "Marmitas caseiras",
    icon: "🍲",
    productIds: ["marmita-p", "marmita-m", "marmita-gg"],
  },
  {
    id: "lanches",
    title: "Hambúrgueres e Xis Gaúcho",
    icon: "🍔",
    productIds: [
      "xis-salada",
      "xis-bacon",
      "xis-calabresa",
      "xis-frango",
      "xis-strogonoff",
      "xis-coracao",
      "xis-egg",
      "xis-tudo",
    ],
  },
  {
    id: "pasteis",
    title: "Pastéis caseiros",
    icon: "🥟",
    productIds: ["pas-carne", "pas-queijo", "pas-pizza", "pas-calabresa"],
  },
  {
    id: "porcoes",
    title: "Porções e petiscos",
    icon: "🍟",
    productIds: ["por-batata", "por-bacon", "por-morro"],
  },
];

const STATUS_LABELS = {
  pending: "Pendente",
  done: "Feito",
  na: "N/A",
};

const FALLBACK_REFERENCE = {
  reviewBaseline: { rating: 4.7, reviewCount: 19, observedResponseCount: 0 },
  reviewRequestUrl:
    "https://search.google.com/local/writereview?placeid=ChIJUz9IOKpHJ5URu176vuPvi7w",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const escapeHtml = (value) =>
  String(value).replace(/[&<>'"]/g, (character) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[
      character
    ],
  );

const authHash = location.hash.match(/^#(invite_token|recovery_token)=([^&]+)/);
const authFlow = authHash
  ? {
      action: authHash[1] === "invite_token" ? "accept-invite" : "recover",
      token: decodeURIComponent(authHash[2]),
    }
  : null;

if (authFlow) history.replaceState(null, "", location.pathname + location.search);

let currentUser = null;
let ownerData = null;
let reference = FALLBACK_REFERENCE;
let remoteETag = null;
let remoteUpdatedAt = null;
let dirty = false;
let syncing = false;
let syncQueued = false;
let syncTimer = null;
let conflict = false;

const cacheKey = () =>
  currentUser?.id ? `kixiki-c001-owner-cache-v1:${currentUser.id}` : null;

const isUsableCachedData = (data) =>
  data?.schema === "digitalmas-c001-kixiki-owner-v1" &&
  data?.projectId === "C001" &&
  data.service &&
  Array.isArray(data.hours) &&
  data.hours.length === 7 &&
  Array.isArray(data.catalog) &&
  Array.isArray(data.seo?.tasks) &&
  data.seo.tasks.length === 3 &&
  Array.isArray(data.seo?.checkpoints) &&
  data.seo.checkpoints.length === 5;

const safeReviewUrl = () => {
  const candidate = reference?.reviewRequestUrl;
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol === "https:" && parsed.hostname === "search.google.com") return parsed.href;
  } catch {}
  return FALLBACK_REFERENCE.reviewRequestUrl;
};

const PRODUCT_FALLBACKS = Object.freeze({
  marmita: "/assets/kixiki-marmita-mascot-v1.svg",
  xis: "/assets/kixiki-burger-menu-v1.svg",
  pas: "/assets/kixiki-pastel-mascot-v1.svg",
  por: "/assets/kixiki-porcao-mascot-v1.svg",
  item: "/assets/kixiki-logo-v0.1.svg",
});

const DEFAULT_CATALOG_PHOTOS = Object.freeze({
  "marmita-p": "/assets/marmita-p-real.jpg",
  "marmita-m": "/assets/marmita-m-real.jpg",
  "marmita-gg": "/assets/marmita-gg-real.jpg",
  "xis-salada": "/assets/xis-salada-real.jpg",
  "xis-bacon": "/assets/xis-bacon-real.jpg",
  "xis-calabresa": "/assets/xis-calabresa-real.jpg",
  "xis-frango": "/assets/xis-frango-real.jpg",
  "xis-strogonoff": "/assets/xis-strogonoff-real.jpg",
  "xis-tudo": "/assets/xis-tudo-real.jpg",
  "por-batata": "/assets/por-batata-real.jpg",
});

const defaultPhotoForProduct = (productId) => DEFAULT_CATALOG_PHOTOS[productId] || "";

const productFamily = (productId) => {
  const prefix = String(productId || "").split("-")[0];
  return Object.hasOwn(PRODUCT_FALLBACKS, prefix) ? prefix : "item";
};

const productFallbackUrl = (productId) => PRODUCT_FALLBACKS[productFamily(productId)];

const productPhotoUrl = (item) => {
  if (item?.photoAssetVersion) {
    return `${API.productImage}?product=${encodeURIComponent(item.id)}&v=${encodeURIComponent(item.photoAssetVersion)}`;
  }
  return item?.photoUrl || defaultPhotoForProduct(item?.id) || "";
};

const hasProductPhoto = (item) => Boolean(item?.photoAssetVersion || item?.photoUrl || defaultPhotoForProduct(item?.id));

const canvasToBlob = (canvas, type, quality) =>
  new Promise((resolve) => canvas.toBlob(resolve, type, quality));

const optimizeProductPhoto = async (file) => {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Use uma foto JPEG, PNG ou WEBP.");
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error("A foto original deve ter no máximo 5 MB.");
  }

  let bitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("Não foi possível ler esta foto.");
  }

  const maxSide = 1_400;
  const ratio = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * ratio));
  const height = Math.max(1, Math.round(bitmap.height * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { alpha: false });
  context.fillStyle = "#fff8e8";
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close?.();

  const optimized = await canvasToBlob(canvas, "image/webp", 0.82);
  if (!optimized) throw new Error("Não foi possível otimizar esta foto.");
  if (optimized.size > 5 * 1024 * 1024) {
    throw new Error("A foto otimizada ainda ultrapassa 5 MB.");
  }
  return new File([optimized], "foto-kixiki.webp", { type: "image/webp" });
};

const setPhotoState = (index, message, tone = "") => {
  const element = $(`[data-product-photo-state="${index}"]`);
  if (!element) return;
  element.textContent = message;
  element.className = `product-photo-state ${tone}`.trim();
};

const refreshProductPhotoUI = (index) => {
  const item = ownerData?.catalog?.[index];
  if (!item) return;
  const image = $(`[data-product-photo-preview="${index}"]`);
  const label = $(`[data-product-photo-label="${index}"]`);
  const remove = $(`[data-product-photo-remove="${index}"]`);
  const realPhoto = productPhotoUrl(item);
  if (image) {
    image.src = realPhoto || productFallbackUrl(item.id);
    image.alt = realPhoto
      ? `Foto de ${item.name || "produto do Kixiki"}`
      : `Ilustração do Kixiki para ${item.name || "produto"}`;
    image.dataset.fallback = productFallbackUrl(item.id);
    image.classList.toggle("is-fallback", !realPhoto);
  }
  if (label) label.textContent = realPhoto ? "Trocar foto" : "Adicionar foto";
  if (remove) remove.hidden = !realPhoto;
};

const uploadProductPhoto = async (index, file, button) => {
  const item = ownerData?.catalog?.[index];
  if (!item) return;
  const previous = {
    photoUrl: item.photoUrl,
    photoAssetVersion: item.photoAssetVersion,
  };
  button.disabled = true;
  setPhotoState(index, "Otimizando foto…", "loading");
  try {
    const optimized = await optimizeProductPhoto(file);
    setPhotoState(index, "Carregando…", "loading");
    const form = new FormData();
    form.set("photo", optimized, optimized.name);
    const response = await fetch(
      `${API.productImage}?product=${encodeURIComponent(item.id)}`,
      {
        method: "POST",
        credentials: "same-origin",
        body: form,
      },
    );
    const result = await response.json().catch(() => ({}));
    if (response.status === 401) {
      showLogin("Sua sessão terminou. Entre novamente.", "info");
      throw new Error("Sua sessão terminou.");
    }
    if (response.status === 403) {
      showDenied();
      throw new Error("Esta conta não possui permissão para enviar fotos.");
    }
    if (!response.ok) throw new Error(result.error || "Erro ao enviar a foto.");

    item.photoAssetVersion = result.version;
    item.photoUrl = "";
    clearTimeout(syncTimer);
    syncTimer = null;
    markProductChanged(index);
    clearTimeout(syncTimer);
    syncTimer = null;
    refreshProductPhotoUI(index);
    const outcome = await syncRemote();
    if (!outcome?.ok) {
      item.photoUrl = previous.photoUrl;
      item.photoAssetVersion = previous.photoAssetVersion;
      refreshProductPhotoUI(index);
      await fetch(
        `${API.productImage}?product=${encodeURIComponent(item.id)}&v=${encodeURIComponent(result.version)}`,
        { method: "DELETE", credentials: "same-origin" },
      ).catch(() => {});
      throw new Error(outcome?.message || "Foto enviada, mas o item ainda não foi salvo.");
    }
    if (
      previous.photoAssetVersion &&
      previous.photoAssetVersion !== result.version
    ) {
      await fetch(
        `${API.productImage}?product=${encodeURIComponent(item.id)}&v=${encodeURIComponent(previous.photoAssetVersion)}`,
        { method: "DELETE", credentials: "same-origin" },
      ).catch(() => {});
    }
    setPhotoState(index, "✓ Foto adicionada e item salvo.", "success");
  } catch (error) {
    setPhotoState(index, error?.message || "Erro ao enviar", "error");
  } finally {
    button.disabled = false;
  }
};

const removeProductPhoto = async (index, button) => {
  const item = ownerData?.catalog?.[index];
  if (!item || !hasProductPhoto(item)) return;
  if (!confirm(`Remover a foto de “${item.name || "este item"}” e voltar ao visual Kixiki?`)) return;

  const previous = {
    photoUrl: item.photoUrl,
    photoAssetVersion: item.photoAssetVersion,
  };
  button.disabled = true;
  item.photoUrl = "";
  item.photoAssetVersion = null;
  clearTimeout(syncTimer);
  syncTimer = null;
  markProductChanged(index);
  clearTimeout(syncTimer);
  syncTimer = null;
  refreshProductPhotoUI(index);
  setPhotoState(index, "Removendo foto…", "loading");

  const outcome = await syncRemote();
  if (!outcome?.ok) {
    item.photoUrl = previous.photoUrl;
    item.photoAssetVersion = previous.photoAssetVersion;
    refreshProductPhotoUI(index);
    setPhotoState(index, outcome?.message || "Não foi possível remover a foto.", "error");
    button.disabled = false;
    return;
  }

  if (previous.photoAssetVersion) {
    try {
      await fetch(
        `${API.productImage}?product=${encodeURIComponent(item.id)}&v=${encodeURIComponent(previous.photoAssetVersion)}`,
        { method: "DELETE", credentials: "same-origin" },
      );
    } catch {}
  }
  setPhotoState(index, "✓ Foto removida. O visual Kixiki voltou.", "success");
  button.disabled = false;
};

const showLogin = (message = "", tone = "") => {
  currentUser = null;
  $("#ownerApp").hidden = true;
  $("#authGate").hidden = false;
  $("#loginForm").hidden = false;
  $("#accessDenied").hidden = true;
  $("#loginMessage").textContent = message;
  $("#loginMessage").className = `form-message ${tone}`.trim();
  document.body.style.overflow = "hidden";
};

const showDenied = () => {
  $("#ownerApp").hidden = true;
  $("#authGate").hidden = false;
  $("#loginForm").hidden = true;
  $("#accessDenied").hidden = false;
  document.body.style.overflow = "hidden";
};

const showApp = () => {
  $("#authGate").hidden = true;
  $("#ownerApp").hidden = false;
  $("#accountEmail").textContent = currentUser?.email || "Dono Kixiki";
  document.body.style.overflow = "";
};

const setSaveState = (message, tone = "") => {
  $$('[data-save-state]').forEach((element) => {
    element.textContent = message;
    element.className = `save-state ${tone}`.trim();
  });
};

const formatDateTime = (value) => {
  if (!value) return "Nenhuma atualização registrada";
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) return "Atualização sem data válida";
  return `Última atualização: ${new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date)}`;
};

const setLastUpdate = (value) => {
  $$('[data-last-update]').forEach((element) => {
    element.textContent = formatDateTime(value);
  });
};

const setMetricValue = (selector, value) => {
  const element = $(selector);
  if (element) element.textContent = Number.isFinite(Number(value)) ? String(Number(value)) : "0";
};

const loadMetrics = async () => {
  const status = $("#metricsStatus");
  if (!status) return;
  status.textContent = "Atualizando métricas…";
  try {
    const response = await fetch(API.metrics, { credentials: "same-origin" });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Não foi possível carregar as métricas.");
    setMetricValue("#metricPageView", result.events?.page_view);
    setMetricValue("#metricWhatsappClick", result.events?.whatsapp_click);
    setMetricValue("#metricGiftView", result.events?.gift_view);
    setMetricValue("#metricGiftClick", result.events?.gift_cta_click);
    const primarySource = result.sources?.[0];
    $("#metricSource").textContent = primarySource
      ? `Origem principal: ${primarySource.source} (${primarySource.count})`
      : "Origem principal: ainda sem dados";
    const environment = result.environment === "production" ? "produção" : "preview isolado";
    status.textContent = `${environment} · ${formatDateTime(result.lastUpdated).replace("Última atualização: ", "")}`;
  } catch (error) {
    status.textContent = error?.message || "Métricas temporariamente indisponíveis.";
  }
};

const setProductSaveFeedback = (productId, message, tone = "") => {
  const element = $$('[data-product-feedback]').find(
    (candidate) => candidate.dataset.productFeedback === productId,
  );
  if (!element) return;
  element.textContent = message;
  element.className = `product-save-feedback ${tone}`.trim();
};

const confirmPendingProductFeedback = () => {
  $$('.product-save-feedback.pending').forEach((element) => {
    const item = ownerData?.catalog.find(
      (candidate) => candidate.id === element.dataset.productFeedback,
    );
    const label = item?.name?.trim() || "Item";
    element.textContent = `✓ ${label}: alterações salvas.`;
    element.className = "product-save-feedback synced";
  });
};

const today = () => {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.valueOf() - offset).toISOString().slice(0, 10);
};

const saveCache = () => {
  const key = cacheKey();
  if (!key || !ownerData) return;
  localStorage.setItem(
    key,
    JSON.stringify({
      userId: currentUser.id,
      data: ownerData,
      reference,
      etag: remoteETag,
      updatedAt: remoteUpdatedAt,
      cachedAt: new Date().toISOString(),
    }),
  );
};

const readCache = () => {
  const key = cacheKey();
  if (!key) return null;
  try {
    const cached = JSON.parse(localStorage.getItem(key));
    if (cached?.userId !== currentUser.id || !isUsableCachedData(cached?.data)) return null;
    return cached;
  } catch {
    return null;
  }
};

const clearCurrentCache = () => {
  const key = cacheKey();
  if (key) localStorage.removeItem(key);
};

const showConflict = () => {
  conflict = true;
  $("#conflictBanner").hidden = false;
  setSaveState("Conflito: versão mais nova encontrada", "error");
};

const hideConflict = () => {
  conflict = false;
  $("#conflictBanner").hidden = true;
};

const pendingCompletionMessage = () => {
  const incompleteTask = ownerData.seo.tasks.find(
    (task) => task.status === "done" && (!task.date || !task.evidence.trim()),
  );
  if (incompleteTask) return "Para concluir, informe data e evidência da prioridade.";
  const incompleteCheckpoint = ownerData.seo.checkpoints.find(
    (checkpoint) =>
      checkpoint.status === "done" && (!checkpoint.date || !checkpoint.evidence.trim()),
  );
  if (incompleteCheckpoint) return "Para concluir o checkpoint, informe data e evidência.";
  return "";
};

const scheduleSync = () => {
  clearTimeout(syncTimer);
  syncTimer = setTimeout(syncRemote, 750);
};

const markChanged = ({ rerenderSummary = true } = {}) => {
  dirty = true;
  saveCache();
  if (rerenderSummary) renderSummary();
  const incomplete = pendingCompletionMessage();
  if (incomplete) {
    setSaveState(incomplete, "error");
    return;
  }
  setSaveState("Alterações pendentes…");
  if (!conflict) scheduleSync();
};

async function syncRemote() {
  if (!currentUser || !ownerData) {
    return { ok: false, message: "Sessão indisponível." };
  }
  if (conflict) {
    return { ok: false, message: "Carregue a versão mais nova antes de salvar." };
  }
  const incomplete = pendingCompletionMessage();
  if (incomplete) {
    setSaveState(incomplete, "error");
    return { ok: false, message: incomplete };
  }
  if (syncing) {
    syncQueued = true;
    return { ok: false, message: "Outro salvamento está em andamento." };
  }
  syncing = true;
  setSaveState("Salvando na base segura…");

  try {
    const response = await fetch(API.owner, {
      method: "PUT",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ data: ownerData, etag: remoteETag }),
    });
    const result = await response.json().catch(() => ({}));
    if (response.status === 409) {
      showConflict();
      return { ok: false, message: "Existe uma versão mais nova em outro aparelho." };
    }
    if (response.status === 401) {
      showLogin("Sua sessão terminou. Entre novamente.", "info");
      return { ok: false, message: "Sua sessão terminou." };
    }
    if (response.status === 403) {
      showDenied();
      return { ok: false, message: "Esta conta não possui permissão para salvar." };
    }
    if (!response.ok) throw new Error(result.error || "Não foi possível salvar.");

    remoteETag = result.etag || remoteETag;
    remoteUpdatedAt = result.updatedAt || remoteUpdatedAt;
    dirty = false;
    saveCache();
    setLastUpdate(remoteUpdatedAt);
    setSaveState("Sincronizado entre dispositivos", "synced");
    confirmPendingProductFeedback();
    return { ok: true, updatedAt: remoteUpdatedAt };
  } catch (error) {
    const message =
      error?.message && error.message !== "Failed to fetch"
        ? error.message
        : "Sem conexão · alterações só neste aparelho";
    setSaveState(message, "error");
    return { ok: false, message };
  } finally {
    syncing = false;
    if (syncQueued) {
      syncQueued = false;
      scheduleSync();
    }
  }
}

const loadPanel = async ({ allowCache = true } = {}) => {
  setSaveState("Carregando dados seguros…");
  hideConflict();
  try {
    const response = await fetch(API.owner, { credentials: "same-origin" });
    const result = await response.json().catch(() => ({}));
    if (response.status === 401) {
      showLogin("Sua sessão terminou. Entre novamente.", "info");
      return false;
    }
    if (response.status === 403) {
      showDenied();
      return false;
    }
    if (!response.ok) throw new Error(result.error || "Não foi possível carregar o painel.");

    ownerData = result.data;
    reference = result.reference || FALLBACK_REFERENCE;
    remoteETag = result.etag || null;
    remoteUpdatedAt = result.updatedAt || null;
    dirty = result.catalogMigrated === true;
    saveCache();
    showApp();
    renderAll();
    void loadMetrics();
    setSaveState(
      dirty
        ? "Cardápio completo preparado · clique em Salvar agora"
        : "Sincronizado entre dispositivos",
      dirty ? "" : "synced",
    );
    return true;
  } catch (error) {
    const cached = allowCache ? readCache() : null;
    if (!cached) {
      showLogin(
        error?.message || "O acesso seguro está indisponível. Tente novamente em alguns minutos.",
        "info",
      );
      return false;
    }
    ownerData = cached.data;
    reference = cached.reference || FALLBACK_REFERENCE;
    remoteETag = cached.etag || null;
    remoteUpdatedAt = cached.updatedAt || null;
    showApp();
    renderAll();
    void loadMetrics();
    setSaveState("Sem conexão · mostrando cache deste aparelho", "error");
    return true;
  }
};

const checkSession = async () => {
  try {
    const response = await fetch(API.auth, { credentials: "same-origin" });
    if (!response.ok) throw new Error("session");
    const result = await response.json();
    if (!result.user) {
      showLogin();
      return;
    }
    currentUser = result.user;
    await loadPanel();
  } catch {
    showLogin("O acesso seguro está indisponível. Tente novamente em alguns minutos.", "info");
  }
};

const logout = async () => {
  clearTimeout(syncTimer);
  if (dirty && !conflict) await syncRemote();
  clearCurrentCache();
  try {
    await fetch(API.auth, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
  } finally {
    location.replace(location.pathname);
  }
};

const configureAuthFlow = () => {
  if (!authFlow) return;
  $("#emailLabel").hidden = true;
  $("#loginEmail").hidden = true;
  $("#loginEmail").required = false;
  $("#recoveryButton").hidden = true;
  $("#confirmPasswordField").hidden = false;
  $("#confirmPassword").required = true;
  $("#passwordLabel").textContent = "Nova senha";
  $("#loginPassword").autocomplete = "new-password";
  $("#loginPassword").minLength = 12;
  $("#loginButton").textContent =
    authFlow.action === "accept-invite" ? "Criar meu acesso" : "Salvar nova senha";
  $("#authTitle").textContent =
    authFlow.action === "accept-invite" ? "Crie seu acesso" : "Recupere seu acesso";
  $("#authDescription").textContent =
    "Use ao menos 12 caracteres e repita exatamente a mesma senha.";
  showLogin("Defina uma senha segura para continuar.", "info");
};

$("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const password = $("#loginPassword").value;
  if (authFlow && (password.length < 12 || password !== $("#confirmPassword").value)) {
    $("#loginMessage").textContent =
      password.length < 12
        ? "A senha precisa ter ao menos 12 caracteres."
        : "As duas senhas precisam ser iguais.";
    return;
  }

  const button = $("#loginButton");
  button.disabled = true;
  $("#loginMessage").className = "form-message info";
  $("#loginMessage").textContent = "Verificando com segurança…";
  try {
    const action = authFlow?.action || "login";
    const response = await fetch(API.auth, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        action,
        email: $("#loginEmail").value.trim(),
        password,
        token: authFlow?.token,
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "AUTH_FAILED");
    if (authFlow) {
      location.replace(`${location.pathname}?acesso=pronto`);
      return;
    }
    currentUser = result.user;
    await loadPanel();
  } catch (error) {
    $("#loginMessage").className = "form-message";
    $("#loginMessage").textContent = authFlow
      ? error.message === "LINK_INVALID"
        ? "O link venceu ou já foi usado. Solicite um novo convite."
        : "Não foi possível salvar a senha. Confira os campos."
      : "E-mail ou senha incorretos.";
  } finally {
    button.disabled = false;
  }
});

$("#recoveryButton").addEventListener("click", async () => {
  const email = $("#loginEmail").value.trim();
  if (!email) {
    $("#loginMessage").textContent = "Informe primeiro o seu e-mail.";
    return;
  }
  $("#recoveryButton").disabled = true;
  try {
    await fetch(API.auth, {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "request-recovery", email }),
    });
    $("#loginMessage").className = "form-message success";
    $("#loginMessage").textContent =
      "Se o e-mail estiver cadastrado, você receberá um link de recuperação.";
  } catch {
    $("#loginMessage").textContent = "Não foi possível solicitar a recuperação.";
  } finally {
    $("#recoveryButton").disabled = false;
  }
});

const showView = (view) => {
  $$('[data-view-panel]').forEach((panel) => {
    const active = panel.dataset.viewPanel === view;
    panel.hidden = !active;
    panel.classList.toggle("active", active);
  });
  $$('[data-view]').forEach((button) =>
    button.classList.toggle("active", button.dataset.view === view),
  );
  scrollTo({ top: 0, behavior: "smooth" });
};

$$('[data-view]').forEach((button) =>
  button.addEventListener("click", () => showView(button.dataset.view)),
);

const renderSummary = () => {
  const done = ownerData.seo.tasks.filter((task) => task.status === "done").length;
  $("#doneCount").textContent = `${done}/3`;
  $$(".task-card").forEach((card, index) => {
    card.classList.toggle("done", ownerData.seo.tasks[index]?.status === "done");
    card.classList.toggle("na", ownerData.seo.tasks[index]?.status === "na");
  });
};

const renderTasks = () => {
  $("#taskCards").innerHTML = TASK_COPY.map((copy, index) => {
    const task = ownerData.seo.tasks[index];
    return `<article class="task-card ${task.status}">
      <div class="task-number"><span>${copy.letter}</span><span class="eyebrow">${escapeHtml(STATUS_LABELS[task.status])}</span></div>
      <h3>${escapeHtml(copy.title)}</h3>
      <p>${escapeHtml(copy.tip)}</p>
      <div class="task-controls">
        <label>Estado
          <select data-task-status="${index}">
            ${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}" ${task.status === value ? "selected" : ""}>${label}</option>`).join("")}
          </select>
        </label>
        <label>Data
          <input data-task-date="${index}" type="date" value="${escapeHtml(task.date || "")}">
        </label>
        <label class="wide">Evidência
          <textarea data-task-evidence="${index}" rows="3" maxlength="1500" placeholder="Link, captura ou confirmação observável">${escapeHtml(task.evidence)}</textarea>
        </label>
      </div>
      <button class="secondary-button jump-button" data-jump="${copy.view}" type="button">${escapeHtml(copy.action)} →</button>
    </article>`;
  }).join("");

  $$('[data-task-status]').forEach((input) =>
    input.addEventListener("change", () => {
      const task = ownerData.seo.tasks[Number(input.dataset.taskStatus)];
      task.status = input.value;
      if (task.status === "done" && !task.date) task.date = today();
      renderTasks();
      renderSummary();
      markChanged();
    }),
  );
  $$('[data-task-date]').forEach((input) =>
    input.addEventListener("change", () => {
      ownerData.seo.tasks[Number(input.dataset.taskDate)].date = input.value || null;
      markChanged();
    }),
  );
  $$('[data-task-evidence]').forEach((input) =>
    input.addEventListener("input", () => {
      ownerData.seo.tasks[Number(input.dataset.taskEvidence)].evidence = input.value;
      markChanged({ rerenderSummary: false });
    }),
  );
  $$('[data-jump]').forEach((button) =>
    button.addEventListener("click", () => showView(button.dataset.jump)),
  );
};

const bindTextField = (selector, object, key, { invalidateService = false } = {}) => {
  const element = $(selector);
  element.value = object[key] || "";
  element.oninput = () => {
    object[key] = element.value;
    if (invalidateService) {
      ownerData.service.confirmedAt = null;
      $("#serviceConfirmedAt").textContent = "Alterado · confirme novamente";
    }
    markChanged({ rerenderSummary: false });
  };
};

const renderService = () => {
  $("#deliveryStatus").value = ownerData.service.deliveryStatus;
  $("#pickupStatus").value = ownerData.service.pickupStatus;
  bindTextField("#serviceArea", ownerData.service, "serviceArea", { invalidateService: true });
  bindTextField("#deliveryHours", ownerData.service, "deliveryHours", { invalidateService: true });
  bindTextField("#pickupHours", ownerData.service, "pickupHours", { invalidateService: true });
  bindTextField("#serviceNotes", ownerData.service, "notes", { invalidateService: true });
  bindTextField("#serviceEvidence", ownerData.service, "evidence");
  $("#serviceConfirmedAt").textContent = ownerData.service.confirmedAt
    ? `Confirmado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(ownerData.service.confirmedAt))}`
    : "Ainda não confirmado";

  $("#deliveryStatus").onchange = (event) => {
    ownerData.service.deliveryStatus = event.target.value;
    ownerData.service.confirmedAt = null;
    $("#serviceConfirmedAt").textContent = "Alterado · confirme novamente";
    markChanged();
  };
  $("#pickupStatus").onchange = (event) => {
    ownerData.service.pickupStatus = event.target.value;
    ownerData.service.confirmedAt = null;
    $("#serviceConfirmedAt").textContent = "Alterado · confirme novamente";
    markChanged();
  };
};

const validateServiceConfirmation = () => {
  const service = ownerData.service;
  if (service.deliveryStatus === "unknown" || service.pickupStatus === "unknown") {
    return "Confirme se há delivery e retirada.";
  }
  if (service.deliveryStatus === "yes" && (!service.serviceArea.trim() || !service.deliveryHours.trim())) {
    return "Informe a área e o horário do delivery.";
  }
  if (service.pickupStatus === "yes" && !service.pickupHours.trim()) {
    return "Informe o horário de retirada.";
  }
  if (!service.evidence.trim()) return "Adicione uma evidência breve da confirmação.";
  return "";
};

$("#confirmServiceButton").addEventListener("click", () => {
  const error = validateServiceConfirmation();
  if (error) {
    setSaveState(error, "error");
    return;
  }
  ownerData.service.confirmedAt = new Date().toISOString();
  $("#serviceConfirmedAt").textContent = `Confirmado agora por ${currentUser.email || "usuário autorizado"}`;
  markChanged();
});

const renderHours = () => {
  $("#hoursGrid").innerHTML = ownerData.hours.map((entry, index) => `<article class="hour-card">
    <strong>${escapeHtml(DAY_LABELS[entry.id] || entry.id)}</strong>
    <div class="time-row">
      <label>Abre<input data-hour-open="${index}" type="time" value="${escapeHtml(entry.opens)}" ${entry.closed ? "disabled" : ""}></label>
      <label>Fecha<input data-hour-close="${index}" type="time" value="${escapeHtml(entry.closes)}" ${entry.closed ? "disabled" : ""}></label>
    </div>
    <label class="closed-toggle"><input data-hour-closed="${index}" type="checkbox" ${entry.closed ? "checked" : ""}> Fechado</label>
  </article>`).join("");

  $$('[data-hour-open]').forEach((input) =>
    input.addEventListener("change", () => {
      ownerData.hours[Number(input.dataset.hourOpen)].opens = input.value;
      markChanged({ rerenderSummary: false });
    }),
  );
  $$('[data-hour-close]').forEach((input) =>
    input.addEventListener("change", () => {
      ownerData.hours[Number(input.dataset.hourClose)].closes = input.value;
      markChanged({ rerenderSummary: false });
    }),
  );
  $$('[data-hour-closed]').forEach((input) =>
    input.addEventListener("change", () => {
      const entry = ownerData.hours[Number(input.dataset.hourClosed)];
      entry.closed = input.checked;
      if (entry.closed) {
        entry.opens = "";
        entry.closes = "";
      }
      renderHours();
      markChanged({ rerenderSummary: false });
    }),
  );
};

const formatPrice = (cents) =>
  cents === null ? "" : (cents / 100).toFixed(2).replace(".", ",");

const parsePrice = (value) => {
  let normalized = value.trim().replace(/R\$/gi, "").replace(/\s/g, "");
  if (!normalized) return null;
  if (normalized.includes(",")) normalized = normalized.replace(/\./g, "").replace(",", ".");
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100_000) return undefined;
  return Math.round(amount * 100);
};

const createProductId = () =>
  `item-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const markProductChanged = (index) => {
  const item = ownerData.catalog[index];
  if (item) {
    setProductSaveFeedback(item.id, "Alterações deste item pendentes.", "pending");
  }
  markChanged({ rerenderSummary: false });
};

const saveProduct = async (index, button) => {
  const item = ownerData.catalog[index];
  if (!item) return;
  clearTimeout(syncTimer);
  syncTimer = null;
  button.disabled = true;
  setProductSaveFeedback(item.id, "Salvando este item…", "saving");
  const outcome = await syncRemote();
  if (outcome?.ok) {
    const label = item.name.trim() || "Item";
    setProductSaveFeedback(item.id, `✓ ${label}: alterações salvas.`, "synced");
  } else {
    setProductSaveFeedback(
      item.id,
      outcome?.message || "Não foi possível salvar este item.",
      "error",
    );
  }
  button.disabled = false;
};

const catalogGroupFor = (item) =>
  CATALOG_GROUPS.find((group) => group.productIds.includes(item.id)) || {
    id: "outros",
    title: "Outros itens",
    icon: "➕",
    productIds: [],
  };

const renderProductCard = (item, index) => `<details class="product-card">
  <summary class="product-summary">
    <span class="product-summary-copy">
      <strong>${escapeHtml(item.name || `Item ${index + 1}`)}</strong>
      <small>${item.priceCents === null ? "Preço pendente" : `R$ ${escapeHtml(formatPrice(item.priceCents))}`}</small>
    </span>
    <span class="product-status ${item.active ? "active" : "inactive"}">${item.active ? "Ativo" : "Inativo"}</span>
  </summary>
  <div class="product-body">
    <div class="product-head">
      <span>Dados exibidos no cardápio</span>
      <label class="active-toggle"><input data-product-active="${index}" type="checkbox" ${item.active ? "checked" : ""}> Ativo no cardápio</label>
    </div>
    <div class="product-grid">
      <label>Nome do produto
        <input data-product-name="${index}" maxlength="80" value="${escapeHtml(item.name)}" placeholder="Nome real do item">
      </label>
      <label>Preço (R$)
        <input data-product-price="${index}" inputmode="decimal" value="${escapeHtml(formatPrice(item.priceCents))}" placeholder="0,00">
      </label>
      <label class="wide">Descrição
        <textarea data-product-description="${index}" rows="3" maxlength="500" placeholder="O que o cliente recebe">${escapeHtml(item.description)}</textarea>
      </label>
      <label class="wide">Ingredientes
        <textarea data-product-ingredients="${index}" rows="3" maxlength="500" placeholder="Ingredientes reais e informações úteis">${escapeHtml(item.ingredients)}</textarea>
      </label>
      <div class="wide product-photo-field">
        <span class="field-label">Foto do produto</span>
        <div class="product-photo-editor">
          <figure class="product-photo-preview">
            <img data-product-photo-preview="${index}" src="${escapeHtml(productPhotoUrl(item) || productFallbackUrl(item.id))}" data-fallback="${escapeHtml(productFallbackUrl(item.id))}" class="${hasProductPhoto(item) ? "" : "is-fallback"}" alt="${escapeHtml(hasProductPhoto(item) ? `Foto de ${item.name || "produto do Kixiki"}` : `Ilustração do Kixiki para ${item.name || "produto"}`)}">
          </figure>
          <div class="product-photo-controls">
            <strong>${hasProductPhoto(item) ? "Foto adicionada" : "Sem foto"}</strong>
            <p>JPEG, PNG ou WEBP. A imagem é otimizada antes do envio.</p>
            <input data-product-photo-input="${index}" type="file" accept="image/jpeg,image/png,image/webp" hidden>
            <div class="product-photo-buttons">
              <button class="secondary-button product-photo-button" data-product-photo-trigger="${index}" type="button"><span aria-hidden="true">📷</span> <span data-product-photo-label="${index}">${hasProductPhoto(item) ? "Trocar foto" : "Adicionar foto"}</span></button>
              <button class="remove-button product-photo-remove" data-product-photo-remove="${index}" type="button" ${hasProductPhoto(item) ? "" : "hidden"}>Remover foto</button>
            </div>
            <span class="product-photo-state" data-product-photo-state="${index}" role="status" aria-live="polite"></span>
          </div>
        </div>
      </div>
    </div>
    <div class="product-actions">
      <span class="product-save-feedback" data-product-feedback="${escapeHtml(item.id)}" role="status" aria-live="polite"></span>
      <div class="product-action-buttons">
        <button class="primary-button item-save-button" data-product-save="${index}" type="button">Salvar item</button>
        <button class="remove-button" data-product-remove="${index}" type="button">Remover item</button>
      </div>
    </div>
  </div>
</details>`;

const renderCatalog = () => {
  $("#emptyCatalog").hidden = ownerData.catalog.length !== 0;
  const indexedCatalog = ownerData.catalog.map((item, index) => ({ item, index }));
  const orderedGroups = [...CATALOG_GROUPS, { id: "outros", title: "Outros itens", icon: "➕" }];
  $("#catalogList").innerHTML = orderedGroups
    .map((group) => {
      const entries = indexedCatalog.filter(({ item }) => catalogGroupFor(item).id === group.id);
      if (!entries.length) return "";
      return `<section class="catalog-group" aria-labelledby="catalog-group-${group.id}">
        <header class="catalog-group-heading">
          <h3 id="catalog-group-${group.id}"><span aria-hidden="true">${group.icon}</span> ${group.title}</h3>
          <span>${entries.length} ${entries.length === 1 ? "item" : "itens"}</span>
        </header>
        <div class="catalog-group-items">
          ${entries.map(({ item, index }) => renderProductCard(item, index)).join("")}
        </div>
      </section>`;
    })
    .join("");

  $$('[data-product-name]').forEach((input) =>
    input.addEventListener("input", () => {
      const index = Number(input.dataset.productName);
      ownerData.catalog[index].name = input.value;
      const summaryName = input
        .closest(".product-card")
        ?.querySelector(".product-summary-copy strong");
      if (summaryName) summaryName.textContent = input.value || "Item sem nome";
      markProductChanged(index);
    }),
  );
  $$('[data-product-price]').forEach((input) =>
    input.addEventListener("change", () => {
      const parsed = parsePrice(input.value);
      if (parsed === undefined) {
        input.setCustomValidity("Informe um preço válido em reais.");
        input.reportValidity();
        return;
      }
      input.setCustomValidity("");
      const index = Number(input.dataset.productPrice);
      ownerData.catalog[index].priceCents = parsed;
      input.value = formatPrice(parsed);
      const summaryPrice = input
        .closest(".product-card")
        ?.querySelector(".product-summary-copy small");
      if (summaryPrice) {
        summaryPrice.textContent = parsed === null ? "Preço pendente" : `R$ ${formatPrice(parsed)}`;
      }
      markProductChanged(index);
    }),
  );
  $$('[data-product-description]').forEach((input) =>
    input.addEventListener("input", () => {
      const index = Number(input.dataset.productDescription);
      ownerData.catalog[index].description = input.value;
      markProductChanged(index);
    }),
  );
  $$('[data-product-ingredients]').forEach((input) =>
    input.addEventListener("input", () => {
      const index = Number(input.dataset.productIngredients);
      ownerData.catalog[index].ingredients = input.value;
      markProductChanged(index);
    }),
  );
  $$('[data-product-photo-preview]').forEach((image) =>
    image.addEventListener("error", () => {
      if (image.src.endsWith(image.dataset.fallback)) return;
      image.src = image.dataset.fallback;
      image.classList.add("is-fallback");
    }),
  );
  $$('[data-product-photo-trigger]').forEach((button) =>
    button.addEventListener("click", () => {
      const input = $(`[data-product-photo-input="${button.dataset.productPhotoTrigger}"]`);
      input?.click();
    }),
  );
  $$('[data-product-photo-input]').forEach((input) =>
    input.addEventListener("change", async () => {
      const index = Number(input.dataset.productPhotoInput);
      const button = $(`[data-product-photo-trigger="${index}"]`);
      const file = input.files?.[0];
      if (file && button) await uploadProductPhoto(index, file, button);
      input.value = "";
    }),
  );
  $$('[data-product-photo-remove]').forEach((button) =>
    button.addEventListener("click", () =>
      removeProductPhoto(Number(button.dataset.productPhotoRemove), button),
    ),
  );
  $$('[data-product-active]').forEach((input) =>
    input.addEventListener("change", () => {
      const index = Number(input.dataset.productActive);
      ownerData.catalog[index].active = input.checked;
      const status = input.closest(".product-card")?.querySelector(".product-status");
      if (status) {
        status.textContent = input.checked ? "Ativo" : "Inativo";
        status.className = `product-status ${input.checked ? "active" : "inactive"}`;
      }
      markProductChanged(index);
    }),
  );
  $$('[data-product-save]').forEach((button) =>
    button.addEventListener("click", () =>
      saveProduct(Number(button.dataset.productSave), button),
    ),
  );
  $$('[data-product-remove]').forEach((button) =>
    button.addEventListener("click", () => {
      const index = Number(button.dataset.productRemove);
      const item = ownerData.catalog[index];
      const itemName = item?.name || "este item";
      if (item?.active) {
        const wantDeactivate = confirm(
          `💡 DICA DE SEGURANÇA:\nEm vez de excluir permanentemente “${itemName}”, você prefere apenas DESATIVAR (ocultar) do cardápio público?\n\n• Clique em OK para apenas DESATIVAR (mais seguro e mantém os dados).\n• Clique em Cancelar se deseja EXCLUIR definitivamente.`,
        );
        if (wantDeactivate) {
          item.active = false;
          renderCatalog();
          markProductChanged(index);
          return;
        }
      }
      if (!confirm(`⚠️ ATENÇÃO: Deseja realmente excluir “${itemName}” do cardápio?`)) return;
      if (!confirm(`⚠️ CONFIRMAÇÃO FINAL: Tem certeza absoluta? Todos os dados de “${itemName}” serão removidos.`)) return;
      ownerData.catalog.splice(index, 1);
      renderCatalog();
      markChanged({ rerenderSummary: false });
    }),
  );
};

$("#addProductButton").addEventListener("click", () => {
  if (ownerData.catalog.length >= 30) {
    setSaveState("O cardápio chegou ao limite de 30 itens.", "error");
    return;
  }
  ownerData.catalog.push({
    id: createProductId(),
    name: "",
    priceCents: null,
    description: "",
    ingredients: "",
    photoUrl: "",
    photoAssetVersion: null,
    active: true,
  });
  renderCatalog();
  markChanged({ rerenderSummary: false });
});

const renderReputation = () => {
  const candidate = reference.reviewBaseline || {};
  const baseline = {
    rating: Number.isFinite(Number(candidate.rating)) ? Number(candidate.rating) : 4.7,
    reviewCount: Number.isInteger(candidate.reviewCount) ? candidate.reviewCount : 19,
    observedResponseCount: Number.isInteger(candidate.observedResponseCount)
      ? candidate.observedResponseCount
      : 0,
  };
  $("#baselineRating").textContent = baseline.rating.toFixed(2).replace(".", ",");
  $("#baselineReviews").textContent = String(baseline.reviewCount);
  $("#baselineResponses").textContent = String(baseline.observedResponseCount);
  $("#reviewLink").href = safeReviewUrl();
};

$("#copyReviewButton").addEventListener("click", async () => {
  const url = safeReviewUrl();
  try {
    await navigator.clipboard.writeText(url);
    $("#copyReviewMessage").textContent = "Link copiado. Peça uma avaliação honesta, sem sugerir nota.";
  } catch {
    $("#copyReviewMessage").textContent = "Não foi possível copiar. Use o botão “Abrir link”.";
  }
});

const renderCheckpoints = () => {
  $("#checkpoints").innerHTML = ownerData.seo.checkpoints.map((checkpoint, index) => `<article class="checkpoint-card">
    <h3>Dia ${checkpoint.day}</h3>
    <label>Estado
      <select data-checkpoint-status="${index}">
        ${Object.entries(STATUS_LABELS).map(([value, label]) => `<option value="${value}" ${checkpoint.status === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
    </label>
    <label>Data
      <input data-checkpoint-date="${index}" type="date" value="${escapeHtml(checkpoint.date || "")}">
    </label>
    <label>Evidência observada
      <textarea data-checkpoint-evidence="${index}" maxlength="1500" placeholder="Sem métricas inventadas">${escapeHtml(checkpoint.evidence)}</textarea>
    </label>
  </article>`).join("");

  $$('[data-checkpoint-status]').forEach((input) =>
    input.addEventListener("change", () => {
      const checkpoint = ownerData.seo.checkpoints[Number(input.dataset.checkpointStatus)];
      checkpoint.status = input.value;
      if (checkpoint.status === "done" && !checkpoint.date) checkpoint.date = today();
      renderCheckpoints();
      markChanged({ rerenderSummary: false });
    }),
  );
  $$('[data-checkpoint-date]').forEach((input) =>
    input.addEventListener("change", () => {
      ownerData.seo.checkpoints[Number(input.dataset.checkpointDate)].date = input.value || null;
      markChanged({ rerenderSummary: false });
    }),
  );
  $$('[data-checkpoint-evidence]').forEach((input) =>
    input.addEventListener("input", () => {
      ownerData.seo.checkpoints[Number(input.dataset.checkpointEvidence)].evidence = input.value;
      markChanged({ rerenderSummary: false });
    }),
  );
};

const renderAll = () => {
  setLastUpdate(remoteUpdatedAt);
  renderTasks();
  renderService();
  renderHours();
  renderCatalog();
  renderReputation();
  renderCheckpoints();
  renderSummary();
};

$("#saveNowButton").addEventListener("click", syncRemote);
$("#saveStripButton").addEventListener("click", syncRemote);
$("#refreshMetricsButton").addEventListener("click", loadMetrics);
$("#reloadRemoteButton").addEventListener("click", () => loadPanel({ allowCache: false }));
$("#logoutButton").addEventListener("click", logout);
$("#deniedLogoutButton").addEventListener("click", logout);
window.addEventListener("online", () => dirty && !conflict && syncRemote());
window.addEventListener("beforeunload", (event) => {
  if (!dirty || conflict) return;
  event.preventDefault();
  event.returnValue = "";
});

if (authFlow) configureAuthFlow();
else checkSession();
