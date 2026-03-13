"use client";

import { useState, useEffect } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "../../lib/firebase";
import { SafetyData, HistoryRecord } from "../../types";

import LoginForm from "./component/LoginForm";
import DashboardHeader from "./component/DashboardHeader";
import CalibrationCard from "./component/CalibrationCard";
import ResetCard from "./component/ResetCard";
import HistoryTable from "./component/HistoryTable";

export default function AdminDashboard() {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isConnected, setIsConnected] = useState<boolean>(true);
    const [currentData, setCurrentData] = useState<SafetyData | null>(null);
    const [history, setHistory] = useState<HistoryRecord[]>([]);

    const currentRef = ref(db, "safety_board/imaschine_lab/current");
    const historyRef = ref(db, "safety_board/imaschine_lab/history");
    const connectedRef = ref(db, ".info/connected");

    useEffect(() => {
        const unsubConnection = onValue(connectedRef, (snap) => {
            setIsConnected(snap.val() === true);
        });
        return () => unsubConnection();
    }, []);

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
            } else {
                setHistory([]);
            }
        });

        return () => {
            unsubCurrent();
            unsubHistory();
        };
    }, [isAuthenticated]);

    const calculateCurrentDays = () => {
        if (!currentData) return 0;
        const diff = new Date().getTime() - currentData.startDate;
        return Math.floor(diff / (1000 * 60 * 60 * 24));
    };

    if (!isAuthenticated) {
        return <LoginForm setIsAuthenticated={setIsAuthenticated} />;
    }

    const currentDays = calculateCurrentDays();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-inter p-4 md:p-8">
            <div className="max-w-7xl mx-auto">
                <DashboardHeader
                    isConnected={isConnected}
                    currentDays={currentDays}
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <CalibrationCard
                        isConnected={isConnected}
                        currentData={currentData}
                    />
                    <ResetCard
                        isConnected={isConnected}
                        currentData={currentData}
                        currentDays={currentDays}
                    />
                </div>

                <HistoryTable isConnected={isConnected} history={history} />
            </div>
        </div>
    );
}
