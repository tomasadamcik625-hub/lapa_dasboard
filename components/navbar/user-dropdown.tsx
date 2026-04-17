"use client";
import {
  Avatar,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NavbarItem,
} from "@nextui-org/react";
import React, { useCallback } from "react";
import { DarkModeSwitch } from "./darkmodeswitch";
import { useRouter } from "next/navigation";
import { deleteAuthCookie } from "@/actions/auth.action";

export const UserDropdown = () => {
  const router = useRouter();

  const handleLogout = useCallback(async () => {
    await deleteAuthCookie();
    router.replace("/login");
  }, [router]);

  return (
    <Dropdown>
      <NavbarItem>
        <DropdownTrigger>
          <Avatar
            as="button"
            color="primary"
            size="md"
            name="LA"
            classNames={{
              base: "bg-lapa-blue",
              name: "text-white font-bold",
            }}
          />
        </DropdownTrigger>
      </NavbarItem>
      <DropdownMenu aria-label="User menu actions">
        <DropdownItem
          key="profile"
          className="flex flex-col justify-start w-full items-start"
          textValue="profile"
        >
          <p className="text-sm text-default-500">Prihlásený ako</p>
          <p className="font-semibold">Admin</p>
        </DropdownItem>
        <DropdownItem key="settings">Nastavenia</DropdownItem>
        <DropdownItem key="help">Pomoc</DropdownItem>
        <DropdownItem
          key="logout"
          color="danger"
          className="text-danger"
          onPress={handleLogout}
        >
          Odhlásiť sa
        </DropdownItem>
        <DropdownItem key="switch" textValue="darkmode">
          <div className="flex items-center gap-2">
            <span className="text-sm">Tmavý režim</span>
            <DarkModeSwitch />
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};