/**
 * ==========================================================
 * REPORTS SERVICE
 * ----------------------------------------------------------
 * Handles:
 * - Executive Dashboard
 * - Delegate Reports
 * - Finance Reports
 * - Accommodation Reports
 * - Committee Reports
 * - Parish Reports
 * ==========================================================
 */

import prisma from "../../config/prisma";
import { getActiveEvent } from "../events/event.service";


export async function getExecutiveDashboard() {
  const event = await getActiveEvent();

  const [
    registeredDelegates,
    checkedInDelegates,
    totalBeds,
    occupiedBeds,
    totalBudget,
    totalReleased,
    totalExpenses,
    arrivedParishes,
    totalParishes,
    totalCommittees,
    totalCommitteeMembers,
  ] = await Promise.all([
    prisma.delegate.count({
      where: {
        eventId: event.id,
      },
    }),

    prisma.delegate.count({
      where: {
        eventId: event.id,
        checkedInAt: {
          not: null,
        },
      },
    }),

    prisma.bed.count({
      where: {
        hall: {
          hostel: {
            eventId: event.id,
          },
        },
      },
    }),

    prisma.bed.count({
      where: {
        isOccupied: true,
        hall: {
          hostel: {
            eventId: event.id,
          },
        },
      },
    }),

    prisma.budget.aggregate({
      where: {
        eventId: event.id,
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.fundRelease.aggregate({
      where: {
        eventId: event.id,
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.expense.aggregate({
      where: {
        eventId: event.id,
      },
      _sum: {
        amount: true,
      },
    }),

    prisma.parishArrival.count({
      where: {
        eventId: event.id,
      },
    }),

    prisma.parishAccount.count({
      where: {
        eventId: event.id,
      },
    }),

    prisma.committee.count({
      where: {
        eventId: event.id,
      },
    }),

    prisma.committeeMember.count(),
  ]);

  const totalBudgetAmount = Number(totalBudget._sum.amount ?? 0);
  const totalReleasedAmount = Number(totalReleased._sum.amount ?? 0);
  const totalExpenseAmount = Number(totalExpenses._sum.amount ?? 0);

  return {
    success: true,
    data: {
      event: {
        id: event.id,
        name: event.eventName,
        year: event.year,
      },

      delegates: {
        registered: registeredDelegates,
        checkedIn: checkedInDelegates,
        notCheckedIn:
          registeredDelegates - checkedInDelegates,
      },

      accommodation: {
        beds: totalBeds,
        occupied: occupiedBeds,
        available: totalBeds - occupiedBeds,
      },

      finance: {
        budget: totalBudgetAmount,
        released: totalReleasedAmount,
        expenses: totalExpenseAmount,
        balance:
          totalReleasedAmount - totalExpenseAmount,
      },

      parishes: {
        registered: totalParishes,
        arrived: arrivedParishes,
      },

      committees: {
        total: totalCommittees,
        members: totalCommitteeMembers,
      },
    },
  };
}

export async function getDelegateReport() {
    const event = await getActiveEvent();

const [
    delegates,
    registered,
    checkedIn,
    male,
    female,
] = await Promise.all([
    prisma.delegate.findMany({
    where: {
        eventId: event.id,
    },

    include: {
        parish: true,

        accommodation: {
            include: {
                bed: {
                    include: {
                        hall: {
                            include: {
                                hostel: true,
                            },
                        },
                    },
                },
            },
        },
    },

    orderBy: {
        delegateNumber: "asc",
    },
}),

prisma.delegate.count({
    where: {
        eventId: event.id,
    },
}),

prisma.delegate.count({
    where: {
        eventId: event.id,

        checkedInAt: {
            not: null,
        },
    },
}),

prisma.delegate.count({
    where: {
        eventId: event.id,

        gender: "MALE",
    },
}),

prisma.delegate.count({
    where: {
        eventId: event.id,

        gender: "FEMALE",
    },
}),

]);

return {
    success: true,

    data: {
        summary: {
            registered,
            checkedIn,
            notCheckedIn:
                registered - checkedIn,
            male,
            female,
        },

        delegates,
    },
};

};

export async function exportDelegatesCSV() {
    const report = await getDelegateReport();

    const rows = report.data.delegates.map((delegate) => ({
  DelegateNumber: delegate.delegateNumber,

  FullName: delegate.fullName,

  Gender: delegate.gender,

  Parish:
    delegate.parish.parishName,

  PhoneNumber:
    delegate.phoneNumber,

  CheckedIn:
    delegate.checkedInAt
      ? "YES"
      : "NO",

  Hostel:
    delegate.accommodation?.bed?.hall?.hostel
      ?.hostelName ?? "",

  Hall:
    delegate.accommodation?.bed?.hall
      ?.hallName ?? "",

  Bed:
    delegate.accommodation?.bed
      ?.bedNumber ?? "",
}));

return rows;
}


export async function getAccommodationReport() {
  const event = await getActiveEvent();
  const [
  totalHostels,
  totalHalls,
  totalBeds,
  occupiedBeds,
  hostels,
] = await Promise.all([
prisma.hostel.count({
  where: {
    eventId: event.id,
  },
}),

prisma.hall.count({
  where: {
    hostel: {
      eventId: event.id,
    },
  },
}),

prisma.bed.count({
  where: {
    hall: {
      hostel: {
        eventId: event.id,
      },
    },
  },
}),

prisma.bed.count({
  where: {
    isOccupied: true,

    hall: {
      hostel: {
        eventId: event.id,
      },
    },
  },
}),

prisma.hostel.findMany({
  where: {
    eventId: event.id,
  },

  include: {
    halls: {
      include: {
        beds: true,
      },
    },
  },

  orderBy: {
    hostelName: "asc",
  },
}),

]);

const hostelSummary = hostels.map((hostel) => {
  const beds = hostel.halls.reduce(
  (sum, hall) => sum + hall.beds.length,
  0
);

const occupied = hostel.halls.reduce(
  (sum, hall) =>
    sum +
    hall.beds.filter((bed) => bed.isOccupied)
      .length,
  0
);

const available = beds - occupied;

const occupancyRate =
  beds === 0
    ? 0
    : Number(
        ((occupied / beds) * 100).toFixed(2)
      );

      return {
  hostelId: hostel.id,

  hostelName: hostel.hostelName,

  gender: hostel.gender,

  halls: hostel.halls.length,

  capacity: beds,

  occupied,

  available,

  occupancyRate,
};

});

const availableBeds =
  totalBeds - occupiedBeds;

const occupancyRate =
  totalBeds === 0
    ? 0
    : Number(
        (
          (occupiedBeds / totalBeds) *
          100
        ).toFixed(2)
      );

      return {
  success: true,

  data: {
    summary: {
      hostels: totalHostels,

      halls: totalHalls,

      beds: totalBeds,

      occupied: occupiedBeds,

      available: availableBeds,

      occupancyRate,
    },

    hostels: hostelSummary,
  },
};
};

export async function exportAccommodationCSV() {
  const report = await getAccommodationReport();

  return report.data.hostels.map((hostel) => ({
    Hostel: hostel.hostelName,
    Gender: hostel.gender,
    Halls: hostel.halls,
    Capacity: hostel.capacity,
    Occupied: hostel.occupied,
    Available: hostel.available,
    OccupancyRate: `${hostel.occupancyRate}%`,
  }));
}

export async function getFinanceReport() {
  const event = await getActiveEvent();

  const committees = await prisma.committee.findMany({
  where: {
    eventId: event.id,
  },

  include: {
    budgets: true,

    fundReleases: true,

    expenses: true,
  },

  orderBy: {
    committeeName: "asc",
  },
});

const committeeReports = committees.map((committee) => {
  const budget = committee.budgets.reduce(
  (sum, item) => sum + Number(item.amount),
  0
);
const released = committee.fundReleases.reduce(
  (sum, item) => sum + Number(item.amount),
  0
);
const expenses = committee.expenses.reduce(
  (sum, item) => sum + Number(item.amount),
  0
);
const remainingBudget =
  budget - expenses;

  const availableCash =
  released - expenses;

  const deficit =
  remainingBudget < 0
    ? Math.abs(remainingBudget)
    : 0;

    return {
  committeeId: committee.id,

  committeeName: committee.committeeName,

  budget,

  released,

  expenses,

  remainingBudget,

  availableCash,

  deficit,
};
});

const summary = committeeReports.reduce(
  (totals, committee) => {
    totals.budget += committee.budget;
    totals.released += committee.released;
    totals.expenses += committee.expenses;
    totals.remainingBudget += committee.remainingBudget;
    totals.availableCash += committee.availableCash;
    totals.deficit += committee.deficit;

    return totals;
  },
  {
    budget: 0,
    released: 0,
    expenses: 0,
    remainingBudget: 0,
    availableCash: 0,
    deficit: 0,
  }
);

return {
  success: true,

  data: {
    summary,

    committees: committeeReports,
  },
};
};

export async function exportFinanceCSV() {
  const report = await getFinanceReport();

  return report.data.committees.map((committee) => ({
    Committee: committee.committeeName,
    Budget: committee.budget,
    Released: committee.released,
    Expenses: committee.expenses,
    AvailableCash: committee.availableCash,
    RemainingBudget: committee.remainingBudget,
    Deficit: committee.deficit,
  }));
}

export async function getParishReport() {
  const participatingParishes = await prisma.parish.findMany({
    include: {
      deanery: true,
      delegates: true,
      arrivals: true,
    },
    orderBy: {
      parishName: "asc",
    },
  });

  const report = participatingParishes.map((parish) => {
    const totalDelegates = parish.delegates.length;

    const checkedIn = parish.delegates.filter(
      (delegate) => delegate.isCheckedIn
    ).length;

    const outstanding = totalDelegates - checkedIn;

    const arrived = parish.arrivals.some(
      (arrival) => arrival.arrived
    );

    // One badge per delegate
    const badgeCount = totalDelegates;

    return {
      parishId: parish.id,
      parishName: parish.parishName,
      deanery: parish.deanery.name,
      totalDelegates,
      checkedIn,
      outstanding,
      badgeCount,
      arrived,
    };
  });

  return {
    summary: {
      totalParishes: report.length,
      totalDelegates: report.reduce(
        (sum, parish) => sum + parish.totalDelegates,
        0
      ),
      checkedInDelegates: report.reduce(
        (sum, parish) => sum + parish.checkedIn,
        0
      ),
      outstandingDelegates: report.reduce(
        (sum, parish) => sum + parish.outstanding,
        0
      ),
      totalBadges: report.reduce(
        (sum, parish) => sum + parish.badgeCount,
        0
      ),
      arrivedParishes: report.filter(
        (parish) => parish.arrived
      ).length,
    },
    parishes: report,
  };
}


export async function exportParishCSV() {
  const report = await getParishReport();

  return report.parishes.map((parish) => ({
    Parish: parish.parishName,
    Deanery: parish.deanery,
    Delegates: parish.totalDelegates,
    CheckedIn: parish.checkedIn,
    Outstanding: parish.outstanding,
    Badges: parish.badgeCount,
    Arrived: parish.arrived ? "YES" : "NO",
  }));
}