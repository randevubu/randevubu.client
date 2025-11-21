'use client';

import { useState, useEffect } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export type BookingStep = 
  | 'service'
  | 'staff'
  | 'datetime'
  | 'time'
  | 'confirm';

interface BookingStepsProps {
  currentStep: BookingStep;
  slug: string;
  serviceId?: string | null;
  staffId?: string | null;
  date?: string | null;
  time?: string | null;
}

interface StepInfo {
  id: BookingStep;
  title: string;
  description: string;
  url: string;
}

export default function BookingSteps({
  currentStep,
  slug,
  serviceId,
  staffId,
  date,
  time
}: BookingStepsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isNavigating, setIsNavigating] = useState(false);

  // Reset loading when pathname changes (navigation completes)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname]);
  
  const steps: StepInfo[] = [
    {
      id: 'service',
      title: 'Hizmet Seçimi',
      description: 'Randevu almak istediğiniz hizmeti seçin',
      url: `/businesses/${slug}/book/service${serviceId ? `?serviceId=${serviceId}` : ''}`
    },
    {
      id: 'staff',
      title: 'Personel Seçimi',
      description: 'Tercih ettiğiniz personeli seçin (isteğe bağlı)',
      url: `/businesses/${slug}/book/staff${serviceId ? `?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}` : ''}`
    },
    {
      id: 'datetime',
      title: 'Tarih Seçimi',
      description: 'Randevu tarihini seçin',
      url: `/businesses/${slug}/book/datetime${serviceId ? `?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}${date ? `&date=${date}` : ''}` : ''}`
    },
    {
      id: 'time',
      title: 'Saat Seçimi',
      description: 'Uygun saati seçin',
      url: `/businesses/${slug}/book/time${serviceId ? `?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}${date ? `&date=${date}` : ''}${time ? `&time=${time}` : ''}` : ''}`
    },
    {
      id: 'confirm',
      title: 'Onay',
      description: 'Randevu bilgilerini kontrol edin',
      url: `/businesses/${slug}/book/confirm${serviceId ? `?serviceId=${serviceId}${staffId ? `&staffId=${staffId}` : ''}${date ? `&date=${date}` : ''}${time ? `&time=${time}` : ''}` : ''}`
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStep);
  };

  const getStepStatus = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex();
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'upcoming';
  };

  const isStepAccessible = (stepIndex: number) => {
    const currentIndex = getCurrentStepIndex();
    
    // Allow access to previous steps and current step
    if (stepIndex <= currentIndex) return true;
    
    // Check prerequisites for future steps
    if (stepIndex === 1 && !serviceId) return false; // Staff needs service
    if (stepIndex === 2 && !serviceId) return false; // Date needs service
    if (stepIndex === 3 && (!serviceId || !date)) return false; // Time needs service and date
    if (stepIndex === 4 && (!serviceId || !date || !time)) return false; // Confirm needs all
    
    return false;
  };

  const getBackUrl = () => {
    const currentIndex = getCurrentStepIndex();
    
    // If on first step, go back to business page
    if (currentIndex === 0) {
      return `/businesses/${slug}`;
    }
    
    // Otherwise, go to previous step
    const previousStep = steps[currentIndex - 1];
    return previousStep.url;
  };

  const handleBack = () => {
    setIsNavigating(true);
    router.push(getBackUrl());
  };

  const handleStepClick = (url: string, isAccessible: boolean) => {
    if (isAccessible) {
      setIsNavigating(true);
    }
  };

  const currentIndex = getCurrentStepIndex();
  const progressPercentage = (currentIndex / (steps.length - 1)) * 100;

  return (
    <div className="relative bg-[var(--theme-card)] rounded-xl md:rounded-2xl shadow-lg md:shadow-xl border border-[var(--theme-border)]/50 overflow-hidden mb-4 md:mb-6">
      {/* Loading Overlay */}
      {isNavigating && (
        <div className="absolute inset-0 bg-[var(--theme-background)]/70 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-xl md:rounded-2xl transition-opacity duration-200">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[var(--theme-primary)]/60 border-t-[var(--theme-primary)] rounded-full animate-spin" style={{ animationDuration: '0.8s' }} />
            <p className="text-xs text-[var(--theme-foregroundSecondary)]">
              Yükleniyor...
            </p>
          </div>
        </div>
      )}
      {/* Desktop Header Section */}
      <div className="hidden md:block bg-gradient-to-r from-[var(--theme-primary)]/5 via-[var(--theme-primary)]/3 to-transparent px-6 pt-6 pb-4 border-b border-[var(--theme-border)]/50">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] transition-all duration-200 group px-3 py-1.5 rounded-lg hover:bg-[var(--theme-primary)]/10"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Geri</span>
          </button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--theme-background)] border border-[var(--theme-border)]">
            <span className="text-xs font-semibold text-[var(--theme-primary)]">
              {currentIndex + 1}
            </span>
            <span className="text-xs text-[var(--theme-foregroundMuted)]">/</span>
            <span className="text-xs text-[var(--theme-foregroundMuted)]">
              {steps.length}
            </span>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold text-[var(--theme-foreground)] mb-1.5">
            Randevu Adımları
          </h2>
          <p className="text-sm text-[var(--theme-foregroundSecondary)]">
            {steps[currentIndex]?.description}
          </p>
        </div>
      </div>

      {/* Mobile Header - Compact */}
      <div className="md:hidden px-4 py-3 border-b border-[var(--theme-border)]/50">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-[var(--theme-foregroundSecondary)] hover:text-[var(--theme-primary)] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Geri</span>
          </button>
          
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[var(--theme-background)] border border-[var(--theme-border)]">
            <span className="text-[10px] font-bold text-[var(--theme-primary)]">
              {currentIndex + 1}
            </span>
            <span className="text-[10px] text-[var(--theme-foregroundMuted)]">/</span>
            <span className="text-[10px] text-[var(--theme-foregroundMuted)]">
              {steps.length}
            </span>
          </div>
        </div>

        {/* Compact Step Indicator - Only dots */}
        <div className="flex items-center justify-center gap-2 mb-3">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isCompleted = status === 'completed';
            const isCurrent = status === 'current';
            
            return (
              <div
                key={step.id}
                className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                  isCompleted || isCurrent
                    ? 'bg-[var(--theme-primary)]'
                    : 'bg-[var(--theme-border)]'
                }`}
              />
            );
          })}
        </div>

        {/* Current Step Info */}
        <div>
          <h3 className="text-sm font-bold text-[var(--theme-foreground)] mb-1">
            {steps[currentIndex]?.title}
          </h3>
          <p className="text-xs text-[var(--theme-foregroundSecondary)] leading-relaxed">
            {steps[currentIndex]?.description}
          </p>
        </div>
      </div>

      {/* Desktop View - Horizontal Steps */}
      <div className="hidden md:block px-6 py-8">
        <div className="relative">
          {/* Progress Track */}
          <div className="absolute top-6 left-0 right-0 h-1 bg-[var(--theme-border)] rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-[var(--theme-primary)] to-[var(--theme-primary)]/80 rounded-full transition-all duration-500 ease-out shadow-sm"
              style={{
                width: `${progressPercentage}%`
              }}
            />
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {steps.map((step, index) => {
              const status = getStepStatus(index);
              const isAccessible = isStepAccessible(index);
              const isCompleted = status === 'completed';
              const isCurrent = status === 'current';
              const isUpcoming = status === 'upcoming';
              
              return (
                <div key={step.id} className="flex flex-col items-center flex-1 relative z-10">
                  <Link
                    href={isAccessible ? step.url : '#'}
                    className={`flex flex-col items-center group transition-all duration-300 ${
                      !isAccessible ? 'cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    onClick={(e) => {
                      if (!isAccessible) {
                        e.preventDefault();
                      } else {
                        handleStepClick(step.url, isAccessible);
                      }
                    }}
                  >
                    {/* Step Circle with Glow Effect */}
                    <div className="relative">
                      {/* Glow effect for current step */}
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-full bg-[var(--theme-primary)]/20 blur-md animate-pulse" />
                      )}
                      
                      {/* Step Circle */}
                      <div
                        className={`relative w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-[var(--theme-primary)] border-[var(--theme-primary)] text-white shadow-lg shadow-[var(--theme-primary)]/30 scale-105'
                            : isCurrent
                            ? 'bg-white border-[var(--theme-primary)] text-[var(--theme-primary)] shadow-lg shadow-[var(--theme-primary)]/20 scale-110'
                            : 'bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-foregroundMuted)]'
                        } ${
                          isAccessible && !isCurrent && !isUpcoming
                            ? 'group-hover:border-[var(--theme-primary)]/60 group-hover:scale-105 group-hover:shadow-md'
                            : ''
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5" strokeWidth={3} />
                        ) : (
                          <span className={`text-sm font-bold ${
                            isCurrent ? 'text-[var(--theme-primary)]' : 'text-[var(--theme-foregroundMuted)]'
                          }`}>
                            {index + 1}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Step Title */}
                    <div className="mt-4 text-center max-w-[140px]">
                      <div
                        className={`text-xs font-semibold transition-colors duration-200 ${
                          isCurrent
                            ? 'text-[var(--theme-primary)]'
                            : isCompleted
                            ? 'text-[var(--theme-foreground)]'
                            : 'text-[var(--theme-foregroundMuted)]'
                        }`}
                      >
                        {step.title}
                      </div>
                      {step.id === 'staff' && (
                        <div className="text-[10px] text-[var(--theme-foregroundMuted)] mt-1 font-medium">
                          (İsteğe bağlı)
                        </div>
                      )}
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}

