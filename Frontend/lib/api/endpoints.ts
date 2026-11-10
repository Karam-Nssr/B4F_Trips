type ResourceEndpoints = {
  collection: string;
  item: (id: string) => string;
};

const createResourceEndpoints = (path: string): ResourceEndpoints => ({
  collection: path,
  item: (id) => `${path}/${encodeURIComponent(id)}`,
});

const trips = createResourceEndpoints("/trips");
const schedules = createResourceEndpoints("/trips/schedules");
const buses = createResourceEndpoints("/buses");
const reservations = createResourceEndpoints("/reservations");
const users = createResourceEndpoints("/users");

export const apiEndpoints = {
  auth: {
    login: "/auth/login",
    me: "/auth/me",
  },
  buses: {
    ...buses,
    seats: (id: string) => `${buses.item(id)}/seats`,
    deactivate: (id: string) => `${buses.item(id)}/deactivate`,
  },
  reservations: {
    ...reservations,
    cancel: (id: string) => `${reservations.item(id)}/cancel`,
  },
  schedules,
  trips: {
    ...trips,
    cancel: (id: string) => `${trips.item(id)}/cancel`,
    seats: (id: string) => `${trips.item(id)}/seats`,
  },
  users,
} as const;
