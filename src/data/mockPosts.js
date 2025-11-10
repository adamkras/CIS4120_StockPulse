// mockPosts.js — Sample discussion data used by the DiscussionFeed component
// - Provides initial posts for demo and testing purposes
// - Mimics real user posts with tags, timestamps, and like counts
// - Used as a local mock dataset before connecting to a backend or API

export const mockPosts = [
  {
    id: 'p1',                    // Unique post identifier
    user: '@ChipExpert',         // Username / handle
    minutesAgo: 2,               // How recently the post was made
    likes: 23,                   // Number of likes
    tag: 'Bullish',              // Sentiment tag
    body: 'Earnings beat predictable based on GPU shortage patterns…',
  },
  {
    id: 'p2',
    user: '@AI_is_future',
    minutesAgo: 9,
    likes: 18,
    tag: 'Bullish',
    body: 'With inference demand rising, NVDA will keep ripping…',
  },
  {
    id: 'p3',
    user: '@Value_investor',
    minutesAgo: 12,
    likes: 4,
    tag: 'Bearish',
    body: 'So overvalued on PE ratio. Careful here.',
  },
  {
    id: 'p4',
    user: '@megatrader',
    minutesAgo: 17,
    likes: 8,
    tag: 'Bearish',
    body: 'Unsustainable growth rate next quarter IMO.',
  },
]
