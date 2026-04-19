"use client";
import React from "react";
import Link from "next/link";

const FOLDERS = [
  { name: "2020", slug: "2020" },
  { name: "2021", slug: "2021" },
  { name: "2022", slug: "2022" },
  { name: "2023", slug: "2023" },
  { name: "2024", slug: "2024" },
  { name: "2025", slug: "2025" },
  { name: "2027", slug: "2027" },
];

const FolderIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 shrink-0">
    <path d="M19.5 21a3 3 0 003-3v-4.5a3 3 0 00-3-3h-15a3 3 0 00-3 3V18a3 3 0 003 3h15zM1.5 10.146V6a3 3 0 013-3h5.379a2.25 2.25 0 011.59.659l2.122 2.121c.14.141.331.22.53.22H19.5a3 3 0 013 3v1.146A4.483 4.483 0 0019.5 9h-15a4.483 4.483 0 00-3 1.146z" />
  </svg>
);

export const Server = () => {
  return (
    <div className="px-4 lg:px-6 py-6 max-w-[90rem] mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-default-900">Server</h1>
        <p className="text-default-500 mt-1">{FOLDERS.length} priečinky</p>
      </div>

      <div className="flex flex-col gap-3">
        {FOLDERS.map((folder) => (
          <Link
            key={folder.slug}
            href={`/server/${folder.slug}`}
            className="group flex items-center gap-4 w-full px-5 py-4 rounded-2xl border border-default-200 bg-background hover:border-[#7DC8E8] hover:bg-[#7DC8E8]/5 transition-all"
          >
            <div className="text-[#7DC8E8] group-hover:scale-110 transition-transform">
              <FolderIcon />
            </div>
            <span className="font-semibold text-default-800">{folder.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};
