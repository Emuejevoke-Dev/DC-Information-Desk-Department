import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Book } from '../../types/models';
import { formatNaira } from '../../utils/formatters';
import { Book3DCover } from './Book3DCover';
import {
  BookOpen,
  ShoppingBag,
  Search,
  Lock,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Printer,
  X,
  Info,
  Flame,
  ArrowRight,
  Clock,
  Compass,
  FileText,
  Phone,
  User,
  CreditCard,
  MapPin,
  Check,
} from 'lucide-react';

export interface MemberBookstandCatalogProps {
  onOpenOfficerLogin?: () => void;
  onNavigateToOfficerDesk?: () => void;
  isOfficerPreview?: boolean;
  onExitOfficerPreview?: () => void;
}

export const MemberBookstandCatalog: React.FC<MemberBookstandCatalogProps> = ({
  onOpenOfficerLogin,
  onNavigateToOfficerDesk,
  isOfficerPreview = false,
  onExitOfficerPreview,
}) => {
  const { currentUser, canManageBookstand } = useAuth();
  const { books } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price-asc' | 'price-desc' | 'title' | 'stock'>('recommended');

  // Modals state
  const [selectedBookForSynopsis, setSelectedBookForSynopsis] = useState<Book | null>(null);
  const [selectedBookForSlip, setSelectedBookForSlip] = useState<Book | null>(null);
  const [isGuidelinesOpen, setIsGuidelinesOpen] = useState(false);

  // Request Slip form state
  const [slipForm, setSlipForm] = useState({
    memberName: currentUser?.name || '',
    memberPhone: currentUser?.phone || '',
    service: 'Sunday 1st Service',
    deskLocation: 'Desk A — Left Wing',
    quantity: 1,
    slipCode: `DCA-${Math.floor(1000 + Math.random() * 9000)}`,
  });
  const [slipGenerated, setSlipGenerated] = useState(false);

  const categories = [
    { id: 'all', label: 'All Books' },
    { id: 'Spiritual Growth', label: 'Spiritual Growth' },
    { id: 'Leadership', label: 'Leadership' },
    { id: 'Prayer & Fasting', label: 'Prayer & Fasting' },
    { id: 'Purpose & Destiny', label: 'Purpose & Destiny' },
    { id: 'Finance & Stewardship', label: 'Finance & Stewardship' },
    { id: 'Relationships', label: 'Relationships' },
  ];

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesCategory =
          selectedCategory === 'all' || book.category === selectedCategory;
        const matchesQuery =
          !searchQuery.trim() ||
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.category.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.sellingPrice - b.sellingPrice;
        if (sortBy === 'price-desc') return b.sellingPrice - a.sellingPrice;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        if (sortBy === 'stock') return b.currentStock - a.currentStock;
        return 0; // default order
      });
  }, [books, selectedCategory, searchQuery, sortBy]);

  // Open slip modal with prefilled data
  const handleOpenSlip = (book: Book) => {
    setSelectedBookForSlip(book);
    setSlipForm({
      memberName: currentUser?.name || '',
      memberPhone: currentUser?.phone || '',
      service: 'Sunday 1st Service',
      deskLocation: 'Desk A — Left Wing',
      quantity: 1,
      slipCode: `DCA-BK-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setSlipGenerated(false);
  };

  // Helper to generate dynamic, rich Christian synopsis
  const getBookSynopsis = (book: Book) => {
    switch (book.category) {
      case 'Spiritual Growth':
        return {
          lead: 'An essential apostolic guide to building unbroken communion with the Holy Spirit and establishing foundations of spiritual authority.',
          keyPoints: [
            'How to discern God’s voice clearly in every season',
            'Cultivating an altar of daily personal communion',
            'Transiting from religion into tangible kingdom power',
            'Maintaining unbroken spiritual momentum in modern daily life',
          ],
          audience: 'Believers seeking deeper intimacy with God, department workers, and church leaders.',
        };
      case 'Leadership':
        return {
          lead: 'A masterclass in transformative kingdom leadership, personal discipline, and organizational impact inspired by biblical giants.',
          keyPoints: [
            'Core traits of high-impact spiritual leaders',
            'Translating God-given vision into executable structure',
            'Managing people, conflicts, and team dynamics with wisdom',
            'Sustaining personal character and integrity at the top',
          ],
          audience: 'Pastors, cell leaders, department executives, and marketplace leaders.',
        };
      case 'Prayer & Fasting':
        return {
          lead: 'Unveiling the mystery of high-altitude prayer, consecrated fasting, and unlocking supernatural breakthroughs in families and cities.',
          keyPoints: [
            'Biblical protocols of answered prayer and intercession',
            'Fasting as a spiritual catalyst for clarity and breakthrough',
            'Pulling down strongholds and exercising kingdom authority',
            'Building a sustained lifestyle of prayer without burnout',
          ],
          audience: 'Intercessors, prayer leaders, and every Christian longing for divine intervention.',
        };
      case 'Purpose & Destiny':
        return {
          lead: 'A revelatory roadmap for discovering your divine blueprint, deploying spiritual gifts, and fulfilling your eternal assignment on earth.',
          keyPoints: [
            'Identifying your unique divine calling and grace endowments',
            'Overcoming fear, delay, and destiny-paralyzing distractions',
            'The power of mentorship, preparation, and divine timing',
            'Aligning your career or business with kingdom purposes',
          ],
          audience: 'Youths, students, career professionals, and anyone navigating life transitions.',
        };
      case 'Finance & Stewardship':
        return {
          lead: 'Kingdom secrets of wealth creation, covenants of supernatural abundance, and biblical stewardship for multigenerational blessing.',
          keyPoints: [
            'Covenant laws of seedtime and harvest in the New Covenant',
            'Practical budgeting, investment, and debt eradication principles',
            'Creating multiple streams of income with godly integrity',
            'Funding kingdom expansion and becoming a generational blessing',
          ],
          audience: 'Entrepreneurs, professionals, families, and stewards of financial resources.',
        };
      default:
        return {
          lead: 'An anointed publication written to illuminate biblical truths, build solid character, and provide wisdom for victorious Christian living.',
          keyPoints: [
            'Foundations of faith and sound doctrine',
            'Practical wisdom for daily Christian walk',
            'Navigating interpersonal relationships with grace',
            'Standing firm in purpose and truth',
          ],
          audience: 'All members of Dominion City and visitors seeking kingdom literature.',
        };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Officer Preview Banner (if triggered by officer) */}
      {isOfficerPreview && (
        <div className="p-3.5 rounded-xl bg-purple-900/90 border border-purple-500/50 text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 rounded-lg bg-purple-700">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
            </span>
            <div>
              <p className="text-xs font-bold text-amber-300">
                Officer Preview Mode Active
              </p>
              <p className="text-[11px] text-purple-200">
                You are viewing the Book Stand exactly as church members see it. Wholesale costs, profit margins, sales totals, and debtor ledgers are hidden.
              </p>
            </div>
          </div>
          {onExitOfficerPreview && (
            <button
              onClick={onExitOfficerPreview}
              className="px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              Return to Officer Desk →
            </button>
          )}
        </div>
      )}

      {/* Hero Banner: Warm Christian Bookstore Theme */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E0B36] via-[#2A1045] to-[#120624] text-white p-6 sm:p-8 lg:p-10 shadow-xl border border-purple-900/50">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              Dominion City Asaba • Kingdom Literature Stand
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
              Church Book Stand &amp; Spiritual Resources
            </h1>

            <p className="text-xs sm:text-sm text-purple-200/90 leading-relaxed font-normal">
              Equipping the saints with transformative spiritual books, apostolic teachings, and life-changing ministry materials by <strong className="text-white font-semibold">Dr. David Ogbueli</strong> and anointed leaders.
            </p>

            {/* Quick Desk Features */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-[11px] text-purple-200">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <strong className="text-white">{books.length}</strong> Titles Available
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                Desk A (Left) &amp; Desk B (Right)
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-950/60 border border-purple-800/60">
                <CreditCard className="w-3.5 h-3.5 text-cyan-400" />
                POS, Cash &amp; Bank Transfer
              </span>
            </div>
          </div>

          {/* Action Gateways: Officer Access vs Public Purchase Info */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            {canManageBookstand ? (
              <button
                onClick={() => {
                  if (onNavigateToOfficerDesk) {
                    onNavigateToOfficerDesk();
                  }
                }}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs sm:text-sm font-black transition-all cursor-pointer shadow-lg hover:shadow-amber-500/20"
                title="Enter Bookstand Officer Desk"
              >
                <ShieldCheck className="w-4 h-4 text-slate-950" />
                Open Book Officer Desk
                <ArrowRight className="w-4 h-4 ml-0.5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (onOpenOfficerLogin) {
                    onOpenOfficerLogin();
                  }
                }}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800/80 border border-purple-500/40 text-amber-300 text-xs sm:text-sm font-bold transition-all cursor-pointer hover:border-amber-400/60 shadow-sm"
                title="Bookstand Officer login portal"
              >
                <Lock className="w-4 h-4 text-amber-400" />
                Book Officer Portal (Passcode)
              </button>
            )}

            <button
              onClick={() => setIsGuidelinesOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/10 text-white text-xs font-semibold transition-all cursor-pointer"
            >
              <Info className="w-4 h-4 text-purple-200" />
              How to Buy at Information Desk
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search books by title, author, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-base sm:text-sm bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-purple-600 font-medium transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-purple-600 cursor-pointer"
            >
              <option value="recommended">Featured / Recommended</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title">Book Title (A–Z)</option>
              <option value="stock">Highest Stock</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Books Catalogue Grid */}
      {filteredBooks.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#0E172B] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-3">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No books found matching "{searchQuery}"
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search keywords or clear the category filter to explore all available kingdom publications.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="px-4 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs font-bold cursor-pointer hover:bg-purple-100"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredBooks.map((book) => {
            const isAvailable = book.currentStock > 0;
            const isLowStock = isAvailable && book.currentStock <= 5;

            return (
              <div
                key={book.id}
                className="group bg-white dark:bg-[#0E172B] rounded-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-800/80 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* 3D Book Cover Presentation */}
                  <div className="p-4 sm:p-5 bg-gradient-to-b from-slate-100 via-slate-50 to-white dark:from-slate-800/50 dark:via-slate-800/30 dark:to-slate-900/40 flex justify-center items-center border-b border-slate-100 dark:border-slate-800/80">
                    <div className="w-36 sm:w-40 py-2">
                      <Book3DCover
                        coverPhoto={book.coverPhoto}
                        title={book.title}
                        author={book.author}
                        category={book.category}
                        badge={
                          <span
                            className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs ${
                              book.currentStock > 5
                                ? 'bg-emerald-500 text-white'
                                : isLowStock
                                ? 'bg-amber-500 text-white'
                                : 'bg-rose-500 text-white'
                            }`}
                          >
                            {book.currentStock > 5
                              ? 'In Stock'
                              : isLowStock
                              ? 'Limited Copies'
                              : 'Out of Stock'}
                          </span>
                        }
                      />
                    </div>
                  </div>

                  {/* Book Metadata */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                        {book.category}
                      </span>
                      {isAvailable && (
                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          At Info Desk
                        </span>
                      )}
                    </div>

                    <h3
                      className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors"
                      title={book.title}
                    >
                      {book.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      {book.author}
                    </p>
                  </div>
                </div>

                {/* Pricing & Member Actions */}
                <div className="p-4 pt-0">
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mb-3">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Desk Price
                      </span>
                      <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {formatNaira(book.sellingPrice)}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                        Availability
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          book.currentStock > 5
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isLowStock
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-500'
                        }`}
                      >
                        {book.currentStock > 5
                          ? 'Available'
                          : isLowStock
                          ? `Few Left (${book.currentStock})`
                          : 'Restocking Soon'}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSelectedBookForSynopsis(book)}
                      className="w-full py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer text-center"
                      title="Read book synopsis and overview"
                    >
                      Synopsis
                    </button>

                    <button
                      onClick={() => handleOpenSlip(book)}
                      className={`w-full py-2 px-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1 shadow-xs ${
                        isAvailable
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                      }`}
                      title={isAvailable ? 'Generate collection slip for Information Desk' : 'Out of stock at this time'}
                      disabled={!isAvailable}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Request Slip
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. BOOK SYNOPSIS & DETAILS MODAL                                          */}
      {/* ========================================================================= */}
      {selectedBookForSynopsis && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E172B] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-xl w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-purple-900 to-indigo-950 text-white flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  {selectedBookForSynopsis.category}
                </span>
                <h3 className="text-lg sm:text-xl font-black mt-2 text-white">
                  {selectedBookForSynopsis.title}
                </h3>
                <p className="text-xs text-purple-200 mt-0.5">
                  Author: <strong className="text-white">{selectedBookForSynopsis.author}</strong>
                </p>
              </div>
              <button
                onClick={() => setSelectedBookForSynopsis(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Cover Preview & Pricing Strip */}
              <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start bg-slate-50 dark:bg-[#131F38] p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                <div className="w-28 sm:w-32 shrink-0">
                  <Book3DCover
                    coverPhoto={selectedBookForSynopsis.coverPhoto}
                    title={selectedBookForSynopsis.title}
                    author={selectedBookForSynopsis.author}
                    category={selectedBookForSynopsis.category}
                  />
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium">Selling Price at Desk</span>
                    <p className="text-2xl font-black text-purple-700 dark:text-purple-300">
                      {formatNaira(selectedBookForSynopsis.sellingPrice)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                        selectedBookForSynopsis.currentStock > 5
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                          : selectedBookForSynopsis.currentStock > 0
                          ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                          : 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                      }`}
                    >
                      {selectedBookForSynopsis.currentStock > 0
                        ? `Available at Desk (${selectedBookForSynopsis.currentStock} in stock)`
                        : 'Currently Out of Stock'}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Standard Paperback
                    </span>
                  </div>
                </div>
              </div>

              {/* Synopsis Content */}
              {(() => {
                const synopsis = getBookSynopsis(selectedBookForSynopsis);
                return (
                  <div className="space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-1">
                        Book Overview
                      </h4>
                      <p className="italic text-slate-600 dark:text-slate-300 font-serif text-sm">
                        "{synopsis.lead}"
                      </p>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] mb-2">
                        Key Revelations &amp; Themes
                      </h4>
                      <ul className="space-y-1.5 list-disc list-inside text-slate-600 dark:text-slate-300">
                        {synopsis.keyPoints.map((pt, idx) => (
                          <li key={idx} className="leading-snug">{pt}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-900/50">
                      <span className="font-bold text-purple-900 dark:text-purple-300 block text-[11px]">
                        Recommended For:
                      </span>
                      <p className="text-purple-800 dark:text-purple-200 mt-0.5">
                        {synopsis.audience}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-[#131F38] border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 text-center sm:text-left">
                Available at Desk A (Left Wing) &amp; Desk B (Right Wing)
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedBookForSynopsis(null)}
                  className="flex-1 sm:flex-none px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Close
                </button>
                {selectedBookForSynopsis.currentStock > 0 && (
                  <button
                    onClick={() => {
                      const bk = selectedBookForSynopsis;
                      setSelectedBookForSynopsis(null);
                      handleOpenSlip(bk);
                    }}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Generate Request Slip
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. OFFICIAL BOOK REQUEST SLIP MODAL                                      */}
      {/* ========================================================================= */}
      {selectedBookForSlip && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E172B] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-slate-950" />
                <div>
                  <h3 className="text-sm sm:text-base font-black">
                    Information Desk Collection Slip
                  </h3>
                  <p className="text-[11px] font-medium text-slate-900">
                    Dominion City Asaba • Book Stand Official Slip
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedBookForSlip(null)}
                className="p-1 rounded-full hover:bg-black/10 text-slate-950 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Slip Body */}
            <div className="p-5 sm:p-6 space-y-4">
              {!slipGenerated ? (
                /* Slip Form */
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setSlipGenerated(true);
                  }}
                  className="space-y-4"
                >
                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block">
                        Selected Book
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {selectedBookForSlip.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {selectedBookForSlip.author}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 font-semibold block">Unit Price</span>
                      <span className="text-sm font-black text-purple-700 dark:text-purple-300">
                        {formatNaira(selectedBookForSlip.sellingPrice)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Member / Buyer Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={slipForm.memberName}
                        onChange={(e) => setSlipForm({ ...slipForm, memberName: e.target.value })}
                        placeholder="e.g. Sister Grace Obi"
                        className="w-full pl-9 pr-3 py-2 text-base sm:text-xs bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number *
                      </label>
                      <div className="relative">
                        <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={slipForm.memberPhone}
                          onChange={(e) => setSlipForm({ ...slipForm, memberPhone: e.target.value })}
                          placeholder="e.g. 0803 123 4567"
                          className="w-full pl-9 pr-3 py-2 text-base sm:text-xs bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Quantity of Copies
                      </label>
                      <input
                        type="number"
                        min="1"
                        max={Math.min(10, selectedBookForSlip.currentStock)}
                        value={slipForm.quantity}
                        onChange={(e) => setSlipForm({ ...slipForm, quantity: Math.max(1, parseInt(e.target.value) || 1) })}
                        className="w-full px-3 py-2 text-base sm:text-xs bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Service of Collection
                      </label>
                      <select
                        value={slipForm.service}
                        onChange={(e) => setSlipForm({ ...slipForm, service: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      >
                        <option value="Sunday 1st Service">Sunday 1st Service (7:30 AM)</option>
                        <option value="Sunday 2nd Service">Sunday 2nd Service (9:30 AM)</option>
                        <option value="Wednesday Word & Communion">Wednesday Word &amp; Communion</option>
                        <option value="Special Programme">Special Programme / Conference</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Collection Desk
                      </label>
                      <select
                        value={slipForm.deskLocation}
                        onChange={(e) => setSlipForm({ ...slipForm, deskLocation: e.target.value })}
                        className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium"
                      >
                        <option value="Desk A — Left Wing">Desk A — Left Wing (Main Entrance)</option>
                        <option value="Desk B — Right Wing">Desk B — Right Wing (Gallery)</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Total Payable at Desk:</span>
                    <span className="text-base font-black text-purple-700 dark:text-purple-300">
                      {formatNaira(selectedBookForSlip.sellingPrice * slipForm.quantity)}
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm transition-all cursor-pointer shadow-md"
                  >
                    Generate Official Slip →
                  </button>
                </form>
              ) : (
                /* Generated Printable Slip Preview */
                <div className="space-y-4">
                  <div
                    id="printable-slip"
                    className="p-5 rounded-2xl bg-gradient-to-b from-amber-50/80 to-white dark:from-slate-800 dark:to-slate-900 border-2 border-dashed border-amber-400/80 text-slate-900 dark:text-white space-y-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-3">
                      <div>
                        <span className="text-[10px] font-black tracking-widest uppercase text-amber-700 dark:text-amber-400 block">
                          DOMINION CITY ASABA
                        </span>
                        <h4 className="text-xs sm:text-sm font-black">
                          INFORMATION DESK BOOK SLIP
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] font-mono text-slate-400 block">Slip Code</span>
                        <span className="text-xs font-black font-mono text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950">
                          {slipForm.slipCode}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">Book Title</span>
                        <p className="font-bold text-slate-900 dark:text-white">
                          {selectedBookForSlip.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Qty: {slipForm.quantity} copy(ies)
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-medium block">Total Payable</span>
                        <p className="text-sm font-black text-purple-700 dark:text-purple-300">
                          {formatNaira(selectedBookForSlip.sellingPrice * slipForm.quantity)}
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Buyer Name</span>
                        <strong className="text-slate-900 dark:text-white">{slipForm.memberName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Phone</span>
                        <strong className="text-slate-900 dark:text-white">{slipForm.memberPhone}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Target Service</span>
                        <span className="text-slate-800 dark:text-slate-200">{slipForm.service}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px]">Collection Point</span>
                        <span className="text-slate-800 dark:text-slate-200">{slipForm.deskLocation}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed border-amber-300 dark:border-slate-700 pt-2.5 flex items-start gap-2 text-[10px] text-slate-500 dark:text-slate-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>
                        Present this slip (or mention reference code <strong className="font-mono text-purple-600 dark:text-purple-400">{slipForm.slipCode}</strong>) to the Bookstand Officer at the Information Desk. Payment accepted via Cash, POS Terminal, or Church Transfer.
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => window.print()}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Print Slip
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBookForSlip(null);
                        setSlipGenerated(false);
                      }}
                      className="py-2.5 px-5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DESK PURCHASE GUIDELINES MODAL                                        */}
      {/* ========================================================================= */}
      {isGuidelinesOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0E172B] rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Info className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm sm:text-base font-bold text-white">
                  How to Buy at the Information Desk
                </h3>
              </div>
              <button
                onClick={() => setIsGuidelinesOpen(false)}
                className="p-1 rounded-full hover:bg-white/10 text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
                <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-amber-600" />
                  Desk Locations in Main Auditorium
                </span>
                <p className="text-[11px] text-amber-800 dark:text-amber-200">
                  • <strong>Desk A (Left Wing)</strong>: Located directly beside the main entrance foyer.<br />
                  • <strong>Desk B (Right Wing)</strong>: Located near the choir &amp; multimedia wing.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Accepted Payment Methods
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-800">
                    <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1" />
                    <span className="font-bold text-[11px] block">POS Machine</span>
                    <span className="text-[9px] text-slate-400">Debit cards</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-800">
                    <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                    <span className="font-bold text-[11px] block">Bank Transfer</span>
                    <span className="text-[9px] text-slate-400">Church account</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131F38] border border-slate-200 dark:border-slate-800">
                    <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
                    <span className="font-bold text-[11px] block">Physical Cash</span>
                    <span className="text-[9px] text-slate-400">Exact change</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  Service Operational Hours
                </h4>
                <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                  The Bookstand is manned by assigned Information Desk officers before each service (7:00 AM – 7:30 AM), during transition intervals, and for 45 minutes immediately following benediction.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-[#131F38] border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                onClick={() => setIsGuidelinesOpen(false)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
