
import { ShieldCheck, Clock3, AlertTriangle, XCircle } from "lucide-react";

const verificationConfig = {
  verified: {
    label: "Verified",
    icon: ShieldCheck,
    className: "bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0]",
  },

  pending: {
    label: "Pending Review",
    icon: Clock3,
    className: "bg-[#FFF7ED] text-[#B45309] border-[#FED7AA]",
  },

  under_review: {
    label: "Under Review",
    icon: Clock3,
    className: "bg-[#FFF7ED] text-[#B45309] border-[#FED7AA]",
  },

  needs_information: {
    label: "More Information Needed",
    icon: AlertTriangle,
    className: "bg-[#FFF7ED] text-[#B45309] border-[#FED7AA]",
  },

  rejected: {
    label: "Not Verified",
    icon: XCircle,
    className: "bg-[#FEF2F2] text-[#B91C1C] border-[#FECACA]",
  },
};

function VerificationBadge({
  status = "pending",
  size = "default",
}) {
  const config =
    verificationConfig[status] || verificationConfig.pending;

  const Icon = config.icon;

  const sizeClass =
    size === "small"
      ? "px-2.5 py-1 text-[11px]"
      : "px-3 py-1.5 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${sizeClass} ${config.className}`}
    >
      <Icon size={size === "small" ? 13 : 14} />
      {config.label}
    </span>
  );
}

export default VerificationBadge;

