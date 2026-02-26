"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function badgeClass(status?: string) {
  switch (status) {
    case "NEW":
      return "bg-gray-100 text-gray-700";
    case "NEEDS_REVIEW":
      return "bg-orange-100 text-orange-800";
    case "READY_TO_SEND":
      return "bg-blue-100 text-blue-800";
    case "SENT":
      return "bg-green-100 text-green-800";
    case "ERROR":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export default function MessageListItem({
  id,
  title,
  subtitle,
  date,
  status,
}: {
  id: string;
  title: string;
  subtitle?: string | null;
  date?: string;
  status?: string;
}) {
  const pathname = usePathname();
  const href = `/inbox/${id}`;
  const active = pathname === href;

  return (
    <Link
      href={href}
      className={[
        "block rounded-lg px-3 py-3 text-sm transition",
        "hover:bg-gray-50",
        active ? "bg-gray-100 ring-1 ring-gray-200" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="truncate font-medium">{title}</div>

        {status && (
          <span
            className={[
              "rounded-full px-2 py-0.5 text-xs font-medium",
              badgeClass(status),
            ].join(" ")}
          >
            {status.replaceAll("_", " ")}
          </span>
        )}
      </div>

      {subtitle && (
        <div className="mt-1 truncate text-xs text-gray-500">
          {subtitle}
        </div>
      )}

      {date && (
        <div className="mt-1 text-xs text-gray-400">
          {new Date(date).toLocaleString()}
        </div>
      )}
    </Link>
  );
}