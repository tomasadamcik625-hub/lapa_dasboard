"use client";
import React, { useEffect, useRef, useState } from "react";
import { getNormohodiny, MESIACE } from "@/lib/pracovne-dni";

interface Zaznam {
  rowIndex: number;
  cisloSkody: string;
  datum: string;
  meno: string;
  popis: string;
  hodiny: number;
  rok: string;
  stavSkody: string;
}

interface OtvorenaSkoda {
  cislo: string;
  poisteny: string;
  poskodeny: string;
  meno: string;
  datumPosledny: string;
  hodiny: number;
}

const inputCls = "w-full bg-transparent border-b border-default-400 focus:outline-none focus:border-[#7DC8E8] text-sm px-1 py-0.5";

export const PrehladCinnosti = () => {
  const [data, setData] = useState<Zaznam[]>([]);
  const [otvoreneSkodyData, setOtvoreneSkodyData] = useState<OtvorenaSkoda[]>([]);
  const [loading, setLoading] = useState(true);
  const [vybranyMesiac, setVybranyMesiac] = useState(new Date().getMonth() + 1);
  const [vybranyRok, setVybranyRok] = useState(new Date().getFullYear());
  const [editingRow, setEditingRow] = useState<Zaznam | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [searchSkody, setSearchSkody] = useState("");

  // Timer
  const [timerState, setTimerState] = useState<"stopped" | "running" | "paused">("stopped");
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [modalCislo, setModalCislo] = useState("");
  const [modalPopis, setModalPopis] = useState("");
  const [modalSaving, setModalSaving] = useState(false);

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, "0");
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, "0");
    const sec = (s % 60).toString().padStart(2, "0");
    return `${h}:${m}:${sec}`;
  };

  const handleStart = () => {
    setTimerState("running");
    intervalRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);
  };

  const handlePause = () => {
    setTimerState("paused");
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setTimerState("stopped");
    setShowModal(true);
  };

  const handleModalSave = async () => {
    setModalSaving(true);
    const dnes = new Date();
    const datum = `${String(dnes.getDate()).padStart(2, "0")}.${String(dnes.getMonth() + 1).padStart(2, "0")}.${dnes.getFullYear()}`;
    const hodiny = Math.round((elapsed / 3600) * 100) / 100;
    const meno = data.find((z) => z.meno)?.meno ?? "Adamčík";

    await fetch("/api/prehlad-cinnosti", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cisloSkody: modalCislo,
        datum,
        meno,
        popis: modalPopis,
        hodiny,
        rok: String(dnes.getFullYear()),
        stavSkody: "O",
      }),
    });

    setModalSaving(false);
    setShowModal(false);
    setElapsed(0);
    setModalCislo("");
    setModalPopis("");
    nacitajData();
  };

  const handleModalCancel = () => {
    setShowModal(false);
    setElapsed(0);
    setModalCislo("");
    setModalPopis("");
  };

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const nacitajData = () => {
    setLoading(true);
    Promise.allSettled([
      fetch("/api/prehlad-cinnosti").then((r) => r.json()),
      fetch("/api/otvorene-skody").then((r) => r.json()),
    ]).then(([aktivity, skody]) => {
      if (aktivity.status === "fulfilled") setData(aktivity.value.data || []);
      if (skody.status === "fulfilled") setOtvoreneSkodyData(skody.value.data || []);
      setLoading(false);
    });
  };

  useEffect(() => { nacitajData(); }, []);

  const filtrovane = data.filter((z) => {
    if (!z.datum) return false;
    const parts = z.datum.split(".");
    if (parts.length < 3) return false;
    return parseInt(parts[1]) === vybranyMesiac && parseInt(parts[2]) === vybranyRok;
  });

  const odpracovaneHodiny = filtrovane.reduce((s, z) => s + z.hodiny, 0);
  const normohodiny = getNormohodiny(vybranyRok, vybranyMesiac);
  const rozdiel = odpracovaneHodiny - normohodiny;

  const normCislo = (v: string) => v.trim().toUpperCase();

  const dovolenka = filtrovane
    .filter((z) => normCislo(z.cisloSkody) === "D")
    .reduce((s, z) => s + z.hodiny, 0);

  const otvoreneSkody = (() => {
    const q = searchSkody.trim().toLowerCase();
    if (q) {
      return otvoreneSkodyData.filter((r) =>
        r.cislo.toLowerCase().includes(q) ||
        r.poisteny.toLowerCase().includes(q) ||
        r.poskodeny.toLowerCase().includes(q) ||
        r.meno.toLowerCase().includes(q) ||
        r.datumPosledny.includes(q)
      );
    }
    return otvoreneSkodyData.filter((r) => r.meno.trim().toLowerCase().includes("adamčík"));
  })();

  const tabulkaData = search.trim()
    ? data.filter((z) => {
        const q = search.trim().toLowerCase();
        return (
          z.cisloSkody.toLowerCase().includes(q) ||
          z.datum.includes(q) ||
          z.meno.toLowerCase().includes(q) ||
          z.popis.toLowerCase().includes(q) ||
          String(z.hodiny).includes(q) ||
          z.stavSkody.toLowerCase().includes(q)
        );
      })
    : filtrovane;
  const dostupneRoky = [...new Set(data.map((z) => z.datum.split(".")[2]).filter(Boolean))].sort();

  const handleSave = async () => {
    if (!editingRow) return;
    setSaving(true);
    await fetch("/api/prehlad-cinnosti", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingRow),
    });
    setSaving(false);
    setEditingRow(null);
    nacitajData();
  };

  const handleDelete = async (rowIndex: number) => {
    if (!confirm("Naozaj chceš vymazať tento záznam?")) return;
    setDeletingIndex(rowIndex);
    await fetch("/api/prehlad-cinnosti", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rowIndex }),
    });
    setDeletingIndex(null);
    nacitajData();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7DC8E8] border-t-transparent rounded-full animate-spin" />
          <p className="text-default-500 text-sm">Načítavam dáta...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-6 max-w-[90rem] mx-auto w-full">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-default-900">Prehľad činností</h1>
        <p className="text-default-500 mt-1">Tomáš Adamčík</p>
      </div>

      {/* Prepínač */}
      <div className="flex gap-3 mb-6 flex-wrap items-end">
        <div className="flex flex-col gap-1">
          <label className="text-xs text-default-500 font-medium">Mesiac</label>
          <select
            value={vybranyMesiac}
            onChange={(e) => setVybranyMesiac(Number(e.target.value))}
            className="border border-default-300 rounded-xl px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8]"
          >
            {MESIACE.map((m, i) => (
              <option key={i + 1} value={i + 1}>{m}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-default-500 font-medium">Rok</label>
          <select
            value={vybranyRok}
            onChange={(e) => setVybranyRok(Number(e.target.value))}
            className="border border-default-300 rounded-xl px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8]"
          >
            {dostupneRoky.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Timer */}
      <div className="flex items-center gap-4 mb-6 p-4 border border-default-200 rounded-2xl bg-background">
        <span className="font-mono text-3xl font-bold text-default-900 w-32">{formatTime(elapsed)}</span>
        <button
          onClick={timerState === "running" ? handlePause : handleStart}
          className={`px-5 py-2 rounded-xl font-semibold text-sm text-white transition-colors ${
            timerState === "running" ? "bg-orange-400 hover:bg-orange-500" : "bg-[#7DC8E8] hover:bg-[#5bb5d9]"
          }`}
        >
          {timerState === "running" ? "⏸ Pauza" : timerState === "paused" ? "▶ Pokračovať" : "▶ Štart"}
        </button>
        {timerState !== "stopped" && (
          <button
            onClick={handleStop}
            className="px-5 py-2 rounded-xl font-semibold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors"
          >
            ⏹ Stop
          </button>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-background border border-default-200 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold mb-1">Uložiť záznam</h3>
            <p className="text-default-500 text-sm mb-4">Odpracovaný čas: <span className="font-mono font-semibold text-default-900">{formatTime(elapsed)}</span></p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs text-default-500 font-medium mb-1 block">Číslo škodovej udalosti</label>
                <input
                  type="text"
                  value={modalCislo}
                  onChange={(e) => setModalCislo(e.target.value)}
                  placeholder="napr. 2025110396"
                  className="w-full border border-default-300 rounded-xl px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8]"
                />
              </div>
              <div>
                <label className="text-xs text-default-500 font-medium mb-1 block">Popis činnosti</label>
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
                onClick={handleModalCancel}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-default-100 text-default-600 hover:bg-default-200"
              >
                Zrušiť
              </button>
              <button
                onClick={handleModalSave}
                disabled={modalSaving || !modalCislo.trim()}
                className="px-4 py-2 rounded-xl text-sm font-semibold bg-[#7DC8E8] text-white hover:bg-[#5bb5d9] disabled:opacity-50"
              >
                {modalSaving ? "Ukladám..." : "Uložiť"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sekcia 1 — Fond hodín */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">📊 Mesačný fond hodín</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="border border-default-200 rounded-2xl p-6 text-center bg-background">
            <p className="text-default-500 text-sm mb-1">Odpracované</p>
            <p className="text-4xl font-bold text-[#7DC8E8]">{odpracovaneHodiny.toFixed(2)}</p>
            <p className="text-default-400 text-xs mt-1">hodín</p>
          </div>
          <div className="border border-default-200 rounded-2xl p-6 text-center bg-background">
            <p className="text-default-500 text-sm mb-1">Normohodiny</p>
            <p className="text-4xl font-bold text-default-700">{normohodiny}</p>
            <p className="text-default-400 text-xs mt-1">hodín</p>
          </div>
          <div className="border border-default-200 rounded-2xl p-6 text-center bg-background">
            <p className="text-default-500 text-sm mb-1">Dovolenka</p>
            <p className="text-4xl font-bold text-default-700">{dovolenka.toFixed(2)}</p>
            <p className="text-default-400 text-xs mt-1">hodín</p>
          </div>
          <div className="border border-default-200 rounded-2xl p-6 text-center bg-background">
            <p className="text-default-500 text-sm mb-1">Rozdiel</p>
            <p className={`text-4xl font-bold ${rozdiel >= 0 ? "text-green-500" : "text-red-500"}`}>
              {rozdiel >= 0 ? "+" : ""}{rozdiel.toFixed(2)}
            </p>
            <span className={`text-xs rounded-full px-3 py-1 mt-2 inline-block ${
              rozdiel >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}>
              {rozdiel >= 0 ? "Fond splnený" : "Fond nesplnený"}
            </span>
          </div>
        </div>
      </div>

      {/* Sekcia 2 — Otvorené škody */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
          <h2 className="text-lg font-semibold">
            📋 Otvorené škody{" "}
            <span className="text-xs bg-red-100 text-red-700 rounded-full px-2 py-0.5 ml-1">
              {otvoreneSkody.length}
            </span>
            {searchSkody.trim() && <span className="text-xs text-default-400 ml-2 font-normal">— celá tabuľka</span>}
          </h2>
          <input
            type="text"
            value={searchSkody}
            onChange={(e) => setSearchSkody(e.target.value)}
            placeholder="Hľadať..."
            className="border border-default-300 rounded-xl px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8] w-64"
          />
        </div>
        <div className="border border-default-200 rounded-2xl overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default-200 bg-default-50">
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Č. ŠU LAPA</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Poistený</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Poškodený</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Meno</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Posledná aktivita</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Sledovanie SLA</th>
                  <th className="text-right px-4 py-3 font-semibold text-default-600">Celkom hodín</th>
                </tr>
              </thead>
              <tbody>
                {otvoreneSkody.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-default-400">Žiadne otvorené škody</td>
                  </tr>
                ) : (
                  otvoreneSkody.map((skoda, i) => (
                    <tr key={skoda.cislo} className={`border-b border-default-100 hover:bg-default-50 transition-colors ${i % 2 === 0 ? "" : "bg-default-50/50"}`}>
                      <td className="px-4 py-3 font-mono font-semibold text-[#7DC8E8]">{skoda.cislo}</td>
                      <td className="px-4 py-3 text-default-700">{skoda.poisteny || "—"}</td>
                      <td className="px-4 py-3 text-default-700">{skoda.poskodeny || "—"}</td>
                      <td className="px-4 py-3 text-default-700">{skoda.meno}</td>
                      <td className="px-4 py-3 text-default-500">{skoda.datumPosledny}</td>
                      <td className="px-4 py-3">
                        {(() => {
                          const parts = skoda.datumPosledny.split(".");
                          if (parts.length < 3) return "—";
                          const d = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
                          const dni = Math.floor((Date.now() - d.getTime()) / 86400000);
                          const farba = dni > 30 ? "text-red-500" : dni > 14 ? "text-orange-400" : "text-green-500";
                          return <span className={`font-semibold ${farba}`}>{dni} dní</span>;
                        })()}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">{skoda.hodiny.toFixed(2)} h</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Sekcia 3 — Prehľad činností (editovateľná tabuľka) */}
      <div>
        <div className="flex items-center justify-between mb-3 gap-4 flex-wrap">
          <h2 className="text-lg font-semibold">
            📝 Prehľad činností{" "}
            <span className="text-xs bg-default-100 text-default-600 rounded-full px-2 py-0.5 ml-1">
              {tabulkaData.length}
            </span>
            {search.trim() && <span className="text-xs text-default-400 ml-2 font-normal">— celá tabuľka</span>}
          </h2>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hľadať..."
            className="border border-default-300 rounded-xl px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8] w-64"
          />
        </div>
        <div className="border border-default-200 rounded-2xl overflow-hidden bg-background">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-default-200 bg-default-50">
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Č. škody</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Dátum</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Meno</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Popis</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Hodiny</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Rok</th>
                  <th className="text-left px-4 py-3 font-semibold text-default-600">Stav</th>
                  <th className="text-right px-4 py-3 font-semibold text-default-600">Akcie</th>
                </tr>
              </thead>
              <tbody>
                {tabulkaData.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-default-400">Žiadne záznamy</td>
                  </tr>
                ) : (
                  tabulkaData.map((z, i) => {
                    const isEditing = editingRow?.rowIndex === z.rowIndex;
                    return (
                      <tr key={z.rowIndex} className={`border-b border-default-100 hover:bg-default-50 transition-colors ${i % 2 === 0 ? "" : "bg-default-50/50"}`}>
                        <td className="px-4 py-2">
                          {isEditing
                            ? <input className={inputCls} value={editingRow.cisloSkody} onChange={(e) => setEditingRow({ ...editingRow, cisloSkody: e.target.value })} />
                            : <span className="font-mono text-[#7DC8E8]">{z.cisloSkody}</span>}
                        </td>
                        <td className="px-4 py-2">
                          {isEditing
                            ? <input className={inputCls} value={editingRow.datum} onChange={(e) => setEditingRow({ ...editingRow, datum: e.target.value })} />
                            : z.datum}
                        </td>
                        <td className="px-4 py-2">
                          {isEditing
                            ? <input className={inputCls} value={editingRow.meno} onChange={(e) => setEditingRow({ ...editingRow, meno: e.target.value })} />
                            : z.meno}
                        </td>
                        <td className="px-4 py-2 max-w-xs">
                          {isEditing
                            ? <input className={inputCls} value={editingRow.popis} onChange={(e) => setEditingRow({ ...editingRow, popis: e.target.value })} />
                            : <span className="text-default-500 truncate block">{z.popis}</span>}
                        </td>
                        <td className="px-4 py-2">
                          {isEditing
                            ? <input className={inputCls} type="number" step="0.5" value={editingRow.hodiny} onChange={(e) => setEditingRow({ ...editingRow, hodiny: parseFloat(e.target.value) || 0 })} />
                            : <span className="font-semibold">{z.hodiny}</span>}
                        </td>
                        <td className="px-4 py-2">
                          {isEditing
                            ? <input className={inputCls} value={editingRow.rok} onChange={(e) => setEditingRow({ ...editingRow, rok: e.target.value })} />
                            : z.rok}
                        </td>
                        <td className="px-4 py-2">
                          {isEditing
                            ? <input className={inputCls} value={editingRow.stavSkody} onChange={(e) => setEditingRow({ ...editingRow, stavSkody: e.target.value })} />
                            : <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${z.stavSkody === "O" ? "bg-green-100 text-green-700" : "bg-default-100 text-default-600"}`}>{z.stavSkody}</span>}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <button onClick={handleSave} disabled={saving} className="text-xs px-3 py-1 rounded-lg bg-[#7DC8E8] text-white font-semibold hover:bg-[#5bb5d9] disabled:opacity-50">
                                {saving ? "..." : "Uložiť"}
                              </button>
                              <button onClick={() => setEditingRow(null)} className="text-xs px-3 py-1 rounded-lg bg-default-100 text-default-600 font-semibold hover:bg-default-200">
                                Zrušiť
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingRow({ ...z })} className="text-xs px-3 py-1 rounded-lg bg-default-100 text-default-600 font-semibold hover:bg-default-200">
                                Upraviť
                              </button>
                              <button onClick={() => handleDelete(z.rowIndex)} disabled={deletingIndex === z.rowIndex} className="text-xs px-3 py-1 rounded-lg bg-red-100 text-red-600 font-semibold hover:bg-red-200 disabled:opacity-50">
                                {deletingIndex === z.rowIndex ? "..." : "Zmazať"}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

    </div>
  );
};
