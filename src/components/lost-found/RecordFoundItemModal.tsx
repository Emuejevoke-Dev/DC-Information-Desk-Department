import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { ItemCategory, LostItem, LostItemStatus } from '../../types/models';
import { PackageSearch, X, Check, Edit2 } from 'lucide-react';

interface RecordFoundItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  item?: LostItem | null;
}

export const RecordFoundItemModal: React.FC<RecordFoundItemModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  item = null,
}) => {
  const { currentUser } = useAuth();
  const { addLostItem, updateLostItem } = useData();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Bibles & Books');
  const [photoUrl, setPhotoUrl] = useState('');
  const [dateFound, setDateFound] = useState(new Date().toISOString().split('T')[0]);
  const [timeFound, setTimeFound] = useState('11:00 AM');
  const [locationFound, setLocationFound] = useState('');
  const [reportingWing, setReportingWing] = useState<'Desk A — Left Wing' | 'Desk B — Right Wing'>('Desk A — Left Wing');
  const [recordedBy, setRecordedBy] = useState(currentUser.name);
  const [status, setStatus] = useState<LostItemStatus>('Unclaimed');
  const [collectedBy, setCollectedBy] = useState('');
  const [recoveryDate, setRecoveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setDescription(item.description || '');
      setCategory(item.category || 'Bibles & Books');
      setPhotoUrl(item.photoUrl || '');
      setDateFound(item.dateFound || new Date().toISOString().split('T')[0]);
      setTimeFound(item.timeFound || '11:00 AM');
      setLocationFound(item.locationFound || '');
      setReportingWing(item.reportingWing || 'Desk A — Left Wing');
      setRecordedBy(item.recordedBy || currentUser.name);
      setStatus(item.status || 'Unclaimed');
      setCollectedBy(item.collectedBy || '');
      setRecoveryDate(item.recoveryDate || '');
      setNotes(item.notes || '');
    } else {
      setName('');
      setDescription('');
      setCategory('Bibles & Books');
      setPhotoUrl('');
      setDateFound(new Date().toISOString().split('T')[0]);
      setTimeFound('11:00 AM');
      setLocationFound('');
      setReportingWing('Desk A — Left Wing');
      setRecordedBy(currentUser.name);
      setStatus('Unclaimed');
      setCollectedBy('');
      setRecoveryDate('');
      setNotes('');
    }
  }, [item, isOpen, currentUser.name]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !locationFound.trim()) {
      alert('Please fill in Item Name and Location Where Found.');
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category,
      photoUrl:
        photoUrl ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop&q=80',
      dateFound,
      timeFound,
      locationFound: locationFound.trim(),
      reportingWing,
      dateReceived: dateFound,
      recordedBy: recordedBy.trim() || currentUser.name,
      status,
      collectedBy: collectedBy.trim() || undefined,
      recoveryDate: recoveryDate.trim() || undefined,
      isPubliclyVisible: true,
      notes: notes.trim() || 'Logged at Information Desk register',
    };

    if (item) {
      updateLostItem(item.id, payload);
    } else {
      addLostItem(payload);
    }

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      if (onSuccess) onSuccess();
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#0B1528] rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              {item ? <Edit2 className="w-5 h-5" /> : <PackageSearch className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {item ? 'Edit Lost & Found Record' : 'Log New Found Item'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item ? 'Update item details, custody, or recovery status' : 'Log a misplaced item into custody for immediate retrieval'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 text-xs">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Item Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Leather Bound Study Bible / Car Key Fob"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium cursor-pointer"
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
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Front Desk Wing *
              </label>
              <select
                value={reportingWing}
                onChange={(e) => setReportingWing(e.target.value as any)}
                className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 dark:text-amber-300 cursor-pointer"
              >
                <option value="Desk A — Left Wing">Desk A — Left Wing</option>
                <option value="Desk B — Right Wing">Desk B — Right Wing</option>
              </select>
            </div>
          </div>

          {/* Direct Camera / Gallery Image Upload */}
          <ImageUploadInput
            label="Item Photograph (Mobile Camera or Gallery)"
            value={photoUrl}
            onChange={(dataUrl) => setPhotoUrl(dataUrl)}
            aspectRatioHint="Square or Landscape"
            placeholderText="Take photo of found item with mobile camera or choose from gallery"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date Found *
              </label>
              <input
                type="date"
                required
                value={dateFound}
                onChange={(e) => setDateFound(e.target.value)}
                className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Time Found
              </label>
              <input
                type="text"
                placeholder="e.g. 10:30 AM"
                value={timeFound}
                onChange={(e) => setTimeFound(e.target.value)}
                className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Exact Location Found in Church *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Row 14, Middle Gallery, Main Auditorium"
              value={locationFound}
              onChange={(e) => setLocationFound(e.target.value)}
              className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Person Who Found or Reported Item *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Brother Sunday (Ushering), Sister Grace..."
              value={recordedBy}
              onChange={(e) => setRecordedBy(e.target.value)}
              className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description & Distinguishing Marks
            </label>
            <textarea
              rows={3}
              placeholder="Color, brand name, inscriptions, contents..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 min-h-[75px] font-medium"
            />
          </div>

          {/* Status & Custody Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Recovery Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LostItemStatus)}
                className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-bold cursor-pointer"
              >
                <option value="Unclaimed">Found / Unclaimed</option>
                <option value="Claimed">Claimed (Awaiting Return)</option>
                <option value="Returned">Returned to Owner</option>
              </select>
            </div>

            {status !== 'Unclaimed' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Person Who Claimed Item
                </label>
                <input
                  type="text"
                  placeholder="Full name of claimant"
                  value={collectedBy}
                  onChange={(e) => setCollectedBy(e.target.value)}
                  className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                />
              </div>
            )}
          </div>

          {status === 'Returned' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date Returned to Owner
              </label>
              <input
                type="date"
                value={recoveryDate}
                onChange={(e) => setRecoveryDate(e.target.value)}
                className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Custody Storage Location & Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Cupboard A, Shelf 2 at Information Desk"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="lost-found-input w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
            />
          </div>

          {isSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600" />
              {item ? 'Item record updated successfully!' : 'Item successfully registered in custody!'}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {item ? 'Save Changes' : 'Submit Item Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
