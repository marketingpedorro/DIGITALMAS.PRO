import { validateOwnerData } from "./kixiki-owner-model.mjs";

const hasText = (value) => typeof value === "string" && value.length > 0;

const projectHours = (hours) =>
  hours.flatMap((entry) => {
    if (entry.closed) return [{ day: entry.id, open: false }];
    if (!hasText(entry.opens) || !hasText(entry.closes)) return [];
    return [{ day: entry.id, open: true, opens: entry.opens, closes: entry.closes }];
  });

const projectProducts = (catalog) =>
  catalog
    .filter((item) => item.active && hasText(item.name))
    .map((item) => ({
      id: item.id,
      name: item.name,
      active: true,
      ...(item.priceCents === null ? {} : { priceCents: item.priceCents }),
      ...(hasText(item.description) ? { description: item.description } : {}),
      ...(hasText(item.ingredients) ? { ingredients: item.ingredients } : {}),
      ...(hasText(item.photoUrl) ? { photoUrl: item.photoUrl } : {}),
    }));

const projectOperation = (service) => {
  if (!service.confirmedAt) return {};

  const operation = {};
  if (service.deliveryStatus === "no") {
    operation.delivery = { enabled: false };
  } else if (service.deliveryStatus === "yes") {
    operation.delivery = {
      enabled: true,
      ...(hasText(service.serviceArea) ? { area: service.serviceArea } : {}),
      ...(hasText(service.deliveryHours) ? { hours: service.deliveryHours } : {}),
    };
  }

  if (service.pickupStatus === "no") {
    operation.pickup = { enabled: false };
  } else if (service.pickupStatus === "yes") {
    operation.pickup = {
      enabled: true,
      ...(hasText(service.pickupHours) ? { hours: service.pickupHours } : {}),
    };
  }

  return operation;
};

export const createEmptyPublicProjection = () => ({
  hours: [],
  operation: {},
});

export const createKixikiPublicProjection = (ownerData) => {
  const validated = validateOwnerData(ownerData);
  if (!validated.ok) return validated;

  return {
    ok: true,
    data: {
      hours: projectHours(validated.data.hours),
      products: projectProducts(validated.data.catalog),
      operation: projectOperation(validated.data.service),
    },
  };
};
