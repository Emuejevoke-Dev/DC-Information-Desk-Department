import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import {
  DepartmentMember,
  BirthdayCelebration,
  BirthdayTheme,
  BirthdayTemplate,
} from '../../types/models';
import { ImageUploadInput } from '../common/ImageUploadInput';
import {
  Cake,
  Sparkles,
  Heart,
  Save,
  Send,
  Eye,
  Trash2,
  Plus,
  Bookmark,
  Palette,
  Image as ImageIcon,
  CheckCircle2,
  X,
  FileText,
  Crown,
  Share2,
} from 'lucide-react';

interface BirthdayCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  celebrant: DepartmentMember | null;
  onCelebrationPublished?: () => void;
}

export const THEME_CONFIGS: Record<
  BirthdayTheme,
  {
    name: string;
    gradient: string;
    cardBg: string;
    textColor: string;
    accentColor: string;
    tagBg: string;
    borderColor: string;
  }
> = {
  gold: {
    name: 'Royal Gold & Amber',
    gradient: 'from-amber-500 via-amber-600 to-yellow-600',
    cardBg: 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-yellow-500/10 dark:from-amber-950/40 dark:to-yellow-950/20',
    textColor: 'text-amber-900 dark:text-amber-200',
    accentColor: 'text-amber-600 dark:text-amber-400',
    tagBg: 'bg-amber-500 text-white shadow-xs',
    borderColor: 'border-amber-300 dark:border-amber-700/60',
  },
  rose: {
    name: 'Rose Elegance',
    gradient: 'from-pink-500 via-rose-500 to-purple-600',
    cardBg: 'bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-purple-500/10 dark:from-pink-950/40 dark:to-purple-950/20',
    textColor: 'text-rose-900 dark:text-rose-200',
    accentColor: 'text-pink-600 dark:text-pink-400',
    tagBg: 'bg-pink-600 text-white shadow-xs',
    borderColor: 'border-pink-300 dark:border-pink-700/60',
  },
  navy: {
    name: 'Celestial Deep Navy',
    gradient: 'from-blue-700 via-indigo-700 to-slate-900',
    cardBg: 'bg-gradient-to-br from-blue-900/15 via-indigo-900/10 to-slate-900/20 dark:from-blue-950/50 dark:to-indigo-950/40',
    textColor: 'text-blue-950 dark:text-blue-100',
    accentColor: 'text-blue-600 dark:text-blue-400',
    tagBg: 'bg-blue-700 text-white shadow-xs',
    borderColor: 'border-blue-300 dark:border-blue-700/60',
  },
  emerald: {
    name: 'Emerald Grace',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    cardBg: 'bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-cyan-500/10 dark:from-emerald-950/40 dark:to-teal-950/20',
    textColor: 'text-emerald-950 dark:text-emerald-200',
    accentColor: 'text-emerald-600 dark:text-emerald-400',
    tagBg: 'bg-emerald-600 text-white shadow-xs',
    borderColor: 'border-emerald-300 dark:border-emerald-700/60',
  },
  sunset: {
    name: 'Vibrant Sunrise',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    cardBg: 'bg-gradient-to-br from-orange-500/10 via-red-500/5 to-pink-500/10 dark:from-orange-950/40 dark:to-pink-950/20',
    textColor: 'text-orange-950 dark:text-orange-200',
    accentColor: 'text-orange-600 dark:text-orange-400',
    tagBg: 'bg-orange-500 text-white shadow-xs',
    borderColor: 'border-orange-300 dark:border-orange-700/60',
  },
  purple: {
    name: 'Purple Royalty & Dominion',
    gradient: 'from-purple-600 via-indigo-600 to-pink-600',
    cardBg: 'bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-pink-500/10 dark:from-purple-950/40 dark:to-pink-950/20',
    textColor: 'text-purple-950 dark:text-purple-200',
    accentColor: 'text-purple-600 dark:text-purple-400',
    tagBg: 'bg-purple-600 text-white shadow-xs',
    borderColor: 'border-purple-300 dark:border-purple-700/60',
  },
};

export const BirthdayCustomizerModal: React.FC<BirthdayCustomizerModalProps> = ({
  isOpen,
  onClose,
  celebrant,
  onCelebrationPublished,
}) => {
  const { currentUser } = useAuth();
  const {
    birthdayCelebrations,
    birthdayTemplates,
    saveBirthdayCelebration,
    saveBirthdayTemplate,
  } = useData();

  // Active form states
  const [greeting, setGreeting] = useState('');
  const [prayers, setPrayers] = useState<string[]>(['']);
  const [theme, setTheme] = useState<BirthdayTheme>('gold');
  const [useCustomPhoto, setUseCustomPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [templateSaveTitle, setTemplateSaveTitle] = useState('');
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);
  const [successFeedback, setSuccessFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');

  // Load existing celebration if already saved, or default template
  useEffect(() => {
    if (!celebrant) return;

    const existing = birthdayCelebrations.find((c) => c.memberId === celebrant.id);
    if (existing) {
      setGreeting(existing.greeting);
      setPrayers(existing.prayers && existing.prayers.length > 0 ? existing.prayers : ['']);
      setTheme(existing.theme || 'gold');
      setPhotoUrl(existing.photoUrl || celebrant.photoUrl);
      setUseCustomPhoto(Boolean(existing.photoUrl && existing.photoUrl !== celebrant.photoUrl));
      setCaption(existing.caption || 'Honoring our dedicated minister on their special day!');
    } else {
      // Pick first template or fallback
      const defaultTmpl = birthdayTemplates[0];
      const defaultGreeting = defaultTmpl
        ? defaultTmpl.greeting.replace('Happy Birthday', `Happy Birthday ${celebrant.fullName}`)
        : `Happy Glorious Birthday, ${celebrant.fullName}! May God crown your new year with glory, favor, and extraordinary grace!`;

      setGreeting(defaultGreeting);
      setPrayers(
        defaultTmpl
          ? defaultTmpl.prayers
          : [
              'May the Lord crown your new age with exceptional grace, divine honor, and supernatural wisdom.',
              'Lines are fallen unto you in pleasant places; you shall walk in undisputable victory and peace.',
              'May every door opened for you remain permanent, and may your light shine brighter and brighter.',
            ]
      );
      setTheme(defaultTmpl ? defaultTmpl.theme : 'gold');
      setPhotoUrl(celebrant.photoUrl);
      setUseCustomPhoto(false);
      setCaption(`Dominion City Asaba Information Desk honors ${celebrant.fullName}!`);
    }
  }, [celebrant, birthdayCelebrations, birthdayTemplates]);

  if (!isOpen || !celebrant) return null;

  const currentTheme = THEME_CONFIGS[theme];
  const effectivePhoto = useCustomPhoto && photoUrl.trim() ? photoUrl : celebrant.photoUrl;

  const handleAddPrayer = () => {
    setPrayers([...prayers, '']);
  };

  const handleUpdatePrayer = (idx: number, text: string) => {
    const updated = [...prayers];
    updated[idx] = text;
    setPrayers(updated);
  };

  const handleRemovePrayer = (idx: number) => {
    if (prayers.length <= 1) {
      setPrayers(['']);
      return;
    }
    setPrayers(prayers.filter((_, i) => i !== idx));
  };

  const handleApplyTemplate = (tmpl: BirthdayTemplate) => {
    setGreeting(tmpl.greeting.replace('Happy Birthday', `Happy Birthday ${celebrant.fullName}`));
    setPrayers([...tmpl.prayers]);
    setTheme(tmpl.theme);
    setCaption(tmpl.caption);
    setSuccessFeedback(`Applied template "${tmpl.title}"!`);
    setTimeout(() => setSuccessFeedback(null), 3000);
  };

  const handleSaveAsNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateSaveTitle.trim()) return;

    saveBirthdayTemplate({
      title: templateSaveTitle.trim(),
      greeting,
      prayers: prayers.filter((p) => p.trim().length > 0),
      theme,
      caption,
    });

    setTemplateSaveTitle('');
    setIsSavingTemplate(false);
    setSuccessFeedback('Custom message template saved for future use!');
    setTimeout(() => setSuccessFeedback(null), 3000);
  };

  const handlePublishCelebration = () => {
    const cleanPrayers = prayers.filter((p) => p.trim().length > 0);
    const effectivePrayers = cleanPrayers.length > 0
      ? cleanPrayers
      : ['May God crown your new year with glory, favor, and extraordinary grace!'];

    saveBirthdayCelebration({
      memberId: celebrant.id,
      celebrantName: celebrant.fullName,
      birthdayDate: `${String(celebrant.birthMonth).padStart(2, '0')}-${String(celebrant.birthDay).padStart(2, '0')}`,
      greeting: greeting.trim() || `Happy Birthday ${celebrant.fullName}!`,
      prayers: effectivePrayers,
      theme,
      photoUrl: effectivePhoto,
      caption: caption.trim() || `Celebrating ${celebrant.fullName}`,
      isPublished: true,
      publishedAt: new Date().toISOString(),
      publishedBy: currentUser.name,
    });

    setSuccessFeedback('Celebration post successfully published and updated across the portal!');
    if (onCelebrationPublished) onCelebrationPublished();
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#0B1528] rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081020]">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-2.5 rounded-xl bg-pink-100 text-pink-700 dark:bg-pink-950/80 dark:text-pink-300 shrink-0">
              <Cake className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate">
                Customise Birthday Celebration — {celebrant.fullName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                Tailor birthday greeting, prayer points, visual styling & photograph
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex bg-slate-200 dark:bg-slate-800 p-0.5 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === 'editor'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Customiser
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('preview')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                  activeTab === 'preview'
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Live Preview
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {successFeedback && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successFeedback}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 custom-scrollbar">
          {activeTab === 'editor' ? (
            <div className="space-y-6">
              {/* Template Selector Bar */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-pink-600" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Message & Prayer Templates
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsSavingTemplate(!isSavingTemplate)}
                    className="text-xs font-bold text-pink-600 hover:text-pink-700 dark:text-pink-400 flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {isSavingTemplate ? 'Cancel Save' : 'Save Current as Template'}
                  </button>
                </div>

                {isSavingTemplate && (
                  <form
                    onSubmit={handleSaveAsNewTemplate}
                    className="mt-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-pink-200 dark:border-pink-900/50 flex gap-2 items-center"
                  >
                    <input
                      type="text"
                      value={templateSaveTitle}
                      onChange={(e) => setTemplateSaveTitle(e.target.value)}
                      placeholder="Template title (e.g. Supernatural Favor & Wisdom)"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                    />
                    <button
                      type="submit"
                      disabled={!templateSaveTitle.trim()}
                      className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Save Template
                    </button>
                  </form>
                )}

                <div className="flex flex-wrap gap-2 mt-2">
                  {birthdayTemplates.map((tmpl) => (
                    <button
                      key={tmpl.id}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-pink-400 hover:bg-pink-50/50 dark:hover:bg-pink-950/30 text-slate-700 dark:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>{tmpl.title}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme & Visual Style Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-blue-500" />
                  Presentation Theme & Colour Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {(Object.keys(THEME_CONFIGS) as BirthdayTheme[]).map((thmKey) => {
                    const thm = THEME_CONFIGS[thmKey];
                    const isSelected = theme === thmKey;
                    return (
                      <button
                        key={thmKey}
                        type="button"
                        onClick={() => setTheme(thmKey)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md bg-blue-50/30 dark:bg-blue-950/30'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-full bg-gradient-to-tr ${thm.gradient} shrink-0 shadow-xs`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {thm.name}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {isSelected ? 'Active Theme' : 'Select'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Celebrant Photo Choice */}
              <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-purple-500" />
                    Celebrant Photograph
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setUseCustomPhoto(false)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        !useCustomPhoto
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Use Profile Picture
                    </button>
                    <button
                      type="button"
                      onClick={() => setUseCustomPhoto(true)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        useCustomPhoto
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Upload Birthday Photo
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <img
                    src={effectivePhoto}
                    alt={celebrant.fullName}
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-purple-200 dark:ring-purple-900 shadow-md shrink-0"
                  />
                  <div className="flex-1">
                    {useCustomPhoto ? (
                      <ImageUploadInput
                        value={photoUrl}
                        onChange={(url) => setPhotoUrl(url)}
                        label="Upload Celebrant Birthday Portrait (JPEG, PNG, WebP)"
                      />
                    ) : (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Using official directory profile photo for{' '}
                        <strong>{celebrant.fullName}</strong>.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Customisable Birthday Greeting Write-up */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-pink-600" />
                  Birthday Greeting & Message
                </label>
                <textarea
                  rows={3}
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  placeholder="Enter personalized birthday greeting..."
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Flexible Birthday Prayers (Dynamic multi-point editor) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    Prophetic Prayers & Declarations ({prayers.length} Points)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPrayer}
                    className="btn-compact bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 dark:text-rose-300 text-xs font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Prayer Point
                  </button>
                </div>

                <div className="space-y-2.5">
                  {prayers.map((prayer, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800"
                    >
                      <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 flex items-center justify-center text-xs font-bold shrink-0 mt-1">
                        {idx + 1}
                      </span>
                      <textarea
                        rows={2}
                        value={prayer}
                        onChange={(e) => handleUpdatePrayer(idx, e.target.value)}
                        placeholder={`Prayer point #${idx + 1}...`}
                        className="flex-1 px-3 py-1.5 text-xs sm:text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePrayer(idx)}
                        className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                        title="Remove prayer point"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Birthday Caption */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 block mb-1.5">
                  Celebration Caption / Subtitle
                </label>
                <input
                  type="text"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Dominion City Asaba Information Desk honors a dedicated vessel of honor!"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
          ) : (
            /* Live Interactive Preview */
            <div className="space-y-4">
              <div className="text-center pb-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300">
                  Live Preview: Exactly how this celebration banner will appear on the dashboard
                </span>
              </div>

              {/* The Styled Banner Card */}
              <div
                className={`p-6 sm:p-8 rounded-3xl border ${currentTheme.borderColor} ${currentTheme.cardBg} relative overflow-hidden shadow-xl transition-all`}
              >
                <div
                  className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${currentTheme.gradient}`}
                />

                <div className="flex flex-col md:flex-row items-center gap-6">
                  <div className="relative shrink-0">
                    <img
                      src={effectivePhoto}
                      alt={celebrant.fullName}
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl"
                    />
                    <div className="absolute -bottom-2 -right-2 p-2 rounded-2xl bg-gradient-to-tr from-pink-500 to-amber-500 text-white shadow-lg text-lg">
                      🎂
                    </div>
                  </div>

                  <div className="flex-1 text-center md:text-left min-w-0">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${currentTheme.tagBg} mb-2`}
                    >
                      DEPARTMENT CELEBRATION
                    </span>

                    <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                      {greeting || `Happy Birthday, ${celebrant.fullName}!`}
                    </h3>

                    <p className={`text-xs sm:text-sm font-semibold mt-1 ${currentTheme.accentColor}`}>
                      {caption || `Dominion City Asaba honors ${celebrant.fullName}`}
                    </p>

                    {/* Prayer Declarations */}
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Prophetic Prayers & Blessings:
                      </p>
                      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                        {prayers
                          .filter((p) => p.trim().length > 0)
                          .map((p, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span className="leading-relaxed">{p}</span>
                            </li>
                          ))}
                      </ul>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <span>Celebrant: {celebrant.fullName} ({celebrant.departmentRole})</span>
                      <span>Dominion City Asaba • Information Desk</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#081020]">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            Active Theme: <strong className="text-slate-800 dark:text-slate-200">{currentTheme.name}</strong> • {prayers.filter((p) => p.trim()).length} Prayers configured
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePublishCelebration}
              className="flex-1 sm:flex-initial btn-standard btn-glow-pink gap-2 font-black shadow-lg"
            >
              <Send className="w-4 h-4" />
              <span>Publish Personalised Celebration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

