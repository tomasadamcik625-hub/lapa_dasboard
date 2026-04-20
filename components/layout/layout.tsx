"use client";

import React from "react";
import { useLockedBody } from "../hooks/useBodyLock";
import { NavbarWrapper } from "../navbar/navbar";
import { SidebarWrapper } from "../sidebar/sidebar";
import { SidebarContext } from "./layout-context";
import { TimerProvider } from "../timer/timer-context";
import { TimerSaveModal } from "../timer/timer-save-modal";

interface Props {
  children: React.ReactNode;
}

export const Layout = ({ children }: Props) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [_, setLocked] = useLockedBody(false);
  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    setLocked(!sidebarOpen);
  };

  return (
    <TimerProvider>
      <SidebarContext.Provider
        value={{
          collapsed: sidebarOpen,
          setCollapsed: handleToggleSidebar,
        }}>
        <section className='flex'>
          <SidebarWrapper />
          <NavbarWrapper>{children}</NavbarWrapper>
        </section>
        <TimerSaveModal />
      </SidebarContext.Provider>
    </TimerProvider>
  );
};
