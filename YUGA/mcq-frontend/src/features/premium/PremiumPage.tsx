import { useState } from "react";
import {
    Check,
    Sparkles,
    ArrowRight,
    Loader2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../core/contexts/AuthContext";
import { api, API_BASE_URL } from "../../core/utils/api";
import { Footer } from "../../shared/components/Footer";
import { motion } from "framer-motion";

export const PremiumPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const stats = [
        { value: "50K+", label: "Active Students" },
        { value: "95%", label: "Success Rate" },
        { value: "4.9/5", label: "User Rating" },
        { value: "24/7", label: "AI Support" }
    ];

    const tiers = [
        {
            name: "Free Tier",
            price: "0",
            period: "forever",
            description: "Essential tools for every student to get started.",
            features: [
                "2 Full Mock Test Papers",
                "5 AI Doubts per Week",
                "1 Weekly AI Paper Gen (Limit 10 Qs)",
                "Daily 1 AI OCR Solution",
                "Community Support"
            ],
            buttonText: "Current Plan",
            highlight: false,
            isComingSoon: false,
            disabled: true,
            planKey: "free"
        },
        {
            name: "Student Pro",
            price: "199",
            period: "mo",
            description: "The perfect boost for serious aspirants.",
            features: [
                "10 Full Mock Test Papers",
                "Complete One-Shot Video Classes",
                "Daily 10 AI Doubts",
                "Daily 1 Paper Gen (Max 20 Qs)",
                "Daily 3 AI OCR Solutions",
                "Ad-free Experience"
            ],
            buttonText: "Upgrade Now",
            highlight: true,
            isComingSoon: false,
            disabled: false,
            planKey: "student"
        },
        {
            name: "Ultimate Elite",
            price: "349",
            period: "mo",
            description: "Unlimited access to everything we offer.",
            features: [
                "All Mock Test Papers (Unlimited)",
                "Unlimited MCQ Question Bank",
                "Unlimited Daily Doubts",
                "Unlimited Paper Generation",
                "Unlimited Voice Classes",
                "Exclusive Mentor Support"
            ],
            buttonText: "Coming Soon",
            highlight: false,
            isComingSoon: true,
            disabled: true,
            planKey: "pro"
        }
    ];

    const handlePayment = async (plan: string) => {
        if (!user) {
            navigate('/auth');
            return;
        }

        setIsLoading(true);

        try {
            const txnid = "TXN_" + new Date().getTime();
            const amount = plan === "student" ? "199" : "349";
            const productinfo = "PremiumMembership_" + plan;
            const firstname = (user.fullName || "User").split(" ")[0] || "User";
            const email = user.email;

            const response = await api.post("/payment/hash", {
                txnid,
                amount,
                productinfo,
                firstname,
                email
            });

            const { hash, key } = response.data;

            const payuForm = document.createElement("form");
            payuForm.action = "https://secure.payu.in/_payment";
            payuForm.method = "POST";

            const params = {
                key,
                txnid,
                amount,
                productinfo,
                firstname,
                email,
                phone: "9999999999",
                surl: `${API_BASE_URL}/payment/verify`,
                furl: `${API_BASE_URL}/payment/verify`,
                hash,
                service_provider: "payu_paisa",
                udf1: "",
                udf2: "",
                udf3: "",
                udf4: "",
                udf5: ""
            };

            Object.entries(params).forEach(([key, value]) => {
                const input = document.createElement("input");
                input.type = "hidden";
                input.name = key;
                input.value = value as string;
                payuForm.appendChild(input);
            });

            document.body.appendChild(payuForm);
            payuForm.submit();
        } catch (error: any) {
            console.error("Payment initiation failed:", error);
            const errorMessage = error.response?.data?.message || error.message || "Unknown error";
            alert(`Failed to initiate payment: ${errorMessage}`);
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 selection:bg-purple-500/30 font-display">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-white">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-400 mb-4" />
                    <h2 className="text-xl font-bold">Initiating Payment...</h2>
                    <p className="text-slate-400 mt-2">Please do not close or refresh the page</p>
                </div>
            )}

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-[#0A0A1A]">
                {/* Dynamic Animated Background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] max-w-[800px] max-h-[800px] rounded-full bg-purple-600/20 blur-[120px] animate-pulse mix-blend-screen" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] rounded-full bg-blue-600/20 blur-[120px] animate-pulse mix-blend-screen" style={{ animationDelay: '2s', animationDuration: '4s' }} />
                    <div className="absolute top-[40%] left-[60%] w-[40vw] h-[40vw] max-w-[500px] max-h-[500px] rounded-full bg-pink-600/20 blur-[100px] animate-pulse mix-blend-screen" style={{ animationDelay: '1s', animationDuration: '5s' }} />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light" />
                </div>

                {/* Navbar Placeholder space or actual Navbar if included */}

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20 sm:pb-32 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl mb-8"
                    >
                        <Sparkles className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-semibold text-white/90">Unlock Your Full Potential with AI</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl sm:text-6xl md:text-8xl font-black text-white mb-6 tracking-tight leading-tight"
                    >
                        Success is <br className="hidden sm:block" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-gradient-slow pb-2">Affordable</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg sm:text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed font-medium"
                    >
                        Join the revolution with our ₹199 Student Pro plan. Get the tools you need to crack NEET, at a price that respects your budget.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 w-full px-4 sm:px-0"
                    >
                        <button
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold text-lg hover:bg-purple-50 transition-all hover:scale-105 active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2"
                        >
                            View All Plans
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto pt-10 border-t border-white/10">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center group">
                                <div className="text-3xl sm:text-5xl font-black text-white mb-2 group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
                                <div className="text-sm sm:text-base font-medium text-slate-400 uppercase tracking-wider">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pricing Section */}
            <div id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
                <div className="text-center mb-16">
                    <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mb-6">Choose Your Growth Path</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">Invest in yourself. Whether you're just starting or aiming for the top rank, we have a plan for you.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative z-10">
                    {tiers.map((tier, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className={`relative backdrop-blur-2xl rounded-[2.5rem] p-8 border flex flex-col justify-between group transition-all duration-500 overflow-hidden ${tier.highlight
                                ? "bg-white/95 dark:bg-slate-800/95 border-purple-500 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.4)] scale-105 z-20"
                                : "bg-white/80 dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 shadow-xl z-10 hover:border-slate-300 dark:hover:border-slate-700"
                                }`}
                        >
                            {tier.highlight && (
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500" />
                            )}
                            
                            {tier.highlight && (
                                <div className="absolute top-6 right-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                    Recommended
                                </div>
                            )}

                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{tier.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-medium line-clamp-2">{tier.description}</p>

                                <div className="flex items-end gap-1 mb-8">
                                    <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter">₹{tier.price}</span>
                                    <span className="text-slate-500 font-bold mb-2 text-lg">/{tier.period}</span>
                                </div>

                                <ul className="space-y-4 mb-10">
                                    {tier.features.map((feature, fIndex) => (
                                        <li key={fIndex} className="flex items-start gap-3 group/item">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors ${tier.highlight ? "bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400" : "bg-slate-100 dark:bg-slate-800 text-slate-500"}`}>
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover/item:text-slate-900 dark:group-hover/item:text-white transition-colors">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={() => !tier.isComingSoon && handlePayment(tier.planKey)}
                                disabled={tier.disabled && !tier.highlight}
                                className={`w-full py-5 rounded-2xl font-bold text-base transition-all relative overflow-hidden group/btn ${tier.isComingSoon
                                    ? "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                                    : tier.highlight
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:shadow-2xl hover:-translate-y-1 active:scale-95"
                                        : "bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white hover:border-purple-500 transition-colors active:scale-95"
                                    }`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {tier.buttonText}
                                    {!tier.isComingSoon && !tier.disabled && <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />}
                                </span>
                                {tier.highlight && !tier.isComingSoon && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover/btn:opacity-10 transition-opacity duration-300" />
                                )}
                            </button>

                            {tier.isComingSoon && (
                                <div className="absolute inset-0 bg-white/40 dark:bg-black/40 backdrop-blur-[1px] pointer-events-none rounded-[2.5rem]" />
                            )}
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Showcase Section */}
            <div className="bg-slate-100 dark:bg-slate-800/50 py-24 mb-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-purple-600 dark:text-purple-400 font-bold tracking-widest uppercase text-xs">Why go pro?</span>
                        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white mt-4">Premium Learning Experience</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6 font-bold text-xl">01</div>
                            <h3 className="text-xl font-bold mb-3 dark:text-white">Ad-Free Learning</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Focus entirely on your goals without any digital noise or interruptions during your study sessions.</p>
                        </div>
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6 font-bold text-xl">02</div>
                            <h3 className="text-xl font-bold mb-3 dark:text-white">Priority AI Doubts</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Get faster, deeper, and more detailed explanations for your complex doubts with our premium AI model.</p>
                        </div>
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-xl transition-shadow lg:col-span-1 md:col-span-2 lg:block">
                            <div className="w-12 h-12 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center text-pink-600 dark:text-pink-400 mb-6 font-bold text-xl">03</div>
                            <h3 className="text-xl font-bold mb-3 dark:text-white">Full Mock Access</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">Simulate real exam conditions with our curated mock papers covering the latest NEET and JEE patterns.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
                <div className="bg-gradient-to-br from-indigo-700 to-purple-800 rounded-[3rem] p-8 sm:p-16 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/2" />
                    
                    <h3 className="text-3xl sm:text-5xl font-black text-white mb-6 relative z-10 leading-tight">Ready to boost your rank?</h3>
                    <p className="text-indigo-100 text-lg mb-10 relative z-10 font-medium max-w-xl mx-auto">Join thousands of students who are already using YUGA AI to achieve their medical dream.</p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <button
                            onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                            className="w-full sm:w-auto bg-white text-indigo-700 px-10 py-4 rounded-2xl font-black text-lg hover:bg-slate-50 transition-all hover:scale-105 shadow-xl"
                        >
                            Get Started
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full sm:w-auto bg-white/10 text-white border border-white/20 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-all"
                        >
                            Explore Features
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};
