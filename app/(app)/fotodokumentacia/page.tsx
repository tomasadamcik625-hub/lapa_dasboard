"use client";
import React, { useState } from "react";

const URL = "https://adamcikt.sk/fotodokumentacia/";

export default function FotodokumentaciaPage() {
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 border-b border-default-200 shrink-0">
        <h1 className="text-xl font-bold text-default-900">Fotodokumentácia</h1>
        <a
          href={URL}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-1.5 text-sm rounded-xl border border-default-300 text-default-600 hover:border-[#7DC8E8] hover:text-[#7DC8E8] transition-colors"
        >
          Otvoriť v novom okne ↗
        </a>
      </div>

      {failed ? (
        <div className="flex flex-col items-center justify-center flex-1 gap-4 text-default-400">
          <p className="text-sm">Stránka nepovoľuje zobrazenie v iframe.</p>
          <a
            href={URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-xl bg-[#7DC8E8] text-white text-sm font-semibold hover:bg-[#5bb8dc] transition-colors"
          >
            Otvoriť adamcikt.sk/fotodokumentacia ↗
          </a>
        </div>
      ) : (
        <iframe
          src={URL}
          className="flex-1 w-full border-0"
          onError={() => setFailed(true)}
          title="Fotodokumentácia"
        />
      )}
    </div>
  );
}
