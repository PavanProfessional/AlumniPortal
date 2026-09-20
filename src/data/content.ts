import type { ContentItem, ContentType, ContentWorkflowState } from '../types'
import { makeRng } from '../utils/random'
import { daysAgo, daysFromNow } from '../utils/dates'
import { avatarPalette } from './reference'
import { allPeople } from './people'

const rng = makeRng(7007)

interface ContentSeed { title: string; type: ContentType; state: ContentWorkflowState; summary: string }

const seeds: ContentSeed[] = [
  { title: 'Welcome to the New Alumni Portal', type: 'Announcement', state: 'published', summary: 'Introducing the redesigned KLE Tech alumni experience — directory, events, careers and more in one place.' },
  { title: 'How Priya Mehta Built a 200-Person Startup', type: 'Story', state: 'published', summary: 'Class of 2014 alumna shares her journey from campus hackathons to Series B.' },
  { title: 'Fall 2026 Reunion Weekend — Save the Date', type: 'News', state: 'published', summary: 'Registration opens next month for the biggest reunion weekend yet.' },
  { title: 'Guide to Updating Your Privacy Preferences', type: 'FAQ', state: 'published', summary: 'Step-by-step guide to controlling what parts of your profile are visible and to whom.' },
  { title: 'Data Retention & Privacy Policy', type: 'Policy', state: 'published', summary: 'How KLE Tech collects, stores, and protects alumni data.' },
  { title: 'Mentoring Program Handbook', type: 'Resource', state: 'published', summary: 'Everything mentors and mentees need to know to get the most out of the program.' },
  { title: 'Q3 Career Fair Recap', type: 'News', state: 'review', summary: 'Draft recap of the career fair — pending final numbers from the careers team.' },
  { title: 'New Scholarship Fund Launch Banner', type: 'Banner', state: 'scheduled', summary: 'Homepage banner promoting the new scholarship fund, scheduled to go live with the campaign.' },
  { title: 'Alumni Spotlight: From Campus to Capitol Hill', type: 'Story', state: 'draft', summary: 'Draft profile of an alumnus now working in public policy — awaiting quotes.' },
  { title: 'Chapter Leader Onboarding Page', type: 'Page', state: 'draft', summary: 'New page walking regional chapter leaders through their responsibilities and tools.' },
  { title: 'Code of Conduct for Communities', type: 'Policy', state: 'published', summary: 'Community guidelines and moderation policy for all alumni groups.' },
  { title: 'Employer Partnership FAQ', type: 'FAQ', state: 'archived', summary: 'Superseded by the updated employer partnership guide.' },
]

export const content: ContentItem[] = seeds.map((s, idx) => {
  const id = `cnt_${String(idx + 1).padStart(3, '0')}`
  const author = rng.pick(allPeople)
  return {
    id,
    title: s.title,
    type: s.type,
    state: s.state,
    summary: s.summary,
    body: s.summary + ' ' + 'Lorem ipsum institutional copy would render here in the full editor, supporting rich text, embedded media, and personalization tokens.',
    authorId: author.id,
    coverColor: rng.pick(avatarPalette),
    publishedAt: s.state === 'published' ? daysAgo(rng.int(1, 200)) : undefined,
    scheduledAt: s.state === 'scheduled' ? daysFromNow(rng.int(1, 14)) : undefined,
    updatedAt: daysAgo(rng.int(0, 30)),
    views: s.state === 'published' ? rng.int(120, 8400) : 0,
    version: rng.int(1, 6),
    tags: rng.pickMany(['onboarding', 'reunion', 'careers', 'privacy', 'mentoring', 'giving', 'chapters'], rng.int(1, 3)),
  }
})

export function contentById(id: string) {
  return content.find((c) => c.id === id)
}
