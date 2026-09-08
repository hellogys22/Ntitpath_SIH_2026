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
  Layers
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { IntelligenceBanner } from '../../components/common/IntelligenceBanner';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';

export const AssessmentPage: React.FC = () => {
  const navigate = useNavigate();
  const { businessProfile, updateBusinessProfile, recalculatePlan, showToast } = useApp();
  
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState({ ...businessProfile });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleGeneratePlan = () => {
    updateBusinessProfile(formData);
    recalculatePlan();
    showToast("Approval roadmap generated successfully based on project parameters!");
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <IntelligenceBanner />
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-govNavy-700 bg-govNavy-50 px-3 py-1 rounded-full border border-govNavy-200">
            Smart Onboarding Wizard
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">Business Assessment</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure your enterprise details to map statutory clearances and risk bottlenecks.
          </p>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs mb-8">
          <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
            <div className={`p-2 rounded-lg ${step >= 1 ? 'bg-govNavy-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
              Step 1: Business Info
            </div>
            <div className={`p-2 rounded-lg ${step >= 2 ? 'bg-govNavy-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
              Step 2: Project Details
            </div>
            <div className={`p-2 rounded-lg ${step >= 3 ? 'bg-govNavy-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
              Step 3: Operations & Scale
            </div>
            <div className={`p-2 rounded-lg ${step >= 4 ? 'bg-govNavy-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
              Step 4: Review & Generate
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8">
          
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Step 1: Business Information</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Company / Enterprise Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Industry Sector</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  >
                    <option>Food Processing</option>
                    <option>Pharmaceutical Manufacturing</option>
                    <option>Metallurgical & Heavy Engineering</option>
                    <option>Textiles & Apparel</option>
                    <option>Renewable Energy & Solar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District / Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Step 2: Project Information</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Category / Type</label>
                <select
                  value={formData.projectType}
                  onChange={(e) => handleInputChange('projectType', e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                >
                  <option>New Manufacturing Unit</option>
                  <option>Expansion of Existing Plant</option>
                  <option>Diversification / Product Line Add</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Capital Investment (₹)</label>
                  <input
                    type="text"
                    value={formData.investment}
                    onChange={(e) => handleInputChange('investment', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Land Area Required</label>
                  <input
                    type="text"
                    value={formData.land}
                    onChange={(e) => handleInputChange('land', e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Step 3: Operations & Scale</h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Workforce / Employees</label>
                <input
                  type="number"
                  value={formData.employees}
                  onChange={(e) => handleInputChange('employees', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-800 block">Identified Regulatory Scope:</span>
                <p className="text-xs text-slate-600">• Water effluent discharge requires Pollution Control Board CTE</p>
                <p className="text-xs text-slate-600">• High-tension power feed requires DISCOM grid connection</p>
                <p className="text-xs text-slate-600">• Food production requires Central FSSAI licensing</p>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Step 4: Review Assessment Summary</h3>

              <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 font-semibold block">Company Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{formData.companyName}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Industry Sector:</span>
                  <span className="font-bold text-slate-900 text-sm">{formData.industry}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Location:</span>
                  <span className="font-bold text-slate-900">{formData.location}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Investment & Scale:</span>
                  <span className="font-bold text-slate-900">{formData.investment} • {formData.employees} Workers</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Land Acquisition:</span>
                  <span className="font-bold text-slate-900">{formData.land}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-semibold block">Project Type:</span>
                  <span className="font-bold text-slate-900">{formData.projectType}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs text-amber-900">
                <span className="font-bold block">⚡ Intelligence Engine Ready</span>
                Generating approval plan will map 18 statutory clearances, detect pre-filing risks, and build parallel execution pipelines.
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-center">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
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
                className="px-8 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Generate Approval Plan</span>
              </button>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};
