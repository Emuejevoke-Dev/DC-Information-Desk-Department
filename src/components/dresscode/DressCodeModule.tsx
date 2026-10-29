import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DressCode } from '../../types/models';
import { PrintModal } from '../common/PrintModal';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { getNextSunday, formatDate } from '../../utils/dateUtils';
import {
  Shirt,
  Plus,
  Calendar,
  Printer,
  Edit2,
  Trash2,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
  Eye,
} from 'lucide-react';

interface DressCodeModuleProps {
  onNavigateToRoster?: () => void;
  onNavigateToUniformWorkspace?: () => void;
}

export const DressCodeModule: React.FC<DressCodeModuleProps> = ({
  onNavigateToRoster,
  onNavigateToUniformWorkspace,
}) => {
  const { currentUser, canManageMembers, canManageUniforms, isHOD } = useAuth();
  const { dressCodes, addDressCode, updateDressCode, deleteDressCode } = useData();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DressCode | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<{ url: string; title: string } | null>(null);

  const today = new Date();
  const nextSunday = getNextSunday(today);
  const nextSundayStr = nextSunday.toISOString().split('T')[0];

  const [formData, setFormData] = useState<{
    sundayDate: string;
    themeTitle: string;
    primaryColors: string[];
    description: string;
    mensPhotoUrl: string;
    womensPhotoUrl: string;
    specialInstructions: string;
  }>({
    sundayDate: nextSundayStr,
    themeTitle: '',
    primaryColors: ['#1D4ED8', '#FFFFFF'],
    description: '',
    mensPhotoUrl: '',
    womensPhotoUrl: '',
    specialInstructions: 'Department lapel pin compulsory for all members serving on duty.',
  });

  const [colorInput, setColorInput] = useState('#1D4ED8');

  const sortedDressCodes = [...dressCodes].sort(
    (a, b) => new Date(a.sundayDate).getTime() - new Date(b.sundayDate).getTime()
  );

  // General department members see ONLY published dress codes. Uniform Leader and HOD see all.
  const displayedDressCodes = sortedDressCodes.filter((dc) => {
    if (canManageUniforms || isHOD) return true;
    return dc.status === 'Published' || !dc.status;
  });

  const handleAddColor = () => {
    if (formData.primaryColors.length < 5 && !formData.primaryColors.includes(colorInput)) {
      setFormData({
        ...formData,
        primaryColors: [...formData.primaryColors, colorInput],
      });
    }
  };

  const handleRemoveColor = (idx: number) => {
    setFormData({
      ...formData,
      primaryColors: formData.primaryColors.filter((_, i) => i !== idx),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sundayDate || !formData.themeTitle) {
      alert('Please fill out Sunday Date and Theme Title.');
      return;
    }

    const payload = {
      ...formData,
      photoUrl: formData.mensPhotoUrl || formData.womensPhotoUrl || '',
    };

    if (editingCode) {
      updateDressCode(editingCode.id, payload);
      setEditingCode(null);
    } else {
      addDressCode(payload);
    }

    setIsAddModalOpen(false);
    setFormData({
      sundayDate: nextSundayStr,
      themeTitle: '',
      primaryColors: ['#1D4ED8', '#FFFFFF'],
      description: '',
      mensPhotoUrl: '',
      womensPhotoUrl: '',
      specialInstructions: 'Department lapel pin compulsory for all members serving on duty.',
    });
  };

  const handleEditClick = (dc: DressCode) => {
    setEditingCode(dc);
    setFormData({
      sundayDate: dc.sundayDate,
      themeTitle: dc.themeTitle,
      primaryColors: dc.primaryColors,
      description: dc.description,
      mensPhotoUrl: dc.mensPhotoUrl || dc.photoUrl || '',
      womensPhotoUrl: dc.womensPhotoUrl || dc.photoUrl || '',
      specialInstructions: dc.specialInstructions || '',
    });
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Shirt className="w-5 h-5" />
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Sunday Dress Code & Outfit Planner
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official uniform colour themes with distinct Men's and Women's photographic styling guides and linked service rosters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(canManageUniforms || isHOD) && (
            <button
              onClick={() => onNavigateToUniformWorkspace && onNavigateToUniformWorkspace()}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md cursor-pointer"
            >
              <Shirt className="w-4 h-4" />
              Uniform Leader Dashboard
            </button>
          )}

          {canManageMembers && (
            <button
              onClick={() => {
                setEditingCode(null);
                setFormData({
                  sundayDate: nextSundayStr,
                  themeTitle: '',
                  primaryColors: ['#1D4ED8', '#FFFFFF'],
                  description: '',
                  mensPhotoUrl: '',
                  womensPhotoUrl: '',
                  specialInstructions: 'Department lapel pin compulsory for all members serving on duty.',
                });
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Quick Schedule
            </button>
          )}
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Print Guide
          </button>
        </div>
      </div>

      {/* Dress Codes Cards List */}
      {displayedDressCodes.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Shirt className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            No Published Dress Code Found
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            The dress code for the upcoming Sunday has not been published yet. Please check back soon.
          </p>
          {(canManageUniforms || isHOD) && (
            <button
              onClick={() => onNavigateToUniformWorkspace && onNavigateToUniformWorkspace()}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 cursor-pointer"
            >
              <Shirt className="w-4 h-4" />
              Open Uniform Leader Workspace to Create Schedule
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedDressCodes.map((dc) => {
            const isUpcomingSunday = dc.sundayDate === nextSundayStr;
            const mensPhoto = dc.mensPhotoUrl || dc.photoUrl;
            const womensPhoto = dc.womensPhotoUrl || dc.photoUrl;

            return (
              <div
                key={dc.id}
                className={`rounded-2xl transition-all overflow-hidden flex flex-col justify-between ${
                  isUpcomingSunday
                    ? 'card-shimmer-border glow-blue shadow-md'
                    : 'card-gradient-border shadow-xs hover:shadow-md'
                }`}
              >
                <div>
                  {/* Header Badge */}
                  <div className="p-4 pb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-xs font-bold text-blue-900">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      {formatDate(dc.sundayDate)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {dc.status && (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            dc.status === 'Published'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : dc.status === 'Draft'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {dc.status}
                        </span>
                      )}
                      {isUpcomingSunday && (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-600 text-white shadow-xs">
                          THIS SUNDAY
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="px-4 pb-2">
                    <h3 className="text-base font-bold text-slate-900">{dc.themeTitle}</h3>
                  </div>

                  {/* Separate Men's & Women's Outfit Photos Side-by-Side */}
                  <div className="p-4 pt-1 grid grid-cols-2 gap-2.5">
                    {/* Men's Outfit */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-blue-700 uppercase tracking-wider block">
                        👔 Men's Outfit
                      </span>
                      <div
                        onClick={() =>
                          mensPhoto &&
                          setSelectedPhotoPreview({ url: mensPhoto, title: `${dc.themeTitle} — Men's Style` })
                        }
                        className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                      >
                        {mensPhoto ? (
                          <>
                            <img
                              src={mensPhoto}
                              alt="Men's outfit"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              <Eye className="w-4 h-4 mr-1" /> View
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            No Photo
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Women's Outfit */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-black text-pink-700 uppercase tracking-wider block">
                        👗 Women's Outfit
                      </span>
                      <div
                        onClick={() =>
                          womensPhoto &&
                          setSelectedPhotoPreview({ url: womensPhoto, title: `${dc.themeTitle} — Women's Style` })
                        }
                        className="relative aspect-[3/4] w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 cursor-pointer group"
                      >
                        {womensPhoto ? (
                          <>
                            <img
                              src={womensPhoto}
                              alt="Women's outfit"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                              <Eye className="w-4 h-4 mr-1" /> View
                            </div>
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            No Photo
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-4 pb-4 space-y-3">
                    <p className="text-xs text-slate-600 leading-relaxed">{dc.description}</p>

                    {/* Nigerian Church Outfit Details */}
                    {dc.mensOutfit && (
                      <div className="p-2 rounded-lg bg-blue-50/50 text-[11px] text-slate-700">
                        <strong className="text-blue-800">👔 Men: </strong>
                        {dc.mensOutfit}
                      </div>
                    )}
                    {dc.womensOutfit && (
                      <div className="p-2 rounded-lg bg-pink-50/50 text-[11px] text-slate-700">
                        <strong className="text-pink-800">👗 Women: </strong>
                        {dc.womensOutfit}
                      </div>
                    )}

                    {/* Swatches */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-400">Palette:</span>
                      <div className="flex items-center gap-1.5">
                        {dc.primaryColors.map((col, idx) => (
                          <span
                            key={idx}
                            className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: col }}
                            title={col}
                          />
                        ))}
                      </div>
                    </div>

                    {(dc.accessories || dc.footwear) && (
                      <div className="pt-1 text-[11px] text-slate-500 space-y-0.5">
                        {dc.accessories && <div><span className="font-semibold text-slate-700">Accessories: </span>{dc.accessories}</div>}
                        {dc.footwear && <div><span className="font-semibold text-slate-700">Footwear: </span>{dc.footwear}</div>}
                      </div>
                    )}

                    {dc.specialInstructions && (
                      <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-[11px] text-blue-900">
                        <strong>Instructions:</strong> {dc.specialInstructions}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2 pt-3">
                  {onNavigateToRoster && (
                    <button
                      onClick={onNavigateToRoster}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      View Service Roster <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {canManageMembers && (
                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => handleEditClick(dc)}
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Edit Dress Code"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove dress code for ${dc.sundayDate}?`)) {
                            deleteDressCode(dc.id);
                          }
                        }}
                        className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                        title="Delete Dress Code"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FULL PHOTO PREVIEW MODAL */}
      {selectedPhotoPreview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-xs cursor-pointer"
          onClick={() => setSelectedPhotoPreview(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3.5 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {selectedPhotoPreview.title}
              </h4>
              <button
                onClick={() => setSelectedPhotoPreview(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="max-h-[75vh] overflow-hidden flex items-center justify-center bg-slate-950">
              <img
                src={selectedPhotoPreview.url}
                alt={selectedPhotoPreview.title}
                className="w-full h-auto max-h-[75vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* ADD/EDIT DRESS CODE MODAL WITH DUAL MOBILE CAMERA UPLOAD */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {editingCode ? 'Edit Sunday Dress Code' : 'Schedule Sunday Dress Code'}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sunday Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.sundayDate}
                    onChange={(e) => setFormData({ ...formData, sundayDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Theme Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Royal Navy & White"
                    value={formData.themeTitle}
                    onChange={(e) => setFormData({ ...formData, themeTitle: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                  />
                </div>
              </div>

              {/* Color Palette Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Outfit Palette Colors (Up to 5)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 p-0.5"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    className="px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                  >
                    Add Color Swatch
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {formData.primaryColors.map((color, idx) => (
                    <div
                      key={idx}
                      className="group relative flex items-center justify-center"
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-slate-300 shadow-2xs"
                        style={{ backgroundColor: color }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Men's Outfit Image Upload (Mobile Camera/Gallery) */}
              <ImageUploadInput
                label="Men's Outfit Image Example"
                value={formData.mensPhotoUrl}
                onChange={(dataUrl) => setFormData({ ...formData, mensPhotoUrl: dataUrl })}
                aspectRatioHint="Portrait (3:4)"
                placeholderText="Upload Men's outfit photo from camera or gallery"
              />

              {/* Women's Outfit Image Upload (Mobile Camera/Gallery) */}
              <ImageUploadInput
                label="Women's Outfit Image Example"
                value={formData.womensPhotoUrl}
                onChange={(dataUrl) => setFormData({ ...formData, womensPhotoUrl: dataUrl })}
                aspectRatioHint="Portrait (3:4)"
                placeholderText="Upload Women's outfit photo from camera or gallery"
              />

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Styling Description *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Men: Deep navy suit with white shirt... Women: Royal blue corporate dress..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Special Notes / Instructions
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lapel pin compulsory for all members serving on duty"
                  value={formData.specialInstructions}
                  onChange={(e) =>
                    setFormData({ ...formData, specialInstructions: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md cursor-pointer"
                >
                  Save Dress Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT SCHEDULE MODAL */}
      {isPrintModalOpen && (
        <PrintModal
          isOpen={true}
          onClose={() => setIsPrintModalOpen(false)}
          title="Dominion City Asaba — Departmental Sunday Dress Code Schedule"
          subtitle="Official Front Desk Corporate Attire & Palette Specifications"
        >
          <div className="space-y-6 text-xs">
            {sortedDressCodes.map((dc) => (
              <div
                key={dc.id}
                className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900">{dc.themeTitle}</h4>
                  <span className="font-bold text-blue-900">{formatDate(dc.sundayDate)}</span>
                </div>
                <p className="text-slate-600">{dc.description}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="font-semibold text-slate-500">Colors:</span>
                  <div className="flex items-center gap-1.5">
                    {dc.primaryColors.map((c, idx) => (
                      <span
                        key={idx}
                        className="w-4 h-4 rounded-full border border-slate-400"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
                {dc.specialInstructions && (
                  <p className="text-[11px] text-blue-900 italic">
                    <strong>Note:</strong> {dc.specialInstructions}
                  </p>
                )}
              </div>
            ))}
          </div>
        </PrintModal>
      )}
    </div>
  );
};
