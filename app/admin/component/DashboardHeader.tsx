"use client";

import { Wifi, WifiOff, Activity } from "lucide-react";

interface DashboardHeaderProps {
    isConnected: boolean;
    currentDays: number;
}

export default function DashboardHeader({
    isConnected,
    currentDays,
}: DashboardHeaderProps) {
    return (
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 gap-6">
            <div className="flex items-center gap-4">
                <div className="h-12 w-12 md:h-16 md:w-16 flex-shrink-0">
                    <img
                        src="/logo-imaschine.png"
                        alt="Logo I Maschine"
                        className="w-full h-full object-contain"
                    />
                </div>
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
                        {currentDays}{" "}
                        <span className="text-base font-semibold text-slate-500">
                            Hari Aman
                        </span>
                    </div>
                </div>
            </div>
        </header>
    );
}
