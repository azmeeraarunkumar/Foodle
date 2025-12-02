'use client';
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Wallet } from 'lucide-react';

export default function VendorSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [stall, setStall] = useState<any>(null);
    const [razorpayAccountId, setRazorpayAccountId] = useState('');
    const [bankDetails, setBankDetails] = useState({
        accountNumber: '',
        ifscCode: '',
        accountName: ''
    });
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchStallData();
    }, []);

    async function fetchStallData() {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { data } = await (supabase
                .from('stalls')
                .select('*')
                .eq('vendor_id', user.id)
                .single()) as any;

            if (data) {
                setStall(data);
                setRazorpayAccountId(data.razorpay_account_id || '');
            }
        } catch (error) {
            console.error('Error fetching stall:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveAccountId(e: React.FormEvent) {
        e.preventDefault();

        if (!razorpayAccountId) {
            setMessage({ type: 'error', text: 'Please enter your Razorpay Account ID' });
            return;
        }

        try {
            setSaving(true);
            setMessage(null);

            const supabase = createClient();
            const { error } = await (supabase
                .from('stalls')
                .update({ razorpay_account_id: razorpayAccountId } as any)
                .eq('id', stall.id));

            if (error) throw error;

            setMessage({ type: 'success', text: 'Payment account linked successfully!' });
            setStall({ ...stall, razorpay_account_id: razorpayAccountId });
        } catch (error) {
            console.error('Error saving account:', error);
            setMessage({ type: 'error', text: 'Failed to link payment account' });
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return <div className="text-white text-center mt-10">Loading...</div>;
    }

    const isConnected = stall?.razorpay_account_id;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-h2 text-white mb-2">Payment Settings</h1>
                <p className="text-body text-gray-400">
                    Connect your bank account via Razorpay to receive payments automatically
                </p>
            </div>

            {/* Status Card */}
            <Card className={`p-4 border-2 ${isConnected ? 'bg-green-500/10 border-green-500/30' : 'bg-gray-900 border-gray-800'}`}>
                <div className="flex items-center gap-3">
                    {isConnected ? (
                        <>
                            <CheckCircle2 className="h-6 w-6 text-green-400" />
                            <div>
                                <h3 className="font-bold text-white">Payment Account Connected</h3>
                                <p className="text-sm text-gray-400">Students can now pay directly to your bank account</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <AlertCircle className="h-6 w-6 text-yellow-400" />
                            <div>
                                <h3 className="font-bold text-white">Payment Account Not Connected</h3>
                                <p className="text-sm text-gray-400">Complete setup below to start receiving payments</p>
                            </div>
                        </>
                    )}
                </div>
            </Card>

            {/* Setup Instructions */}
            <Card className="bg-gray-900 border-gray-800 p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-h3 text-white mb-1">Razorpay Account Setup</h2>
                        <p className="text-sm text-gray-400">
                            Follow these steps to connect your bank account
                        </p>
                    </div>
                </div>

                <div className="space-y-4 mb-6">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-sm">1</span>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-1">Contact Foodle Admin</h4>
                            <p className="text-sm text-gray-400">
                                Request access to Razorpay Route. The admin will send you an onboarding link.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-sm">2</span>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-1">Complete KYC</h4>
                            <p className="text-sm text-gray-400">
                                Provide your PAN, Aadhaar, and bank account details via the Razorpay link.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary font-bold text-sm">3</span>
                        </div>
                        <div>
                            <h4 className="text-white font-semibold mb-1">Get Account ID</h4>
                            <p className="text-sm text-gray-400">
                                After approval, you'll receive a Razorpay Account ID. Enter it below.
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSaveAccountId} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Razorpay Account ID <span className="text-red-400">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="acc_XXXXXXXXXXXX"
                            value={razorpayAccountId}
                            onChange={(e) => setRazorpayAccountId(e.target.value)}
                            className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 font-mono"
                            disabled={saving}
                        />
                        <p className="text-xs text-gray-500">
                            Example: acc_AbCdEfGhIjKlMn
                        </p>
                    </div>

                    {message && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${message.type === 'success'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}>
                            {message.type === 'success' ? (
                                <CheckCircle2 className="h-5 w-5" />
                            ) : (
                                <AlertCircle className="h-5 w-5" />
                            )}
                            <span className="text-sm">{message.text}</span>
                        </div>
                    )}

                    <Button
                        type="submit"
                        loading={saving}
                        className="w-full md:w-auto"
                    >
                        Save Account ID
                    </Button>
                </form>
            </Card>

            {/* Info Card */}
            <Card className="bg-gray-800/50 border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">💰 How Payments Work</h3>
                <ul className="space-y-2 text-sm text-gray-400">
                    <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Students pay via Razorpay (GPay/PhonePe/Cards)</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Money is <strong className="text-white">automatically transferred</strong> to your bank account</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>Settlements happen within 24 hours</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="text-primary">•</span>
                        <span>100% secure and verified transactions</span>
                    </li>
                </ul>
            </Card>

            {/* Help Section */}
            <Card className="bg-primary/5 border-primary/20 p-4">
                <p className="text-sm text-gray-300">
                    <strong className="text-white">Need Help?</strong> Contact the Foodle admin team to set up your Razorpay account or troubleshoot any issues.
                </p>
            </Card>
        </div>
    );
}
