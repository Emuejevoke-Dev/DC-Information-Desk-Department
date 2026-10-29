import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  AttendanceRecord,
  ServiceType,
  AttendanceStatus,
  FinalizedAttendanceReport,
  AbsenceFollowUp,
} from '../../types/models';
import { formatDate } from '../../utils/dateUtils';
import { exportToCSV } from '../../utils/exportUtils';
import { PrintModal } from '../common/PrintModal';
import confetti from 'canvas-confetti';
import {
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Users,
  Search,
  Printer,
  Download,
  Calendar,
  ShieldCheck,
  Compass,
  Sparkles,
  RefreshCw,
  UserCheck,
  UserX,
  Radio,
  SlidersHorizontal,
  Info,
  Lock,
  Unlock,
  FileText,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Phone,
  HeartHandshake,
} from 'lucide-react';

// Church coordinates for Dominion City Asaba Central HQ (Summit Road, Asaba)
export const CHURCH_COORDINATES = {
  name: 'Dominion City Asaba Central HQ',
  address: 'Summit Road, Asaba, Delta State, Nigeria',
  latitude: 6.1982,
  longitude: 6.6953,
  allowedRadiusMeters: 350, // 350 meters radius around the church premises
};

// Haversine formula to calculate distance in meters between two lat/lng points
export function calculateDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const φ1 = toRad(lat1);
  const φ2 = toRad(lat2);
  const Δφ = toRad(lat2 - lat1);
  const Δλ = toRad(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Helper to determine the default active service based on current date & time
function detectCurrentService(): ServiceType {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday, 2 = Tuesday, 4 = Thursday
  const hour = now.getHours();

  if (day === 0) {
    return hour < 9 ? 'Sunday 1st Service' : 'Sunday 2nd Service';
  } else if (day === 2) {
    return 'Tuesday Word & Communion';
  } else if (day === 4) {
    return 'Thursday Prayer Meeting';
  }
  return 'Tuesday Word & Communion';
}

export const AttendanceModule: React.FC = () => {
  const { currentUser, canManageMembers, canManageAttendance, isHOD, isSecretary } = useAuth();
  const {
    members,
    attendance,
    addAttendanceRecord,
    deleteAttendanceRecord,
    finalizedAttendance,
    finalizeAttendance,
    reopenAttendance,
    absenceFollowUps,
    addAbsenceFollowUp,
    updateAbsenceFollowUp,
  } = useData();

  // Active sub-tab
  const [activeTab, setActiveTab] = useState<'terminal' | 'finalized' | 'follow-up'>('terminal');

  // Current live time for clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Geolocation & Vicinity states
  const [geoMode, setGeoMode] = useState<'live' | 'simulate-inside' | 'simulate-outside' | 'desk-override'>('live');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Clock-in form state
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [isVisitorWorker, setIsVisitorWorker] = useState(false);
  const [visitorName, setVisitorName] = useState('');
  const [visitorPhone, setVisitorPhone] = useState('');
  const [visitorUnit, setVisitorUnit] = useState('First Timers Welcome');
  const [serviceType, setServiceType] = useState<ServiceType>(detectCurrentService());
  const [clockInNotes, setClockInNotes] = useState('');
  const [recentClockInSuccess, setRecentClockInSuccess] = useState<string | null>(null);

  // Register view filter states
  const [filterDate, setFilterDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filterService, setFilterService] = useState<string>('All');
  const [searchMember, setSearchMember] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Finalize attendance modal state
  const [isFinalizeModalOpen, setIsFinalizeModalOpen] = useState(false);
  const [finalizeRemarks, setFinalizeRemarks] = useState('');

  // Selected finalized report for detail viewing
  const [selectedReportDetail, setSelectedReportDetail] = useState<FinalizedAttendanceReport | null>(null);

  // Follow-up message preview modal
  const [activeFollowUpMessage, setActiveFollowUpMessage] = useState<{ member: AbsenceFollowUp; text: string } | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [followUpFilterStatus, setFollowUpFilterStatus] = useState<'All' | 'Pending' | 'Contacted' | 'Completed'>('All');

  // Update live clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Update distance based on geoMode and coordinates
  useEffect(() => {
    if (geoMode === 'simulate-inside') {
      setUserCoords({ latitude: 6.19825, longitude: 6.69532 });
      setCalculatedDistance(35); // 35 meters: inside
      setGpsError(null);
      setGpsLoading(false);
    } else if (geoMode === 'simulate-outside') {
      setUserCoords({ latitude: 6.225, longitude: 6.735 }); // outside ~4.8 km away
      setCalculatedDistance(4850);
      setGpsError(null);
      setGpsLoading(false);
    } else if (geoMode === 'desk-override') {
      setUserCoords({ latitude: CHURCH_COORDINATES.latitude, longitude: CHURCH_COORDINATES.longitude });
      setCalculatedDistance(0);
      setGpsError(null);
      setGpsLoading(false);
    } else if (geoMode === 'live') {
      requestLiveLocation();
    }
  }, [geoMode]);

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setUserCoords({ latitude: lat, longitude: lon });
        const dist = calculateDistanceMeters(
          lat,
          lon,
          CHURCH_COORDINATES.latitude,
          CHURCH_COORDINATES.longitude
        );
        setCalculatedDistance(dist);
        setGpsLoading(false);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(
          err.message ||
            'Unable to retrieve GPS coordinates. Please grant location permissions or select a simulation mode for testing.'
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Determine if inside church vicinity
  const isInsideVicinity = useMemo(() => {
    if (geoMode === 'desk-override' || geoMode === 'simulate-inside') return true;
    if (geoMode === 'simulate-outside') return false;
    if (calculatedDistance === null) return false;
    return calculatedDistance <= CHURCH_COORDINATES.allowedRadiusMeters;
  }, [geoMode, calculatedDistance]);

  // Handle Clock-in Submission
  const handleClockIn = (e: React.FormEvent) => {
    e.preventDefault();

    // Verify vicinity
    if (!isInsideVicinity && geoMode !== 'desk-override') {
      alert(
        `Clock-In Rejected: You are outside the church vicinity (~${
          calculatedDistance !== null
            ? calculatedDistance >= 1000
              ? (calculatedDistance / 1000).toFixed(1) + ' km'
              : calculatedDistance + ' meters'
            : 'Unknown distance'
        } away). You must be within ${
          CHURCH_COORDINATES.allowedRadiusMeters
        }m of Dominion City Asaba sanctuary to sign in.`
      );
      return;
    }

    let memberName = '';
    let memberPhone = '';
    let departmentRole = '';
    let photoUrl: string | undefined = undefined;
    let memberId: string | undefined = undefined;

    if (isVisitorWorker) {
      if (!visitorName.trim()) {
        alert('Please enter your full name.');
        return;
      }
      memberName = visitorName.trim();
      memberPhone = visitorPhone.trim();
      departmentRole = `Guest / First-Timer (${visitorUnit})`;
    } else {
      const targetId = selectedMemberId || currentUser.id;
      const matched = members.find((m) => m.id === targetId);
      if (matched) {
        memberId = matched.id;
        memberName = matched.fullName;
        memberPhone = matched.phone;
        departmentRole = matched.departmentRole;
        photoUrl = matched.photoUrl;
      } else {
        memberId = currentUser.id;
        memberName = currentUser.name;
        memberPhone = currentUser.phone;
        departmentRole = currentUser.departmentRole;
        const matchedCurrentUser = members.find((m) => m.id === currentUser.id || m.fullName.toLowerCase() === currentUser.name.toLowerCase());
        photoUrl = matchedCurrentUser?.photoUrl || currentUser.avatarUrl;
      }
    }

    // Check if already clocked in for this service today
    const todayStr = currentTime.toISOString().split('T')[0];
    const alreadySigned = attendance.some(
      (a) =>
        a.serviceDate === todayStr &&
        a.serviceType === serviceType &&
        ((memberId && a.memberId === memberId) || a.memberName.toLowerCase() === memberName.toLowerCase())
    );

    if (alreadySigned) {
      alert(`${memberName} has already clocked in for ${serviceType} today.`);
      return;
    }

    // Auto formatted time: e.g. "07:22:15 AM"
    const clockInTimeStr = currentTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    // Punctuality calculation
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    let status: AttendanceStatus = 'Present';

    if (serviceType === 'Sunday 1st Service' && (hour > 7 || (hour === 7 && minute > 30))) {
      status = 'Late';
    } else if (serviceType === 'Sunday 2nd Service' && (hour > 10 || (hour === 10 && minute > 0))) {
      status = 'Late';
    } else if (serviceType === 'Tuesday Word & Communion' && (hour > 18 || (hour === 18 && minute > 0))) {
      status = 'Late';
    }

    const markedByLabel =
      geoMode === 'desk-override'
        ? `Desk Lead Override (${currentUser.name})`
        : geoMode === 'simulate-inside'
        ? 'GPS Verified (Vicinity Sim: 35m)'
        : `Self Clock-In (GPS Verified: ${calculatedDistance || 0}m)`;

    addAttendanceRecord({
      memberId,
      memberName,
      memberPhone,
      departmentRole,
      photoUrl,
      serviceDate: todayStr,
      clockInTime: clockInTimeStr,
      serviceType,
      status,
      verifiedLocation: true,
      distanceFromChurchMeters: calculatedDistance !== null ? calculatedDistance : 0,
      latitude: userCoords?.latitude,
      longitude: userCoords?.longitude,
      deviceInfo: `${navigator.platform} - ${navigator.userAgent.slice(0, 40)}`,
      notes: clockInNotes.trim() || undefined,
      markedBy: markedByLabel,
    });

    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#2563EB', '#10B981', '#F59E0B'],
    });

    setRecentClockInSuccess(`${memberName} clocked in at ${clockInTimeStr} (${status})`);
    setTimeout(() => setRecentClockInSuccess(null), 6000);

    // Reset inputs
    setClockInNotes('');
    if (isVisitorWorker) {
      setVisitorName('');
      setVisitorPhone('');
    }
  };

  // Filtered Attendance List
  const filteredAttendance = useMemo(() => {
    return attendance.filter((rec) => {
      const matchDate = !filterDate || rec.serviceDate === filterDate;
      const matchService = filterService === 'All' || rec.serviceType === filterService;
      const matchSearch =
        !searchMember ||
        rec.memberName.toLowerCase().includes(searchMember.toLowerCase()) ||
        rec.departmentRole?.toLowerCase().includes(searchMember.toLowerCase()) ||
        rec.memberPhone?.includes(searchMember);
      return matchDate && matchService && matchSearch;
    });
  }, [attendance, filterDate, filterService, searchMember]);

  // Daily statistics
  const todayRecords = attendance.filter(
    (a) => a.serviceDate === currentTime.toISOString().split('T')[0]
  );
  const onTimeCount = todayRecords.filter((a) => a.status === 'Present').length;
  const lateCount = todayRecords.filter((a) => a.status === 'Late').length;
  const onTimePercentage = todayRecords.length > 0 ? Math.round((onTimeCount / todayRecords.length) * 100) : 100;

  // Finalize attendance calculation for current active filter
  const targetServiceForFinalize = filterService === 'All' ? serviceType : (filterService as ServiceType);
  const targetDateForFinalize = filterDate || currentTime.toISOString().split('T')[0];

  const candidateAttendanceForFinalize = attendance.filter(
    (a) => a.serviceDate === targetDateForFinalize && a.serviceType === targetServiceForFinalize
  );

  const presentMemberIds = candidateAttendanceForFinalize
    .map((a) => a.memberId)
    .filter(Boolean) as string[];

  const absentMembers = members.filter((m) => !presentMemberIds.includes(m.id));
  const absentMemberIds = absentMembers.map((m) => m.id);

  const totalEligibleCount = members.length;
  const finalizePresentCount = candidateAttendanceForFinalize.length;
  const finalizeLateCount = candidateAttendanceForFinalize.filter((a) => a.status === 'Late').length;
  const finalizeAbsentCount = absentMembers.length;
  const finalizeAttendanceRate = totalEligibleCount > 0 ? Math.round((finalizePresentCount / totalEligibleCount) * 100) : 0;

  const handleConfirmFinalize = () => {
    finalizeAttendance({
      serviceDate: targetDateForFinalize,
      serviceType: targetServiceForFinalize,
      closedBy: currentUser.name,
      totalEligible: totalEligibleCount,
      presentCount: finalizePresentCount,
      lateCount: finalizeLateCount,
      absentCount: finalizeAbsentCount,
      excusedCount: 0,
      attendanceRate: finalizeAttendanceRate,
      presentMemberIds,
      absentMemberIds,
      notes: finalizeRemarks.trim() || undefined,
    });

    // Populate follow-ups for absent members
    absentMembers.forEach((m) => {
      const exists = absenceFollowUps.some(
        (fu) => fu.memberId === m.id && fu.serviceDate === targetDateForFinalize
      );
      if (!exists) {
        addAbsenceFollowUp({
          memberId: m.id,
          memberName: m.fullName,
          memberPhone: m.phone,
          photoUrl: m.photoUrl,
          serviceDate: targetDateForFinalize,
          serviceType: targetServiceForFinalize,
          status: 'Pending',
        });
      }
    });

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    setIsFinalizeModalOpen(false);
    setFinalizeRemarks('');
    setActiveTab('finalized');
  };

  const handleExportCSV = () => {
    exportToCSV(
      filteredAttendance.map((a) => ({
        'Service Date': a.serviceDate,
        'Member Name': a.memberName,
        'Role / Unit': a.departmentRole || 'N/A',
        'Service Type': a.serviceType,
        'Clock-In Time': a.clockInTime,
        'Punctuality Status': a.status,
        'Distance (Meters)': a.distanceFromChurchMeters ?? 'N/A',
        'Marked By': a.markedBy,
        Notes: a.notes || '',
      })),
      `DominionCity_Attendance_${filterDate || 'all'}`
    );
  };

  const generateFollowUpText = (fu: AbsenceFollowUp) => {
    const firstName = fu.memberName.split(' ')[0] || fu.memberName;
    return `Dear ${firstName}, we missed your presence at Dominion City Asaba Information Desk during ${fu.serviceType} (${formatDate(fu.serviceDate)}). Hope you and your family are doing well! Please let us know if there is anything we can pray with you about or support you with. Have a deeply blessed and favored week! Warm regards, Dominion City Asaba Information Desk.`;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 3000);
  };

  const filteredFollowUps = absenceFollowUps.filter((fu) => {
    if (followUpFilterStatus === 'All') return true;
    return fu.status === followUpFilterStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl shadow-sm card-gradient-border-emerald glow-emerald">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 glow-dot-emerald">
              <UserCheck className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Service Attendance & Geofenced Clock-In Terminal
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time automated sign-in for Sunday and Midweek services with church vicinity GPS validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Close Service / Finalize Attendance Button for Authorized Officers */}
          {(canManageAttendance || isHOD || isSecretary) && (
            <button
              onClick={() => setIsFinalizeModalOpen(true)}
              className="btn-compact btn-glow-amber"
            >
              <Lock className="w-4 h-4" />
              Close Service / Finalise Attendance
            </button>
          )}

          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="btn-compact bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <Printer className="w-4 h-4" />
            Print Register
          </button>
          <button
            onClick={handleExportCSV}
            className="btn-compact bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'terminal'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Live Clock-In Terminal & Register
        </button>

        <button
          onClick={() => setActiveTab('finalized')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'finalized'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-4 h-4" />
          Finalised Reports ({finalizedAttendance.length})
        </button>

        {(canManageAttendance || isHOD || isSecretary) && (
          <button
            onClick={() => setActiveTab('follow-up')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'follow-up'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HeartHandshake className="w-4 h-4" />
            Absence Follow-Up Workspace
            {absenceFollowUps.filter((f) => f.status === 'Pending').length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
                {absenceFollowUps.filter((f) => f.status === 'Pending').length}
              </span>
            )}
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: LIVE CLOCK-IN TERMINAL & REGISTER                                 */}
      {/* ========================================================================= */}
      {activeTab === 'terminal' && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Today's Attendance
                </span>
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">{todayRecords.length}</p>
              <span className="text-[11px] text-slate-400 font-medium">Workers & Members</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  On-Time Rate
                </span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-2">{onTimePercentage}%</p>
              <span className="text-[11px] text-emerald-600 font-medium">{onTimeCount} on-time arrivals</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  Late Arrivals
                </span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mt-2">{lateCount}</p>
              <span className="text-[11px] text-amber-600 font-medium">Arrived after cut-off</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Current Live Time
                </span>
                <Radio className="w-4 h-4 text-blue-600 animate-pulse" />
              </div>
              <p className="text-xl font-black text-blue-900 dark:text-blue-300 mt-2 font-mono">
                {currentTime.toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </p>
              <span className="text-[11px] text-blue-500 font-medium">Auto-recorded on clock-in</span>
            </div>
          </div>

          {/* Terminal Dual Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (5 Cols): Clock-In Form & Location Checker */}
            <div className="lg:col-span-5 space-y-5">
              {/* Geolocation Vicinity Verifier Card */}
              <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                      Church Vicinity GPS Verification
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={requestLiveLocation}
                    disabled={gpsLoading}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${gpsLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </button>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-100 dark:border-slate-800 text-xs">
                    <MapPin className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{CHURCH_COORDINATES.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{CHURCH_COORDINATES.address}</p>
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        Target Lat/Lng: {CHURCH_COORDINATES.latitude}, {CHURCH_COORDINATES.longitude} • Radius: {CHURCH_COORDINATES.allowedRadiusMeters}m
                      </p>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                      Geofence Verification Mode:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setGeoMode('live')}
                        className={`p-2 text-xs rounded-xl font-bold border transition-all text-left ${
                          geoMode === 'live'
                            ? 'bg-blue-50 border-blue-500 text-blue-900 dark:bg-blue-950/60 dark:text-blue-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        📡 Device Live GPS
                      </button>
                      <button
                        type="button"
                        onClick={() => setGeoMode('simulate-inside')}
                        className={`p-2 text-xs rounded-xl font-bold border transition-all text-left ${
                          geoMode === 'simulate-inside'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        ✓ Inside Vicinity (35m)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGeoMode('simulate-outside')}
                        className={`p-2 text-xs rounded-xl font-bold border transition-all text-left ${
                          geoMode === 'simulate-outside'
                            ? 'bg-rose-50 border-rose-500 text-rose-900 dark:bg-rose-950/60 dark:text-rose-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        ✕ Outside Vicinity (~4.8km)
                      </button>
                      <button
                        type="button"
                        onClick={() => setGeoMode('desk-override')}
                        className={`p-2 text-xs rounded-xl font-bold border transition-all text-left ${
                          geoMode === 'desk-override'
                            ? 'bg-purple-50 border-purple-500 text-purple-900 dark:bg-purple-950/60 dark:text-purple-200'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                        }`}
                      >
                        🛡️ Desk Lead Override
                      </button>
                    </div>
                  </div>

                  {/* Proximity Result Banner */}
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                      isInsideVicinity || geoMode === 'desk-override'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-900 dark:text-emerald-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-900 dark:text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {isInsideVicinity || geoMode === 'desk-override' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                      )}
                      <div>
                        <p className="font-bold">
                          {geoMode === 'desk-override'
                            ? 'Desk Lead Override Active'
                            : isInsideVicinity
                            ? 'Inside Sanctuary Vicinity'
                            : 'Outside Approved Sanctuary Radius'}
                        </p>
                        <p className="text-[11px] opacity-90 mt-0.5">
                          {geoMode === 'desk-override'
                            ? `Authorized manual entry by ${currentUser.name}`
                            : calculatedDistance !== null
                            ? `Distance from altar: ~${calculatedDistance} meters (Allowed: ${CHURCH_COORDINATES.allowedRadiusMeters}m)`
                            : 'Acquiring GPS fix...'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Clock-In Terminal Submission Card */}
              <form
                onSubmit={handleClockIn}
                className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Submit Clock-In Record
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-blue-600 dark:text-blue-400">
                    {currentTime.toLocaleTimeString()}
                  </span>
                </div>

                {recentClockInSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2 animate-in zoom-in-95">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{recentClockInSuccess}</span>
                  </div>
                )}

                {/* Member Selector */}
                {!isVisitorWorker ? (
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Select Department Member:
                    </label>
                    <select
                      value={selectedMemberId || currentUser.id}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white font-medium"
                    >
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.fullName} ({m.departmentRole})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-bold text-slate-700">Visitor Full Name:</label>
                      <input
                        type="text"
                        value={visitorName}
                        onChange={(e) => setVisitorName(e.target.value)}
                        placeholder="e.g. Sister Grace Okonkwo"
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 mt-1"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700">Phone Number:</label>
                      <input
                        type="tel"
                        value={visitorPhone}
                        onChange={(e) => setVisitorPhone(e.target.value)}
                        placeholder="0803XXXXXXX"
                        className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-slate-50 mt-1"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={isVisitorWorker}
                      onChange={(e) => setIsVisitorWorker(e.target.checked)}
                      className="rounded text-blue-600"
                    />
                    <span>Clock-in for Guest / First-Timer Worker</span>
                  </label>
                </div>

                {/* Service Selection */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Service Session:
                  </label>
                  <select
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value as ServiceType)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white font-medium"
                  >
                    <option value="Sunday 1st Service">Sunday 1st Service (7:00 AM)</option>
                    <option value="Sunday 2nd Service">Sunday 2nd Service (9:30 AM)</option>
                    <option value="Tuesday Word & Communion">Tuesday Word & Communion (5:30 PM)</option>
                    <option value="Thursday Prayer Meeting">Thursday Prayer Meeting (9:00 PM)</option>
                    <option value="Special Meeting">Special Service / Departmental Retreat</option>
                  </select>
                </div>

                {/* Clock-In Notes */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Optional Remarks / Duty Station:
                  </label>
                  <input
                    type="text"
                    value={clockInNotes}
                    onChange={(e) => setClockInNotes(e.target.value)}
                    placeholder="e.g. Front Desk Wing A, Books Desk..."
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!isInsideVicinity && geoMode !== 'desk-override'}
                  className={`w-full h-10 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isInsideVicinity || geoMode === 'desk-override'
                      ? 'btn-glow-blue'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Clock-In at{' '}
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </button>
                {!isInsideVicinity && geoMode !== 'desk-override' && (
                  <p className="text-[11px] text-center text-rose-600 font-medium">
                    🔒 Button locked: You must be inside church premises to sign in.
                  </p>
                )}
              </form>
            </div>

            {/* Right Column (7 Cols): Live Attendance Register & Historical Log */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                {/* Filter Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Attendance Register ({filteredAttendance.length})
                    </h3>
                  </div>

                  {/* Service & Date Filter */}
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-700 dark:text-slate-200"
                    />

                    <select
                      value={filterService}
                      onChange={(e) => setFilterService(e.target.value)}
                      className="text-xs p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-700 dark:text-slate-200"
                    >
                      <option value="All">All Services</option>
                      <option value="Sunday 1st Service">Sunday 1st</option>
                      <option value="Sunday 2nd Service">Sunday 2nd</option>
                      <option value="Tuesday Word & Communion">Tuesday Midweek</option>
                      <option value="Thursday Prayer Meeting">Thursday Prayer</option>
                    </select>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchMember}
                    onChange={(e) => setSearchMember(e.target.value)}
                    placeholder="Search attendee by name, role or phone..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>

                {/* Attendance Table */}
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto custom-scrollbar border border-slate-100 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-[#131F38] text-slate-500 font-bold uppercase text-[10px] tracking-wider sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="py-2.5 px-3">Member</th>
                        <th className="py-2.5 px-3">Service</th>
                        <th className="py-2.5 px-3">Clock-In</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3">Verification</th>
                        {canManageMembers && <th className="py-2.5 px-3 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filteredAttendance.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-10 text-center text-slate-400">
                            No attendance records found for this date/service.
                          </td>
                        </tr>
                      ) : (
                        filteredAttendance.map((rec) => {
                          const matchedMember = members.find((m) => m.id === rec.memberId);
                          const photo = matchedMember?.photoUrl || rec.photoUrl;

                          return (
                            <tr key={rec.id} className="hover:bg-slate-50/80 dark:hover:bg-[#131F38] transition-colors">
                              <td className="py-2.5 px-3">
                                <div className="flex items-center gap-2.5">
                                  {photo ? (
                                    <img
                                      src={photo}
                                      alt={rec.memberName}
                                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0">
                                      {rec.memberName.charAt(0)}
                                    </div>
                                  )}
                                  <div>
                                    <p className="font-bold text-slate-900 dark:text-white">{rec.memberName}</p>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{rec.departmentRole}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 text-slate-700 dark:text-slate-300 font-medium">
                                <span className="block">{rec.serviceType}</span>
                                <span className="text-[10px] text-slate-400">{rec.serviceDate}</span>
                              </td>
                              <td className="py-2.5 px-3 font-mono font-bold text-blue-900 dark:text-blue-300">
                                {rec.clockInTime}
                              </td>
                              <td className="py-2.5 px-3">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    rec.status === 'Present'
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : rec.status === 'Late'
                                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                >
                                  {rec.status === 'Present' ? 'On-Time' : rec.status}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block">
                                  {rec.markedBy.includes('Override') ? '🛡️ Desk Override' : '📍 GPS Verified'}
                                </span>
                                {rec.distanceFromChurchMeters !== undefined && (
                                  <span className="text-[9px] text-slate-400">
                                    ~{rec.distanceFromChurchMeters}m from sanctuary
                                  </span>
                                )}
                              </td>
                              {canManageMembers && (
                                <td className="py-2.5 px-3 text-right">
                                  <button
                                    onClick={() => {
                                      if (confirm(`Remove attendance record for ${rec.memberName}?`)) {
                                        deleteAttendanceRecord(rec.id);
                                      }
                                    }}
                                    className="text-slate-400 hover:text-red-600 text-[11px] font-semibold transition-colors cursor-pointer"
                                    title="Delete entry"
                                  >
                                    Remove
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <span>Showing {filteredAttendance.length} attendance logs</span>
                <span>Dominion City Asaba • Information Desk</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FINALISED SERVICE REPORTS & AUDITS                                 */}
      {/* ========================================================================= */}
      {activeTab === 'finalized' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0E172B] p-4 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Archived & Finalised Service Reports ({finalizedAttendance.length})
              </h3>
              <p className="text-xs text-slate-500">
                Official end-of-service attendance audits with present, late, and absent breakdowns.
              </p>
            </div>
            {(canManageAttendance || isHOD || isSecretary) && (
              <button
                onClick={() => setIsFinalizeModalOpen(true)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors cursor-pointer shadow-xs"
              >
                + Finalise Another Service
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {finalizedAttendance.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No finalized attendance reports on record yet.
              </div>
            ) : (
              finalizedAttendance.map((report) => (
                <div
                  key={report.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                      <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                        {report.serviceType}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {formatDate(report.serviceDate)}
                      </span>
                    </div>

                    {report.isReopened && (
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                        ⚠️ Reopened Audit Trail Active
                      </span>
                    )}

                    <div className="grid grid-cols-4 gap-2 text-center py-2 bg-slate-50 dark:bg-[#131F38] rounded-xl border border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-400 font-bold uppercase block">Total</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{report.totalEligible}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-600 font-bold uppercase block">Present</span>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">{report.presentCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-600 font-bold uppercase block">Late</span>
                        <span className="text-sm font-black text-amber-700 dark:text-amber-400">{report.lateCount}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-rose-600 font-bold uppercase block">Absent</span>
                        <span className="text-sm font-black text-rose-700 dark:text-rose-400">{report.absentCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Attendance Rate:</span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">{report.attendanceRate}%</span>
                    </div>

                    <div className="text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-2">
                      <p>Closed by: <strong>{report.closedBy}</strong></p>
                      <p className="text-[10px] text-slate-400">{new Date(report.closedAt).toLocaleString()}</p>
                    </div>

                    {report.notes && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-blue-50/50 p-2 rounded-lg">
                        "{report.notes}"
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedReportDetail(report)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 cursor-pointer"
                    >
                      View Breakdown →
                    </button>

                    {isHOD && (
                      <button
                        onClick={() => {
                          if (confirm(`Reopen attendance for ${report.serviceType} on ${report.serviceDate}? An audit trail will be recorded.`)) {
                            reopenAttendance(report.id, currentUser.name);
                          }
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 cursor-pointer"
                      >
                        Reopen (HOD)
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ABSENCE FOLLOW-UP WORKSPACE (Prompt Section 4F)                     */}
      {/* ========================================================================= */}
      {activeTab === 'follow-up' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0E172B] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <HeartHandshake className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Absence Follow-Up & Pastoral Care Workspace
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Private follow-up records for members who were absent from service. Prepare polite messages and record reasons.
              </p>
            </div>

            {/* Filter by Follow-Up Status */}
            <div className="flex items-center gap-1.5">
              {(['All', 'Pending', 'Contacted', 'Completed'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setFollowUpFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    followUpFilterStatus === st
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredFollowUps.length === 0 ? (
              <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No absent member follow-ups under "{followUpFilterStatus}" status.
              </div>
            ) : (
              filteredFollowUps.map((fu) => {
                const memberRecord = members.find((m) => m.id === fu.memberId);
                const photo = memberRecord?.photoUrl || fu.photoUrl;

                return (
                  <div
                    key={fu.id}
                    className="p-5 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      {/* Member Info */}
                      <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-3">
                          <img
                            src={photo}
                            alt={fu.memberName}
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-200 shrink-0"
                          />
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                              {fu.memberName}
                            </h4>
                            <p className="text-[10px] text-slate-500">
                              {memberRecord?.departmentRole || 'Department Worker'}
                            </p>
                            <p className="text-[11px] font-mono text-blue-600 mt-0.5">
                              {fu.memberPhone || memberRecord?.phone}
                            </p>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            fu.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : fu.status === 'Contacted'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {fu.status}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs">
                        <div className="text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">Missed Service: </span>
                          {fu.serviceType} ({formatDate(fu.serviceDate)})
                        </div>

                        {fu.reasonProvided && (
                          <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#131F38] text-[11px]">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Reason Provided: </span>
                            {fu.reasonProvided}
                          </div>
                        )}

                        {fu.notes && (
                          <div className="p-2 rounded-lg bg-blue-50/50 text-[11px] text-blue-900">
                            <span className="font-bold">Private Note: </span>
                            {fu.notes}
                          </div>
                        )}

                        {fu.contactedBy && (
                          <p className="text-[10px] text-slate-400">
                            Followed up by {fu.contactedBy} ({new Date(fu.contactedAt || '').toLocaleDateString()})
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <button
                        onClick={() =>
                          setActiveFollowUpMessage({
                            member: fu,
                            text: generateFollowUpText(fu),
                          })
                        }
                        className="w-full py-1.5 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        Prepare Follow-Up Message
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            const reason = prompt('Enter reason provided by member:', fu.reasonProvided || '');
                            if (reason !== null) {
                              updateAbsenceFollowUp(fu.id, {
                                reasonProvided: reason,
                                status: 'Contacted',
                                contactedBy: currentUser.name,
                                contactedAt: new Date().toISOString(),
                              });
                            }
                          }}
                          className="flex-1 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold cursor-pointer"
                        >
                          Record Reason
                        </button>
                        <button
                          onClick={() => {
                            updateAbsenceFollowUp(fu.id, {
                              status: fu.status === 'Completed' ? 'Pending' : 'Completed',
                              contactedBy: currentUser.name,
                              contactedAt: new Date().toISOString(),
                            });
                          }}
                          className="flex-1 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold cursor-pointer"
                        >
                          {fu.status === 'Completed' ? 'Mark Pending' : 'Mark Completed'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CLOSE SERVICE / FINALISE ATTENDANCE                                */}
      {/* ========================================================================= */}
      {isFinalizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Lock className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Close Service & Finalise Attendance
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Official End-of-Service Audit Calculation
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFinalizeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-950 leading-relaxed">
                <p>
                  <strong>Service:</strong> {targetServiceForFinalize} •{' '}
                  <strong>Date:</strong> {formatDate(targetDateForFinalize)}
                </p>
                <p className="mt-1 text-[11px] text-blue-800">
                  This action compares all <strong>{totalEligibleCount} eligible members</strong> against the confirmed clock-ins. Absent members will be added to the private Follow-Up Workspace.
                </p>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Eligible</span>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{totalEligibleCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase block">Present</span>
                  <span className="text-xl font-black text-emerald-700">{finalizePresentCount}</span>
                  <span className="text-[10px] text-emerald-600 block font-medium">({finalizeAttendanceRate}%)</span>
                </div>
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200">
                  <span className="text-[10px] text-rose-700 font-bold uppercase block">Absent</span>
                  <span className="text-xl font-black text-rose-700">{finalizeAbsentCount}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Optional Closing Remarks / Observations:
                </label>
                <textarea
                  value={finalizeRemarks}
                  onChange={(e) => setFinalizeRemarks(e.target.value)}
                  placeholder="e.g. Excellent early morning arrival. Weather condition favorable..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#131F38] text-slate-900 dark:text-white"
                  rows={3}
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#070F1E] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFinalizeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFinalize}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Confirm & Finalise Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: FOLLOW-UP MESSAGE PREVIEW (SMS & WHATSAPP)                        */}
      {/* ========================================================================= */}
      {activeFollowUpMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Polite Follow-Up Message for {activeFollowUpMessage.member.memberName}
                </h3>
              </div>
              <button
                onClick={() => setActiveFollowUpMessage(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <p className="text-slate-500">
                You can review, copy, or launch WhatsApp to deliver this courteous pastoral note:
              </p>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 font-sans text-slate-800 dark:text-slate-200 leading-relaxed">
                {activeFollowUpMessage.text}
              </div>

              {copiedMessage && (
                <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                  Message copied to clipboard! You can paste in SMS or WhatsApp.
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#070F1E] border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => copyToClipboard(activeFollowUpMessage.text)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                Copy Text
              </button>

              {activeFollowUpMessage.member.memberPhone && (
                <a
                  href={`https://wa.me/234${activeFollowUpMessage.member.memberPhone.replace(/^0/, '')}?text=${encodeURIComponent(
                    activeFollowUpMessage.text
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Send via WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: VIEW DETAILED REPORT BREAKDOWN                                     */}
      {/* ========================================================================= */}
      {selectedReportDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#0E172B] rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Audit Breakdown: {selectedReportDetail.serviceType}
                </h3>
                <p className="text-xs text-slate-400">Date: {formatDate(selectedReportDetail.serviceDate)}</p>
              </div>
              <button onClick={() => setSelectedReportDetail(null)} className="text-slate-400 p-1">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-bold text-emerald-700 uppercase mb-2">
                  ✓ Present Workers ({selectedReportDetail.presentMemberIds.length}):
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2">
                  {selectedReportDetail.presentMemberIds.map((id) => {
                    const m = members.find((mem) => mem.id === id);
                    return (
                      <div key={id} className="p-2 rounded-lg bg-emerald-50/60 flex items-center gap-2">
                        <img
                          src={m?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={m?.fullName || id}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <span className="font-medium text-slate-800 truncate">{m?.fullName || id}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-rose-700 uppercase mb-2">
                  ✕ Absent Workers ({selectedReportDetail.absentMemberIds.length}):
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-2">
                  {selectedReportDetail.absentMemberIds.map((id) => {
                    const m = members.find((mem) => mem.id === id);
                    return (
                      <div key={id} className="p-2 rounded-lg bg-rose-50/60 flex items-center gap-2">
                        <img
                          src={m?.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={m?.fullName || id}
                          className="w-6 h-6 rounded-full object-cover shrink-0"
                        />
                        <span className="font-medium text-slate-800 truncate">{m?.fullName || id}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedReportDetail(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-100 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Register Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={`Official Service Attendance Register (${filterDate || 'All Dates'})`}
      >
        <div className="space-y-4 text-xs font-sans">
          <div className="text-center pb-3 border-b border-slate-200">
            <h2 className="text-base font-bold text-slate-900 uppercase">
              Dominion City Asaba — Information Desk Department
            </h2>
            <p className="text-slate-600">
              Official Service Attendance & Clock-In Register • Date: {filterDate} • Service:{' '}
              {filterService}
            </p>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-300 text-[10px] font-bold uppercase text-slate-600">
                <th className="py-1.5 px-2">#</th>
                <th className="py-1.5 px-2">Member Full Name</th>
                <th className="py-1.5 px-2">Department Role</th>
                <th className="py-1.5 px-2">Service</th>
                <th className="py-1.5 px-2">Clock-In Time</th>
                <th className="py-1.5 px-2">Status</th>
                <th className="py-1.5 px-2">Verification Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAttendance.map((rec, idx) => (
                <tr key={rec.id}>
                  <td className="py-1.5 px-2 font-mono">{idx + 1}</td>
                  <td className="py-1.5 px-2 font-bold">{rec.memberName}</td>
                  <td className="py-1.5 px-2">{rec.departmentRole}</td>
                  <td className="py-1.5 px-2">{rec.serviceType}</td>
                  <td className="py-1.5 px-2 font-mono">{rec.clockInTime}</td>
                  <td className="py-1.5 px-2 font-semibold">{rec.status}</td>
                  <td className="py-1.5 px-2">{rec.markedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pt-6 grid grid-cols-2 gap-8 text-[11px] text-slate-600">
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold">Head of Information Desk</p>
              <p className="text-[10px]">Signature & Date</p>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold">Departmental Secretary</p>
              <p className="text-[10px]">Signature & Date</p>
            </div>
          </div>
        </div>
      </PrintModal>
    </div>
  );
};
