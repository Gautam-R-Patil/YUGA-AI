import { Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const IQQuizSection = () => {
    const navigate = useNavigate();

    return (
        <div className="mb-8 animate-slide-in-top">
            <div
                onClick={() => navigate('/iq-quiz')}
                className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-[2.5rem] p-8 cursor-pointer group hover:shadow-2xl transition-all duration-700 border border-white/10 shadow-premium-xl"
            >
                {/* Abstract Glassmorphism effects */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] -mr-48 -mt-48 group-hover:bg-blue-500/20 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 rounded-full blur-[80px] -ml-32 -mb-32" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                        <div className="relative">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                <Sparkles className="w-10 h-10 text-yellow-400 animate-pulse" />
                            </div>
                            <div className="absolute -top-2 -right-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-[10px] font-black text-slate-950 rounded-full uppercase tracking-tighter shadow-lg">
                                NEW
                            </div>
                        </div>

                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-3">
                                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />
                                <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Live: IQ Assessment</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2">
                                Take a <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-cyan-200 to-blue-200">Quick Quiz</span>
                            </h2>
                            <p className="text-white/60 font-medium text-lg max-w-xl">
                                Challenge your logical, numerical, and verbal reasoning with our advanced AI-driven IQ evaluation.
                            </p>
                        </div>
                    </div>

                    <div className="flex flex-col items-center gap-3">
                        <button className="whitespace-nowrap px-8 py-4 bg-white text-indigo-950 font-black rounded-2xl group-hover:bg-indigo-50 transition-all flex items-center gap-3 shadow-xl hover:shadow-white/10 active:scale-95">
                            Take Test Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Estimated time: 10 mins</span>
                    </div>
                </div>

                {/* Decorative particles (simulated) */}
                <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white/40 rounded-full animate-pulse" />
                <div className="absolute top-3/4 left-2/3 w-1.5 h-1.5 bg-blue-400/40 rounded-full animate-bounce" style={{ animationDuration: '3s' }} />
                <div className="absolute top-10 right-1/3 w-1 h-1 bg-purple-400/40 rounded-full animate-ping" />
            </div>
        </div>
    );
};
