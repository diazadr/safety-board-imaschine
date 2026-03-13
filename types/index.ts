export interface SafetyData {
    startDate: number;
    bestRecord: number;
}

export interface HistoryRecord {
    id?: string;
    resetDate: number;
    daysAchieved: number;
    notes: string;
}
