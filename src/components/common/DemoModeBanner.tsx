import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, Building2, LogOut } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, exitDemoMode, language } = useApp();
  const navigate = useNavigate();

  if (!isDemoMode) return null;

  const handleExitDemo = () => {
    exitDemoMode();
    navigate('/assessment');
  };

  return (
    <aside 
      aria-label="Demo mode active banner" 
      className="bg-amber-400 text-govNavy-950 px-3.5 py-2 text-xs font-semibold shadow-md border-b border-amber-500 sticky top-0 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        
        {/* Left: Demo Indicator & Details */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start text-center sm:text-left">
          <span className="inline-flex items-center gap-1 bg-govNavy-950 text-amber-300 font-black px-2 py-0.5 rounded text-[10px] tracking-wider uppercase shadow-xs shrink-0">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>DEMO MODE</span>
          </span>

          <span className="font-extrabold text-govNavy-950">
            {language === 'HI' ? 'डेमो मोड:' : 'Demo Mode:'}
          </span>

          <span className="text-govNavy-900 font-medium">
            {language === 'HI' 
              ? 'पूर्व-कॉन्फ़िगर खाद्य प्रसंस्करण प्रोजेक्ट प्रदर्शित हो रहा है'
              : 'Showing pre-seeded Food Processing project'}
            <span className="hidden md:inline font-bold text-govNavy-950 ml-1">
              — Raipur Fresh Foods Pvt. Ltd. (₹12.5 Cr • 4.5 Acres)
            </span>
          </span>
        </div>

        {/* Right: Exit Action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleExitDemo}
            className="px-3 py-1 bg-govNavy-950 hover:bg-govNavy-900 text-white font-bold rounded-md text-xs transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer border border-govNavy-850 active:scale-95"
          >
            <span>{language === 'HI' ? 'डेमो से बाहर निकलें / अपना स्वयं का प्रोफ़ाइल बनाएं' : 'Exit Demo / Create Your Own Profile'}</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>

      </div>
    </aside>
  );
};
