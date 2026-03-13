import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

export const metadata = {
    title: "Safety Board - I Maschine Lab",
    description: "Sistem Informasi K3 Polman Bandung",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="id">
            <body
                className={`${inter.variable} font-sans bg-slate-950 text-white antialiased`}
            >
                {children}
            </body>
        </html>
    );
}
