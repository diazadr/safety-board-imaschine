"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../lib/firebase";
import { AlertTriangle } from "lucide-react";
import { SafetyData } from "../types";

export default function DisplayBoard() {
    const [days, setDays] = useState<number>(0);
    const [startDateMs, setStartDateMs] = useState<number | null>(null);
    const [now, setNow] = useState<Date | null>(null);

    const dbRef = ref(db, "safety_board/imaschine_lab/current");

    // # Mengambil Data Realtime dan Set Jam
    useEffect(() => {
        setNow(new Date());

        const unsubData = onValue(dbRef, (snapshot) => {
            const data = snapshot.val() as SafetyData | null;
            if (data) {
                setStartDateMs(data.startDate);
                const current = new Date().getTime();
                const diff = Math.max(0, current - data.startDate);
                setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
            }
        });

        const interval = setInterval(() => {
            setNow(new Date());
            setStartDateMs((prevStart) => {
                if (prevStart) {
                    const diff = Math.max(0, new Date().getTime() - prevStart);
                    setDays(Math.floor(diff / (1000 * 60 * 60 * 24)));
                }
                return prevStart;
            });
        }, 1000);

        return () => {
            unsubData();
            clearInterval(interval);
        };
    }, []);

    const formatTime = now
        ? now.toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
          })
        : "00:00:00";

    const formatDay = now
        ? now.toLocaleDateString("id-ID", { weekday: "long" })
        : "Hari";

    const formatDate = now
        ? now.toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "Tanggal";

    const formattedStartDate = startDateMs
        ? new Date(startDateMs).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
          })
        : "...";

    return (
        <div className="font-chakra min-h-screen flex flex-col justify-between p-4 md:p-8 bg-[#0a0e17] text-white border-4 border-[#00ff88] shadow-[inset_0_0_50px_rgba(0,255,136,0.15)] overflow-hidden">
            <header className="flex flex-col xl:flex-row justify-between items-center border-b-2 border-slate-800 pb-4 gap-6 xl:gap-4">
                <div className="flex items-center gap-4 md:gap-6">
                    {/* Logo I Maschine (Di Kiri) */}
                    <div className="h-16 w-16 md:h-24 md:w-24 relative flex-shrink-0">
                        <img
                            src="/logo-imaschine.png"
                            alt="Logo I Maschine Lab"
                            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        />
                    </div>

                    {/* Teks Selalu di Tengah */}
                    <div className="text-center px-2 md:px-4">
                        <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest text-white">
                            I Maschine Lab
                        </h1>
                        <h2 className="text-slate-400 text-lg md:text-xl tracking-wider mt-1">
                            Politeknik Manufaktur Bandung
                        </h2>
                    </div>

                    {/* Logo K3 .webp (Di Kanan) */}
                    <div className="h-16 w-16 md:h-24 md:w-24 relative flex-shrink-0">
                        <img
                            src="/logo-k3.webp"
                            alt="Logo K3"
                            className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                        />
                    </div>
                </div>

                <div className="text-center xl:text-right bg-slate-900/50 px-6 py-3 rounded-xl border border-slate-800 shadow-inner">
                    <div className="text-3xl md:text-4xl font-bold text-[#00ff88] tracking-widest mb-1 drop-shadow-md">
                        {formatTime} WIB
                    </div>
                    <div className="text-lg md:text-xl text-slate-300 font-semibold uppercase tracking-wider">
                        {formatDay}, {formatDate}
                    </div>
                </div>
            </header>

            <main className="flex-grow flex flex-col justify-center items-center text-center my-4">
                <h3 className="text-3xl md:text-5xl uppercase tracking-[0.3em] text-slate-300 font-semibold mb-2">
                    Bekerja Tanpa Kecelakaan
                </h3>

                <div className="text-[22vh] md:text-[35vh] font-bold leading-none text-[#00ff88] drop-shadow-[0_0_50px_rgba(0,255,136,0.6)] my-2">
                    {days}
                </div>

                <div className="text-4xl md:text-6xl uppercase tracking-[0.2em] text-slate-400 font-semibold mb-8">
                    Hari
                </div>

                <div className="bg-slate-900/80 px-6 py-2 rounded-full border border-slate-700 text-slate-300 text-lg md:text-xl tracking-wider inline-flex items-center gap-2 mt-4">
                    <span className="text-slate-400">Mulai sejak:</span>
                    <strong className="text-[#00ff88]">
                        {formattedStartDate}
                    </strong>
                </div>
            </main>

            <footer className="flex justify-center items-center border-t border-slate-800 pt-6 mt-2">
                <div className="flex items-center gap-3 text-[#FFD700] drop-shadow-[0_0_15px_rgba(255,215,0,0.5)] font-bold text-2xl md:text-4xl uppercase tracking-widest">
                    <AlertTriangle size={36} className="animate-pulse" />
                    <span>UTAMAKAN KESELAMATAN DAN KESEHATAN KERJA</span>
                    <AlertTriangle size={36} className="animate-pulse" />
                </div>
            </footer>
        </div>
    );
}
