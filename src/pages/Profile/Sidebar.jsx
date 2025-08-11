export default function Sidebar({ section, onSelect }) {
  return (
    <aside className="w-[260px] shrink-0 rounded-md border bg-muted/30 p-3">
      <nav className="space-y-1">
        <button
          className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
            section === 'details' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          onClick={() => onSelect('details')}
        >
          Date
        </button>
        <button
          className={`w-full rounded-md px-3 py-2 text-left text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground ${
            section === 'payments' ? 'bg-accent text-accent-foreground' : 'text-muted-foreground'
          }`}
          onClick={() => onSelect('payments')}
        >
          Metode de plată
        </button>
      </nav>
    </aside>
  )
}

