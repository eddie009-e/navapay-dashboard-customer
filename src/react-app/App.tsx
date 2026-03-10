import { BrowserRouter as Router, Routes, Route } from "react-router";
import { ToastProvider } from "@/react-app/contexts/ToastContext";
import { AuthProvider } from "@/react-app/contexts/AuthContext";
import Dashboard from "@/react-app/pages/Dashboard";
import Login from "@/react-app/pages/Login";
import LoginPin from "@/react-app/pages/LoginPin";
import Register from "@/react-app/pages/Register";
import ForgotPassword from "@/react-app/pages/ForgotPassword";
import POS from "@/react-app/pages/POS";
import POSSuccess from "@/react-app/pages/POSSuccess";
import POSHistory from "@/react-app/pages/POSHistory";
import CustomerDisplay from "@/react-app/pages/CustomerDisplay";
import Invoices from "@/react-app/pages/Invoices";
import CreateInvoice from "@/react-app/pages/CreateInvoice";
import InvoiceDetails from "@/react-app/pages/InvoiceDetails";
import RecurringInvoices from "@/react-app/pages/RecurringInvoices";
import PaymentLinks from "@/react-app/pages/PaymentLinks";
import Wallet from "@/react-app/pages/Wallet";
import WalletHistory from "@/react-app/pages/WalletHistory";
import Notifications from "@/react-app/pages/Notifications";
import Transactions from "@/react-app/pages/Transactions";
import Reports from "@/react-app/pages/Reports";
import SalesReport from "@/react-app/pages/SalesReport";
import DailyReport from "@/react-app/pages/DailyReport";
import MonthlyReport from "@/react-app/pages/MonthlyReport";
import YearlyReport from "@/react-app/pages/YearlyReport";
import Customers from "@/react-app/pages/Customers";
import CustomerDetails from "@/react-app/pages/CustomerDetails";
import Employees from "@/react-app/pages/Employees";
import EmployeeDetails from "@/react-app/pages/EmployeeDetails";
import Payroll from "@/react-app/pages/Payroll";
import PayrollDetails from "@/react-app/pages/PayrollDetails";
import Branches from "@/react-app/pages/Branches";
import BranchDetails from "@/react-app/pages/BranchDetails";
import Settings from "@/react-app/pages/Settings";
import Developers from "@/react-app/pages/Developers";
import EmployeeReport from "@/react-app/pages/EmployeeReport";
import BranchReport from "@/react-app/pages/BranchReport";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login/pin" element={<LoginPin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/pos" element={<POS />} />
        <Route path="/pos/success" element={<POSSuccess />} />
        <Route path="/pos/history" element={<POSHistory />} />
        <Route path="/pos/customer-display" element={<CustomerDisplay />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/invoices/create" element={<CreateInvoice />} />
        <Route path="/invoices/:id" element={<InvoiceDetails />} />
        <Route path="/invoices/recurring" element={<RecurringInvoices />} />
        <Route path="/invoices/payment-links" element={<PaymentLinks />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/wallet/history" element={<WalletHistory />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/reports/sales" element={<SalesReport />} />
        <Route path="/reports/daily" element={<DailyReport />} />
        <Route path="/reports/monthly" element={<MonthlyReport />} />
        <Route path="/reports/yearly" element={<YearlyReport />} />
        <Route path="/reports/employees" element={<EmployeeReport />} />
        <Route path="/reports/branches" element={<BranchReport />} />
        <Route path="/customers" element={<Customers />} />
        <Route path="/customers/:id" element={<CustomerDetails />} />
        <Route path="/employees" element={<Employees />} />
        <Route path="/employees/:id" element={<EmployeeDetails />} />
        <Route path="/payroll" element={<Payroll />} />
        <Route path="/payroll/:id" element={<PayrollDetails />} />
        <Route path="/branches" element={<Branches />} />
        <Route path="/branches/:id" element={<BranchDetails />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/developers" element={<Developers />} />
          </Routes>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}
