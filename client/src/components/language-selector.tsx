import { useLanguage, Language } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { useState } from "react";

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', flag: 'EN' },
    { code: 'ar', label: 'العربية', flag: 'ع' }
  ] as const;

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1"
      >
        <Globe className="w-4 h-4" />
        {language.toUpperCase()}
      </Button>
      
      {open && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-background border rounded-lg shadow-lg z-50">
          <div className="py-1">
            {languages.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => {
                  setLanguage(code as Language);
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-muted transition-colors"
              >
                <span>{label}</span>
                {language === code && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
