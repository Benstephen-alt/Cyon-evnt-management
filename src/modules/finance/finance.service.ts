import prisma from "../../config/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import {
  CreateBudgetDto,
  UpdateBudgetDto,
  CreateFundReleaseDto,
  UpdateExpenseDto,
  CreateCommitteeExpenseDto,
} from "./finance.types";

import { getActiveEvent } from "../../shared/services/event.service";
import { ExpenseCategory } from "@prisma/client";


export async function createBudget(
  data: CreateBudgetDto
) {
  const event = await getActiveEvent();

  /*
  |--------------------------------------------------------------------------
  | Finance Committee
  |--------------------------------------------------------------------------
  */

  const financeCommittee =
    await prisma.committee.findFirst({
      where: {
        eventId: event.id,
        committeeName: "Finance",
      },
    });

  if (!financeCommittee) {
    throw new Error(
      "Finance committee not found."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Check Existing Budget
  |--------------------------------------------------------------------------
  */

  const existingBudget =
    await prisma.budget.findUnique({
      where: {
        eventId_committeeId: {
          eventId: event.id,
          committeeId:
            financeCommittee.id,
        },
      },
    });

  if (existingBudget) {
    throw new Error(
      "Budget already exists for this event."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Create Budget
  |--------------------------------------------------------------------------
  */

  const budget =
    await prisma.budget.create({
      data: {
        eventId: event.id,
        committeeId:
          financeCommittee.id,
        amount: new Decimal(
          data.amount
        ),
      },

      include: {
        committee: {
          select: {
            committeeName: true,
          },
        },
      },
    });

  return {
    success: true,
    message:
      "Budget created successfully.",
    data: budget,
  };
}
export async function getBudgets() {
  const event = await getActiveEvent();

  const budgets = await prisma.budget.findMany({
    where: {
      eventId: event.id,
    },
    include: {
      committee: true,
    },
    orderBy: {
      committee: {
        committeeName: "asc",
      },
    },
  });

  return {
    success: true,
    data: budgets,
  };
}

export async function updateBudget(
  data: UpdateBudgetDto
) {
  const event = await getActiveEvent();

  /*
  |--------------------------------------------------------------------------
  | Finance Committee
  |--------------------------------------------------------------------------
  */

  const financeCommittee =
    await prisma.committee.findFirst({
      where: {
        eventId: event.id,
        committeeName: "Finance",
      },
    });

  if (!financeCommittee) {
    throw new Error(
      "Finance committee not found."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Find Budget
  |--------------------------------------------------------------------------
  */

  const budget =
    await prisma.budget.findUnique({
      where: {
        eventId_committeeId: {
          eventId: event.id,
          committeeId:
            financeCommittee.id,
        },
      },
    });

  if (!budget) {
    throw new Error(
      "Budget not found."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Update Budget
  |--------------------------------------------------------------------------
  */

  const updated =
    await prisma.budget.update({
      where: {
        id: budget.id,
      },

      data: {
        amount: new Decimal(
          data.amount
        ),
      },

      include: {
        committee: {
          select: {
            committeeName: true,
          },
        },
      },
    });

  return {
    success: true,
    message:
      "Budget updated successfully.",
    data: updated,
  };
}

export async function deleteBudget(id: string) {
  const budget = await prisma.budget.findUnique({
    where: {
      id,
    },
  });

  if (!budget) {
    throw new Error("Budget not found.");
  }

  await prisma.budget.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Budget deleted successfully.",
  };
}

export async function getFinanceDashboard() {
  const event = await getActiveEvent();

  /*
  |--------------------------------------------------------------------------
  | Finance Committee
  |--------------------------------------------------------------------------
  */

  const financeCommittee =
    await prisma.committee.findFirst({
      where: {
        eventId: event.id,
        committeeName: "Finance",
      },
    });

  if (!financeCommittee) {
    throw new Error(
      "Finance committee not found."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Finance Committee Budget
  |--------------------------------------------------------------------------
  */

  const budget =
    await prisma.budget.findUnique({
      where: {
        eventId_committeeId: {
          eventId: event.id,
          committeeId:
            financeCommittee.id,
        },
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Executive Fund Releases
  |--------------------------------------------------------------------------
  */

  const executiveReleases =
    await prisma.fundRelease.findMany({
      where: {
        eventId: event.id,

        authority: {
          in: [
            "DIOCESAN_PRESIDENT",
            "CHAPLAIN",
            "GENERAL_COMMITTEE_CHAIRMAN",
          ],
        },
      },

      include: {
        releasedBy: {
          include: {
            admin: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },

      orderBy: {
        releasedAt: "desc",
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Expenses
  |--------------------------------------------------------------------------
  */

  const expenses =
    await prisma.expense.aggregate({
      where: {
        eventId: event.id,
      },

      _sum: {
        amount: true,
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Totals
  |--------------------------------------------------------------------------
  */

  const totalBudget = Number(
    budget?.amount ?? 0
  );

  const totalExpenses = Number(
    expenses._sum.amount ?? 0
  );

  /*
  |--------------------------------------------------------------------------
  | Budget Balance
  |--------------------------------------------------------------------------
  */

  const balance =
    totalBudget - totalExpenses;

  const deficit =
    balance < 0
      ? Math.abs(balance)
      : 0;

  return {
    success: true,

    data: {
      totalBudget,

      totalExpenses,

      balance,

      deficit,

      financialStatus:
        balance >= 0
          ? "BALANCE"
          : "DEFICIT",

      budget: budget
        ? {
            id: budget.id,

            amount: Number(
              budget.amount
            ),

            createdAt:
              budget.createdAt,
          }
        : null,

      executiveReleases:
        executiveReleases.map(
          (release) => ({
            id: release.id,

            authority:
              release.authority,

            releasedBy:
              release.releasedBy
                .admin?.fullName ??
              "Unknown",

            recipient:
              release.recipientName,

            purpose:
              release.remarks,

            amount: Number(
              release.amount
            ),

            receiptUrl:
              release.receiptUrl,

            releasedAt:
              release.releasedAt,

            createdAt:
              release.createdAt,
          })
        ),
    },
  };
}
/* ============================================================
   FUND RELEASES
============================================================ */

export async function createFundRelease(
  data: CreateFundReleaseDto,
  userId: string
) {
  const event = await getActiveEvent();

  /*
  |--------------------------------------------------------------------------
  | Validate Committee
  |--------------------------------------------------------------------------
  */

  const committee = await prisma.committee.findFirst({
    where: {
      id: data.committeeId,
      eventId: event.id,
    },
  });

  if (!committee) {
    throw new Error("Committee not found.");
  }

  /*
  |--------------------------------------------------------------------------
  | Validate Committee Member
  |--------------------------------------------------------------------------
  */

  const committeeMember =
    await prisma.committeeMember.findUnique({
      where: {
        id: data.committeeMemberId,
      },

      include: {
        user: {
          include: {
            admin: {
              select: {
                fullName: true,
              },
            },
          },
        },

        assignments: true,
      },
    });

  if (!committeeMember) {
    throw new Error(
      "Committee member not found."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Ensure Member belongs to Selected Committee
  |--------------------------------------------------------------------------
  */

  const assigned =
    committeeMember.assignments.some(
      (assignment) =>
        assignment.committeeId ===
        committee.id
    );

  if (!assigned) {
    throw new Error(
      "Selected member does not belong to this committee."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Create Fund Release
  |--------------------------------------------------------------------------
  */

  const release =
    await prisma.fundRelease.create({
      data: {
        eventId: event.id,

        committeeId: committee.id,

        committeeMemberId:
          committeeMember.id,

        recipientName:
          committeeMember.user.admin
            ?.fullName ??
          "Unknown",

        releasedByUserId: userId,

        authority: data.authority,

        amount: new Decimal(
          data.amount
        ),

        receiptUrl:
          data.receiptUrl,

        remarks:
          data.remarks,
      },

      include: {
        committee: {
          select: {
            committeeName: true,
          },
        },

        committeeMember: {
          include: {
            user: {
              include: {
                admin: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },

        releasedBy: {
          include: {
            admin: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },
    });

  return {
    success: true,
    message:
      "Fund release recorded successfully.",
    data: release,
  };
}

export async function getFundReleases() {
  const event = await getActiveEvent();

  const fundReleases = await prisma.fundRelease.findMany({
    where: {
      eventId: event.id,
    },

    include: {
      committee: {
        select: {
          id: true,
          committeeName: true,
        },
      },

      committeeMember: {
        include: {
          user: {
            include: {
              admin: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      },

      releasedBy: {
        include: {
          admin: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },

    orderBy: {
      releasedAt: "desc",
    },
  });

  return {
    success: true,
    data: fundReleases,
  };
}

export async function getFundReleaseById(id: string) {
  const fundRelease = await prisma.fundRelease.findUnique({
    where: {
      id,
    },

    include: {
      event: true,

      committee: true,

      committeeMember: {
        include: {
          user: {
            include: {
              admin: true,
            },
          },
        },
      },

      releasedBy: {
        include: {
          admin: true,
        },
      },
    },
  });

  if (!fundRelease) {
    throw new Error("Fund release not found.");
  }

  return {
    success: true,
    data: fundRelease,
  };
}

export async function deleteFundRelease(
  id: string
) {
  const release =
    await prisma.fundRelease.findUnique({
      where: {
        id,
      },
    });

  if (!release) {
    throw new Error(
      "Fund release not found."
    );
  }

  await prisma.fundRelease.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message:
      "Fund release deleted successfully.",
  };
}





export async function createCommitteeExpense(
  committeeId: string,
  userId: string,
  data: CreateCommitteeExpenseDto
) {
  const event = await getActiveEvent();

  /*
  |--------------------------------------------------------------------------
  | Verify Committee
  |--------------------------------------------------------------------------
  */

  const committee = await prisma.committee.findFirst({
    where: {
      id: committeeId,
      eventId: event.id,
    },
  });

  if (!committee) {
    throw new Error("Committee not found.");
  }

  /*
  |--------------------------------------------------------------------------
  | Determine Expense Category
  |--------------------------------------------------------------------------
  */

  const COMMITTEE_EXPENSE_CATEGORY: Record<
    string,
    ExpenseCategory
  > = {
    FEEDING: "FOOD",
    TRANSPORT: "TRANSPORT",
    ACCOMMODATION: "ACCOMMODATION",
    MEDICAL: "MEDICAL",
    PUBLICITY: "PUBLICITY",
  };

  const category =
    COMMITTEE_EXPENSE_CATEGORY[
      committee.committeeName
        .trim()
        .toUpperCase()
    ] ?? "MISC";

  /*
  |--------------------------------------------------------------------------
  | Verify Committee Member
  |--------------------------------------------------------------------------
  */

  const committeeMember =
    await prisma.committeeMember.findFirst({
      where: {
        userId,
      },

      include: {
        user: {
          include: {
            admin: true,
          },
        },
      },
    });

  if (!committeeMember) {
    throw new Error(
      "Committee member not found."
    );
  }

  if (!committeeMember.user.admin) {
    throw new Error(
      "Committee member is not linked to an administrator profile."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Verify Active Assignment
  |--------------------------------------------------------------------------
  */

  const assignment =
    await prisma.committeeAssignment.findFirst({
      where: {
        committeeId,
        committeeMemberId: committeeMember.id,
        isActive: true,
      },
    });

  if (!assignment) {
    throw new Error(
      "You are not assigned to this committee."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Create Expense
  |--------------------------------------------------------------------------
  */

  const expense =
    await prisma.expense.create({
      data: {
        eventId: event.id,

        committeeId,

        committeeMemberId:
          committeeMember.id,

        expenseName:
          data.expenseName,

        category,

        description:
          data.description,

        amount: new Decimal(
          data.amount
        ),

        receiptType:
          data.receiptType,

        receiptUrl:
          data.receiptUrl,
      },

      include: {
        committee: true,

        committeeMember: {
          include: {
            user: {
              include: {
                admin: true,
              },
            },
          },
        },

        event: true,
      },
    });

  return {
    success: true,
    message:
      "Expense recorded successfully.",
    data: expense,
  };
}

export async function getExpenses() {
  const event = await getActiveEvent();

  const expenses = await prisma.expense.findMany({
    where: {
      eventId: event.id,
    },

    include: {
      committee: {
        select: {
          id: true,
          committeeName: true,
        },
      },

      committeeMember: {
        include: {
          user: {
            include: {
              admin: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    success: true,
    data: expenses,
  };
}

export async function getExpenseById(id: string) {
  const expense = await prisma.expense.findUnique({
    where: {
      id,
    },

    include: {
      event: true,

      committee: true,

      committeeMember: {
        include: {
          user: {
            include: {
              admin: true,
            },
          },
        },
      },
    },
  });

  if (!expense) {
    throw new Error("Expense not found.");
  }

  return {
    success: true,
    data: expense,
  };
}

export async function updateExpense(
  id: string,
  data: UpdateExpenseDto
) {
  const existing = await prisma.expense.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new Error("Expense not found.");
  }

  const expense = await prisma.expense.update({
    where: {
      id,
    },

    data: {
      ...data,

      amount:
        data.amount !== undefined
          ? new Decimal(data.amount)
          : undefined,
    },

    include: {
      committee: true,

      committeeMember: {
        include: {
          user: {
            include: {
              admin: true,
            },
          },
        },
      },
    },
  });

  return {
    success: true,
    message: "Expense updated successfully.",
    data: expense,
  };
}

export async function deleteExpense(id: string) {
  const existing = await prisma.expense.findUnique({
    where: {
      id,
    },
  });

  if (!existing) {
    throw new Error("Expense not found.");
  }

  await prisma.expense.delete({
    where: {
      id,
    },
  });

  return {
    success: true,
    message: "Expense deleted successfully.",
  };
}


export async function getCommitteeFinanceDashboard(
  committeeId: string
) {
  const event = await getActiveEvent();

  const committee = await prisma.committee.findFirst({
  where: {
    id: committeeId,
    eventId: event.id,
  },
});

if (!committee) {
  throw new Error("Committee not found.");
}

const budget = await prisma.budget.aggregate({
  where: {
    eventId: event.id,
    committeeId,
  },
  _sum: {
    amount: true,
  },
});

const releases = await prisma.fundRelease.aggregate({
  where: {
    eventId: event.id,
    committeeId,
  },
  _sum: {
    amount: true,
  },
});

const expenses = await prisma.expense.aggregate({
  where: {
    eventId: event.id,
    committeeId,
  },
  _sum: {
    amount: true,
  },
});

const totalBudget = Number(
  budget._sum.amount ?? 0
);

const totalReleased = Number(
  releases._sum.amount ?? 0
);

const totalExpenses = Number(
  expenses._sum.amount ?? 0
);

const availableBalance =
  totalReleased - totalExpenses;

const remainingBudget =
  totalBudget - totalExpenses;

const deficit =
  remainingBudget < 0
    ? Math.abs(remainingBudget)
    : 0;

    const expenseRecords =
  await prisma.expense.findMany({
    where: {
      eventId: event.id,
      committeeId,
    },

    include: {
      committeeMember: {
        include: {
          user: {
            include: {
              admin: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return {
  success: true,

  data: {
    committee,

    totalBudget,

    totalReleased,

    totalExpenses,

    availableBalance,

    remainingBudget,

    deficit,

    expenses: expenseRecords,
  },
};
};


export async function getSystemIncome() {
  const event = await getActiveEvent();

  /*
  |--------------------------------------------------------------------------
  | Parish Registration Income
  |--------------------------------------------------------------------------
  */

  const approvedParishes =
    await prisma.parishAccount.count({
      where: {
        eventId: event.id,
        paymentStatus: "APPROVED",
      },
    });

  const totalParishIncome =
    approvedParishes *
    Number(event.registrationFee);

  /*
  |--------------------------------------------------------------------------
  | Vendor Income
  | (Will become dynamic later)
  |--------------------------------------------------------------------------
  */

  const vendorIncome = 0;

  const totalIncome =
    totalParishIncome + vendorIncome;

  return {
    success: true,

    data: {
      parishIncome: totalParishIncome,

      vendorIncome,

      totalIncome,
    },
  };
}

export async function getExecutivePayments() {
  const event = await getActiveEvent();

  const payments = await prisma.fundRelease.findMany({
    where: {
      eventId: event.id,

      authority: {
        in: [
          "CHAPLAIN",
          "DIOCESAN_PRESIDENT",
          "GENERAL_COMMITTEE_CHAIRMAN",
        ],
      },
    },

    include: {
      committeeMember: {
        include: {
          user: {
            include: {
              admin: {
                select: {
                  fullName: true,
                },
              },
            },
          },
        },
      },

      releasedBy: {
        include: {
          admin: {
            select: {
              fullName: true,
            },
          },
        },
      },
    },

    orderBy: {
      releasedAt: "desc",
    },
  });

  return {
    success: true,

    data: payments.map((payment) => ({
      id: payment.id,

      authority: payment.authority,

      sender:
        payment.releasedBy.admin?.fullName,

      recipient:
        payment.recipientName,

      amount: Number(payment.amount),

      receiptUrl:
        payment.receiptUrl,

      remarks:
        payment.remarks,

      releasedAt:
        payment.releasedAt,
    })),
  };
}


export async function getAccountSummary() {
  const event = await getActiveEvent();

  /*
  |--------------------------------------------------------------------------
  | Income Breakdown
  |--------------------------------------------------------------------------
  */

  const incomeBreakdown =
    await prisma.incomeRecord.groupBy({
      by: ["source"],

      where: {
        eventId: event.id,
      },

      _sum: {
        amount: true,
      },
    });

  const parishIncome = Number(
    incomeBreakdown.find(
      (i) =>
        i.source ===
        "PARISH_REGISTRATION"
    )?._sum.amount ?? 0
  );

  const vendorIncome = Number(
    incomeBreakdown.find(
      (i) =>
        i.source ===
        "VENDOR_REGISTRATION"
    )?._sum.amount ?? 0
  );

  const donationIncome = Number(
    incomeBreakdown.find(
      (i) =>
        i.source ===
        "DONATION"
    )?._sum.amount ?? 0
  );

  const totalIncome =
    parishIncome +
    vendorIncome +
    donationIncome;

  /*
  |--------------------------------------------------------------------------
  | Expenses
  |--------------------------------------------------------------------------
  */

  const expenses =
    await prisma.expense.findMany({
      where: {
        eventId: event.id,
      },

      include: {
        committee: {
          select: {
            committeeName: true,
          },
        },

        committeeMember: {
          include: {
            user: {
              include: {
                admin: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Totals
  |--------------------------------------------------------------------------
  */

  const totalExpenses =
    expenses.reduce(
      (sum, expense) =>
        sum +
        Number(expense.amount),
      0
    );

  const balance =
    totalIncome -
    totalExpenses;

  const deficit =
    balance < 0
      ? Math.abs(balance)
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Response
  |--------------------------------------------------------------------------
  */

  return {
    success: true,

    data: {
      event: {
        id: event.id,

        eventName:
          event.eventName,

        year: event.year,

        generatedAt:
          new Date(),
      },

      totalIncome,

      parishIncome,

      vendorIncome,

      donationIncome,

      totalExpenses,

      balance,

      deficit,

      financialStatus:
        balance >= 0
          ? "BALANCE"
          : "DEFICIT",

      expenses:
        expenses.map(
          (expense) => ({
            id: expense.id,

            date:
              expense.createdAt,

            committee:
              expense.committee
                .committeeName,

            recordedBy:
              expense
                .committeeMember
                .user.admin
                ?.fullName ??
              "Unknown",

            expenseName:
              expense.expenseName,

            category:
              expense.category,

            description:
              expense.description,

            amount: Number(
              expense.amount
            ),

            receiptType:
              expense.receiptType,

            receiptUrl:
              expense.receiptUrl,
          })
        ),
    },
  };
}

export async function getCommitteeOptions() {
  const event = await getActiveEvent();

  const committees =
    await prisma.committee.findMany({
      where: {
        eventId: event.id,
      },

      orderBy: {
        committeeName: "asc",
      },

      select: {
        id: true,

        committeeName: true,
      },
    });

  return {
    success: true,

    data: committees,
  };
}


export async function getCommitteeMembers(
  committeeId: string
) {
  const members =
    await prisma.committeeAssignment.findMany({
      where: {
        committeeId,
      },

      include: {
        committeeMember: {
          include: {
            user: {
              include: {
                admin: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },

      orderBy: {
        committeeMember: {
          user: {
            admin: {
              fullName: "asc",
            },
          },
        },
      },
    });

  return {
    success: true,

    data: members.map((member) => ({
      id: member.committeeMember.id,

      fullName:
        member.committeeMember
          .user.admin?.fullName,
    })),
  };
}


export async function getCommitteeMemberDashboard(
  committeeId: string,
  userId: string
) {
  const event = await getActiveEvent();

  /*
  |--------------------------------------------------------------------------
  | Verify Committee Member
  |--------------------------------------------------------------------------
  */

  const committeeMember =
    await prisma.committeeMember.findUnique({
      where: {
        userId,
      },

      include: {
        assignments: {
          where: {
            isActive: true,
          },
        },
      },
    });

  if (!committeeMember) {
    throw new Error(
      "Committee member not found."
    );
  }

  const assignment =
    committeeMember.assignments.find(
      (item) =>
        item.committeeId === committeeId
    );

  if (!assignment) {
    throw new Error(
      "You are not assigned to this committee."
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Committee
  |--------------------------------------------------------------------------
  */

  const committee =
    await prisma.committee.findFirst({
      where: {
        id: committeeId,
        eventId: event.id,
      },
    });

  if (!committee) {
    throw new Error("Committee not found.");
  }

  /*
  |--------------------------------------------------------------------------
  | Total Funds Released
  |--------------------------------------------------------------------------
  */

  const released =
    await prisma.fundRelease.aggregate({
      where: {
        eventId: event.id,
        committeeId,
      },

      _sum: {
        amount: true,
      },
    });

  const totalReleased = Number(
    released._sum.amount ?? 0
  );

  /*
  |--------------------------------------------------------------------------
  | Total Expenses
  |--------------------------------------------------------------------------
  */

  const expense =
    await prisma.expense.aggregate({
      where: {
        eventId: event.id,
        committeeId,
      },

      _sum: {
        amount: true,
      },
    });

  const totalExpenses = Number(
    expense._sum.amount ?? 0
  );

  /*
  |--------------------------------------------------------------------------
  | Balance / Deficit
  |--------------------------------------------------------------------------
  */

  const difference =
    totalReleased - totalExpenses;

  const availableBalance =
    difference > 0 ? difference : 0;

  const deficit =
    difference < 0
      ? Math.abs(difference)
      : 0;

  const financialStatus =
    deficit > 0
      ? "DEFICIT"
      : "BALANCE";

  /*
  |--------------------------------------------------------------------------
  | Fund Releases
  |--------------------------------------------------------------------------
  */

  const fundReleases =
    await prisma.fundRelease.findMany({
      where: {
        eventId: event.id,
        committeeId,
      },

      include: {
        releasedBy: {
          include: {
            admin: {
              select: {
                fullName: true,
              },
            },
          },
        },
      },

      orderBy: {
        releasedAt: "desc",
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Expense Records
  |--------------------------------------------------------------------------
  */

  const expenseRecords =
    await prisma.expense.findMany({
      where: {
        eventId: event.id,
        committeeId,
      },

      include: {
        committeeMember: {
          include: {
            user: {
              include: {
                admin: {
                  select: {
                    fullName: true,
                  },
                },
              },
            },
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  /*
  |--------------------------------------------------------------------------
  | Response
  |--------------------------------------------------------------------------
  */

  return {
    success: true,

    data: {
      committee,

      totalReleased,

      totalExpenses,

      availableBalance,

      deficit,

      financialStatus,

      fundReleases,

      expenses: expenseRecords,
    },
  };
}