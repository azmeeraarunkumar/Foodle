import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Foodle - Skip the line, not the food",
    description: "Food pre-ordering app for IIT Gandhinagar campus",
    manifest: "/manifest.json",
    themeColor: "#C6E94B",
    viewport: {
        width: "device-width",
        initialScale: 1,
        maximumScale: 1,
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
