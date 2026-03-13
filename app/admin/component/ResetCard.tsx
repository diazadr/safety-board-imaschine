"use client";

import { useState } from "react";
import { ShieldAlert, RefreshCw } from "lucide-react";
import Swal from "sweetalert2";
import { ref, set, push } from "firebase/database";
import { db } from "../../../lib/firebase";
import { SafetyData } from "../../../types";

interface ResetCardProps {
    isConnected: boolean;
    currentData: SafetyData | null;
    currentDays: number;
}

export default function ResetCard({
    isConnected,
    currentData,
    currentDays,
}: ResetCardProps) {
    const [resetNotes, setResetNotes] = useState<string>("");

    const handleReset = () => {
        if (!isConnected)
            return Swal.fire(
                "Koneksi Terputus!",
                "Tidak dapat menyimpan data ke server.",
                "error",
            );
        if (!resetNotes)
            return Swal.fire(
                "Peringatan!",
                "Mohon isi catatan penyebab reset/kecelakaan!",
                "warning",
            );

        Swal.fire({
            title: "Deklarasi Kecelakaan?",
            text: "Layar utama akan direset ke 0 Hari dan rekor akan disimpan permanen.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Ya, Eksekusi Reset!",
        }).then((result) => {
            if (result.isConfirmed) {
                const newRecord =
                    currentDays > (currentData?.bestRecord || 0)
                        ? currentDays
                        : currentData?.bestRecord;

                const historyRef = ref(
                    db,
                    "safety_board/imaschine_lab/history",
                );
                const currentRef = ref(
                    db,
                    "safety_board/imaschine_lab/current",
                );

                push(historyRef, {
                    resetDate: new Date().getTime(),
                    daysAchieved: currentDays,
                    notes: resetNotes,
                });

                set(currentRef, {
                    startDate: new Date().getTime(),
                    bestRecord: newRecord,
                });

                setResetNotes("");
                Swal.fire({
                    title: "Berhasil!",
                    text: "Sistem berhasil direset ke 0.",
                    icon: "success",
                    confirmButtonColor: "#10b981",
                });
            }
        });
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border-2 border-red-100 hover:border-red-200 transition-colors relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>

            <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-red-700">
                <ShieldAlert size={22} /> Deklarasi Kecelakaan Kerja
            </h3>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                Tindakan ini akan mengembalikan layar utama menjadi{" "}
                <strong className="text-red-600">0 Hari</strong> dan menyimpan
                rekor ke dalam buku log secara permanen.
            </p>
            <div className="flex flex-col gap-3">
                <input
                    type="text"
                    value={resetNotes}
                    onChange={(e) => setResetNotes(e.target.value)}
                    className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 bg-slate-50 focus:outline-none focus:border-red-400 focus:bg-white transition-colors cursor-text"
                    placeholder="Tulis rincian singkat insiden..."
                />
                <button
                    onClick={handleReset}
                    disabled={!isConnected}
                    className="w-full bg-red-600 text-white px-4 py-3 rounded-xl font-bold cursor-pointer hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <RefreshCw size={20} /> EKSEKUSI RESET SISTEM
                </button>
            </div>
        </div>
    );
}
