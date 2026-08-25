export type TabId = "burns" | "method" | "cfg" | "don";

const TABS: { id: TabId; key: string; label: string }[] = [
  { id: "burns", key: "F1", label: "BURNS" },
  { id: "method", key: "F2", label: "METHODOLOGY" },
  { id: "cfg", key: "F3", label: "CONFIG" },
  { id: "don", key: "F4", label: "SUPPORT" },
];

export function TabBar({ tab, onTab }: { tab: TabId; onTab: (t: TabId) => void }) {
  return (
    <div className="my-3 flex flex-wrap gap-2">
      {TABS.map((t) => {
        const active = tab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onTab(t.id)}
            className="px-3 py-1 text-xs tracking-widest"
            style={{
              color: active ? "var(--perma-bg)" : "var(--perma-ice)",
              background: active ? "var(--perma-ice)" : "transparent",
              border: `1px solid ${active ? "var(--perma-ice)" : "var(--perma-dim)"}`,
              cursor: "pointer",
            }}
          >
            [{t.key}] {t.label}
          </button>
        );
      })}
    </div>
  );
}
