export const USER_ROLES = {
  CUSTOMER: "customer",
  STAFF: "staff",
  ADMIN: "admin",
};

/** Roles con acceso al panel administrativo. */
export const STAFF_ROLES = [USER_ROLES.STAFF, USER_ROLES.ADMIN];
