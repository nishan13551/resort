import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TableRow {
  [key: string]: ReactNode;
}

interface ColumnDef {
  key: string;
  header: string;
  className?: string;
}

export function DataTable({
  columns,
  rows,
  onRowClick,
  emptyMessage = '—',
}: {
  columns: ColumnDef[];
  rows: TableRow[];
  onRowClick?: (row: TableRow, index: number) => void;
  emptyMessage?: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50">
            {columns.map(col => (
              <th
                key={col.key}
                className={cn('px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500', col.className)}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr
                key={String(row.key ?? i)}
                onClick={() => onRowClick?.(row, i)}
                className={cn(
                  'border-b border-slate-100 transition-colors',
                  onRowClick ? 'cursor-pointer hover:bg-slate-50' : 'hover:bg-slate-50'
                )}
              >
                {columns.map(col => (
                  <td key={col.key} className={cn('px-4 py-3 text-slate-700', col.className)}>
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}