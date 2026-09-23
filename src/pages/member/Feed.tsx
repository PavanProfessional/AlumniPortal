import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import clsx from 'clsx'
import {
  Rss, Users, CalendarDays, MessagesSquare, Briefcase, Handshake, ImagePlus, Paperclip,
  Video, Hash, AtSign, Send, MessageCircle, Share2, Bookmark, ThumbsUp, PartyPopper,
  HeartHandshake, Heart, Lightbulb, X, MoreHorizontal, SquarePen, Search, ChevronRight,
  Loader2, CheckCircle2,
} from 'lucide-react'
import { Card, Avatar, Button, IconButton, SearchInput, EmptyState } from '../../components/ui/Primitives'
import { Badge, type BadgeTone } from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { useAppState } from '../../context/AppStateContext'
import { buildFeedPosts, feedAuthors } from '../../data/feed'
import { communities, myGroupIds } from '../../data/communities'
import { events } from '../../data/events'
import { people } from '../../data/people'
import { NOW, formatRelative, formatDate } from '../../utils/dates'
import { formatCompact } from '../../utils/format'
import type { FeedAuthor, FeedComment, FeedPost, FeedPostKind, ReactionType } from '../../types'

const reactionMeta: Record<ReactionType, { label: string; icon: typeof ThumbsUp; tone: string }> = {
  like: { label: 'Like', icon: ThumbsUp, tone: 'text-sky-500' },
  celebrate: { label: 'Celebrate', icon: PartyPopper, tone: 'text-amber-500' },
  support: { label: 'Support', icon: HeartHandshake, tone: 'text-violet-500' },
  love: { label: 'Love', icon: Heart, tone: 'text-rose-500' },
  insightful: { label: 'Insightful', icon: Lightbulb, tone: 'text-emerald-500' },
}
const reactionOrder: ReactionType[] = ['like', 'celebrate', 'support', 'love', 'insightful']

const kindLabel: Record<FeedPostKind, string> = {
  update: 'Update', milestone: 'Milestone', announcement: 'Announcement', event: 'Event', job: 'Hiring', festival: 'Campus',
}
const kindTone: Record<FeedPostKind, BadgeTone> = {
  update: 'neutral', milestone: 'success', announcement: 'brand', event: 'info', job: 'warning', festival: 'brand',
}

const quickNav = [
  { label: 'Feed', to: '/app/feed', icon: Rss, active: true },
  { label: 'Directory', to: '/app/directory', icon: Users },
  { label: 'Events', to: '/app/events', icon: CalendarDays },
  { label: 'Communities', to: '/app/communities', icon: MessagesSquare },
  { label: 'Careers', to: '/app/careers', icon: Briefcase },
  { label: 'Mentorship', to: '/app/mentorship', icon: Handshake },
]

const MAX_IMAGE_BYTES = 4 * 1024 * 1024

function reactionTotal(r: FeedPost['reactions']): number {
  return r.like + r.celebrate + r.support + r.love + r.insightful
}

function handleFor(firstName: string, lastName: string) {
  return `${firstName}${lastName}`.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export default function MemberFeed() {
  const { currentUser } = useAppState()
  const notify = useToast()
  const [posts, setPosts] = useState<FeedPost[]>(() => buildFeedPosts())
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'All' | 'Institution' | 'Alumni'>('All')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({})
  const [draftContent, setDraftContent] = useState('')
  const [draftImage, setDraftImage] = useState<string | undefined>()
  const [messageQuery, setMessageQuery] = useState('')
  const [messageTab, setMessageTab] = useState<'Primary' | 'General' | 'Requests'>('Primary')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const PAGE_SIZE = 6
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const joinedCommunities = useMemo(() => communities.filter((g) => myGroupIds.includes(g.id)), [])
  const messageContacts = useMemo(() => people.slice(20, 29).map((p, i) => ({ ...p, online: i % 3 !== 0 })), [])
  const filteredContacts = messageContacts.filter((c) => `${c.firstName} ${c.lastName}`.toLowerCase().includes(messageQuery.trim().toLowerCase()))
  const upcomingEvents = useMemo(
    () => events.filter((e) => new Date(e.startAt) > NOW && e.status !== 'cancelled' && e.status !== 'draft').slice(0, 3),
    [],
  )
  const myPostCount = posts.filter((p) => p.authorId === currentUser.id).length

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return posts.filter((p) => {
      const author = feedAuthors[p.authorId]
      if (filter === 'Institution' && author?.kind !== 'institution') return false
      if (filter === 'Alumni' && author?.kind !== 'alumni') return false
      if (!q) return true
      return `${p.content} ${author?.name ?? ''}`.toLowerCase().includes(q)
    })
  }, [posts, query, filter])

  const visiblePosts = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length

  // Reset the window whenever the search/filter changes the underlying list.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [query, filter])

  // Infinite scroll: fetch the next page when the sentinel below the list enters view.
  useEffect(() => {
    const el = sentinelRef.current
    if (!el || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true)
          window.setTimeout(() => {
            setVisibleCount((c) => Math.min(c + PAGE_SIZE, filtered.length))
            setLoadingMore(false)
          }, 700)
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [hasMore, filtered.length])

  function setReaction(postId: string, type: ReactionType) {
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p
      const reactions = { ...p.reactions }
      if (p.myReaction) reactions[p.myReaction] = Math.max(0, reactions[p.myReaction] - 1)
      const myReaction = p.myReaction === type ? null : type
      if (myReaction) reactions[myReaction] += 1
      return { ...p, reactions, myReaction }
    }))
  }

  function toggleSave(postId: string) {
    setPosts((prev) => prev.map((p) => {
      if (p.id !== postId) return p
      const saved = !p.saved
      notify({ message: saved ? 'Saved for later' : 'Removed from saved', type: 'success', position: 'top-right' })
      return { ...p, saved }
    }))
  }

  function share(postId: string) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, shareCount: p.shareCount + 1 } : p)))
    notify({ message: 'Shared to your network', type: 'success', position: 'top-right' })
  }

  function toggleExpand(postId: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(postId)) next.delete(postId)
      else next.add(postId)
      return next
    })
  }

  function submitComment(postId: string) {
    const text = (commentDrafts[postId] ?? '').trim()
    if (!text) return
    const comment: FeedComment = { id: `${postId}_c${Date.now()}`, authorId: currentUser.id, content: text, createdAt: NOW.toISOString(), likeCount: 0 }
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p)))
    setCommentDrafts((prev) => ({ ...prev, [postId]: '' }))
    setExpanded((prev) => new Set(prev).add(postId))
  }

  function handleComposerImage(file: File | undefined | null) {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      notify({ message: 'Unsupported file type', description: 'Please attach a PNG, JPG or GIF image.', type: 'error', position: 'top-right' })
      return
    }
    if (file.size > MAX_IMAGE_BYTES) {
      notify({ message: 'Image too large', description: 'Please attach an image under 4MB.', type: 'error', position: 'top-right' })
      return
    }
    const reader = new FileReader()
    reader.onload = () => setDraftImage(reader.result as string)
    reader.readAsDataURL(file)
  }

  function publishPost() {
    if (!draftContent.trim()) return
    const post: FeedPost = {
      id: `post_me_${Date.now()}`,
      authorId: currentUser.id,
      kind: 'update',
      content: draftContent.trim(),
      media: draftImage ? [{ type: 'image', url: draftImage }] : undefined,
      createdAt: NOW.toISOString(),
      reactions: { like: 0, celebrate: 0, support: 0, love: 0, insightful: 0 },
      myReaction: null,
      comments: [],
      shareCount: 0,
      saved: false,
      tags: ['Alumni update'],
    }
    setPosts((prev) => [post, ...prev])
    setDraftContent('')
    setDraftImage(undefined)
    notify({ message: 'Post shared with your network', type: 'success', position: 'top-right' })
  }

  const comingSoon = (what: string) => () => notify({ message: `${what} is coming soon`, type: 'info', position: 'top-right' })

  return (
    <div className="h-[calc(100vh-7rem)] overflow-hidden">
      <div className="grid h-full min-h-0 grid-cols-1 gap-5 xl:grid-cols-[264px_minmax(0,1fr)_300px] xl:items-stretch">
        {/* ---------------- LEFT COLUMN (fixed — does not scroll with the feed) ---------------- */}
        <div className="hidden h-full min-h-0 gap-5 overflow-y-auto pr-1 no-scrollbar xl:flex xl:flex-col">
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} color={currentUser.avatarColor} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink-900 dark:text-ink-50">{currentUser.firstName} {currentUser.lastName}</p>
                <p className="truncate text-xs text-ink-400">@{handleFor(currentUser.firstName, currentUser.lastName)}</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 divide-x divide-ink-100 border-t border-ink-100 pt-3.5 text-center dark:divide-ink-800 dark:border-ink-800">
              <div>
                <p className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{myPostCount}</p>
                <p className="text-[10px] text-ink-400">Posts</p>
              </div>
              <div>
                <p className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{joinedCommunities.length}</p>
                <p className="text-[10px] text-ink-400">Communities</p>
              </div>
              <div>
                <p className="font-display text-base font-bold text-ink-900 dark:text-ink-50">{currentUser.engagementScore}</p>
                <p className="text-[10px] text-ink-400">Engagement</p>
              </div>
            </div>
          </Card>

          <Card className="p-2">
            {quickNav.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className={clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                  item.active ? 'bg-brand-600 font-medium text-white' : 'text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800',
                )}
              >
                <item.icon className="h-4 w-4" /> {item.label}
              </Link>
            ))}
          </Card>

          <Card className="p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-ink-400">My Communities</p>
            <div className="mt-3 space-y-2.5">
              {joinedCommunities.map((g) => (
                <Link key={g.id} to={`/app/communities/${g.id}`} className="flex items-center gap-2.5 text-sm text-ink-700 hover:text-brand-600 dark:text-ink-200">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white" style={{ backgroundColor: g.coverColor }}>
                    {g.name.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="truncate">{g.name}</span>
                </Link>
              ))}
            </div>
            <Link to="/app/communities" className="mt-3 inline-block text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">View All</Link>
          </Card>
        </div>

        {/* ---------------- CENTER COLUMN (only this scrolls) ---------------- */}
        <div className="flex h-full min-h-0 min-w-0 flex-col">
        <div className="shrink-0 space-y-5">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} color={currentUser.avatarColor} size="md" />
              <input
                value={draftContent}
                onChange={(e) => setDraftContent(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); publishPost() } }}
                placeholder="What's on your mind?"
                className="h-11 flex-1 rounded-full border border-ink-200 bg-ink-50 px-4 text-sm placeholder:text-ink-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-800/60 dark:text-ink-100"
              />
              <Button icon={<Send className="h-4 w-4" />} disabled={!draftContent.trim()} onClick={publishPost}>Share Post</Button>
            </div>
            {draftImage && (
              <div className="relative mt-3 overflow-hidden rounded-lg border border-ink-200 dark:border-ink-700">
                <img src={draftImage} alt="Attachment preview" className="max-h-64 w-full object-cover" />
                <button onClick={() => setDraftImage(undefined)} className="absolute right-2 top-2 rounded-full bg-ink-900/70 p-1 text-white hover:bg-ink-900">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-ink-100 pt-3 dark:border-ink-800">
              <div className="flex flex-wrap items-center gap-4">
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-brand-600 dark:text-ink-400">
                  <ImagePlus className="h-4 w-4 text-emerald-500" /> Image/Video
                </button>
                <button onClick={comingSoon('Attachments')} className="flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-brand-600 dark:text-ink-400">
                  <Paperclip className="h-4 w-4 text-amber-500" /> Attachment
                </button>
                <button onClick={comingSoon('Live video')} className="flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-brand-600 dark:text-ink-400">
                  <Video className="h-4 w-4 text-rose-500" /> Live
                </button>
                <button onClick={comingSoon('Hashtags')} className="flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-brand-600 dark:text-ink-400">
                  <Hash className="h-4 w-4 text-sky-500" /> Hashtag
                </button>
                <button onClick={comingSoon('Mentions')} className="flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-brand-600 dark:text-ink-400">
                  <AtSign className="h-4 w-4 text-violet-500" /> Mention
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleComposerImage(e.target.files?.[0])} />
              </div>
              <span className="text-xs text-ink-400">Public</span>
            </div>
          </Card>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput placeholder="Search posts and people…" value={query} onChange={(e) => setQuery(e.target.value)} className="sm:max-w-sm" />
            <div className="flex flex-wrap gap-2">
              {(['All', 'Institution', 'Alumni'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={clsx(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    filter === f ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-ink-300 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-300',
                  )}
                >
                  {f === 'All' ? 'All posts' : f}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <EmptyState icon={<Rss className="h-5 w-5" />} title="No posts found" description="Try a different search or filter." />
          ) : (
            <div className="space-y-5 pb-6">
              {visiblePosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  author={feedAuthors[post.authorId]}
                  currentUser={currentUser}
                  isExpanded={expanded.has(post.id)}
                  onToggleExpand={() => toggleExpand(post.id)}
                  onReact={(type) => setReaction(post.id, type)}
                  onSave={() => toggleSave(post.id)}
                  onShare={() => share(post.id)}
                  commentDraft={commentDrafts[post.id] ?? ''}
                  onCommentDraftChange={(v) => setCommentDrafts((prev) => ({ ...prev, [post.id]: v }))}
                  onSubmitComment={() => submitComment(post.id)}
                />
              ))}

              <div ref={sentinelRef} className="h-px" />

              {loadingMore && (
                <div className="flex items-center justify-center gap-2 py-2 text-sm text-ink-400">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading more posts…
                </div>
              )}
              {!hasMore && !loadingMore && (
                <div className="flex items-center justify-center gap-2 py-2 text-xs text-ink-400">
                  <CheckCircle2 className="h-3.5 w-3.5" /> You're all caught up
                </div>
              )}
            </div>
          )}
        </div>
        </div>

        {/* ---------------- RIGHT COLUMN (fixed — does not scroll with the feed) ---------------- */}
        <div className="hidden h-full min-h-0 gap-5 overflow-y-auto pl-1 no-scrollbar xl:flex xl:flex-col">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">Messages</p>
              <IconButton title="New message" onClick={comingSoon('Direct messaging')}><SquarePen className="h-4 w-4" /></IconButton>
            </div>
            <div className="relative mt-3">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
              <input
                value={messageQuery}
                onChange={(e) => setMessageQuery(e.target.value)}
                placeholder="Search"
                className="h-8 w-full rounded-lg border border-ink-200 bg-ink-50 pl-8 pr-3 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-800/60 dark:text-ink-100"
              />
            </div>
            <div className="mt-3 flex items-center gap-4 border-b border-ink-100 text-xs font-medium dark:border-ink-800">
              {(['Primary', 'General', 'Requests'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setMessageTab(t)}
                  className={clsx('-mb-px border-b-2 pb-2 transition-colors', messageTab === t ? 'border-brand-600 text-brand-600 dark:text-brand-400' : 'border-transparent text-ink-400 hover:text-ink-600')}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="mt-3 space-y-1">
              {filteredContacts.length === 0 && <p className="py-4 text-center text-xs text-ink-400">No matches.</p>}
              {filteredContacts.map((c) => (
                <button
                  key={c.id}
                  onClick={comingSoon('Direct messaging')}
                  className="flex w-full items-center gap-2.5 rounded-lg px-1.5 py-1.5 text-left hover:bg-ink-50 dark:hover:bg-ink-800/60"
                >
                  <div className="relative shrink-0">
                    <Avatar name={`${c.firstName} ${c.lastName}`} color={c.avatarColor} size="sm" />
                    {c.online && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-accent-500 ring-2 ring-white dark:ring-ink-900" />}
                  </div>
                  <span className="truncate text-sm text-ink-700 dark:text-ink-200">{c.firstName} {c.lastName}</span>
                </button>
              ))}
            </div>
            <button onClick={comingSoon('Direct messaging')} className="mt-2 text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">View All</button>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">Events</p>
              <Link to="/app/events" className="flex items-center text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">View All <ChevronRight className="h-3 w-3" /></Link>
            </div>
            <div className="mt-3 space-y-3">
              {upcomingEvents.length === 0 && <p className="text-xs text-ink-400">No upcoming events right now.</p>}
              {upcomingEvents.map((e) => (
                <Link key={e.id} to={`/app/events/${e.id}`} className="flex items-center gap-3 rounded-lg p-1.5 hover:bg-ink-50 dark:hover:bg-ink-800/60">
                  <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg text-white" style={{ backgroundColor: e.coverColor }}>
                    <span className="text-[9px] font-medium uppercase leading-none">{formatDate(e.startAt, { month: 'short' })}</span>
                    <span className="text-sm font-bold leading-none">{formatDate(e.startAt, { day: 'numeric' })}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink-800 dark:text-ink-100">{e.title}</p>
                    <p className="truncate text-[11px] text-ink-400">{e.mode === 'In-person' ? e.venue : e.mode}</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PostCard({
  post, author, currentUser, isExpanded, onToggleExpand, onReact, onSave, onShare, commentDraft, onCommentDraftChange, onSubmitComment,
}: {
  post: FeedPost
  author?: FeedAuthor
  currentUser: { id: string; firstName: string; lastName: string; avatarColor: string }
  isExpanded: boolean
  onToggleExpand: () => void
  onReact: (type: ReactionType) => void
  onSave: () => void
  onShare: () => void
  commentDraft: string
  onCommentDraftChange: (v: string) => void
  onSubmitComment: () => void
}) {
  const total = reactionTotal(post.reactions)
  const topReactions = reactionOrder.filter((t) => post.reactions[t] > 0).sort((a, b) => post.reactions[b] - post.reactions[a]).slice(0, 3)
  const myMeta = post.myReaction ? reactionMeta[post.myReaction] : reactionMeta.like
  const MyIcon = myMeta.icon
  const visibleComments = isExpanded ? post.comments : post.comments.slice(-2)
  const media = post.media ?? []

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Avatar name={author?.name ?? 'Member'} color={author?.avatarColor} src={author?.avatarImageUrl} size="md" />
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-ink-900 dark:text-ink-50">{author?.name ?? 'Member'}</p>
              {author?.kind === 'institution' && <Badge tone="brand" className="text-[10px]">Official</Badge>}
            </div>
            <p className="text-xs text-ink-400">{author?.meta} · {formatRelative(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge tone={kindTone[post.kind]} className="text-[10px]">{kindLabel[post.kind]}</Badge>
          <IconButton onClick={onSave} title={post.saved ? 'Remove from saved' : 'Save post'}>
            <Bookmark className={clsx('h-4 w-4', post.saved && 'fill-brand-500 text-brand-500')} />
          </IconButton>
          <IconButton title="More"><MoreHorizontal className="h-4 w-4" /></IconButton>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-700 dark:text-ink-200">{post.content}</p>

      {media.length > 0 && (
        <div className={clsx('mt-3 grid gap-1 overflow-hidden rounded-xl border border-ink-100 dark:border-ink-800', media.length > 1 && 'grid-cols-2')}>
          {media.slice(0, 2).map((m, i) => (
            <div key={i} className={clsx('flex items-center justify-center bg-ink-50 dark:bg-ink-900', media.length > 1 ? 'aspect-[4/3]' : 'max-h-[520px]')}>
              <img src={m.url} alt={m.alt ?? ''} className={clsx('h-full w-full', media.length > 1 ? 'object-contain' : 'h-auto max-h-[520px] w-full object-contain')} />
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between border-b border-ink-100 pb-3 text-xs text-ink-400 dark:border-ink-800">
        <div className="flex items-center gap-1">
          {topReactions.map((t) => {
            const Icon = reactionMeta[t].icon
            return <Icon key={t} className={clsx('h-4 w-4', reactionMeta[t].tone)} />
          })}
          <span className="ml-1">{formatCompact(total)}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onToggleExpand} className="hover:underline">{post.comments.length} comments</button>
          <span>{formatCompact(post.shareCount)} shares</span>
        </div>
      </div>

      <div className="mt-1 flex items-center gap-1">
        <div className="group relative flex-1">
          <button
            onClick={() => onReact(post.myReaction ?? 'like')}
            className={clsx(
              'flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-colors hover:bg-ink-100 dark:hover:bg-ink-800',
              post.myReaction ? myMeta.tone : 'text-ink-500 dark:text-ink-400',
            )}
          >
            <MyIcon className="h-4 w-4" /> {post.myReaction ? myMeta.label : 'Like'}
          </button>
          <div className="absolute bottom-full left-0 z-10 mb-1 hidden gap-1 rounded-full border border-ink-200 bg-white p-1 shadow-popover group-hover:flex dark:border-ink-700 dark:bg-ink-900">
            {reactionOrder.map((t) => {
              const Icon = reactionMeta[t].icon
              return (
                <button key={t} onClick={() => onReact(t)} title={reactionMeta[t].label} className="rounded-full p-1.5 transition-transform hover:scale-125 hover:bg-ink-100 dark:hover:bg-ink-800">
                  <Icon className={clsx('h-4 w-4', reactionMeta[t].tone)} />
                </button>
              )
            })}
          </div>
        </div>
        <button onClick={onToggleExpand} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800">
          <MessageCircle className="h-4 w-4" /> Comment
        </button>
        <button onClick={onShare} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium text-ink-500 transition-colors hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800">
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>

      {(isExpanded || post.comments.length > 0) && (
        <div className="mt-3 space-y-2.5 border-t border-ink-100 pt-3 dark:border-ink-800">
          {!isExpanded && post.comments.length > 2 && (
            <button onClick={onToggleExpand} className="text-xs font-medium text-ink-500 hover:underline dark:text-ink-400">
              View all {post.comments.length} comments
            </button>
          )}
          {visibleComments.map((c) => {
            const cAuthor = feedAuthors[c.authorId]
            return (
              <div key={c.id} className="flex items-start gap-2.5">
                <Avatar name={cAuthor?.name ?? 'Member'} color={cAuthor?.avatarColor} size="xs" />
                <div className="min-w-0 flex-1 rounded-2xl bg-ink-50 px-3 py-2 dark:bg-ink-800/60">
                  <p className="text-xs font-semibold text-ink-800 dark:text-ink-100">{cAuthor?.name ?? 'Member'}</p>
                  <p className="text-xs text-ink-600 dark:text-ink-300">{c.content}</p>
                </div>
              </div>
            )
          })}
          <div className="flex items-center gap-2.5 pt-1">
            <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} color={currentUser.avatarColor} size="xs" />
            <input
              value={commentDraft}
              onChange={(e) => onCommentDraftChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); onSubmitComment() } }}
              placeholder="Write a comment…"
              className="h-8 flex-1 rounded-full border border-ink-200 bg-white px-3.5 text-xs focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100"
            />
            <IconButton onClick={onSubmitComment} title="Post comment"><Send className="h-3.5 w-3.5" /></IconButton>
          </div>
        </div>
      )}
    </Card>
  )
}
