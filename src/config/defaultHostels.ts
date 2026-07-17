import { Gender } from "@prisma/client";

export const DEFAULT_HOSTELS = [
  {
    code: "SCH",
    hostelName: "St. Catherine's Hostel",
    gender: Gender.FEMALE,

    halls: [
      {
        hallName: "Hall A",
        totalBeds: 100,
      },
      {
        hallName: "Hall B",
        totalBeds: 100,
      },
    ],
  },

  {
    code: "STH",
    hostelName: "St. Theresa's Hostel",
    gender: Gender.MALE,

    halls: [
      {
        hallName: "Hall A",
        totalBeds: 100,
      },
      {
        hallName: "Hall B",
        totalBeds: 100,
      },
    ],
  },
] as const;