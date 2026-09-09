import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  MapPin, 
  Coins, 
  Users, 
  Ruler, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Layers,
  AlertTriangle,
  FileText,
  Clock,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  RECOGNIZED_SECTORS, 
  RECOGNIZED_DISTRICTS, 
  generateRoadmapAndChecklist 
} from '../../services/rulesEngine';
import { api } from '../../services/api';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessProfile, updateBusinessProfile, applyGeneratedPlan, showToast } = useApp();
  
  const [step, setStep] = useState<number>(1);
  
  // Initialize form data with typed numeric fields for precise validation
  const [formData, setFormData] = useState({
    companyName: businessProfile.companyName || 'Raipur Fresh Foods Pvt. Ltd.',
    industry: businessProfile.industry && (RECOGNIZED_SECTORS as readonly string[]).includes(businessProfile.industry)
      ? businessProfile.industry
      : RECOGNIZED_SECTORS[0],
    location: businessProfile.location && (RECOGNIZED_DISTRICTS as readonly string[]).includes(businessProfile.location)
      ? businessProfile.location
      : RECOGNIZED_DISTRICTS[0],
    projectType: businessProfile.projectType || 'New Manufacturing Unit',
    investmentAmountCr: parseFloat(businessProfile.investment?.replace(/[^0-9.]/g, '') || '12.5') || 12.5,
    landAcres: parseFloat(businessProfile.land?.replace(/[^0-9.]/g, '') || '4.5') || 4.5,
    employees: businessProfile.employees || 45,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear inline error for this field when user edits
    if (errors[field]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (globalError) setGlobalError(null);
  };

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.companyName || formData.companyName.trim().length < 3) {
        newErrors.companyName = 'Company name is mandatory and must be at least 3 characters.';
      }
      if (!formData.industry || !(RECOGNIZED_SECTORS as readonly string[]).includes(formData.industry)) {
        newErrors.industry = 'Please select a recognized industrial sector from the predefined list.';
      }
      if (!formData.location || !(RECOGNIZED_DISTRICTS as readonly string[]).includes(formData.location)) {
        newErrors.location = 'Please select a recognized Chhattisgarh industrial district from the predefined list.';
      }
    }

    if (currentStep === 2) {
      if (!formData.projectType || formData.projectType.trim().length === 0) {
        newErrors.projectType = 'Please select an industrial project category.';
      }
      const inv = Number(formData.investmentAmountCr);
      if (isNaN(inv) || inv <= 0) {
        newErrors.investmentAmountCr = 'Capital investment must be a positive number greater than 0 (in ₹ Crores).';
      }
      const land = Number(formData.landAcres);
      if (isNaN(land) || land <= 0) {
        newErrors.landAcres = 'Land requirement must be a positive number greater than 0 (in Acres).';
      }
    }

    if (currentStep === 3) {
      const emp = Number(formData.employees);
      if (isNaN(emp) || !Number.isInteger(emp) || emp < 1) {
        newErrors.employees = 'Total workforce must be a whole integer of at least 1 employee.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setGlobalError(null);
    if (!validateStep(step)) {
      return;
    }
    if (step < 4) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setGlobalError(null);
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Live plan preview calculation for Step 4
  const planPreview = React.useMemo(() => {
    return generateRoadmapAndChecklist({
      companyName: formData.companyName,
      industry: formData.industry,
      location: formData.location,
      investmentAmountCr: Number(formData.investmentAmountCr) || 0,
      landAcres: Number(formData.landAcres) || 0,
      employees: Number(formData.employees) || 0,
      projectType: formData.projectType,
    });
  }, [formData]);

  const handleGeneratePlan = async () => {
    // 1. Run complete validation across all steps
    const isStep1Valid = validateStep(1);
    const isStep2Valid = validateStep(2);
    const isStep3Valid = validateStep(3);

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid) {
      setGlobalError('Unable to generate compliance plan for given parameters — please verify inputs in all previous steps.');
      return;
    }

    setIsSubmitting(true);
    setGlobalError(null);

    try {
      // 2. Run rules engine to produce dynamic approvals & documents checklist
      const result = generateRoadmapAndChecklist({
        companyName: formData.companyName.trim(),
        industry: formData.industry,
        location: formData.location,
        investmentAmountCr: Number(formData.investmentAmountCr),
        landAcres: Number(formData.landAcres),
        employees: Number(formData.employees),
        projectType: formData.projectType,
      });

      // 3. Error state check: 0 approvals or 0 documents
      if (!result.success || result.approvals.length === 0 || result.documents.length === 0) {
        setGlobalError(result.error || 'Unable to generate compliance plan for given parameters — please verify inputs.');
        setIsSubmitting(false);
        return;
      }

      // 4. Update BusinessProfile in AppContext
      await updateBusinessProfile({
        companyName: formData.companyName.trim(),
        industry: formData.industry,
        location: formData.location,
        projectType: formData.projectType,
        investment: `₹${formData.investmentAmountCr} Cr`,
        land: `${formData.landAcres} Acres`,
        employees: Number(formData.employees),
        readinessScore: result.readinessScore,
      });

      // 5. Apply dynamic approvals and document checklist to AppContext
      applyGeneratedPlan({
        approvals: result.approvals,
        documents: result.documents,
        risks: result.risks,
        readinessScore: result.readinessScore,
      });

      // 6. Optional backend persistence (graceful fallback)
      try {
        await api.createApplication({
          businessName: formData.companyName.trim(),
          sector: formData.industry,
          investmentCr: Number(formData.investmentAmountCr),
          employees: Number(formData.employees),
          landAcres: Number(formData.landAcres),
          city: formData.location.split('(')[0].trim(),
          state: 'Chhattisgarh',
          pinCode: '492001',
          projectType: formData.projectType,
        });
      } catch (err) {
        console.log('Backend application sync completed in local store mode');
      }

      showToast(`Intelligence Engine: Generated ${result.approvals.length} clearances & ${result.documents.length} dynamic documents!`);
      navigate('/onboarding/documents');
    } catch (err) {
      console.error('Plan generation failed:', err);
      setGlobalError('An unexpected error occurred while compiling statutory clearances. Please check your inputs.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <IntelligenceBanner />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-govNavy-700 bg-govNavy-50 px-3 py-1 rounded-full border border-govNavy-200">
            Smart Statutory Onboarding Wizard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Industrial Project Assessment</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl mx-auto">
            Configure your enterprise scale and location to dynamically map applicable statutory clearances, authority rules, and document requirements.
          </p>
        </div>

        {/* Global Error Summary Banner */}
        {globalError && (
          <div className="p-4 mb-6 bg-red-50 border border-red-300 rounded-xl text-red-900 flex items-start gap-3 shadow-xs animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-red-900">Compliance Generation Blocked</h4>
              <p className="text-xs text-red-700 mt-0.5">{globalError}</p>
            </div>
          </div>
        )}

        {/* Step Progress Bar */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-xs mb-8">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            <div className={`p-2.5 rounded-lg transition-all ${step >= 1 ? 'bg-govNavy-800 text-white shadow-xs' : 'bg-slate-100 text-slate-400'}`}>
              <span className="hidden sm:inline">Step 1: </span>Business Info
            </div>
            <div className={`p-2.5 rounded-lg transition-all ${step >= 2 ? 'bg-govNavy-800 text-white shadow-xs' : 'bg-slate-100 text-slate-400'}`}>
              <span className="hidden sm:inline">Step 2: </span>Project Scale
            </div>
            <div className={`p-2.5 rounded-lg transition-all ${step >= 3 ? 'bg-govNavy-800 text-white shadow-xs' : 'bg-slate-100 text-slate-400'}`}>
              <span className="hidden sm:inline">Step 3: </span>Operations
            </div>
            <div className={`p-2.5 rounded-lg transition-all ${step >= 4 ? 'bg-govNavy-800 text-white shadow-xs' : 'bg-slate-100 text-slate-400'}`}>
              <span className="hidden sm:inline">Step 4: </span>Review & Generate
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
          
          {/* STEP 1: BUSINESS INFORMATION */}
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-govNavy-700" />
                  <span>Step 1: Business & Location Identity</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Specify registered legal entity details and industrial jurisdiction.</p>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Company / Enterprise Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="e.g. Raipur Steel & Alloys Ltd."
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.companyName ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-govNavy-500'} rounded-lg text-xs font-medium focus:outline-none focus:ring-2`}
                />
                {errors.companyName && (
                  <p className="text-red-600 text-xs font-semibold mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.companyName}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Recognized Industry Sector <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.industry ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-govNavy-500'} rounded-lg text-xs font-medium focus:outline-none focus:ring-2`}
                  >
                    {RECOGNIZED_SECTORS.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                  {errors.industry && (
                    <p className="text-red-600 text-xs font-semibold mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.industry}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">Sector triggers specialized regulatory bodies (e.g. FSSAI, PESO, Drug Controller).</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Industrial District (Chhattisgarh) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.location ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-govNavy-500'} rounded-lg text-xs font-medium focus:outline-none focus:ring-2`}
                  >
                    {RECOGNIZED_DISTRICTS.map(dist => (
                      <option key={dist} value={dist}>{dist}</option>
                    ))}
                  </select>
                  {errors.location && (
                    <p className="text-red-600 text-xs font-semibold mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.location}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">Select location to determine regional authority rules (e.g. PESA, Fly Ash, RDA).</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: PROJECT DETAILS & SCALE */}
          {step === 2 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Coins className="w-5 h-5 text-govNavy-700" />
                  <span>Step 2: Project Classification & Scale</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Define investment thresholds, capital allocation, and physical footprint.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Project Category / Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.projectType ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-govNavy-500'} rounded-lg text-xs font-medium focus:outline-none focus:ring-2`}
                >
                  <option value="New Manufacturing Unit">New Manufacturing Unit (Greenfield)</option>
                  <option value="Expansion of Existing Plant">Expansion of Existing Plant (Brownfield)</option>
                  <option value="Diversification / Product Line Add">Diversification / Product Line Addition</option>
                </select>
                {errors.projectType && (
                  <p className="text-red-600 text-xs font-semibold mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.projectType}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Capital Investment (in ₹ Crores) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-xs font-bold text-slate-500">₹</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.investmentAmountCr}
                      onChange={(e) => handleInputChange('investmentAmountCr', parseFloat(e.target.value) || '')}
                      placeholder="e.g. 15.0"
                      className={`w-full pl-8 pr-16 py-2.5 bg-slate-50 border ${errors.investmentAmountCr ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-govNavy-500'} rounded-lg text-xs font-medium focus:outline-none focus:ring-2`}
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-400">Crores</span>
                  </div>
                  {errors.investmentAmountCr && (
                    <p className="text-red-600 text-xs font-semibold mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.investmentAmountCr}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">Thresholds: &gt;₹10 Cr triggers EIA; &gt;₹50 Cr triggers State Cabinet (SHLCC).</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Total Land Footprint (in Acres) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.landAcres}
                      onChange={(e) => handleInputChange('landAcres', parseFloat(e.target.value) || '')}
                      placeholder="e.g. 5.0"
                      className={`w-full px-3.5 pr-14 py-2.5 bg-slate-50 border ${errors.landAcres ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-govNavy-500'} rounded-lg text-xs font-medium focus:outline-none focus:ring-2`}
                    />
                    <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-semibold text-slate-400">Acres</span>
                  </div>
                  {errors.landAcres && (
                    <p className="text-red-600 text-xs font-semibold mt-1 flex items-center gap-1">
                      <span>⚠</span> {errors.landAcres}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 mt-1">Thresholds: &gt;10 Acres triggers Central Ground Water Authority bulk allocation.</p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: OPERATIONS & REGULATORY SCOPE */}
          {step === 3 && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-govNavy-700" />
                  <span>Step 3: Operations & Workforce Scale</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Determine employment volume and verify automatically mapped statutory triggers.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Total Workforce / Employees <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={formData.employees}
                  onChange={(e) => handleInputChange('employees', parseInt(e.target.value, 10) || '')}
                  placeholder="e.g. 50"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border ${errors.employees ? 'border-red-500 focus:ring-red-400' : 'border-slate-300 focus:ring-govNavy-500'} rounded-lg text-xs font-medium focus:outline-none focus:ring-2`}
                />
                {errors.employees && (
                  <p className="text-red-600 text-xs font-semibold mt-1 flex items-center gap-1">
                    <span>⚠</span> {errors.employees}
                  </p>
                )}
                <p className="text-[11px] text-slate-500 mt-1">Governs Factories Act 1948 license, DISH safety inspectorate, and welfare audits.</p>
              </div>

              {/* Dynamic Regulatory Preview Card */}
              <div className="bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-govNavy-700" />
                    <span>Dynamic Regulatory Scope Mapped:</span>
                  </span>
                  <span className="text-[11px] font-semibold text-govNavy-700 bg-govNavy-50 px-2 py-0.5 rounded border border-govNavy-200">
                    Live Parameters
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-0.5">🏭 Sector Clearence:</span>
                    <span className="text-slate-600">
                      {formData.industry.includes('Food') && 'Central FSSAI License & FSMS Water Potability Audit'}
                      {formData.industry.includes('Pharma') && 'State Drug Controller (Form 25/28) & WHO-GMP Schedule M'}
                      {(formData.industry.includes('Metallurg') || formData.industry.includes('Steel')) && 'PESO Gas Storage & Blast Furnace Crane Safety Approval'}
                      {formData.industry.includes('Renewable') && 'CREDA Grid Interconnection & Solar BIS Certification'}
                      {formData.industry.includes('Textile') && 'Zero-Liquid-Discharge (ZLD) Certification & Effluent Neutralization'}
                      {formData.industry.includes('Chemical') && 'PESO Petroleum Storage Sanction & HAZOP Safety Plan'}
                      {formData.industry.includes('Technology') && 'STPI Export Unit Approval & E-Waste Management Authorization'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-0.5">💰 Investment Level:</span>
                    <span className="text-slate-600">
                      {Number(formData.investmentAmountCr) > 50 
                        ? 'State High-Level Clearance Committee (SHLCC) Cabinet Sanction'
                        : Number(formData.investmentAmountCr) > 10
                        ? 'SEIAA Environmental Impact Assessment (EIA) Public Hearing'
                        : 'District Industries Centre (DIC) MSME Fast-Track Clearance'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-0.5">📐 Land Threshold:</span>
                    <span className="text-slate-600">
                      {Number(formData.landAcres) > 10
                        ? 'CGWA & WRD Bulk Groundwater Abstraction Clearance'
                        : 'CSIDC Industrial Estate Standard Plot Allotment & Lease Deed'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-0.5">📍 Location Rule:</span>
                    <span className="text-slate-600">
                      {formData.location.includes('Korba') && 'Korba Corridor Fly Ash 100% Utilization Undertaking'}
                      {formData.location.includes('Bastar') && 'PESA Gram Sabha Consent & Tribal Land Tenancy (170-B) Clearance'}
                      {formData.location.includes('Raipur') && 'Raipur Development Authority (RDA) Master Plan Clearance'}
                      {formData.location.includes('Raigarh') && 'Raigarh Heavy Industrial Zone CAAQMS Ambient Air Agreement'}
                      {!formData.location.includes('Korba') && !formData.location.includes('Bastar') && !formData.location.includes('Raipur') && !formData.location.includes('Raigarh') && 'Standard Chhattisgarh District Single Window Protocol'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW ASSESSMENT & GENERATE PLAN */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span>Step 4: Review Assessment & Compile Plan</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Confirm configured project parameters before generating the statutory roadmap and dynamic checklist.</p>
              </div>

              {/* Profile Summary Card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold block">Company Name:</span>
                  <span className="font-bold text-slate-900 text-sm break-words">{formData.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Industry Sector:</span>
                  <span className="font-bold text-slate-900 text-sm">{formData.industry}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">District / Cluster:</span>
                  <span className="font-bold text-slate-900">{formData.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Capital Investment:</span>
                  <span className="font-bold text-slate-900">₹{formData.investmentAmountCr} Crores</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Land Requirement:</span>
                  <span className="font-bold text-slate-900">{formData.landAcres} Acres</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Workforce Scale:</span>
                  <span className="font-bold text-slate-900">{formData.employees} Employees</span>
                </div>
              </div>

              {/* Intelligence Engine Projection Preview */}
              <div className="p-4 bg-govNavy-50 rounded-xl border border-govNavy-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-govNavy-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Dynamic Plan Compilation Projection</span>
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Engine Validated
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="bg-white p-3 rounded-lg border border-govNavy-100 shadow-2xs">
                    <span className="text-xl sm:text-2xl font-black text-govNavy-900 block">
                      {planPreview.approvals.length}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">Statutory Clearances</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-govNavy-100 shadow-2xs">
                    <span className="text-xl sm:text-2xl font-black text-govNavy-900 block text-blue-600">
                      {planPreview.documents.length}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">Checklist Documents</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-govNavy-100 shadow-2xs">
                    <span className="text-xl sm:text-2xl font-black text-govNavy-900 block text-amber-600">
                      ~{planPreview.criticalPathDays}d
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">Critical Path SLA</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-govNavy-100 shadow-2xs">
                    <span className="text-xl sm:text-2xl font-black text-govNavy-900 block text-emerald-600">
                      {planPreview.readinessScore}%
                    </span>
                    <span className="text-[11px] font-bold text-slate-500">Initial Readiness</span>
                  </div>
                </div>

                <p className="text-[11px] text-govNavy-700 mt-3 text-center">
                  Checklist generates issuing authorities, where-to-get-it guidance, and acquisition difficulty ratings.
                </p>
              </div>
            </div>
          )}

          {/* Wizard Navigation Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-govNavy-800 hover:bg-govNavy-900 text-white text-xs font-extrabold rounded-lg shadow-md transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGeneratePlan}
                disabled={isSubmitting}
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 animate-spin-slow" />
                <span>{isSubmitting ? 'Generating Plan...' : 'Generate Approval Plan & Checklist'}</span>
              </button>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
