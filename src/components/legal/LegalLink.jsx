/**
 * Opens a legal document in a new tab without disrupting the current flow.
 */
export default function LegalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="underline font-semibold transition-colors"
      style={{ color: "#2F3E55", textUnderlineOffset: "2px" }}
      onMouseEnter={e => e.currentTarget.style.color = "#1A2A3A"}
      onMouseLeave={e => e.currentTarget.style.color = "#2F3E55"}
      onClick={e => e.stopPropagation()}
    >
      {children}
    </a>
  );
}