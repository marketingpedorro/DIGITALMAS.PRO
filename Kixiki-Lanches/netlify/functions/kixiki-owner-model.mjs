export const OWNER_SCHEMA = "digitalmas-c001-kixiki-owner-v1";
export const OWNER_PROJECT_ID = "C001";

export const OWNER_REFERENCE = Object.freeze({
  reviewBaseline: Object.freeze({
    rating: 4.7,
    reviewCount: 19,
    observedResponseCount: 0,
    source: "Review Audit Result",
  }),
  reviewRequestUrl:
    "https://search.google.com/local/writereview?placeid=ChIJUz9IOKpHJ5URu176vuPvi7w",
});

const DAY_IDS = [
  "segunda",
  "terca",
  "quarta",
  "quinta",
  "sexta",
  "sabado",
  "domingo",
];

const TASK_IDS = ["service-truth", "operational-data", "google-reputation"];
const CHECKPOINT_DAYS = [0, 14, 30, 60, 90];
const STATUS = new Set(["pending", "done", "na"]);
const YES_NO_UNKNOWN = new Set(["unknown", "yes", "no"]);
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^[a-z0-9][a-z0-9-]{0,79}$/;

class OwnerDataValidationError extends Error {}

const fail = (message) => {
  throw new OwnerDataValidationError(message);
};

const object = (value, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} deve ser um objeto.`);
  }
  return value;
};

const onlyKeys = (value, allowed, label) => {
  const extra = Object.keys(value).find((key) => !allowed.includes(key));
  if (extra) fail(`${label} contém o campo não permitido “${extra}”.`);
};

const string = (value, label, max, { allowEmpty = true } = {}) => {
  if (typeof value !== "string") fail(`${label} deve ser texto.`);
  const normalized = value.trim();
  if (!allowEmpty && !normalized) fail(`${label} é obrigatório.`);
  if (normalized.length > max) fail(`${label} excede ${max} caracteres.`);
  return normalized;
};

const boolean = (value, label) => {
  if (typeof value !== "boolean") fail(`${label} deve ser verdadeiro ou falso.`);
  return value;
};

const nullableDateTime = (value, label) => {
  if (value === null) return null;
  const normalized = string(value, label, 40, { allowEmpty: false });
  if (!Number.isFinite(Date.parse(normalized))) fail(`${label} não é uma data válida.`);
  return new Date(normalized).toISOString();
};

const nullableDate = (value, label) => {
  if (value === null) return null;
  const normalized = string(value, label, 10, { allowEmpty: false });
  const parsed = new Date(`${normalized}T00:00:00Z`);
  if (
    !DATE_PATTERN.test(normalized) ||
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== normalized
  ) {
    fail(`${label} não é uma data válida.`);
  }
  return normalized;
};

const enumValue = (value, allowed, label) => {
  if (typeof value !== "string" || !allowed.has(value)) {
    fail(`${label} possui um valor inválido.`);
  }
  return value;
};

const defaultHours = () =>
  DAY_IDS.map((id) => ({ id, closed: false, opens: "", closes: "" }));

const defaultTasks = () =>
  TASK_IDS.map((id) => ({ id, status: "pending", date: null, evidence: "" }));

const defaultCheckpoints = () =>
  CHECKPOINT_DAYS.map((day) => ({ day, status: "pending", date: null, evidence: "" }));

export const createDefaultOwnerData = () => ({
  schema: OWNER_SCHEMA,
  projectId: OWNER_PROJECT_ID,
  service: {
    deliveryStatus: "unknown",
    serviceArea: "",
    deliveryHours: "",
    pickupStatus: "unknown",
    pickupHours: "",
    notes: "",
    confirmedAt: null,
    evidence: "",
  },
  hours: defaultHours(),
  catalog: [
    {
      id: "xis-gaucho",
      name: "Xis Gaúcho",
      priceCents: null,
      description: "",
      ingredients: "",
      photoUrl: "",
      active: true,
    },
    {
      id: "marmita-caseira",
      name: "Marmita caseira",
      priceCents: null,
      description: "",
      ingredients: "",
      photoUrl: "",
      active: true,
    },
  ],
  seo: {
    tasks: defaultTasks(),
    checkpoints: defaultCheckpoints(),
  },
});

const sanitizeService = (input) => {
  const value = object(input, "Entrega e retirada");
  onlyKeys(
    value,
    [
      "deliveryStatus",
      "serviceArea",
      "deliveryHours",
      "pickupStatus",
      "pickupHours",
      "notes",
      "confirmedAt",
      "evidence",
    ],
    "Entrega e retirada",
  );

  return {
    deliveryStatus: enumValue(value.deliveryStatus, YES_NO_UNKNOWN, "Delivery"),
    serviceArea: string(value.serviceArea, "Área de entrega", 300),
    deliveryHours: string(value.deliveryHours, "Horário de delivery", 200),
    pickupStatus: enumValue(value.pickupStatus, YES_NO_UNKNOWN, "Retirada"),
    pickupHours: string(value.pickupHours, "Horário de retirada", 200),
    notes: string(value.notes, "Observações operacionais", 800),
    confirmedAt: nullableDateTime(value.confirmedAt, "Data de confirmação"),
    evidence: string(value.evidence, "Evidência de entrega", 1_000),
  };
};

const sanitizeHours = (input) => {
  if (!Array.isArray(input) || input.length !== DAY_IDS.length) {
    fail("Os horários devem conter exatamente os sete dias da semana.");
  }

  return input.map((entry, index) => {
    const value = object(entry, `Horário ${index + 1}`);
    onlyKeys(value, ["id", "closed", "opens", "closes"], `Horário ${index + 1}`);
    if (value.id !== DAY_IDS[index]) fail("A ordem dos dias da semana é inválida.");
    const closed = boolean(value.closed, `Fechado em ${value.id}`);
    const opens = string(value.opens, `Abertura de ${value.id}`, 5);
    const closes = string(value.closes, `Fechamento de ${value.id}`, 5);

    if (closed) return { id: value.id, closed: true, opens: "", closes: "" };
    if ((opens && !TIME_PATTERN.test(opens)) || (closes && !TIME_PATTERN.test(closes))) {
      fail(`O horário de ${value.id} deve usar o formato HH:MM.`);
    }
    if (Boolean(opens) !== Boolean(closes)) {
      fail(`Informe abertura e fechamento de ${value.id}.`);
    }
    return { id: value.id, closed: false, opens, closes };
  });
};

const sanitizeCatalog = (input) => {
  if (!Array.isArray(input) || input.length > 30) {
    fail("O cardápio pode conter no máximo 30 itens.");
  }

  const seenIds = new Set();
  return input.map((entry, index) => {
    const value = object(entry, `Item ${index + 1}`);
    onlyKeys(
      value,
      ["id", "name", "priceCents", "description", "ingredients", "photoUrl", "active"],
      `Item ${index + 1}`,
    );
    const id = string(value.id, `Código do item ${index + 1}`, 80, { allowEmpty: false });
    if (!ID_PATTERN.test(id) || seenIds.has(id)) fail(`O código “${id}” é inválido ou repetido.`);
    seenIds.add(id);

    let priceCents = null;
    if (value.priceCents !== null) {
      if (!Number.isInteger(value.priceCents) || value.priceCents < 0 || value.priceCents > 10_000_000) {
        fail(`O preço do item ${index + 1} é inválido.`);
      }
      priceCents = value.priceCents;
    }

    const photoUrl = string(value.photoUrl, `Foto do item ${index + 1}`, 500);
    if (photoUrl) {
      try {
        const parsed = new URL(photoUrl);
        if (parsed.protocol !== "https:") fail(`A foto do item ${index + 1} deve usar HTTPS.`);
      } catch (error) {
        if (error instanceof OwnerDataValidationError) throw error;
        fail(`A foto do item ${index + 1} deve ser uma URL válida.`);
      }
    }

    return {
      id,
      name: string(value.name, `Nome do item ${index + 1}`, 80),
      priceCents,
      description: string(value.description, `Descrição do item ${index + 1}`, 500),
      ingredients: string(value.ingredients, `Ingredientes do item ${index + 1}`, 500),
      photoUrl,
      active: boolean(value.active, `Estado do item ${index + 1}`),
    };
  });
};

const sanitizeTasks = (input) => {
  if (!Array.isArray(input) || input.length !== TASK_IDS.length) {
    fail("O painel deve conter exatamente três prioridades SEO.");
  }
  return input.map((entry, index) => {
    const value = object(entry, `Prioridade ${index + 1}`);
    onlyKeys(value, ["id", "status", "date", "evidence"], `Prioridade ${index + 1}`);
    if (value.id !== TASK_IDS[index]) fail("As prioridades SEO não podem ser alteradas.");
    const status = enumValue(value.status, STATUS, `Estado da prioridade ${index + 1}`);
    const date = nullableDate(value.date, `Data da prioridade ${index + 1}`);
    const evidence = string(value.evidence, `Evidência da prioridade ${index + 1}`, 1_500);
    if (status === "done" && (!date || !evidence)) {
      fail(`A prioridade ${index + 1} precisa de data e evidência para ser concluída.`);
    }
    return { id: value.id, status, date, evidence };
  });
};

const sanitizeCheckpoints = (input) => {
  if (!Array.isArray(input) || input.length !== CHECKPOINT_DAYS.length) {
    fail("Os checkpoints devem ser Dia 0, 14, 30, 60 e 90.");
  }
  return input.map((entry, index) => {
    const value = object(entry, `Checkpoint ${CHECKPOINT_DAYS[index]}`);
    onlyKeys(value, ["day", "status", "date", "evidence"], `Checkpoint ${CHECKPOINT_DAYS[index]}`);
    if (value.day !== CHECKPOINT_DAYS[index]) fail("A sequência de checkpoints não pode ser alterada.");
    const status = enumValue(value.status, STATUS, `Estado do checkpoint ${value.day}`);
    const date = nullableDate(value.date, `Data do checkpoint ${value.day}`);
    const evidence = string(value.evidence, `Evidência do checkpoint ${value.day}`, 1_500);
    if (status === "done" && (!date || !evidence)) {
      fail(`O checkpoint Dia ${value.day} precisa de data e evidência para ser concluído.`);
    }
    return { day: value.day, status, date, evidence };
  });
};

const validateCompletionRules = (data) => {
  const serviceTask = data.seo.tasks[0];
  if (serviceTask.status === "done") {
    if (!data.service.confirmedAt) {
      fail("Confirme os dados operacionais antes de concluir a prioridade A.");
    }
    if (data.service.deliveryStatus === "unknown" || data.service.pickupStatus === "unknown") {
      fail("Confirme delivery e retirada antes de concluir a prioridade A.");
    }
    if (
      data.service.deliveryStatus === "yes" &&
      (!data.service.serviceArea || !data.service.deliveryHours)
    ) {
      fail("Informe área e horário de delivery antes de concluir a prioridade A.");
    }
    if (data.service.pickupStatus === "yes" && !data.service.pickupHours) {
      fail("Informe o horário de retirada antes de concluir a prioridade A.");
    }
  }

  const dataTask = data.seo.tasks[1];
  if (dataTask.status === "done") {
    const hasCompleteHours = data.hours.every(
      (entry) => entry.closed || Boolean(entry.opens && entry.closes),
    );
    const hasCompleteItem = data.catalog.some(
      (item) =>
        item.active &&
        item.name &&
        item.priceCents !== null &&
        item.description &&
        item.photoUrl,
    );
    if (!hasCompleteHours || !hasCompleteItem) {
      fail(
        "Complete os sete dias e ao menos um item ativo com preço, descrição e foto antes de concluir a prioridade B.",
      );
    }
  }
};

export const validateOwnerData = (input) => {
  try {
    const root = object(input, "Dados do painel");
    onlyKeys(root, ["schema", "projectId", "service", "hours", "catalog", "seo"], "Dados do painel");
    if (root.schema !== OWNER_SCHEMA || root.projectId !== OWNER_PROJECT_ID) {
      fail("O painel não pertence ao projeto C001 Kixiki.");
    }

    const seo = object(root.seo, "SEO Local");
    onlyKeys(seo, ["tasks", "checkpoints"], "SEO Local");
    const data = {
      schema: OWNER_SCHEMA,
      projectId: OWNER_PROJECT_ID,
      service: sanitizeService(root.service),
      hours: sanitizeHours(root.hours),
      catalog: sanitizeCatalog(root.catalog),
      seo: {
        tasks: sanitizeTasks(seo.tasks),
        checkpoints: sanitizeCheckpoints(seo.checkpoints),
      },
    };
    validateCompletionRules(data);
    return { ok: true, data };
  } catch (error) {
    if (error instanceof OwnerDataValidationError) return { ok: false, error: error.message };
    return { ok: false, error: "Os dados do painel são inválidos." };
  }
};
