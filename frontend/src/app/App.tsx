import { useState } from "react";

import { useHealthQuery, useVersionQuery } from "@/features/encounter-builder/api/system";

export default function App() {
  // Minimal local state placeholders for MVP layout
  const [selectedMonsters, setSelectedMonsters] = useState<{ id: string; name: string; count: number }[]>([]);

  // NEU: Hooks aufrufen → health/version existieren
  const health = useHealthQuery();
  const version = useVersionQuery();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <h1 className="text-xl font-semibold">Arcanalyse — MVP</h1>
          <p className="text-sm text-gray-600">Encounter builder (baseline). API integration comes next.</p>
          <div className="mt-2 text-xs text-gray-500">
            API: {health.isSuccess ? health.data.status : "…"} · {version.isSuccess ? `${version.data.name} ${version.data.version} (${version.data.env})` : "…"}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-3">
        {/* Monster list placeholder */}
        <section className="md:col-span-2 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium">Monsters</h2>
            <input
              className="rounded-md border px-3 py-1 text-sm outline-none focus:ring"
              placeholder="Suche nach Name..."
              aria-label="search"
            />
          </div>
          <div className="text-sm text-gray-600">
            <p>List placeholder. We will fetch from API soon.</p>
          </div>
        </section>

        {/* Encounter panel placeholder */}
        <aside className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-medium">Encounter</h2>
          {selectedMonsters.length === 0 ? (
            <p className="text-sm text-gray-600">No monsters selected.</p>
          ) : (
            <ul className="space-y-2">
              {selectedMonsters.map((m) => (
                <li key={m.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <span>{m.name}</span>
                  <span className="text-gray-500">x{m.count}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4">
            <button className="w-full rounded-lg bg-gray-900 px-3 py-2 text-white hover:bg-gray-800">
              Evaluate encounter
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
