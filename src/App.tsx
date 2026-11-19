import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SoundProvider } from './context/SoundContext';
import { Layout } from './components/layout/Layout';
import { DashboardView } from './components/views/DashboardView';
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

const AppContent: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView onNavigate={setCurrentView} />;
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
      default:
        return <DashboardView onNavigate={setCurrentView} />;
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
    <AuthProvider>
      <SoundProvider>
        <AppContent />
      </SoundProvider>
    </AuthProvider>
  );
};

export default App;
