"use server";

import { cookies } from "next/headers";

export const createAuthCookie = async (name?: string) => {
  cookies().set("userAuth", "myToken", { secure: true });
  if (name) {
    cookies().set("userName", name, { secure: true, sameSite: "lax" });
  }
};

export const deleteAuthCookie = async () => {
  cookies().delete("userAuth");
  cookies().delete("userName");
};
