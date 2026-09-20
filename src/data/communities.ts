import type { CommunityGroup, GroupPost, GroupType } from '../types'
import { makeRng } from '../utils/random'
import { daysAgo, hoursAgo } from '../utils/dates'
import { avatarPalette } from './reference'
import { allPeople } from './people'

const rng = makeRng(3003)

interface GroupSeed { name: string; type: GroupType; privacy: 'public' | 'private'; description: string }

const seeds: GroupSeed[] = [
  { name: 'Class of 2016', type: 'Batch', privacy: 'private', description: 'Private space for the 2016 graduating batch to stay in touch, share updates and plan reunions.' },
  { name: 'Bay Area Chapter', type: 'City', privacy: 'public', description: 'Official chapter for alumni living and working in the San Francisco Bay Area.' },
  { name: 'Computer Science Alumni', type: 'Department', privacy: 'public', description: 'Discussions, job leads and meetups for Computer Science graduates.' },
  { name: 'Women in Tech Circle', type: 'Interest', privacy: 'public', description: 'Community for alumnae in technology roles to network and support each other.' },
  { name: 'Founders & Operators', type: 'Profession', privacy: 'private', description: 'A curated, private group for alumni who have founded or run companies.' },
  { name: 'India Alumni Network', type: 'Country', privacy: 'public', description: 'Connecting KLE Tech alumni across India — events, jobs, and city meetups.' },
  { name: 'Alumni Board Committee', type: 'Private Committee', privacy: 'private', description: 'Working group for elected alumni board members. Restricted membership.' },
  { name: 'London Chapter', type: 'Chapter', privacy: 'public', description: 'Official KLE Tech alumni chapter for Greater London.' },
  { name: 'KLE Tech Official Announcements', type: 'Official', privacy: 'public', description: 'Official institution updates, read-only for most members.' },
]

const postSnippets = [
  'Excited to share that our team just shipped a major release — happy to chat with anyone exploring similar problems.',
  'Anyone attending the reunion next month? Would love to grab dinner beforehand with folks in town early.',
  'Looking for two engineers to join my team in Austin — DM me if interested, happy to fast-track alumni referrals.',
  'Wrote up some notes from the mentoring session last week, sharing here in case useful to others starting out.',
  'Small win: hit our fundraising milestone for the scholarship fund thanks to this community. Thank you all!',
  'Hosting an informal coffee meetup this Saturday morning — everyone welcome, first-timers especially.',
  'Does anyone have recommendations for relocating to Singapore? Happy to compare notes.',
  'Proud to see three alumni from this group get promoted to VP this quarter. Inspiring stuff.',
]

export const communities: CommunityGroup[] = seeds.map((s, idx) => {
  const id = `grp_${String(idx + 1).padStart(3, '0')}`
  return {
    id,
    name: s.name,
    type: s.type,
    description: s.description,
    coverColor: rng.pick(avatarPalette),
    privacy: s.privacy,
    memberCount: rng.int(40, 1200),
    postCount: rng.int(8, 260),
    pendingReports: rng.bool(0.25) ? rng.int(1, 4) : 0,
    owners: rng.pickMany(allPeople, 2).map((p) => `${p.firstName} ${p.lastName}`),
    createdAt: daysAgo(rng.int(120, 1800)),
  }
})

export const posts: GroupPost[] = communities.flatMap((g) => {
  const count = rng.int(3, 6)
  return Array.from({ length: count }).map((_, i) => {
    const author = rng.pick(allPeople)
    return {
      id: `post_${g.id}_${i}`,
      groupId: g.id,
      authorId: author.id,
      content: rng.pick(postSnippets),
      createdAt: i === 0 ? hoursAgo(rng.int(1, 20)) : daysAgo(rng.int(1, 45)),
      likeCount: rng.int(0, 64),
      commentCount: rng.int(0, 22),
      flagged: rng.bool(0.06),
    } satisfies GroupPost
  })
})

export const myGroupIds = [communities[0].id, communities[1].id, communities[3].id, communities[8].id]

export function groupById(id: string) {
  return communities.find((g) => g.id === id)
}

export function postsForGroup(id: string) {
  return posts.filter((p) => p.groupId === id).sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
}

export const flaggedPosts = posts.filter((p) => p.flagged)
