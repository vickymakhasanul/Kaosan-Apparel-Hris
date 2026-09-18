import React, { useState, useMemo, useRef } from 'react';
import {
  Heart,
  MessageSquare,
  Share2,
  Camera,
  Image as ImageIcon,
  MapPin,
  Smile,
  Send,
  Trash2,
  Filter,
  Search,
  X,
  Check,
  Flame,
  Coffee,
  Sparkles,
  Users,
  ZoomIn,
  Building2,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { CompanyDepartment, CompanyRole, SocialComment, SocialPost, User } from '../types';
import { WORK_PHOTO_PRESETS, WorkPhotoPreset } from '../data/socialData';

interface SocialFeedViewProps {
  currentUser: User | null;
  posts: SocialPost[];
  users: User[];
  departments: CompanyDepartment[];
  roles: CompanyRole[];
  onCreatePost: (newPost: Omit<SocialPost, 'id' | 'createdAt' | 'likes' | 'comments'>) => void;
  onToggleLikePost: (postId: string) => void;
  onAddComment: (postId: string, content: string) => void;
  onDeleteComment: (postId: string, commentId: string) => void;
  onDeletePost: (postId: string) => void;
  onShowToast: (message: string, type?: 'success' | 'info' | 'error') => void;
}

const LOCATION_OPTIONS = [
  'Workshop Sablon Lantai 1',
  'Studio Desain & Pola',
  'Lini Penjahitan Workshop',
  'Area QC & Packing',
  'Gudang Bahan Baku & Logistik',
  'Pantry & Lounge Karyawan',
  'Ruang Meeting Kantor',
  'Lobi & Resepsionis',
  'Area Ekspedisi & Pengiriman',
];

const MOOD_OPTIONS = [
  { label: 'Semangat Kerja', emoji: '🔥' },
  { label: 'Kreatif & Fokus', emoji: '🎨' },
  { label: 'Rehat Kopi', emoji: '☕' },
  { label: 'Rehat & Ceria', emoji: '🍕' },
  { label: 'Target Tercapai', emoji: '🎯' },
  { label: 'Fokus Bekerja', emoji: '🪡' },
  { label: 'Kompak & Solid', emoji: '🤝' },
  { label: 'Lembur Asik', emoji: '🌙' },
];

const QUICK_EMOJIS = ['🔥', '👏', '☕', '❤️', '💪', '🚀', '🙌', '💯'];

export const SocialFeedView: React.FC<SocialFeedViewProps> = ({
  currentUser,
  posts,
  users,
  departments,
  roles,
  onCreatePost,
  onToggleLikePost,
  onAddComment,
  onDeleteComment,
  onDeletePost,
  onShowToast,
}) => {
  // Filters & Tabs
  const [activeFilter, setActiveFilter] = useState<'all' | 'mine' | 'popular' | 'dept'>('all');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Create Post Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [captionInput, setCaptionInput] = useState('');
  const [selectedPhotoUrl, setSelectedPhotoUrl] = useState('');
  const [locationTag, setLocationTag] = useState('');
  const [moodTag, setMoodTag] = useState('');
  const [photoSourceTab, setPhotoSourceTab] = useState<'upload' | 'preset'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Comment inputs keyed by postId
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  // Expanded comments section keyed by postId
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  // Lightbox modal state
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; author: string } | null>(null);

  // Likes list modal state
  const [viewingLikesPost, setViewingLikesPost] = useState<SocialPost | null>(null);

  // Format relative time helper
  const getRelativeTime = (isoString: string) => {
    try {
      const now = new Date();
      const past = new Date(isoString);
      const diffSec = Math.floor((now.getTime() - past.getTime()) / 1000);

      if (diffSec < 60) return 'Baru saja';
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} menit lalu`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} jam lalu`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Kemarin';
      if (diffDays < 7) return `${diffDays} hari lalu`;

      return past.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Beberapa saat lalu';
    }
  };

  // Get user role display
  const getUserBadge = (userRole?: string) => {
    if (!userRole) return { label: 'Karyawan', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
    const matched = roles.find((r) => r.name.toLowerCase() === userRole.toLowerCase() || r.id === userRole);
    if (matched) {
      return {
        label: matched.name,
        color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
      };
    }
    return { label: userRole, color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
  };

  // Handle image upload from file system
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      onShowToast('Silakan pilih file gambar valid (JPG, PNG, WebP).', 'error');
      return;
    }

    // Limit 8MB
    if (file.size > 8 * 1024 * 1024) {
      onShowToast('Ukuran file foto maksimal 8 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setSelectedPhotoUrl(event.target.result as string);
        onShowToast('Foto berhasil dimuat. Siap diposting!', 'success');
      }
    };
    reader.readAsDataURL(file);
  };

  // Select a preset photo
  const handleSelectPreset = (preset: WorkPhotoPreset) => {
    setSelectedPhotoUrl(preset.url);
    if (!captionInput) {
      setCaptionInput(preset.suggestedCaption);
    }
    if (!locationTag) {
      setLocationTag(preset.suggestedLocation);
    }
    if (!moodTag) {
      setMoodTag(preset.suggestedMood);
    }
    onShowToast(`Foto "${preset.title}" dipilih!`, 'info');
  };

  // Submit new post
  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      onShowToast('Silakan pilih akun aktif terlebih dahulu.', 'error');
      return;
    }

    if (!selectedPhotoUrl) {
      onShowToast('Silakan unggah foto atau pilih salah satu preset foto kerja.', 'error');
      return;
    }

    if (!captionInput.trim()) {
      onShowToast('Tuliskan sedikit cerita atau caption untuk foto Anda.', 'error');
      return;
    }

    onCreatePost({
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      userRole: currentUser.role,
      userDepartment: currentUser.department,
      caption: captionInput.trim(),
      photoUrl: selectedPhotoUrl,
      locationTag: locationTag || undefined,
      moodTag: moodTag || undefined,
    });

    // Reset form
    setCaptionInput('');
    setSelectedPhotoUrl('');
    setLocationTag('');
    setMoodTag('');
    setIsCreateModalOpen(false);
    onShowToast('Momen kerja Anda berhasil dibagikan ke beranda!', 'success');
  };

  // Submit comment
  const handleCommentSubmit = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    if (!currentUser) {
      onShowToast('Pilih akun untuk berkomentar.', 'error');
      return;
    }

    onAddComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    // Automatically open comments if closed
    setExpandedComments((prev) => ({ ...prev, [postId]: true }));
    onShowToast('Komentar berhasil dikirim!', 'success');
  };

  // Append emoji to comment input
  const handleAddEmojiToComment = (postId: string, emoji: string) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: (prev[postId] || '') + emoji,
    }));
  };

  // Filtered & Sorted posts
  const filteredPosts = useMemo(() => {
    let list = [...posts];

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.caption.toLowerCase().includes(q) ||
          p.userName.toLowerCase().includes(q) ||
          p.userDepartment.toLowerCase().includes(q) ||
          (p.locationTag && p.locationTag.toLowerCase().includes(q)) ||
          (p.moodTag && p.moodTag.toLowerCase().includes(q))
      );
    }

    // Tab filter
    if (activeFilter === 'mine' && currentUser) {
      list = list.filter((p) => p.userId === currentUser.id);
    } else if (activeFilter === 'popular') {
      list.sort((a, b) => b.likes.length - a.likes.length);
    } else if (activeFilter === 'dept' && selectedDeptFilter !== 'ALL') {
      list = list.filter((p) => p.userDepartment === selectedDeptFilter);
    } else {
      // Default: chronological newest first
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return list;
  }, [posts, activeFilter, selectedDeptFilter, searchQuery, currentUser]);

  // Active top contributors for sidebar
  const topContributors = useMemo(() => {
    const countMap: Record<string, { count: number; user: User | null }> = {};
    posts.forEach((p) => {
      if (!countMap[p.userId]) {
        const u = users.find((usr) => usr.id === p.userId) || null;
        countMap[p.userId] = { count: 0, user: u };
      }
      countMap[p.userId].count += 1;
    });

    return Object.entries(countMap)
      .map(([userId, val]) => ({
        userId,
        count: val.count,
        user: val.user,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [posts, users]);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-sky-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-12 top-4 opacity-15 hidden md:block pointer-events-none">
          <Camera className="w-32 h-32" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Beranda Sosial Rekan Kerja • Momen Hari Ini</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Feed Kerja & Kabar Kantor
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            Bagikan potret keseruan, candid momen kerja, hasil sablon & jahitan, rehat kopi di pantry, hingga suka duka lembur bareng tim tercinta!
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              id="open-create-post-banner-btn"
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold text-sm shadow-md transition-all transform active:scale-95"
            >
              <Camera className="w-4 h-4 text-indigo-600" />
              <span>Posting Momen Kerja</span>
            </button>
            <span className="text-xs text-indigo-200">
              {posts.length} momen kerja telah dibagikan
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Feed Column (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Post Box (Like Social Media) */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser?.name || 'User'}
                className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
              />
              <button
                id="quick-post-input-trigger"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex-1 text-left px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-medium transition-colors border border-transparent hover:border-indigo-300 dark:hover:border-indigo-700"
              >
                Hai {currentUser?.name ? currentUser.name.split(' ')[0] : 'Rekan'}, ada foto atau momen seru apa saat kerja hari ini?
              </button>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <button
                type="button"
                onClick={() => {
                  setPhotoSourceTab('upload');
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-emerald-600 dark:text-emerald-400"
              >
                <Camera className="w-4 h-4" />
                <span>Unggah Foto</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPhotoSourceTab('preset');
                  setIsCreateModalOpen(true);
                }}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-indigo-600 dark:text-indigo-400"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Preset Momen</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-amber-600 dark:text-amber-400"
              >
                <Smile className="w-4 h-4" />
                <span>Mood & Tagar</span>
              </button>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              <button
                id="filter-feed-all"
                onClick={() => setActiveFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                Semua Momen ({posts.length})
              </button>
              <button
                id="filter-feed-popular"
                onClick={() => setActiveFilter('popular')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                  activeFilter === 'popular'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-amber-300" />
                <span>Paling Ramai</span>
              </button>
              {currentUser && (
                <button
                  id="filter-feed-mine"
                  onClick={() => setActiveFilter('mine')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeFilter === 'mine'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Momen Saya
                </button>
              )}
            </div>

            {/* Department Filter & Search */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-44">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari caption / nama..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {departments.length > 0 && (
                <select
                  value={selectedDeptFilter}
                  onChange={(e) => {
                    setSelectedDeptFilter(e.target.value);
                    setActiveFilter('dept');
                  }}
                  className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="ALL">Semua Divisi</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Posts Stream */}
          {filteredPosts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-500">
                <Camera className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Belum Ada Momen Kerja Ditemukan
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {searchQuery
                  ? `Tidak ada postingan yang sesuai dengan kata kunci "${searchQuery}". Coba kata kunci lain.`
                  : 'Jadilah orang pertama yang membagikan momen seru saat bekerja hari ini!'}
              </p>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors"
              >
                + Buat Postingan Baru
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map((post) => {
                const isLikedByMe = currentUser ? post.likes.includes(currentUser.id) : false;
                const isMyPost = currentUser?.id === post.userId;
                const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
                const roleBadge = getUserBadge(post.userRole);
                const areCommentsOpen = expandedComments[post.id] ?? true; // Default open for friendly chat

                return (
                  <article
                    key={post.id}
                    id={`post-card-${post.id}`}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md"
                  >
                    {/* Post Header */}
                    <div className="p-4 sm:p-5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <img
                          src={post.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={post.userName}
                          className="w-11 h-11 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shrink-0"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                              {post.userName}
                            </h4>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleBadge.color}`}>
                              {roleBadge.label}
                            </span>
                          </div>
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 space-x-2 mt-0.5">
                            <span className="font-medium text-slate-600 dark:text-slate-300">
                              {post.userDepartment}
                            </span>
                            <span>•</span>
                            <span className="flex items-center space-x-1">
                              <Clock className="w-3 h-3 inline" />
                              <span>{getRelativeTime(post.createdAt)}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Post Actions (Delete if owner or Super Admin) */}
                      {(isMyPost || isSuperAdmin) && (
                        <button
                          type="button"
                          id={`delete-post-${post.id}`}
                          onClick={() => {
                            if (window.confirm('Yakin ingin menghapus postingan momen kerja ini?')) {
                              onDeletePost(post.id);
                              onShowToast('Postingan berhasil dihapus.', 'info');
                            }
                          }}
                          title="Hapus Postingan"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Location & Mood Tags if present */}
                    {(post.locationTag || post.moodTag) && (
                      <div className="px-4 sm:px-5 pb-2.5 flex flex-wrap gap-2 text-xs">
                        {post.locationTag && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 font-medium">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>{post.locationTag}</span>
                          </span>
                        )}
                        {post.moodTag && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-medium border border-amber-200/50 dark:border-amber-900/50">
                            <span>{post.moodTag}</span>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Caption Text */}
                    <div className="px-4 sm:px-5 pb-3">
                      <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                        {post.caption}
                      </p>
                    </div>

                    {/* Post Photo (High Quality with Lightbox trigger) */}
                    <div className="relative group bg-slate-950 overflow-hidden cursor-pointer"
                      onClick={() =>
                        setLightboxImage({
                          url: post.photoUrl,
                          title: post.caption,
                          author: post.userName,
                        })
                      }
                    >
                      <img
                        src={post.photoUrl}
                        alt="Momen Kerja"
                        className="w-full max-h-[500px] object-cover sm:object-contain mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="px-3 py-1.5 rounded-full bg-black/60 text-white text-xs font-semibold backdrop-blur-sm flex items-center space-x-1.5">
                          <ZoomIn className="w-3.5 h-3.5" />
                          <span>Klik untuk Perbesar</span>
                        </span>
                      </div>
                    </div>

                    {/* Likes & Comments Summary Counter */}
                    <div className="px-4 sm:px-5 py-2.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        {post.likes.length > 0 ? (
                          <button
                            type="button"
                            onClick={() => setViewingLikesPost(post)}
                            className="flex items-center space-x-1 hover:underline text-slate-700 dark:text-slate-300 font-medium"
                          >
                            <span className="w-4 h-4 rounded-full bg-rose-500 text-white inline-flex items-center justify-center text-[10px]">
                              ❤️
                            </span>
                            <span>{post.likes.length} Suka</span>
                          </button>
                        ) : (
                          <span>Belum ada suka</span>
                        )}
                      </div>
                      <div>
                        <span>{post.comments.length} Komentar</span>
                      </div>
                    </div>

                    {/* Interactive Action Bar (Like, Comment, Share) */}
                    <div className="px-4 sm:px-5 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                      {/* Like Button */}
                      <button
                        type="button"
                        id={`like-btn-${post.id}`}
                        onClick={() => {
                          onToggleLikePost(post.id);
                          if (!isLikedByMe) {
                            onShowToast(`Anda menyukai postingan ${post.userName}! ❤️`, 'success');
                          }
                        }}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                          isLikedByMe
                            ? 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30'
                            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 transition-transform active:scale-125 ${
                            isLikedByMe ? 'fill-rose-500 text-rose-500' : ''
                          }`}
                        />
                        <span>{isLikedByMe ? 'Disukai' : 'Suka'}</span>
                      </button>

                      {/* Comment Toggle Button */}
                      <button
                        type="button"
                        id={`comment-toggle-${post.id}`}
                        onClick={() =>
                          setExpandedComments((prev) => ({
                            ...prev,
                            [post.id]: !areCommentsOpen,
                          }))
                        }
                        className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>Komentar ({post.comments.length})</span>
                      </button>

                      {/* Share / Copy Button */}
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard?.writeText(
                            `"${post.caption}" - Momen kerja oleh ${post.userName} di ${post.userDepartment}`
                          );
                          onShowToast('Teks momen kerja disalin ke clipboard!', 'info');
                        }}
                        className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Share2 className="w-4 h-4" />
                        <span>Salin</span>
                      </button>
                    </div>

                    {/* Comments Section */}
                    {areCommentsOpen && (
                      <div className="p-4 sm:p-5 bg-slate-50/70 dark:bg-slate-900/50 space-y-4">
                        {/* List of Existing Comments */}
                        {post.comments.length > 0 && (
                          <div className="space-y-3">
                            {post.comments.map((comm) => {
                              const isMyComment = currentUser?.id === comm.userId;
                              const canDeleteComment = isMyComment || isSuperAdmin;
                              return (
                                <div key={comm.id} className="flex items-start space-x-3 group">
                                  <img
                                    src={comm.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                                    alt={comm.userName}
                                    className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 mt-0.5"
                                  />
                                  <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl px-4 py-2.5 border border-slate-200/80 dark:border-slate-700/80 shadow-xs relative">
                                    <div className="flex items-center justify-between mb-1">
                                      <div className="flex items-center space-x-1.5">
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                                          {comm.userName}
                                        </span>
                                        {comm.userDepartment && (
                                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                            • {comm.userDepartment}
                                          </span>
                                        )}
                                      </div>
                                      <span className="text-[10px] text-slate-400">
                                        {getRelativeTime(comm.createdAt)}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                                      {comm.content}
                                    </p>

                                    {/* Delete Comment Button */}
                                    {canDeleteComment && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (window.confirm('Hapus komentar ini?')) {
                                            onDeleteComment(post.id, comm.id);
                                            onShowToast('Komentar dihapus.', 'info');
                                          }
                                        }}
                                        title="Hapus Komentar"
                                        className="absolute right-2.5 top-2.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 transition-opacity"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Add Comment Input */}
                        <div className="flex items-start space-x-3 pt-1">
                          <img
                            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={currentUser?.name || 'Me'}
                            className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 shrink-0 mt-1"
                          />
                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                id={`comment-input-${post.id}`}
                                placeholder={`Tulis komentar sebagai ${currentUser?.name ? currentUser.name.split(' ')[0] : 'Karyawan'}...`}
                                value={commentInputs[post.id] || ''}
                                onChange={(e) =>
                                  setCommentInputs((prev) => ({
                                    ...prev,
                                    [post.id]: e.target.value,
                                  }))
                                }
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleCommentSubmit(post.id);
                                  }
                                }}
                                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                type="button"
                                id={`send-comment-${post.id}`}
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={!commentInputs[post.id]?.trim()}
                                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-all shrink-0"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Quick Emoji Bar */}
                            <div className="flex items-center space-x-1 text-xs">
                              <span className="text-[10px] text-slate-400 mr-1">Reaksi cepat:</span>
                              {QUICK_EMOJIS.map((em) => (
                                <button
                                  key={em}
                                  type="button"
                                  onClick={() => handleAddEmojiToComment(post.id, em)}
                                  className="px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs"
                                >
                                  {em}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Sidebar: Active Contributors & Workplace Moments Guide */}
        <div className="space-y-6">
          {/* Active Employee Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Profil Pengunggah Aktif
            </h3>
            {currentUser ? (
              <div className="flex items-center space-x-3.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-indigo-500 shrink-0"
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {currentUser.name}
                  </h4>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium truncate">
                    {currentUser.position}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {currentUser.department}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">Tidak ada user aktif.</p>
            )}

            <button
              type="button"
              id="sidebar-create-post-btn"
              onClick={() => setIsCreateModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>+ Posting Momen Baru</span>
            </button>
          </div>

          {/* Top Active Contributors */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Rekan Paling Aktif Berbagi</span>
              </h3>
            </div>

            <div className="space-y-3">
              {topContributors.map((tc, idx) => {
                const u = tc.user;
                if (!u) return null;
                return (
                  <div key={tc.userId} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                          {u.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {u.department}
                        </p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold text-[11px] shrink-0">
                      {tc.count} foto
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Workplace Ethics & Culture Box */}
          <div className="bg-gradient-to-br from-indigo-50 to-sky-50 dark:from-slate-800/80 dark:to-indigo-950/40 rounded-2xl p-5 border border-indigo-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 font-bold text-xs">
              <Coffee className="w-4 h-4" />
              <span>Budaya & Keseruan Kerja</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Foto-foto di beranda ini mempererat keakraban antar divisi di workshop dan kantor. Tetap utamakan keselamatan kerja (K3) dan saling beri dukungan serta apresiasi hangat untuk setiap rekan!
            </p>
            <div className="pt-1 flex flex-wrap gap-1.5">
              {['#SemangatPagi', '#ProduksiSolid', '#SablonKeren', '#JumatBerkah', '#TimKompak'].map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 shadow-2xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL BUAT POSTINGAN BARU ================= */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Posting Momen Kerja
                </h3>
              </div>
              <button
                type="button"
                id="close-create-post-modal"
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitPost} className="p-5 overflow-y-auto space-y-4 flex-1">
              {/* User Identity Info */}
              {currentUser && (
                <div className="flex items-center space-x-3 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20 shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {currentUser.position} • {currentUser.department}
                    </span>
                  </div>
                </div>
              )}

              {/* Caption Textarea */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Cerita / Caption Momen Kerja
                </label>
                <textarea
                  id="post-caption-input"
                  rows={3}
                  required
                  placeholder="Ceritakan apa yang lagi seru atau terjadi saat kerja hari ini..."
                  value={captionInput}
                  onChange={(e) => setCaptionInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Photo Source Tabs (Upload vs Preset) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Pilih / Unggah Foto
                  </label>
                  <div className="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab('upload')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        photoSourceTab === 'upload'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Unggah File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhotoSourceTab('preset')}
                      className={`px-3 py-1 rounded-md transition-colors ${
                        photoSourceTab === 'preset'
                          ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      Preset Momen ({WORK_PHOTO_PRESETS.length})
                    </button>
                  </div>
                </div>

                {/* Upload Tab */}
                {photoSourceTab === 'upload' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40"
                    >
                      <Camera className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Klik untuk unggah foto dari galeri / kamera HP / Laptop
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Mendukung format JPG, PNG, WebP (Maksimal 8 MB)
                      </p>
                    </div>
                  </div>
                )}

                {/* Preset Tab */}
                {photoSourceTab === 'preset' && (
                  <div className="space-y-2">
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Pilih dari preset foto kerja realistis industri apparel, sablon, desain, atau rehat pantry:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                      {WORK_PHOTO_PRESETS.map((preset) => {
                        const isSelected = selectedPhotoUrl === preset.url;
                        return (
                          <div
                            key={preset.id}
                            onClick={() => handleSelectPreset(preset)}
                            className={`relative rounded-xl overflow-hidden border cursor-pointer group transition-all ${
                              isSelected
                                ? 'border-indigo-600 ring-2 ring-indigo-500'
                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                          >
                            <img
                              src={preset.url}
                              alt={preset.title}
                              className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="p-1.5 bg-white dark:bg-slate-800">
                              <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">
                                {preset.title}
                              </p>
                              <span className="text-[9px] text-indigo-600 dark:text-indigo-400">
                                {preset.category}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                                <Check className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Selected Photo Preview */}
                {selectedPhotoUrl && (
                  <div className="relative mt-2 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-900">
                    <img
                      src={selectedPhotoUrl}
                      alt="Pratinjau Foto"
                      className="w-full max-h-48 object-contain mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => setSelectedPhotoUrl('')}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white transition-colors"
                      title="Hapus foto"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Location Tag & Mood Tag Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Location */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Lokasi / Area Kerja</span>
                  </label>
                  <select
                    value={locationTag}
                    onChange={(e) => setLocationTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Lokasi Kerja --</option>
                    {LOCATION_OPTIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mood Tag */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1">
                    <Smile className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mood / Tagar Suasana</span>
                  </label>
                  <select
                    value={moodTag}
                    onChange={(e) => setMoodTag(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Pilih Suasana Kerja --</option>
                    {MOOD_OPTIONS.map((m) => (
                      <option key={m.label} value={`${m.label} ${m.emoji}`}>
                        {m.emoji} {m.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  id="submit-create-post-btn"
                  disabled={!selectedPhotoUrl || !captionInput.trim()}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition-all"
                >
                  Bagikan ke Beranda
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= LIGHTBOX IMAGE MODAL ================= */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] flex flex-col items-center"
          >
            <button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="absolute -top-10 right-0 p-1.5 rounded-full bg-white/20 hover:bg-white/40 text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxImage.url}
              alt="Momen Kerja HD"
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain shadow-2xl"
            />
            <div className="mt-3 text-center text-white px-4">
              <p className="text-sm font-semibold">{lightboxImage.author}</p>
              <p className="text-xs text-slate-300 max-w-xl mx-auto truncate">
                {lightboxImage.title}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW LIKES LIST MODAL ================= */}
      {viewingLikesPost && (
        <div
          onClick={() => setViewingLikesPost(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 rounded-full bg-rose-500 text-white flex items-center justify-center text-xs">
                  ❤️
                </span>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Disukai oleh ({viewingLikesPost.likes.length})
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setViewingLikesPost(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto">
              {viewingLikesPost.likes.map((likeUserId) => {
                const likedUser = users.find((u) => u.id === likeUserId);
                if (!likedUser) return null;
                return (
                  <div key={likeUserId} className="flex items-center space-x-3">
                    <img
                      src={likedUser.avatar}
                      alt={likedUser.name}
                      className="w-9 h-9 rounded-full object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {likedUser.name}
                      </p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {likedUser.position} • {likedUser.department}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
