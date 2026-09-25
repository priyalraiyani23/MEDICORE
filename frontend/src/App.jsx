import React, { Suspense, lazy, useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// ─── Eagerly loaded (always needed) ───────────────────────────────────────────
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AIChatWidget from './components/AIChatWidget'

// ─── Route-level code splitting (lazy loaded on demand) ──────────────────────
const Home            = lazy(() => import('./pages/Home'))
const Login           = lazy(() => import('./pages/Login'))
const Signup          = lazy(() => import('./pages/Signup'))
const Doctors         = lazy(() => import('./pages/Doctors'))
const Services        = lazy(() => import('./pages/Services'))
const Contact         = lazy(() => import('./pages/Contact'))
const DoctorProfile   = lazy(() => import('./pages/DoctorProfile'))
const MyProfile       = lazy(() => import('./pages/MyProfile'))
const MyAppointments  = lazy(() => import('./pages/MyAppointments'))
const AIHealthcare    = lazy(() => import('./pages/AIHealthcare'))
const AIChat          = lazy(() => import('./pages/AIChat'))
const PaymentSuccess  = lazy(() => import('./pages/PaymentSuccess'))
const PaymentFailure  = lazy(() => import('./pages/PaymentFailure'))
const PortalLogin     = lazy(() => import('./pages/portal/Login'))
const AdminDashboard  = lazy(() => import('./pages/portal/admin/AdminDashboard'))
const DoctorDashboard = lazy(() => import('./pages/portal/doctor/DoctorDashboard'))
const LaboratoryDashboard   = lazy(() => import('./pages/portal/laboratory/LaboratoryDashboard'))

// ─── Page loading fallback ────────────────────────────────────────────────────
const PageLoader = () => (
  <div
    role="status"
    aria-label="Loading page"
    className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-40"
  >
    <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
  </div>
)

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => {
  const location = useLocation()
  const isChatPage = location.pathname === '/ai-chat'

  return (
    <div className="flex flex-col min-h-screen overflow-x-hidden">
      <ScrollToTop />
      <Navbar />
      <main className="grow pt-20" id="main-content">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"                    element={<Home />} />
            <Route path="/login"               element={<Login />} />
            <Route path="/signup"              element={<Signup />} />
            <Route path="/services"            element={<Services />} />
            <Route path="/contact"             element={<Contact />} />
            <Route path="/doctors"             element={<Doctors />} />
            <Route path="/doctors/:id"         element={<DoctorProfile />} />
            <Route path="/ai-healthcare"       element={<AIHealthcare />} />
            <Route path="/ai-chat"             element={<AIChat />} />
            <Route path="/payment-success"     element={<PaymentSuccess />} />
            <Route path="/payment-failure"     element={<PaymentFailure />} />
            <Route path="/my-profile"          element={<MyProfile />} />
            <Route path="/my-appointments"     element={<MyAppointments />} />
            <Route path="/doctor-admin/login"  element={<PortalLogin />} />
            <Route path="/admin/dashboard"     element={<AdminDashboard />} />
            <Route path="/doctor/dashboard"    element={<DoctorDashboard />} />
            <Route path="/laboratory/dashboard" element={<LaboratoryDashboard />} />
          </Routes>
        </Suspense>
      </main>
      {!isChatPage && <Footer />}
      {!isChatPage && <AIChatWidget />}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  )
}

export default App;
