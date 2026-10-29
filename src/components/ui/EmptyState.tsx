import React from "react";
import { BoxIcon } from "lucide-react";
interface EmptyStateProps {
  icon: BoxIcon;
  title: string;
  message?: string;
  action?: React.ReactNode;
}
export function EmptyState({
  icon: Icon,
  title,
  message,
  action
}: EmptyStateProps) {
  return <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full border border-line">
        <Icon className="h-5 w-5 text-muted" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-fg">{title}</h3>
      {message && <p className="mt-1.5 max-w-sm text-sm text-muted">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>;
}