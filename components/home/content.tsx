"use client";
import React from "react";
import NextLink from "next/link";

const sections = [
  {
    title: "Prehľad činností",
    href: "/prehlad-cinnosti",
    description: "Prehľad všetkých pracovných činností a úloh",
    icon: "📋",
    color: "bg-blue-50 dark:bg-blue-950",
    status: "Aktívne",
  },
  {
    title: "Nákladové listy",
    href: "/nakladove-listy",
    description: "Správa a prehľad nákladových listov",
    icon: "📊",
    color: "bg-green-50 dark:bg-green-950",
    status: "Aktívne",
  },
  {
    title: "Expertné správy",
    href: "/expertne-spravy",
    description: "Expertné správy a dokumentácia",
    icon: "📁",
    color: "bg-purple-50 dark:bg-purple-950",
    status: "Aktívne",
  },
];

export const Content = () => {
  return (
    <div className="h-full px-4 lg:px-6 py-6 max-w-[90rem] mx-auto w-full">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-default-900">LAPA Dashboard</h1>
        <p className="text-default-500 mt-1">
          Vitajte v pracovnom dashboarde LAPA SLOVAKIA s. r. o.
        </p>
      </div>

      <div className="mb-8">
        <h2 className="text-lg font-semibold text-default-700 mb-4">Rýchly prístup</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sections.map((section) => (
            <NextLink key={section.href} href={section.href}>
              <div className={`${section.color} border border-default-200 rounded-2xl p-5 hover:shadow-lg transition-shadow cursor-pointer`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{section.icon}</span>
                  <div>
                    <p className="text-base font-semibold">{section.title}</p>
                    <span className="text-xs bg-primary-100 text-primary-600 rounded-full px-2 py-0.5">
                      {section.status}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-default-500">{section.description}</p>
              </div>
            </NextLink>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border border-default-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-3">ℹ️ O dashboarde</h3>
          <p className="text-sm text-default-600">
            Tento dashboard slúži ako centrálne miesto pre správu všetkých
            pracovných dokumentov a súborov LAPA SLOVAKIA s. r. o.
          </p>
        </div>

        <div className="border border-default-200 rounded-2xl p-5">
          <h3 className="font-semibold mb-3">🔧 Stav systému</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-600">Dashboard</span>
              <span className="text-xs bg-success-100 text-success-600 rounded-full px-2 py-0.5">Online</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-600">Google Sheets API</span>
              <span className="text-xs bg-warning-100 text-warning-600 rounded-full px-2 py-0.5">Čaká na setup</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-default-600">Google Drive API</span>
              <span className="text-xs bg-warning-100 text-warning-600 rounded-full px-2 py-0.5">Čaká na setup</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};