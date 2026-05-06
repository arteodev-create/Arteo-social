import React from 'react';
import { Plus, Gear, PencilSimple, Trash } from '@phosphor-icons/react';

interface DatabaseExplorerTabProps {
    selectedTable: string;
    tableData: any[];
    tableSchema: any[];
    setEditingColumn: (col: any) => void;
    handleDeleteRow: (row: any) => void;
    setIsInsertModalOpen: (open: boolean) => void;
    setIsTableSettingsOpen: (open: boolean) => void;
}

export const DatabaseExplorerTab: React.FC<DatabaseExplorerTabProps> = ({
    selectedTable,
    tableData,
    tableSchema,
    setEditingColumn,
    handleDeleteRow,
    setIsInsertModalOpen,
    setIsTableSettingsOpen
}) => {
    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-black animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-12 shrink-0">
                <div className="flex items-center gap-6">
                    <div className="px-4 py-2 bg-white text-black rounded-[8px]">
                        <span className="text-[14px] font-bold">{selectedTable}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[18px] font-bold text-white leading-none mb-1">{tableData.length} records</span>
                        <span className="text-[12px] text-zinc-500 font-bold">Core database</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsInsertModalOpen(true)}
                        className="h-10 px-6 bg-white text-black rounded-[8px] font-bold text-[12px] active:scale-95 transition-all flex items-center gap-2"
                    >
                        <Plus size={16} weight="bold" />
                        Add record
                    </button>
                    <button
                        onClick={() => setIsTableSettingsOpen(true)}
                        className="h-10 px-6 bg-zinc-900 border border-white/10 text-white rounded-[8px] font-bold text-[12px] active:scale-95 transition-all flex items-center gap-2 hover:bg-white hover:text-black hover:border-white"
                    >
                        <Gear size={16} weight="bold" />
                        Settings
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto no-scrollbar bg-black border border-white/5 rounded-[8px]">
                <table className="w-full text-left border-collapse min-w-max">
                    <thead className="sticky top-0 z-20 bg-zinc-900/50  border-b border-white/10">
                        <tr>
                            {tableSchema.map(col => (
                                <th key={col.name} className="px-6 py-5 border-r border-white/5">
                                    <div className="flex items-center justify-between gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-[12px] font-bold text-white">{col.name}</span>
                                            <span className="text-[10px] font-bold text-zinc-500">{col.type}</span>
                                        </div>
                                        <button
                                            onClick={() => setEditingColumn(col)}
                                            className="p-1.5 rounded-[8px] text-zinc-600 hover:text-white transition-all"
                                        >
                                            <PencilSimple size={14} weight="bold" />
                                        </button>
                                    </div>
                                </th>
                            ))}
                            <th className="px-6 py-5 w-20 text-center">
                                <Gear size={18} weight="bold" className="text-zinc-700 mx-auto" />
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {tableData.length > 0 ? tableData.map((row, idx) => (
                            <tr key={idx} className="group hover:bg-white/[0.02] transition-colors">
                                {tableSchema.map(col => (
                                    <td key={col.name} className="px-6 py-5 border-r border-white/5 max-w-[300px]">
                                        <div className="text-[13px] font-bold text-zinc-400 truncate">
                                            {row[col.name]?.toString() || <span className="text-zinc-800">empty</span>}
                                        </div>
                                    </td>
                                ))}
                                <td className="px-6 py-5 text-center">
                                    <button
                                        onClick={() => handleDeleteRow(row)}
                                        className="p-2 text-zinc-700 hover:text-white transition-all active:scale-90"
                                    >
                                        <Trash size={18} weight="bold" />
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={tableSchema.length + 1} className="py-24 text-center">
                                    <p className="text-[14px] text-zinc-600 font-bold">No data in this table.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
