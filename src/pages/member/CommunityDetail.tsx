import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Users, Lock, Globe, Heart, MessageCircle, Flag, Send } from 'lucide-react'
import { Card, Button, Avatar, EmptyState } from '../../components/ui/Primitives'
import { Badge } from '../../components/ui/Badge'
import { groupById, postsForGroup, myGroupIds } from '../../data/communities'
import { personById } from '../../data/people'
import { formatRelative } from '../../utils/dates'
import { useAppState } from '../../context/AppStateContext'
import { useToast } from '../../components/ui/Toast'

export default function MemberCommunityDetail() {
  const { groupId } = useParams()
  const group = groupId ? groupById(groupId) : undefined
  const { currentUser } = useAppState()
  const [draft, setDraft] = useState('')
  const [localPosts, setLocalPosts] = useState(() => (groupId ? postsForGroup(groupId) : []))
  const notify = useToast()

  if (!group) return <EmptyState title="Community not found" />
  const joined = myGroupIds.includes(group.id)

  function submitPost() {
    if (!draft.trim()) return
    setLocalPosts((prev) => [{ id: `local_${Date.now()}`, groupId: group!.id, authorId: currentUser.id, content: draft, createdAt: new Date().toISOString(), likeCount: 0, commentCount: 0, flagged: false }, ...prev])
    setDraft('')
    notify({ message: 'Posted to ' + group!.name, type: 'success', position: 'bottom-right' })
  }

  return (
    <div className="space-y-6">
      <Link to="/app/communities" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-ink-200">
        <ArrowLeft className="h-4 w-4" /> Back to communities
      </Link>

      <div className="overflow-hidden rounded-xl2" style={{ background: `linear-gradient(135deg, ${group.coverColor}, ${group.coverColor}aa)` }}>
        <div className="flex flex-col gap-3 p-7 text-white sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/80">
              {group.privacy === 'private' ? <Lock className="h-3.5 w-3.5" /> : <Globe className="h-3.5 w-3.5" />} {group.privacy} · {group.type}
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold">{group.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-white/90"><Users className="h-4 w-4" /> {group.memberCount.toLocaleString()} members</p>
          </div>
          <Button variant={joined ? 'outline' : 'secondary'} className={joined ? 'border-white/40 bg-white/10 text-white hover:bg-white/20' : ''}>{joined ? 'Joined' : 'Request to join'}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {joined && (
            <Card className="p-4">
              <div className="flex gap-3">
                <Avatar name={`${currentUser.firstName} ${currentUser.lastName}`} color={currentUser.avatarColor} size="sm" />
                <div className="flex-1">
                  <textarea value={draft} onChange={(e) => setDraft(e.target.value)} rows={2} placeholder="Share an update with the community…" className="w-full resize-none rounded-lg border border-ink-200 bg-white p-3 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-100" />
                  <div className="mt-2 flex justify-end">
                    <Button size="sm" onClick={submitPost} icon={<Send className="h-3.5 w-3.5" />}>Post</Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {localPosts.map((post) => {
            const author = personById(post.authorId)
            return (
              <Card key={post.id} className="p-5">
                <div className="flex items-start gap-3">
                  <Avatar name={author ? `${author.firstName} ${author.lastName}` : 'Member'} color={author?.avatarColor} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-ink-800 dark:text-ink-100">{author ? `${author.firstName} ${author.lastName}` : 'Member'}</p>
                      <p className="text-xs text-ink-400">· {formatRelative(post.createdAt)}</p>
                    </div>
                    <p className="mt-1.5 text-sm text-ink-600 dark:text-ink-300">{post.content}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-ink-400">
                      <button className="flex items-center gap-1.5 hover:text-rose-500"><Heart className="h-3.5 w-3.5" /> {post.likeCount}</button>
                      <button className="flex items-center gap-1.5 hover:text-brand-600"><MessageCircle className="h-3.5 w-3.5" /> {post.commentCount}</button>
                      <button className="ml-auto flex items-center gap-1.5 hover:text-ink-600"><Flag className="h-3.5 w-3.5" /> Report</button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">About</h3>
            <p className="mt-2 text-xs text-ink-500 dark:text-ink-400">{group.description}</p>
          </Card>
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-ink-800 dark:text-ink-100">Community leaders</h3>
            <div className="mt-3 space-y-2">
              {group.owners.map((o) => (
                <div key={o} className="flex items-center gap-2.5">
                  <Avatar name={o} size="xs" />
                  <span className="text-xs font-medium text-ink-600 dark:text-ink-300">{o}</span>
                  <Badge className="ml-auto text-[10px]">Owner</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
