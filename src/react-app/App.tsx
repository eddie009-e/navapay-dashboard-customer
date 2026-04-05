import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router";
import MainLayout from "@/react-app/components/MainLayout";
import { ToastProvider } from "@/react-app/contexts/ToastContext";
import { AuthProvider } from "@/react-app/contexts/AuthContext";
import PageLoader from "@/react-app/components/PageLoader";

// Eager — auth pages & layout always needed immediately
import Login           from "@/react-app/pages/Login";
import LoginPin        from "@/react-app/pages/LoginPin";
import Register        from "@/react-app/pages/Register";
import ForgotPassword  from "@/react-app/pages/ForgotPassword";
import Dashboard       from "@/react-app/pages/Dashboard";

// Lazy — loaded only when the user navigates to the page
const POS                  = lazy(() => import("@/react-app/pages/POS"));
const POSSuccess           = lazy(() => import("@/react-app/pages/POSSuccess"));
const POSHistory           = lazy(() => import("@/react-app/pages/POSHistory"));
const CustomerDisplay      = lazy(() => import("@/react-app/pages/CustomerDisplay"));
const Invoices             = lazy(() => import("@/react-app/pages/Invoices"));
const CreateInvoice        = lazy(() => import("@/react-app/pages/CreateInvoice"));
const InvoiceDetails       = lazy(() => import("@/react-app/pages/InvoiceDetails"));
const RecurringInvoices    = lazy(() => import("@/react-app/pages/RecurringInvoices"));
const PaymentLinks         = lazy(() => import("@/react-app/pages/PaymentLinks"));
const Wallet               = lazy(() => import("@/react-app/pages/Wallet"));
const WalletHistory        = lazy(() => import("@/react-app/pages/WalletHistory"));
const Notifications        = lazy(() => import("@/react-app/pages/Notifications"));
const Transactions         = lazy(() => import("@/react-app/pages/Transactions"));
const Reports              = lazy(() => import("@/react-app/pages/Reports"));
const SalesReport          = lazy(() => import("@/react-app/pages/SalesReport"));
const DailyReport          = lazy(() => import("@/react-app/pages/DailyReport"));
const MonthlyReport        = lazy(() => import("@/react-app/pages/MonthlyReport"));
const YearlyReport         = lazy(() => import("@/react-app/pages/YearlyReport"));
const Customers            = lazy(() => import("@/react-app/pages/Customers"));
const CustomerDetails      = lazy(() => import("@/react-app/pages/CustomerDetails"));
const Employees            = lazy(() => import("@/react-app/pages/Employees"));
const EmployeeDetails      = lazy(() => import("@/react-app/pages/EmployeeDetails"));
const Payroll              = lazy(() => import("@/react-app/pages/Payroll"));
const PayrollDetails       = lazy(() => import("@/react-app/pages/PayrollDetails"));
const Branches             = lazy(() => import("@/react-app/pages/Branches"));
const BranchDetails        = lazy(() => import("@/react-app/pages/BranchDetails"));
const Settings             = lazy(() => import("@/react-app/pages/Settings"));
const Developers           = lazy(() => import("@/react-app/pages/Developers"));
const EmployeeReport       = lazy(() => import("@/react-app/pages/EmployeeReport"));
const BranchReport         = lazy(() => import("@/react-app/pages/BranchReport"));
const Reminders            = lazy(() => import("@/react-app/pages/Reminders"));
const TransactionCategories = lazy(() => import("@/react-app/pages/TransactionCategories"));
const ActivityLog          = lazy(() => import("@/react-app/pages/ActivityLog"));

function DashboardLayout() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Auth pages - no sidebar */}
              <Route path="/login"           element={<Login />} />
              <Route path="/login/pin"       element={<LoginPin />} />
              <Route path="/register"        element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Customer-facing display - no sidebar */}
              <Route path="/pos/customer-display" element={<CustomerDisplay />} />

              {/* Dashboard pages - always show sidebar */}
              <Route element={<DashboardLayout />}>
                <Route path="/"                      element={<Dashboard />} />
                <Route path="/pos"                   element={<POS />} />
                <Route path="/pos/success"           element={<POSSuccess />} />
                <Route path="/pos/history"           element={<POSHistory />} />
                <Route path="/invoices"              element={<Invoices />} />
                <Route path="/invoices/create"       element={<CreateInvoice />} />
                <Route path="/invoices/:id"          element={<InvoiceDetails />} />
                <Route path="/invoices/recurring"    element={<RecurringInvoices />} />
                <Route path="/invoices/payment-links" element={<PaymentLinks />} />
                <Route path="/wallet"                element={<Wallet />} />
                <Route path="/wallet/history"        element={<WalletHistory />} />
                <Route path="/notifications"         element={<Notifications />} />
                <Route path="/transactions"          element={<Transactions />} />
                <Route path="/reports"               element={<Reports />} />
                <Route path="/reports/sales"         element={<SalesReport />} />
                <Route path="/reports/daily"         element={<DailyReport />} />
                <Route path="/reports/monthly"       element={<MonthlyReport />} />
                <Route path="/reports/yearly"        element={<YearlyReport />} />
                <Route path="/reports/employees"     element={<EmployeeReport />} />
                <Route path="/reports/branches"      element={<BranchReport />} />
                <Route path="/customers"             element={<Customers />} />
                <Route path="/customers/:id"         element={<CustomerDetails />} />
                <Route path="/employees"             element={<Employees />} />
                <Route path="/employees/:id"         element={<EmployeeDetails />} />
                <Route path="/payroll"               element={<Payroll />} />
                <Route path="/payroll/:id"           element={<PayrollDetails />} />
                <Route path="/branches"              element={<Branches />} />
                <Route path="/branches/:id"          element={<BranchDetails />} />
                <Route path="/settings"              element={<Settings />} />
                <Route path="/developers"            element={<Developers />} />
                <Route path="/reminders"             element={<Reminders />} />
                <Route path="/categories"            element={<TransactionCategories />} />
                <Route path="/activity"              element={<ActivityLog />} />
              </Route>
            </Routes>
          </Suspense>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
