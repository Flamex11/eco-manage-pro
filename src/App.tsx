import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import AuthPage from "./pages/auth/AuthPage";
import { AdminDashboard } from "./pages/dashboard/AdminDashboard";
import { CollectorDashboard } from "./pages/dashboard/CollectorDashboard";
import { ResidentDashboard } from "./pages/dashboard/ResidentDashboard";
import { CollectionsPage } from "./pages/collections/CollectionsPage";
import { ComplaintsPage } from "./pages/complaints/ComplaintsPage";
import { AnalyticsPage } from "./pages/analytics/AnalyticsPage";
import { SettingsPage } from "./pages/settings/SettingsPage";
import { ChatBot } from "./components/chat/ChatBot";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function DashboardRouter() {
  const { userProfile } = useAuth();
  
  if (!userProfile) return <Navigate to="/auth" replace />;
  
  switch (userProfile.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'collector':
      return <CollectorDashboard />;
    case 'resident':
      return <ResidentDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <DashboardRouter />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/collections" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <CollectionsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/complaints" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <ComplaintsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/analytics" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <AnalyticsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <DashboardLayout>
                      <SettingsPage />
                    </DashboardLayout>
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Global Components */}
            <ChatBot />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
