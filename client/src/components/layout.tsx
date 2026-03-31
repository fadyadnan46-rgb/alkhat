import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, UploadCloud, Menu, X, LogOut, User as UserIcon, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { LanguageSelector } from "@/components/language-selector";
import { useLanguage, t } from "@/lib/language-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import logo from "@assets/logo_imresizer_(1)_1764805116719.jpg";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const { currentUser, logout, checkAuth } = useStore();
  const { language } = useLanguage();

  const publicRoutes = ["/login", "/contact"];

  // Check authentication on mount
  useEffect(() => {
    const verifyAuth = async () => {
      if (!publicRoutes.includes(location)) {
        setIsCheckingAuth(true);
        const isAuthenticated = await checkAuth();
        if (!isAuthenticated) {
          setLocation("/login");
        }
        setIsCheckingAuth(false);
      } else {
        setIsCheckingAuth(false);
      }
    };
    verifyAuth();
  }, [location]);

  useEffect(() => {
    if (!isCheckingAuth) {
      if (!currentUser && !publicRoutes.includes(location)) {
        setLocation("/login");
      }
      if (currentUser && location === "/login") {
        setLocation("/");
      }
    }
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [currentUser, location, setLocation, language, isCheckingAuth]);

  if (location === "/login" || location === "/contact") {
    return <>{children}</>;
  }

  // Show loading state while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const NavContent = () => {
    const navItems = currentUser?.role === 'admin' 
      ? [
          { href: "/", label: t('my_vehicles', language), icon: LayoutDashboard },
          { href: "/admin/settings", label: t('system_settings', language), icon: UploadCloud },
          { href: "/users", label: t('users', language), icon: LayoutDashboard },
        ]
      : [
          { href: "/", label: t('my_vehicles', language), icon: LayoutDashboard },
        ];

    return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex flex-col items-center gap-3">
          <div className="w-32 rounded-lg bg-white overflow-hidden flex items-center justify-center p-2">
             <img src={logo} alt="Al Khatu Al Naaqil" className="w-full h-auto object-contain" />
          </div>
          <span className="text-xs font-bold tracking-widest text-center text-white">ALKHAT ALNAAQIL</span>
        </div>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 group cursor-pointer",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
              onClick={() => setIsOpen(false)}
            >
              <item.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-primary"
                )}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-6 border-t border-sidebar-border space-y-4">
        <div className="p-4 rounded-lg bg-sidebar-accent/50 flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={currentUser?.profilePicture || undefined} alt={currentUser?.name || 'User'} />
            <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary">
              <UserIcon className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div className="overflow-hidden">
            <p className="text-xs text-sidebar-foreground/60 font-medium uppercase tracking-wider">
              {currentUser?.role}
            </p>
            <p className="text-sm font-semibold text-sidebar-foreground truncate">
              {currentUser?.name}
            </p>
          </div>
        </div>
        <Link 
          href="/contact"
          className="flex items-center gap-2 px-4 py-2 rounded-md text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
          onClick={() => setIsOpen(false)}
          data-testid="link-contact-sidebar"
        >
          <Phone className="w-4 h-4" />
          {t('contact_us', language)}
        </Link>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-sidebar-foreground/70 hover:text-destructive hover:bg-destructive/10 hover:border-destructive/20"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          {t('logout', language)}
        </Button>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 ltr:md:left-0 rtl:md:right-0 w-64 bg-sidebar ltr:border-r rtl:border-l border-sidebar-border shrink-0 h-screen overflow-y-auto z-40">
        <NavContent />
      </aside>
      <div className="hidden md:block w-64 shrink-0" />
      <div className="md:hidden fixed top-4 ltr:left-4 rtl:right-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background border-border shadow-sm">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 bg-sidebar border-sidebar-border w-72">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-8 lg:p-10 pb-6">
          <div className="flex justify-end mb-6">
            <LanguageSelector />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
