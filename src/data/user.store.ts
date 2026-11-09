import { AuthUser, Role, StoredUser } from "../types/auth";

// In-memory mock "database". Only password HASHES are ever stored here.
const users: StoredUser[] = [];
let nextId = 1;

export const userStore = {
  findByUsername(username: string): StoredUser | undefined {
    const wanted = username.toLowerCase();
    return users.find((u) => u.username.toLowerCase() === wanted);
  },

  create(username: string, passwordHash: string, role: Role): StoredUser {
    const user: StoredUser = { id: nextId++, username, passwordHash, role };
    users.push(user);
    return user;
  },

  /** Safe view of all users: no password hashes. */
  listPublic(): AuthUser[] {
    return users.map(({ id, username, role }) => ({ id, username, role }));
  },
};
