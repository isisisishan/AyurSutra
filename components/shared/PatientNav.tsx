"use client";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/lib/store/app-store";
import { Leaf } from "lucide-react";
import { useState } from "react";

interface PatientNavProps {
  onBack?: () => void;
  backLabel?: string;
  hideHome?: boolean;
}

export function PatientNav({ onBack, backLabel = "← Back", hideHome = false }: PatientNavProps) {
  const router = useRouter();
  const { patientSession } = useAppStore();
  const [showConfirm, setShowConfirm] = useState(false);

  const handleHomeClick = () => {
    // Check if progress exists
    const hasProgress = !!(
      patientSession.name ||
      patientSession.symptoms ||
      (patientSession.prakritiAnswers && patientSession.prakritiAnswers.length > 0)
    );
    if (hasProgress) {
      setShowConfirm(true);
    } else {
      router.push("/");
    }
  };

  const confirmHome = () => {
    setShowConfirm(false);
    router.push("/");
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <>
      <div className="bg-white border-b border-neutral-100 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left / Back */}
          <div className="flex-1">
            {backLabel && (
              <button
                onClick={handleBack}
                className="flex items-center text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                aria-label={backLabel}
              >
                {backLabel}
              </button>
            )}
          </div>

          {/* Center / Logo */}
          <div className="flex items-center justify-center flex-1 gap-1.5 text-neutral-900">
            <Leaf className="w-4 h-4 text-emerald-600" />
            <span className="font-serif font-semibold">AyurSutra</span>
          </div>

          {/* Right / Home */}
          <div className="flex-1 flex justify-end">
            {!hideHome && (
              <button
                onClick={handleHomeClick}
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Home
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl">
            <h3 className="font-serif text-xl font-semibold text-neutral-900 mb-2">Leave patient journey?</h3>
            <p className="text-sm text-neutral-500 mb-6 leading-relaxed">
              Your saved progress will remain available for this session.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2 text-sm font-medium border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Stay here
              </button>
              <button
                onClick={confirmHome}
                className="flex-1 px-4 py-2 text-sm font-medium bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                Go to home
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
