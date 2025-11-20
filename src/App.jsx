import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import ReportsList from "./pages/Reports/ReportsList";
import ReportDetail from "./pages/Reports/ReportDetail";
import CreateReport from "./pages/Reports/CreateReport";
import UsersList from "./pages/Users/UsersList";
import ClientsList from "./pages/Clients/ClientsList";
import ServicesList from "./pages/Services/ServicesList";
import PriceListsList from "./pages/PriceLists/PriceListsList";
import Profile from "./pages/Profile/Profile";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Layout from "./components/Layout/Layout";

export default function App() {
  return (
    <Routes>
      <Route path="/auth/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/my-reports"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports/create"
        element={
          <ProtectedRoute>
            <Layout>
              <CreateReport />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/reports/:id"
        element={
          <ProtectedRoute>
            <Layout>
              <ReportDetail />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <Layout>
              <UsersList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <Layout>
              <ClientsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/services"
        element={
          <ProtectedRoute>
            <Layout>
              <ServicesList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/price-lists"
        element={
          <ProtectedRoute>
            <Layout>
              <PriceListsList />
            </Layout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
