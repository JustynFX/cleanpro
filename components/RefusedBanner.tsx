import { ShieldAlert } from "lucide-react";

export default function RefusedBanner({ error }: { error?: string }) {
  if (error !== "refused_access_unauthorized_role") return null;
  return (
    <div role="alert" className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <ShieldAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <p><strong>Access refused.</strong> Your account does not have permission to open that page. You have been sent back to your own area.</p>
    </div>
  );
}
