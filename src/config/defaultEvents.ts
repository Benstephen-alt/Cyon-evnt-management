/**
 * Default Event Configuration
 * ---------------------------
 * This event is automatically created when the
 * application is seeded for the first time.
 *
 * Future events will be created from the Admin Panel.
 */

export const DEFAULT_EVENT = {
  name: "2026 Youth Weekend with Bishop",

  theme: "Pilgrims of Hope",

  year: 2026,

  registrationFee: 0,

  startDate: new Date("2026-08-14T08:00:00"),

  endDate: new Date("2026-08-16T18:00:00"),

  registrationOpen: true,

  isActive: true,
} as const;