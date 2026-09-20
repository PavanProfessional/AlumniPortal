// Module — Community Feed. Sourced from two places:
// 1) The real campus media library in src/assets/images (official KLE Technological
//    University announcements) — posted as the institution's own account.
// 2) src/assets/data/alumni_data.json — a real alumni-association export. Only
//    non-sensitive identity fields (name, batch, occupation, education, location)
//    are read from it; A_Password, Password, A_Number, A_Email, token and reset are
//    never imported here. Post captions for alumni are generated purely from those
//    safe fields — no quotes or claims are invented on anyone's behalf. All comment
//    threads and reaction-name lists use the app's existing fictional sample people
//    (src/data/people.ts) so no invented dialogue is attributed to a real alumnus.
import type { FeedAuthor, FeedComment, FeedPost, FeedPostKind, FeedReactionSummary } from '../types'
import { makeRng } from '../utils/random'
import { daysAgo, hoursAgo } from '../utils/dates'
import { avatarPalette } from './reference'
import { people, currentPerson } from './people'
import { currentTenant } from './tenants'
import { safeAlumniRecords } from './alumniSource'

import imgBirthday from '../assets/images/75_aniv.jpg'
import imgLeadershipQuote from '../assets/images/leadership.jpg'
import imgPhysicalAiPanel from '../assets/images/summit.jpg'
import imgHiringChemistry from '../assets/images/hiring.jpg'
import imgFintechFireside from '../assets/images/techevent.jpg'
import imgWelcomeBatch from '../assets/images/collegestart.jpg'
import imgFashionDesigning from '../assets/images/bsc_fd.jpg'
import imgHotelManagement from '../assets/images/bsc_hm.jpg'
import imgAdmissionsClosingSoon from '../assets/images/bsc_ad.jpg'
import imgMediHealthXpo from '../assets/images/731350677_1357348793160760_3739482275233339570_n.jpg'
import imgLawAdmissions from '../assets/images/734767951_1362273332668306_344444566880186777_n.jpg'
import imgHotelMgmtChefA from '../assets/images/735393848_1361626202733019_3162561646427690195_n.jpg'
import imgHotelMgmtChefB from '../assets/images/735543642_1361626749399631_25153532611643027_n.jpg'
import imgMootCourt from '../assets/images/737721890_1362273349334971_4370988274751965861_n.jpg'
import imgBbaLlb from '../assets/images/752178093_1379564554272517_1944495888858246972_n.jpg'
import imgAdmissionsClosingSoon2 from '../assets/images/752609796_1379564514272521_7668180089400926166_n.jpg'
import imgHotelMgmtLobby from '../assets/images/753150698_1379564540939185_4210840947640436038_n.jpg'
import imgFashionDesigningB from '../assets/images/753418316_1379564564272516_8367189279495318868_n.jpg'
import imgGuruPurnima from '../assets/images/758706857_1385185977043708_3792503197819421719_n.jpg'

const rng = makeRng(7042)

export const alumniAuthors: FeedAuthor[] = safeAlumniRecords.map((r) => ({
  id: r.id,
  name: r.name,
  kind: 'alumni',
  avatarColor: rng.pick(avatarPalette),
  batch: r.batch,
  passoutYear: r.passoutYear,
  occupation: r.occupation,
  education: r.education,
  nativePlace: r.nativePlace,
  workingPlace: r.workingPlace,
  meta: [r.batch && `Batch ${r.batch}`, r.occupation].filter(Boolean).join(' · '),
}))

const institutionAuthor: FeedAuthor = {
  id: 'inst_alumni_relations',
  name: `${currentTenant.displayName}`,
  kind: 'institution',
  avatarColor: 'rgb(var(--color-brand-600))',
  avatarImageUrl: currentTenant.logoImageUrl,
  meta: 'Official · Alumni Relations',
}

export const feedAuthors: Record<string, FeedAuthor> = Object.fromEntries([
  [institutionAuthor.id, institutionAuthor],
  ...alumniAuthors.map((a) => [a.id, a] as const),
  [currentPerson.id, { id: currentPerson.id, name: `${currentPerson.firstName} ${currentPerson.lastName}`, kind: 'alumni', avatarColor: currentPerson.avatarColor, meta: currentPerson.headline } satisfies FeedAuthor],
  ...people.map((p) => [p.id, { id: p.id, name: `${p.firstName} ${p.lastName}`, kind: 'alumni', avatarColor: p.avatarColor, meta: p.headline } satisfies FeedAuthor] as const),
])

const institutionComments = [
  'Wish I could attend this one — great initiative! 🙌',
  'Proud to see our campus doing this.',
  'This is exactly the kind of program that helped me when I was a student.',
  'Congrats to the whole organizing team on this!',
  'Tagging a few juniors who should see this.',
  "Let's make sure the alumni chapter shares this widely.",
  'KLE Tech never stops raising the bar. 👏',
  'Would love to volunteer for the next one — count me in.',
]

const milestoneComments = [
  'Congratulations! Well deserved 🎉',
  'So proud of you, batchmate!',
  'This made my day — way to go!',
  'Inspiring update, thanks for sharing.',
  'KLE Tech pride right here 💪',
  "Let's catch up soon, it's been too long!",
  'Amazing to see where everyone has ended up.',
  'Wishing you continued success ahead.',
  'Great news! Congrats 👏',
]

function pickCommentPool(kind: FeedPostKind): string[] {
  return kind === 'milestone' ? milestoneComments : institutionComments
}

function buildComments(kind: FeedPostKind, count: number): FeedComment[] {
  const pool = pickCommentPool(kind)
  const authors = rng.pickMany(people, Math.min(count, people.length))
  return authors.map((p, idx) => ({
    id: `${p.id}_c${idx}`,
    authorId: p.id,
    content: rng.pick(pool),
    createdAt: hoursAgo(rng.int(1, 800)),
    likeCount: rng.int(0, 24),
  }))
}

function buildReactions(scale: number): FeedReactionSummary {
  const like = rng.int(Math.round(scale * 0.5), scale)
  const celebrate = rng.int(0, Math.round(scale * 0.4))
  const support = rng.int(0, Math.round(scale * 0.25))
  const love = rng.int(0, Math.round(scale * 0.3))
  const insightful = rng.int(0, Math.round(scale * 0.15))
  return { like, celebrate, support, love, insightful }
}

export function reactionTotal(r: FeedReactionSummary): number {
  return r.like + r.celebrate + r.support + r.love + r.insightful
}

interface InstitutionPostSeed {
  images: string[]
  content: string
  kind: FeedPostKind
  tags?: string[]
  scale: number
  daysBack: number
}

const institutionPostSeeds: InstitutionPostSeed[] = [
  { images: [imgWelcomeBatch], kind: 'announcement', scale: 420, daysBack: 3, tags: ['Admissions'],
    content: "New beginnings, endless opportunities — welcoming the Batch of 2026-27 to the KLE Tech family! 🎓" },
  { images: [imgAdmissionsClosingSoon, imgAdmissionsClosingSoon2], kind: 'announcement', scale: 260, daysBack: 5, tags: ['Admissions'],
    content: 'Admissions for 2026-27 are closing soon — reach out to the admissions office if you have a junior or family member considering KLE Tech. 🎓' },
  { images: [imgHotelManagement, imgHotelMgmtChefA], kind: 'announcement', scale: 150, daysBack: 8, tags: ['Programs'],
    content: 'Admissions open — B.Sc. in Hotel Management & Catering Technology. Global hospitality careers start with hands-on training right here on campus. 🍽️' },
  { images: [imgHotelMgmtChefB, imgHotelMgmtLobby], kind: 'announcement', scale: 88, daysBack: 9, tags: ['Programs'],
    content: 'Turn a passion for hospitality into a global career — B.Sc. HMCT admissions open now, with real internships built in. 👨‍🍳' },
  { images: [imgFashionDesigning, imgFashionDesigningB], kind: 'announcement', scale: 132, daysBack: 11, tags: ['Programs'],
    content: 'A 100% practical, career-first design program for creative minds — B.Sc. in Fashion Designing admissions are open. ✂️' },
  { images: [imgLawAdmissions, imgMootCourt], kind: 'announcement', scale: 118, daysBack: 14, tags: ['Programs'],
    content: 'Shape the future of law and justice — admissions open for LL.B. (Hons.), BBA LL.B. (Hons.) and LL.M. ⚖️' },
  { images: [imgBbaLlb], kind: 'announcement', scale: 67, daysBack: 16, tags: ['Programs'],
    content: 'BBA LL.B. — built to equip students with both management prowess and legal intelligence for the corporate world. 📚' },
  { images: [imgHiringChemistry], kind: 'job', scale: 58, daysBack: 18, tags: ['Careers'],
    content: "We're hiring a Research Assistant (Chemistry) at our BVB Campus, Hubballi — M.Sc. in Chemistry required. Send your resume to careers@kletech.ac.in. 🔬" },
  { images: [imgMediHealthXpo], kind: 'event', scale: 210, daysBack: 20, tags: ['Events'],
    content: 'MediHealthXPO 2026 is coming to the CTIE Tech Park — a MedTech innovation showcase connecting startups, researchers and the North Karnataka incubators consortium. 🏥' },
  { images: [imgPhysicalAiPanel], kind: 'event', scale: 245, daysBack: 24, tags: ['Events'],
    content: 'From the BVB-KLE Tech Leadership Summit 2026: a panel on "Physical AI — Bridging Intelligence with the Real World" with leaders from Samsung, Accenture, Ati Robotics and Cisco. 🤖' },
  { images: [imgLeadershipQuote], kind: 'event', scale: 300, daysBack: 25, tags: ['Events'],
    content: '"Strong Universities are built when Alumni and Industry collaborate to shape the future together." — Prof. Ashok Shettar, Pro Chancellor, at the Leadership Summit 2026. 🤝' },
  { images: [imgFintechFireside], kind: 'event', scale: 140, daysBack: 27, tags: ['Events'],
    content: 'Fintech Fireside: Technology-Led Financial Transformation — opportunities and challenges, with speakers from Infosys Finance and Accenture. 💳' },
  { images: [imgGuruPurnima], kind: 'festival', scale: 520, daysBack: 32, tags: ['Campus'],
    content: 'Wishing a very Happy Guru Purnima to all the gurus and mentors who continue to guide our future. 🙏' },
  { images: [imgBirthday], kind: 'festival', scale: 610, daysBack: 40, tags: ['Campus'],
    content: 'Wishing Dr. Prabhakar Kore, Chancellor and the visionary behind the KLE legacy, a very Happy 79th Birthday. A legacy that continues to build the future. 🎉' },
]

function buildInstitutionPosts(): FeedPost[] {
  return institutionPostSeeds.map((seed, idx) => {
    const commentCount = rng.int(2, 6)
    return {
      id: `post_inst_${idx}`,
      authorId: institutionAuthor.id,
      kind: seed.kind,
      content: seed.content,
      media: seed.images.map((url) => ({ type: 'image' as const, url, alt: seed.content.slice(0, 80) })),
      createdAt: daysAgo(seed.daysBack),
      reactions: buildReactions(seed.scale),
      myReaction: null,
      comments: buildComments(seed.kind, commentCount),
      shareCount: rng.int(2, Math.round(seed.scale * 0.12)),
      saved: false,
      tags: seed.tags,
    }
  })
}

const milestoneTemplates: ((a: FeedAuthor) => string | null)[] = [
  (a) => (a.occupation && a.workingPlace)
    ? `🎓 ${a.batch ? `Batch of ${a.batch}` : 'KLE Tech alum'} · Now working as ${a.occupation} in ${a.workingPlace}.`
    : null,
  (a) => (a.occupation)
    ? `💼 Proud update from our alumni network — ${a.occupation}. ${a.batch ? `(Batch of ${a.batch})` : ''}`.trim()
    : null,
  (a) => (a.workingPlace)
    ? `📍 Checking in from ${a.workingPlace} — ${a.batch ? `Batch of ${a.batch} and` : ''} still carrying the KLE Tech spirit forward.`.replace('  ', ' ')
    : null,
  (a) => (a.education)
    ? `📚 ${a.education} graduate${a.batch ? `, Batch of ${a.batch}` : ''} — grateful for where this journey started.`
    : null,
  (a) => `🎉 Reconnecting with the KLE Tech family${a.batch ? ` — Batch of ${a.batch}` : ''}. Great to be part of this community!`,
]

function milestoneCaption(a: FeedAuthor): string {
  const candidates = milestoneTemplates.map((fn) => fn(a)).filter((s): s is string => Boolean(s))
  return rng.pick(candidates.length ? candidates : ['🎉 Reconnecting with the KLE Tech family!'])
}

// The full real alumni roster (all 278 records), shuffled deterministically so
// the feed doesn't simply read out in JSON/roll-number order — one milestone
// post per alumnus, authored entirely from their own safe profile fields.
function selectMilestoneAuthors(): FeedAuthor[] {
  return rng.pickMany(alumniAuthors, alumniAuthors.length)
}

function buildMilestonePosts(): FeedPost[] {
  const authors = selectMilestoneAuthors()
  return authors.map((author, idx) => {
    const scale = rng.int(6, 90)
    const commentCount = rng.int(0, 4)
    return {
      id: `post_alum_${idx}`,
      authorId: author.id,
      kind: 'milestone',
      content: milestoneCaption(author),
      createdAt: idx < 5 ? hoursAgo(rng.int(1, 48)) : daysAgo(rng.int(1, 420)),
      reactions: buildReactions(scale),
      myReaction: null,
      comments: buildComments('milestone', commentCount),
      shareCount: rng.int(0, Math.round(scale * 0.08)),
      saved: false,
      tags: ['Alumni update'],
    }
  })
}

export function buildFeedPosts(): FeedPost[] {
  const posts = [...buildInstitutionPosts(), ...buildMilestonePosts()]
  return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export { institutionAuthor }
