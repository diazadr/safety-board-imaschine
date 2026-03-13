"use client";

import { useState } from "react";
import { Settings } from "lucide-react";
import Swal from "sweetalert2";
import { ref, set } from "firebase/database";
import { db } from "../../../lib/firebase";
import { SafetyData } from "../../../types";

interface CalibrationCardProps {
    isConnected: boolean;
    currentData: SafetyData | null;
}

export default function CalibrationCard({
    isConnected,
    currentData,
}: CalibrationCardProps) {
    const [calibrationMode, setCalibrationMode] = useState<"days" | "date">(
        "days",
    );
    const [manualDays, setManualDays] = useState<number | string>("");
    const [manualDate, setManualDate] = useState<string>("");

    const handleSetManualDays = () => {
        if (!isConnected)
            return Swal.fire(
                "Koneksi Terputus!",
                "Tidak dapat terhubung ke server.",
                "error",
            );

        let newStartDate = 0;
        let confirmationText = "";

        if (calibrationMode === "days") {
            const daysToSet = Number(manualDays);
            if (manualDays === "" || daysToSet < 0) {
                return Swal.fire(
                    "Angka Tidak Valid!",
                    "Masukkan angka hari yang benar.",
                    "warning",
                );
            }
            confirmationText = `Ubah nilai secara paksa menjadi ${daysToSet} hari?`;
            newStartDate =
                new Date().getTime() - daysToSet * 24 * 60 * 60 * 1000;
        } else {
            if (!manualDate)
                return Swal.fire(
                    "Tanggal Kosong!",
                    "Pilih tanggal yang valid.",
                    "warning",
                );

            const selectedDate = new Date(manualDate);
            selectedDate.setHours(0, 0, 0, 0);

            if (selectedDate.getTime() > new Date().getTime()) {
                return Swal.fire(
                    "Tanggal Tidak Valid!",
                    "Tanggal tidak boleh melebihi hari ini.",
                    "error",
                );
            }
            confirmationText = `Atur ulang tanggal mulai ke ${selectedDate.toLocaleDateString("id-ID")}?`;
            newStartDate = selectedDate.getTime();
        }

        Swal.fire({
            title: "Konfirmasi Kalibrasi",
            text: confirmationText,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3b82f6",
            cancelButtonColor: "#64748b",
            confirmButtonText: "Terapkan",
        }).then((result) => {
            if (result.isConfirmed) {
                const currentRef = ref(
                    db,
                    "safety_board/imaschine_lab/current",
                );
                set(currentRef, {
                    startDate: newStartDate,
                    bestRecord: currentData?.bestRecord || 0,
                });
                setManualDays("");
                setManualDate("");
                Swal.fire({
                    title: "Terkalibrasi!",
                    text: "Tampilan layar berhasil disesuaikan.",
                    icon: "success",
                    confirmButtonColor: "#10b981",
                });
            }
        });
    };

    return (
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-slate-800">
                <Settings size={22} className="text-blue-500" /> Kalibrasi
                Sistem
            </h3>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                Sesuaikan angka hari atau setel langsung tanggal mulai secara
                manual tanpa mencatatnya ke dalam riwayat kecelakaan.
            </p>

            <div className="flex bg-slate-100 p-1.5 rounded-xl mb-4">
                <button
                    onClick={() => setCalibrationMode("days")}
                    className={`flex-1 text-sm font-bold py-2.5 rounded-lg cursor-pointer transition-all ${calibrationMode === "days" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Via Angka Hari
                </button>
                <button
                    onClick={() => setCalibrationMode("date")}
                    className={`flex-1 text-sm font-bold py-2.5 rounded-lg cursor-pointer transition-all ${calibrationMode === "date" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                    Via Tanggal Mulai
                </button>
            </div>

            <div className="flex gap-3">
                {calibrationMode === "days" ? (
                    <input
                        type="number"
                        min="0"
                        value={manualDays}
                        onChange={(e) => setManualDays(e.target.value)}
                        className="border border-slate-300 p-3 rounded-xl flex-grow text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-text"
                        placeholder="Masukkan target hari..."
                    />
                ) : (
                    <input
                        type="date"
                        max={new Date().toISOString().split("T")[0]}
                        value={manualDate}
                        onChange={(e) => setManualDate(e.target.value)}
                        className="border border-slate-300 p-3 rounded-xl flex-grow text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors cursor-pointer"
                    />
                )}
                <button
                    onClick={handleSetManualDays}
                    disabled={!isConnected}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold cursor-pointer hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                    Terapkan
                </button>
            </div>
        </div>
    );
}
