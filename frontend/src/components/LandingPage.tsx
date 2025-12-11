import React, { useState, useEffect } from 'react';
import {
  FileText, ArrowRight, Users, Zap, Shield, BarChart3, Star, CheckCircle, Play,
  Award, TrendingUp, Clock, Target, Globe, Sparkles, ChevronDown, Menu, X,
  Brain, Rocket, Database, Lock, Headphones, Coffee, Sun, Moon
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import Hero3D from './Hero3D';
import Dashboard3D from './Dashboard3D';
import Globe3D from './Globe3D';

const LandingPage: React.FC = () => {
  const { setCurrentPage, theme, toggleTheme } = useApp();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Advanced AI Matching",
      description: "Our proprietary AI engine analyzes resumes with 99.7% accuracy, understanding context, skills, and experience levels.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Rocket className="w-8 h-8" />,
      title: "Lightning Fast Processing",
      description: "Process thousands of resumes in seconds. Our cloud infrastructure scales automatically to handle any volume.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Smart Analytics Dashboard",
      description: "Get deep insights with interactive charts, candidate scoring, and predictive hiring analytics.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Enterprise Security",
      description: "Bank-grade encryption, GDPR compliance, and SOC 2 certification ensure your data is always protected.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Integration",
      description: "Seamlessly integrate with 50+ ATS systems, job boards, and HR tools you already use.",
      color: "from-indigo-500 to-purple-500"
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: "24/7 Expert Support",
      description: "Our dedicated success team provides round-the-clock support and personalized onboarding.",
      color: "from-teal-500 to-blue-500"
    }
  ];

  const benefits = [
    { text: "Reduce screening time by 95%", icon: <Clock className="w-5 h-5" /> },
    { text: "Eliminate unconscious bias completely", icon: <Shield className="w-5 h-5" /> },
    { text: "Find perfect candidate matches", icon: <Target className="w-5 h-5" /> },
    { text: "Scale hiring to any volume", icon: <TrendingUp className="w-5 h-5" /> },
    { text: "Improve hire quality by 60%", icon: <Award className="w-5 h-5" /> },
    { text: "Save $50K+ in recruitment costs", icon: <Sparkles className="w-5 h-5" /> }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "VP of Talent at Microsoft",
      company: "Microsoft",
      content: "Talentify revolutionized our hiring process. We've reduced time-to-hire by 80% while improving candidate quality dramatically. The AI insights are incredibly accurate.",
      rating: 5,
      avatar: "SJ",
      results: "80% faster hiring, 60% better quality"
    },
    {
      name: "Michael Chen",
      role: "Head of Recruitment at Google",
      company: "Google",
      content: "The most sophisticated resume screening platform we've ever used. The AI understands nuances that human reviewers often miss. Game-changing technology.",
      rating: 5,
      avatar: "MC",
      results: "99.7% accuracy, 10x more candidates"
    },
    {
      name: "Emily Rodriguez",
      role: "Founder & CEO at TechStart",
      company: "TechStart",
      content: "As a startup, Talentify gives us enterprise-level hiring capabilities. We compete with Fortune 500 companies for top talent and win. Absolutely essential.",
      rating: 5,
      avatar: "ER",
      results: "500% increase in qualified candidates"
    },
    {
      name: "David Kim",
      role: "CHRO at Amazon",
      company: "Amazon",
      content: "Talentify's analytics helped us identify hiring patterns we never knew existed. The ROI has been phenomenal - over 300% in the first year alone.",
      rating: 5,
      avatar: "DK",
      results: "300% ROI, data-driven decisions"
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "49",
      period: "month",
      description: "Perfect for small teams and startups",
      features: [
        "Up to 100 resumes/month",
        "Basic AI screening",
        "Standard analytics",
        "Email support",
        "5 job postings"
      ],
      popular: false,
      color: "from-gray-500 to-gray-600"
    },
    {
      name: "Professional",
      price: "149",
      period: "month",
      description: "Ideal for growing companies",
      features: [
        "Up to 1,000 resumes/month",
        "Advanced AI screening",
        "Premium analytics",
        "Priority support",
        "Unlimited job postings",
        "ATS integrations",
        "Custom scoring models"
      ],
      popular: true,
      color: "from-blue-500 to-purple-600"
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large organizations",
      features: [
        "Unlimited resumes",
        "Custom AI models",
        "Advanced analytics suite",
        "Dedicated success manager",
        "White-label options",
        "API access",
        "Custom integrations",
        "SLA guarantees"
      ],
      popular: false,
      color: "from-purple-500 to-pink-600"
    }
  ];

  const stats = [
    { number: "10M+", label: "Resumes Processed", icon: <FileText className="w-6 h-6" /> },
    { number: "99.7%", label: "AI Accuracy", icon: <Brain className="w-6 h-6" /> },
    { number: "2,500+", label: "Companies Trust Us", icon: <Users className="w-6 h-6" /> },
    { number: "95%", label: "Time Saved", icon: <Clock className="w-6 h-6" /> }
  ];

  const integrations = [
    "Workday", "BambooHR", "Greenhouse", "Lever", "SmartRecruiters",
    "iCIMS", "Jobvite", "ADP", "SuccessFactors", "Taleo"
  ];

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 overflow-x-hidden">
      {/* Enhanced Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-800/50 z-50 shadow-sm transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg transform hover:rotate-12 transition-transform duration-300">
                <FileText size={24} className="text-white" />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Talentify
                </span>
                <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wider">AI-POWERED HIRING</div>
              </div>
            </div>

            {/* Desktop Menu */}
            <div className="hidden lg:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Pricing</a>
              <a href="#testimonials" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors">Reviews</a>

              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

              <button
                onClick={() => setCurrentPage('auth')}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setCurrentPage('auth')}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button with Theme Toggle */}
            <div className="flex items-center gap-4 lg:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-800 animate-fadeIn">
              <div className="flex flex-col gap-4 pt-4">
                <a href="#features" onClick={() => setIsMenuOpen(false)} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">Features</a>
                <a href="#pricing" onClick={() => setIsMenuOpen(false)} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">Pricing</a>
                <a href="#testimonials" onClick={() => setIsMenuOpen(false)} className="text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50">Reviews</a>
                <div className="h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                <button
                  onClick={() => setCurrentPage('auth')}
                  className="text-left text-gray-600 dark:text-gray-300 hover:text-blue-600 font-medium px-2 py-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  Sign In
                </button>
                <button
                  onClick={() => setCurrentPage('auth')}
                  className="btn btn-primary w-full shadow-lg"
                >
                  Start Free Trial
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section - 3D & Glassmorphism */}
      <section className="pt-32 pb-20 relative overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[70vw] h-[70vw] rounded-full bg-purple-500/20 dark:bg-purple-900/20 blur-[100px] animate-pulse-slow"></div>
          <div className="absolute top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-blue-500/20 dark:bg-blue-900/20 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 px-4 py-2 rounded-full mb-8 border border-blue-100 dark:border-blue-800 backdrop-blur-sm animate-fadeIn">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200 font-semibold text-sm">Trusted by 2,500+ companies worldwide</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                The Future of
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent block mt-2">
                  AI-Powered Hiring
                </span>
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Transform your recruitment with advanced AI that screens resumes 95% faster,
                eliminates bias, and finds perfect candidates with unprecedented accuracy.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={() => setCurrentPage('auth')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Start Free Trial
                  <ArrowRight size={20} />
                </button>
                <button className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center gap-2 group">
                  <Play size={20} className="text-blue-600 group-hover:scale-110 transition-transform" />
                  Watch Demo
                </button>
              </div>

              <div className="mt-12 flex items-center justify-center lg:justify-start gap-8 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                {['Microsoft', 'Google', 'Amazon', 'Meta'].map((company) => (
                  <span key={company} className="text-xl font-bold text-gray-400 dark:text-gray-500">{company}</span>
                ))}
              </div>
            </div>

            {/* 3D Visual Element */}
            <div className="relative group perspective-1000 w-full h-full flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 animate-pulse-slow"></div>

              <div className="relative w-full h-full transform transition-transform duration-500 hover:scale-[1.02]">
                <Hero3D />
                {/* <div className="flex items-center justify-center h-full text-white">3D Loading...</div> */}

                {/* Floating Cards / Glassmorphism UI Elements Overlay */}
                <div className="absolute top-10 right-10 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 transform translate-x-12 group-hover:translate-x-8 transition-transform duration-500 animation-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center text-green-600 dark:text-green-400">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">Match Found</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">98% Capability Score</div>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-10 left-10 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 dark:border-gray-700 transform -translate-x-12 group-hover:-translate-x-8 transition-transform duration-500 animation-float" style={{ animationDelay: '1.5s' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <Brain size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-900 dark:text-white">AI Analysis</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">Processing skills...</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Glassmorphism */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl p-8 border border-white/20 dark:border-gray-700 shadow-xl overflow-hidden relative">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 z-10 relative">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center group">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      {stat.icon}
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">{stat.number}</div>
                    <div className="text-gray-600 dark:text-gray-400 font-medium text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Globe 3D Visual */}
              <div className="hidden lg:block w-1/3 -my-20">
                <Globe3D />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Everything You Need to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Hire Smarter</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Our comprehensive AI platform provides all the tools you need to revolutionize your hiring process
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:transform hover:scale-105 border border-gray-100 dark:border-gray-700"
              >
                <div className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-center">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-blue-950/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Transform Your Hiring
                <span className="bg-gradient-to-r from-green-500 to-teal-400 bg-clip-text text-transparent block mt-2">
                  See Immediate Impact
                </span>
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Join thousands of companies who have revolutionized their hiring process with measurable results from day one.
              </p>

              <div className="space-y-6">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4 group p-4 rounded-xl hover:bg-white/50 dark:hover:bg-white/5 transition-colors">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shrink-0">
                      {benefit.icon}
                    </div>
                    <span className="text-gray-800 dark:text-gray-100 text-lg font-medium">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-gray-700">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 text-center">Live Impact Dashboard</h3>

                {/* 3D Dashboard Visualization */}
                <div className="mb-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <Dashboard3D />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* Stats Cards */}
                  {[
                    { val: "95%", label: "Time Saved", color: "blue" },
                    { val: "99.7%", label: "AI Accuracy", color: "purple" },
                    { val: "60%", label: "Better Hires", color: "green" },
                    { val: "$50K+", label: "Cost Savings", color: "orange" }
                  ].map((item, i) => (
                    <div key={i} className={`text-center p-6 bg-${item.color}-50 dark:bg-gray-700/50 rounded-2xl hover:bg-${item.color}-100 dark:hover:bg-gray-700 transition-colors`}>
                      <div className={`text-3xl md:text-4xl font-bold text-${item.color}-600 dark:text-${item.color}-400 mb-2`}>{item.val}</div>
                      <div className="text-gray-700 dark:text-gray-300 font-medium">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-3 mb-4">
                    <Coffee className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                    <span className="font-semibold text-gray-800 dark:text-gray-200">Real-time Processing</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Processing 1,247 resumes...</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Loved by Industry
              <span className="bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent"> Leaders</span>
            </h2>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-700 min-h-[400px] flex flex-col justify-center">
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
                <blockquote className="text-2xl md:text-3xl font-medium text-gray-800 dark:text-gray-100 leading-relaxed mb-8">
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {testimonials[currentTestimonial].avatar}
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-gray-900 dark:text-white text-lg">{testimonials[currentTestimonial].name}</div>
                    <div className="text-gray-600 dark:text-gray-400">{testimonials[currentTestimonial].role}</div>
                    <div className="text-blue-600 dark:text-blue-400 font-semibold text-sm">{testimonials[currentTestimonial].company}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center gap-2 mt-auto">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentTestimonial
                      ? 'bg-blue-600 w-8'
                      : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Start free, scale as you grow. No hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <div
                key={index}
                className={`relative bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border-2 ${plan.popular
                  ? 'border-blue-500 transform scale-105 z-10'
                  : 'border-gray-100 dark:border-gray-700 hover:border-gray-200'
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg">
                      Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                  <div className="mb-6">
                    {plan.price === "Custom" ? (
                      <div className="text-4xl font-bold text-gray-900 dark:text-white">Custom</div>
                    ) : (
                      <div className="text-gray-900 dark:text-white">
                        <span className="text-5xl font-bold">${plan.price}</span>
                        <span className="text-gray-600 dark:text-gray-400">/{plan.period}</span>
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setCurrentPage('auth')}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${plan.popular
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:shadow-xl'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                >
                  {plan.price === "Custom" ? "Contact Sales" : "Start Free Trial"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl p-12 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Transform Your Hiring Today
              </h2>
              <p className="text-xl mb-10 opacity-90 max-w-3xl mx-auto">
                Join 2,500+ companies using Talentify to find perfect candidates 95% faster.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <button
                  onClick={() => setCurrentPage('auth')}
                  className="bg-white text-blue-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:transform hover:scale-105 shadow-xl"
                >
                  Start Free Trial
                </button>
                <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-300">
                  Schedule Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 bg-gray-900 text-white dark:border-t dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <FileText size={24} className="text-white" />
                </div>
                <div>
                  <span className="text-2xl font-bold">Talentify</span>
                  <div className="text-sm text-gray-400">AI-Powered Hiring</div>
                </div>
              </div>
              <p className="text-gray-400 mb-6 max-w-md">
                Revolutionizing recruitment with advanced AI technology.
                Curating talent and creating eras in hiring excellence.
              </p>
            </div>
            {/* Links... simplified for brevity but full structure kept from original */}
            <div>
              <h5 className="font-bold mb-6 text-lg">Product</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-lg">Company</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 text-lg">Support</h5>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-gray-400">
                © 2025 Talentify. All rights reserved.
              </div>
              <div className="flex gap-6 text-gray-400 text-sm">
                <a href="#" className="hover:text-white transition-colors">Privacy</a>
                <a href="#" className="hover:text-white transition-colors">Terms</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;