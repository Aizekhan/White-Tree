import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, KeyRound, TreeDeciduous, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';
import logo from "../../../../assets/logo.png";

interface LoginProps {
    t: any;
}

export default function Login({ t }: LoginProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                if (password !== confirmPassword) {
                    setError('Passwords do not match');
                    setIsLoading(false);
                    return;
                }
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err: any) {
            console.error("Auth error:", err);
            if (err.code === 'auth/invalid-credential') {
                setError(t.invalidCredentials || 'Invalid email or password');
            } else if (err.code === 'auth/email-already-in-use') {
                setError(t.emailInUse || 'Email already in use');
            } else if (err.code === 'auth/weak-password') {
                setError(t.weakPassword || 'Password should be at least 6 characters');
            } else {
                setError(err.message || 'Authentication failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-ink flex items-center justify-center p-6 relative overflow-hidden">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/20 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-paper p-8 rounded-3xl shadow-2xl border border-ink/5">
                    <div className="flex flex-col items-center mb-8 text-center">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg shadow-violet-500/30 mb-4 cursor-pointer hover:scale-105 transition-transform">
                            <img src={logo} alt="WhiteWrite Logo" className="w-full h-full object-cover" />
                        </div>
                        <h1 className="font-serif text-2xl font-bold text-ink mb-2">
                            {isLogin
                                ? (t.welcomeBack || "Welcome Back")
                                : (t.beginJourney || "Begin Your Narrative Journey")}
                        </h1>
                        <p className="text-sm text-ink/50 max-w-[260px] leading-relaxed">
                            {isLogin
                                ? (t.loginDesc || "Sign in to access your worlds, characters, and stories.")
                                : (t.signupDesc || "Create an account to start building your interconnected story universes.")}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-1">
                                {t.email || 'Email'}
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30">
                                    <Mail size={16} />
                                </div>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-ink/5 border border-ink/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-ink/20"
                                    placeholder="author@example.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-1">
                                {t.password || 'Password'}
                            </label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30">
                                    <Lock size={16} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-ink/5 border border-ink/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-ink/20"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <AnimatePresence>
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="space-y-1 overflow-hidden"
                                >
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-ink/40 ml-1">
                                        {t.confirmPassword || 'Confirm Password'}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/30">
                                            <Lock size={16} />
                                        </div>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required={!isLogin}
                                            className="w-full bg-ink/5 border border-ink/10 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-xl py-3 pl-10 pr-4 text-sm outline-none transition-all placeholder:text-ink/20"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="text-[11px] font-bold text-red-500 bg-red-50 p-3 rounded-xl border border-red-100 flex items-center gap-2">
                                        {error}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button
                            type="submit"
                            disabled={isLoading || !email || !password || (!isLogin && !confirmPassword)}
                            className="w-full bg-ink hover:bg-ink/90 text-paper disabled:bg-ink/40 py-3 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all flex items-center justify-center gap-2 mt-6 shadow-xl shadow-ink/10"
                        >
                            {isLoading ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <>
                                    <KeyRound size={16} />
                                    {isLogin ? (t.signIn || 'Sign In') : (t.createAccount || 'Create Account')}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 flex flex-col items-center">
                        <div className="w-full h-px bg-ink/5 relative mb-6">
                            <span className="absolute left-1/2 -translate-x-1/2 -top-2.5 bg-paper px-4 text-[10px] font-bold text-ink/30 uppercase tracking-widest">or</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(!isLogin);
                                setError(null);
                            }}
                            className="text-xs font-bold text-violet-600 hover:text-indigo-700 bg-violet-50 hover:bg-violet-100 px-6 py-2.5 rounded-full transition-all ring-1 ring-violet-500/20 shadow-sm"
                        >
                            {isLogin
                                ? (t.needAccount || "Create a new account instead")
                                : (t.alreadyHaveAccount || "Sign in to existing account")}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
