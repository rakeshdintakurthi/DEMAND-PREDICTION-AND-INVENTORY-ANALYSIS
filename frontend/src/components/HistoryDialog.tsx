import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useState, useEffect } from 'react';
import { X, Database, Loader2, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import { api } from '../services/api';

interface HistoryDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

interface HistoryBatch {
    id: number;
    archived_at: string;
    record_count: number;
    total_revenue: number;
    records: any[];
}

export function HistoryDialog({ isOpen, onClose }: HistoryDialogProps) {
    const [batches, setBatches] = useState<HistoryBatch[]>([]);
    const [selectedBatch, setSelectedBatch] = useState<HistoryBatch | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            fetchHistory();
            setSelectedBatch(null);
        }
    }, [isOpen]);

    const fetchHistory = async () => {
        setLoading(true);
        setError('');
        try {
            const historyData = await api.getHistory();
            setBatches(historyData);
        } catch (err) {
            console.error("Failed to fetch history", err);
            setError("Failed to load history data.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all h-[80vh] flex flex-col">
                                <div className="flex items-center justify-between mb-6 shrink-0">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2"
                                    >
                                        <Database className="h-5 w-5 text-primary" />
                                        {selectedBatch ? (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSelectedBatch(null)}
                                                    className="hover:bg-slate-100 p-1 rounded-full transition-colors"
                                                >
                                                    <ArrowLeft className="h-4 w-4" />
                                                </button>
                                                <span>Session Details: {selectedBatch.archived_at}</span>
                                            </div>
                                        ) : (
                                            "Archived Data History"
                                        )}
                                    </Dialog.Title>
                                    <button
                                        onClick={onClose}
                                        className="rounded-full p-1 hover:bg-slate-100 transition-colors"
                                    >
                                        <X className="h-5 w-5 text-gray-500" />
                                    </button>
                                </div>

                                {loading ? (
                                    <div className="flex flex-col items-center justify-center flex-1 text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                                        <p>Loading records from database...</p>
                                    </div>
                                ) : error ? (
                                    <div className="p-4 rounded-lg bg-red-50 text-red-600 border border-red-100 text-center">
                                        {error}
                                    </div>
                                ) : (
                                    <div className="flex-1 overflow-hidden flex flex-col">
                                        {!selectedBatch ? (
                                            <div className="overflow-auto border rounded-lg">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                                        <tr>
                                                            <th className="px-6 py-3">Archived Date</th>
                                                            <th className="px-6 py-3 text-right">Records Count</th>
                                                            <th className="px-6 py-3 text-right">Total Revenue</th>
                                                            <th className="px-6 py-3 text-center">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {batches.length === 0 ? (
                                                            <tr>
                                                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">
                                                                    <div className="flex flex-col items-center gap-2">
                                                                        <Calendar className="h-8 w-8 opacity-20" />
                                                                        <p>No history found.</p>
                                                                        <p className="text-xs">Cleared data will appear here.</p>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ) : (
                                                            batches.map((batch) => (
                                                                <tr key={batch.id} className="bg-white border-b hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedBatch(batch)}>
                                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                                        {batch.archived_at}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right">
                                                                        <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-semibold">
                                                                            {batch.record_count} Records
                                                                        </span>
                                                                    </td>
                                                                    <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                                                        ₹{batch.total_revenue.toLocaleString()}
                                                                    </td>
                                                                    <td className="px-6 py-4 text-center">
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedBatch(batch);
                                                                            }}
                                                                            className="text-primary hover:text-primary/80 font-medium text-xs flex items-center justify-center gap-1 mx-auto"
                                                                        >
                                                                            View Details <ChevronRight className="h-3 w-3" />
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        ) : (
                                            <div className="overflow-auto border rounded-lg h-full">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                                        <tr>
                                                            <th className="px-6 py-3">Date</th>
                                                            <th className="px-6 py-3">Product</th>
                                                            <th className="px-6 py-3">Region</th>
                                                            <th className="px-6 py-3 text-right">Units Sold</th>
                                                            <th className="px-6 py-3 text-right">Price</th>
                                                            <th className="px-6 py-3 text-right">Inventory</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {selectedBatch.records.map((row, idx) => (
                                                            <tr key={idx} className="bg-white border-b hover:bg-gray-50">
                                                                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                                                    {row.date}
                                                                </td>
                                                                <td className="px-6 py-4">{row.product}</td>
                                                                <td className="px-6 py-4">
                                                                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded capitalize">
                                                                        {row.region}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4 text-right font-medium">{row.units_sold}</td>
                                                                <td className="px-6 py-4 text-right">₹{row.price}</td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <span className={`px-2 py-1 rounded text-xs font-medium ${row.inventory < 20 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                                                                        {row.inventory} Units
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="mt-6 flex justify-end shrink-0 pt-4 border-t">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center rounded-md border border-transparent bg-slate-100 px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2"
                                        onClick={onClose}
                                    >
                                        Close
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
