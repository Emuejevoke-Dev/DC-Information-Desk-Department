import React, { useState, useEffect, useRef } from 'react';
import { Announcement } from '../../types/models';
import { formatDate } from '../../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Info,
  Share2,
  Building2,
  Users,
  Check,
  X,
  ArrowUpRight,
} from 'lucide-react';

interface EventFlyerCarouselProps {
  events: Announcement[];
  onViewEventDetails?: (event: Announcement) => void;
}

export const EventFlyerCarousel: React.FC<EventFlyerCarouselProps> = ({
  events,
}) => {
  // Filter for published announcements with images or upcoming event category
  const publishedEvents = events.filter(
    (e) =>
      e.status === 'Published' &&
      (e.coverPhoto || e.category === 'Upcoming Event' || e.category === 'General Announcement')
  );

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEventModal, setSelectedEventModal] = useState<Announcement | null>(null);
  const [copiedShareId, setCopiedShareId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION_MS = 7500;
  const progressStepIntervalMs = 50;

  // Auto-advance with visual progress bar
  useEffect(() => {
    if (publishedEvents.length <= 1) return;

    if (isPaused) return;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setCurrentIndex((curr) => (curr + 1) % publishedEvents.length);
          return 0;
        }
        return prev + (progressStepIntervalMs / SLIDE_DURATION_MS) * 100;
      });
    }, progressStepIntervalMs);

    return () => clearInterval(timer);
  }, [publishedEvents.length, isPaused]);

  // Reset progress on slide change
  const handleSelectSlide = (idx: number) => {
    setCurrentIndex(idx);
    setProgress(0);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + publishedEvents.length) % publishedEvents.length);
    setProgress(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % publishedEvents.length);
    setProgress(0);
  };

  const handleShareEvent = (event: Announcement) => {
    const text = `*${event.title}*\n📅 ${event.eventDate ? formatDate(event.eventDate) : 'Upcoming'}\n⏰ ${event.eventTime || 'TBA'}\n📍 ${event.venue || 'Dominion City Asaba'}\n\n${event.description}`;
    navigator.clipboard.writeText(text);
    setCopiedShareId(event.id);
    setTimeout(() => setCopiedShareId(null), 2500);
  };

  if (publishedEvents.length === 0) {
    return null;
  }

  const currentEvent = publishedEvents[currentIndex];

  // Derive date badge formatting
  const getEventDateParts = (dateStr?: string) => {
    if (!dateStr) return { day: 'SOON', month: 'EVENT' };
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: 'SOON', month: 'EVENT' };
    return {
      day: d.getDate().toString(),
      month: d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase(),
    };
  };

  const dateParts = getEventDateParts(currentEvent.eventDate);

  return (
    <>
      {/* Flagship Carousel Container commanding 42-48% viewport height */}
      <section
        aria-label="Upcoming Church Events Showcase"
        className="relative overflow-hidden rounded-3xl bg-[#051126] shadow-xl group card-shimmer-border glow-blue"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Soft Ambient Dynamic Backdrop Glow matching event themes */}
        <div
          className="absolute inset-0 bg-gradient-to-r from-[#071738] via-[#0B2558] to-[#0D3175] opacity-90 transition-all duration-700"
          aria-hidden="true"
        />

        {/* Ambient flyer color reflection */}
        {currentEvent.coverPhoto && (
          <div
            className="absolute -left-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
            style={{
              backgroundImage: `radial-gradient(circle, #F59E0B 0%, #1D4ED8 60%, transparent 80%)`,
            }}
          />
        )}

        <div className="relative z-10 flex flex-col md:flex-row items-stretch min-h-[380px] md:h-[430px] lg:h-[460px]">
          {/* LEFT: Prominent Event Flyer Visual Stage */}
          <div className="relative md:w-5/12 lg:w-9/20 bg-black/40 overflow-hidden flex items-center justify-center shrink-0 min-h-[260px] md:min-h-full">
            {currentEvent.coverPhoto ? (
              <div className="relative w-full h-full flex items-center justify-center p-3 sm:p-5">
                {/* Framed Flyer Image */}
                <div className="relative w-full h-full max-h-[420px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 group-hover:border-amber-400/30 transition-all duration-500">
                  <img
                    key={currentEvent.id}
                    src={currentEvent.coverPhoto}
                    alt={currentEvent.title}
                    className="w-full h-full object-cover sm:object-contain md:object-cover transition-transform duration-700 ease-out hover:scale-102"
                  />
                  {/* Subtle Gradient Vignette at image base */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center text-blue-200">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center mb-3">
                  <Sparkles className="w-8 h-8 text-amber-400" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Dominion City Ministry Programme
                </span>
              </div>
            )}

            {/* Event Category Tag (Upper Left Floating Pill) */}
            <div className="absolute top-4 left-4 z-20">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#06132B]/85 backdrop-blur-md text-amber-300 border border-amber-400/40 shadow-md">
                <Sparkles className="w-3 h-3 text-amber-400" />
                {currentEvent.category}
              </span>
            </div>

            {/* Date Pill Tag (Upper Right of Flyer) */}
            <div className="absolute top-4 right-4 z-20">
              <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-[#06132B]/85 backdrop-blur-md border border-white/15 text-white shadow-md">
                <span className="text-[10px] font-bold text-amber-300 uppercase leading-none">
                  {dateParts.month}
                </span>
                <span className="text-sm font-black leading-tight text-white">
                  {dateParts.day}
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT: Programme Details & Interactive Controls */}
          <div className="flex-1 p-5 sm:p-7 lg:p-8 flex flex-col justify-between space-y-4">
            <div>
              {/* Header Eyebrow & Slide Counter */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300/90">
                    Featured Ministry Programme
                  </span>
                  <span className="text-blue-400/60 hidden sm:inline">•</span>
                  <span className="text-[11px] text-blue-200/80 font-medium hidden sm:inline">
                    Dominion City Asaba
                  </span>
                </div>

                {/* Numerical Slide Indicator */}
                <div className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-blue-100 border border-white/10">
                  {String(currentIndex + 1).padStart(2, '0')} / {String(publishedEvents.length).padStart(2, '0')}
                </div>
              </div>

              {/* Main Programme Title */}
              <h2 className="text-lg sm:text-2xl lg:text-3xl font-black tracking-tight text-white leading-tight line-clamp-2">
                {currentEvent.title}
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-blue-100/85 mt-2.5 line-clamp-3 leading-relaxed">
                {currentEvent.description}
              </p>

              {/* Structured Metadata Highlights (Date, Time, Venue, Organiser) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4 pt-4 border-t border-blue-800/50">
                {currentEvent.eventDate && (
                  <div className="flex items-center gap-2.5 text-xs text-blue-100 bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 shrink-0">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-blue-300/70 block leading-none mb-0.5">
                        Date
                      </span>
                      <span className="font-semibold truncate block">
                        {formatDate(currentEvent.eventDate)}
                      </span>
                    </div>
                  </div>
                )}

                {currentEvent.eventTime && (
                  <div className="flex items-center gap-2.5 text-xs text-blue-100 bg-white/5 p-2 rounded-xl border border-white/5">
                    <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] uppercase font-bold text-blue-300/70 block leading-none mb-0.5">
                        Service Time
                      </span>
                      <span className="font-semibold truncate block">
                        {currentEvent.eventTime}
                      </span>
                    </div>
                  </div>
                )}

                {currentEvent.venue && (
                  <div className="flex items-center gap-2.5 text-xs text-blue-100 bg-white/5 p-2 rounded-xl border border-white/5 sm:col-span-2">
                    <div className="p-1.5 rounded-lg bg-emerald-400/20 text-emerald-300 shrink-0">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] uppercase font-bold text-blue-300/70 block leading-none mb-0.5">
                        Venue & Location
                      </span>
                      <span className="font-semibold truncate block">
                        {currentEvent.venue}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions, Progress Bar & Navigation Controls */}
            <div className="space-y-3 pt-2">
              {/* Animated Progress Bar */}
              {publishedEvents.length > 1 && (
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-400 to-amber-300 h-full transition-all duration-75 ease-linear"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                {/* CTA Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setSelectedEventModal(currentEvent)}
                    className="btn-compact btn-glow-amber"
                  >
                    <Info className="w-4 h-4" />
                    <span>View Programme Guide</span>
                  </button>

                  <button
                    onClick={() => handleShareEvent(currentEvent)}
                    className="btn-compact bg-white/10 hover:bg-white/20 text-white border border-white/15 glow-blue-hover"
                    title="Copy event details to share"
                  >
                    {copiedShareId === currentEvent.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Share2 className="w-4 h-4 text-blue-200" />
                    )}
                  </button>
                </div>

                {/* Slide Selectors & Arrow Controls */}
                {publishedEvents.length > 1 && (
                  <div className="flex items-center gap-2">
                    {/* Pagination Dot Pills */}
                    <div className="hidden sm:flex items-center gap-1.5 mr-2">
                      {publishedEvents.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectSlide(idx)}
                          className={`h-2 rounded-full transition-all cursor-pointer ${
                            idx === currentIndex
                              ? 'w-6 bg-amber-400'
                              : 'w-2 bg-blue-700/80 hover:bg-blue-600'
                          }`}
                          title={`Jump to slide ${idx + 1}`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handlePrev}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10 hover:border-white/20 active:scale-95"
                      title="Previous programme"
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNext}
                      className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer border border-white/10 hover:border-white/20 active:scale-95"
                      title="Next programme"
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Full Programme Modal Sheet */}
      {selectedEventModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedEventModal(null)}
        >
          <div
            className="bg-white dark:bg-[#0E172B] text-slate-900 dark:text-slate-100 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {selectedEventModal.category}
              </span>
              <button
                onClick={() => setSelectedEventModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="mt-5 space-y-5">
              {selectedEventModal.coverPhoto && (
                <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 max-h-84 flex items-center justify-center shadow-inner">
                  <img
                    src={selectedEventModal.coverPhoto}
                    alt={selectedEventModal.title}
                    className="w-full h-auto object-contain max-h-84"
                  />
                </div>
              )}

              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {selectedEventModal.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2.5 leading-relaxed whitespace-pre-line">
                  {selectedEventModal.description}
                </p>
              </div>

              {/* Detailed Programme Metadata */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#131F38] border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
                {selectedEventModal.eventDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Event Date:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatDate(selectedEventModal.eventDate)}
                    </span>
                  </div>
                )}
                {selectedEventModal.eventTime && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Programme Time:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {selectedEventModal.eventTime}
                    </span>
                  </div>
                )}
                {selectedEventModal.venue && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Venue:</span>
                    <span className="font-bold text-slate-900 dark:text-white text-right">
                      {selectedEventModal.venue}
                    </span>
                  </div>
                )}
                {selectedEventModal.organizer && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Organised By:</span>
                    <span className="font-semibold text-blue-700 dark:text-blue-300">
                      {selectedEventModal.organizer}
                    </span>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => handleShareEvent(selectedEventModal)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  {copiedShareId === selectedEventModal.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Copy Programme Summary</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setSelectedEventModal(null)}
                  className="btn-compact bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
