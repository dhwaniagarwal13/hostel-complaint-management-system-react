import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import StudentLogin from './pages/Auth/StudentLogin';
import StaffLogin from './pages/Auth/StaffLogin';
import WardenLogin from './pages/Auth/WardenLogin';
import SupervisorLogin from './pages/Auth/SupervisorLogin';

// Student
import StudentDashboard from './pages/Student/Dashboard';
import NewComplaint from './pages/Student/NewComplaint';

// Warden
import WardenDashboard from './pages/Warden/Dashboard';
import WardenComplaints from './pages/Warden/ComplaintsList';
import WardenCompletedTasks from './pages/Warden/CompletedTasks';
import WardenStaffList from './pages/Warden/StaffList';
import WardenStudentList from './pages/Warden/StudentList';

// Staff
import StaffDashboard from './pages/Staff/Dashboard';
import StaffComplaintDetail from './pages/Staff/ComplaintDetail';
import ResolutionLog from './pages/Staff/ResolutionLog';

// Supervisor
import SupervisorDashboard from './pages/Supervisor/Dashboard';

// Profile Page
import ProfilePage from './components/ProfilePage';

import ThemeToggle from './components/ui/ThemeToggle';


function App() {
  return (
    <div className="min-h-screen bg-surface text-on-surface transition-colors duration-300">
      <ThemeToggle />
      <Routes>
        <Route path="/" element={<Landing />} />
        
        {/* Auth Routes */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/staff/login" element={<StaffLogin />} />
        <Route path="/warden/login" element={<WardenLogin />} />
        <Route path="/supervisor/login" element={<SupervisorLogin />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/new-complaint" element={<NewComplaint />} />

        {/* Warden Routes */}
        <Route path="/warden/dashboard" element={<WardenDashboard />} />
        <Route path="/warden/complaints" element={<WardenComplaints />} />
        <Route path="/warden/completed" element={<WardenCompletedTasks />} />
        <Route path="/warden/staff" element={<WardenStaffList />} />
        <Route path="/warden/students" element={<WardenStudentList />} />

        {/* Staff Routes */}
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/history" element={<ResolutionLog />} />
        <Route path="/staff/complaint/:id" element={<StaffComplaintDetail />} />

        {/* Supervisor Routes */}
        <Route path="/supervisor/dashboard" element={<SupervisorDashboard />} />

        {/* Profile Routes - Common for all roles */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/student/profile" element={<ProfilePage />} />
        <Route path="/warden/profile" element={<ProfilePage />} />
        <Route path="/staff/profile" element={<ProfilePage />} />
        <Route path="/supervisor/profile" element={<ProfilePage />} />
      </Routes>
    </div>
  );
}

export default App;
