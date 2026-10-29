import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { ItemCategory, LostItem } from '../../types/models';
import { PackageSearch, X, Check } from 'lucide-react';

interface RecordFoundItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const RecordFoundItemModal: React.FC<RecordFoundItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser } = useAuth();
  const { addLostItem } = useData();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Bibles & Books');
  const [photoUrl, setPhotoUrl] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0]);
  const [timeFound, setTimeFound] = useState('11:00 AM');
  const [locationFound, setLocationFound] = useState('');
  const [reportingWing, setReportingWing] = useState<'Desk A — Left Wing' | 'Desk B — Right Wing'>('Desk A — Left Wing');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !locationFound.trim()) {
      alert('Please fill in item name and location where found.');
      return;
    }

    addLostItem({
      name: name.trim(),
      description: description.trim(),
      category,
      photoUrl:
        photoUrl ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
      dateFound,
      timeFound,
      locationFound: `${locationFound.trim()} (${reportingWing})`,
      reportingWing,
      dateReceived: dateFound,
      recordedBy: currentUser.name,
      status: 'Unclaimed',
      isPubliclyVisible: true,
      notes: notes.trim() || 'Logged at Information Desk register',
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0B1528] rounded-2xl max-w-lg w-full p-6 shadow-2xl card-gradient-border-amber glow-amber animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <PackageSearch className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Record Found Item
              </h3>
              <p className="text-xs text-slate-500">
                Log a misplaced item into custody for immediate retrieval
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Leather Bound Study Bible / Car Key Fob"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Bibles & Books">Bibles & Books</option>
                <option value="Phones & Electronics">Phones & Electronics</option>
                <option value="Bags & Purses">Bags & Purses</option>
                <option value="Jewelry & Watches">Jewelry & Watches</option>
                <option value="Clothing & Shawls">Clothing & Shawls</option>
                <option value="Keys & IDs">Keys & IDs</option>
                <option value="Baby Items">Baby Items</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Front Desk Wing *
              </label>
              <select
                value={reportingWing}
                onChange={(e) => setReportingWing(e.target.value as any)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 text-blue-900"
              >
                <option value="Desk A — Left Wing">Desk A — Left Wing</option>
                <option value="Desk B — Right Wing">Desk B — Right Wing</option>
              </select>
            </div>
          </div>

          {/* Direct Camera / Gallery Image Upload */}
          <ImageUploadInput
            label="Item Photograph"
            value={photoUrl}
            onChange={(dataUrl) => setPhotoUrl(dataUrl)}
            aspectRatioHint="Square or Landscape"
            placeholderText="Take photo of found item with mobile camera or choose from gallery"
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date Found *
              </label>
              <input
                type="date"
                required
                value={dateFound}
                onChange={(e) => setDateFound(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Time Found
              </label>
              <input
                type="text"
                placeholder="e.g. 10:30 AM"
                value={timeFound}
                onChange={(e) => setTimeFound(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Exact Location Found in Church *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Row 14, Middle Gallery, Main Auditorium"
              value={locationFound}
              onChange={(e) => setLocationFound(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Detailed Description & Distinguishing Marks
            </label>
            <textarea
              rows={2}
              placeholder="Color, brand name, inscriptions, contents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Custody Storage Location
            </label>
            <input
              type="text"
              placeholder="e.g. Cupboard A, Shelf 2 at Information Desk"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              Item successfully registered! It is now visible in Recent Lost & Found.
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
              className="btn-compact btn-glow-amber"
            >
              Submit Item Record
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
