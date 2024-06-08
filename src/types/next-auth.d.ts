import { User } from "next-auth";
import "next-auth/jwt";

type UserId = string;

declare module "next-auth/jwt" {
  interface JWT {
    id: UserId;
    role: Role;
  }
}

declare module "next-auth" {
  interface Session {
    user: User & {
      id: UserId;
      name: string;
      email: string;
      role: Role;
      token: string;
    };
  }
}

