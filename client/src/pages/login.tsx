import { useState } from "react";
import { useStore } from "@/lib/store";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, t } from "@/lib/language-context";
import { Eye, EyeOff, Phone } from "lucide-react";
import { LanguageSelector } from "@/components/language-selector";
import logo from "@assets/logo_imresizer_(1)_1764805116719.jpg";
import backgroundImage from "@assets/Log-in_Background_1764800039054.jpg";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, initializeApp } = useStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await login(username, password);
      if (success) {
        // Load all data after successful login
        await initializeApp();
        
        toast({
          title: t('welcome_back', language),
          description: t('successfully_logged_in', language),
        });
        setLocation("/");
      } else {
        toast({
          variant: "destructive",
          title: t('login_failed', language),
          description: t('invalid_credentials', language),
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: t('login_failed', language),
        description: t('invalid_credentials', language),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen h-screen w-full flex items-center justify-center relative overflow-hidden"
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 w-full h-full bg-black/40"></div>
      
      {/* Language Selector in top corner */}
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg">
          <LanguageSelector />
        </div>
      </div>
      
      <Card className="w-full max-w-lg mx-4 shadow-2xl border-white/30 backdrop-blur-lg bg-white/20 relative z-10">
        <CardHeader className="space-y-3 text-center flex flex-col items-center pb-2">
          <div className="w-32 h-32 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-lg p-2">
             <img src={logo} alt="Al Khatu Al Naaqil" className="w-full h-full object-contain" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">{t('portal_access', language)}</CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base">{t('username', language)}</Label>
              <Input 
                id="username" 
                placeholder={t('enter_username', language)}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-background/50 h-12 text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">{t('password', language)}</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder={t('enter_password', language)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 pr-12 h-12 text-base"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full text-base font-medium h-12 mt-2" disabled={isLoading}>
              {isLoading ? t('signing_in', language) : t('sign_in', language)}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setLocation('/contact')}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              data-testid="link-contact-login"
            >
              <Phone className="w-4 h-4" />
              {t('contact_us', language)}
            </button>
          </div>
          <div className="mt-4 flex justify-center gap-4">
            <a
              href="https://www.facebook.com/share/1C6TuyGUfS/?mibextid=wwXIfr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              data-testid="link-facebook"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>
            <a
              href="https://www.instagram.com/alkhatualnaaqil?igsh=MXZlOWlxNTd2c3NibA%3D%3D&utm_source=qr"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 hover:opacity-90 text-white transition-colors"
              data-testid="link-instagram"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a
              href="https://www.tiktok.com/@alkhayu.alnaaqil?_r=1&_t=ZT-92E0RQZRPJu"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full bg-black hover:bg-gray-800 text-white transition-colors"
              data-testid="link-tiktok"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
              </svg>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
