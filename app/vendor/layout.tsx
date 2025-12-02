import { VendorNav } from '@/components/vendor/VendorNav';

export default function VendorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-950 md:flex">
            <VendorNav />
            <main className="flex-1 pb-20 md:pb-0 overflow-y-auto h-screen">
                <div className="p-4 md:p-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
