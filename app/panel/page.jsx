"use client";
import { useEffect, useMemo, useState } from "react";

export default function Panel() {
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [savingCode, setSavingCode] = useState(null);

  // Cargar unidades desde la API
  const load = async () => {
    const r = await fetch("/api/units", { cache: "no-store" });
    const data = await r.json();
    setRows(Array.isArray(data) ? data : []);
  };

  useEffect(() => { load(); }, []);

  // Filtros básicos
  const filtered = useMemo(() => {
    return rows.filter(r => {
      const okQ = q ? r.code.toLowerCase().includes(q.toLowerCase()) : true;
      const okS = statusFilter === "todos" ? true : r.status === statusFilter;
      return okQ && okS;
    });
  }, [rows, q, statusFilter]);

  // Edición in-line
  const updateField = (code, field, value) => {
    setRows(prev => prev.map(r => r.code === code ? { ...r, [field]: value } : r));
  };

  const saveRow = async (row) => {
    setSavingCode(row.code);
    try {
      const res = await fetch("/api/units", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: row.code, price: row.price, status: row.status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Error guardando");
      }
      const saved = await res.json();
      setRows(prev => prev.map(r => r.code === saved.code ? saved : r));
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingCode(null);
    }
  };

  // Utilidad
  const fmtUSD = (v) => {
    if (v === null || v === undefined || v === "") return "";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    try {
      return new Intl.NumberFormat("es-HN", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);
    } catch {
      return `$${n.toFixed(2)}`;
    }
  };

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Panel interno — Unidades</h1>

      <div className="flex gap-3 items-center flex-wrap">
        <input
          className="border px-3 py-2 rounded"
          placeholder="Buscar por código (ej. 3C)…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos</option>
          <option value="disponible">Disponible</option>
          <option value="reservado">Reservado</option>
          <option value="vendido">Vendido</option>
        </select>
        <button className="border px-3 py-2 rounded" onClick={load}>Recargar</button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2 pr-4">Código</th>
              <th className="py-2 pr-4">Estado</th>
              <th className="py-2 pr-4">Precio</th>
              <th className="py-2 pr-4">Actualizado</th>
              <th className="py-2 pr-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.code} className="border-b">
                <td className="py-2 pr-4 font-medium">{r.code}</td>
                <td className="py-2 pr-4">
                  <select
                    className="border px-2 py-1 rounded"
                    value={r.status}
                    onChange={e => updateField(r.code, "status", e.target.value)}
                  >
                    <option value="disponible">Disponible</option>
                    <option value="reservado">Reservado</option>
                    <option value="vendido">Vendido</option>
                  </select>
                </td>
                <td className="py-2 pr-4">
                  <input
                    className="border px-2 py-1 rounded w-40"
                    type="number"
                    step="0.01"
                    value={r.price ?? 0}
                    onChange={e => updateField(r.code, "price", e.target.value)}
                    onBlur={e => updateField(r.code, "price", Number(e.target.value))}
                  />
                  <div style={{ opacity:.7 }}>{fmtUSD(r.price)}</div>
                </td>
                <td className="py-2 pr-4" title={r.updated_at || ""}>
                  {r.updated_at ? new Date(r.updated_at).toLocaleString("es-HN") : "—"}
                </td>
                <td className="py-2 pr-4">
                  <button
                    className="border px-3 py-1 rounded"
                    disabled={savingCode === r.code}
                    onClick={() => saveRow(r)}
                  >
                    {savingCode === r.code ? "Guardando…" : "Guardar"}
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td className="py-4" colSpan={5}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
