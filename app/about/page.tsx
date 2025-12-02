'use client';

import { BottomNav } from '@/components/student/BottomNav';
import { Card } from '@/components/ui/Card';

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary to-primary-dark min-h-[280px] rounded-b-[32px] flex flex-col items-center justify-center px-6 text-center">
                <div className="text-[80px] mb-4">🤖</div>
                <h1 className="text-[32px] font-bold text-secondary mb-2">Built entirely with AI</h1>
                <p className="text-body text-secondary/90">Zero lines of manual code</p>
            </div>

            {/* Mission Card */}
            <div className="px-6 -mt-8">
                <Card className="p-6 text-center border-2 border-border">
                    <div className="text-[40px] mb-3">✨</div>
                    <h2 className="text-h2 text-secondary mb-3">The Division Zero Experiment</h2>
                    <p className="text-body text-secondary-light leading-relaxed">
                        Division Zero is a one-person AI-powered software agency.
                        Every feature you see in Foodle—from design to deployment—
                        was created through conversations with Claude.
                        <br /><br />
                        No traditional coding. No design software.
                        Just human vision + AI execution.
                        <br /><br />
                        This is the future of software development.
                    </p>
                </Card>
            </div>

            {/* Stats */}
            <div className="px-6 pt-6 grid grid-cols-3 gap-3">
                <Card className="p-4 text-center">
                    <div className="text-h1 text-primary">100%</div>
                    <div className="text-body-small text-gray-400 mt-1">AI Generated</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-h1 text-primary">0</div>
                    <div className="text-body-small text-gray-400 mt-1">Manual Lines</div>
                </Card>
                <Card className="p-4 text-center">
                    <div className="text-h1 text-primary">1</div>
                    <div className="text-body-small text-gray-400 mt-1">Developer</div>
                </Card>
            </div>

            {/* Tech Stack */}
            <div className="px-6 pt-8">
                <h2 className="text-h2 text-secondary mb-4">Powered By</h2>
                <div className="grid grid-cols-2 gap-3">
                    <Card className="p-4">
                        <div className="text-[24px] mb-2">🧠</div>
                        <div className="text-h3 text-secondary">Claude</div>
                        <div className="text-body-small text-gray-400">AI Development Partner</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-[24px] mb-2">⚛️</div>
                        <div className="text-h3 text-secondary">Next.js</div>
                        <div className="text-body-small text-gray-400">React Framework</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-[24px] mb-2">⚡</div>
                        <div className="text-h3 text-secondary">Supabase</div>
                        <div className="text-body-small text-gray-400">Backend & Database</div>
                    </Card>
                    <Card className="p-4">
                        <div className="text-[24px] mb-2">💳</div>
                        <div className="text-h3 text-secondary">Razorpay</div>
                        <div className="text-body-small text-gray-400">Payments</div>
                    </Card>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 pt-12 pb-6 text-center">
                <div className="text-[48px] mb-2">🍽️</div>
                <p className="text-caption text-gray-400">© 2024 Division Zero</p>
                <p className="text-caption text-gray-400 mt-1">Built with Claude</p>
                <p className="text-caption text-gray-400 mt-3">v1.0.0-alpha</p>
            </div>

            <BottomNav />
        </div>
    );
}
