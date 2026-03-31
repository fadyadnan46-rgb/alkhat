import { Button } from "@/components/ui/button";
import { X, Phone, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { useStore } from "@/lib/store";
import { useLanguage, t } from "@/lib/language-context";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const generalManagerContacts = [
  { phone: "00962796265148", whatsapp: "962796265148" },
  { phone: "009647740077786", whatsapp: "9647740077786" },
];

const accountantContact = { phone: "00962785108049", whatsapp: "962785108049" };

const email = "transportroad.2025@gmail.com";

export default function ContactPage() {
  const [, setLocation] = useLocation();
  const { currentUser } = useStore();
  const { language } = useLanguage();

  const handleBack = () => {
    if (currentUser) {
      setLocation('/');
    } else {
      setLocation('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm relative">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="absolute -top-12 ltr:right-0 rtl:left-0 text-white hover:text-slate-300"
          data-testid="button-close"
        >
          <X className="w-6 h-6" />
        </Button>
        
        <h1 className="text-xl font-semibold text-center mb-6 text-white" data-testid="text-contact-title">
          {t('contact_us', language)}
        </h1>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-300">{language === 'ar' ? 'المدير العام' : 'General Manager'}</h2>
            {generalManagerContacts.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-slate-600 rounded-lg bg-slate-800/50" data-testid={`contact-gm-${index}`}>
                <span className="font-medium text-white" dir="ltr">{contact.phone}</span>
                <div className="flex gap-2">
                  <a 
                    href={`tel:${contact.phone}`}
                    className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                    data-testid={`button-call-gm-${index}`}
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a 
                    href={`https://wa.me/${contact.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                    data-testid={`button-whatsapp-gm-${index}`}
                  >
                    <WhatsAppIcon />
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-300">{language === 'ar' ? 'المحاسب' : 'Accountant'}</h2>
            <div className="flex items-center justify-between p-3 border border-slate-600 rounded-lg bg-slate-800/50" data-testid="contact-accountant">
              <span className="font-medium text-white" dir="ltr">{accountantContact.phone}</span>
              <div className="flex gap-2">
                <a 
                  href={`tel:${accountantContact.phone}`}
                  className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                  data-testid="button-call-accountant"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <a 
                  href={`https://wa.me/${accountantContact.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-green-500 hover:bg-green-600 text-white transition-colors"
                  data-testid="button-whatsapp-accountant"
                >
                  <WhatsAppIcon />
                </a>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-300">{language === 'ar' ? 'الاستفسارات العامة' : 'General Inquiries'}</h2>
            <div className="flex items-center justify-between p-3 border border-slate-600 rounded-lg bg-slate-800/50" data-testid="contact-email">
              <span className="font-medium text-sm text-white" dir="ltr">{email}</span>
              <a 
                href={`mailto:${email}`}
                className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
                data-testid="button-email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
