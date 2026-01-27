"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, Lock, User, ArrowRight, Code2, Rocket, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" as const }
  })
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: "easeOut" as const }
  })
};

const fadeInRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: "easeOut" as const }
  }
};

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const router = useRouter();
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Registration failed");
        return;
      }

      toast.success("Account created successfully!");
      router.push("/login");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const benefits = [
    "Share unlimited code snippets",
    "Join 10,000+ developers",
    "Organize with collections",
    "Get feedback from community",
  ];

  return (
    <div className="min-h-screen flex relative overflow-hidden">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50 relative order-2 lg:order-1">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(147,51,234,0.05),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(6,182,212,0.05),transparent_50%)]" />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInRight}
          className="w-full max-w-md relative z-10"
        >
          {/* Mobile logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden flex justify-center mb-8"
          >
            <Link href="/" className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CodeSnippet</span>
            </Link>
          </motion.div>

          {/* Header */}
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="text-center mb-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-50 to-purple-50 border border-cyan-100 text-sm text-cyan-700 mb-6"
            >
              <Rocket className="w-4 h-4" />
              <span>Start your journey</span>
            </motion.div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              {t("auth.registerTitle")}
            </h2>
            <p className="text-gray-500">
              {t("auth.or")}{" "}
              <Link
                href="/login"
                className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
              >
                {t("auth.loginTitle")}
              </Link>
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name field */}
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                {t("common.name")}
              </label>
              <div className={`relative group transition-all duration-300 ${focusedField === 'name' ? 'scale-[1.02]' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'name' ? 'text-purple-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-gray-300"
                  placeholder={t("common.namePlaceholder")}
                />
              </div>
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                {t("common.email")}
              </label>
              <div className={`relative group transition-all duration-300 ${focusedField === 'email' ? 'scale-[1.02]' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'email' ? 'text-purple-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-gray-300"
                  placeholder={t("common.emailPlaceholder")}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                {t("common.password")}
              </label>
              <div className={`relative group transition-all duration-300 ${focusedField === 'password' ? 'scale-[1.02]' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className={`w-5 h-5 transition-colors duration-300 ${focusedField === 'password' ? 'text-purple-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  className="block w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-2xl text-gray-900 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 hover:border-gray-300"
                  placeholder={t("common.passwordPlaceholder")}
                  minLength={6}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1 ml-1">Minimum 6 characters</p>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex items-center justify-center gap-3 py-4 px-6 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-semibold rounded-2xl transition-all duration-300 hover:from-cyan-600 hover:to-purple-700 hover:shadow-xl hover:shadow-purple-500/25 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t("common.register")}</span>
                  <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <motion.p
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mt-8 text-center text-sm text-gray-500"
          >
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-purple-600 hover:text-purple-700 font-medium">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
              Privacy Policy
            </Link>
          </motion.p>
        </motion.div>
      </div>

      {/* Right side - Branding */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 order-1 lg:order-2"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
          <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          <motion.div
            custom={0}
            initial="hidden"
            animate="visible"
            variants={fadeInLeft}
          >
            <Link href="/" className="flex items-center gap-3 mb-12 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-500 shadow-lg shadow-purple-500/25 group-hover:shadow-purple-500/40 transition-shadow"
              >
                <Code2 className="w-8 h-8 text-white" />
              </motion.div>
              <span className="text-2xl font-bold text-white">CodeSnippet</span>
            </Link>
          </motion.div>

          <motion.h1
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeInLeft}
            className="text-4xl xl:text-5xl font-bold text-white mb-6 leading-tight"
          >
            Join the community
            <span className="block bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              of code creators
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInLeft}
            className="text-lg text-gray-300 mb-12 max-w-md leading-relaxed"
          >
            Create an account to share your code snippets, discover solutions, and connect with developers around the world.
          </motion.p>

          {/* Benefits */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                custom={index + 3}
                initial="hidden"
                animate="visible"
                variants={fadeInLeft}
                className="flex items-center gap-3 text-gray-300 group"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1, type: "spring", stiffness: 500 }}
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                </motion.div>
                <span className="group-hover:text-white transition-colors">{benefit}</span>
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-12 flex gap-8"
          >
            {[
              { value: "10K+", label: "Developers" },
              { value: "50K+", label: "Snippets" },
              { value: "100+", label: "Languages" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9 + index * 0.1 }}
              >
                <div className="text-3xl font-bold text-white">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Floating code blocks decoration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="absolute bottom-12 left-12"
        >
          <pre className="text-xs text-purple-300 font-mono">
{`const developer = {
  name: "You",
  skills: ["awesome"]
};`}
          </pre>
        </motion.div>
      </motion.div>
    </div>
  );
}
