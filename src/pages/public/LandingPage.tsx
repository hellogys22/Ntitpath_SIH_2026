import React, { useState, useEffect } from 'react';
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
  Lock,
  Globe,
  Eye,
  Layers,
  Award,
  FileSearch,
  CalendarCheck,
  Menu,
  X,
  LogIn,
  Check,
  ChevronDown
} from 'lucide-react';
import { 
  motion, 
  useScroll, 
  useSpring, 
  useTransform, 
  useMotionValue, 
  useMotionTemplate 
} from 'motion/react';
import { useApp } from '../../context/AppContext';
import { 
  RECOGNIZED_SECTORS, 
  RECOGNIZED_DISTRICTS, 
  PROJECT_TYPES 
} from '../../services/rulesEngine';
import heroImage from '../../assets/hero-industrial.jpg';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Footer } from '../../components/layout/Footer';

// Translation dictionary for this landing page
const translations = {
  EN: {
    tagline: 'Clear Approvals. Confident Growth.',
    nav: {
      home: 'Home',
      howItWorks: 'How It Works',
      approvals: 'Approvals',
      schemes: 'Schemes',
      resources: 'Resources',
      support: 'Support',
      signIn: 'Sign In',
      getStarted: 'Get Started',
    },
    hero: {
      badge: 'Your Business. A Clear Path.',
      headlinePrefix: 'Navigate Your ',
      headlineHighlight: 'Approval',
      headlineSuffix: ' Journey with Clarity',
      subheadline: "NitiPath helps businesses understand what's required, prepare better, and move forward with confidence.",
      primaryCta: 'Start Business Assessment',
      demoCta: 'View Demo Dashboard',
      secondaryCta: 'Explore How It Works',
      pillars: [
        'Understand what applies',
        'Prepare with confidence',
        'Move Forward with clarity',
      ],
    },
    card: {
      title: 'Find What Applies to Your Business',
      subtitle: 'त्वरित वैधानिक प्रयोज्यता (Instant Statutory Applicability)',
      businessTypeLabel: 'Business Type',
      regionLabel: 'State / Region',
      sectorLabel: 'Industry Sector',
      button: 'Get My Roadmap',
      securityText: 'Your information stays private and secure.',
    },
    whatNitipathDoes: {
      badge: 'WHAT NITIPATH DOES',
      heading: 'An Intelligence Layer Around the Approval Ecosystem',
      subtitle: 'अनुमोदन की जटिलताओं को समझें, समय बचाएं और आत्मविश्वास के साथ उत्पादन शुरू करें',
      description: 'NitiPath is NOT another government submission portal. It provides decision support to answer what you need, what is wrong, and what to do next.',
      cards: [
        {
          key: 'predict',
          title: 'Predict / पहले से जानें',
          desc: 'Know what applies to your business.',
          iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950',
        },
        {
          key: 'prevent',
          title: 'Prevent / समस्याओं से बचें',
          desc: 'Detect gaps before submission.',
          iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950',
        },
        {
          key: 'optimize',
          title: 'Optimize / बेहतर योजना बनाएं',
          desc: 'Get clear next steps.',
          iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white',
        },
        {
          key: 'track',
          title: 'Track / हर कदम पर नज़र रखें',
          desc: 'Monitor your progress easily.',
          iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30 group-hover:bg-purple-500 group-hover:text-white',
        },
      ],
      footerAccent: 'BUILD TODAY. GROW TOMORROW.',
    },
    howItWorks: {
      badge: 'Structured Process',
      heading: 'How NitiPath Works',
      subtitle: 'Eight steps from business profiling to post-commissioning compliance',
      steps: [
        {
          num: '01',
          title: 'Business Profile',
          desc: 'Tell NitiPath about your business, sector, investment scale, employee count, and land parameters.',
        },
        {
          num: '02',
          title: 'Approval Plan',
          desc: 'Understand all statutory approvals, state permits, and municipal licenses relevant to your project.',
        },
        {
          num: '03',
          title: 'Document Check',
          desc: 'Verify required documents and identify dimensional area or capacity inconsistencies prior to filing.',
        },
        {
          num: '04',
          title: 'Risk & Dependencies',
          desc: 'Understand potential approval risks, inter-department locks, and high-impact delay bottlenecks.',
        },
        {
          num: '05',
          title: 'Optimized Path',
          desc: 'Identify independent parallel work and focus attention on the statutory critical path.',
        },
        {
          num: '06',
          title: 'Support Schemes',
          desc: 'Discover matched central & state capital subsidies, interest incentives, and utility concessions.',
        },
        {
          num: '07',
          title: 'Deficiency Resolution',
          desc: 'Resolve flagged CAD drawing discrepancies and land registry mismatches before regulatory submission.',
        },
        {
          num: '08',
          title: 'Compliance Tracking',
          desc: 'Manage recurring post-commissioning returns, pollution consent renewals, and statutory compliance audits.',
        },
      ],
    },
    comparison: {
      heading: 'Existing Approval Portals vs NitiPath',
      subtitle: 'NitiPath works around the existing approval ecosystem as an intelligence layer.',
      traditional: 'Traditional Approval Portals',
      nitipath: 'NitiPath Intelligence Platform',
      rows: [
        { trad: 'Apply for clearances', niti: 'Understand statutory applicability & prerequisites' },
        { trad: 'Track submitted application status', niti: 'Predict potential risks and inter-department locks' },
        { trad: 'Store document uploads', niti: 'Check document consistency & area dimension mismatches' },
        { trad: 'View static stage updates', niti: 'Identify root-cause risk before submission' },
        { trad: 'Linear approval checklist', niti: 'Dependency intelligence & parallel work mapping' },
        { trad: 'Generic informational guidelines', niti: 'Prioritized "Your Next Best Action" guidance' },
      ],
    },
    finalCta: {
      heading: 'One Journey. Clearer Decisions.',
      desc: 'Eliminate approval guesswork and prevent avoidable document errors. Start your business assessment today.',
      button: 'Start Your Approval Journey',
      demo: 'View Demo Dashboard',
      signIn: 'Sign In to Existing Account',
    },
  },
  HI: {
    tagline: 'स्पष्ट अनुमोदन। सुनिश्चित विकास।',
    nav: {
      home: 'होम',
      howItWorks: 'कार्यप्रणाली',
      approvals: 'स्वीकृतियां',
      schemes: 'योजनाएं',
      resources: 'संसाधन',
      support: 'सहायता',
      signIn: 'लॉग इन करें',
      getStarted: 'शुरू करें',
    },
    hero: {
      badge: 'आपका व्यवसाय। एक स्पष्ट राह।',
      headlinePrefix: 'स्पष्टता के साथ अपनी ',
      headlineHighlight: 'अनुमोदन',
      headlineSuffix: ' यात्रा तय करें',
      subheadline: 'नीतिपथ व्यवसायों को यह समझने में मदद करता है कि क्या आवश्यक है, बेहतर तैयारी करें और विश्वास के साथ आगे बढ़ें।',
      primaryCta: 'व्यापार मूल्यांकन शुरू करें',
      demoCta: 'डेमो डैशबोर्ड देखें',
      secondaryCta: 'कार्यप्रणाली देखें',
      pillars: [
        'जानें क्या लागू होता है',
        'आत्मविश्वास से तैयारी करें',
        'स्पष्टता के साथ आगे बढ़ें',
      ],
    },
    card: {
      title: 'अपने व्यवसाय के लिए लागू नियम खोजें',
      subtitle: 'त्वरित वैधानिक प्रयोज्यता (Instant Statutory Applicability)',
      businessTypeLabel: 'व्यवसाय का प्रकार',
      regionLabel: 'राज्य / क्षेत्र',
      sectorLabel: 'औद्योगिक क्षेत्र',
      button: 'मेरा रोडमैप प्राप्त करें',
      securityText: 'आपकी जानकारी पूरी तरह से निजी और सुरक्षित रहती है।',
    },
    whatNitipathDoes: {
      badge: 'नीतिपथ क्या करता है',
      heading: 'अनुमोदन परिवेश के चारों ओर एक आसूचना स्तर',
      subtitle: 'Understand approval complexities, eliminate delays, and commission your enterprise on time',
      description: 'नीतिपथ केवल एक फॉर्म पोर्टल नहीं है। यह निर्णय समर्थन प्रणाली है जो बताती है कि आपको क्या चाहिए, क्या त्रुटि है, और अगला कदम क्या होना चाहिए।',
      cards: [
        {
          key: 'predict',
          title: 'Predict / पहले से जानें',
          desc: 'Know what applies to your business. (लागू होने वाले नियमों को पहले से जानें)',
          iconColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30 group-hover:bg-amber-500 group-hover:text-slate-950',
        },
        {
          key: 'prevent',
          title: 'Prevent / समस्याओं से बचें',
          desc: 'Detect gaps before submission. (जमा करने से पहले कमियों को पहचानें)',
          iconColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30 group-hover:bg-emerald-500 group-hover:text-slate-950',
        },
        {
          key: 'optimize',
          title: 'Optimize / बेहतर योजना बनाएं',
          desc: 'Get clear next steps. (समानांतर स्वीकृतियों से स्पष्ट अगले कदम)',
          iconColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30 group-hover:bg-blue-500 group-hover:text-white',
        },
        {
          key: 'track',
          title: 'Track / हर कदम पर नज़र रखें',
          desc: 'Monitor your progress easily. (अपनी प्रगति पर आसानी से नज़र रखें)',
          iconColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30 group-hover:bg-purple-500 group-hover:text-white',
        },
      ],
      footerAccent: 'BUILD TODAY. GROW TOMORROW.',
    },
    howItWorks: {
      badge: 'व्यवस्थित प्रक्रिया',
      heading: 'नीतिपथ कैसे कार्य करता है',
      subtitle: 'व्यवसाय प्रोफाइलिंग से लेकर परिचालन पश्चात अनुपालन तक आठ चरण',
      steps: [
        {
          num: '01',
          title: 'व्यवसाय प्रोफाइल',
          desc: 'नीतिपथ को अपने व्यवसाय, क्षेत्र, निवेश पैमाने, कार्यबल और भूमि मापदंडों के बारे में बताएं।',
        },
        {
          num: '02',
          title: 'स्वीकृति योजना',
          desc: 'अपनी परियोजना से संबंधित सभी वैधानिक अनुमोदनों, राज्य परमिटों और नगर निगम लाइसेंसों को समझें।',
        },
        {
          num: '03',
          title: 'दस्तावेज़ सत्यापन',
          desc: 'आवश्यक दस्तावेजों का सत्यापन करें और आवेदन से पूर्व आयामों या क्षमता विसंगतियों का पता लगाएं।',
        },
        {
          num: '04',
          title: 'जोखिम एवं निर्भरताएं',
          desc: 'संभावित अनुमोदन जोखिमों, अंतर-विभागीय निर्भरताओं और उच्च विलंब बाधाओं को समझें।',
        },
        {
          num: '05',
          title: 'अनुकूलित पथ',
          desc: 'स्वतंत्र समानांतर कार्यों की पहचान करें और वैधानिक महत्वपूर्ण पथ पर ध्यान केंद्रित करें।',
        },
        {
          num: '06',
          title: 'प्रोत्साहन एवं सब्सिडी',
          desc: 'केंद्र और राज्य सरकार की उपयुक्त पूंजी सब्सिडी, ब्याज रियायतों और प्रोत्साहन योजनाओं की खोज करें।',
        },
        {
          num: '07',
          title: 'त्रुटि निवारण',
          desc: 'विभागीय समीक्षा से पूर्व सीएडी ड्राइंग विसंगतियों और भूमि राजस्व रिकॉर्ड त्रुटियों को ठीक करें।',
        },
        {
          num: '08',
          title: 'अनुपालन ट्रैकिंग',
          desc: 'परिचालन के बाद प्रदूषण नियंत्रण नवीनीकरण, रिटर्न और वैधानिक अनुपालन समय-सीमा का प्रबंधन करें।',
        },
      ],
    },
    comparison: {
      heading: 'पारंपरिक अनुमोदन पोर्टल बनाम नीतिपथ',
      subtitle: 'नीतिपथ मौजूदा अनुमोदन परिवेश के चारों ओर एक आसूचना स्तर के रूप में कार्य करता है।',
      traditional: 'पारंपरिक अनुमोदन पोर्टल',
      nitipath: 'नीतिपथ आसूचना मंच',
      rows: [
        { trad: 'मंजूरी के लिए आवेदन करना', niti: 'वैधानिक प्रयोज्यता एवं पूर्व-आवश्यकताओं को समझना' },
        { trad: 'जमा किए गए आवेदन की स्थिति देखना', niti: 'संभावित जोखिमों और अंतर-विभागीय बाधाओं का पूर्वानुमान' },
        { trad: 'दस्तावेज़ अपलोड स्टोर करना', niti: 'दस्तावेज़ संगति एवं क्षेत्रफल विसंगति की जांच' },
        { trad: 'स्थिर चरण अपडेट देखना', niti: 'जमा करने से पहले मूल-कारण जोखिम की पहचान' },
        { trad: 'रैखिक अनुमोदन चेकलिस्ट', niti: 'निर्भरता आसूचना एवं समानांतर कार्य मैपिंग' },
        { trad: 'सामान्य सूचनात्मक दिशानिर्देश', niti: 'प्राथमिकताप्राप्त "आपका अगला सर्वोत्तम कदम" मार्गदर्शन' },
      ],
    },
    finalCta: {
      heading: 'एक यात्रा। स्पष्ट निर्णय।',
      desc: 'अनुमोदन के अनुमान को समाप्त करें और टालने योग्य दस्तावेज़ त्रुटियों से बचें। आज ही अपना व्यवसाय मूल्यांकन शुरू करें।',
      button: 'अपनी अनुमोदन यात्रा शुरू करें',
      demo: 'डेमो डैशबोर्ड देखें',
      signIn: 'मौजूदा खाते में लॉग इन करें',
    },
  },
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, enterDemoMode, businessProfile } = useApp();

  // Functional language toggle for THIS PAGE's own text only
  const [pageLang, setPageLang] = useState<'EN' | 'HI'>('EN');
  const t = translations[pageLang];

  // 1. Scroll-driven animations
  const { scrollYProgress, scrollY } = useScroll();
  const scrollProgressScale = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001
  });

  // Hero parallax on scroll
  const heroImageScrollY = useTransform(scrollY, [0, 600], [0, 90]);
  const heroTextScrollY = useTransform(scrollY, [0, 500], [0, -35]);

  // 2. Mouse cursor tracking & motion (zero React state re-renders)
  const mouseX = useMotionValue(-1000);
  const mouseY = useMotionValue(-1000);
  const smoothMouseX = useSpring(mouseX, { stiffness: 220, damping: 26 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 220, damping: 26 });

  // Mouse tilt / parallax on floating card in hero
  const cardTiltRotateX = useTransform(smoothMouseY, [0, 1080], [3, -3]);
  const cardTiltRotateY = useTransform(smoothMouseX, [0, 1920], [-3, 3]);
  const cardParallaxX = useTransform(smoothMouseX, [0, 1920], [8, -8]);
  const cardParallaxY = useTransform(smoothMouseY, [0, 1080], [6, -6]);

  // Ambient flare mouse parallax
  const flareParallaxX = useTransform(smoothMouseX, [0, 1920], [-25, 25]);
  const flareParallaxY = useTransform(smoothMouseY, [0, 1080], [-25, 25]);

  // Interactive dynamic cursor spotlight
  const spotlightBackground = useMotionTemplate`radial-gradient(650px circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(255, 107, 0, 0.065), transparent 80%)`;
  const subtleBlueGlow = useMotionTemplate`radial-gradient(400px circle at ${smoothMouseX}px ${smoothMouseY}px, rgba(59, 130, 246, 0.04), transparent 75%)`;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Hover state for navbar sliding underline indicator
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);

  // Mobile menu state for Navbar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Floating Quick-Assessment form state (pulled from shared source of truth)
  const [quickProjectType, setQuickProjectType] = useState<string>(PROJECT_TYPES[0].value);
  const [quickLocation, setQuickLocation] = useState<string>(RECOGNIZED_DISTRICTS[0]);
  const [quickIndustry, setQuickIndustry] = useState<string>(RECOGNIZED_SECTORS[0]);

  const togglePageLanguage = () => {
    setPageLang(prev => (prev === 'EN' ? 'HI' : 'EN'));
  };

  const scrollToHowItWorks = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGetMyRoadmap = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Save chosen values to sessionStorage for zero-data-loss carryover
    const assessmentPayload = {
      projectType: quickProjectType,
      location: quickLocation,
      industry: quickIndustry,
    };

    try {
      sessionStorage.setItem('nitipath_quick_assessment', JSON.stringify(assessmentPayload));
    } catch (err) {
      console.warn('Session storage save warning:', err);
    }

    const queryParams = `?projectType=${encodeURIComponent(quickProjectType)}&location=${encodeURIComponent(quickLocation)}&industry=${encodeURIComponent(quickIndustry)}`;

    // 2. Auth-aware routing
    if (!user) {
      // Unauthenticated: Route to register and carry values through
      navigate(`/register${queryParams}`);
    } else {
      // Authenticated: If profile already exists with readinessScore, go to roadmap; otherwise start onboarding
      if (businessProfile?.companyName && (businessProfile?.readinessScore || 0) > 0) {
        navigate('/roadmap');
      } else {
        navigate(`/assessment${queryParams}`);
      }
    }
  };

  const handleStartAssessment = () => {
    if (!user) {
      navigate('/register?redirect=/assessment');
    } else {
      navigate('/assessment');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#070D1E] text-slate-100 font-sans selection:bg-orange-500 selection:text-white relative overflow-x-clip">
      {/* Sleek Top Scroll Progress Indicator */}
      <motion.div
        style={{ scaleX: scrollProgressScale }}
        className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FF6B00] via-amber-400 to-[#10B981] origin-left z-[70] pointer-events-none"
      />

      {/* Interactive Mouse Cursor Ambient Spotlight Glow */}
      <motion.div
        style={{ background: spotlightBackground }}
        className="fixed inset-0 pointer-events-none z-20 transition-opacity duration-300"
      />
      <motion.div
        style={{ background: subtleBlueGlow }}
        className="fixed inset-0 pointer-events-none z-20 transition-opacity duration-300"
      />

      <IntelligenceBanner />

      {/* ========================================================================= */}
      {/* NAVBAR: Geometric "N" Mark (Saffron/White/Green) + Wordmark + Nav Links */}
      {/* ========================================================================= */}
      <nav className="sticky top-0 z-50 bg-[#070D1E]/90 backdrop-blur-md border-b border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Group */}
            <Link to="/" className="flex items-center gap-3.5 group focus:outline-none">
              {/* Geometric "N" mark icon referencing Indian flag palette subtly */}
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0F1A34] via-[#0A1226] to-[#040814] border border-orange-500/30 shadow-lg shadow-orange-500/5 flex items-center justify-center relative overflow-hidden group-hover:border-orange-500/60 transition-colors">
                {/* Subtle Indian Flag bottom accent: Saffron, White, Green */}
                <div className="absolute inset-x-0 bottom-0 h-[2.5px] bg-gradient-to-r from-[#FF6B00] via-white to-[#10B981] opacity-90" />
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path
                    d="M5 19V5L19 19V5"
                    stroke="url(#nLogoGrad)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <defs>
                    <linearGradient id="nLogoGrad" x1="5" y1="5" x2="19" y2="19" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#FF7A00" />
                      <stop offset="0.55" stopColor="#FFFFFF" />
                      <stop offset="1" stopColor="#10B981" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* Wordmark & Tagline */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-black tracking-tight text-white group-hover:text-orange-400 transition-colors leading-none">
                    NitiPath
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00]" />
                </div>
                <span className="text-[10px] text-slate-400 font-medium tracking-wide mt-1 leading-none">
                  {t.tagline}
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links with sliding underline indicator */}
            <div className="hidden lg:flex items-center gap-7 text-xs font-semibold text-slate-300">
              {[
                { id: 'home', label: t.nav.home, type: 'link' as const, path: '/' },
                { id: 'howItWorks', label: t.nav.howItWorks, type: 'button' as const, onClick: scrollToHowItWorks },
                { id: 'approvals', label: t.nav.approvals, type: 'link' as const, path: user ? '/roadmap' : '/login?redirect=/roadmap' },
                { id: 'schemes', label: t.nav.schemes, type: 'link' as const, path: '/support' },
                { id: 'resources', label: t.nav.resources, type: 'link' as const, path: '/copilot' },
                { id: 'support', label: t.nav.support, type: 'link' as const, path: '/support' },
              ].map((item) => (
                <div
                  key={item.id}
                  className="relative py-2"
                  onMouseEnter={() => setHoveredNav(item.id)}
                  onMouseLeave={() => setHoveredNav(null)}
                >
                  {item.type === 'link' ? (
                    <Link
                      to={item.path}
                      className={`transition-colors text-xs font-semibold ${
                        hoveredNav === item.id ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <button
                      onClick={item.onClick}
                      className={`transition-colors text-xs font-semibold bg-transparent border-none p-0 cursor-pointer ${
                        hoveredNav === item.id ? 'text-white' : 'text-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  )}
                  {hoveredNav === item.id && (
                    <motion.div
                      layoutId="navbar-hover-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 rounded-full"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Right Side: Language Toggle + Auth CTAs */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Language toggle with small sliding motion between EN/हिंदी states */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-800/80 border border-slate-700/80 text-xs font-bold shadow-xs">
                <Globe className="w-3.5 h-3.5 text-orange-400 ml-2 mr-1 shrink-0" />
                <div className="flex items-center relative">
                  <button
                    type="button"
                    onClick={() => setPageLang('EN')}
                    className={`relative px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer z-10 ${
                      pageLang === 'EN' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="English"
                  >
                    {pageLang === 'EN' && (
                      <motion.div
                        layoutId="lang-active-pill"
                        className="absolute inset-0 bg-slate-700/95 border border-slate-600/70 rounded-md shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      />
                    )}
                    <span>EN</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPageLang('HI')}
                    className={`relative px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer z-10 ${
                      pageLang === 'HI' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                    title="हिंदी"
                  >
                    {pageLang === 'HI' && (
                      <motion.div
                        layoutId="lang-active-pill"
                        className="absolute inset-0 bg-slate-700/95 border border-slate-600/70 rounded-md shadow-xs -z-10"
                        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
                      />
                    )}
                    <span>हिंदी</span>
                  </button>
                </div>
              </div>

              {user ? (
                <Link
                  to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-bold text-xs transition-colors shadow-xs"
                >
                  Dashboard →
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5 text-slate-400" />
                    <span>{t.nav.signIn}</span>
                  </Link>

                  <Link
                    to="/register"
                    className="px-4.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-850 text-white font-bold text-xs border border-slate-700 hover:border-orange-500/50 transition-all shadow-md"
                  >
                    <span>{t.nav.getStarted}</span>
                  </Link>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex sm:hidden items-center gap-2">
              <button
                type="button"
                onClick={togglePageLanguage}
                className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-orange-400 text-xs font-bold"
              >
                {pageLang === 'EN' ? 'हिंदी' : 'EN'}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-[#0A1226] border-b border-slate-800 px-4 pt-3 pb-5 space-y-2 text-xs font-semibold animate-in slide-in-from-top-2 duration-150">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-slate-200 hover:text-orange-400"
            >
              {t.nav.home}
            </Link>
            <button 
              onClick={scrollToHowItWorks} 
              className="block w-full text-left py-2 text-slate-200 hover:text-orange-400 bg-transparent border-none"
            >
              {t.nav.howItWorks}
            </button>
            <Link 
              to={user ? '/roadmap' : '/login?redirect=/roadmap'} 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-slate-200 hover:text-orange-400"
            >
              {t.nav.approvals}
            </Link>
            <Link 
              to="/support" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-slate-200 hover:text-orange-400"
            >
              {t.nav.schemes}
            </Link>
            <Link 
              to="/copilot" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-slate-200 hover:text-orange-400"
            >
              {t.nav.resources}
            </Link>
            <Link 
              to="/support" 
              onClick={() => setMobileMenuOpen(false)} 
              className="block py-2 text-slate-200 hover:text-orange-400"
            >
              {t.nav.support}
            </Link>
            <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-slate-700 text-white font-bold"
              >
                {t.nav.signIn}
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-[#FF6B00] text-white font-bold shadow-md"
              >
                {t.nav.getStarted}
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ========================================================================= */}
      {/* HERO SECTION: Dark Navy + Industrial Photo (Highway & Refinery at Sunset) */}
      {/* ========================================================================= */}
      <section className="relative min-h-[640px] lg:min-h-[720px] flex items-center overflow-hidden border-b border-slate-800/60">
        
        {/* Background Industrial Highway & Refinery Photography on the Right */}
        <motion.div 
          style={{ y: heroImageScrollY }}
          className="absolute right-0 top-0 bottom-0 w-full lg:w-[62%] pointer-events-none select-none overflow-hidden z-0"
        >
          <motion.img 
            src={heroImage} 
            alt="Industrial and infrastructure highway landscape at sunset"
            initial={{ scale: 1.05, opacity: 0.85 }}
            animate={{ scale: 1.0, opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="w-full h-full object-cover object-center lg:object-right filter brightness-95 contrast-105"
          />
          {/* Multi-stage gradient masks to seamlessly blend into deep navy background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#070D1E] via-[#070D1E]/80 to-transparent hidden lg:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#070D1E] via-transparent to-[#070D1E]/40" />
          <div className="absolute inset-0 bg-[#070D1E]/60 lg:hidden" />
          {/* Subtle warm amber ambient flare responding to mouse motion */}
          <motion.div 
            style={{ x: flareParallaxX, y: flareParallaxY }}
            className="absolute bottom-10 right-10 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" 
          />
        </motion.div>

        {/* Content Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Hero Copy, CTAs, Decorative Badges with subtle scroll parallax */}
            <motion.div 
              style={{ y: heroTextScrollY }}
              className="lg:col-span-7 xl:col-span-7 space-y-6"
            >
              
              {/* Small Pill Badge */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0, ease: 'easeOut' }}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 text-orange-400 text-xs font-bold shadow-sm backdrop-blur-sm"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span>{t.hero.badge}</span>
              </motion.div>

              {/* Main Headline with "Approval" highlighted in Orange */}
              <motion.h1
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.08, ease: 'easeOut' }}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-5.5xl font-black text-white tracking-tight leading-[1.15]"
              >
                {t.hero.headlinePrefix}
                <span className="text-[#FF6B00] relative inline-block">
                  {t.hero.headlineHighlight}
                  <span className="absolute -bottom-1 inset-x-0 h-1 bg-[#FF6B00]/30 rounded-full" />
                </span>
                {t.hero.headlineSuffix}
              </motion.h1>

              {/* Subheadline */}
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.16, ease: 'easeOut' }}
                className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl"
              >
                {t.hero.subheadline}
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.24, ease: 'easeOut' }}
                className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
              >
                {/* Primary CTA: Start Business Assessment (Orange Filled) */}
                <motion.button
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  whileTap={{ y: 0 }}
                  type="button"
                  onClick={handleStartAssessment}
                  className="px-7 py-3.5 bg-[#FF6B00] hover:bg-[#E65F00] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>{t.hero.primaryCta}</span>
                  <ArrowRight className="w-4 h-4" />
                </motion.button>

                {/* Pre-Seeded Instant Demo Access */}
                <motion.button
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  whileTap={{ y: 0 }}
                  type="button"
                  onClick={() => {
                    enterDemoMode();
                    navigate('/dashboard');
                  }}
                  className="px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 border border-amber-500/40 hover:border-amber-400 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  title="View pre-seeded Raipur Fresh Foods enterprise demonstration"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>{t.hero.demoCta}</span>
                </motion.button>

                {/* Secondary CTA: Explore How It Works (Outline) */}
                <motion.button
                  whileHover={{ y: -2, transition: { duration: 0.15 } }}
                  whileTap={{ y: 0 }}
                  type="button"
                  onClick={scrollToHowItWorks}
                  className="px-5 py-3.5 bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{t.hero.secondaryCta}</span>
                </motion.button>
              </motion.div>

              {/* Three small icon + label items below CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.32, ease: 'easeOut' }}
                className="pt-4 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300 font-medium"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span>{t.hero.pillars[0]}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                  <span>{t.hero.pillars[1]}</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0">
                    <Compass className="w-3 h-3" />
                  </div>
                  <span>{t.hero.pillars[2]}</span>
                </div>
              </motion.div>

            </motion.div>

            {/* ========================================================================= */}
            {/* FLOATING QUICK-ASSESSMENT CARD: Overlapping Hero with 3 Real Dropdowns */}
            {/* ========================================================================= */}
            <motion.div
              style={{
                x: cardParallaxX,
                y: cardParallaxY,
                rotateX: cardTiltRotateX,
                rotateY: cardTiltRotateY,
                transformPerspective: 1000,
              }}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 xl:col-span-5 relative will-change-transform"
            >
              <div className="bg-[#0B132B]/95 backdrop-blur-md rounded-2xl p-6 sm:p-7 border border-slate-700/80 shadow-2xl shadow-black/60 relative z-20">
                
                {/* Subtle Card Glow Header Accent */}
                <div className="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />
                
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                      {t.card.title}
                    </h2>
                    <p className="text-[11px] text-orange-400 font-semibold mt-0.5">
                      {t.card.subtitle}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>

                {/* Form with 3 Real Dropdowns pulled from shared rulesEngine constants */}
                <form onSubmit={handleGetMyRoadmap} className="space-y-4">
                  
                  {/* Dropdown 1: Business Type */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {t.card.businessTypeLabel} <span className="text-orange-400">*</span>
                    </label>
                    <motion.div 
                      whileHover={{ y: -2, transition: { duration: 0.18 } }}
                      className="rounded-xl"
                    >
                      <select
                        value={quickProjectType}
                        onChange={(e) => setQuickProjectType(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#141F3D] border border-slate-700 hover:border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white rounded-xl text-xs font-medium focus:outline-none transition-colors shadow-sm hover:shadow-md cursor-pointer"
                      >
                        {PROJECT_TYPES.map(pt => (
                          <option key={pt.value} value={pt.value} className="bg-[#0B132B] text-white">
                            {pt.label}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  </div>

                  {/* Dropdown 2: State / Region */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {t.card.regionLabel} <span className="text-orange-400">*</span>
                    </label>
                    <motion.div 
                      whileHover={{ y: -2, transition: { duration: 0.18 } }}
                      className="rounded-xl"
                    >
                      <select
                        value={quickLocation}
                        onChange={(e) => setQuickLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#141F3D] border border-slate-700 hover:border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white rounded-xl text-xs font-medium focus:outline-none transition-colors shadow-sm hover:shadow-md cursor-pointer"
                      >
                        {RECOGNIZED_DISTRICTS.map(dist => (
                          <option key={dist} value={dist} className="bg-[#0B132B] text-white">
                            {dist}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  </div>

                  {/* Dropdown 3: Industry Sector */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                      {t.card.sectorLabel} <span className="text-orange-400">*</span>
                    </label>
                    <motion.div 
                      whileHover={{ y: -2, transition: { duration: 0.18 } }}
                      className="rounded-xl"
                    >
                      <select
                        value={quickIndustry}
                        onChange={(e) => setQuickIndustry(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-[#141F3D] border border-slate-700 hover:border-slate-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-white rounded-xl text-xs font-medium focus:outline-none transition-colors shadow-sm hover:shadow-md cursor-pointer"
                      >
                        {RECOGNIZED_SECTORS.map(sec => (
                          <option key={sec} value={sec} className="bg-[#0B132B] text-white">
                            {sec}
                          </option>
                        ))}
                      </select>
                    </motion.div>
                  </div>

                  {/* "Get My Roadmap" CTA Button (Dark Filled) */}
                  <motion.button
                    whileHover={{ y: -2, transition: { duration: 0.18 } }}
                    whileTap={{ y: 0 }}
                    type="submit"
                    className="w-full mt-2 py-3.5 px-4 bg-slate-900 hover:bg-slate-950 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-slate-700 hover:border-orange-500/60 shadow-lg shadow-black/40 hover:shadow-orange-500/10 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 group"
                  >
                    <Compass className="w-4 h-4 text-orange-400 group-hover:rotate-45 transition-transform" />
                    <span>{t.card.button}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
                  </motion.button>

                  {/* Privacy & Security Note */}
                  <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
                    <Lock className="w-3.5 h-3.5 text-emerald-400/80" />
                    <span>{t.card.securityText}</span>
                  </div>

                </form>

              </div>
            </motion.div>

          </div>
        </div>

        {/* Continuous "Scroll to explore" indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-400 cursor-pointer z-20 hover:text-orange-400 transition-colors select-none"
          onClick={scrollToHowItWorks}
        >
          <span className="tracking-wider uppercase text-[10px] text-slate-400/80">Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-orange-400/90" />
          </motion.div>
        </motion.div>

      </section>

      {/* ========================================================================= */}
      {/* "WHAT NITIPATH DOES" SECTION: 4 Pillar Cards (Predict, Prevent, Optimize, Track) */}
      {/* ========================================================================= */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Section Header with scroll reveal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-orange-400 text-[11px] font-extrabold uppercase tracking-widest mb-3">
            <span>{t.whatNitipathDoes.badge}</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
            {t.whatNitipathDoes.heading}
          </h2>
          
          <p className="text-xs sm:text-sm text-orange-400/90 font-medium mt-2">
            {t.whatNitipathDoes.subtitle}
          </p>

          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto mt-2 leading-relaxed">
            {t.whatNitipathDoes.description}
          </p>
        </motion.div>

        {/* 4 Pillar Cards in a Row (Stack on Mobile, 4 Cols on Desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {t.whatNitipathDoes.cards.map((card, idx) => {
            const icons = [
              <Compass className="w-6 h-6" key="predict" />,
              <ShieldCheck className="w-6 h-6" key="prevent" />,
              <Zap className="w-6 h-6" key="optimize" />,
              <LineChart className="w-6 h-6" key="track" />,
            ];
            const subLabels = [
              'Risk & timeline projection',
              'Pre-submission OCR audit',
              'Parallel track acceleration',
              'Compliance calendar lifecycle',
            ];

            return (
              <motion.div
                key={card.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.3, delay: idx * 0.1, ease: 'easeOut' }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className="bg-[#0B132B]/80 hover:bg-[#0E1838] border border-slate-800 hover:border-amber-500/50 rounded-2xl p-6 transition-colors group relative overflow-hidden shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 transition-colors ${card.iconColor}`}>
                    {icons[idx]}
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed font-normal">
                    {card.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-amber-400/80 font-medium flex items-center gap-1">
                  <span>{subLabels[idx]}</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* FOOTER ACCENT: "BUILD TODAY. GROW TOMORROW." with Horizontal Rule Lines */}
        {/* ========================================================================= */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="mt-16 pt-4 flex items-center justify-center gap-4 sm:gap-6"
        >
          <div className="h-px bg-gradient-to-r from-transparent via-slate-700 to-slate-700 flex-1 max-w-xs sm:max-w-sm" />
          <span className="text-[11px] sm:text-xs font-black tracking-[0.25em] text-slate-400 uppercase text-center shrink-0">
            {t.whatNitipathDoes.footerAccent}
          </span>
          <div className="h-px bg-gradient-to-l from-transparent via-slate-700 to-slate-700 flex-1 max-w-xs sm:max-w-sm" />
        </motion.div>

      </section>

      {/* ========================================================================= */}
      {/* 8-STEP "HOW IT WORKS" SECTION: Maintained & Enhanced */}
      {/* ========================================================================= */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="text-center mb-14"
        >
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {t.howItWorks.badge}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mt-3">
            {t.howItWorks.heading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-2">
            {t.howItWorks.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {t.howItWorks.steps.map((step, idx) => {
            const icons = [
              <Building2 className="w-4 h-4" key="1" />,
              <Layers className="w-4 h-4" key="2" />,
              <FileCheck2 className="w-4 h-4" key="3" />,
              <AlertTriangle className="w-4 h-4" key="4" />,
              <GitBranch className="w-4 h-4" key="5" />,
              <Award className="w-4 h-4" key="6" />,
              <FileSearch className="w-4 h-4" key="7" />,
              <CalendarCheck className="w-4 h-4" key="8" />,
            ];

            return (
              <motion.div 
                key={step.num}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ 
                  duration: 0.28, 
                  delay: idx * 0.08, 
                  ease: 'easeOut' 
                }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className="bg-[#0B132B]/60 p-6 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors relative group shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-2xl font-black text-slate-700/50 absolute top-4 right-4 group-hover:text-orange-500/30 transition-colors">
                    {step.num}
                  </span>
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
                    {icons[idx]}
                    <span>Step {step.num}</span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-2.5">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed font-normal">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* Existing Approval Portals vs NitiPath Comparison Matrix */}
      {/* ========================================================================= */}
      <section className="py-16 bg-[#0B132B]/40 border-y border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-center mb-10"
          >
            <h2 className="text-2xl font-black text-white">
              {t.comparison.heading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              {t.comparison.subtitle}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="bg-[#0B132B] rounded-2xl border border-slate-800 shadow-xl overflow-hidden"
          >
            <div className="grid grid-cols-12 bg-slate-900 text-white text-xs font-bold p-4 border-b border-slate-800">
              <div className="col-span-5 text-slate-400 uppercase tracking-wider font-extrabold">
                {t.comparison.traditional}
              </div>
              <div className="col-span-7 text-orange-400 uppercase tracking-wider font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-orange-400" />
                {t.comparison.nitipath}
              </div>
            </div>

            <div className="divide-y divide-slate-800/60 text-xs">
              {t.comparison.rows.map((row, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.25, delay: index * 0.04, ease: 'easeOut' }}
                  className="grid grid-cols-12 p-4 items-center hover:bg-slate-900/50 transition-colors"
                >
                  <div className="col-span-5 text-slate-400 font-medium">
                    {row.trad}
                  </div>
                  <div className="col-span-7 text-slate-100 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{row.niti}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* Final Call to Action */}
      {/* ========================================================================= */}
      <section className="bg-gradient-to-b from-[#070D1E] to-[#040711] text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800 text-center relative overflow-hidden">
        {/* Subtle ambient orange glow responding to scroll */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

        <motion.div 
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="max-w-3xl mx-auto space-y-6 relative z-10"
        >
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
            {t.finalCta.heading}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
            {t.finalCta.desc}
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.3, delay: 0.12, ease: 'easeOut' }}
            className="pt-2 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ y: 0, scale: 0.98 }}
              type="button"
              onClick={handleStartAssessment}
              className="px-8 py-3.5 bg-[#FF6B00] hover:bg-[#E65F00] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <span>{t.finalCta.button}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ y: 0, scale: 0.98 }}
              type="button"
              onClick={() => {
                enterDemoMode();
                navigate('/dashboard');
              }}
              className="px-6 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-amber-300 hover:text-amber-200 font-bold text-xs rounded-xl border border-amber-500/40 hover:border-amber-400 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <Eye className="w-4 h-4 text-amber-400" />
              <span>{t.finalCta.demo}</span>
            </motion.button>

            <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
              <Link
                to="/login"
                className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-200 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition-colors inline-block"
              >
                {t.finalCta.signIn}
              </Link>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
};
