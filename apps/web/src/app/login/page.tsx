"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { ArrowRight, ArrowLeft, ArrowRight as ArrowRightIcon, Lock, Mail, Shield, User, MapPin } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/authStore";

const DEMO_ROLES = [
  { label: "Super Admin (HQ)", email: "admin@neroute.gov.in", pass: "admin123", role: "SUPER_ADMIN" },
  { label: "Regional Admin", email: "regional.assam@neroute.gov.in", pass: "admin123", role: "REGIONAL_ADMIN" },
  { label: "District Officer", email: "officer.kamrup@neroute.gov.in", pass: "officer123", role: "DISTRICT_OFFICER" },
  { label: "Field Officer", email: "field.cachar@neroute.gov.in", pass: "field123", role: "FIELD_OFFICER" },
  { label: "Logistics Lead", email: "logistics.lead@ner-freight.in", pass: "operator123", role: "LOGISTICS_OPERATOR" },
];

const STATES = [
  "ASSAM",
  "MEGHALAYA",
  "TRIPURA",
  "MIZORAM",
  "MANIPUR",
  "NAGALAND",
  "ARUNACHAL PRADESH",
  "SIKKIM"
];

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("admin@neroute.gov.in");
  const [password, setPassword] = useState("admin123");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  const loginMutation = useMutation({
    mutationFn: async () => {
      // Mock login for demo environment if API URL is not set or defaults to localhost
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1";
      if (!process.env.NEXT_PUBLIC_API_URL || apiUrl.includes("127.0.0.1") || apiUrl.includes("localhost")) {
        await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
        const role = DEMO_ROLES.find(r => r.email === email)?.role || "SUPER_ADMIN";
        
        // Mock successful response
        return {
          user: {
            id: "usr_mock_123",
            email: email,
            full_name: email.split('@')[0],
            role: role,
          },
          access_token: "mock-jwt-token-for-demo-env"
        };
      }

      // Real API request
      return apiClient<any>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },
    onSuccess: (data) => {
      setAuth(data.user, data.access_token);
      router.push("/");
    },
    onError: (err: any) => {
      setErrorMessage(err.message || "Invalid credentials. Please verify email and password.");
      setIsShaking(false);
      setTimeout(() => setIsShaking(true), 10);
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    loginMutation.mutate();
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans selection:bg-brand-500 selection:text-white relative overflow-hidden">
      
      <div className="flex-1 w-full flex flex-col relative z-10">
        
        {/* Top Logo - Bespoke SETU NER Badge */}
        <div className="absolute top-6 left-6 md:top-10 md:left-10 z-50 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-3 group cursor-pointer">
            
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-full border-[2.5px] border-[#0f172a] bg-white flex flex-col items-center justify-start pt-[6px] md:pt-[7px] overflow-hidden shadow-lg shadow-blue-900/10 group-hover:scale-105 group-hover:shadow-blue-900/20 transition-all duration-300">
              <span className="text-[8px] md:text-[10px] font-black tracking-[0.1em] text-[#0f172a] leading-[1]">SETU</span>
              <span className="text-[8px] md:text-[10px] font-black tracking-[0.1em] text-[#0f172a] leading-[1]">NER</span>
              
              <div className="absolute bottom-[-1px] left-1/2 -translate-x-1/2 w-[110%]">
                <svg viewBox="0 0 100 45" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                  {/* Middle Mountain (Tallest) - Dark Navy */}
                  <path d="M50 5 L15 45 L85 45 Z" fill="#0f172a" />
                  <path d="M50 5 L35 23 L42 26 L50 18 L58 27 L65 22 Z" fill="white" />
                  
                  {/* Left Mountain - Mid Blue */}
                  <path d="M25 18 L-5 45 L55 45 Z" fill="#0284c7" />
                  <path d="M25 18 L12 30 L18 32 L25 26 L32 33 L38 29 Z" fill="white" />
                  
                  {/* Right Mountain - Light Blue */}
                  <path d="M75 14 L45 45 L105 45 Z" fill="#0ea5e9" />
                  <path d="M75 14 L62 26 L68 29 L75 23 L82 31 L88 26 Z" fill="white" />

                  {/* Swooping River/Base */}
                  <path d="M-10 40 Q 25 30 50 42 T 110 38 L 110 45 L -10 45 Z" fill="#38bdf8" />
                  <path d="M-10 43 Q 25 35 50 44 T 110 42 L 110 45 L -10 45 Z" fill="#0284c7" opacity="0.5" />
                </svg>
              </div>
            </div>
            
            <span className="font-bold text-xl tracking-tight hidden md:block aurora-text">
              SETU NER
            </span>
          </div>
        </div>

        {/* Main Centered Content */}
        <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 md:py-20 text-center max-w-5xl mx-auto w-full relative z-10">
          
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out relative">
            
            {/* The Dome exactly behind the text */}
            <div 
              className="absolute left-1/2 -translate-x-1/2 top-[-20%] w-[200vw] sm:w-[150vw] md:w-[120vw] h-[100vh] bg-gradient-to-r from-blue-200 via-purple-200 to-fuchsia-200 blur-[30px] mix-blend-multiply pointer-events-none -z-10"
              style={{ borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }}
            />

            {/* Small Subtitle */}
            <div className="flex items-center justify-center gap-3 text-[11px] md:text-xs font-semibold tracking-[0.2em] text-slate-500 uppercase">
              <ArrowRight className="w-3.5 h-3.5 opacity-50" />
              <span>MDoNER Official Platform • Unified Intelligence</span>
              <ArrowLeft className="w-3.5 h-3.5 opacity-50" />
            </div>

            {/* Massive Headline */}
            <h1 
              className="text-[3rem] sm:text-6xl md:text-[5.2rem] lg:text-[5.5rem] font-normal leading-[0.9] text-[#111827] px-4"
              style={{ letterSpacing: "-0.03em", wordSpacing: "0.05em" }}
            >
              Secure the region. <br className="hidden md:block" />
              Predict hazards. <br className="hidden md:block" />
              <span className="aurora-text block text-[1.15em] pb-2 uppercase tracking-tighter font-black">OPTIMIZE LOGISTICS.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-slate-500 font-normal max-w-2xl mx-auto leading-relaxed mt-8">
              Sharpen your situational awareness, look enterprise-ready, and launch a high-functioning response network that delivers.
            </p>
          </div>

          {/* Login Interface */}
          <div className="w-full max-w-md mx-auto mt-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200 fill-mode-both ease-out relative">
            
            {/* The Form */}
            <div className="glass-modal p-8 rounded-[2rem] relative z-10">
              
              {errorMessage && (
                <div className="mb-6 p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-medium flex items-center justify-center gap-2">
                  <Shield className="w-4 h-4" />
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className={`t-input-wrap ${errorMessage ? "is-error" : ""}`}>
                  <div className={`relative ${errorMessage ? "is-error" : ""} ${isShaking ? "is-shaking" : ""}`} onAnimationEnd={() => setIsShaking(false)}>
                    <Mail className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 z-10 ${errorMessage ? "text-rose-400" : "text-slate-400"}`} />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 text-sm focus:outline-none transition-all placeholder:text-slate-400 text-center font-medium"
                      placeholder="Email address"
                    />
                  </div>
                </div>

                <div className={`t-input-wrap ${errorMessage ? "is-error" : ""}`}>
                  <div className={`relative ${errorMessage ? "is-error" : ""} ${isShaking ? "is-shaking" : ""}`}>
                    <Lock className={`w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 z-10 ${errorMessage ? "text-rose-400" : "text-slate-400"}`} />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrorMessage(null);
                      }}
                      className="w-full glass-input rounded-2xl pl-12 pr-4 py-3.5 text-slate-900 text-sm focus:outline-none transition-all placeholder:text-slate-400 text-center font-medium"
                      placeholder="Password"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="group relative w-full flex items-center justify-center px-8 h-16 bg-[#0f172a] text-white rounded-full font-medium text-lg hover:bg-[#1e293b] hover:shadow-2xl hover:shadow-brand-500/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                  >
                    {/* Subtle sweep effect on hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                    
                    {loginMutation.isPending ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <div className="relative flex items-center justify-center w-full h-full">
                        
                        {/* Default State */}
                        <div className="absolute flex items-center gap-3 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:-translate-y-12 group-hover:opacity-0">
                          <div className="bg-white/10 p-1.5 rounded-full">
                            <User className="w-4 h-4" />
                          </div>
                          <span>Access Command Center</span>
                        </div>

                        {/* Hover State ("sign in sort of") */}
                        <div className="absolute flex items-center gap-3 translate-y-12 opacity-0 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-0 group-hover:opacity-100">
                          <div className="bg-brand-500 p-1.5 rounded-full shadow-[0_0_15px_rgba(14,165,233,0.4)]">
                            <Lock className="w-4 h-4 text-white" />
                          </div>
                          <span className="font-semibold tracking-wide">Secure Sign In</span>
                        </div>
                        
                      </div>
                    )}
                  </button>
                </div>
              </form>
              
              <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap justify-center gap-2">
                {DEMO_ROLES.map((r, i) => (
                  <button
                    key={r.email}
                    type="button"
                    onClick={() => handleQuickFill(r.email, r.pass)}
                    className="px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-semibold uppercase tracking-wide transition-colors"
                  >
                    {r.label.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Subtle Ghost Link below form */}
            <div className="mt-6 flex justify-center">
              <Link href="/docs" className="text-slate-600 font-medium text-sm hover:text-slate-900 transition-colors flex items-center gap-2">
                Explore Documentation <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
          </div>
          
          <div className="mt-16 text-[10px] md:text-xs font-semibold tracking-[0.15em] text-slate-400 uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both">
            For Government Agencies who need Clarity + Credibility + Conversion
          </div>
        </main>

        {/* Footer mimicking jords.co.uk */}
        <div className="w-full relative overflow-hidden bg-[#F8F9FA] pt-12 pb-12 flex flex-col items-center justify-center border-t border-slate-200/50 animate-in fade-in duration-1000 delay-700 fill-mode-both">
          
          {/* Massive Background Text */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none select-none flex justify-center z-0 translate-y-1/4 pointer-events-none">
          <span className="text-[16vw] font-black text-black/[0.04] tracking-[0.05em] whitespace-nowrap">
            SETU-NER
          </span>
        </div>

          <div className="relative z-10 flex flex-col items-center space-y-10 w-full max-w-5xl px-6">
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-md shadow-sm">
              <Shield className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-bold text-slate-700">Authorized Portal</span>
            </div>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-12 text-[11px] font-mono text-slate-400 font-semibold tracking-widest uppercase">
              <span className="flex items-center gap-2">
                <span className="text-slate-300 font-light text-base">[</span>
                GUWAHATI: IST
                <span className="text-slate-300 font-light text-base">]</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-slate-300 font-light text-base">[</span>
                SHILLONG: IST
                <span className="text-slate-300 font-light text-base">]</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-slate-300 font-light text-base">[</span>
                NEW DELHI: IST
                <span className="text-slate-300 font-light text-base">]</span>
              </span>
            </div>

            <div className="text-[10px] md:text-xs font-medium text-slate-400 tracking-widest uppercase text-center max-w-3xl leading-relaxed opacity-80">
              © 2026 MINISTRY OF DEVELOPMENT OF NORTH EASTERN REGION. ALL RIGHTS RESERVED. GOVERNMENT OF INDIA | PLATFORM VERSION: 2.4.1
            </div>

            <div className="flex gap-8 text-[10px] md:text-xs font-bold text-slate-400 tracking-widest uppercase">
              <a href="#" className="hover:text-slate-900 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-slate-900 transition-colors">Support</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
