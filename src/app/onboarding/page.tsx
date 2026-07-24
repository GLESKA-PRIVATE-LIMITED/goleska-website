"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AccountTypeSelector from '@/components/onboarding/AccountTypeSelector';
import RegisteredBusinessWizard from '@/components/onboarding/RegisteredBusinessWizard';
import RegisteredIndustryWizard from '@/components/onboarding/RegisteredIndustryWizard';
import KYCVerificationForm from '@/components/onboarding/KYCVerificationForm';
import UnregisteredBusinessForm from '@/components/onboarding/UnregisteredBusinessForm';
import EmployeeForm from '@/components/onboarding/EmployeeForm';
import OnboardingSidePanel from '@/components/onboarding/OnboardingSidePanel';
import { Loader2, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import StepIndicator from '@/components/onboarding/StepIndicator';

export type AccountType = 'REGISTERED_BUSINESS' | 'REGISTERED_INDUSTRY' | 'UNREGISTERED_BUSINESS' | 'EMPLOYEE' | 'INDIVIDUAL' | null;

export default function OnboardingPage() {
  const { session, user, loading } = useAuth();
  const router = useRouter();
  
  const [checking, setChecking] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [formData, setFormData] = useState<any>({});
  const [initialSide, setInitialSide] = useState<'WORKER' | 'EMPLOYER' | null>(null);

  useEffect(() => {
    // Inject email from login if it exists
    const savedEmail = localStorage.getItem('onboardingEmail');
    if (savedEmail && !formData.email) {
      setFormData((prev: any) => ({ ...prev, email: savedEmail }));
    }
    // Inject side (worker/employer) chosen on landing page, so the redundant
    // "Choose Account" side-selection step can be skipped
    const savedSide = localStorage.getItem('onboardingSide');
    if (savedSide === 'WORKER' || savedSide === 'EMPLOYER') {
      setInitialSide(savedSide);
    }
  }, []);

  useEffect(() => {
    // if (loading) return;
    
    if (!session) {
      router.push('/login');
      return;
    }

    const checkExisting = async () => {
      const phone = user?.phone;
      if (!phone) return;

      // The database might store the phone with a '+' prefix, while Supabase Auth might return it without.
      // We check for both variations to prevent forcing users to re-register.
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const rawPhone = phone.replace('+', '');

      const checkEmployer = async () => {
        const { data } = await supabase
          .from('employers')
          .select('*')
          .in('phone', [formattedPhone, rawPhone])
          .maybeSingle();
        return !!data;
      };

      const checkWorker = async () => {
        const { data } = await supabase
          .from('workers')
          .select('*')
          .in('phone', [formattedPhone, rawPhone])
          .maybeSingle();
        return !!data;
      };

      // Same phone number can end up registering both an employer and a
      // worker profile. If the user chose "I want work" at login, only skip
      // onboarding when a worker profile already exists for this phone -
      // an existing employer profile shouldn't block worker registration.
      const savedSide = localStorage.getItem('onboardingSide');

      if (savedSide === 'WORKER') {
        if (await checkWorker()) {
          router.push('/dashboard');
          return;
        }
      } else {
        if (await checkEmployer()) {
          router.push('/dashboard');
          return;
        }
        if (await checkWorker()) {
          router.push('/dashboard');
          return;
        }
      }

      setChecking(false);
    };
    
    checkExisting();
  }, [session, user, router]);

  const nextStep = () => setCurrentStep(prev => prev + 1);
  const prevStep = () => setCurrentStep(prev => prev - 1);

  const updateFormData = (data: any) => {
    setFormData((prev: any) => ({ ...prev, ...data }));
  };

  if (false) {
    return <div className="flex min-h-screen items-center justify-center bg-[#eef1fb] text-2xl font-extrabold text-slate-900">Loading...</div>;
  }

  // Step 1 (account type) has its own full-screen two-column layout.
  if (currentStep === 1) {
    return (
      <AccountTypeSelector
        selectedType={accountType}
        initialSide={initialSide}
        onSelect={(type) => {
          setAccountType(type);
          nextStep();
        }}
      />
    );
  }

  // REGISTERED_BUSINESS gets a dedicated 4-step left-rail wizard (its own layout).
  // All other account types fall through to the shared step flow below, unchanged.
  if (accountType === 'REGISTERED_BUSINESS') {
    return (
      <RegisteredBusinessWizard
        formData={formData}
        updateFormData={updateFormData}
        onBackToStart={() => {
          setAccountType(null);
          setCurrentStep(1);
        }}
        onComplete={() => router.push('/dashboard')}
      />
    );
  }

  // UNREGISTERED_BUSINESS gets a dedicated 3-step (top-indicator) wizard.
  if (accountType === 'UNREGISTERED_BUSINESS') {
    return (
      <UnregisteredBusinessForm
        formData={formData}
        updateFormData={updateFormData}
        onBackToStart={() => {
          setAccountType(null);
          setCurrentStep(1);
        }}
        onComplete={() => router.push('/dashboard')}
      />
    );
  }

  // REGISTERED_INDUSTRY gets a dedicated 4-step left-rail wizard.
  if (accountType === 'REGISTERED_INDUSTRY') {
    return (
      <RegisteredIndustryWizard
        formData={formData}
        updateFormData={updateFormData}
        onBackToStart={() => {
          setAccountType(null);
          setCurrentStep(1);
        }}
        onComplete={() => router.push('/dashboard')}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-[#eef1fb] font-sans text-slate-900">
      <OnboardingSidePanel />

      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-10">
        <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl shadow-slate-300/40 sm:p-8">

          {/* Mobile brand (side panel is hidden below lg) */}
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
              <Zap size={18} className="text-white" fill="currentColor" />
            </div>
            <span className="font-[var(--font-anton)] text-xl uppercase tracking-wider text-slate-900">GO LESKA</span>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">
              {currentStep === 1 ? (
                <>Choose your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">account</span></>
              ) : (
                <>Complete your <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">profile</span></>
              )}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {currentStep === 1 ? 'Tell us who you are to get started.' : 'Just a few details and a quick verification.'}
            </p>
          </div>

          {/* Step indicator - shown during the multi-step form / KYC stages */}
          {currentStep >= 2 && <StepIndicator steps={['Account', 'Details', 'Verify']} current={currentStep} />}

          {/* Wizard steps (account-type step 1 + all business-type wizards render in their own layouts above). */}
          {currentStep === 2 && (accountType === 'EMPLOYEE' || accountType === 'INDIVIDUAL') && (
            <EmployeeForm
              accountType={accountType}
              formData={formData} 
              updateFormData={updateFormData} 
              onComplete={nextStep} 
              onBack={prevStep} 
            />
          )}

          {currentStep === 3 && (
            <KYCVerificationForm 
              accountType={accountType}
              formData={formData} 
              updateFormData={updateFormData} 
              onComplete={() => router.push('/dashboard')} 
              onBack={prevStep} 
            />
          )}

        </div>
      </main>
    </div>
  );
}
