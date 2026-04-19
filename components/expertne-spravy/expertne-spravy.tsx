"use client";
import React from "react";
import Link from "next/link";

const FOLDERS = [
  { name: "Príprava", slug: "priprava", count: 0 },
  { name: "Revízia", slug: "revizia", count: 0 },
  { name: "Konečné čítanie", slug: "konecne-citanie", count: 0 },
  { name: "Záverečné čítanie", slug: "zaverecne-citanie", count: 0 },
];

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
  </svg>
);

export const ExpertneSpravy = () => {
  return (
    <div className="px-4 lg:px-6 py-6 max-w-[90rem] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-default-900">Expertné správy</h1>
        <p className="text-default-500 mt-1">{FOLDERS.length} priečinky</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {FOLDERS.map((folder) => (
          <Link
            key={folder.slug}
            href={`/expertne-spravy/${folder.slug}`}
            className="group flex flex-col items-center gap-3 p-6 rounded-2xl border border-default-200 bg-background hover:border-[#7DC8E8] hover:bg-[#7DC8E8]/5 transition-all cursor-pointer"
          >
            <div className="text-[#7DC8E8] group-hover:scale-110 transition-transform">
              <FolderIcon />
            </div>
            <div className="text-center">
              <p className="font-semibold text-default-800 text-sm">{folder.name}</p>
              <p className="text-xs text-default-400 mt-0.5">{folder.count} súborov</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
