import cors from 'cors';
import express from 'express';
import fs from 'fs';
import path from 'path';
import type { User, WalletEntry } from '../src/types';

const app = express();
const port = 4000;
const storePath = path.join(process.cwd(), 'server', 'store.json');

const seedExperiences = [
  {
    id: 'lekki-conservation-centre',
    name: 'Lekki Conservation Centre',
    state: 'Lagos',
    category: 'Wildlife and nature',
    description: 'Walk a suspended canopy and spot birds, monkeys and forest trails just outside Lagos.',
    duration: '2-3 hours',
    mediaLabel: 'Real-world trail tour',
    highlight: 'Canopy walkway',
    vibe: 'Nature escape',
    badge: 'Featured',
    story:
      'A serene green pocket in Lagos that invites visitors to slow down, learn about biodiversity and explore the city through a different lens.',
    location: 'Lekki, Lagos',
  },
  {
    id: 'yankari-game-reserve',
    name: 'Yankari Game Reserve',
    state: 'Bauchi',
    category: 'Wildlife and nature',
    description: 'Explore rolling savannahs, warm springs and one of Nigeria’s best-known conservation areas.',
    duration: 'Full day',
    mediaLabel: 'Guided safari',
    highlight: 'Savannah and wildlife',
    vibe: 'Adventure',
    badge: 'Top pick',
    story:
      'A classic northern wildlife experience, Yankari blends conservation, natural beauty and a strong sense of place through the landscape.',
    location: 'Bauchi State',
  },
  {
    id: 'osun-osogbo',
    name: 'Osun-Osogbo Sacred Grove',
    state: 'Osun',
    category: 'Culture and heritage',
    description: 'Experience an important sacred cultural landscape and deep Yoruba heritage in a spiritual setting.',
    duration: '2 hours',
    mediaLabel: 'Cultural heritage tour',
    highlight: 'Sacred grove and pilgrimage',
    vibe: 'Spiritual discovery',
    badge: 'Heritage',
    story:
      'The grove holds memory, ritual and historical significance, connecting visitors to an important world of Yoruba tradition and cultural continuity.',
    location: 'Osogbo, Osun State',
  },
  {
    id: 'nike-centre',
    name: 'Nike Centre for Art and Culture',
    state: 'Enugu',
    category: 'Culture and heritage',
    description: 'Visit a vibrant centre for visual art, crafts and cultural exchange in southeastern Nigeria.',
    duration: '90 minutes',
    mediaLabel: 'Art and craft studio',
    highlight: 'Contemporary and traditional art',
    vibe: 'Creative immersion',
    badge: 'Cultural',
    story:
      'Nike Centre captures the energy of Nigerian artistic creativity—living traditions, contemporary design and community storytelling.',
    location: 'Enugu State',
  },
  {
    id: 'tarkwa-bay',
    name: 'Tarkwa Bay',
    state: 'Lagos',
    category: 'Relaxation',
    description: 'Take in a hidden beach escape with sea views, swimming and a relaxed island atmosphere.',
    duration: 'Half day',
    mediaLabel: 'Coastal retreat',
    highlight: 'Beach and shoreline',
    vibe: 'Ocean calm',
    badge: 'Relax',
    story:
      'A beach day with a strong sense of release and escape, ideal for those seeking a restorative break with beautiful coastline.',
    location: 'Lagos coastline',
  },
  {
    id: 'la-campagne-tropicana',
    name: 'La Campagne Tropicana',
    state: 'Lagos',
    category: 'Food',
    description: 'Enjoy local cuisine, culture and warm hospitality in a destination that merges culinary experiences with local life.',
    duration: 'Half day',
    mediaLabel: 'Culinary and culture',
    highlight: 'Nigerian food and hospitality',
    vibe: 'Gathering and taste',
    badge: 'Taste',
    story:
      'The experience is built around communal eating, music and storytelling—an immersive way to feel the rhythm of Nigerian hospitality.',
    location: 'Badagry, Lagos',
  },
];

type StoredUser = User & { password: string };

type Store = {
  users: StoredUser[];
  walletHistory: Record<string, WalletEntry[]>;
};

const defaultStore: Store = {
  users: [],
  walletHistory: {},
};

function readStore(): Store {
  try {
    const raw = fs.readFileSync(storePath, 'utf8');
    return JSON.parse(raw) as Store;
  } catch {
    fs.mkdirSync(path.dirname(storePath), { recursive: true });
    fs.writeFileSync(storePath, JSON.stringify(defaultStore, null, 2));
    return defaultStore;
  }
}

function writeStore(store: Store) {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2));
}

function getUserByEmail(email: string, store: Store) {
  return store.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
}

function toSafeUser(user: StoredUser): User {
  const { password: _password, ...safeUser } = user;
  return safeUser as User;
}

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'NAIJA360 API ready' });
});

app.get('/api/experiences', (_req, res) => {
  res.json(seedExperiences);
});

app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }

  const store = readStore();
  if (getUserByEmail(email, store)) {
    return res.status(409).json({ error: 'An account already exists with that email.' });
  }

  const user: StoredUser = {
    id: `user-${Date.now()}`,
    name,
    email,
    password,
    avatar: 'Akin',
    outfit: 'Aso-oke',
    language: 'English',
    interests: ['Culture and heritage'],
    coins: 120,
    streak: 1,
    achievements: ['New explorer'],
    completedExperiences: [],
    profileComplete: false,
  };

  store.users.push(user);
  store.walletHistory[user.id] = [
    {
      id: `txn-${Date.now()}`,
      type: 'earn',
      amount: 120,
      reason: 'Starter rewards',
      createdAt: new Date().toISOString(),
    },
  ];
  writeStore(store);

  return res.status(201).json({ token: `token-${user.id}`, user: toSafeUser(user) });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const store = readStore();
  const user = getUserByEmail(email, store);

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  return res.json({ token: `token-${user.id}`, user: toSafeUser(user) });
});

app.get('/api/user/:id', (req, res) => {
  const { id } = req.params;
  const store = readStore();
  const user = store.users.find((entry) => entry.id === id);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json(toSafeUser(user));
});

app.put('/api/profile', (req, res) => {
  const nextUser = req.body as User;
  const store = readStore();
  const index = store.users.findIndex((user) => user.id === nextUser.id);

  if (index === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const updated = { ...store.users[index], ...nextUser };
  store.users[index] = updated;
  writeStore(store);

  return res.json(toSafeUser(updated));
});

app.post('/api/ai/chat', (req, res) => {
  const { prompt, userId } = req.body as { prompt?: string; userId?: string };
  const store = readStore();
  const user = store.users.find((entry) => entry.id === userId);

  if (!prompt) {
    return res.status(400).json({ error: 'A prompt is required.' });
  }

  const topic = prompt.toLowerCase();
  let response = 'I can help you plan an immersive route. Start with a cultural landmark, a nature destination, or a festival based on your interests.';

  if (topic.includes('festival') || topic.includes('oyo') || topic.includes('osun')) {
    response = 'A strong first move is Osun-Osogbo Sacred Grove, then a nearby food stop and a slow evening walk through the city. It gives you spiritual depth, culture and local atmosphere.';
  } else if (topic.includes('wild') || topic.includes('nature') || topic.includes('adventure')) {
    response = 'Yankari Game Reserve or Lekki Conservation Centre would give you the best blend of wildlife, landscape and guided discovery, depending on whether you want a larger safari feel or a more urban nature escape.';
  } else if (topic.includes('food') || topic.includes('night')) {
    response = 'Start with a culinary route through Lagos and combine it with a relaxed coast experience. Try local cuisine, a modern music venue and a classic street-food evening.';
  }

  if (user?.interests?.includes('Culture and heritage')) {
    response += ' Your profile suggests you enjoy culture, so I would add one heritage stop to every itinerary.';
  }

  return res.json({ response });
});

app.get('/api/wallet/:userId', (req, res) => {
  const { userId } = req.params;
  const store = readStore();
  const user = store.users.find((entry) => entry.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const history = store.walletHistory[userId] ?? [];
  return res.json({ balance: user.coins, history });
});

app.post('/api/wallet/transaction', (req, res) => {
  const { userId, type, amount, reason } = req.body as { userId?: string; type?: 'earn' | 'spend'; amount?: number; reason?: string };

  if (!userId || !type || !amount || !reason) {
    return res.status(400).json({ error: 'User, type, amount and reason are required.' });
  }

  const store = readStore();
  const userIndex = store.users.findIndex((user) => user.id === userId);

  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = store.users[userIndex];
  if (type === 'spend' && user.coins < amount) {
    return res.status(400).json({ error: 'Insufficient coins available.' });
  }

  const nextBalance = type === 'earn' ? user.coins + amount : user.coins - amount;
  const updatedUser = { ...user, coins: nextBalance };
  const entry: WalletEntry = {
    id: `txn-${Date.now()}`,
    type,
    amount,
    reason,
    createdAt: new Date().toISOString(),
  };

  store.users[userIndex] = updatedUser;
  store.walletHistory[userId] = [entry, ...(store.walletHistory[userId] ?? [])];
  writeStore(store);

  return res.json({ user: toSafeUser(updatedUser), message: 'Wallet updated successfully.' });
});

app.listen(port, () => {
  console.log(`NAIJA360 API running on http://localhost:${port}`);
});
