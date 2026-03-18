import D20Icon from "./D20Icon";

export default function Footer() {
  return (
    <footer className="border-t border-white/5 px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-6">
        <D20Icon className="h-6 w-6 text-accent/30" />
        <div className="flex gap-8 text-sm text-text-muted">
          <a href="/impressum" className="accent-link">
            Impressum
          </a>
          <a
            href="https://github.com/wediga/Arcanalyse"
            target="_blank"
            rel="noopener noreferrer"
            className="accent-link"
          >
            GitHub
          </a>
        </div>
        <span className="text-xs text-text-muted/50">
          &copy; {new Date().getFullYear()} Arcanalyse
        </span>
      </div>
    </footer>
  );
}
