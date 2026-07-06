export interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  color: string;
  base?: boolean;
  unlockAtStreak?: number;
}

const PALETTE = [
  "#6c4ce3",
  "#e8892b",
  "#43a863",
  "#e5484d",
  "#2f9bd8",
  "#c94db0",
  "#f4a93b",
  "#5b8def",
];

const RAW: Omit<Achievement, "color">[] = [
  { id: "pioneer", title: "Pioneer", description: "You've been reading enough to unlock your trends.", emoji: "🚀", base: true },
  { id: "habit-monk", title: "Habit Monk", description: "Keep an eye on that streak.", emoji: "🧘", unlockAtStreak: 1 },
  { id: "rambo-iq", title: "Rambo IQ", description: "A new healthy habit is being formed.", emoji: "💪", unlockAtStreak: 3 },
  { id: "dashing-ahead", title: "Dashing Ahead", description: "It all happened so fast.", emoji: "🏃", unlockAtStreak: 7 },
  { id: "in-a-fortnight", title: "In a Fortnight", description: "It's been a while.", emoji: "🎸", unlockAtStreak: 14 },
  { id: "high-mileage", title: "High Mileage", description: "You're going full steam ahead.", emoji: "🚂", unlockAtStreak: 30 },
  { id: "reading-revolution", title: "Reading Revolution", description: "You've come full circle.", emoji: "🧑‍🚀" },
  { id: "brainiac", title: "Brainiac", description: "The secret to having good ideas is reading lots of them.", emoji: "🧠" },
  { id: "sharpshooter", title: "Sharpshooter", description: "Now we are talking.", emoji: "🏹" },
  { id: "sherlocks-sidekick", title: "Sherlock's Sidekick", description: "You've recruited a friend to join your knowledge journey.", emoji: "🔍" },
  { id: "avatar-alchemist", title: "Avatar Alchemist", description: "A carefully crafted profile is a showcase of your persona.", emoji: "⚗️" },
  { id: "baby-socrates", title: "Baby Socrates", description: "An unexamined life is not worth living.", emoji: "👴" },
  { id: "casanova-wannabe", title: "Casanova Wannabe", description: "Love is a language that transcends words. It's spoken from the heart.", emoji: "🌹" },
  { id: "couch-athlete", title: "Couch Athlete", description: "Fitness is the foundation for a healthy and vibrant life.", emoji: "🛋️" },
  { id: "literary-jedi", title: "Literary Jedi", description: "Science fiction is the canvas upon which we paint the possibilities.", emoji: "🌌" },
  { id: "little-buddha", title: "Little Buddha", description: "In the silence of meditation, the soul whispers its deepest secrets.", emoji: "☸️" },
  { id: "young-scrooge", title: "Young Scrooge", description: "Embrace lifelong learning. The more you know, the more you grow.", emoji: "🦆" },
  { id: "first-comrade", title: "First Comrade", description: "Great minds think alike.", emoji: "🎖️" },
  { id: "in-this-together", title: "We're in this together", description: "Everlasting supporter! The whole team is grateful for you.", emoji: "🤗" },
  { id: "communication-ace", title: "Communication Ace", description: "All friendships begin with a “Hi”.", emoji: "💬" },
  { id: "make-love-not-war", title: "Make Love not War", description: "Happiness is not true unless shared.", emoji: "☮️" },
  { id: "shy-friend", title: "Shy Friend", description: "You took the first step in following inspiring people.", emoji: "🙂" },
  { id: "audio-novice", title: "Audio Novice", description: "Audio is a great way to discover new ideas.", emoji: "🎧" },
  { id: "daring-devil", title: "Daring Devil", description: "Busy hands? You can still read with your ears.", emoji: "🦇" },
  { id: "bookworm", title: "Bookworm", description: "One idea at a time adds up fast.", emoji: "🐛" },
  { id: "night-owl", title: "Night Owl", description: "The best ideas arrive after dark.", emoji: "🦉" },
  { id: "early-bird", title: "Early Bird", description: "First light, first idea.", emoji: "🐦" },
  { id: "globe-trotter", title: "Globe Trotter", description: "Knowledge has no borders.", emoji: "🌍" },
  { id: "collector", title: "Collector", description: "A saved idea is an idea kept.", emoji: "📌" },
  { id: "curator", title: "Curator", description: "Your library tells your story.", emoji: "📚" },
  { id: "marathoner", title: "Marathoner", description: "Distance is just a series of steps.", emoji: "🏅" },
  { id: "explorer", title: "Explorer", description: "Every subject is a new frontier.", emoji: "🧭" },
  { id: "quiz-master", title: "Quiz Master", description: "You put your learning into practice.", emoji: "🎯" },
  { id: "streak-saver", title: "Streak Saver", description: "You used a freeze to keep the fire alive.", emoji: "❄️" },
  { id: "socialite", title: "Socialite", description: "Sharing is caring.", emoji: "📣" },
  { id: "legend", title: "Legend", description: "You've come a long way.", emoji: "👑" },
];

export const ACHIEVEMENTS: Achievement[] = RAW.map((a, i) => ({
  ...a,
  color: PALETTE[i % PALETTE.length]!,
}));
