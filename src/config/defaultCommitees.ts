import { CommitteePermission } from "@prisma/client";

/**
 * Default Committees
 * ------------------
 * These committees are automatically created when the
 * application is seeded for the first time.
 *
 * This file is also reusable when creating new events.
 */

export const DEFAULT_COMMITTEES = [
  {
    name: "Accommodation",
    description: "Manages hostel allocation and accommodation.",
    permissions: [
      CommitteePermission.ALLOCATE_ACCOMMODATION,
      CommitteePermission.MOVE_ACCOMMODATION,
    ],
  },

  {
    name: "Welfare",
    description: "Handles welfare of delegates.",
    permissions: [],
  },

  {
    name: "Feeding",
    description: "Coordinates feeding and refreshments.",
    permissions: [],
  },

  {
    name: "Medical",
    description: "Handles medical emergencies and first aid.",
    permissions: [],
  },

  {
    name: "Security",
    description: "Maintains security during the event.",
    permissions: [],
  },

  {
    name: "Transportation",
    description: "Coordinates transportation and logistics.",
    permissions: [],
  },

  {
    name: "Finance",
    description: "Manages finances, budgets and expenditures.",
    permissions: [
      CommitteePermission.VERIFY_PAYMENT,
      CommitteePermission.APPROVE_PAYMENT,
    ],
  },

  {
    name: "Registration",
    description: "Handles delegate registration and check-in.",
    permissions: [
      CommitteePermission.REGISTER_DELEGATE,
      CommitteePermission.EDIT_DELEGATE,
      CommitteePermission.SCAN_DELEGATE,
      CommitteePermission.CHECKIN_DELEGATE,
    ],
  },

  {
    name: "ICT",
    description: "Manages the event management system and technical support.",
    permissions: [
      CommitteePermission.VIEW_REPORTS,
    ],
  },

  {
    name: "Media",
    description: "Handles photography, videography and publicity.",
    permissions: [],
  },

  {
    name: "Protocol",
    description: "Coordinates guests, clergy and official activities.",
    permissions: [],
  },

  {
    name: "Liturgy",
    description: "Coordinates liturgical celebrations.",
    permissions: [],
  },
];