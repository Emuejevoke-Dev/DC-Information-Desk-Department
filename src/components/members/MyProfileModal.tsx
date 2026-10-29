import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { User, Phone, MapPin, Briefcase, Calendar, Check, X } from 'lucide-react';

interface MyProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyProfileModal: React.FC<MyProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { currentUser, setCurrentUser } = useAuth();
  const { members, updateMember } = useData();

  // Find member record corresponding to currentUser if exists
  const currentMemberRecord = members.find(
    (m) =>
      m.email.toLowerCase() === currentUser.email.toLowerCase() ||
      m.fullName.toLowerCase() === currentUser.name.toLowerCase()
  ) || members[0];

  const [fullName, setFullName] = useState(currentMemberRecord?.fullName || currentUser.name);
  const [photoUrl, setPhotoUrl] = useState(currentMemberRecord?.photoUrl || currentUser.avatarUrl || '');
  const [phone, setPhone] = useState(currentMemberRecord?.phone || currentUser.phone || '');
  const [residentialArea, setResidentialArea] = useState(currentMemberRecord?.residentialArea || 'Asaba');
  const [occupation, setOccupation] = useState(currentMemberRecord?.occupation || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (currentMemberRecord) {
      updateMember(currentMemberRecord.id, {
        photoUrl: photoUrl || currentMemberRecord.photoUrl,
        phone,
        residentialArea,
        occupation,
      });
    }

    // Also update auth context user
    setCurrentUser({
      ...currentUser,
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
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Update My Member Profile
            </h3>
            <p className="text-xs text-slate-500">
              Self-service photo and contact update
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 mt-4">
          {/* Direct Camera / Gallery Image Upload */}
          <ImageUploadInput
            label="My Profile Picture"
            value={photoUrl}
            onChange={(dataUrl) => setPhotoUrl(dataUrl)}
            aspectRatioHint="Square (1:1)"
            placeholderText="Take a selfie with camera or choose photo from gallery"
          />

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              disabled
              value={fullName}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-semibold cursor-not-allowed"
              title="Contact Secretary to change official name records"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
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
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Occupation / Skills
            </label>
            <div className="relative">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="e.g. Systems Engineer / Accountant"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          {saveSuccess && (
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              Profile details updated successfully!
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-compact text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-compact btn-glow-blue"
            >
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
