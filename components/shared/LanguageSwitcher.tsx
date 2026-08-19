"use client";
import { useAppStore } from "@/lib/store/app-store";
import { SUPPORTED_LANGUAGES } from "@/lib/utils";
import { Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({ className }: { className?: string }) {
  const { language, setLanguage } = useAppStore();
  const [open, setOpen] = useState(false);

  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  if (!mounted) {
    return <div className={cn("relative w-24 h-8", className)} />;
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[0.5rem] border border-neutral-200 bg-white hover:bg-neutral-50 text-sm text-neutral-700 transition-all duration-150"
        id="language-switcher"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Globe className="w-4 h-4 text-neutral-400" />
        <span className="font-medium">{currentLang?.nativeLabel}</span>
        <svg
          className={cn("w-3 h-3 text-neutral-400 transition-transform", open && "rotate-180")}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-neutral-100 rounded-lg shadow-lg overflow-hidden min-w-[160px]">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                role="option"
                aria-selected={language === lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between px-3 py-2.5 text-sm hover:bg-neutral-50 transition-colors",
                  language === lang.code
                    ? "text-neutral-900 font-medium bg-neutral-50"
                    : "text-neutral-600"
                )}
              >
                <span>{lang.nativeLabel}</span>
                <span className="text-xs text-neutral-400">{lang.label}</span>
                {language === lang.code && (
                  <span className="ml-1 text-green-500">✓</span>
                )}
              </button>
            ))}
            <div className="border-t border-neutral-100 px-3 py-2 bg-neutral-50">
              <p className="text-[10px] text-neutral-400">
                Other languages: translation in progress
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
