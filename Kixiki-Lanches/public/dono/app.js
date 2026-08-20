const API = {
  auth: "/api/auth",
  owner: "/api/kixiki-owner",
};

const TASK_COPY = [
  {
    id: "service-truth",
    letter: "A",
    title: "Entrega e área de atendimento",
    tip: "Confirme delivery, cobertura, horários e retirada. A página pública não muda automaticamente.",
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
  const element = $("#saveState");
  element.textContent = message;
  element.className = `save-state ${tone}`.trim();
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
  if (!currentUser || !ownerData || conflict) return;
  const incomplete = pendingCompletionMessage();
  if (incomplete) {
    setSaveState(incomplete, "error");
    return;
  }
  if (syncing) {
    syncQueued = true;
    return;
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
      return;
    }
    if (response.status === 401) {
      showLogin("Sua sessão terminou. Entre novamente.", "info");
      return;
    }
    if (response.status === 403) {
      showDenied();
      return;
    }
    if (!response.ok) throw new Error(result.error || "Não foi possível salvar.");

    remoteETag = result.etag || remoteETag;
    remoteUpdatedAt = result.updatedAt || remoteUpdatedAt;
    dirty = false;
    saveCache();
    $("#lastUpdate").textContent = formatDateTime(remoteUpdatedAt);
    setSaveState("Sincronizado entre dispositivos", "synced");
  } catch (error) {
    setSaveState(
      error?.message && error.message !== "Failed to fetch"
        ? error.message
        : "Sem conexão · alterações só neste aparelho",
      "error",
    );
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
    dirty = false;
    saveCache();
    showApp();
    renderAll();
    setSaveState("Sincronizado entre dispositivos", "synced");
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

const renderCatalog = () => {
  $("#emptyCatalog").hidden = ownerData.catalog.length !== 0;
  $("#catalogList").innerHTML = ownerData.catalog.map((item, index) => `<article class="product-card">
    <div class="product-head">
      <strong>${escapeHtml(item.name || `Item ${index + 1}`)}</strong>
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
      <label class="wide">URL HTTPS da foto real
        <input data-product-photo="${index}" type="url" maxlength="500" value="${escapeHtml(item.photoUrl)}" placeholder="https://…">
      </label>
    </div>
    <div class="product-actions"><button class="remove-button" data-product-remove="${index}" type="button">Remover item</button></div>
  </article>`).join("");

  $$('[data-product-name]').forEach((input) =>
    input.addEventListener("input", () => {
      ownerData.catalog[Number(input.dataset.productName)].name = input.value;
      markChanged({ rerenderSummary: false });
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
      ownerData.catalog[Number(input.dataset.productPrice)].priceCents = parsed;
      input.value = formatPrice(parsed);
      markChanged({ rerenderSummary: false });
    }),
  );
  $$('[data-product-description]').forEach((input) =>
    input.addEventListener("input", () => {
      ownerData.catalog[Number(input.dataset.productDescription)].description = input.value;
      markChanged({ rerenderSummary: false });
    }),
  );
  $$('[data-product-ingredients]').forEach((input) =>
    input.addEventListener("input", () => {
      ownerData.catalog[Number(input.dataset.productIngredients)].ingredients = input.value;
      markChanged({ rerenderSummary: false });
    }),
  );
  $$('[data-product-photo]').forEach((input) =>
    input.addEventListener("change", () => {
      ownerData.catalog[Number(input.dataset.productPhoto)].photoUrl = input.value;
      markChanged({ rerenderSummary: false });
    }),
  );
  $$('[data-product-active]').forEach((input) =>
    input.addEventListener("change", () => {
      ownerData.catalog[Number(input.dataset.productActive)].active = input.checked;
      markChanged({ rerenderSummary: false });
    }),
  );
  $$('[data-product-remove]').forEach((button) =>
    button.addEventListener("click", () => {
      const index = Number(button.dataset.productRemove);
      if (!confirm(`Remover “${ownerData.catalog[index].name || "este item"}” do painel?`)) return;
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
  $("#lastUpdate").textContent = formatDateTime(remoteUpdatedAt);
  renderTasks();
  renderService();
  renderHours();
  renderCatalog();
  renderReputation();
  renderCheckpoints();
  renderSummary();
};

$("#saveNowButton").addEventListener("click", syncRemote);
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
