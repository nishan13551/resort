'use client';

import { cn } from '@/lib/utils';
import { useLang } from '@/lib/i18n';

type BadgeTone = 'green' | 'yellow' | 'red' | 'blue' | 'slate' | 'gray';

const toneClasses: Record<BadgeTone, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  slate: 'bg-slate-100 text-slate-600',
  gray: 'bg-gray-100 text-gray-700',
};

export function Badge({
  className,
  tone = 'slate',
  children,
}: {
  className?: string;
  tone?: BadgeTone;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function RoomStatusBadge({ status }: { status: string }) {
  const { t } = useLang();
  if (status === 'available') {
    return (
      <Badge tone="green">
        <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
        {t('roomStatus.available')}
      </Badge>
    );
  }
  if (status === 'booked') {
    return (
      <Badge tone="yellow">
        <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
        {t('roomStatus.booked')}
      </Badge>
    );
  }
  if (status === 'occupied') {
    return (
      <Badge tone="red">
        <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
        {t('roomStatus.occupied')}
      </Badge>
    );
  }
  return (
    <Badge tone="slate">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      {status}
    </Badge>
  );
}