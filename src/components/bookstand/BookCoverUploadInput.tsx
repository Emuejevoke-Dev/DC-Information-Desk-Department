import React, { useRef, useState, useCallback } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  RotateCw,
  X,
  Check,
  RefreshCw,
  SlidersHorizontal,
  Palette,
  Sun,
  Contrast,
  Upload,
  ChevronDown,
} from 'lucide-react';
import { enhanceBookCover, BOOK_COVER_TEMPLATES, generateTemplateCover } from '../../utils/bookImageEnhancer';
import { Book3DCover } from './Book3DCover';

interface BookCoverUploadInputProps {
  label?: string;
  value?: string;
  onChange: (dataUrl: string) => void;
  bookTitle?: string;
  bookAuthor?: string;
  bookCategory?: string;
}

export const BookCoverUploadInput: React.FC<BookCoverUploadInputProps> = ({
  label = 'Book Cover Photo (Camera Snap & Auto-Studio)',
  value,
  onChange,
  bookTitle = 'New Book Title',
  bookAuthor = 'Dr. David Ogbueli',
  bookCategory = 'Spiritual Growth',
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [rawPhoto, setRawPhoto] = useState<string | null>(null);
  const [rotation, setRotation] = useState<number>(0);
  const [brightnessLevel, setBrightnessLevel] = useState<number>(14);
  const [contrastLevel, setContrastLevel] = useState<number>(20);
  const [showStudioControls, setShowStudioControls] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showReplaceMenu, setShowReplaceMenu] = useState(false);

  // Automatically process uploaded or snapped camera photo
  const processImage = useCallback(
    async (
      imageSource: string | File,
      rot = rotation,
      bright = brightnessLevel,
      cont = contrastLevel
    ) => {
      setIsProcessing(true);
      try {
        const result = await enhanceBookCover(imageSource, {
          rotation: rot,
          brightness: bright,
          contrast: cont,
          saturation: 18,
          addSpineEffect: true,
        });
        onChange(result.enhancedDataUrl);
      } catch (err) {
        console.error('Book auto-enhancement failed:', err);
      } finally {
        setIsProcessing(false);
      }
    },
    [rotation, brightnessLevel, contrastLevel, onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const raw = event.target?.result as string;
        setRawPhoto(raw);
        setRotation(0);
        processImage(raw, 0, brightnessLevel, contrastLevel);
      };
      reader.readAsDataURL(file);
      // Reset input value so re-taking the same picture or re-selecting triggers change
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const raw = event.target?.result as string;
        setRawPhoto(raw);
        setRotation(0);
        processImage(raw, 0, brightnessLevel, contrastLevel);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRotate = () => {
    const nextRot = (rotation + 90) % 360;
    setRotation(nextRot);
    if (rawPhoto) {
      processImage(rawPhoto, nextRot, brightnessLevel, contrastLevel);
    }
  };

  const handleApplyPreset = (bright: number, cont: number) => {
    setBrightnessLevel(bright);
    setContrastLevel(cont);
    if (rawPhoto) {
      processImage(rawPhoto, rotation, bright, cont);
    }
  };

  const handleQuickTemplate = (templateId: string) => {
    const t = BOOK_COVER_TEMPLATES.find((x) => x.id === templateId);
    if (t) {
      const cover = generateTemplateCover(t, bookTitle, bookAuthor);
      onChange(cover);
      setRawPhoto(null);
      setShowTemplates(false);
    }
  };

  const handleClear = () => {
    onChange('');
    setRawPhoto(null);
    setRotation(0);
    setShowReplaceMenu(false);
    setShowStudioControls(false);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <div className="space-y-3">
      {/* Hidden native file inputs */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header Label */}
      <div className="flex flex-wrap items-center justify-between gap-1.5">
        <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{label}</span>
        </label>
        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
          Auto 3:4 Ratio & Studio Finish
        </span>
      </div>

      {/* Active State: Preview + Clean Mobile-Friendly Controls */}
      {value ? (
        <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#07132B] border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Live 3D Book Mockup Display */}
            <div className="w-28 sm:w-36 shrink-0 flex flex-col items-center">
              <div className="relative group">
                <Book3DCover
                  coverPhoto={value}
                  title={bookTitle}
                  author={bookAuthor}
                  category={bookCategory}
                  showHoverEffect={true}
                />
                {rotation > 0 && (
                  <span className="absolute top-1 right-1 bg-purple-900/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded-md shadow-xs">
                    {rotation}°
                  </span>
                )}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mt-2 block text-center">
                Live 3D Book Mockup
              </span>
            </div>

            {/* Info and Actions Strip */}
            <div className="flex-1 w-full space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                <Check className="w-4 h-4 shrink-0" />
                <span>Commercial Bookstore Cover Ready</span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Camera shadows lifted, contrast leveled, and realistic 3D spine and gloss reflection applied automatically.
              </p>

              {/* Action Buttons: Touch-Friendly Mobile Grid (min 44px height) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {/* Rotate Button */}
                <button
                  type="button"
                  onClick={handleRotate}
                  disabled={isProcessing || !rawPhoto}
                  className="min-h-[44px] px-3 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-40"
                  title="Rotate image 90 degrees if camera was held sideways"
                >
                  <RotateCw className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>Rotate {rotation ? `${rotation}°` : '90°'}</span>
                </button>

                {/* Studio Lighting Toggle */}
                <button
                  type="button"
                  onClick={() => setShowStudioControls(!showStudioControls)}
                  disabled={!rawPhoto}
                  className={`min-h-[44px] px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    showStudioControls
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700'
                  }`}
                  title="Adjust brightness & contrast"
                >
                  <SlidersHorizontal className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Lighting</span>
                </button>

                {/* Replace Photo Menu Trigger */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowReplaceMenu(!showReplaceMenu)}
                    className="w-full min-h-[44px] px-3 rounded-xl bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 text-xs font-bold flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                  >
                    <Camera className="w-4 h-4 shrink-0" />
                    <span>Change</span>
                    <ChevronDown className="w-3.5 h-3.5 shrink-0" />
                  </button>

                  {/* Dropdown for Replace */}
                  {showReplaceMenu && (
                    <div className="absolute left-0 bottom-full mb-1 sm:bottom-auto sm:top-full sm:mt-1 z-30 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                      <button
                        type="button"
                        onClick={() => {
                          setShowReplaceMenu(false);
                          cameraInputRef.current?.click();
                        }}
                        className="w-full min-h-[38px] px-2.5 py-1.5 rounded-lg text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 flex items-center gap-2 cursor-pointer"
                      >
                        <Camera className="w-3.5 h-3.5 text-purple-600" />
                        <span>Snap with Camera</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReplaceMenu(false);
                          galleryInputRef.current?.click();
                        }}
                        className="w-full min-h-[38px] px-2.5 py-1.5 rounded-lg text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/60 flex items-center gap-2 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>Choose Gallery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReplaceMenu(false);
                          setShowTemplates(true);
                        }}
                        className="w-full min-h-[38px] px-2.5 py-1.5 rounded-lg text-left text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/60 flex items-center gap-2 cursor-pointer"
                      >
                        <Palette className="w-3.5 h-3.5 text-amber-500" />
                        <span>Publisher Template</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Remove / Clear Button */}
                <button
                  type="button"
                  onClick={handleClear}
                  className="min-h-[44px] px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <X className="w-4 h-4 shrink-0" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          </div>

          {/* Expandable Studio Fine-Tuning Controls */}
          {showStudioControls && rawPhoto && (
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-in fade-in duration-100">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-purple-600" />
                  Studio Lighting Presets & Sliders
                </span>
                {/* Quick Presets */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(14, 20)}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer"
                  >
                    Balanced
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(25, 25)}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer"
                  >
                    Bright +25%
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(10, 35)}
                    className="px-2 py-1 text-[11px] font-bold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-purple-100 dark:hover:bg-purple-900 cursor-pointer"
                  >
                    Deep Ink +35%
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-[#0E172B] p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      Exposure / Brightness
                    </span>
                    <span className="font-mono text-purple-600 font-bold">+{brightnessLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={brightnessLevel}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setBrightnessLevel(val);
                      processImage(rawPhoto, rotation, val, contrastLevel);
                    }}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                    <span className="flex items-center gap-1">
                      <Contrast className="w-3.5 h-3.5 text-blue-500" />
                      Contrast & Ink Sharpness
                    </span>
                    <span className="font-mono text-purple-600 font-bold">+{contrastLevel}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={contrastLevel}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setContrastLevel(val);
                      processImage(rawPhoto, rotation, brightnessLevel, val);
                    }}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Empty State: Two Large, Touch-Friendly Responsive Buttons */
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
          className={`rounded-2xl border-2 border-dashed p-4 sm:p-6 text-center transition-all ${
            isDraggingOver
              ? 'border-purple-600 bg-purple-100/50 dark:bg-purple-950/40'
              : 'border-purple-300 dark:border-purple-800/60 bg-purple-50/40 dark:bg-purple-950/20'
          }`}
        >
          {isProcessing ? (
            <div className="py-6 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-8 h-8 text-purple-600 animate-spin" />
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Auto-Enhancing Book Cover into Commercial Studio Quality...
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Cropping to 3:4 portrait ratio, leveling exposure, sharpening titles, and applying 3D book spine.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Add Physical Book Cover Photograph
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Snap the book with your phone camera or upload an image. Our studio engine automatically fixes angles, shadows, and lighting.
                </p>
              </div>

              {/* Big, Touch-Friendly Action Buttons (Minimum 48px height for thumbs) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="min-h-[48px] px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>📷 Snap with Camera</span>
                </button>

                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="min-h-[48px] px-4 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                  <span>🖼️ Choose from Gallery</span>
                </button>
              </div>

              {/* Template shortcut button */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 hover:underline cursor-pointer py-1"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-500" />
                  <span>Don't have a photo? Pick an official publisher template →</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preset Templates Selector Drawer */}
      {showTemplates && (
        <div className="p-4 rounded-2xl bg-white dark:bg-[#0E172B] border border-amber-300 dark:border-amber-800/80 shadow-xl space-y-3 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-500" />
              <span>Official Dominion Publishing Cover Templates</span>
            </span>
            <button
              type="button"
              onClick={() => setShowTemplates(false)}
              className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {BOOK_COVER_TEMPLATES.map((tmpl) => (
              <button
                key={tmpl.id}
                type="button"
                onClick={() => handleQuickTemplate(tmpl.id)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 text-left transition-all cursor-pointer group hover:scale-[1.02] bg-slate-50 dark:bg-slate-800/40"
              >
                <div
                  className="h-12 rounded-lg mb-1.5 flex items-center justify-center text-[10px] font-black text-white px-2 shadow-xs text-center"
                  style={{ background: tmpl.backgroundGradient }}
                >
                  {tmpl.name}
                </div>
                <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">
                  {tmpl.name}
                </p>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 block font-semibold">
                  {tmpl.badge}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
