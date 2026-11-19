import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import { Layout } from './components/layout/Layout';
import { TeacherDashboardView } from './components/views/TeacherDashboardView';
import { SuperAdminDashboardView } from './components/views/SuperAdminDashboardView';
import { StudentDashboardView } from './components/views/StudentDashboardView';
import { StudentsView } from './components/views/StudentsView';
import { FacultyView } from './components/views/FacultyView';
import { AcademicsView } from './components/views/AcademicsView';
import { AttendanceView } from './components/views/AttendanceView';
import { ExaminationsView } from './components/views/ExaminationsView';
import { FeesView } from './components/views/FeesView';
import { NoticesView } from './components/views/NoticesView';
import { StudyMaterialsView } from './components/views/StudyMaterialsView';
import { VerifyMarksheetView } from './components/views/VerifyMarksheetView';
import { AuditLogsView } from './components/views/AuditLogsView';
import { ExcelImportView } from './components/views/ExcelImportView';

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentRole, setCurrentRole] = useState<'SUPER_ADMIN' | 'TEACHER' | 'STUDENT'>('TEACHER');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        if (currentRole === 'TEACHER') {
          return <TeacherDashboardView onNavigate={setCurrentView} />;
        } else if (currentRole === 'SUPER_ADMIN') {
          return <SuperAdminDashboardView onNavigate={setCurrentView} />;
        } else {
          return <StudentDashboardView onNavigate={setCurrentView} />;
        }
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
      case 'fees':
        return <FeesView />;
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
        return <TeacherDashboardView onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout
      currentView={currentView}
      onSelectView={setCurrentView}
      currentRole={currentRole}
      onChangeRole={setCurrentRole}
    >
      {renderView()}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <SoundProvider>
        <AppContent />
      </SoundProvider>
    </AuthProvider>
  );
};

export default App;
