import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { DressCode, DressCodeStatus } from '../../types/models';
import { formatDate, getNextSunday } from '../../utils/dateUtils';
import {
  generateOutfitPlanForSundays,
  getSundaysInMonth,
  NIGERIAN_CHURCH_STYLES,
} from '../../utils/outfitGenerator';
import { ImageUploadInput } from '../common/ImageUploadInput';
import { PrintModal } from '../common/PrintModal';
import {
  Shirt,
  Plus,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
  Trash2,
  Edit2,
  Eye,
  Send,
  ArrowLeft,
  X,
  Palette,
  Check,
  AlertCircle,
  HelpCircle,
  RefreshCw,
  Printer,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface UniformLeaderDashboardProps {
  onReturnToGeneral?: () => void;
  onNavigateToRoster?: () => void;
}

export const UniformLeaderDashboard: React.FC<UniformLeaderDashboardProps> = ({
  onReturnToGeneral,
  onNavigateToRoster,
}) => {
  const { currentUser, canManageUniforms, isHOD } = useAuth();
  const { dressCodes, addDressCode, updateDressCode, deleteDressCode, publishDressCode, archiveDressCode } = useData();

  // Active view filters
  const [filterStatus, setFilterStatus] = useState<'All' | DressCodeStatus>('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<DressCode | null>(null);
  const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
  const [previewCode, setPreviewCode] = useState<DressCode | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  // Generator State
  const today = new Date();
  const [genYear, setGenYear] = useState<number>(today.getFullYear());
  const [genMonth, setGenMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [generatedDrafts, setGeneratedDrafts] = useState<Omit<DressCode, 'id' | 'createdAt' | 'updatedAt'>[]>([]);

  // Editor Form State
  const nextSunday = getNextSunday(today);
  const nextSundayStr = nextSunday.toISOString().split('T')[0];

  const [formData, setFormData] = useState<{
    sundayDate: string;
    themeTitle: string;
    primaryColors: string[];
    description: string;
    mensOutfit: string;
    womensOutfit: string;
    accessories: string;
    footwear: string;
    specialInstructions: string;
    mensPhotoUrl: string;
    womensPhotoUrl: string;
    status: DressCodeStatus;
  }>({
    sundayDate: nextSundayStr,
    themeTitle: '',
    primaryColors: ['#1D4ED8', '#FFFFFF', '#0B192C'],
    description: '',
    mensOutfit: '',
    womensOutfit: '',
    accessories: 'Silver wristwatch, departmental lapel pin, neat dark leather belt.',
    footwear: 'Polished black oxford shoes or modest dark heels (maximum 2-3 inches for comfort).',
    specialInstructions: 'Departmental identification lapel pin is compulsory for all members on duty.',
    mensPhotoUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80',
    womensPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
    status: 'Published',
  });

  const [colorInput, setColorInput] = useState('#1D4ED8');

  // Trigger temporary notification toast
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setActionNotice({ type, message });
    setTimeout(() => setActionNotice(null), 4000);
  };

  // Sorted and filtered schedules
  const sortedCodes = [...dressCodes].sort(
    (a, b) => new Date(b.sundayDate).getTime() - new Date(a.sundayDate).getTime()
  );

  const filteredCodes = sortedCodes.filter((dc) => {
    const codeStatus = dc.status || 'Published';
    const matchesStatus = filterStatus === 'All' || codeStatus === filterStatus;
    const matchesSearch =
      !searchQuery ||
      dc.themeTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dc.sundayDate.includes(searchQuery) ||
      dc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Open modal for new dress code
  const handleOpenCreateModal = () => {
    setEditingCode(null);
    setFormData({
      sundayDate: nextSundayStr,
      themeTitle: '',
      primaryColors: ['#1D4ED8', '#FFFFFF', '#0B192C'],
      description: '',
      mensOutfit: '',
      womensOutfit: '',
      accessories: 'Silver wristwatch, departmental lapel pin, neat dark leather belt.',
      footwear: 'Polished black oxford shoes or modest dark heels (maximum 2-3 inches for comfort).',
      specialInstructions: 'Departmental identification lapel pin is compulsory for all members on duty.',
      mensPhotoUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&auto=format&fit=crop&q=80',
      womensPhotoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop&q=80',
      status: 'Published',
    });
    setIsEditorOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (dc: DressCode) => {
    setEditingCode(dc);
    setFormData({
      sundayDate: dc.sundayDate,
      themeTitle: dc.themeTitle,
      primaryColors: dc.primaryColors || ['#1D4ED8', '#FFFFFF'],
      description: dc.description,
      mensOutfit: dc.mensOutfit || '',
      womensOutfit: dc.womensOutfit || '',
      accessories: dc.accessories || '',
      footwear: dc.footwear || '',
      specialInstructions: dc.specialInstructions || '',
      mensPhotoUrl: dc.mensPhotoUrl || dc.photoUrl || '',
      womensPhotoUrl: dc.womensPhotoUrl || dc.photoUrl || '',
      status: dc.status || 'Published',
    });
    setIsEditorOpen(true);
  };

  // Add/remove colors in editor
  const handleAddColor = () => {
    if (formData.primaryColors.length < 5 && !formData.primaryColors.includes(colorInput)) {
      setFormData({
        ...formData,
        primaryColors: [...formData.primaryColors, colorInput],
      });
    }
  };

  const handleRemoveColor = (index: number) => {
    setFormData({
      ...formData,
      primaryColors: formData.primaryColors.filter((_, i) => i !== index),
    });
  };

  // Form submit (Save Draft or Publish)
  const handleSaveSchedule = (targetStatus: DressCodeStatus) => {
    if (!formData.sundayDate || !formData.themeTitle) {
      alert('Please fill out the Sunday Date and Theme Title.');
      return;
    }

    const payload = {
      ...formData,
      status: targetStatus,
      photoUrl: formData.mensPhotoUrl || formData.womensPhotoUrl || '',
    };

    if (editingCode) {
      updateDressCode(editingCode.id, payload);
      showToast(
        targetStatus === 'Published'
          ? `Sunday Dress Code for ${formatDate(formData.sundayDate)} updated and published to members!`
          : `Schedule for ${formatDate(formData.sundayDate)} saved as draft.`
      );
    } else {
      addDressCode(payload);
      showToast(
        targetStatus === 'Published'
          ? `New Sunday Dress Code published! Members can now see it on their dashboard.`
          : `New outfit plan saved as private draft.`
      );
    }

    setIsEditorOpen(false);
  };

  // Quick Publish toggle
  const handleQuickPublish = (dc: DressCode) => {
    publishDressCode(dc.id);
    showToast(`Dress Code for ${formatDate(dc.sundayDate)} published to the main dashboard!`);
  };

  // Quick Archive toggle
  const handleQuickArchive = (dc: DressCode) => {
    archiveDressCode(dc.id);
    showToast(`Dress Code for ${formatDate(dc.sundayDate)} moved to archives.`, 'info');
  };

  // Delete with confirmation
  const handleConfirmDelete = (id: string) => {
    deleteDressCode(id);
    setDeleteConfirmationId(null);
    showToast('Schedule deleted successfully.', 'info');
  };

  // Generator trigger
  const handleGenerateClick = () => {
    const sundays = getSundaysInMonth(genYear, genMonth);
    const drafts = generateOutfitPlanForSundays(sundays, dressCodes);
    setGeneratedDrafts(drafts);
    setIsGeneratorOpen(true);
  };

  // Regenerate a single Sunday in generator
  const handleRegenerateSingleSunday = (index: number) => {
    const randomIndex = Math.floor(Math.random() * NIGERIAN_CHURCH_STYLES.length);
    const newStyle = NIGERIAN_CHURCH_STYLES[randomIndex];
    setGeneratedDrafts((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              themeTitle: newStyle.themeTitle,
              primaryColors: newStyle.primaryColors,
              description: newStyle.description,
              mensOutfit: newStyle.mensOutfit,
              womensOutfit: newStyle.womensOutfit,
              accessories: newStyle.accessories,
              footwear: newStyle.footwear,
              photoUrl: newStyle.mensPhotoUrl,
              mensPhotoUrl: newStyle.mensPhotoUrl,
              womensPhotoUrl: newStyle.womensPhotoUrl,
            }
          : item
      )
    );
  };

  // Save generated drafts to system
  const handleSaveGeneratedPlans = (publishDirectly: boolean) => {
    generatedDrafts.forEach((draft) => {
      // Check if this Sunday date already exists
      const existing = dressCodes.find((d) => d.sundayDate === draft.sundayDate);
      if (existing) {
        updateDressCode(existing.id, {
          ...draft,
          status: publishDirectly ? 'Published' : 'Draft',
        });
      } else {
        addDressCode({
          ...draft,
          status: publishDirectly ? 'Published' : 'Draft',
        });
      }
    });

    setIsGeneratorOpen(false);
    showToast(
      publishDirectly
        ? `Generated outfit plan published for ${generatedDrafts.length} Sundays!`
        : `Generated ${generatedDrafts.length} Sunday outfit plans saved as private drafts.`
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Workspace Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#0E1E38] via-[#122A5E] to-[#1E3A8A] text-white p-5 sm:p-6 rounded-2xl shadow-lg card-shimmer-border glow-blue">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-rose-500/30 text-rose-300 border border-rose-400/30 glow-dot-blue">
              <Shirt className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold tracking-wide uppercase text-rose-300">
              Private Management Workspace
            </span>
            <span className="text-[11px] text-blue-200">• Dominion City Asaba</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Uniform Leader Dashboard & Outfit Planner
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/90 mt-1 max-w-2xl leading-relaxed">
            Create, generate, preview, and publish weekly Sunday uniform dress codes tailored to Nigerian church culture. Published schedules immediately reflect on the member dashboard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onReturnToGeneral && (
            <button
              onClick={onReturnToGeneral}
              className="btn-compact bg-white/10 hover:bg-white/20 text-white border border-white/20 glow-blue-hover"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>General Dashboard</span>
            </button>
          )}

          <button
            onClick={handleGenerateClick}
            className="btn-compact btn-glow-amber"
            title="Automatically generate Nigerian church outfits for an entire month"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Generate New Outfit Plan</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="btn-compact btn-glow-pink"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create New Dress Code</span>
          </button>
        </div>
      </div>

      {/* Action Toast Alert */}
      {actionNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold animate-in slide-in-from-top-2 ${
            actionNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{actionNotice.message}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Schedules
            </span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {dressCodes.length}
          </p>
          <span className="text-[11px] text-slate-400">Sunday outfit records</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Published Live
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-600 mt-2">
            {dressCodes.filter((d) => (d.status || 'Published') === 'Published').length}
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Visible to all members</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
              Drafts in Progress
            </span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-600 mt-2">
            {dressCodes.filter((d) => d.status === 'Draft').length}
          </p>
          <span className="text-[11px] text-amber-600 font-medium">Private to Uniform Leader</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600">
              Archived
            </span>
            <Archive className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-black text-purple-600 mt-2">
            {dressCodes.filter((d) => d.status === 'Archived').length}
          </p>
          <span className="text-[11px] text-purple-500 font-medium">Past Sunday records</span>
        </div>
      </div>

      {/* 3. Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0E172B] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(['All', 'Published', 'Draft', 'Archived'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 ${
                filterStatus === st
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {st}
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">
                {st === 'All'
                  ? dressCodes.length
                  : dressCodes.filter((d) => (d.status || 'Published') === st).length}
              </span>
            </button>
          ))}
        </div>

        {/* Search input & print */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search dress codes by date or title..."
              className="w-full pl-3 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-rose-500"
            />
          </div>
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Print schedule list"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4. Schedules List */}
      <div className="space-y-4">
        {filteredCodes.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <Shirt className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
              No Dress Code Schedules Found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              There are no dress codes matching this filter. Click "Create New Dress Code" or use "Generate New Outfit Plan" to plan accessible Nigerian church attire.
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Schedule</span>
            </button>
          </div>
        ) : (
          filteredCodes.map((dc) => {
            const isPublished = (dc.status || 'Published') === 'Published';
            const isDraft = dc.status === 'Draft';
            const isArchived = dc.status === 'Archived';

            return (
              <div
                key={dc.id}
                className={`rounded-2xl p-5 shadow-xs transition-all space-y-4 ${
                  isPublished
                    ? 'card-gradient-border-emerald glow-emerald-hover'
                    : isDraft
                    ? 'card-gradient-border-amber glow-amber-hover'
                    : 'card-gradient-border glow-blue-hover'
                }`}
              >
                {/* Header row: Date, Theme, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-black tracking-wide border border-blue-200 dark:border-blue-800">
                      📅 {formatDate(dc.sundayDate)}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {dc.themeTitle}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status badge */}
                    {isPublished && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Published to Members
                      </span>
                    )}
                    {isDraft && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-600" />
                        Private Draft
                      </span>
                    )}
                    {isArchived && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                        <Archive className="w-3 h-3 text-slate-500" />
                        Archived
                      </span>
                    )}

                    {/* Color palette dots */}
                    <div className="flex items-center gap-1 pl-2 border-l border-slate-200 dark:border-slate-700">
                      {dc.primaryColors.map((col, idx) => (
                        <span
                          key={idx}
                          className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-600 shadow-2xs"
                          style={{ backgroundColor: col }}
                          title={col}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Body: Men's & Women's Nigerian Outfits + Photos */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Photo thumbnails */}
                  <div className="md:col-span-4 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider block">
                        👔 Men's Style
                      </span>
                      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <img
                          src={dc.mensPhotoUrl || dc.photoUrl}
                          alt="Men's outfit preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-pink-700 dark:text-pink-400 uppercase tracking-wider block">
                        👗 Women's Style
                      </span>
                      <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <img
                          src={dc.womensPhotoUrl || dc.photoUrl}
                          alt="Women's outfit preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Outfit description & instructions */}
                  <div className="md:col-span-8 space-y-2.5 flex flex-col justify-between">
                    <div className="space-y-2">
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                        {dc.description}
                      </p>

                      {/* Detailed Nigerian Outfit breakdown */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {dc.mensOutfit && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block mb-0.5">
                              Suggested Men's Attire:
                            </span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                              {dc.mensOutfit}
                            </p>
                          </div>
                        )}

                        {dc.womensOutfit && (
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#07132B] border border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wider block mb-0.5">
                              Suggested Women's Attire:
                            </span>
                            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                              {dc.womensOutfit}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Footwear & Instructions */}
                      {(dc.footwear || dc.specialInstructions) && (
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                          {dc.footwear && (
                            <span>
                              👞 <strong>Footwear:</strong> {dc.footwear}
                            </span>
                          )}
                          {dc.specialInstructions && (
                            <span>
                              📌 <strong>Protocol:</strong> {dc.specialInstructions}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Operational Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2">
                        {/* Preview Schedule */}
                        <button
                          onClick={() => setPreviewCode(dc)}
                          className="btn-compact bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Preview</span>
                        </button>

                        {/* Edit Schedule */}
                        <button
                          onClick={() => handleOpenEditModal(dc)}
                          className="btn-compact bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                          <span>Edit</span>
                        </button>

                        {/* Delete Confirmation */}
                        {deleteConfirmationId === dc.id ? (
                          <div className="flex items-center gap-1.5 p-1 bg-rose-50 dark:bg-rose-950/60 rounded-lg border border-rose-200 dark:border-rose-800">
                            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300">
                              Confirm delete?
                            </span>
                            <button
                              onClick={() => handleConfirmDelete(dc.id)}
                              className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold cursor-pointer"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirmationId(null)}
                              className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-bold cursor-pointer"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmationId(dc.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                            title="Delete schedule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* State transitions: Publish vs Draft vs Archive */}
                      <div className="flex items-center gap-2">
                        {isDraft && (
                          <button
                            onClick={() => handleQuickPublish(dc)}
                            className="btn-compact btn-glow-emerald"
                          >
                            <Send className="w-3 h-3" />
                            <span>Publish Schedule</span>
                          </button>
                        )}

                        {isPublished && (
                          <button
                            onClick={() => handleQuickArchive(dc)}
                            className="btn-compact bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>Archive</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 5. MODAL: Create / Edit Dress Code */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-rose-900 to-[#1E3A8A] text-white">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-rose-300" />
                <h3 className="text-base font-bold text-white">
                  {editingCode ? 'Edit Dress Code Schedule' : 'Create New Sunday Dress Code'}
                </h3>
              </div>
              <button
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-300 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Sunday Date *
                  </label>
                  <input
                    type="date"
                    value={formData.sundayDate}
                    onChange={(e) => setFormData({ ...formData, sundayDate: e.target.value })}
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Theme Title *
                  </label>
                  <input
                    type="text"
                    value={formData.themeTitle}
                    onChange={(e) => setFormData({ ...formData, themeTitle: e.target.value })}
                    placeholder="e.g. Corporate Royal Blue & Crisp White"
                    required
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Color swatches selector */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  Approved Color Palette (Up to 5)
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="color"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                  />
                  <input
                    type="text"
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    className="w-24 px-2 py-1 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddColor}
                    disabled={formData.primaryColors.length >= 5}
                    className="px-3 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-500 cursor-pointer disabled:opacity-50"
                  >
                    Add Color
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {formData.primaryColors.map((color, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] font-mono text-slate-700 dark:text-slate-300">
                        {color}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveColor(idx)}
                        className="text-slate-400 hover:text-rose-600 text-[10px] cursor-pointer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* General Description */}
              <div>
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  General Styling Summary *
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of the theme and styling guidelines..."
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              {/* Nigerian Attire Breakdown: Men & Women */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-blue-700 dark:text-blue-400 block mb-1">
                    👔 Men's Outfit Suggestion (Nigerian Church Style)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.mensOutfit}
                    onChange={(e) => setFormData({ ...formData, mensOutfit: e.target.value })}
                    placeholder="e.g. Senator-style navy native kaftan with cream accent, or navy suit with white shirt and blue tie..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-pink-700 dark:text-pink-400 block mb-1">
                    👗 Women's Outfit Suggestion (Nigerian Church Style)
                  </label>
                  <textarea
                    rows={3}
                    value={formData.womensOutfit}
                    onChange={(e) => setFormData({ ...formData, womensOutfit: e.target.value })}
                    placeholder="e.g. Modest royal blue A-line midi gown with white chiffon collar, or elegant Ankara peplum skirt suit..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Accessories & Footwear */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Accessories & Pins
                  </label>
                  <input
                    type="text"
                    value={formData.accessories}
                    onChange={(e) => setFormData({ ...formData, accessories: e.target.value })}
                    placeholder="e.g. Departmental lapel badge, silver cufflinks..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    Footwear Guidelines
                  </label>
                  <input
                    type="text"
                    value={formData.footwear}
                    onChange={(e) => setFormData({ ...formData, footwear: e.target.value })}
                    placeholder="e.g. Polished black oxfords or modest dark 2-inch court shoes..."
                    className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#07132B] border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Image Upload Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <ImageUploadInput
                    label="Men's Outfit Image URL"
                    value={formData.mensPhotoUrl}
                    onChange={(url) => setFormData({ ...formData, mensPhotoUrl: url })}
                    placeholderText="Tap to take a photo or upload men's outfit..."
                  />
                </div>
                <div>
                  <ImageUploadInput
                    label="Women's Outfit Image URL"
                    value={formData.womensPhotoUrl}
                    onChange={(url) => setFormData({ ...formData, womensPhotoUrl: url })}
                    placeholderText="Tap to take a photo or upload women's outfit..."
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#070F1E] border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveSchedule('Draft')}
                  className="px-3.5 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900 rounded-xl cursor-pointer transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveSchedule('Published')}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Publish Schedule</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Smart Nigerian Church Outfit Plan Generator */}
      {isGeneratorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-3xl bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-600 via-orange-600 to-rose-700 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-200" />
                <div>
                  <h3 className="text-base font-bold text-white">
                    Smart Nigerian Church Outfit Plan Generator
                  </h3>
                  <p className="text-[11px] text-amber-100">
                    Rule-based generator matching affordable Nigerian attire and color combinations without repetition.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsGeneratorOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Controls */}
            <div className="p-4 bg-slate-50 dark:bg-[#07132B] border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Month
                  </label>
                  <select
                    value={genMonth}
                    onChange={(e) => {
                      const m = parseInt(e.target.value);
                      setGenMonth(m);
                      const suns = getSundaysInMonth(genYear, m);
                      setGeneratedDrafts(generateOutfitPlanForSundays(suns, dressCodes));
                    }}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-[#0E172B] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  >
                    {monthNames.map((mn, idx) => (
                      <option key={idx} value={idx}>
                        {mn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Year
                  </label>
                  <select
                    value={genYear}
                    onChange={(e) => {
                      const y = parseInt(e.target.value);
                      setGenYear(y);
                      const suns = getSundaysInMonth(y, genMonth);
                      setGeneratedDrafts(generateOutfitPlanForSundays(suns, dressCodes));
                    }}
                    className="px-2.5 py-1 text-xs bg-white dark:bg-[#0E172B] border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-bold"
                  >
                    {[2026, 2027].map((yr) => (
                      <option key={yr} value={yr}>
                        {yr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-3">
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Generated <strong>{generatedDrafts.length} Sundays</strong> for {monthNames[genMonth]} {genYear}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const suns = getSundaysInMonth(genYear, genMonth);
                  setGeneratedDrafts(generateOutfitPlanForSundays(suns, dressCodes));
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Shuffle Month Plan</span>
              </button>
            </div>

            {/* Generated Items List */}
            <div className="p-5 space-y-3.5 overflow-y-auto">
              {generatedDrafts.map((plan, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#07132B] space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-black bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300">
                        Sunday {idx + 1}: {formatDate(plan.sundayDate)}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {plan.themeTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {plan.primaryColors.map((c, i) => (
                          <span
                            key={i}
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRegenerateSingleSunday(idx)}
                        className="px-2 py-1 text-[10px] font-bold rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-1"
                        title="Regenerate this specific Sunday only"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Shuffle</span>
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">{plan.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-lg bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/30">
                      <span className="font-bold text-blue-700 dark:text-blue-400 block mb-0.5">Men:</span>
                      <span className="text-slate-600 dark:text-slate-400">{plan.mensOutfit}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-pink-50/50 dark:bg-pink-950/30 border border-pink-100 dark:border-pink-900/30">
                      <span className="font-bold text-pink-700 dark:text-pink-400 block mb-0.5">Women:</span>
                      <span className="text-slate-600 dark:text-slate-400">{plan.womensOutfit}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Generator Footer */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 dark:bg-[#070F1E] border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsGeneratorOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSaveGeneratedPlans(false)}
                  className="px-4 py-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 rounded-xl cursor-pointer"
                >
                  Save All as Drafts
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveGeneratedPlans(true)}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md cursor-pointer"
                >
                  Publish Month Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL: Preview Schedule (Exact Member View) */}
      {previewCode && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-[#0E172B] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-bold">Public Member View Preview</h3>
              </div>
              <button
                onClick={() => setPreviewCode(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  THIS SUNDAY'S DRESS CODE
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {formatDate(previewCode.sundayDate)}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                {previewCode.themeTitle}
              </h4>

              {/* Photos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-blue-600 uppercase block">👔 Men's Style</span>
                  <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={previewCode.mensPhotoUrl || previewCode.photoUrl}
                      alt="Men's outfit"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-pink-600 uppercase block">👗 Women's Style</span>
                  <div className="aspect-[4/5] rounded-xl overflow-hidden bg-slate-100">
                    <img
                      src={previewCode.womensPhotoUrl || previewCode.photoUrl}
                      alt="Women's outfit"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {previewCode.description}
              </p>

              {/* Color swatches */}
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-500">Palette:</span>
                <div className="flex items-center gap-1.5">
                  {previewCode.primaryColors.map((c, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border border-slate-300 shadow-2xs"
                      style={{ backgroundColor: c }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 dark:bg-[#070F1E] border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setPreviewCode(null)}
                className="px-4 py-1.5 text-xs font-bold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      <PrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title="Dominion City Asaba — Sunday Uniform Dress Code Schedule"
        subtitle={`Official schedule as of ${new Date().toLocaleDateString('en-GB')}`}
      >
        <div className="space-y-4">
          {sortedCodes.map((c) => (
            <div key={c.id} className="p-4 border border-slate-300 rounded-lg space-y-2">
              <div className="flex justify-between items-center font-bold">
                <span>{formatDate(c.sundayDate)}</span>
                <span>{c.themeTitle}</span>
                <span className="text-xs uppercase">({c.status || 'Published'})</span>
              </div>
              <p className="text-xs text-slate-700">{c.description}</p>
              {c.mensOutfit && <p className="text-xs"><strong>Men:</strong> {c.mensOutfit}</p>}
              {c.womensOutfit && <p className="text-xs"><strong>Women:</strong> {c.womensOutfit}</p>}
            </div>
          ))}
        </div>
      </PrintModal>
    </div>
  );
};
