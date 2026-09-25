import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import RoleRoute from "./components/RoleRoute/RoleRoute";
import GuestRoute from "./components/GuestRoute/GuestRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import { useAuth } from "./context/useAuth";

// Public pages
import Home from "./pages/Home/Home";
import Properties from "./pages/Properties/Properties";
import PropertyDetails from "./pages/PropertyDetails/PropertyDetails";
import Agents from "./pages/Agents/Agents";
import AgentProfile from "./pages/AgentProfile/AgentProfile";
import About from "./pages/About/About";
import Privacy from "./pages/Privacy/Privacy";
import Terms from "./pages/Terms/Terms";
import Safety from "./pages/Safety/Safety";

// Authentication pages
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ConfirmEmail from "./pages/ConfirmEmail/ConfirmEmail";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";

// Account
import Account from "./pages/Account/Account";

// Renter pages
import Dashboard from "./pages/renter/Dashboard/Dashboard";
import SavedProperties from "./pages/renter/SavedProperties/SavedProperties";
import ViewingRequests from "./pages/renter/ViewingRequests/ViewingRequests";
import ViewingRequest from "./pages/renter/ViewingRequest/ViewingRequest";
import RenterReports from "./pages/renter/Reports/Reports";
import ReportProperty from "./pages/renter/ReportProperty/ReportProperty";

// Agent pages
import AgentDashboard from "./pages/agent/Dashboard/Dashboard";
import AgentProperties from "./pages/agent/Properties/Properties";
import AddProperty from "./pages/agent/AddProperty/AddProperty";
import EditProperty from "./pages/agent/EditProperty/EditProperty";
import AgentVerification from "./pages/agent/Verification/Verification";
import VerificationDetails from "./pages/agent/Verification/VerificationDetails";
import AgentReports from "./pages/agent/Reports/Reports";
import AgentViewingRequests from "./pages/agent/ViewingRequests/ViewingRequest";

// Admin pages
import AdminDashboard from "./pages/admin/Dashboard/Dashboard";
import AdminUsers from "./pages/admin/Users/Users";
import AdminProperties from "./pages/admin/Properties/Properties";
import AdminAgents from "./pages/admin/Agents/Agents";
import AdminVerification from "./pages/admin/Verification/Verification";
import VerificationReview from "./pages/admin/Verification/VerificationReview";
import Reports from "./pages/admin/Reports/Reports";
import AdminViewingRequests from "./pages/admin/ViewingRequests/ViewingRequests";

// 404
import NotFound from "./pages/NotFound/NotFound";

function HomeRoute() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center bg-[#FAF8F9] px-5">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#F8EDEF] border-t-[#7A1F3D]" />

          <p className="mt-4 text-sm font-medium text-[#756970]">
            Loading your dashboard...
          </p>
        </div>
      </main>
    );
  }

  if (!user) {
    return <Home />;
  }

  if (role === "renter") {
    return <Navigate to="/renter/dashboard" replace />;
  }

  if (role === "agent") {
    return <Navigate to="/agent/dashboard" replace />;
  }

  if (role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <Home />;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* =====================================================
            HOME / PUBLIC ROUTES
        ====================================================== */}

        <Route
          path="/"
          element={<HomeRoute />}
        />

        <Route
          path="/properties"
          element={<Properties />}
        />

        <Route
          path="/properties/:id"
          element={<PropertyDetails />}
        />

        <Route
          path="/agents"
          element={<Agents />}
        />

        <Route
          path="/agents/:agentId"
          element={<AgentProfile />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/safety"
          element={<Safety />}
        />

        <Route
          path="/privacy"
          element={<Privacy />}
        />

        <Route
          path="/terms"
          element={<Terms />}
        />

        {/* =====================================================
            GUEST / AUTHENTICATION ROUTES
        ====================================================== */}

        <Route element={<GuestRoute />}>
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />
        </Route>

        <Route
          path="/confirm-email"
          element={<ConfirmEmail />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* =====================================================
            AUTHENTICATED ROUTES
        ====================================================== */}

        <Route element={<ProtectedRoute />}>
          <Route
            path="/account"
            element={<Account />}
          />

          {/* ===================================================
              RENTER ROUTES
          ==================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={["renter"]} />
            }
          >
            <Route
              path="/renter/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/renter/saved-properties"
              element={<SavedProperties />}
            />

            <Route
              path="/renter/viewing-requests"
              element={<ViewingRequests />}
            />

            <Route
              path="/renter/reports"
              element={<RenterReports />}
            />

            <Route
              path="/properties/:id/viewing"
              element={<ViewingRequest />}
            />

            <Route
              path="/properties/:id/report"
              element={<ReportProperty />}
            />
          </Route>

          {/* ===================================================
              AGENT ROUTES
          ==================================================== */}

          <Route
            element={
              <RoleRoute allowedRoles={["agent"]} />
            }
          >
            <Route
              path="/agent/dashboard"
              element={<AgentDashboard />}
            />

            <Route
              path="/agent/properties"
              element={<AgentProperties />}
            />

            <Route
              path="/agent/add-property"
              element={<AddProperty />}
            />

            <Route
              path="/agent/properties/:id/edit"
              element={<EditProperty />}
            />

            <Route
              path="/agent/verification"
              element={<AgentVerification />}
            />

            <Route
              path="/agent/verification/:propertyId"
              element={<VerificationDetails />}
            />

            <Route
              path="/agent/verification/:propertyId/details"
              element={<VerificationDetails />}
            />

            <Route
              path="/agent/reports"
              element={<AgentReports />}
            />

            <Route
              path="/agent/viewing-requests"
              element={<AgentViewingRequests />}
            />
          </Route>
        </Route>

        {/* =====================================================
            ADMIN ROUTES
        ====================================================== */}

        <Route element={<AdminRoute />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="/admin/users"
            element={<AdminUsers />}
          />

          <Route
            path="/admin/properties"
            element={<AdminProperties />}
          />

          <Route
            path="/admin/agents"
            element={<AdminAgents />}
          />

          <Route
            path="/admin/verification"
            element={<AdminVerification />}
          />

          <Route
            path="/admin/verification/:verificationId"
            element={<VerificationReview />}
          />

          <Route
            path="/admin/reports"
            element={<Reports />}
          />

          <Route
            path="/admin/viewing-requests"
            element={<AdminViewingRequests />}
          />
        </Route>

        {/* =====================================================
            404 FALLBACK
        ====================================================== */}

        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;