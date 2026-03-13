"use client";

import { useState } from "react";
import {
    CalendarDays,
    Download,
    ShieldCheck,
    Trash2,
    Edit,
    X,
    Save,
    FileText,
    FileSpreadsheet,
} from "lucide-react";
import Swal from "sweetalert2";
import { ref, remove, update } from "firebase/database";
import { db } from "../../../lib/firebase";
import { HistoryRecord } from "../../../types";

// Import fungsi pencetak dokumen yang baru kita buat
import { generateExcel, generatePDF } from "../utils/exportGenerator";

interface HistoryTableProps {
    isConnected: boolean;
    history: HistoryRecord[];
}

export default function HistoryTable({
    isConnected,
    history,
}: HistoryTableProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editNotes, setEditNotes] = useState<string>("");
    const [editDaysAchieved, setEditDaysAchieved] = useState<number | string>(
        "",
    );

    // --- FUNGSI EKSPOR TERPISAH ---
    const onExportExcel = () => {
        if (history.length === 0)
            return Swal.fire(
                "Log Kosong",
                "Belum ada data history untuk diekspor.",
                "info",
            );
        generateExcel(history);
    };

    const onExportPDF = async () => {
        if (history.length === 0)
            return Swal.fire(
                "Log Kosong",
                "Belum ada data history untuk dicetak.",
                "info",
            );

        // Munculkan animasi loading saat menyusun dokumen
        Swal.fire({
            title: "Menyusun Laporan...",
            text: "Merapikan tabel dan logo...",
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            },
        });

        try {
            // Tunggu PDF selesai digambar (termasuk logo)
            await generatePDF(history);
            // Tutup pop-up loading setelah file mulai diunduh
            Swal.close();
        } catch (error) {
            Swal.fire("Error", "Gagal mencetak dokumen PDF.", "error");
        }
    };
    // ------------------------------

    const startEditing = (record: HistoryRecord) => {
        setEditingId(record.id || "");
        setEditNotes(record.notes);
        setEditDaysAchieved(record.daysAchieved);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditNotes("");
        setEditDaysAchieved("");
    };

    const saveEditHistory = (id: string | undefined) => {
        if (!isConnected)
            return Swal.fire(
                "Koneksi Terputus!",
                "Tidak dapat menyimpan data.",
                "error",
            );

        if (!id)
            return Swal.fire("Error!", "ID Rekaman tidak ditemukan.", "error");

        const days = Number(editDaysAchieved);
        if (editDaysAchieved === "" || days < 0)
            return Swal.fire(
                "Peringatan!",
                "Angka hari tidak valid!",
                "warning",
            );
        if (!editNotes.trim())
            return Swal.fire(
                "Peringatan!",
                "Catatan tidak boleh kosong!",
                "warning",
            );

        const specificRecordRef = ref(
            db,
            `safety_board/imaschine_lab/history/${id}`,
        );
        update(specificRecordRef, { daysAchieved: days, notes: editNotes })
            .then(() => {
                Swal.fire({
                    title: "Diperbarui!",
                    icon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                });
                cancelEditing();
            })
            .catch((err) => Swal.fire("Gagal!", err.message, "error"));
    };

    const handleDeleteHistory = (id: string | undefined) => {
        if (!isConnected)
            return Swal.fire(
                "Koneksi Terputus!",
                "Tidak dapat menghapus data.",
                "error",
            );

        if (!id)
            return Swal.fire("Error!", "ID Rekaman tidak ditemukan.", "error");

        Swal.fire({
            title: "Hapus Rekaman?",
            text: "Data riwayat ini akan dihapus secara permanen!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Hapus!",
        }).then((result) => {
            if (result.isConfirmed) {
                const specificRecordRef = ref(
                    db,
                    `safety_board/imaschine_lab/history/${id}`,
                );
                remove(specificRecordRef)
                    .then(() =>
                        Swal.fire({
                            title: "Terhapus!",
                            icon: "success",
                            showConfirmButton: false,
                            timer: 1500,
                        }),
                    )
                    .catch((err) => Swal.fire("Gagal!", err.message, "error"));
            }
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarDays size={24} className="text-emerald-500" />
                        Log Riwayat Insiden
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                        Daftar rekaman kecelakaan kerja yang telah terjadi.
                    </p>
                </div>

                {/* TOMBOL EXPORT BARU */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                        onClick={onExportExcel}
                        className="flex-1 sm:flex-none bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl font-semibold cursor-pointer hover:bg-emerald-100 active:scale-95 transition-all flex justify-center items-center gap-2 text-sm border border-emerald-200"
                        title="Unduh format Excel"
                    >
                        <FileSpreadsheet size={18} /> Excel
                    </button>
                    <button
                        onClick={onExportPDF}
                        className="flex-1 sm:flex-none bg-rose-50 text-rose-700 px-4 py-2.5 rounded-xl font-semibold cursor-pointer hover:bg-rose-100 active:scale-95 transition-all flex justify-center items-center gap-2 text-sm border border-rose-200"
                        title="Unduh format PDF"
                    >
                        <FileText size={18} /> PDF
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto p-0">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                            <th className="p-4 md:px-8 font-semibold">
                                Waktu Kejadian
                            </th>
                            <th className="p-4 md:px-8 font-semibold">
                                Capaian Terakhir
                            </th>
                            <th className="p-4 md:px-8 font-semibold">
                                Rincian / Penyebab
                            </th>
                            <th className="p-4 md:px-8 font-semibold text-center w-24">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {history.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="text-center p-8 text-slate-400"
                                >
                                    <ShieldCheck
                                        size={40}
                                        className="mx-auto mb-3 text-emerald-200"
                                    />
                                    Belum ada rekaman insiden. Pertahankan
                                    performa keselamatan ini!
                                </td>
                            </tr>
                        ) : (
                            history.map((record) => (
                                <tr
                                    key={record.id}
                                    className="hover:bg-slate-50/80 transition-colors group"
                                >
                                    <td className="p-4 md:px-8 text-slate-700 whitespace-nowrap">
                                        <div className="font-semibold">
                                            {new Date(
                                                record.resetDate,
                                            ).toLocaleDateString("id-ID", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </div>
                                        <div className="text-xs text-slate-400 mt-1">
                                            Pukul{" "}
                                            {new Date(
                                                record.resetDate,
                                            ).toLocaleTimeString("id-ID", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}{" "}
                                            WIB
                                        </div>
                                    </td>

                                    <td className="p-4 md:px-8">
                                        {editingId === record.id ? (
                                            <input
                                                type="number"
                                                value={editDaysAchieved}
                                                onChange={(e) =>
                                                    setEditDaysAchieved(
                                                        e.target.value,
                                                    )
                                                }
                                                className="border border-slate-300 p-2 rounded-lg w-24 text-sm text-slate-800 focus:outline-none focus:border-blue-500 cursor-text"
                                            />
                                        ) : (
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                {record.daysAchieved} Hari
                                            </span>
                                        )}
                                    </td>

                                    <td className="p-4 md:px-8 text-sm text-slate-600">
                                        {editingId === record.id ? (
                                            <textarea
                                                value={editNotes}
                                                onChange={(e) =>
                                                    setEditNotes(e.target.value)
                                                }
                                                className="border border-slate-300 p-2 rounded-lg w-full text-sm text-slate-800 focus:outline-none focus:border-blue-500 resize-y min-h-[40px] cursor-text"
                                            />
                                        ) : (
                                            record.notes
                                        )}
                                    </td>

                                    <td className="p-4 md:px-8">
                                        {editingId === record.id ? (
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() =>
                                                        saveEditHistory(
                                                            record.id,
                                                        )
                                                    }
                                                    className="p-1.5 bg-emerald-100 text-emerald-600 hover:bg-emerald-200 rounded-lg transition-colors cursor-pointer"
                                                    title="Simpan"
                                                >
                                                    <Save size={18} />
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="p-1.5 bg-slate-200 text-slate-600 hover:bg-slate-300 rounded-lg transition-colors cursor-pointer"
                                                    title="Batal"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() =>
                                                        startEditing(record)
                                                    }
                                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Edit data"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDeleteHistory(
                                                            record.id,
                                                        )
                                                    }
                                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                                    title="Hapus data"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
