"use client";

import { useState } from "react";
import { ShieldAlert, LogIn } from "lucide-react";
import Swal from "sweetalert2";

interface LoginFormProps {
    setIsAuthenticated: (val: boolean) => void;
}

export default function LoginForm({ setIsAuthenticated }: LoginFormProps) {
    const [pin, setPin] = useState("");

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === process.env.NEXT_PUBLIC_ADMIN_PIN) {
            setIsAuthenticated(true);
        } else {
            Swal.fire({
                icon: "error",
                title: "Akses Ditolak",
                text: "PIN yang Anda masukkan salah!",
                confirmButtonColor: "#ef4444",
            });
            setPin("");
        }
    };

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
                        <ShieldAlert size={48} className="text-emerald-400" />
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
                    className="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl text-center text-2xl tracking-[0.5em] mb-6 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all cursor-text"
                    placeholder="••••••••"
                    autoFocus
                />
                <button
                    type="submit"
                    className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold cursor-pointer hover:bg-emerald-500 transition-all active:scale-95 flex justify-center items-center gap-2"
                >
                    <LogIn size={20} /> OTORISASI MASUK
                </button>
            </form>
        </div>
    );
}
