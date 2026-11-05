import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth, OPERATIONAL_ROLES_INFO } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { NotificationProvider } from './context/NotificationContext';

// Authentication
import { SignInPage } from './components/auth/SignInPage';
import { OperationalRoleModal } from './components/auth/OperationalRoleModal';

// Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { MyProfileModal } from './components/members/MyProfileModal';

// Dedicated Officer & General Dashboards
import { MainDashboard } from './components/dashboard/MainDashboard';
import { FinanceDashboard } from './components/dashboard/FinanceDashboard';
import { BookstandDashboard } from './components/dashboard/BookstandDashboard';
import { SecretaryDashboard } from './components/dashboard/SecretaryDashboard';
import { UniformLeaderDashboard } from './components/dresscode/UniformLeaderDashboard';
import { WelfareDashboard } from './components/welfare/WelfareDashboard';
import { CentralComplaintsModule } from './components/reports/CentralComplaintsModule';
import { DepartmentMonthlyReportsHub } from './components/reports/DepartmentMonthlyReportsHub';
import { HRDOfficeDashboard } from './components/hrd/HRDOfficeDashboard';
import { ReportToHRDModal } from './components/hrd/ReportToHRDModal';

// Operational Modules
import { CellFellowshipSatelliteDirectory } from './components/cells/CellFellowshipSatelliteDirectory';
import { MemberDirectoryModule } from './components/members/MemberDirectoryModule';
import { BirthdayCalendarModule } from './components/birthdays/BirthdayCalendarModule';
import { LostFoundModule } from './components/lost-found/LostFoundModule';
import { NewsEventsModule } from './components/news/NewsEventsModule';
import { ChurchInformationHandbookModule } from './components/handbook/ChurchInformationHandbookModule';
import { AttendanceModule } from './components/attendance/AttendanceModule';
import { DressCodeModule } from './components/dresscode/DressCodeModule';
import { RosterModule } from './components/roster/RosterModule';
import { MeetingsModule } from './components/meetings/MeetingsModule';
import { ServiceReportsModule } from './components/reports/ServiceReportsModule';
import { InformationCollectionModule } from './components/collections/InformationCollectionModule';
import { FinanceModule } from './components/finance/FinanceModule';
import { BookstandModule } from './components/bookstand/BookstandModule';
import { DataManagementModal } from './components/backup/DataManagementModal';

// Icons
import { ShieldCheck, ArrowLeft, Crown } from 'lucide-react';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Home — Dominion City Information Desk',
  'hrd-office': 'HRD Office — Executive Leadership & Oversight Suite',
  directory: 'CELL FELLOWSHIP & SATELLITE CHURCH FOLDERS',
  kiosk: 'CELL FELLOWSHIP & SATELLITE CHURCH FOLDERS',
  'finance-workspace': 'Financial Officer Dedicated Workspace',
  'bookstand-workspace': 'Bookstand Officer Dedicated Workspace',
  'secretary-workspace': 'Secretary & Administrative Workspace',
  'uniform-workspace': 'Uniform Leader Dedicated Workspace',
  members: 'Members Folder',
  birthdays: 'Birthday Calendar & Reminders',
  'lost-found': 'Lost & Found Custodial Register',
  announcements: 'News, Events & Noticeboard',
  cells: 'Church Information: Cell Meetings Directory (Asaba)',
  satellites: 'Church Information: Satellite Churches Directory',
  handbook: 'Church Information & Handbook Portal',
  attendance: 'Department Service Attendance & Clock-In Terminal',
  'dress-code': 'Sunday Dress Code & Outfit Planner',
  roster: 'Department Duty Roster & Timetable',
  meetings: 'Meetings & Thursday 9:00 PM Prayer Schedule',
  reports: 'Service Reports & Department Documentation',
  collections: 'Custom Information Collection & Form Builder',
  finances: 'Financial Management & Budget Analytics',
  bookstand: 'Book Stand — Church Literature Catalogue',
  backup: 'Data Persistence, Cloud Sync & Safeguards',
};

const TAB_MOBILE_TITLES: Record<string, string> = {
  dashboard: 'Home',
  'hrd-office': 'HRD Office',
  directory: 'Cell & Satellite Folders',
  kiosk: 'Cell & Satellite Folders',
  'finance-workspace': 'Finance Workspace',
  'bookstand-workspace': 'Book Officer Workspace',
  'secretary-workspace': 'Secretary Workspace',
  'uniform-workspace': 'Uniform Workspace',
  members: 'Members Folder',
  birthdays: 'Birthdays',
  'lost-found': 'Lost & Found',
  announcements: 'Noticeboard',
  cells: 'Cell Directory',
  satellites: 'Satellite Directory',
  handbook: 'Church Handbook',
  attendance: 'Attendance & Clock-In',
  'dress-code': 'Sunday Dress Code',
  roster: 'Duty Roster',
  meetings: 'Meetings & Prayer',
  reports: 'Service Reports',
  collections: 'Custom Forms',
  finances: 'Financial Records',
  bookstand: 'Book Stand',
  backup: 'Cloud Data & Sync',
};

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isOperationalModalOpen, setIsOperationalModalOpen] = useState(false);
  const [isReportToHRDModalOpen, setIsReportToHRDModalOpen] = useState(false);

  const {
    currentUser,
    isVisitor,
    activeOperationalRole,
    isOperationalRoleActive,
    exitOperationalRole,
  } = useAuth();

  // If user role is switched to visitor, default to approved directory
  useEffect(() => {
    if (isVisitor && activeTab !== 'directory' && activeTab !== 'cells' && activeTab !== 'satellites') {
      setActiveTab('directory');
    }
  }, [isVisitor, activeTab]);

  const activeRoleDetails = activeOperationalRole ? OPERATIONAL_ROLES_INFO[activeOperationalRole] : null;

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <MainDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenReportToHRD={() => setIsReportToHRDModalOpen(true)}
          />
        );
      case 'hrd-office':
        return (
          <HRDOfficeDashboard
            onReturnToGeneral={() => setActiveTab('dashboard')}
            onOpenRoleModal={() => setIsOperationalModalOpen(true)}
          />
        );
      case 'directory':
      case 'kiosk':
        return <CellFellowshipSatelliteDirectory />;
      case 'finance-workspace':
        return (
          <FinanceDashboard
            onReturnToGeneral={() => setActiveTab('dashboard')}
            onOpenReportToHRD={() => setIsReportToHRDModalOpen(true)}
          />
        );
      case 'bookstand-workspace':
        return (
          <BookstandDashboard
            onReturnToGeneral={() => setActiveTab('dashboard')}
            onNavigateToFullModule={() => setActiveTab('bookstand')}
            onOpenRoleModal={() => setIsOperationalModalOpen(true)}
            onNavigateToMemberStand={() => setActiveTab('bookstand')}
            onOpenReportToHRD={() => setIsReportToHRDModalOpen(true)}
          />
        );
      case 'secretary-workspace':
        return (
          <SecretaryDashboard
            onReturnToGeneral={() => setActiveTab('dashboard')}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenReportToHRD={() => setIsReportToHRDModalOpen(true)}
          />
        );
      case 'uniform-workspace':
        return (
          <UniformLeaderDashboard
            onReturnToGeneral={() => setActiveTab('dashboard')}
            onNavigateToRoster={() => setActiveTab('roster')}
            onOpenReportToHRD={() => setIsReportToHRDModalOpen(true)}
          />
        );
      case 'welfare-workspace':
        return (
          <WelfareDashboard
            onReturnToGeneral={() => setActiveTab('dashboard')}
            onNavigateToMembers={() => setActiveTab('members')}
            onOpenReportToHRD={() => setIsReportToHRDModalOpen(true)}
          />
        );
      case 'central-complaints':
      case 'monthly-reports-hub':
        // Reorganized: redirect directly into HRD Office
        return (
          <HRDOfficeDashboard
            onReturnToGeneral={() => setActiveTab('dashboard')}
            onOpenRoleModal={() => setIsOperationalModalOpen(true)}
          />
        );
      case 'members':
        return <MemberDirectoryModule />;
      case 'birthdays':
        return <BirthdayCalendarModule />;
      case 'lost-found':
        return <LostFoundModule />;
      case 'announcements':
        return <NewsEventsModule />;
      case 'cells':
        return <ChurchInformationHandbookModule initialSubTab="cells" />;
      case 'satellites':
        return <ChurchInformationHandbookModule initialSubTab="satellites" />;
      case 'handbook':
        return <ChurchInformationHandbookModule initialSubTab="handbook" />;
      case 'attendance':
        return <AttendanceModule />;
      case 'dress-code':
        return (
          <DressCodeModule
            onNavigateToRoster={() => setActiveTab('roster')}
            onNavigateToUniformWorkspace={() => setActiveTab('uniform-workspace')}
          />
        );
      case 'roster':
        return <RosterModule onNavigateToDressCode={() => setActiveTab('dress-code')} />;
      case 'meetings':
        return <MeetingsModule />;
      case 'reports':
        return (
          <ServiceReportsModule
            onOpenReportToHRD={() => setIsReportToHRDModalOpen(true)}
          />
        );
      case 'collections':
        return <InformationCollectionModule />;
      case 'finances':
        return <FinanceModule />;
      case 'bookstand':
        return (
          <BookstandModule
            onOpenRoleModal={() => setIsOperationalModalOpen(true)}
            onNavigateToOfficerDesk={() => setActiveTab('bookstand-workspace')}
          />
        );
      case 'backup':
        return <DataManagementModal />;
      default:
        return (
          <MainDashboard
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenReportToHRD={() => setIsReportToHRDModalOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#070D18] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 overflow-x-hidden w-full max-w-full">
      {/* Active Operational Role Top Strip - Mobile responsive without horizontal overflow */}
      {isOperationalRoleActive && activeRoleDetails && (
        <div className="bg-amber-400 text-slate-950 font-semibold px-2.5 xs:px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs border-b border-amber-500 shadow-xs z-40 animate-in slide-in-from-top-1 gap-2 max-w-full">
          <div className="flex items-center gap-1.5 min-w-0">
            {activeOperationalRole === 'hod' ? (
              <Crown className="w-4 h-4 text-slate-950 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-slate-950 shrink-0" />
            )}
            <div className="flex items-center gap-1 min-w-0">
              <span className="font-bold truncate text-[11px] sm:text-xs text-slate-950">
                Active: {activeRoleDetails.title}
              </span>
            </div>
          </div>
          <button
            onClick={exitOperationalRole}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 text-white text-[10px] sm:text-[11px] font-bold transition-colors cursor-pointer shadow-xs shrink-0"
            title="Switch back to Member Mode"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden xs:inline">Switch to </span>
            <span>Member Mode</span>
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        mobileOpen={mobileMenuOpen}
        setMobileOpen={setMobileMenuOpen}
        onOpenRoleModal={() => setIsOperationalModalOpen(true)}
        onOpenReportToHRD={() => setIsReportToHRDModalOpen(true)}
      />

      {/* Main App Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 pb-16 lg:pb-0 ${
          sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Header Bar */}
        <Header
          activeTabTitle={TAB_TITLES[activeTab] || 'Information Desk Portal'}
          mobileTitle={TAB_MOBILE_TITLES[activeTab] || TAB_TITLES[activeTab]}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onNavigateToDirectory={() => setActiveTab('directory')}
          onQuickPrint={() => window.print()}
          onNavigate={(tab) => setActiveTab(tab)}
          onOpenRoleModal={() => setIsOperationalModalOpen(true)}
          onOpenReportToHRD={() => setIsReportToHRDModalOpen(true)}
        />

        {/* Dynamic Page Body */}
        <main className="flex-1 p-2 xs:p-3 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          {renderActiveModule()}
        </main>
      </div>

      {/* Touch-Friendly Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Global Search & Quick Actions Modal */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(mod) => {
          setActiveTab(mod);
          setIsSearchOpen(false);
        }}
      />

      {/* Self-Service My Profile Modal */}
      <MyProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onOpenRoleModal={() => setIsOperationalModalOpen(true)}
      />

      {/* Centralized Operational Department Role Switcher Modal */}
      <OperationalRoleModal
        isOpen={isOperationalModalOpen}
        onClose={() => setIsOperationalModalOpen(false)}
        onNavigateToWorkspace={(tab) => {
          setActiveTab(tab);
          setIsOperationalModalOpen(false);
        }}
      />

      {/* Direct Line: REPORT TO HRD Leadership Submission Modal */}
      <ReportToHRDModal
        isOpen={isReportToHRDModalOpen}
        onClose={() => setIsReportToHRDModalOpen(false)}
      />

      {/* Notification Drawer */}
      <NotificationDrawer onNavigate={(mod) => setActiveTab(mod)} />
    </div>
  );
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <SignInPage />;
  }
  return <MainLayout />;
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <DataProvider>
          <NotificationProvider>
            <AuthenticatedApp />
          </NotificationProvider>
        </DataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
