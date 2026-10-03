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
    <div className={`overflow-x-auto rounded-lg border border-foodloop-border bg-white shadow-2xs ${className}`}>
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 border-b border-foodloop-border text-foodloop-navyMuted uppercase font-semibold text-[11px] tracking-wider">
          <tr>
            {headers.map((header, idx) => (
              <th key={idx} scope="col" className="px-4 py-3 whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-foodloop-border">
          {isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-foodloop-textMuted">
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
