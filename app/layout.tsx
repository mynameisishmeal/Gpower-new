import type { Metadata } from "next";
import "./globals.css";
import UpdateChecker from "@/components/UpdateChecker";
import DbStatusIndicator from "@/components/DbStatusIndicator";
import BluetoothChooserModal from "@/components/BluetoothChooserModal";

export const metadata: Metadata = {
  title: "Gpower CRM",
  description: "Gpower Frozen Foods CRM System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <main className="flex-1">{children}</main>
        <DbStatusIndicator />
        <UpdateChecker />
        <BluetoothChooserModal />
      </body>
    </html>
  );
}
