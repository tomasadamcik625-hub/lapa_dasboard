"use client";
import React from "react";
import { Sidebar } from "./sidebar.styles";
import { CompaniesDropdown } from "./companies-dropdown";
import { SidebarItem } from "./sidebar-item";
import { SidebarMenu } from "./sidebar-menu";
import { useSidebarContext } from "../layout/layout-context";
import { usePathname } from "next/navigation";

import { HomeIcon } from "../icons/sidebar/home-icon";
import { ReportsIcon } from "../icons/sidebar/reports-icon";
import { BalanceIcon } from "../icons/sidebar/balance-icon";
import { SettingsIcon } from "../icons/sidebar/settings-icon";
import { CalendarIcon } from "../icons/sidebar/calendar-icon";
import { OrdersIcon } from "../icons/sidebar/orders-icon";
import { PhotoIcon } from "../icons/sidebar/photo-icon";
import { ConferenceIcon } from "../icons/sidebar/conference-icon";
import { NotesIcon } from "../icons/sidebar/notes-icon";
import { SlaIcon } from "../icons/sidebar/sla-icon";
import { ExcelIcon } from "../icons/sidebar/excel-icon";
import { AiIcon } from "../icons/sidebar/ai-icon";
import { ServerIcon } from "../icons/sidebar/server-icon";

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
                title="AI asistenti"
                icon={<AiIcon />}
                isActive={pathname === "/ai-asistenti"}
                href="/ai-asistenti"
              />
              <SidebarItem
                title="Excel výpočty"
                icon={<ExcelIcon />}
                isActive={pathname === "/excel-vypocty"}
                href="/excel-vypocty"
              />
              <SidebarItem
                title="Expertné správy"
                icon={<ReportsIcon />}
                isActive={pathname === "/expertne-spravy"}
                href="/expertne-spravy"
              />
              <SidebarItem
                title="Fotodokumentácia"
                icon={<PhotoIcon />}
                isActive={pathname === "/fotodokumentacia"}
                href="/fotodokumentacia"
              />
              <SidebarItem
                title="Kalendár"
                icon={<CalendarIcon />}
                isActive={pathname === "/kalendar"}
                href="/kalendar"
              />
              <SidebarItem
                title="Konferencie"
                icon={<ConferenceIcon />}
                isActive={pathname === "/konferencie"}
                href="/konferencie"
              />
              <SidebarItem
                title="Nákladové listy"
                icon={<BalanceIcon />}
                isActive={pathname === "/nakladove-listy"}
                href="/nakladove-listy"
              />
              <SidebarItem
                title="Prehľad činností"
                icon={<HomeIcon />}
                isActive={pathname === "/prehlad-cinnosti"}
                href="/prehlad-cinnosti"
              />
              <SidebarItem
                title="Server"
                icon={<ServerIcon />}
                isActive={pathname === "/server"}
                href="/server"
              />
              <SidebarItem
                title="SLA"
                icon={<SlaIcon />}
                isActive={pathname === "/sla"}
                href="/sla"
              />
              <SidebarItem
                title="Zákazky"
                icon={<OrdersIcon />}
                isActive={pathname === "/zakazky"}
                href="/zakazky"
              />
              <SidebarItem
                title="Zápis z KM"
                icon={<NotesIcon />}
                isActive={pathname === "/zapis-z-km"}
                href="/zapis-z-km"
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
