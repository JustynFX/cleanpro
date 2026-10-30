const STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-900",
  Paid: "bg-green-100 text-green-900",
  Assigned: "bg-blue-100 text-blue-900",
  "In Progress": "bg-indigo-100 text-indigo-900",
  Completed: "bg-emerald-100 text-emerald-900",
  Cancelled: "bg-gray-200 text-gray-800",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${STYLES[status] ?? "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}
