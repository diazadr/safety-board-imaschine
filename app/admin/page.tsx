"use client";

import { useState, useEffect } from "react";
import { ref, onValue, set, push } from "firebase/database";
import { db } from "../../lib/firebase";
import * as XLSX from "xlsx";
import {
    ShieldAlert,
    Download,
    Settings,
    RefreshCw,
    LogIn,
    Wifi,
    WifiOff,
    Activity,
    CalendarDays,
    ShieldCheck,
} from "lucide-react";
import { SafetyData, HistoryRecord } from "../../types";

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [pin, setPin] = useState<string>("");
    const [isConnected, setIsConnected] = useState<boolean>(true);

    const [currentData, setCurrentData] = useState<SafetyData | null>(null);
    const [history, setHistory] = useState<HistoryRecord[]>([]);

    const [manualDays, setManualDays] = useState<number | string>("");
    const [resetNotes, setResetNotes] = useState<string>("");

    const currentRef = ref(db, "safety_board/imaschine_lab/current");
    const historyRef = ref(db, "safety_board/imaschine_lab/history");
    const connectedRef = ref(db, ".info/connected");

    // # Cek Status Koneksi Firebase
    useEffect(() => {
        const unsubConnection = onValue(connectedRef, (snap) => {
            setIsConnected(snap.val() === true);
        });
        return () => unsubConnection();
    }, []);

    // # Ambil Data Realtime
    useEffect(() => {
        if (!isAuthenticated) return;

        const unsubCurrent = onValue(currentRef, (snapshot) => {
            setCurrentData(snapshot.val() as SafetyData);
        });

        const unsubHistory = onValue(historyRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const historyArray = Object.keys(data)
                    .map((key) => ({
                        id: key,
                        ...data[key],
                    }))
                    .sort((a, b) => b.resetDate - a.resetDate);
                setHistory(historyArray);
            }
        });

        return () => {
            unsubCurrent();
            unsubHistory();
        };
    }, [isAuthenticated]);

    // # Autentikasi Login Admin
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN) setIsAuthenticated(true);
        else {
            alert("PIN Salah! Akses ditolak.");
            setPin("");
        }
    };

    // # Hitung Capaian Hari
    const calculateCurrentDays = () => {
        if (!currentData) return 0;
        const diff = new Date().getTime() - currentData.startDate;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    // # Deklarasi Kecelakaan & Simpan Riwayat
    const handleReset = () => {
        if (!isConnected)
            return alert(
                "Koneksi terputus! Tidak dapat menyimpan data ke server.",
            );
        if (!resetNotes)
            return alert("Mohon isi catatan penyebab reset / kecelakaan!");
        if (
            !window.confirm(
                "PERINGATAN!\nYakin ingin mereset angka ke 0? Ini akan mengubah tampilan layar utama.",
            )
        )
            return;

        const daysAchieved = calculateCurrentDays();
        const newRecord =
            daysAchieved > (currentData?.bestRecord || 0)
                ? daysAchieved
                : currentData?.bestRecord;

        push(historyRef, {
            resetDate: new Date().getTime(),
            daysAchieved,
            notes: resetNotes,
        });

        set(currentRef, {
            startDate: new Date().getTime(),
            bestRecord: newRecord,
        });

        setResetNotes("");
        alert("Sistem berhasil direset ke 0.");
    };

    // # Kalibrasi Hari Secara Manual
    const handleSetManualDays = () => {
        const daysToSet = Number(manualDays);
        if (!isConnected) return alert("Koneksi terputus!");
        if (manualDays === "" || daysToSet < 0)
            return alert("Masukkan angka yang valid!");
        if (
            !window.confirm(
                `Ubah nilai secara paksa menjadi ${daysToSet} hari?`,
            )
        )
            return;

        const newStartDate =
            new Date().getTime() - daysToSet * 24 * 60 * 60 * 1000;

        set(currentRef, {
            startDate: newStartDate,
            bestRecord: currentData?.bestRecord || 0,
        });

        alert(`Berhasil disetel ke ${daysToSet} hari.`);
        setManualDays("");
    };

    // # Unduh Log Laporan Format Excel
    const handleExportExcel = () => {
        if (history.length === 0)
            return alert("Belum ada data history untuk diekspor.");

        const worksheetData = history.map((row, index) => ({
            No: index + 1,
            "Tanggal Kejadian": new Date(row.resetDate).toLocaleDateString(
                "id-ID",
            ),
            "Waktu Kejadian": new Date(row.resetDate).toLocaleTimeString(
                "id-ID",
            ),
            "Jumlah Hari Aman Sebelumnya": row.daysAchieved,
            "Catatan / Penyebab": row.notes,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan_K3");

        XLSX.writeFile(
            workbook,
            `Laporan_K3_IMaschine_${new Date().toISOString().split("T")[0]}.xlsx`,
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center font-inter p-4 relative overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-500/20 blur-[100px] rounded-full"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full"></div>

                <form
                    onSubmit={handleLogin}
                    className="bg-slate-800/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl w-full max-w-md border border-slate-700 z-10"
                >
                    <div className="flex justify-center mb-6">
                        <div className="bg-emerald-500/10 p-4 rounded-full border border-emerald-500/20">
                            <ShieldAlert
                                size={48}
                                className="text-emerald-400"
                            />
                        </div>
                    </div>
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-white mb-2">
                            Portal Admin K3
                        </h2>
                        <p className="text-slate-400 text-sm">
                            Masukan PIN untuk mengakses dasbor I Maschine Lab
                        </p>
                    </div>

                    <input
                        type="password"
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-center text-2xl tracking-[0.5em] mb-6 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                        placeholder="••••••••"
                        autoFocus
                    />
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold hover:bg-emerald-500 transition-all active:scale-95 flex justify-center items-center gap-2"
                    >
                        <LogIn size={20} />
                        OTORISASI MASUK
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-inter p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800">
                                Dasbor Manajemen K3
                            </h1>
                            <div
                                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${isConnected ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-red-50 text-red-600 border-red-200 animate-pulse"}`}
                            >
                                {isConnected ? (
                                    <Wifi size={14} />
                                ) : (
                                    <WifiOff size={14} />
                                )}
                                {isConnected ? "Online" : "Offline"}
                            </div>
                        </div>
                        <p className="text-slate-500 font-medium mt-1">
                            I Maschine Lab • Politeknik Manufaktur Bandung
                        </p>
                    </div>

                    <div className="bg-slate-50 px-6 py-4 rounded-xl border border-slate-100 flex items-center gap-4">
                        <div className="bg-emerald-100 p-3 rounded-lg text-emerald-600">
                            <Activity size={28} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 font-semibold uppercase tracking-wider">
                                Status Berjalan
                            </div>
                            <div className="text-3xl font-black text-slate-800">
                                {calculateCurrentDays()}{" "}
                                <span className="text-base font-semibold text-slate-500">
                                    Hari Aman
                                </span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                        <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-slate-800">
                            <Settings size={22} className="text-blue-500" />
                            Kalibrasi Sistem
                        </h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Sesuaikan angka hari secara manual untuk keperluan
                            koreksi tanpa mencatatnya ke dalam riwayat
                            kecelakaan kerja.
                        </p>
                        <div className="flex gap-3">
                            <input
                                type="number"
                                min="0"
                                value={manualDays}
                                onChange={(e) => setManualDays(e.target.value)}
                                className="border border-slate-300 p-3 rounded-xl flex-grow text-slate-800 bg-slate-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                                placeholder="Masukkan angka..."
                            />
                            <button
                                onClick={handleSetManualDays}
                                disabled={!isConnected}
                                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                            >
                                Setel Hari
                            </button>
                        </div>
                    </div>

                    <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border-2 border-red-100 hover:border-red-200 transition-colors relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>

                        <h3 className="text-lg font-bold flex items-center gap-2 mb-2 text-red-700">
                            <ShieldAlert size={22} /> Deklarasi Kecelakaan Kerja
                        </h3>
                        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                            Tindakan ini akan mengembalikan layar utama menjadi{" "}
                            <strong className="text-red-600">0 Hari</strong> dan
                            menyimpan rekor ke dalam buku log secara permanen.
                        </p>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                value={resetNotes}
                                onChange={(e) => setResetNotes(e.target.value)}
                                className="w-full border border-slate-300 p-3 rounded-xl text-slate-800 bg-slate-50 focus:outline-none focus:border-red-400 focus:bg-white transition-colors"
                                placeholder="Tulis rincian singkat insiden..."
                            />
                            <button
                                onClick={handleReset}
                                disabled={!isConnected}
                                className="w-full bg-red-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <RefreshCw size={20} /> EKSEKUSI RESET SISTEM
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <CalendarDays
                                    size={24}
                                    className="text-emerald-500"
                                />
                                Log Riwayat Insiden
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Daftar rekaman kecelakaan kerja yang telah
                                terjadi.
                            </p>
                        </div>
                        <button
                            onClick={handleExportExcel}
                            className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-slate-800 active:scale-95 transition-all flex items-center gap-2 text-sm"
                        >
                            <Download size={18} /> Unduh Laporan (.xlsx)
                        </button>
                    </div>

                    <div className="overflow-x-auto p-0">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                    <th className="p-4 md:px-8 font-semibold">
                                        Tanggal Insiden
                                    </th>
                                    <th className="p-4 md:px-8 font-semibold">
                                        Capaian Hari Aman
                                    </th>
                                    <th className="p-4 md:px-8 font-semibold">
                                        Rincian / Penyebab
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {history.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={3}
                                            className="text-center p-8 text-slate-400"
                                        >
                                            <ShieldCheck
                                                size={40}
                                                className="mx-auto mb-3 text-emerald-200"
                                            />
                                            Belum ada rekaman insiden.
                                            Pertahankan performa keselamatan
                                            ini!
                                        </td>
                                    </tr>
                                ) : (
                                    history.map((record) => (
                                        <tr
                                            key={record.id}
                                            className="hover:bg-slate-50/80 transition-colors"
                                        >
                                            <td className="p-4 md:px-8 text-slate-700 whitespace-nowrap">
                                                <div className="font-semibold">
                                                    {new Date(
                                                        record.resetDate,
                                                    ).toLocaleDateString(
                                                        "id-ID",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        },
                                                    )}
                                                </div>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    Pukul{" "}
                                                    {new Date(
                                                        record.resetDate,
                                                    ).toLocaleTimeString(
                                                        "id-ID",
                                                        {
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        },
                                                    )}{" "}
                                                    WIB
                                                </div>
                                            </td>
                                            <td className="p-4 md:px-8">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                                                    {record.daysAchieved} Hari
                                                </span>
                                            </td>
                                            <td className="p-4 md:px-8 text-sm text-slate-600">
                                                {record.notes}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
