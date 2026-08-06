UPDATE "Committee"
SET "permissions" = ARRAY(
  SELECT DISTINCT permission
  FROM unnest(
    "permissions" || ARRAY[
      'VIEW_FINANCE_DASHBOARD'::"CommitteePermission",
      'CREATE_EXPENSE'::"CommitteePermission",
      'VIEW_EXPENSES'::"CommitteePermission",
      'UPDATE_EXPENSE'::"CommitteePermission",
      'DELETE_EXPENSE'::"CommitteePermission"
    ]
  ) AS permission
)
WHERE LOWER("committeeName") = 'accommodation';
