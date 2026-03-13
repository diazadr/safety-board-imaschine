import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { HistoryRecord } from "../../../types";

// Helper untuk mengubah gambar (dari folder public) menjadi Base64 agar bisa masuk PDF
const getBase64ImageFromURL = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                // Menggambar dengan transparansi tetap utuh (Tanpa kotak putih)
                ctx.drawImage(img, 0, 0);
            }
            const dataURL = canvas.toDataURL("image/png");
            resolve(dataURL);
        };
        img.onerror = (error) => reject(error);
        img.src = url;
    });
};

// --- TEMPLATE EXCEL MODERN ---
export const generateExcel = (history: HistoryRecord[]) => {
    const worksheetData = history.map((row, index) => ({
        No: index + 1,
        "Tanggal Insiden": new Date(row.resetDate).toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        Waktu:
            new Date(row.resetDate).toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
            }) + " WIB",
        "Capaian Hari Aman": `${row.daysAchieved} Hari`,
        "Rincian / Penyebab Insiden": row.notes,
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);

    worksheet["!cols"] = [
        { wch: 5 },
        { wch: 30 },
        { wch: 15 },
        { wch: 20 },
        { wch: 50 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Log Laporan K3");
    XLSX.writeFile(
        workbook,
        `Laporan_K3_IMaschine_${new Date().toISOString().split("T")[0]}.xlsx`,
    );
};

// --- TEMPLATE PDF MODERN & LOGO ---
// Perhatikan tambahan keyword 'async'
export const generatePDF = async (history: HistoryRecord[]) => {
    const doc = new jsPDF("landscape"); // Ukuran A4 Landscape: Lebar 297mm, Tinggi 210mm

    try {
        // 1. Load Gambar Logo secara Asinkron
        const logoImaschine = await getBase64ImageFromURL(
            "/logo-imaschine.png",
        );
        const logoK3 = await getBase64ImageFromURL("/logo-k3.webp");

        // 2. Tambahkan Logo ke PDF (X, Y, Lebar, Tinggi)
        // Logo Kiri
        doc.addImage(logoImaschine, "PNG", 14, 10, 24, 24);
        // Logo Kanan (Lebar 297 - margin 14 - ukuran gambar 24 = X: 259)
        doc.addImage(logoK3, "PNG", 259, 10, 24, 24);
    } catch (error) {
        console.warn("Gagal memuat logo, PDF akan dicetak tanpa logo", error);
    }

    // 3. Menambahkan Header / Judul (Rata Tengah)
    const centerX = 297 / 2; // Titik tengah kertas landscape

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(30, 41, 59); // Slate-800
    doc.text("Laporan Riwayat Insiden K3", centerX, 18, { align: "center" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text("I Maschine Lab - Politeknik Manufaktur Bandung", centerX, 25, {
        align: "center",
    });

    doc.setFontSize(9);
    doc.text(
        `Dicetak pada: ${new Date().toLocaleString("id-ID")}`,
        centerX,
        31,
        { align: "center" },
    );

    // 4. Menyiapkan Data Tabel
    const tableData = history.map((row, index) => [
        index + 1,
        new Date(row.resetDate).toLocaleDateString("id-ID", {
            year: "numeric",
            month: "long",
            day: "numeric",
        }),
        new Date(row.resetDate).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
        }) + " WIB",
        `${row.daysAchieved} Hari`,
        row.notes,
    ]);

    // 5. Menggambar Tabel
    autoTable(doc, {
        startY: 42, // Memulai tabel tepat di bawah kop dan logo
        head: [
            [
                "No",
                "Tanggal Insiden",
                "Waktu",
                "Capaian Terakhir",
                "Rincian / Penyebab Insiden",
            ],
        ],
        body: tableData,
        theme: "grid",
        styles: {
            font: "helvetica",
            fontSize: 10,
            cellPadding: 6,
        },
        headStyles: {
            fillColor: [15, 23, 42], // Slate-900 (Warna Header Tabel)
            textColor: [255, 255, 255],
            fontStyle: "bold",
            halign: "center",
        },
        columnStyles: {
            0: { halign: "center", cellWidth: 15 },
            1: { cellWidth: 45 },
            2: { halign: "center", cellWidth: 35 },
            3: { halign: "center", cellWidth: 35 },
            4: { cellWidth: "auto" },
        },
        alternateRowStyles: {
            fillColor: [248, 250, 252], // Slate-50 (Zebra Striping)
        },
    });

    // 6. Simpan File
    doc.save(
        `Laporan_K3_IMaschine_${new Date().toISOString().split("T")[0]}.pdf`,
    );
};
