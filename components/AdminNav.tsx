import Link from "next/link";

const LINKS = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/dispatch", label: "Dispatch" },
  { href: "/admin/services", label: "Pricing" },
];

export default function AdminNav({ current }: { current: string }) {
  return (
    <nav aria-label="Admin" className="mb-6 flex gap-2 overflow-x-auto border-b border-gray-100 pb-3">
      {LINKS.map((l) => (
        <Link key={l.href} href={l.href} aria-current={current === l.href ? "page" : undefined}
          className={`flex h-11 shrink-0 items-center rounded-lg px-4 text-sm font-semibold ${
            current === l.href ? "bg-brand-700 text-white" : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}>
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
