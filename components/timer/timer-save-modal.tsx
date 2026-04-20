"use client";
import React, { useState } from "react";
import { useTimer } from "./timer-context";

export const TimerSaveModal = () => {
  const { elapsed, formatTime, showSaveModal, setShowSaveModal, resetElapsed } = useTimer();

  const [modalCislo, setModalCislo] = useState("");
  const [modalPopis, setModalPopis] = useState("");
  const [saving, setSaving] = useState(false);

  if (!showSaveModal) return null;

  const handleSave = async () => {
    setSaving(true);
    const dnes = new Date();
    const datum = `${String(dnes.getDate()).padStart(2, "0")}.${String(dnes.getMonth() + 1).padStart(2, "0")}.${dnes.getFullYear()}`;
    const hodiny = Math.round((elapsed / 3600) * 100) / 100;

    await fetch("/api/prehlad-cinnosti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cisloSkody: modalCislo,
        datum,
        meno: "Adamčík",
        popis: modalPopis,
        hodiny,
        rok: String(dnes.getFullYear()),
        stavSkody: "O",
      }),
    });

    setSaving(false);
    setShowSaveModal(false);
    resetElapsed();
    setModalCislo("");
    setModalPopis("");
  };

  const handleCancel = () => {
    setShowSaveModal(false);
    resetElapsed();
    setModalCislo("");
    setModalPopis("");
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-default-200 rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
        <h3 className="text-lg font-bold mb-1">Uložiť záznam</h3>
        <p className="text-default-500 text-sm mb-4">
          Odpracovaný čas:{" "}
          <span className="font-mono font-semibold text-default-900">{formatTime(elapsed)}</span>
        </p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-xs text-default-500 font-medium mb-1 block">
              Číslo škodovej udalosti
            </label>
            <input
              type="text"
              value={modalCislo}
              onChange={(e) => setModalCislo(e.target.value)}
              placeholder="napr. 2025110396"
              className="w-full border border-default-300 rounded-xl px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8]"
            />
          </div>
          <div>
            <label className="text-xs text-default-500 font-medium mb-1 block">
              Popis činnosti
            </label>
            <textarea
              value={modalPopis}
              onChange={(e) => setModalPopis(e.target.value)}
              placeholder="Popis vykonanej práce..."
              rows={3}
              className="w-full border border-default-300 rounded-xl px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8] resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5 justify-end">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-default-100 text-default-600 hover:bg-default-200 transition-colors"
          >
            Zrušiť
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !modalCislo.trim()}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#7DC8E8] text-white hover:bg-[#5bb8dc] disabled:opacity-50 transition-colors"
          >
            {saving ? "Ukladám..." : "Uložiť"}
          </button>
        </div>
      </div>
    </div>
  );
};
