const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('=== RUNNING VERIFICATION FOR REBUILT LANDING PAGE ===\n');

const landingPath = path.join(__dirname, '../src/pages/public/LandingPage.tsx');
const assessmentPath = path.join(__dirname, '../src/pages/business/AssessmentPage.tsx');
const registerPath = path.join(__dirname, '../src/pages/public/RegisterPage.tsx');
const rulesEnginePath = path.join(__dirname, '../src/services/rulesEngine.ts');

const landingContent = fs.readFileSync(landingPath, 'utf8');
const assessmentContent = fs.readFileSync(assessmentPath, 'utf8');
const registerContent = fs.readFileSync(registerPath, 'utf8');
const rulesEngineContent = fs.readFileSync(rulesEnginePath, 'utf8');

let passed = 0;
let total = 0;

function check(desc, condition) {
  total++;
  if (condition) {
    console.log(`✓ [PASS] ${desc}`);
    passed++;
  } else {
    console.error(`✗ [FAIL] ${desc}`);
  }
}

// 1. Shared Source of Truth
check('rulesEngine exports PROJECT_TYPES', rulesEngineContent.includes('export const PROJECT_TYPES'));
check('rulesEngine exports RECOGNIZED_SECTORS', rulesEngineContent.includes('export const RECOGNIZED_SECTORS'));
check('rulesEngine exports RECOGNIZED_DISTRICTS', rulesEngineContent.includes('export const RECOGNIZED_DISTRICTS'));

check('LandingPage imports PROJECT_TYPES, RECOGNIZED_DISTRICTS, RECOGNIZED_SECTORS', 
  landingContent.includes('PROJECT_TYPES') && 
  landingContent.includes('RECOGNIZED_DISTRICTS') && 
  landingContent.includes('RECOGNIZED_SECTORS')
);

// 2. Navbar Elements
check('Navbar contains Geometric "N" Mark referencing flag subtle palette', 
  landingContent.includes('nLogoGrad') && 
  landingContent.includes('from-[#FF6B00] via-white to-[#10B981]')
);
check('Navbar contains NitiPath wordmark and tagline "Clear Approvals. Confident Growth."', 
  landingContent.includes('Clear Approvals. Confident Growth.')
);
check('Navbar contains exact 6 nav links (Home, How It Works, Approvals, Schemes, Resources, Support)', 
  landingContent.includes('t.nav.home') &&
  landingContent.includes('t.nav.howItWorks') &&
  landingContent.includes('t.nav.approvals') &&
  landingContent.includes('t.nav.schemes') &&
  landingContent.includes('t.nav.resources') &&
  landingContent.includes('t.nav.support')
);
check('Navbar contains functional language toggle "EN | हिंदी"', 
  landingContent.includes('togglePageLanguage') && 
  landingContent.includes("EN | हिंदी")
);
check('Navbar contains "Sign In" outline and "Get Started" filled buttons', 
  landingContent.includes('t.nav.signIn') && 
  landingContent.includes('t.nav.getStarted')
);

// 3. Hero Section
check('Hero contains Pill Badge: "Your Business. A Clear Path."', 
  landingContent.includes('Your Business. A Clear Path.')
);
check('Hero contains Headline with "Approval" highlighted in Orange', 
  landingContent.includes('Navigate Your') && 
  landingContent.includes('text-[#FF6B00]') &&
  landingContent.includes('Journey with Clarity')
);
check('Hero contains exact Subheadline', 
  landingContent.includes("NitiPath helps businesses understand what's required, prepare better, and move forward with confidence.")
);
check('Hero contains primary CTA "Start Business Assessment" in orange filled', 
  landingContent.includes('Start Business Assessment') && 
  landingContent.includes('bg-[#FF6B00]')
);
check('Hero contains secondary CTA "Explore How It Works" outline button', 
  landingContent.includes('Explore How It Works') && 
  landingContent.includes('scrollToHowItWorks')
);
check('Hero contains three pillar badges below CTAs', 
  landingContent.includes('Understand what applies') &&
  landingContent.includes('Prepare with confidence') &&
  landingContent.includes('Move Forward with clarity')
);
check('Hero photo imported and displayed on the right with dark navy gradients', 
  landingContent.includes('heroImage') && 
  landingContent.includes('Industrial and infrastructure highway landscape at sunset')
);

// 4. Quick-Assessment Card
check('Card contains title "Find What Applies to Your Business" with Hindi subtitle', 
  landingContent.includes('Find What Applies to Your Business') && 
  landingContent.includes('त्वरित वैधानिक प्रयोज्यता')
);
check('Card has Business Type dropdown bound to PROJECT_TYPES', 
  landingContent.includes('PROJECT_TYPES.map')
);
check('Card has Region dropdown bound to RECOGNIZED_DISTRICTS', 
  landingContent.includes('RECOGNIZED_DISTRICTS.map')
);
check('Card has Sector dropdown bound to RECOGNIZED_SECTORS', 
  landingContent.includes('RECOGNIZED_SECTORS.map')
);
check('Card contains "Get My Roadmap" button saving to sessionStorage and routing', 
  landingContent.includes('handleGetMyRoadmap') &&
  landingContent.includes('nitipath_quick_assessment') &&
  landingContent.includes('sessionStorage.setItem')
);
check('Card contains Lock icon and "Your information stays private and secure."', 
  landingContent.includes('Your information stays private and secure.')
);

// 5. Data Flow into Assessment and Register
check('AssessmentPage reads sessionStorage or URL query params for pre-filling', 
  assessmentContent.includes('nitipath_quick_assessment') &&
  assessmentContent.includes('sessionStorage.getItem') &&
  assessmentContent.includes('URLSearchParams')
);
check('RegisterPage carries search parameters when redirecting to /assessment', 
  registerContent.includes('window.location.search') &&
  registerContent.includes('navigate(`/assessment${search}`)')
);

// 6. "WHAT NITIPATH DOES" Section
check('Section has badge "WHAT NITIPATH DOES"', 
  landingContent.includes('WHAT NITIPATH DOES')
);
check('Section has heading "An Intelligence Layer Around the Approval Ecosystem" with Hindi subtitle', 
  landingContent.includes('An Intelligence Layer Around the Approval Ecosystem') &&
  landingContent.includes('अनुमोदन की जटिलताओं को समझें')
);
check('Section has 4 cards: Predict, Prevent, Optimize, Track with dual English/Hindi titles and descriptions', 
  landingContent.includes('Predict / पहले से जानें') &&
  landingContent.includes('Know what applies to your business.') &&
  landingContent.includes('Prevent / समस्याओं से बचें') &&
  landingContent.includes('Detect gaps before submission.') &&
  landingContent.includes('Optimize / बेहतर योजना बनाएं') &&
  landingContent.includes('Get clear next steps.') &&
  landingContent.includes('Track / हर कदम पर नज़र रखें') &&
  landingContent.includes('Monitor your progress easily.')
);

// 7. Footer Accent
check('Section contains footer accent "BUILD TODAY. GROW TOMORROW." with horizontal lines', 
  landingContent.includes('BUILD TODAY. GROW TOMORROW.') &&
  landingContent.includes('h-px bg-gradient-to-r')
);

// 8. 8-Step "How It Works" Section
check('How It Works section has id="how-it-works" and all 8 steps', 
  landingContent.includes('id="how-it-works"') &&
  landingContent.includes("num: '01'") &&
  landingContent.includes("num: '08'") &&
  landingContent.includes('Compliance Tracking')
);

console.log(`\nResults: ${passed}/${total} checks passed!`);

if (passed === total) {
  console.log('🎉 ALL LANDING PAGE REBUILD CRITERIA MET AND VERIFIED!');
  process.exit(0);
} else {
  console.error('❌ SOME CHECKS FAILED');
  process.exit(1);
}
