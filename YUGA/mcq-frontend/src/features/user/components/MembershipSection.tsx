import React from "react";
import { Link } from "react-router-dom";
import {
    Check,
    CheckCircle2,
    Lock,
    Crown,
    XCircle,
    ArrowRight
} from "lucide-react";
import { User as UserType } from "../../../core/types";
import { apiRequest } from "../../../core/utils/api";
import { useToast } from "../../../core/contexts";

interface MembershipSectionProps {
    user: UserType;
    onUpgrade: () => void;
}

export const MembershipSection: React.FC<MembershipSectionProps> = ({
    user,
}) => {
    const currentPlan = user.membership?.plan || "free";
    const [isCancelling, setIsCancelling] = React.useState(false);
    const { success, error } = useToast();

    const handleCancelSubscription = async () => {
        if (!confirm("Are you sure you want to cancel your Premium subscription?")) return;

        try {
            setIsCancelling(true);
            const response = await apiRequest('/payment/cancel', 'POST');

            if (!response.ok) {
                throw new Error("Failed to cancel subscription");
            }

            success("Subscription cancelled successfully");
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } catch (err: any) {
            console.error(err);
            error("Failed to cancel subscription. Please try again.");
            setIsCancelling(false);
        }
    };

    const tiers = [
        {
            id: "free",
            name: "Free Tier",
            price: "0",
            period: "forever",
            description: "Essential tools to get started",
            features: [
                "2 Full Mock Test Papers",
                "5 AI Doubts per Week",
                "1 Weekly AI Paper Gen",
                "Daily 1 AI OCR Solution"
            ],
            color: "gray"
        },
        {
            id: "student",
            name: "Student Pro",
            price: "199",
            period: "month",
            description: "The perfect boost for serious aspirants",
            features: [
                "10 Full Mock Test Papers",
                "One-Shot Video Classes",
                "Daily 10 AI Doubts",
                "Daily 1 Paper Gen (20 Qs)",
                "Daily 3 AI OCR Solutions"
            ],
            color: "purple",
            highlight: true
        },
        {
            id: "pro",
            name: "Ultimate Elite",
            price: "349",
            period: "month",
            description: "Unlimited access to everything",
            features: [
                "Unlimited Mock Papers",
                "Unlimited AI Doubts",
                "Unlimited Paper Generation",
                "Exclusive Mentor Support"
            ],
            color: "amber",
            comingSoon: true
        }
    ];

    return (
        <div className="space-y-8">
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent flex items-center justify-center gap-2">
                    <Crown className="w-6 h-6 text-purple-600" />
                    Choose Your Journey
                </h3>
                <p className="text-gray-500">Unlock your full potential with refined features</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tiers.map((tier) => {
                    const isActive = currentPlan === tier.id;
                    const isComingSoon = tier.comingSoon;

                    return (
                        <div
                            key={tier.id}
                            className={`relative rounded-3xl p-6 border transition-all duration-300 flex flex-col ${
                                tier.highlight 
                                    ? "bg-white dark:bg-slate-900 border-purple-500 shadow-xl shadow-purple-500/10 scale-[1.02] z-10" 
                                    : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800"
                            } ${isActive ? "ring-2 ring-purple-500 ring-offset-4 ring-offset-white dark:ring-offset-slate-900" : ""}`}
                        >
                            {tier.highlight && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                    Recommended
                                </div>
                            )}

                            <div className="mb-6">
                                <h4 className="text-lg font-bold dark:text-white capitalize">{tier.name}</h4>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-3xl font-black dark:text-white">₹{tier.price}</span>
                                    <span className="text-gray-500 text-sm">/{tier.period}</span>
                                </div>
                                <p className="mt-2 text-xs text-gray-500 line-clamp-1">{tier.description}</p>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {tier.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-xs font-medium text-gray-600 dark:text-gray-400">
                                        <Check className="w-3.5 h-3.5 mt-0.5 text-purple-500" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            {isActive ? (
                                <div className="mt-auto space-y-2">
                                    <div className="w-full py-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-2xl font-bold text-sm text-center flex items-center justify-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" />
                                        Current Plan
                                    </div>
                                    {tier.id !== 'free' && (
                                        <button
                                            onClick={handleCancelSubscription}
                                            disabled={isCancelling}
                                            className="w-full py-2 text-red-500 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors flex items-center justify-center gap-1"
                                        >
                                            <XCircle className="w-3 h-3" />
                                            {isCancelling ? "Processing..." : "Cancel Subscription"}
                                        </button>
                                    )}
                                </div>
                            ) : isComingSoon ? (
                                <button
                                    disabled
                                    className="mt-auto w-full py-3 bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 rounded-2xl font-bold text-sm cursor-not-allowed"
                                >
                                    Coming Soon
                                </button>
                            ) : (
                                <Link
                                    to="/premium"
                                    className="mt-auto w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-sm text-center hover:bg-purple-600 dark:hover:bg-purple-50 transition-all flex items-center justify-center gap-2 group"
                                >
                                    Upgrade Now
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="text-center text-[10px] text-gray-500 flex items-center justify-center gap-1">
                <Lock className="w-3 h-3" /> Secure payment integration via PayU
            </p>
        </div>
    );
};
