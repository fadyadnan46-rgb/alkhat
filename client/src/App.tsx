import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/layout";
import UserDashboard from "@/pages/user-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import LoginPage from "@/pages/login";
import AdminSettings from "@/pages/admin-settings";
import UsersPage from "@/pages/users";
import CarDetailPage from "@/pages/car-detail";
import ContactPage from "@/pages/contact";
import { useStore } from "@/lib/store";

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="/" component={() => {
           // Logic: Layout component handles redirect if not logged in
           // Inside here, we assume user is logged in.
           // We need to check role to decide which dashboard to show as "Home"
           // For simplicity in this router, we can render UserDashboard by default
           // and AdminDashboard on /admin. 
           // Or we can make "/" smart component.
           // Given the requirements: "Admin screen" and "User Dashboard"
           // Let's keep / for user dashboard and /admin for admin dashboard.
           // Admin can also view "/" if they want to see "My Garage" (if admins have cars?)
           // Or we can redirect admin to /admin.
           // Let's stick to explicit routes.
           return <UserDashboard />;
        }} />
        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/settings" component={AdminSettings} />
        <Route path="/users" component={UsersPage} />
        <Route path="/car" component={CarDetailPage} />
        <Route path="/contact" component={ContactPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
