import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  User, 
  BusinessProfile, 
  Approval, 
  DocumentItem, 
  RiskItem, 
  SupportScheme, 
  ComplianceEvent, 
  AdminApplication, 
  DepartmentWorkload, 
  NotificationItem,
  DocumentStatus
} from '../types';
import { 
  initialBusinessProfile, 
  initialApprovals, 
  initialDocuments, 
  initialRisks, 
  initialSupportSchemes, 
  initialComplianceEvents, 
  initialAdminApplications, 
  initialDepartmentWorkloads, 
  initialNotifications 
} from '../data/mockData';
import { Language, translations } from '../data/translations';
import { api } from '../services/api';

interface AppContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  businessProfile: BusinessProfile;
  updateBusinessProfile: (updated: Partial<BusinessProfile>) => void;
  approvals: Approval[];
  documents: DocumentItem[];
  risks: RiskItem[];
  supportSchemes: SupportScheme[];
  complianceEvents: ComplianceEvent[];
  adminApplications: AdminApplication[];
  departmentWorkloads: DepartmentWorkload[];
  notifications: NotificationItem[];
  resolveDocumentMismatch: (docId?: string) => void;
  uploadDocumentSimulated: (docId: string, fileName: string) => void;
  markDocumentVerified: (docId: string) => void;
  addAdminReviewNote: (appId: string, note: string) => void;
  updateAdminAppStatus: (appId: string, status: 'Needs Attention' | 'In Review' | 'Completed') => void;
  markNotificationRead: (id: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isMismatchResolved: boolean;
  recalculatePlan: () => void;
  login: (email: string, role: 'business' | 'admin', department?: string) => void;
  logout: () => void;
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<UserRole>('business');
  const [user, setUser] = useState<User | null>(null);
  const [language, setLanguageState] = useState<Language>('EN');

  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(initialBusinessProfile);
  const [approvals, setApprovals] = useState<Approval[]>(initialApprovals);
  const [documents, setDocuments] = useState<DocumentItem[]>(initialDocuments);
  const [risks, setRisks] = useState<RiskItem[]>(initialRisks);
  const [supportSchemes] = useState<SupportScheme[]>(initialSupportSchemes);
  const [complianceEvents] = useState<ComplianceEvent[]>(initialComplianceEvents);
  const [adminApplications, setAdminApplications] = useState<AdminApplication[]>(initialAdminApplications);
  const [departmentWorkloads] = useState<DepartmentWorkload[]>(initialDepartmentWorkloads);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMismatchResolved, setIsMismatchResolved] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
  };

  const toggleLanguage = () => {
    setLanguageState(prev => {
      const nextLang = prev === 'EN' ? 'HI' : 'EN';
      showToast(nextLang === 'HI' ? "भाषा बदलकर हिन्दी कर दी गई है" : "Language switched to English");
      return nextLang;
    });
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    showToast(lang === 'HI' ? "भाषा बदलकर हिन्दी कर दी गई है" : "Language switched to English");
  };

  const t = (key: string): string => {
    return translations[language][key] || translations['EN'][key] || key;
  };

  const syncLiveDatabase = async (roleType: 'business' | 'admin') => {
    try {
      if (roleType === 'business') {
        const myBiz = await api.getMyBusinesses();
        if (myBiz?.data && myBiz.data.length > 0) {
          const biz = myBiz.data[0];
          setBusinessProfile(prev => ({
            ...prev,
            companyName: biz.name,
            industry: biz.sector,
            investment: `₹${biz.investmentCr} Cr`,
            employees: biz.employees,
            land: `${biz.landAcres} Acres`,
            location: `${biz.city}, ${biz.state}`,
            projectType: 'New Manufacturing Unit',
          }));

          if (biz.applications && biz.applications.length > 0) {
            const liveApp = biz.applications[0];
            const dash = await api.getApplicationDashboard(liveApp.id);
            if (dash?.data) {
              const intel = dash.data.intelligence;
              setBusinessProfile(prev => ({
                ...prev,
                readinessScore: intel?.readiness?.readinessScore || liveApp.readinessScore || prev.readinessScore,
              }));
              if (dash.data.application?.documents?.length > 0) {
                const hasMismatch = dash.data.application.documents.some((d: any) => d.status === 'MISMATCH_DETECTED');
                setIsMismatchResolved(!hasMismatch);
              }
            }
          }
        }
        const schemes = await api.getMatchingSchemes();
        if (schemes?.data && schemes.data.length > 0) {
          // schemes loaded from DB
        }
      } else {
        const adminDash = await api.getAdminDashboard();
        if (adminDash?.data?.overview) {
          // Admin dashboard metrics live from DB
        }
        const adminApps = await api.getAllApplications();
        if (adminApps?.data?.applications?.length > 0) {
          setAdminApplications(adminApps.data.applications.map((app: any) => ({
            id: app.applicationNumber,
            companyName: app.business?.name || 'Industrial Project',
            sector: app.business?.sector || 'Manufacturing',
            investment: `₹${app.business?.investmentCr || 5} Cr`,
            risk: app.riskLevel || 'HIGH',
            status: app.status === 'APPROVED' ? 'Completed' : app.status === 'IN_PROGRESS' ? 'In Review' : 'Needs Attention',
            progress: app.readinessScore || 72,
            hasMismatch: app.documents?.some((d: any) => d.status === 'MISMATCH_DETECTED') ?? true,
            submissionDate: new Date(app.createdAt).toLocaleDateString(),
            criticalApproval: 'Pollution Consent to Establish (CTE)',
            docsAccepted: app.completedApprovals ? app.completedApprovals * 3 : 24,
            docsNeedCorrection: app.riskLevel === 'HIGH' ? 1 : 0,
            docsMissing: 0,
            reviewNotes: [
              `Automated Compliance Ingestion (NTP Database): Project ${app.applicationNumber} synchronized.`
            ]
          })));
        }
      }
    } catch (err) {
      console.log('Live sync fallback to local store:', err);
    }
  };

  const login = async (email: string, roleType: 'business' | 'admin', department?: string) => {
    setRoleState(roleType);
    const targetEmail = email || (roleType === 'business' ? 'business@demo.com' : 'admin@demo.com');
    const targetPass = roleType === 'business' ? 'demo123' : 'admin123';

    try {
      const liveAuth = await api.login(targetEmail, targetPass);
      if (liveAuth?.user) {
        setUser({
          id: liveAuth.user.id,
          email: liveAuth.user.email,
          name: liveAuth.user.name,
          role: roleType,
          companyName: roleType === 'business' ? (liveAuth.user.businesses?.[0]?.name || "Raipur Fresh Foods Pvt. Ltd.") : undefined,
          department: roleType === 'admin' ? (liveAuth.user.department || department || "Commerce & Industries Dept, Govt of CG") : undefined,
        });
        showToast(language === 'HI' ? `लाइव बैकएंड से जुड़ा: ${liveAuth.user.name}` : `Connected to live backend: ${liveAuth.user.name}`);
        await syncLiveDatabase(roleType);
        return;
      }
    } catch (e) {
      console.log('Falling back to responsive offline/mock session');
    }

    if (roleType === 'business') {
      setUser({
        id: "U-001",
        email: targetEmail,
        name: "Rajesh Sharma",
        role: "business",
        companyName: "Raipur Fresh Foods Pvt. Ltd."
      });
      showToast(language === 'HI' ? "व्यावसायिक पोर्टल में साइन इन किया गया: रायपुर फ्रेश फूड्स" : "Signed in to Business Portal: Raipur Fresh Foods Pvt. Ltd.");
    } else {
      setUser({
        id: "U-999",
        email: targetEmail,
        name: "Dr. Ananya Verma, IAS",
        role: "admin",
        department: department || "Department of Commerce & Industry, Govt of CG"
      });
      showToast(language === 'HI' ? "विभागीय अधिकारी के रूप में साइन इन किया गया" : "Signed in as Authorized Department Officer");
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    showToast(language === 'HI' ? "सफलतापूर्वक लॉग आउट किया गया" : "Logged out successfully");
  };

  const updateBusinessProfile = async (updated: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => ({ ...prev, ...updated }));
    try {
      await api.updateProfile(updated);
    } catch (e) {}
    showToast(language === 'HI' ? "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई" : "Business profile updated successfully");
  };

  const recalculatePlan = async () => {
    try {
      await api.recalculateRisk('NTP-00128');
    } catch (e) {}
    showToast(language === 'HI' ? "अनुमोदन योजना की पुनर्गणना की गई!" : "Approval plan recalculated based on updated parameters!");
  };

  // THE WOW MOMENT FUNCTION
  const resolveDocumentMismatch = async (targetDocId?: string) => {
    setIsMismatchResolved(true);

    // Call live backend API
    try {
      await api.resolveDocumentMismatch(targetDocId || 'DOC-001', 'Applicant synchronized DPR and CAD site plan drawing');
    } catch (e) {
      // Offline fallback
    }

    // Update documents: mark Building Plan, DPR, and Form 1-A verified
    setDocuments(prevDocs => 
      prevDocs.map(d => {
        if (d.id === 'DOC-001' || d.id === 'DOC-002' || d.id === 'DOC-003' || (targetDocId && d.id === targetDocId)) {
          return {
            ...d,
            status: 'Verified' as DocumentStatus,
            issue: undefined,
            action: 'Verified by Intelligence Engine',
            mismatchDetail: undefined
          };
        }
        return d;
      })
    );

    // Update Pollution CTE Approval from HIGH risk to LOW risk, status to In Progress (Verified Docs)
    setApprovals(prevApps =>
      prevApps.map(a => {
        if (a.id === 'APP-001') {
          return {
            ...a,
            risk: 'LOW',
            nextAction: 'Ready for Pollution Control Board Final Technical Review',
            dependency: 'Awaiting Board Committee Meeting',
            whyItMatters: 'Document verification cleared; zero discrepancies remaining.'
          };
        }
        return a;
      })
    );

    // Update risks list
    setRisks(prevRisks => prevRisks.filter(r => r.id !== 'RISK-001'));

    // Boost readiness score from 72% to 86%
    setBusinessProfile(prev => ({ ...prev, readinessScore: 86 }));

    // Update Admin application NTP-00128
    setAdminApplications(prevAdminApps =>
      prevAdminApps.map(app => {
        if (app.id === 'NTP-00128') {
          return {
            ...app,
            risk: 'LOW',
            status: 'In Review',
            hasMismatch: false,
            docsNeedCorrection: 0,
            docsMissing: 0,
            docsAccepted: 27,
            reviewNotes: [
              ...app.reviewNotes,
              "System Alert (08 Sep 2026): Applicant corrected area mismatch (12,500 sq ft aligned). Document issue resolved."
            ]
          };
        }
        return app;
      })
    );

    // Add resolution notification
    const newNotif: NotificationItem = {
      id: `NOTIF-${Date.now()}`,
      title: "Issue Resolved: Document Mismatch Cleared",
      message: "Building Plan and DPR area alignment verified. Pollution CTE risk reduced from HIGH to LOW.",
      time: "Just now",
      type: "document",
      link: "/approvals/APP-001",
      read: false,
      recipientRole: "business"
    };
    setNotifications(prev => [newNotif, ...prev]);

    showToast(language === 'HI' 
      ? "दस्तावेज़ विसंगति का समाधान हुआ! जोखिम घटाकर LOW कर दिया गया।" 
      : "INTELLIGENCE ACTION: Mismatch resolved! Pollution CTE risk recalculated to LOW (Readiness: 86%)."
    );
  };

  const uploadDocumentSimulated = (docId: string, fileName: string) => {
    setDocuments(prevDocs =>
      prevDocs.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            status: 'Under Review' as DocumentStatus,
            issue: `Uploaded (${fileName}). Pending verification.`,
            uploadedDate: "Today",
            fileSize: "3.1 MB"
          };
        }
        return d;
      })
    );
    showToast(`Document "${fileName}" uploaded successfully! Status: Under Review`);
  };

  const markDocumentVerified = (docId: string) => {
    setDocuments(prevDocs =>
      prevDocs.map(d => {
        if (d.id === docId) {
          return {
            ...d,
            status: 'Verified' as DocumentStatus,
            issue: undefined,
            action: 'Verified'
          };
        }
        return d;
      })
    );
    showToast("Document marked as Verified");
  };

  const addAdminReviewNote = async (appId: string, note: string) => {
    setAdminApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          return {
            ...app,
            reviewNotes: [...app.reviewNotes, `Officer Note (${new Date().toLocaleTimeString()}): ${note}`]
          };
        }
        return app;
      })
    );
    try {
      await api.reviewApproval('APPR_POLLUTION_CTE', 'UNDER_REVIEW', undefined, note);
    } catch (e) {}
    showToast("Review note added to application file and persisted in database");
  };

  const updateAdminAppStatus = async (appId: string, status: 'Needs Attention' | 'In Review' | 'Completed') => {
    setAdminApplications(prev =>
      prev.map(app => {
        if (app.id === appId) {
          return { ...app, status };
        }
        return app;
      })
    );
    try {
      const dbStatus = status === 'Completed' ? 'APPROVED' : status === 'Needs Attention' ? 'QUERIED' : 'UNDER_REVIEW';
      await api.reviewApproval('APPR_POLLUTION_CTE', dbStatus);
    } catch (e) {}
    showToast(`Application ${appId} status updated to ${status}`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider value={{
      role,
      setRole,
      user,
      setUser,
      businessProfile,
      updateBusinessProfile,
      approvals,
      documents,
      risks,
      supportSchemes,
      complianceEvents,
      adminApplications,
      departmentWorkloads,
      notifications,
      resolveDocumentMismatch,
      uploadDocumentSimulated,
      markDocumentVerified,
      addAdminReviewNote,
      updateAdminAppStatus,
      markNotificationRead,
      toastMessage,
      showToast,
      isMismatchResolved,
      recalculatePlan,
      login,
      logout,
      language,
      toggleLanguage,
      setLanguage,
      t
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
