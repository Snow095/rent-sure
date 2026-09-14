
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";

// Public pages
import Home from "./pages/Home/Home";
import Properties from "./pages/Properties/Properties";
import PropertyDetails from "./pages/PropertyDetails/PropertyDetails";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ConfirmEmail from "./pages/ConfirmEmail/ConfirmEmail";

// Renter pages
import Dashboard from "./pages/renter/Dashboard/Dashboard";
import SavedProperties from "./pages/renter/SavedProperties/SavedProperties";
import ViewingRequests from "./pages/renter/ViewingRequests/ViewingRequests";
import RenterReports from "./pages/renter/Reports/Reports";
import ReportProperty from "./pages/renter/ReportProperty/ReportProperty";

// Agent pages
import AgentDashboard from "./pages/agent/Dashboard/Dashboard";
import AgentProperties from "./pages/agent/Properties/Properties";
import AddProperty from "./pages/agent/AddProperty/AddProperty";
import AgentVerification from "./pages/agent/Verification/Verification";
import AgentReports from "./pages/agent/Reports/Reports";


// Admin pages
import AdminDashboard from "./pages/admin/Dashboard/Dashboard";
import AdminUsers from "./pages/admin/Users/Users";
import AdminProperties from "./pages/admin/Properties/Properties";
import AdminAgents from "./pages/admin/Agents/Agents";
import AdminVerification from "./pages/admin/Verification/Verification";
import VerificationDetails from "./pages/agent/Verification/VerificationDetails";
import VerificationReview from "./pages/admin/Verification/VerificationReview";
import AgentViewingRequests from "./pages/agent/ViewingRequests/ViewingRequest";


function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>

        <Route
          path="/"
          element={<Home />}
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
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/confirm-email"
          element={<ConfirmEmail />}
        />

        <Route element={<ProtectedRoute />}>

          {/* Renter */}
          <Route
            path="/renter/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/renter/saved-properties"
            element={<SavedProperties />}
          />
          {/* <Route
            path="/properties/:id/viewing"
            element={<Viewing}
          /> */}

          <Route
            path="/renter/viewing-requests"
            element={<ViewingRequests />}
          />


          <Route
            path="/renter/reports"
            element={<RenterReports />}
          />
          <Route
            path="/properties/:id/report"
            element={<ReportProperty />}
          />



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
            path="/agent/verification/:propertyId/details"
            element={< VerificationDetails />}
          />
          <Route
            path="/agent/verification/:propertyId"
            element={<AgentVerification />}
          />

          <Route
            path="/agent/reports"
            element={<AgentReports />}
          />
          <Route
            path="/agent/viewing-requests"
            element={<AgentViewingRequests/>}
          />

        </Route>



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

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;

