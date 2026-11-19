import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';
import { LoginView } from './components/auth/LoginView';
import { TeacherDashboardView } from './components/views/TeacherDashboardView';
import { SuperAdminDashboardView } from './components/views/SuperAdminDashboardView';
import { StudentDashboardView } from './components/views/StudentDashboardView';
import { MyClassesView } from './components/views/MyClassesView';
import { TimetableScheduleView } from './components/views/TimetableScheduleView';
import { LessonPlansView } from './components/views/LessonPlansView';
import { AssignmentsView } from './components/views/AssignmentsView';
import { AIQuizBuilderView } from './components/views/AIQuizBuilderView';
import { StudentsView } from './components/views/StudentsView';
import { FacultyView } from './components/views/FacultyView';
import { AcademicsView } from './components/views/AcademicsView';
import { AttendanceView } from './components/views/AttendanceView';
import { ExaminationsView } from './components/views/ExaminationsView';
import { NoticesView } from './components/views/NoticesView';
import { StudyMaterialsView } from './components/views/StudyMaterialsView';
import { VerifyMarksheetView } from './components/views/VerifyMarksheetView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { ExcelImportView } from './components/views/ExcelImportView';
import { LeaveManagementView } from './components/views/LeaveManagementView';
import { StudentFeedbackView } from './components/views/StudentFeedbackView';
import { CommunicationAnnouncementsView } from './components/views/CommunicationAnnouncementsView';
import { AcademicAnalyticsView } from './components/views/AcademicAnalyticsView';

const AppContent: React.FC = () => {
  const { user, loading, activeRole } = useAuth();
  const [currentView, setCurrentView] = useState<string>('dashboard');

  // Switch back to 'dashboard' when active role or account changes
  useEffect(() => {
    setCurrentView('dashboard');
  }, [activeRole, user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Initializing Annapurna College ERP...
          </div>
        </div>
      </div>
    );
  }

  // If user is not authenticated, render dedicated Multi-Role Login Portal!
  if (!user) {
    return <LoginView />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        if (activeRole === 'TEACHER') {
          return <TeacherDashboardView onNavigate={setCurrentView} />;
        } else if (activeRole === 'SUPER_ADMIN') {
          return <SuperAdminDashboardView onNavigate={setCurrentView} />;
        } else {
          return <StudentDashboardView onNavigate={setCurrentView} />;
        }
      case 'my-classes':
        return <MyClassesView />;
      case 'timetable':
        return <TimetableScheduleView />;
      case 'lesson-plans':
        return <LessonPlansView />;
      case 'assignments':
        return <AssignmentsView />;
      case 'quiz-builder':
        return <AIQuizBuilderView />;
      case 'students':
        return <StudentsView />;
      case 'faculty':
        return <FacultyView />;
      case 'academics':
        return <AcademicsView />;
      case 'attendance':
        return <AttendanceView />;
      case 'examinations':
        return <ExaminationsView />;
      case 'leave-management':
        return <LeaveManagementView />;
      case 'feedback':
        return <StudentFeedbackView />;
      case 'communication':
        return <CommunicationAnnouncementsView />;
      case 'analytics':
        return <AcademicAnalyticsView />;
      case 'notices':
        return <NoticesView />;
      case 'materials':
        return <StudyMaterialsView />;
      case 'verify':
        return <VerifyMarksheetView />;
      case 'audit':
        return <AuditLogsView />;
      case 'excel-import':
        return <ExcelImportView onNavigate={setCurrentView} />;
      default:
        return activeRole === 'TEACHER' ? (
          <TeacherDashboardView onNavigate={setCurrentView} />
        ) : activeRole === 'SUPER_ADMIN' ? (
          <SuperAdminDashboardView onNavigate={setCurrentView} />
        ) : (
          <StudentDashboardView onNavigate={setCurrentView} />
        );
    }
  };

  return (
    <Layout currentView={currentView} onSelectView={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SoundProvider>
          <AppContent />
        </SoundProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
