// Module 26 — Reference Data, Taxonomy & Configuration.
// Centralized lookups so nothing in the product hard-codes institutional assumptions.

export const countries = [
  'United States', 'United Kingdom', 'India', 'Canada', 'Australia', 'Germany',
  'Singapore', 'United Arab Emirates', 'France', 'Japan', 'Netherlands', 'Brazil',
]

export const industries = [
  'Software & Technology', 'Financial Services', 'Healthcare', 'Education',
  'Manufacturing', 'Consulting', 'Government & Public Sector', 'Media & Entertainment',
  'Retail & E-commerce', 'Energy & Utilities', 'Non-profit', 'Telecommunications',
  'Aerospace & Defense', 'Biotechnology', 'Real Estate',
]

export const skillsPool = [
  'Product Management', 'Data Analysis', 'Machine Learning', 'Cloud Architecture',
  'Python', 'JavaScript/TypeScript', 'Java', 'Go', 'SQL', 'Public Speaking',
  'Financial Modeling', 'UX Design', 'Digital Marketing', 'Sales Strategy',
  'Project Management', 'DevOps', 'Cybersecurity', 'Negotiation', 'Leadership',
  'Business Development', 'Content Strategy', 'Recruiting', 'Operations',
  'Data Engineering', 'Growth Marketing', 'Investment Analysis', 'Consulting',
  'Supply Chain', 'Legal & Compliance', 'Research', 'Mentoring', 'Public Policy',
]

export const degreeTypes = [
  "Bachelor of Science", "Bachelor of Arts", "Bachelor of Engineering",
  "Master of Science", "Master of Business Administration", "Master of Arts",
  "Doctor of Philosophy", "Postgraduate Diploma",
]

export const programs = [
  'Computer Science', 'Electrical Engineering', 'Mechanical Engineering',
  'Business Administration', 'Economics', 'Data Science', 'Biotechnology',
  'Finance', 'Marketing', 'Civil Engineering', 'Design', 'Public Policy',
  'Mathematics', 'Psychology', 'Architecture',
]

export const departments = [
  'School of Engineering', 'School of Business', 'School of Sciences',
  'School of Arts & Humanities', 'School of Design', 'School of Public Policy',
]

export const employmentTypes = ['Full-time', 'Part-time', 'Internship', 'Contract', 'Project'] as const

export const eventTypesRef = [
  'Reunion', 'Webinar', 'Workshop', 'Networking', 'Campus Event',
  'Career Event', 'Mentoring Event', 'Fundraising Event', 'Sports/Cultural',
]

export const relationshipTypes = ['Alumnus', 'Faculty', 'Staff', 'Donor', 'Employer Partner', 'Student']

export const cities = [
  'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Seattle, WA', 'Boston, MA',
  'London, UK', 'Bengaluru, IN', 'Mumbai, IN', 'Toronto, CA', 'Singapore, SG',
  'Berlin, DE', 'Sydney, AU', 'Dubai, AE', 'Chicago, IL', 'Los Angeles, CA',
  'Amsterdam, NL', 'Tokyo, JP', 'Denver, CO', 'Atlanta, GA', 'Pune, IN',
]

export const batches = ['2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023']

export const companies = [
  { name: 'Nimbus Cloud', initials: 'NC' }, { name: 'Vertex Analytics', initials: 'VA' },
  { name: 'Meridian Health', initials: 'MH' }, { name: 'Lumen Financial', initials: 'LF' },
  { name: 'Northwind Retail', initials: 'NR' }, { name: 'Quanta Robotics', initials: 'QR' },
  { name: 'Brightline Media', initials: 'BM' }, { name: 'Ironclad Security', initials: 'IS' },
  { name: 'Solaris Energy', initials: 'SE' }, { name: 'Hedgeway Capital', initials: 'HC' },
  { name: 'Orbit Logistics', initials: 'OL' }, { name: 'Cascade Biotech', initials: 'CB' },
  { name: 'Fable Studios', initials: 'FS' }, { name: 'Anchorpoint Consulting', initials: 'AC' },
  { name: 'Skyline Aerospace', initials: 'SA' }, { name: 'Pinnacle Partners', initials: 'PP' },
]

export const avatarPalette = [
  '#6c5cf5', '#23ae80', '#e6a23c', '#e6595f', '#3f9bdc', '#c95bd8', '#2fb6a7', '#e08a3c',
]
