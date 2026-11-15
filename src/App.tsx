import { useEffect, useMemo, useState } from 'react';
import {
  Link,
  Navigate,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom';
import type { Experience, Session, User, WalletEntry } from './types';

const STORAGE_KEY = 'naija360-session';
const FEATURED_STATES = [
  'Lagos',
  'Abuja',
  'Bauchi',
  'Osun',
  'Cross River',
  'Kano',
  'Rivers',
];

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {}),
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error((data as { error?: string }).error ?? 'Request failed');
  }

  return data as T;
}

function App() {
  const [session, setSession] = useState<Session | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Session) : null;
  });
  const [experiences, setExperiences] = useState<Experience[]>([]);

  useEffect(() => {
    if (session) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  useEffect(() => {
    if (session) {
      request<Experience[]>('/api/experiences')
        .then((list) => setExperiences(list))
        .catch(() => setExperiences([]));
    }
  }, [session]);

  const user = session?.user ?? null;

  const updateUser = (nextUser: User) => {
    setSession((current) => (current ? { ...current, user: nextUser } : current));
  };

  return (
    <div className="app-shell">
      <Header user={user} onLogout={() => setSession(null)} />
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />
        <Route
          path="/auth"
          element={
            user ? <Navigate to={user.profileComplete ? '/explore' : '/onboarding'} replace /> : <AuthPage onLogin={setSession} />
          }
        />
        <Route
          path="/onboarding"
          element={
            user ? <OnboardingPage user={user} onUpdate={updateUser} /> : <Navigate to="/auth" replace />
          }
        />
        <Route
          path="/explore"
          element={
            user ? <ExplorePage experiences={experiences} user={user} onUpdate={updateUser} /> : <Navigate to="/auth" replace />
          }
        />
        <Route
          path="/experience/:id"
          element={user ? <ExperiencePage experiences={experiences} user={user} onUpdate={updateUser} /> : <Navigate to="/auth" replace />}
        />
        <Route path="/ai" element={user ? <AiPage user={user} /> : <Navigate to="/auth" replace />} />
        <Route path="/profile" element={user ? <ProfilePage user={user} /> : <Navigate to="/auth" replace />} />
        <Route path="/wallet" element={user ? <WalletPage user={user} /> : <Navigate to="/auth" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function Header({ user, onLogout }: { user: User | null; onLogout: () => void }) {
  return (
    <header className="topbar">
      <div className="brand-wrap">
        <Link to="/" className="brand">
          <span className="brand-mark">N</span>
          NAIJA360
        </Link>
      </div>
      <nav className="nav">
        {user ? (
          <>
            <NavLink to="/explore">Explore</NavLink>
            <NavLink to="/ai">AI Guide</NavLink>
            <NavLink to="/profile">Profile</NavLink>
            <NavLink to="/wallet">Wallet</NavLink>
            <button className="text-button" onClick={onLogout} type="button">
              Logout
            </button>
          </>
        ) : (
          <>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/auth">Login</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

function MapWorld({ selectedState, onSelect }: { selectedState?: string; onSelect?: (state: string) => void }) {
  return (
    <div className="nigeria-map">
      <div className="map-glow" />
      <div className="map-skyline" />
      {FEATURED_STATES.map((state, index) => {
        const positions = [
          { top: '18%', left: '39%' },
          { top: '22%', left: '66%' },
          { top: '42%', left: '56%' },
          { top: '48%', left: '25%' },
          { top: '58%', left: '48%' },
          { top: '62%', left: '72%' },
          { top: '72%', left: '37%' },
        ];
        const position = positions[index] ?? { top: '50%', left: '50%' };
        const isSelected = selectedState === state;

        return (
          <button
            key={state}
            type="button"
            className={isSelected ? 'map-state selected' : 'map-state'}
            style={{ top: position.top, left: position.left }}
            onClick={() => onSelect?.(state)}
          >
            {state}
          </button>
        );
      })}
      <div className="world-caption">Nigeria</div>
    </div>
  );
}

function LandingPage({ user }: { user: User | null }) {
  return (
    <main className="page home-page">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Nigeria is closer than you think.</span>
          <h1>Explore the living pulse of Nigeria through AI-powered adventures.</h1>
          <p>
            Discover festivals, wildlife, heritage, food, communities and unforgettable stories in a world designed to feel like a
            digital passport to Nigeria.
          </p>
          <div className="cta-row">
            {user ? (
              <Link className="primary-btn" to={user.profileComplete ? '/explore' : '/onboarding'}>
                Continue journey
              </Link>
            ) : (
              <Link className="primary-btn" to="/auth">
                Start exploring
              </Link>
            )}
            <Link className="secondary-btn" to="/explore">
              Explore world
            </Link>
          </div>
          <ul className="quick-stats">
            <li>
              <strong>36</strong>
              <span>states and territories</span>
            </li>
            <li>
              <strong>10+</strong>
              <span>experience categories</span>
            </li>
            <li>
              <strong>AI</strong>
              <span>guided discovery</span>
            </li>
          </ul>
        </div>

        <div className="hero-visual">
          <MapWorld />
          <div className="floating-card floating-left">Yankari Game Reserve</div>
          <div className="floating-card floating-right">Osun-Osogbo Festival</div>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <span>AI Discovery</span>
          <h3>Build a personalised route through Nigeria</h3>
          <p>Get recommendations tuned to your interests, language and previous exploration.</p>
        </article>
        <article className="feature-card">
          <span>Verified Culture</span>
          <h3>Experience heritage with trusted source context</h3>
          <p>Every itinerary is tied to cultural information, local context and rich media.</p>
        </article>
        <article className="feature-card">
          <span>World Social</span>
          <h3>Meet fellow explorers and share discoveries</h3>
          <p>Build missions, complete challenges and invite friends into the same world.</p>
        </article>
      </section>
    </main>
  );
}

function AuthPage({ onLogin }: { onLogin: (session: Session) => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [form, setForm] = useState({ name: '', email: 'explorer@naija360.com', password: 'password123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        mode === 'register'
          ? { name: form.name, email: form.email, password: form.password }
          : { email: form.email, password: form.password };

      const response = await request<{ token: string; user: User }>(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const nextSession: Session = { token: response.token, user: response.user };
      onLogin(nextSession);
      navigate(response.user.profileComplete ? '/explore' : '/onboarding');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to continue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page auth-page">
      <section className="panel auth-panel">
        <div className="panel-heading">
          <span className="eyebrow">Welcome to NAIJA360</span>
          <h2>{mode === 'register' ? 'Create your explorer profile' : 'Login to continue your journey'}</h2>
        </div>

        <div className="switch-row">
          <button className={mode === 'register' ? 'active' : ''} type="button" onClick={() => setMode('register')}>
            Register
          </button>
          <button className={mode === 'login' ? 'active' : ''} type="button" onClick={() => setMode('login')}>
            Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="stack-form">
          {mode === 'register' && (
            <label>
              Full name
              <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Ada Okafor" />
            </label>
          )}

          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              placeholder="••••••••"
            />
          </label>

          {error && <p className="error-text">{error}</p>}

          <button className="primary-btn wide" type="submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
}

function OnboardingPage({ user, onUpdate }: { user: User; onUpdate: (user: User) => void }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    avatar: user.avatar || 'Akin',
    outfit: user.outfit || 'Aso-oke',
    language: user.language || 'English',
    interests: user.interests.length ? user.interests : ['Culture and heritage'],
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      ...user,
      avatar: form.avatar,
      outfit: form.outfit,
      language: form.language,
      interests: form.interests,
      profileComplete: true,
    };

    const updated = await request<User>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });

    onUpdate(updated);
    navigate('/explore');
  };

  const toggleInterest = (value: string) => {
    setForm((current) => ({
      ...current,
      interests: current.interests.includes(value)
        ? current.interests.filter((item) => item !== value)
        : [...current.interests, value],
    }));
  };

  return (
    <main className="page onboarding-page">
      <section className="panel onboarding-panel">
        <div className="panel-heading">
          <span className="eyebrow">Personalise your world</span>
          <h2>Set up your explorer identity</h2>
        </div>

        <form className="onboarding-form" onSubmit={handleSubmit}>
          <div className="avatar-preview">
            <div className="avatar-bubble">{form.avatar.slice(0, 1).toUpperCase()}</div>
            <div>
              <p className="muted-label">Explorer preview</p>
              <strong>{form.avatar || 'Akin'}</strong>
              <span>{form.outfit}</span>
            </div>
          </div>

          <div className="field-grid">
            <label>
              Avatar name
              <input value={form.avatar} onChange={(event) => setForm({ ...form, avatar: event.target.value })} />
            </label>
            <label>
              Outfit style
              <select value={form.outfit} onChange={(event) => setForm({ ...form, outfit: event.target.value })}>
                <option>Aso-oke</option>
                <option>Contemporary streetwear</option>
                <option>Festival flair</option>
                <option>Traveler chic</option>
              </select>
            </label>
            <label>
              Language
              <select value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })}>
                <option>English</option>
                <option>Nigerian Pidgin</option>
                <option>Yoruba</option>
                <option>Igbo</option>
                <option>Hausa</option>
              </select>
            </label>
          </div>

          <div>
            <p className="section-label">Choose your interests</p>
            <div className="pill-grid">
              {[
                'Culture and heritage',
                'Wildlife and nature',
                'Food and nightlife',
                'Festivals',
                'Adventure',
                'History',
                'Relaxation',
              ].map((interest) => (
                <button
                  key={interest}
                  type="button"
                  className={form.interests.includes(interest) ? 'pill selected' : 'pill'}
                  onClick={() => toggleInterest(interest)}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          <button className="primary-btn" type="submit">
            Save profile and enter map
          </button>
        </form>
      </section>
    </main>
  );
}

function ExplorePage({ experiences, user, onUpdate }: { experiences: Experience[]; user: User; onUpdate: (user: User) => void }) {
  const [category, setCategory] = useState('All');
  const [selectedState, setSelectedState] = useState(FEATURED_STATES[0]);

  const filtered = useMemo(() => {
    let list = experiences;
    if (selectedState !== 'All') {
      list = list.filter((item) => item.state === selectedState);
    }
    if (category !== 'All') {
      list = list.filter((item) => item.category === category);
    }
    return list;
  }, [category, selectedState, experiences]);

  useEffect(() => {
    request<User>(`/api/user/${user.id}`)
      .then((updated) => onUpdate(updated))
      .catch(() => undefined);
  }, [onUpdate, user.id]);

  return (
    <main className="page explore-page">
      <section className="panel world-panel">
        <div className="panel-heading split-heading">
          <div>
            <span className="eyebrow">World exploration</span>
            <h2>Enter the Nigerian world</h2>
          </div>
          <div className="wallet-chip">Coins: {user.coins}</div>
        </div>

        <div className="explore-shell">
          <div className="world-map-panel">
            <MapWorld selectedState={selectedState} onSelect={setSelectedState} />
            <div className="state-list">
              {['All', ...FEATURED_STATES].map((state) => (
                <button
                  key={state}
                  type="button"
                  className={selectedState === state ? 'state-button active' : 'state-button'}
                  onClick={() => setSelectedState(state)}
                >
                  {state}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-panel">
            <div className="filters">
              <button type="button" className={category === 'All' ? 'filter active' : 'filter'} onClick={() => setCategory('All')}>
                All
              </button>
              {['Wildlife and nature', 'Culture and heritage', 'Festivals', 'Food', 'Adventure', 'History', 'Relaxation'].map((item) => (
                <button
                  key={item}
                  type="button"
                  className={category === item ? 'filter active' : 'filter'}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="experience-list">
              {filtered.length === 0 ? (
                <div className="empty-state">No destinations match this state and category yet.</div>
              ) : (
                filtered.map((experience) => (
                  <Link className="experience-card" key={experience.id} to={`/experience/${experience.id}`}>
                    <div className="card-media" />
                    <div className="card-content">
                      <div className="card-topline">
                        <span className="badge">{experience.badge}</span>
                        <span className="mini-meta">{experience.state}</span>
                      </div>
                      <h3>{experience.name}</h3>
                      <p>{experience.description}</p>
                      <div className="card-foot">
                        <span>{experience.duration}</span>
                        <span>{experience.mediaLabel}</span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ExperiencePage({
  experiences,
  user,
  onUpdate,
}: {
  experiences: Experience[];
  user: User;
  onUpdate: (user: User) => void;
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const experience = experiences.find((item) => item.id === id);

  if (!experience) {
    return <Navigate to="/explore" replace />;
  }

  const handleComplete = async () => {
    const response = await request<{ user: User; message: string }>('/api/wallet/transaction', {
      method: 'POST',
      body: JSON.stringify({
        userId: user.id,
        type: 'earn',
        amount: 45,
        reason: `Completed ${experience.name}`,
      }),
    });

    onUpdate(response.user);
    navigate('/profile');
  };

  return (
    <main className="page detail-page">
      <section className="panel detail-panel">
        <div className="detail-hero">
          <div>
            <span className="eyebrow">{experience.category}</span>
            <h2>{experience.name}</h2>
            <p>{experience.story}</p>
          </div>
          <div className="detail-meta">
            <span>{experience.state}</span>
            <span>{experience.duration}</span>
            <span>{experience.mediaLabel}</span>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-card feature-card-detail">
            <h3>Experience overview</h3>
            <p>{experience.description}</p>
            <ul>
              <li>Highlight: {experience.highlight}</li>
              <li>Location: {experience.location}</li>
              <li>Vibe: {experience.vibe}</li>
            </ul>
            <div className="inline-actions">
              <button className="primary-btn" type="button" onClick={handleComplete}>
                Complete +45 coins
              </button>
              <Link className="secondary-btn" to="/explore">
                Back to map
              </Link>
            </div>
          </div>

          <div className="detail-card">
            <h3>AI guide</h3>
            <p>
              “{experience.name} blends {experience.vibe.toLowerCase()} with deep cultural context and local discovery. Start with the best
              viewing points around {experience.location}.”
            </p>
            <div className="source-badges">
              <span>Verified culture</span>
              <span>Local story</span>
              <span>{experience.mediaLabel}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function AiPage({ user }: { user: User }) {
  const [input, setInput] = useState('I want to experience something exciting in Nigeria.');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      const data = await request<{ response: string }>('/api/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ userId: user.id, prompt: input }),
      });
      setResponse(data.response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page ai-page">
      <section className="panel ai-panel">
        <div className="panel-heading">
          <span className="eyebrow">AI discoverer</span>
          <h2>Ask NAIJA360 where to begin</h2>
        </div>

        <form className="chat-form" onSubmit={handleSubmit}>
          <textarea value={input} onChange={(event) => setInput(event.target.value)} rows={4} />
          <button className="primary-btn" type="submit" disabled={loading}>
            {loading ? 'Thinking...' : 'Get recommendations'}
          </button>
        </form>

        {response && (
          <div className="ai-response">
            <strong>AI recommendation:</strong>
            <p>{response}</p>
          </div>
        )}
      </section>
    </main>
  );
}

function ProfilePage({ user }: { user: User }) {
  return (
    <main className="page profile-page">
      <section className="panel profile-panel">
        <div className="panel-heading split-heading">
          <div>
            <span className="eyebrow">Explorer profile</span>
            <h2>{user.avatar}</h2>
          </div>
          <div className="wallet-chip">{user.coins} coins</div>
        </div>

        <div className="profile-grid">
          <div className="stat-card">
            <span>Streak</span>
            <strong>{user.streak} days</strong>
          </div>
          <div className="stat-card">
            <span>Language</span>
            <strong>{user.language}</strong>
          </div>
          <div className="stat-card">
            <span>Style</span>
            <strong>{user.outfit}</strong>
          </div>
          <div className="stat-card">
            <span>Achievements</span>
            <strong>{user.achievements.length}</strong>
          </div>
        </div>

        <div className="interest-list">
          {user.interests.map((item) => (
            <span key={item} className="chip">
              {item}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

function WalletPage({ user }: { user: User }) {
  const [entries, setEntries] = useState<WalletEntry[]>([]);

  useEffect(() => {
    request<{ history: WalletEntry[]; balance: number }>(`/api/wallet/${user.id}`)
      .then((data) => setEntries(data.history))
      .catch(() => setEntries([]));
  }, [user.id]);

  return (
    <main className="page wallet-page">
      <section className="panel wallet-panel">
        <div className="panel-heading split-heading">
          <div>
            <span className="eyebrow">Coin wallet</span>
            <h2>Current balance: {user.coins}</h2>
          </div>
          <div className="wallet-chip">Secure backend ledger</div>
        </div>

        <div className="wallet-list">
          {entries.length === 0 ? (
            <p className="empty-state">No transactions yet. Complete an experience to start earning coins.</p>
          ) : (
            entries.map((entry) => (
              <div className="wallet-item" key={entry.id}>
                <div>
                  <strong>{entry.reason}</strong>
                  <small>{new Date(entry.createdAt).toLocaleString()}</small>
                </div>
                <span className={entry.type === 'earn' ? 'positive' : 'negative'}>
                  {entry.type === 'earn' ? '+' : '-'}{entry.amount}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default App;
