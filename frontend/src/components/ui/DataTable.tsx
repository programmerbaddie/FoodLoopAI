import React from 'react';

interface DataTableProps {
  headers: string[];
  children: React.ReactNode;
  isEmpty?: boolean;
  emptyMessage?: string;
  className?: string;
}

export const DataTable: React.FC<DataTableProps> = ({
  headers,
  children,
  isEmpty = false,
  emptyMessage = 'No records found matching criteria.',
  className = '',
}) => {
  return (
    <div className={`overflow-x-auto rounded-lg border border-foodloop-border dark:border-foodloop-borderDark bg-white dark:bg-foodloop-surfaceDark shadow-2xs ${className}`}>
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 dark:bg-slate-800 border-b border-foodloop-border dark:border-foodloop-borderDark text-foodloop-navyMuted dark:text-slate-300 uppercase font-semibold text-[11px] tracking-wider">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} scope="col" className="px-4 py-3 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-foodloop-border dark:divide-foodloop-borderDark text-slate-800 dark:text-slate-200">
          {isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-foodloop-textMuted dark:text-foodloop-textMutedDark">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};
