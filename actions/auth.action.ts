"use server";

import { cookies } from "next/headers";

export const loginAction = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || "Administrátor";

  if (!adminEmail || !adminPassword) {
    return { success: false, error: "Prihlasovanie nie je nakonfigurované" };
  }

  if (email !== adminEmail || password !== adminPassword) {
    return { success: false, error: "Nesprávny email alebo heslo" };
  }

  cookies().set("userAuth", "myToken", { secure: true, httpOnly: true, sameSite: "lax" });
  cookies().set("userName", adminName, { secure: true, sameSite: "lax" });

  return { success: true };
};

export const deleteAuthCookie = async () => {
  cookies().delete("userAuth");
  cookies().delete("userName");
};
