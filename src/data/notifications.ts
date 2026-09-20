import type { NotificationItem } from '../types'
import { daysAgo, hoursAgo } from '../utils/dates'
import { currentPerson } from './people'

export const notifications: NotificationItem[] = [
  { id: 'ntf_1', personId: currentPerson.id, category: 'event', title: 'Registration confirmed', body: 'You\'re registered for "AI in Product: Fireside Chat" on Sep 7.', createdAt: hoursAgo(3), read: false, actionLabel: 'View event', actionHref: '/app/events/ev_002' },
  { id: 'ntf_2', personId: currentPerson.id, category: 'mentorship', title: 'New session request', body: 'Ishaan Reddy proposed a mentoring session for next Tuesday.', createdAt: hoursAgo(9), read: false, actionLabel: 'Review request', actionHref: '/app/mentorship' },
  { id: 'ntf_3', personId: currentPerson.id, category: 'career', title: 'Application moved to Interview', body: 'Your application for "Product Designer" at Vertex Analytics advanced to the interview stage.', createdAt: daysAgo(1), read: false, actionLabel: 'View application', actionHref: '/app/careers' },
  { id: 'ntf_4', personId: currentPerson.id, category: 'community', title: 'New reply in Bay Area Chapter', body: 'Rohan Iyer replied to your post about the upcoming meetup.', createdAt: daysAgo(1), read: true, actionLabel: 'Open thread', actionHref: '/app/communities/grp_002' },
  { id: 'ntf_5', personId: currentPerson.id, category: 'giving', title: 'Thank you for your gift', body: 'Your $250 donation to Annual Giving Day was received. Receipt sent to your email.', createdAt: daysAgo(5), read: true },
  { id: 'ntf_6', personId: currentPerson.id, category: 'system', title: 'Complete your profile', body: 'Add your certifications to reach 100% profile completion.', createdAt: daysAgo(6), read: true, actionLabel: 'Edit profile', actionHref: '/app/profile' },
  { id: 'ntf_7', personId: currentPerson.id, category: 'content', title: 'New story published', body: '"How Priya Mehta Built a 200-Person Startup" is now live on the alumni blog.', createdAt: daysAgo(8), read: true, actionLabel: 'Read story', actionHref: '/app/content' },
  { id: 'ntf_8', personId: currentPerson.id, category: 'event', title: 'Event reminder', body: '"Bay Area Alumni Networking Night" is in 3 days.', createdAt: daysAgo(2), read: true },
]

export const unreadCount = notifications.filter((n) => !n.read).length
