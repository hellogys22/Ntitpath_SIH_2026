import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  ShieldCheck, 
  Zap, 
  LineChart, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  FileCheck2, 
  AlertTriangle, 
  GitBranch, 
  Sparkles,
  Search,
  Shield,
  Clock,
  Layers,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { enterDemoMode } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <IntelligenceBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-govNavy-900 via-govNavy-850 to-govNavy-950 text-white py-20 px-4 sm:px-6 lg:px-8 border-b border-govNavy-800 relative overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative z-10">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Industrial Approval & Compliance Intelligence Platform</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white leading-tight">
            Navigate Your Industrial Approval Journey with Clarity
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            <strong>NitiPath</strong> helps businesses identify approval requirements, detect document issues before submission, understand risks and dependencies, optimize their approval journey, and stay ahead of compliance.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/assessment"
              className="w-full sm:w-auto px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-govNavy-950 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 hover:shadow-xl cursor-pointer"
            >
              <span>Start Business Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => {
                enterDemoMode();
                navigate('/dashboard');
              }}
              className="w-full sm:w-auto px-7 py-3.5 bg-govNavy-900/40 hover:bg-amber-500/10 text-amber-300 hover:text-amber-200 font-bold text-sm rounded-xl border-2 border-amber-400/60 hover:border-amber-400 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>View Demo Dashboard</span>
            </button>

            <a
              href="#how-it-works"
              className="w-full sm:w-auto px-6 py-3.5 bg-govNavy-800 hover:bg-govNavy-700 text-slate-200 font-bold text-sm rounded-xl border border-govNavy-600 transition-colors flex items-center justify-center gap-2"
            >
              <span>Explore How It Works</span>
            </a>
          </div>

          <p className="mt-6 text-xs text-slate-400 font-medium">
            ✓ Built for clearer, more predictable regulatory journeys • Public Sector Digital Intelligence
          </p>

        </div>
      </section>

      {/* Core Value Section: PREDICT - PREVENT - OPTIMIZE - TRACK */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-extrabold uppercase tracking-wider text-govNavy-700 bg-govNavy-50 px-3 py-1 rounded-full border border-govNavy-200">
            NitiPath Core Intelligence Value
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-3">
            An Intelligence Layer Around the Approval Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto mt-2">
            NitiPath is NOT another government submission portal. It provides decision support to answer what you need, what is wrong, and what to do next.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-govNavy-500 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center mb-4 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">PREDICT</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Identify potential approval risks, statutory dependencies, and inter-departmental bottlenecks before they become costly project delays.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-govNavy-500 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">PREVENT</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Detect missing documents, dimensional area mismatches, and output capacity inconsistencies across drawings prior to official filing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-govNavy-500 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center mb-4 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">OPTIMIZE</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Identify independent parallel approval opportunities and focus execution effort directly on critical-path bottlenecks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:border-govNavy-500 transition-all group">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <LineChart className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">TRACK</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Monitor approval stage progression, next best actions, statutory renewals, and ongoing post-commissioning compliance deadlines.
            </p>
          </div>

        </div>
      </section>

      {/* Existing Portals vs NitiPath Matrix Table */}
      <section className="py-16 bg-slate-100/70 border-y border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-slate-900">Existing Approval Portals vs NitiPath</h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              NitiPath works around the existing approval ecosystem as an intelligence layer.
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-12 bg-govNavy-900 text-white text-xs font-bold p-4">
              <div className="col-span-5 text-slate-300 uppercase tracking-wider">Traditional Approval Portals</div>
              <div className="col-span-7 text-amber-400 uppercase tracking-wider font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                NitiPath Intelligence Platform
              </div>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="grid grid-cols-12 p-4 items-center hover:bg-slate-50">
                <div className="col-span-5 text-slate-600 font-medium">Apply for clearances</div>
                <div className="col-span-7 text-slate-900 font-bold">Understand statutory applicability & prerequisites</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center hover:bg-slate-50">
                <div className="col-span-5 text-slate-600 font-medium">Track submitted application status</div>
                <div className="col-span-7 text-slate-900 font-bold">Predict potential risks and inter-department locks</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center hover:bg-slate-50">
                <div className="col-span-5 text-slate-600 font-medium">Store document uploads</div>
                <div className="col-span-7 text-slate-900 font-bold">Check document consistency & area dimension mismatches</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center hover:bg-slate-50">
                <div className="col-span-5 text-slate-600 font-medium">View static stage updates</div>
                <div className="col-span-7 text-slate-900 font-bold">Identify root-cause risk before submission</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center hover:bg-slate-50">
                <div className="col-span-5 text-slate-600 font-medium">Linear approval checklist</div>
                <div className="col-span-7 text-slate-900 font-bold">Dependency intelligence & parallel work mapping</div>
              </div>

              <div className="grid grid-cols-12 p-4 items-center hover:bg-slate-50">
                <div className="col-span-5 text-slate-600 font-medium">Generic informational guidelines</div>
                <div className="col-span-7 text-slate-900 font-bold">Prioritized "Your Next Best Action" guidance</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6-Step How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Structured Process</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">How NitiPath Works</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">Six steps from business profiling to post-commissioning compliance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-black text-govNavy-700/20 absolute top-4 right-4">01</span>
            <div className="flex items-center gap-2 text-govNavy-700 font-bold text-xs">
              <Building2 className="w-4 h-4" />
              <span>Step 01</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2">Business Profile</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Tell NitiPath about your business, sector, investment scale, employee count, and land parameters.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-black text-govNavy-700/20 absolute top-4 right-4">02</span>
            <div className="flex items-center gap-2 text-govNavy-700 font-bold text-xs">
              <Layers className="w-4 h-4" />
              <span>Step 02</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2">Approval Plan</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Understand all statutory approvals, state permits, and municipal licenses relevant to your project.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-black text-govNavy-700/20 absolute top-4 right-4">03</span>
            <div className="flex items-center gap-2 text-govNavy-700 font-bold text-xs">
              <FileCheck2 className="w-4 h-4" />
              <span>Step 03</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2">Document Check</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Verify required documents and identify dimensional area or capacity inconsistencies prior to filing.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-black text-govNavy-700/20 absolute top-4 right-4">04</span>
            <div className="flex items-center gap-2 text-govNavy-700 font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Step 04</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2">Risk & Dependencies</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Understand potential approval risks, inter-department locks, and high-impact delay bottlenecks.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-black text-govNavy-700/20 absolute top-4 right-4">05</span>
            <div className="flex items-center gap-2 text-govNavy-700 font-bold text-xs">
              <GitBranch className="w-4 h-4" />
              <span>Step 05</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2">Optimized Path</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Identify independent parallel work and focus attention on the statutory critical path.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs relative">
            <span className="text-2xl font-black text-govNavy-700/20 absolute top-4 right-4">06</span>
            <div className="flex items-center gap-2 text-govNavy-700 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Step 06</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-2">Support & Compliance</h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Discover matched government incentive schemes and track post-commissioning renewal deadlines.
            </p>
          </div>

        </div>
      </section>

      {/* Final Call to Action */}
      <section className="bg-govNavy-900 text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-govNavy-800 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold">One Journey. Clearer Decisions.</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
            Eliminate approval guesswork and prevent avoidable document errors. Start your business assessment today.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/assessment"
              className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-govNavy-950 font-extrabold text-sm rounded-xl shadow-lg transition-all flex items-center gap-2"
            >
              <span>Start Your Approval Journey</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={() => {
                enterDemoMode();
                navigate('/dashboard');
              }}
              className="px-6 py-3.5 bg-transparent hover:bg-amber-500/10 text-amber-300 hover:text-amber-200 font-bold text-sm rounded-xl border-2 border-amber-400/60 hover:border-amber-400 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>View Demo Dashboard</span>
            </button>

            <Link
              to="/login"
              className="px-6 py-3.5 bg-govNavy-800 hover:bg-govNavy-700 text-white font-bold text-sm rounded-xl border border-govNavy-600 transition-colors"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
