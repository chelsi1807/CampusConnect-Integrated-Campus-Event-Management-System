import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import Home from './pages/Home';
import EventsDiscovery from './pages/EventsDiscovery';
import EventDetails from './pages/EventDetails';
import VerifyCertificate from './pages/VerifyCertificate';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyRegistrations from './pages/student/MyRegistrations';
import MyCertificates from './pages/student/MyCertificates';

// Organizer Pages
import OrganizerDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import ManageEvents from './pages/organizer/ManageEvents';
import EventAttendees from './pages/organizer/EventAttendees';
import QRAttendanceScanner from './pages/organizer/QRAttendanceScanner';
import EventReports from './pages/organizer/EventReports';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import EventApprovals from './pages/admin/EventApprovals';
import ManageUsers from './pages/admin/ManageUsers';
import ManageCategories from './pages/admin/ManageCategories';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors duration-150">
              <Navbar />
            
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<EventsDiscovery />} />
                <Route path="/events/:id" element={<EventDetails />} />
                <Route path="/verify-certificate" element={<VerifyCertificate />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Authenticated Common Profile */}
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } 
                />

                {/* Student Routes */}
                <Route 
                  path="/student" 
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                      <StudentDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/registrations" 
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                      <MyRegistrations />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/student/certificates" 
                  element={
                    <ProtectedRoute allowedRoles={['student', 'admin']}>
                      <MyCertificates />
                    </ProtectedRoute>
                  } 
                />

                {/* Organizer Routes */}
                <Route 
                  path="/organizer" 
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <OrganizerDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/organizer/create-event" 
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <CreateEvent />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/organizer/events" 
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <ManageEvents />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/organizer/attendees/:eventId" 
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <EventAttendees />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/organizer/scanner" 
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <QRAttendanceScanner />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/organizer/reports" 
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <EventReports />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/organizer/reports/:eventId" 
                  element={
                    <ProtectedRoute allowedRoles={['organizer', 'admin']}>
                      <EventReports />
                    </ProtectedRoute>
                  } 
                />

                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/approvals" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <EventApprovals />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageUsers />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/categories" 
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <ManageCategories />
                    </ProtectedRoute>
                  } 
                />

                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>

            <Footer />
            </div>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
