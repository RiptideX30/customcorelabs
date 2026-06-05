import { STATUS_LABELS, STATUS_ICONS, STATUS_COLORS, type BuildStatus } from "@/lib/build-tracker";

export default function BuildStatusBadge({
  status,
  className = "",
}: {
  status: BuildStatus;
  className?: string;
}) {
  const colors = STATUS_COLORS[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${colors} ${className}`}
    >
      <span className="text-[13px]">{STATUS_ICONS[status]}</span>
      {STATUS_LABELS[status]}
    </span>
  );
}