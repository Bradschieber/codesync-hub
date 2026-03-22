/**
 * Reusable legal acceptance block.
 *
 * Props:
 *   checkboxes: Array<{ id: string, label: ReactNode, required?: boolean }>
 *   checked: Record<string, boolean>
 *   onChange: (id: string, value: boolean) => void
 *   smallPrint?: string
 */
export default function LegalAcceptanceBlock({ checkboxes, checked, onChange, smallPrint }) {
  return (
    <div className="border p-4 space-y-3" style={{ borderColor: "#E3E0D8", backgroundColor: "#FDFCFA" }}>
      {checkboxes.map(({ id, label, required = true }) => (
        <label key={id} className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={checked[id] || false}
            onChange={e => onChange(id, e.target.checked)}
            className="mt-0.5 h-4 w-4 flex-shrink-0 cursor-pointer"
            style={{ accentColor: "#2F3E55" }}
          />
          <span className="text-sm leading-snug" style={{ color: "#2A2A2A" }}>
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </span>
        </label>
      ))}
      {smallPrint && (
        <p className="text-xs pt-1" style={{ color: "#9A9A9A", borderTop: "1px solid #EEEBE5", paddingTop: "10px", marginTop: "10px" }}>
          {smallPrint}
        </p>
      )}
    </div>
  );
}