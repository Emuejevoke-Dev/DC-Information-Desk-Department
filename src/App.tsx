import React, { useState, useEffect, Suspense, lazy } from 'react';
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
import { NotificationDrawer } from './components/common/NotificationDrawer';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { MyProfileModal } from './components/members/MyProfileModal';

// Primary Landing Dashboard (Loaded eagerly for instant first paint)
import { MainDashboard } from './components/dashboard/MainDashboard';

// Lazy Loaded Officer & Specialized Dashboards (Code-split to reduce mobile bundle size and eliminate lag)
const FinanceDashboard = lazy(() => import('./components/dashboard/FinanceDashboard').then((m) => ({ default: m.FinanceDashboard })));
const BookstandDashboard = lazy(() => import('./components/dashboard/BookstandDashboard').then((m) => ({ default: m.BookstandDashboard })));
const SecretaryDashboard = lazy(() => import('./components/dashboard/SecretaryDashboard').then((m) => ({ default: m.SecretaryDashboard })));
const UniformLeaderDashboard = lazy(() => import('./components/dresscode/UniformLeaderDashboard').then((m) => ({ default: m.UniformLeaderDashboard })));
const WelfareDashboard = lazy(() => import('./components/welfare/WelfareDashboard').then((m) => ({ default: m.WelfareDashboard })));
const HRDOfficeDashboard = lazy(() => import('./components/hrd/HRDOfficeDashboard').then((m) => ({ default: m.HRDOfficeDashboard })));
const ReportToHRDModal = lazy(() => import('./components/hrd/ReportToHRDModal').then((m) => ({ default: m.ReportToHRDModal })));

// Lazy Loaded Operational Modules
const CellFellowshipSatelliteDirectory = lazy(() => import('./components/cells/CellFellowshipSatelliteDirectory').then((m) => ({ default: m.CellFellowshipSatelliteDirectory })));
const MemberDirectoryModule = lazy(() => import('./components/members/MemberDirectoryModule').then((m) => ({ default: m.MemberDirectoryModule })));
const BirthdayCalendarModule = lazy(() => import('./components/birthdays/BirthdayCalendarModule').then((m) => ({ default: m.BirthdayCalendarModule })));
const LostFoundModule = lazy(() => import('./components/lost-found/LostFoundModule').then((m) => ({ default: m.LostFoundModule })));
const NewsEventsModule = lazy(() => import('./components/news/NewsEventsModule').then((m) => ({ default: m.NewsEventsModule })));
const ChurchInformationHandbookModule = lazy(() => import('./components/handbook/ChurchInformationHandbookModule').then((m) => ({ default: m.ChurchInformationHandbookModule })));
const AttendanceModule = lazy(() => import('./components/attendance/AttendanceModule').then((m) => ({ default: m.AttendanceModule })));
const DressCodeModule = lazy(() => import('./components/dresscode/DressCodeModule').then((m) => ({ default: m.DressCodeModule })));
const RosterModule = lazy(() => import('./components/roster/RosterModule').then((m) => ({ default: m.RosterModule })));
const MeetingsModule = lazy(() => import('./components/meetings/MeetingsModule').then((m) => ({ default: m.MeetingsModule })));
const ServiceReportsModule = lazy(() => import('./components/reports/ServiceReportsModule').then((m) => ({ default: m.ServiceReportsModule })));
const InformationCollectionModule = lazy(() => import('./components/collections/InformationCollectionModule').then((m) => ({ default: m.InformationCollectionModule })));
const FinanceModule = lazy(() => import('./components/finance/FinanceModule').then((m) => ({ default: m.FinanceModule })));
const BookstandModule = lazy(() => import('./components/bookstand/BookstandModule').then((m) => ({ default: m.BookstandModule })));
const DataManagementModal = lazy(() => import('./components/backup/DataManagementModal').then((m) => ({ default: m.DataManagementModal })));
const GlobalSearchModal = lazy(() => import('./components/common/GlobalSearchModal').then((m) => ({ default: m.GlobalSearchModal })));

// Icons
import { ShieldCheck, ArrowLeft, Crown } from 'lucide-react';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Home — Dominion City Information Desk',
  'hrd-office': 'HOD Office — Executive Leadership & Oversight Suite',
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
  'hrd-office': 'HOD Office',
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

const ModuleLoadingSkeleton = () => (
  <div className="space-y-4 animate-pulse p-4 sm:p-6 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-48"></div>
      <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded-lg w-20"></div>
    </div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
      <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
      <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
      <div className="h-20 bg-slate-100 dark:bg-slate-800/60 rounded-xl"></div>
    </div>
    <div className="h-56 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></div>
        <span>Loading department workspace...</span>
      </div>
    </div>
  </div>
);

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
        className={`flex-1 flex flex-col transition-all duration-300 pb-24 lg:pb-0 ${
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

        {/* Dynamic Page Body - Mobile-first padding with safe-area spacing and suspense code-splitting */}
        <main className="flex-1 px-3 py-3 sm:px-6 sm:py-6 lg:p-8 max-w-7xl w-full mx-auto overflow-x-hidden">
          <Suspense fallback={<ModuleLoadingSkeleton />}>
            {renderActiveModule()}
          </Suspense>
        </main>
      </div>

      {/* Touch-Friendly Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeTab}
        onNavigate={(tab) => setActiveTab(tab)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Global Search & Quick Actions Modal (Lazy loaded on demand) */}
      <Suspense fallback={null}>
        <GlobalSearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
          onNavigate={(mod) => {
            setActiveTab(mod);
            setIsSearchOpen(false);
          }}
        />
      </Suspense>

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

      {/* Direct Line: REPORT TO HOD Leadership Submission Modal (Lazy loaded) */}
      <Suspense fallback={null}>
        <ReportToHRDModal
          isOpen={isReportToHRDModalOpen}
          onClose={() => setIsReportToHRDModalOpen(false)}
        />
      </Suspense>

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
