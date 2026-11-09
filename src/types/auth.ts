export type Role = "USER" | "ADMIN";

/** What we put in the JWT and attach to req.user. Never contains the password hash. */
export interface AuthUser {
  id: number;
  username: string;
  role: Role;
}

/** What we keep in the "database". */
export interface StoredUser extends AuthUser {
  passwordHash: string;
}
