"use client";
import React from "react";
import { Sidebar } from "./sidebar.styles";
import { CompaniesDropdown } from "./companies-dropdown";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { useSidebarContext } from "../layout/layout-context";
import { usePathname } from "next/navigation";

// Ikony — použijeme existujúce alebo jednoduché SVG
import { HomeIcon } from "../icons/sidebar/home-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { BalanceIcon } from "../icons/sidebar/balance-icon";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
import { CalendarIcon } from "../icons/sidebar/calendar-icon";
import { OrdersIcon } from "../icons/sidebar/orders-icon";

export const SidebarWrapper = () => {
  const pathname = usePathname();
  const { collapsed, setCollapsed } = useSidebarContext();

  return (
    <aside className="h-screen z-[20] sticky top-0">
      {collapsed ? (
        <div className={Sidebar.Overlay()} onClick={setCollapsed} />
      ) : null}
      <div className={Sidebar({ collapsed })}>
        <div className={Sidebar.Header()}>
          <CompaniesDropdown />
        </div>
        <div className="flex flex-col justify-between h-full">
          <div className={Sidebar.Body()}>

            <SidebarItem
              title="Domov"
              icon={<HomeIcon />}
              isActive={pathname === "/"}
              href="/"
            />

            <SidebarMenu title="Pracovné sekcie">
              <SidebarItem
                title="Prehľad činností"
                icon={<HomeIcon />}
                isActive={pathname === "/prehlad-cinnosti"}
                href="/prehlad-cinnosti"
              />
              <SidebarItem
                title="Nákladové listy"
                icon={<BalanceIcon />}
                isActive={pathname === "/nakladove-listy"}
                href="/nakladove-listy"
              />
              <SidebarItem
                title="Expertné správy"
                icon={<ReportsIcon />}
                isActive={pathname === "/expertne-spravy"}
                href="/expertne-spravy"
              />
              <SidebarItem
                title="Zákazky"
                icon={<OrdersIcon />}
                isActive={pathname === "/zakazky"}
                href="/zakazky"
              />
              <SidebarItem
                title="Kalendár"
                icon={<CalendarIcon />}
                isActive={pathname === "/kalendar"}
                href="/kalendar"
              />
            </SidebarMenu>

            <SidebarMenu title="Systém">
              <SidebarItem
                title="Nastavenia"
                icon={<SettingsIcon />}
                isActive={pathname === "/nastavenia"}
                href="/nastavenia"
              />
            </SidebarMenu>

          </div>
        </div>
      </div>
    </aside>
  );
};