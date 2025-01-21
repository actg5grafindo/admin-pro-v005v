import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import SubmissionForm from "./pages/SubmissionForm";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

// Simple auth check - in a real app this would be more sophisticated
const ProtectedRoute = ({ children, allowedRole }: { children: React.ReactNode; allowedRole: string }) => {
  const userRole = localStorage.getItem("userRole");
  if (!userRole || userRole !== allowedRole) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login role="submitter" />} />
          <Route path="/admin-login" element={<Login role="admin" />} />
          <Route
            path="/submit"
            element={
              <ProtectedRoute allowedRole="submitter">
                <SubmissionForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;