import React, { useState } from 'react';
import { Bot, Send, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { Footer } from '../../components/layout/Footer';
import { CopilotMessage } from '../../types';
import { api } from '../../services/api';

export const CopilotPage: React.FC = () => {
  const { isMismatchResolved, resolveDocumentMismatch } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [input, setInput] = useState('');

  const initialMessages: CopilotMessage[] = [
    {
      id: "COP-1",
      sender: "assistant",
      text: "Welcome to NitiPath Copilot. I analyze your enterprise project parameters, document consistency reports, and statutory workflow dependencies to provide decision support.",
      timestamp: "Just now",
      basedOn: ["Project Profile Data", "Chhattisgarh Industrial Rules Matrix", "Real-Time Document Gate Audit"]
    }
  ];

  const [messages, setMessages] = useState<CopilotMessage[]>(initialMessages);

  const presetQuestions = [
    "What should I do next?",
    "Why is my pollution approval high risk?",
    "Which approvals can happen together?",
    "Which documents still need attention?"
  ];

  const handleAskQuestion = async (qText: string) => {
    const userMsg: CopilotMessage = {
      id: `MSG-${Date.now()}`,
      sender: 'user',
      text: qText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');

    let replyText = "";
    let actionLink = "";
    let actionText = "";
    let basedOn = ["Current Approval Status", "Document Gate Verification", "Risk Engine Assessment"];

    try {
      const liveRes = await api.queryCopilot('NTP-00128', qText);
      if (liveRes?.data?.reply) {
        replyText = liveRes.data.reply;
        if (liveRes.data.sources) basedOn = liveRes.data.sources;
        if (qText.toLowerCase().includes('risk') || qText.toLowerCase().includes('mismatch') || qText.toLowerCase().includes('area')) {
          actionLink = "/documents";
          actionText = isMismatchResolved ? "View Documents" : "Fix Document Mismatch Now";
        }
      }
    } catch (err) {
      // Offline fallback handling
      if (qText.includes("What should I do next?")) {
        if (!isMismatchResolved) {
          replyText = "Your highest-priority action is to resolve the production-capacity & area mismatch (10,000 sq ft vs 12,500 sq ft) between your Building Plan drawings and DPR, and upload the missing Form 1-A Environmental Impact Self-Declaration.";
          actionLink = "/documents";
          actionText = "Fix Document Mismatch Now";
        } else {
          replyText = "All critical document inconsistencies are cleared! Your next step is to submit the Pollution Consent to Establish (CTE) application package to the Environment Board for committee review.";
          actionLink = "/approvals/APP-001";
          actionText = "View Pollution CTE Approval";
        }
      } else if (qText.includes("Why is my pollution approval high risk?")) {
        if (!isMismatchResolved) {
          replyText = "Your Pollution Consent to Establish (CTE) is rated HIGH RISK because the plant constructed area stated on your layout drawing (10,000 sq ft) conflicts with your DPR report (12,500 sq ft). Mismatched area figures cause automatic rejection at the Pollution Control Board.";
          actionLink = "/documents";
          actionText = "Resolve Mismatch";
        } else {
          replyText = "Your Pollution CTE risk has been recalculated to LOW because the 12,500 sq ft area alignment was successfully verified by the NitiPath Consistency Engine.";
          actionLink = "/approvals/APP-001";
          actionText = "View Approval Status";
        }
      } else if (qText.includes("Which approvals can happen together?")) {
        replyText = "NitiPath Parallel Pipeline identified 3 independent clearances that can progress concurrently without waiting for Pollution CTE: Fire NOC Safety Clearance, Electricity HT Substation Feed, and Industrial Water Supply Connection. Executing these in parallel saves an estimated 45 days.";
        actionLink = "/risks";
        actionText = "View Parallel Workflow Graph";
      } else if (qText.includes("Which documents still need attention?")) {
        if (!isMismatchResolved) {
          replyText = "Two documents require immediate attention: 1) Approved Building Site Plan & Layout (area mismatch), and 2) Environmental Compliance Self-Declaration Form 1-A (Missing).";
          actionLink = "/documents";
          actionText = "Open Document Checker";
        } else {
          replyText = "All 27 required statutory documents are verified and compliant!";
          actionLink = "/documents";
          actionText = "View Verified Documents";
        }
      } else {
        replyText = `Based on your project parameters for Raipur Fresh Foods Pvt. Ltd., your current readiness score is ${isMismatchResolved ? '86%' : '72%'}. You have 18 mapped permits across 5 state departments.`;
      }
    }

    const assistantMsg: CopilotMessage = {
      id: `MSG-${Date.now() + 1}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      basedOn,
      actionLink,
      actionText
    };

    setMessages(prev => [...prev, assistantMsg]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <IntelligenceBanner />
      <Navbar 
        toggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
        isMobileMenuOpen={isMobileMenuOpen} 
      />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          closeMobileMenu={() => setIsMobileMenuOpen(false)} 
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 flex flex-col">
          
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-govNavy-700" />
              <h1 className="text-2xl font-extrabold text-slate-900">NitiPath Copilot</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Ask contextual questions regarding your industrial approval journey and risk resolution options.
            </p>
          </div>

          {/* Quick Question Chips */}
          <div className="mb-4 flex flex-wrap gap-2">
            {presetQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleAskQuestion(q)}
                className="px-3 py-1.5 bg-white hover:bg-govNavy-50 border border-slate-200 hover:border-govNavy-300 rounded-lg text-xs font-semibold text-slate-800 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{q}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 mb-4 overflow-y-auto space-y-4 min-h-[380px]">
            {messages.map(msg => (
              <div 
                key={msg.id} 
                className={`flex gap-3 text-xs ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-lg bg-govNavy-800 text-white font-bold flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-amber-400" />
                  </div>
                )}

                <div className={`max-w-xl p-4 rounded-xl ${
                  msg.sender === 'user' 
                    ? 'bg-govNavy-800 text-white font-medium' 
                    : 'bg-slate-50 border border-slate-200 text-slate-900'
                }`}>
                  <p className="leading-relaxed font-normal">{msg.text}</p>

                  {msg.basedOn && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex flex-wrap items-center gap-1.5">
                      <span className="font-bold uppercase tracking-wider text-slate-600">Based on:</span>
                      {msg.basedOn.map((b, idx) => (
                        <span key={idx} className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-700 font-semibold">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}

                  {msg.actionText && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          if (msg.actionText?.includes("Fix")) resolveDocumentMismatch();
                          handleAskQuestion("What should I do next?");
                        }}
                        className="px-3.5 py-1.5 bg-govNavy-800 hover:bg-govNavy-900 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <span>{msg.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] opacity-70 block text-right mt-1">{msg.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Box */}
          <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && input.trim() && handleAskQuestion(input)}
              placeholder="Ask NitiPath Copilot about your project clearances..."
              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-govNavy-700"
            />
            <button
              onClick={() => input.trim() && handleAskQuestion(input)}
              className="px-4 py-2 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[10px] text-slate-400 text-center mt-2">
            Information shown is based on your current project data. Verify regulatory requirements with the relevant authority before submission.
          </p>

        </main>
      </div>

      <Footer />
    </div>
  );
};
