import React from "react";
import Image from "next/image";

export const CompaniesDropdown = () => {
  return (
    <div className="flex items-center gap-3 px-2">
      <Image
        src="/lapa-logo.png"
        alt="LAPA Slovakia"
        width={40}
        height={40}
        className="rounded-full"
      />
      <div className="flex flex-col">
        <h3 className="text-sm font-bold text-default-900 leading-tight">
          LAPA SLOVAKIA
        </h3>
        <span className="text-xs text-default-500">s. r. o.</span>
      </div>
    </div>
  );
};