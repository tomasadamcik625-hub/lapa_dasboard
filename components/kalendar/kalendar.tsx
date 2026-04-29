"use client";
import React, { useEffect, useState, useMemo, useRef } from "react";

const YEAR = 2026;

const MONTH_NAMES = [
  "Január", "Február", "Marec", "Apríl", "Máj", "Jún",
  "Júl", "August", "September", "Október", "November", "December",
];

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const PREDEFINED = [
  { label: "Dovolenka", value: "D", cls: "bg-green-100 text-green-800 border-green-200" },
  { label: "Prac. neschopnosť", value: "PN", cls: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { label: "Služobná cesta", value: "S", cls: "bg-blue-100 text-blue-800 border-blue-200" },
  { label: "Náhradné voľno", value: "NV", cls: "bg-purple-100 text-purple-800 border-purple-200" },
  { label: "OČR", value: "OČR", cls: "bg-orange-100 text-orange-800 border-orange-200" },
  { label: "Víkend/Sviatok", value: "X", cls: "bg-default-100 text-default-500 border-default-200" },
  { label: "Vlastný text", value: "__custom__", cls: "bg-background text-default-700 border-default-300" },
];

const CELL_COLORS: Record<string, string> = {
  D: "bg-green-100 text-green-800", d: "bg-green-100 text-green-800",
  PN: "bg-yellow-100 text-yellow-800", pn: "bg-yellow-100 text-yellow-800",
  N: "bg-yellow-100 text-yellow-800", n: "bg-yellow-100 text-yellow-800",
  S: "bg-blue-100 text-blue-800", s: "bg-blue-100 text-blue-800",
  NV: "bg-purple-100 text-purple-800", nv: "bg-purple-100 text-purple-800",
  OČR: "bg-orange-100 text-orange-800", očr: "bg-orange-100 text-orange-800",
  X: "bg-default-100 text-default-400", x: "bg-default-100 text-default-400",
};

function getCellColor(val: string) {
  const t = val.trim();
  return CELL_COLORS[t] || (t ? "bg-red-50 text-red-700" : "");
}

function parseHeaderDate(header: string): { month: number; day: number } | null {
  if (!header) return null;
  const m1 = header.match(/^(\d{1,2})\.(\d{1,2})/);
  if (m1) {
    const day = parseInt(m1[1]);
    const month = parseInt(m1[2]) - 1;
    if (month >= 0 && month <= 11 && day >= 1 && day <= 31) return { month, day };
  }
  const m2 = header.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (m2) return { month: parseInt(m2[1]) - 1, day: parseInt(m2[2]) };
  return null;
}

interface DayColumn {
  colIndex: number;
  month: number;
  day: number;
  label: string;
  isToday: boolean;
  isWeekend: boolean;
}

function toDateStr(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export const Kalendar = () => {
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<string[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeMonth, setActiveMonth] = useState<number>(new Date().getMonth());
  const [userName, setUserName] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedName, setSelectedName] = useState("");
  const [eventFrom, setEventFrom] = useState(`${YEAR}-01-01`);
  const [eventTo, setEventTo] = useState(`${YEAR}-01-01`);
  const [eventType, setEventType] = useState("D");
  const [customText, setCustomText] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date();
    if (today.getFullYear() === YEAR) {
      setActiveMonth(today.getMonth());
      setEventFrom(toDateStr(YEAR, today.getMonth(), today.getDate()));
      setEventTo(toDateStr(YEAR, today.getMonth(), today.getDate()));
    }

    Promise.all([
      fetch("/api/kalendar").then((r) => r.json()),
      fetch("/api/me").then((r) => r.json()),
    ]).then(([cal, me]) => {
      if (!cal.error) {
        setHeaders(cal.headers || []);
        setRows(cal.rows || []);
      } else {
        setError(cal.error);
      }
      setUserName(me.name || null);
      setLoading(false);
    }).catch(() => { setError("Chyba načítania"); setLoading(false); });
  }, []);

  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDay = today.getDate();
  const todayYear = today.getFullYear();

  const dayColumns = useMemo<DayColumn[]>(() => {
    const cols: DayColumn[] = [];
    let inferMonth = 0;
    let inferDay = 1;

    for (let i = 1; i < headers.length; i++) {
      const parsed = parseHeaderDate(headers[i]);
      let month: number;
      let day: number;
      if (parsed) {
        month = parsed.month;
        day = parsed.day;
      } else {
        month = inferMonth;
        day = inferDay;
      }
      inferDay++;
      if (inferDay > DAYS_IN_MONTH[inferMonth]) { inferDay = 1; inferMonth = (inferMonth + 1) % 12; }

      const d = new Date(YEAR, month, day);
      const dow = d.getDay();
      cols.push({
        colIndex: i,
        month,
        day,
        label: String(day),
        isToday: todayYear === YEAR && todayMonth === month && todayDay === day,
        isWeekend: dow === 0 || dow === 6,
      });
    }

    if (cols.length === 0) {
      let colIdx = 1;
      for (let m = 0; m < 12; m++) {
        for (let d = 1; d <= DAYS_IN_MONTH[m]; d++) {
          const date = new Date(YEAR, m, d);
          const dow = date.getDay();
          cols.push({
            colIndex: colIdx++,
            month: m,
            day: d,
            label: String(d),
            isToday: todayYear === YEAR && todayMonth === m && todayDay === d,
            isWeekend: dow === 0 || dow === 6,
          });
        }
      }
    }
    return cols;
  }, [headers, todayDay, todayMonth, todayYear]);

  const monthGroups = useMemo(() => {
    const groups: { month: number; cols: DayColumn[] }[] = [];
    for (let m = 0; m < 12; m++) {
      const cols = dayColumns.filter((c) => c.month === m);
      if (cols.length > 0) groups.push({ month: m, cols });
    }
    return groups;
  }, [dayColumns]);

  const visibleCols = monthGroups.find((g) => g.month === activeMonth)?.cols ?? monthGroups[0]?.cols ?? [];

  // Build calendar grid (Mon=0 ... Sun=6)
  const calendarWeeks = useMemo(() => {
    if (visibleCols.length === 0) return [];
    const firstDate = new Date(YEAR, activeMonth, 1);
    const startDow = (firstDate.getDay() + 6) % 7; // Mon=0, Sun=6
    const weeks: (DayColumn | null)[][] = [];
    let week: (DayColumn | null)[] = Array(startDow).fill(null);
    for (const col of visibleCols) {
      week.push(col);
      if (week.length === 7) { weeks.push(week); week = []; }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      weeks.push(week);
    }
    return weeks;
  }, [visibleCols, activeMonth]);

  // Events per day: day number → list of {name, value, colorCls}
  const dayEvents = useMemo(() => {
    const map: Record<number, { name: string; value: string; colorCls: string }[]> = {};
    for (const col of visibleCols) {
      const evs: { name: string; value: string; colorCls: string }[] = [];
      for (const row of rows) {
        const val = (row[col.colIndex] || "").trim();
        if (val && val.toUpperCase() !== "X") {
          evs.push({ name: row[0] || "", value: val, colorCls: getCellColor(val) });
        }
      }
      map[col.day] = evs;
    }
    return map;
  }, [visibleCols, rows]);

  const openModal = (dateStr?: string) => {
    setSaveError("");
    if (dateStr) { setEventFrom(dateStr); setEventTo(dateStr); }
    if (!selectedName && rows.length > 0) setSelectedName(rows[0][0] || "");
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setSaveError(""); };

  const handleBackdrop = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) closeModal();
  };

  const handleSave = async () => {
    if (!selectedName.trim()) { setSaveError("Vyber meno zamestnanca"); return; }
    const value = eventType === "__custom__" ? customText.trim() : eventType;
    if (!value) { setSaveError("Zadaj hodnotu udalosti"); return; }

    const from = new Date(eventFrom);
    const to = new Date(eventTo);
    if (from > to) { setSaveError("Dátum 'od' musí byť pred dátumom 'do'"); return; }

    const matchedCols = dayColumns.filter((c) => {
      const d = new Date(YEAR, c.month, c.day);
      return d >= from && d <= to;
    });
    if (matchedCols.length === 0) { setSaveError("Vybrané dátumy sa nenašli v tabuľke"); return; }

    const startColIndex = matchedCols[0].colIndex;
    const endColIndex = matchedCols[matchedCols.length - 1].colIndex;

    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/kalendar", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startColIndex, endColIndex, value, rowName: selectedName }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error || "Chyba zápisu"); return; }

      const targetRowIndex = rows.findIndex(
        (r) => (r[0] || "").trim().toLowerCase() === selectedName.trim().toLowerCase()
      );
      setRows((prev) =>
        prev.map((row, ri) => {
          if (ri !== targetRowIndex) return row;
          const updated = [...row];
          for (const col of matchedCols) {
            while (updated.length <= col.colIndex) updated.push("");
            updated[col.colIndex] = value;
          }
          return updated;
        })
      );
      closeModal();
    } catch {
      setSaveError("Chyba zápisu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#7DC8E8] border-t-transparent rounded-full animate-spin" />
          <p className="text-default-500 text-sm">Načítavam kalendár...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-96">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-6 py-6 max-w-[90rem] mx-auto w-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-default-900">Kalendár {YEAR}</h1>
          <p className="text-default-500 mt-1">
            {rows.length} kolegov
            {userName && (
              <span className="ml-2 text-default-400">· prihlásený: <span className="font-medium text-default-600">{userName}</span></span>
            )}
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="px-4 py-2 text-sm rounded-xl bg-[#7DC8E8] text-white font-semibold hover:bg-[#5bb8dc] transition-colors"
        >
          + Pridať udalosť
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mb-5 text-xs">
        {[
          { label: "Dovolenka (D)", cls: "bg-green-100 text-green-800" },
          { label: "PN / Nemoc", cls: "bg-yellow-100 text-yellow-800" },
          { label: "Služobná cesta (S)", cls: "bg-blue-100 text-blue-800" },
          { label: "Náhradné voľno (NV)", cls: "bg-purple-100 text-purple-800" },
          { label: "OČR", cls: "bg-orange-100 text-orange-800" },
        ].map((item) => (
          <span key={item.label} className={`px-2 py-1 rounded-lg font-medium ${item.cls}`}>
            {item.label}
          </span>
        ))}
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setActiveMonth((m) => Math.max(0, m - 1))}
          className="px-3 py-1.5 rounded-xl bg-default-100 text-default-600 hover:bg-default-200 transition-colors text-sm font-semibold"
        >
          ‹ Predchádzajúci
        </button>
        <h2 className="text-xl font-bold text-default-900">
          {MONTH_NAMES[activeMonth]} {YEAR}
        </h2>
        <button
          onClick={() => setActiveMonth((m) => Math.min(11, m + 1))}
          className="px-3 py-1.5 rounded-xl bg-default-100 text-default-600 hover:bg-default-200 transition-colors text-sm font-semibold"
        >
          Nasledujúci ›
        </button>
      </div>

      {/* Quick month tabs */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {monthGroups.map(({ month }) => (
          <button
            key={month}
            onClick={() => setActiveMonth(month)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              activeMonth === month
                ? "bg-[#7DC8E8] text-white"
                : "bg-default-100 text-default-600 hover:bg-default-200"
            }`}
          >
            {MONTH_NAMES[month].slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="border border-default-200 rounded-2xl overflow-hidden bg-background">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-default-200 bg-default-50">
          {["Po", "Ut", "St", "Št", "Pi", "So", "Ne"].map((d, i) => (
            <div
              key={d}
              className={`py-2.5 text-center text-xs font-semibold ${
                i >= 5 ? "text-default-400" : "text-default-600"
              } ${i < 6 ? "border-r border-default-100" : ""}`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {calendarWeeks.map((week, wi) => (
          <div key={wi} className={`grid grid-cols-7 ${wi < calendarWeeks.length - 1 ? "border-b border-default-200" : ""}`}>
            {week.map((col, di) => {
              if (!col) {
                return (
                  <div
                    key={di}
                    className={`min-h-[100px] bg-default-50/40 ${di < 6 ? "border-r border-default-100" : ""}`}
                  />
                );
              }
              const events = dayEvents[col.day] || [];
              return (
                <div
                  key={di}
                  onClick={() => openModal(toDateStr(YEAR, activeMonth, col.day))}
                  className={`min-h-[100px] p-1.5 cursor-pointer transition-colors group
                    ${col.isWeekend ? "bg-default-50/60" : "bg-background"}
                    ${col.isToday ? "ring-2 ring-inset ring-[#7DC8E8]" : ""}
                    hover:bg-[#7DC8E8]/5
                    ${di < 6 ? "border-r border-default-100" : ""}
                  `}
                >
                  {/* Day number */}
                  <div className="flex justify-end mb-1">
                    <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                      col.isToday
                        ? "bg-[#7DC8E8] text-white"
                        : col.isWeekend
                        ? "text-default-400"
                        : "text-default-700"
                    }`}>
                      {col.day}
                    </span>
                  </div>

                  {/* Events */}
                  <div className="space-y-0.5">
                    {events.slice(0, 3).map((ev, ei) => (
                      <div
                        key={ei}
                        className={`text-[10px] leading-tight px-1.5 py-0.5 rounded-md truncate font-medium ${ev.colorCls}`}
                        title={`${ev.name}: ${ev.value}`}
                      >
                        <span className="font-bold">{ev.value}</span>
                        {" "}
                        <span className="opacity-80">{ev.name.split(" ").pop()}</span>
                      </div>
                    ))}
                    {events.length > 3 && (
                      <div className="text-[10px] text-default-400 px-1">
                        +{events.length - 3} ďalší
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Event modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={handleBackdrop}
        >
          <div
            ref={modalRef}
            className="bg-background border border-default-200 rounded-2xl shadow-2xl w-full max-w-md mx-4 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-default-200">
              <h2 className="text-lg font-bold text-default-900">Pridať udalosť</h2>
              <button onClick={closeModal} className="text-default-400 hover:text-default-700 text-xl font-bold transition-colors">×</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              <div>
                <label className="text-xs font-semibold text-default-500 uppercase tracking-wide block mb-1">Zamestnanec</label>
                <select
                  value={selectedName}
                  onChange={(e) => setSelectedName(e.target.value)}
                  className="w-full border border-default-300 rounded-lg px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8]"
                >
                  <option value="">— Vyber meno —</option>
                  {rows.map((row, i) => (
                    <option key={i} value={row[0] || ""}>{row[0] || `Riadok ${i + 1}`}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-default-500 uppercase tracking-wide block mb-1">Od</label>
                  <input
                    type="date"
                    value={eventFrom}
                    min={`${YEAR}-01-01`}
                    max={`${YEAR}-12-31`}
                    onChange={(e) => setEventFrom(e.target.value)}
                    className="w-full border border-default-300 rounded-lg px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8]"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-semibold text-default-500 uppercase tracking-wide block mb-1">Do</label>
                  <input
                    type="date"
                    value={eventTo}
                    min={`${YEAR}-01-01`}
                    max={`${YEAR}-12-31`}
                    onChange={(e) => setEventTo(e.target.value)}
                    className="w-full border border-default-300 rounded-lg px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8]"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-default-500 uppercase tracking-wide mb-2">Typ udalosti</p>
                <div className="grid grid-cols-2 gap-2">
                  {PREDEFINED.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setEventType(opt.value)}
                      className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all text-left ${
                        eventType === opt.value
                          ? `${opt.cls} ring-2 ring-offset-1 ring-[#7DC8E8]`
                          : `${opt.cls} opacity-70 hover:opacity-100`
                      }`}
                    >
                      {opt.value !== "__custom__" && <span className="font-bold mr-1">{opt.value}</span>}
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {eventType === "__custom__" && (
                <div>
                  <label className="text-xs font-semibold text-default-500 uppercase tracking-wide block mb-1">Vlastný text</label>
                  <input
                    type="text"
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Napíš hodnotu..."
                    maxLength={20}
                    className="w-full border border-default-300 rounded-lg px-3 py-2 text-sm bg-background text-default-900 focus:outline-none focus:border-[#7DC8E8]"
                  />
                </div>
              )}

              {saveError && (
                <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{saveError}</p>
              )}
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
                {saving ? "Zapisujem..." : "Zapísať"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
