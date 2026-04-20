"use client";
import React, { useEffect, useState, useRef } from "react";

interface SelectedRow {
  values: string[];
  rowIndex: number;
}

export const Zakazky = () => {
  const [rows, setRows] = useState<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [colCount, setColCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterRiesitel, setFilterRiesitel] = useState("");
  const [selectedRow, setSelectedRow] = useState<SelectedRow | null>(null);
  const [editData, setEditData] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/zakazky")
      .then((r) => r.json())
      .then((res) => {
        setRows(res.rows || []);
        setColCount(res.colCount || 0);
        setHeaders(res.headers || []);
        setLoading(false);
      });
  }, []);

  const currentYear = new Date().getFullYear().toString();
  const riesitelColIndex = headers.findIndex((h) => h.trim().toUpperCase() === "RIEŠITEĽ");

  const filtrovane = (() => {
    let result = search.trim()
      ? rows.filter((row) =>
          row.some((cell) => cell.toLowerCase().includes(search.trim().toLowerCase()))
        )
      : rows.filter((row) => (row[0] || "").startsWith(currentYear));

    if (filterRiesitel.trim() && riesitelColIndex !== -1) {
      result = result.filter((row) =>
        (row[riesitelColIndex] || "").toLowerCase().includes(filterRiesitel.trim().toLowerCase())
      );
    }
    return result;
  })();

  const openModal = (row: string[], arrayIndex: number) => {
    const values = Array.from({ length: colCount }, (_, i) => row[i] || "");
    setEditData(values);
    setSelectedRow({ values: row, rowIndex: arrayIndex + 2 });
    setIsNew(false);
  };

  const openNewModal = () => {
    setEditData(Array(colCount).fill(""));
    setSelectedRow({ values: [], rowIndex: -1 });
    setIsNew(true);
  };

  const closeModal = () => {
    setSelectedRow(null);
    setEditData([]);
    setIsNew(false);
  };

  const handleSave = async () => {
    if (!selectedRow) return;
    setSaving(true);
    try {
      if (isNew) {
        const res = await fetch("/api/zakazky", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ values: editData }),
        });
        if (!res.ok) throw new Error();
        setRows((prev) => [...prev, [...editData]]);
      } else {
        const res = await fetch("/api/zakazky", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rowIndex: selectedRow.rowIndex, values: editData }),
        });
        if (!res.ok) throw new Error();
        setRows((prev) =>
          prev.map((r, i) => (i === selectedRow.rowIndex - 2 ? [...editData] : r))
        );
      }
      closeModal();
    } catch {
      alert(isNew ? "Chyba pri pridávaní" : "Chyba pri ukladaní");
    } finally {
      setSaving(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      closeModal();
    }
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

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-default-900">Zákazky</h1>
        <p className="text-default-500 mt-1">{rows.length} záznamov · {colCount} stĺpcov</p>
      </div>

      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <span className="text-sm text-default-500">
            Zobrazené: <span className="font-semibold text-default-900">{filtrovane.length}</span>
            {search.trim() && " (filtrované — celá tabuľka)"}
          </span>
          <button
            onClick={openNewModal}
            className="px-4 py-2 text-sm rounded-xl bg-[#7DC8E8] text-white font-semibold hover:bg-[#5bb8dc] transition-colors"
          >
            + Nová škoda
          </button>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-default-400 font-semibold pointer-events-none">
              Riešiteľ:
            </span>
            <input
              type="text"
              value={filterRiesitel}
              onChange={(e) => setFilterRiesitel(e.target.value)}
              placeholder="meno..."
              className="border border-default-300 rounded-xl pl-16 pr-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8] w-44"
            />
            {filterRiesitel && (
              <button
                onClick={() => setFilterRiesitel("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-default-400 hover:text-default-700 text-base leading-none"
              >
                ×
              </button>
            )}
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Hľadať v celej tabuľke..."
            className="border border-default-300 rounded-xl px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8] w-64"
          />
        </div>
      </div>

      <div className="border border-default-200 rounded-2xl overflow-hidden bg-background">
        <div className="overflow-x-auto">
          <table className="text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-default-200 bg-default-50">
                <th className="sticky left-0 z-10 bg-default-50 px-3 py-3 font-semibold text-default-400 border-r border-default-200">#</th>
                {Array.from({ length: colCount }, (_, i) => (
                  <th key={i} className="px-3 py-3 font-semibold text-default-600 text-center min-w-[80px]">
                    {headers[i] || i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtrovane.length === 0 ? (
                <tr>
                  <td colSpan={colCount + 1} className="text-center py-10 text-default-400">
                    Žiadne záznamy
                  </td>
                </tr>
              ) : (
                filtrovane.map((row, ri) => {
                  const originalIndex = rows.indexOf(row);
                  return (
                    <tr
                      key={ri}
                      onClick={() => openModal(row, originalIndex)}
                      className={`border-b border-default-100 hover:bg-[#7DC8E8]/10 cursor-pointer transition-colors ${ri % 2 === 0 ? "" : "bg-default-50/30"}`}
                    >
                      <td className="sticky left-0 z-10 bg-inherit px-3 py-2 text-default-400 font-mono border-r border-default-100 text-center">
                        {ri + 1}
                      </td>
                      {Array.from({ length: colCount }, (_, ci) => (
                        <td key={ci} className="px-3 py-2 text-default-700 max-w-[200px] truncate">
                          {row[ci] || ""}
                        </td>
                      ))}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {selectedRow && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleBackdrop}
        >
          <div
            ref={modalRef}
            className="bg-background border border-default-200 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-default-200">
              <h2 className="text-lg font-bold text-default-900">{isNew ? "Nová škoda" : "Detail zákazky"}</h2>
              <button
                onClick={closeModal}
                className="text-default-400 hover:text-default-700 text-xl font-bold transition-colors"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 space-y-3">
              {Array.from({ length: colCount }, (_, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-default-500 uppercase tracking-wide">
                    {headers[i] || `Stĺpec ${i + 1}`}
                  </label>
                  <input
                    type="text"
                    value={editData[i] || ""}
                    onChange={(e) => {
                      const updated = [...editData];
                      updated[i] = e.target.value;
                      setEditData(updated);
                    }}
                    className="border border-default-300 rounded-lg px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8] transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-default-200">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm rounded-xl border border-default-300 text-default-700 hover:bg-default-100 transition-colors"
              >
                Zrušiť
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 text-sm rounded-xl bg-[#7DC8E8] text-white font-semibold hover:bg-[#5bb8dc] disabled:opacity-50 transition-colors"
              >
                {saving ? (isNew ? "Pridávam..." : "Ukladám...") : (isNew ? "Pridať" : "Uložiť")}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
