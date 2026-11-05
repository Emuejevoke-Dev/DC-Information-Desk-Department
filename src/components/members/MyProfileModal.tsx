import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { User, Phone, MapPin, Briefcase, Calendar, Check, X, LogOut, ShieldCheck } from 'lucide-react';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenRoleModal?: () => void;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenRoleModal,
}) => {
  const { currentUser, setCurrentUser, logout, activeOperationalRole, isOperationalRoleActive } = useAuth();
  const { members, updateMember, addMember } = useData();

  // Find member record strictly corresponding to currentUser
  const currentMemberRecord = members.find(
    (m) =>
      m.id === currentUser.id ||
      (m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()) ||
      m.fullName.toLowerCase() === currentUser.name.toLowerCase()
  );

  // Initialize Date of Birth string (YYYY-MM-DD)
  const initialDob = () => {
    if (currentMemberRecord?.dateOfBirth) return currentMemberRecord.dateOfBirth;
    if (currentMemberRecord?.birthDay && currentMemberRecord?.birthMonth) {
      const y = currentMemberRecord.birthYear || 1995;
      const m = String(currentMemberRecord.birthMonth).padStart(2, '0');
      const d = String(currentMemberRecord.birthDay).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    return '';
  };

  const [fullName, setFullName] = useState(currentMemberRecord?.fullName || currentUser.name);
  const [photoUrl, setPhotoUrl] = useState(currentMemberRecord?.photoUrl || currentUser.avatarUrl || '');
  const [phone, setPhone] = useState(currentMemberRecord?.phone || currentUser.phone || '');
  const [residentialArea, setResidentialArea] = useState(currentMemberRecord?.residentialArea || 'Asaba Central');
  const [occupation, setOccupation] = useState(currentMemberRecord?.occupation || '');
  const [dobString, setDobString] = useState<string>(initialDob);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    let bDay = currentMemberRecord?.birthDay || 15;
    let bMonth = currentMemberRecord?.birthMonth || 1;
    let bYear = currentMemberRecord?.birthYear || 1995;

    if (dobString) {
      const parts = dobString.split('-');
      if (parts.length === 3) {
        bYear = parseInt(parts[0], 10);
        bMonth = parseInt(parts[1], 10);
        bDay = parseInt(parts[2], 10);
      }
    }

    const cleanName = fullName.trim() || currentUser.name;

    if (currentMemberRecord) {
      updateMember(currentMemberRecord.id, {
        fullName: cleanName,
        photoUrl: photoUrl || currentMemberRecord.photoUrl,
        phone,
        residentialArea,
        occupation,
        birthDay: bDay,
        birthMonth: bMonth,
        birthYear: bYear,
        dateOfBirth: dobString || undefined,
      });
    } else {
      // Create registered member entry for this user
      addMember({
        fullName: cleanName,
        photoUrl: photoUrl || currentUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        phone,
        email: currentUser.email,
        residentialArea,
        occupation,
        departmentRole: currentUser.departmentRole || 'Department Member',
        status: 'Active',
        birthDay: bDay,
        birthMonth: bMonth,
        birthYear: bYear,
        dateOfBirth: dobString || undefined,
        joinedDate: new Date().toISOString().split('T')[0],
      });
    }

    // Also update auth context user
    setCurrentUser({
      ...currentUser,
      name: cleanName,
      avatarUrl: photoUrl || currentUser.avatarUrl,
      phone,
    });

    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0E172B] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Update My Member Profile
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Personal photograph, legal name, contact details & birthday
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-4 text-xs">
          {/* Direct Camera / Gallery Image Upload */}
          <ImageUploadInput
            label="My Profile Photograph"
            value={photoUrl}
            onChange={(dataUrl) => setPhotoUrl(dataUrl)}
            aspectRatioHint="Square (1:1)"
            placeholderText="Take a selfie with camera or select from gallery"
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Legal Name *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Brother Chukwudi Okonkwo"
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Date of Birth * (For Birthday Celebrations)
            </label>
            <div className="relative">
              <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="date"
                value={dobString}
                onChange={(e) => setDobString(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Used for automated department birthday countdowns and celebrations.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+234..."
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Residential Area in Asaba *
            </label>
            <div className="relative">
              <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="e.g. Summit Road, Near Sweet Spirit Hotel"
                value={residentialArea}
                onChange={(e) => setResidentialArea(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Occupation / Skills
            </label>
            <div className="relative">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Systems Engineer / Accountant"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#131F38] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {/* Mobile-Friendly Account Actions: Operational Role & Immediate Logout */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Department & Account Actions
            </p>
            {onOpenRoleModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenRoleModal();
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-900 dark:text-blue-200 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Switch Operational Role</span>
                </span>
                <span className="text-[10px] bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-black uppercase">
                  {isOperationalRoleActive && activeOperationalRole ? activeOperationalRole.toUpperCase() : 'ROLES'}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-98 text-white font-black text-xs shadow-md shadow-red-950/40 border border-red-500/50 transition-all cursor-pointer touch-manipulation"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out of Account</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Profile and photograph updated successfully!
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="btn-compact text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-compact btn-glow-blue cursor-pointer"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
