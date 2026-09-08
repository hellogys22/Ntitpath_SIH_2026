export type Language = 'EN' | 'HI';

export const translations: Record<Language, Record<string, string>> = {
  EN: {
    // Top Bar
    govOfIndia: "Government of India",
    bharatSarkar: "भारत सरकार",
    ministryName: "Ministry of Commerce & Industry",
    langToggle: "English / हिन्दी",
    portalTitle: "National Industrial Approval & Compliance Intelligence Portal",
    
    // Nav / Sidebar
    dashboard: "Dashboard",
    businessProfile: "Business Profile",
    approvalRoadmap: "Approval Roadmap",
    documentCheck: "Document Check",
    riskDependencies: "Risk & Dependencies",
    supportSchemes: "Support & Schemes",
    complianceCalendar: "Compliance Calendar",
    copilot: "NitiPath Copilot",
    signOut: "Sign Out",
    welcomeBack: "Welcome back",
    
    // Dashboard Metrics
    readinessScore: "Business Readiness",
    totalApprovals: "Total Approvals",
    requiredDocuments: "Required Documents",
    highRiskIssues: "High Risk Issues",
    upcomingCompliance: "Upcoming Compliance",
    
    // Bottleneck & Actions
    currentBottleneck: "Current Bottleneck",
    highRiskBottleneck: "HIGH RISK BOTTLENECK",
    bottleneckCleared: "BOTTLENECK CLEARED",
    resolveIssue: "Resolve Issue",
    viewApproval: "View Approval Details",
    recommendedNextAction: "Recommended Next Action",
    highestPriority: "Highest Priority Action",
    fixNow: "Fix Now",
    markResolved: "Mark as Resolved (Fix Issue)",
    
    // Workflow & Optimizations
    optimizedPath: "Optimized Approval Path & Workflow Dependencies",
    parallelTrack: "Parallel Independent Track",
    criticalPath: "Critical Path Pipeline",
    
    // Admin
    adminDashboard: "Department Dashboard",
    adminApplications: "Application Management",
    adminApprovals: "Approval Monitoring",
    adminRisks: "Risk & Bottlenecks",
    adminDocuments: "Document Review",
    adminDepartments: "Department Workload",
    adminDependencies: "Workflow Dependencies",
    adminReports: "Reports & Analytics",
    adminSupport: "Support Opportunities",
    adminCompliance: "Compliance Monitoring",
    adminNotifications: "Notifications",
    adminProfile: "Admin Profile",
    
    // Login
    signInTitle: "Sign in to NitiPath",
    businessTab: "Business / Applicant",
    adminTab: "Department / Admin",
    emailLabel: "Registered Email or Mobile ID",
    passwordLabel: "Password",
    captchaLabel: "Security Captcha Code",
    signInBtn: "Secure Sign In",
    officerSignInBtn: "Officer Sign In",
  },
  HI: {
    // Top Bar
    govOfIndia: "भारत सरकार",
    bharatSarkar: "भारत सरकार",
    ministryName: "वाणिज्य एवं उद्योग मंत्रालय",
    langToggle: "हिन्दी / English",
    portalTitle: "राष्ट्रीय औद्योगिक अनुमोदन एवं अनुपालन आसूचना प्रणाली",
    
    // Nav / Sidebar
    dashboard: "डैशबोर्ड",
    businessProfile: "व्यावसायिक प्रोफ़ाइल",
    approvalRoadmap: "अनुमोदन रोडमैप",
    documentCheck: "दस्तावेज़ सत्यापन",
    riskDependencies: "जोखिम एवं निर्भरता",
    supportSchemes: "सरकारी योजनाएं",
    complianceCalendar: "अनुपालन कैलेंडर",
    copilot: "नीतिपथ कोपायलट",
    signOut: "साइन आउट",
    welcomeBack: "पुनः स्वागत है",
    
    // Dashboard Metrics
    readinessScore: "व्यावसायिक तत्परता",
    totalApprovals: "कुल अनुमोदन",
    requiredDocuments: "आवश्यक दस्तावेज़",
    highRiskIssues: "उच्च जोखिम मुद्दे",
    upcomingCompliance: "आगामी अनुपालन",
    
    // Bottleneck & Actions
    currentBottleneck: "वर्तमान अड़चन",
    highRiskBottleneck: "उच्च जोखिम अड़चन",
    bottleneckCleared: "अड़चन का समाधान हुआ",
    resolveIssue: "मुद्दा हल करें",
    viewApproval: "अनुमोदन विवरण देखें",
    recommendedNextAction: "अनुशंसित अगली कार्रवाई",
    highestPriority: "सर्वोच्च प्राथमिकता कार्रवाई",
    fixNow: "अभी सुधारें",
    markResolved: "हल के रूप में चिह्नित करें",
    
    // Workflow & Optimizations
    optimizedPath: "अनुकूलित अनुमोदन पथ एवं कार्यप्रवाह निर्भरता",
    parallelTrack: "समानांतर स्वतंत्र ट्रैक",
    criticalPath: "महत्वपूर्ण मार्ग (क्रिटिकल पाथ)",
    
    // Admin
    adminDashboard: "विभागीय डैशबोर्ड",
    adminApplications: "आवेदन प्रबंधन",
    adminApprovals: "अनुमोदन निगरानी",
    adminRisks: "जोखिम एवं बाधाएं",
    adminDocuments: "दस्तावेज़ समीक्षा",
    adminDepartments: "विभागीय कार्यभार",
    adminDependencies: "कार्यप्रवाह निर्भरताएं",
    adminReports: "रिपोर्ट एवं विश्लेषण",
    adminSupport: "सहायता अवसर",
    adminCompliance: "अनुपालन निगरानी",
    adminNotifications: "अधिसूचनाएं",
    adminProfile: "अधिकारी प्रोफ़ाइल",
    
    // Login
    signInTitle: "नीतिपथ में साइन इन करें",
    businessTab: "उद्योग / व्यावसायिक आवेदक",
    adminTab: "विभागीय अधिकारी",
    emailLabel: "पंजीकृत ईमेल या मोबाइल आईडी",
    passwordLabel: "पासवर्ड",
    captchaLabel: "सुरक्षा कैप्चा कोड",
    signInBtn: "सुरक्षित साइन इन",
    officerSignInBtn: "अधिकारी साइन इन",
  }
};
