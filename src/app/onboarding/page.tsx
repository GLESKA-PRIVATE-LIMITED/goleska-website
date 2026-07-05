"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import AccountTypeSelector from '@/components/onboarding/AccountTypeSelector';
import BusinessDetailsForm from '@/components/onboarding/BusinessDetailsForm';
import KYCVerificationForm from '@/components/onboarding/KYCVerificationForm';
import UnregisteredBusinessForm from '@/components/onboarding/UnregisteredBusinessForm';
import EmployeeForm from '@/components/onboarding/EmployeeForm';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export type AccountType = 'REGISTERED_BUSINESS' | 'REGISTERED_INDUSTRY' | 'UNREGISTERED_BUSINESS' | 'EMPLOYEE' | 'INDIVIDUAL' | null;

export default function OnboardingPage() {
  const { session, user } = useAuth();
  const router = useRouter();
  
  const [checking, setChecking] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [accountType, setAccountType] = useState<AccountType>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    const checkExisting = async () => {
      const phone = user?.phone;
      if (!phone) return;
      
      const { data: empData } = await supabase.from('employers').select('*').eq('phone', phone).single();
      if (empData) {
        router.push('/dashboard');
        return;
      }
      
      const { data: workerData } = await supabase.from('workers').select('*').eq('phone', phone).single();
      if (workerData) {
        router.push('/dashboard');
        return;
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

  if (checking) {
    return <div className="min-h-screen bg-[var(--color-paper)] flex items-center justify-center font-[var(--font-anton)] text-3xl">LOADING...</div>;
  }

  return (
    <div className="min-h-screen bg-[var(--color-paper)] font-sans flex items-center justify-center p-6 selection:bg-[var(--color-saffron)] selection:text-white">
      <div className="w-full max-w-2xl bg-white border-4 border-[var(--color-charcoal)] hard-shadow p-8 relative">
        
        {/* Progress Indicator */}
        <div className="mb-8 border-b-2 border-[var(--color-charcoal)] pb-4">
          <div className="flex justify-between items-end">
            <h1 className="font-[var(--font-anton)] text-4xl uppercase tracking-wide">
              {currentStep === 1 ? 'Choose Account' : 'Profile Setup'}
            </h1>
            <span className="font-bold text-[var(--color-charcoal)]">Step {currentStep}</span>
          </div>
        </div>

        {/* Wizard Steps */}
        {currentStep === 1 && (
          <AccountTypeSelector 
            selectedType={accountType} 
            onSelect={(type) => {
              setAccountType(type);
              nextStep();
            }} 
          />
        )}

        {/* REGISTERED BUSINESS / INDUSTRY FLOW */}
        {currentStep === 2 && (accountType === 'REGISTERED_BUSINESS' || accountType === 'REGISTERED_INDUSTRY') && (
          <BusinessDetailsForm 
            formData={formData} 
            updateFormData={updateFormData} 
            onNext={nextStep} 
            onBack={prevStep} 
          />
        )}
        
        {/* UNREGISTERED BUSINESS FLOW */}
        {currentStep === 2 && accountType === 'UNREGISTERED_BUSINESS' && (
          <UnregisteredBusinessForm
            formData={formData} 
            updateFormData={updateFormData} 
            onComplete={nextStep} 
            onBack={prevStep} 
          />
        )}

        {/* EMPLOYEE & INDIVIDUAL FLOW */}
        {currentStep === 2 && (accountType === 'EMPLOYEE' || accountType === 'INDIVIDUAL') && (
          <EmployeeForm
            accountType={accountType}
            formData={formData} 
            updateFormData={updateFormData} 
            onComplete={nextStep} 
            onBack={prevStep} 
          />
        )}

        {/* UNIFIED KYC STEP 3 (All Account Types) */}
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
    </div>
  );
}
