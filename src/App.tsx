import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, X, Search, ChevronRight, ArrowRight, 
  LayoutDashboard, LogOut, Plus, Edit2, Trash2, 
  Clock, User, Tag, Eye, ArrowLeft, Send,
  Scale, BookOpen, Newspaper, Shield, Globe,
  Lock, CheckCircle2, AlertCircle
} from 'lucide-react';
import { 
  collection, query, orderBy, onSnapshot, 
  addDoc, updateDoc, deleteDoc, doc, 
  Timestamp, getDoc, setDoc, where
} from 'firebase/firestore';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import ReactMarkdown from 'react-markdown';
import { db, auth, signInWithGoogle, logout } from './firebase';
import { Post, UserProfile } from './types';
import { cn } from './lib/utils';

// --- Components ---

const Navbar = ({ user }: { user: FirebaseUser | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError("The sign-in window was closed. Please try again and complete the sign-in process.");
      } else if (err.code === 'auth/popup-blocked') {
        setError("The sign-in popup was blocked by your browser. Please allow popups for this site.");
      } else {
        setError("An error occurred during sign-in. Please try again.");
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Blogs', path: '/blogs' },
    { name: 'Our Team', path: '/#team' },
    { name: 'Contact', path: '/#contact' },
  ];

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm">
        <div className="flex justify-between items-center px-8 py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-4">
              <img 
                alt="Clause & Effect" 
                className="h-10 w-auto" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD3YsSJnyRQGtyiTYL0C94tXuicdrkMVfcJhcet0_TWdTnx98YfJm1G2oXIyXP3mN4dAhMZIuzOlsfWxf5P5c9SYtbnJTHh-vfAwx-_dfmuJYqmoxxXiP07Mu7V9DoIzhzlWu7QB8fMw90KVkTw17b0fZYnYpWjbU-2vk9lzl-DHHknfS7P07CiQAAdcAk3-qiYpEXS8-idEpUww8trKn7XkZ65xKq2Joc0sZZhQjvrhdI7PSypk1VBEw8IEoLiHWSR5ohqj8BODo"
              />
              <span className="text-2xl font-serif text-[#0A1128] tracking-tighter font-headline">Clause & Effect</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 font-headline tracking-tight">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "transition-all duration-300 ease-in-out pb-1",
                  location.pathname === link.path 
                    ? "text-slate-900 border-b-2 border-[#fdd25c]" 
                    : "text-slate-500 hover:text-[#0A1128]"
                )}
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <Link 
                to="/admin" 
                className={cn(
                  "transition-all duration-300 ease-in-out pb-1",
                  location.pathname === '/admin' 
                    ? "text-slate-900 border-b-2 border-[#fdd25c]" 
                    : "text-slate-500 hover:text-[#0A1128]"
                )}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <img src={user.photoURL || ''} alt={user.displayName || ''} className="w-8 h-8 rounded-full" />
                <button 
                  onClick={logout}
                  className="px-6 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="px-6 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all"
              >
                {isSigningIn ? "..." : "Login"}
              </button>
            )}
            
            {/* Mobile Menu Toggle */}
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-gray-100 overflow-hidden"
            >
              <div className="px-8 pt-2 pb-6 space-y-4 font-headline">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium text-gray-900"
                  >
                    {link.name}
                  </Link>
                ))}
                {user && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-medium text-gray-900"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Error Toast */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-red-600 text-white px-6 py-3 rounded-full shadow-2xl flex items-center space-x-3"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => (
  <footer className="w-full py-12 px-8 border-t border-slate-100 bg-white">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
      <div className="space-y-6">
        <div className="font-headline text-xl text-[#0A1128] tracking-tighter">Clause & Effect</div>
        <p className="text-slate-400 font-body text-sm uppercase tracking-widest leading-loose">
          © 2026 Clause & Effect. Advocating for Modern Legal Thought.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <a className="block text-slate-400 hover:text-[#fdd25c] transition-colors font-body text-sm uppercase tracking-widest" href="#">Privacy Policy</a>
          <a className="block text-slate-400 hover:text-[#fdd25c] transition-colors font-body text-sm uppercase tracking-widest" href="#">Editorial Standards</a>
        </div>
        <div className="space-y-4">
          <a className="block text-slate-400 hover:text-[#fdd25c] transition-colors font-body text-sm uppercase tracking-widest" href="#">Terms of Service</a>
          <a className="block text-slate-400 hover:text-[#fdd25c] transition-colors font-body text-sm uppercase tracking-widest" href="#">Contact Us</a>
        </div>
      </div>
    </div>
  </footer>
);

// --- Pages ---

const Landing = () => {
  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section className="relative min-h-[921px] flex items-center overflow-hidden px-8">
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary-container to-black">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAQf5voPH3x8XHqwNF20wqQAW-QaT5fAqYjdGEDLwLcNus0BXjpwDerA118dxryL6mFVH78vWuxv-gj2Iyn0kTQuMhAri1_AaNTWio2g_kfNrRgV1WdHjtmzZoijA7jQmEM9MHH1pu4J9_CS9Fsz5m1LTKU7acWlbC6KR4PuTDr6mYGGteZl5wbzzuiOWx85zWuTs3b-xs45LFMJ1Ori_2n4jH_WA2X9o8zW9ajhHE9UMPzHz9C_2zADdCwUb396qxx07sN4BNEBKs')" }}></div>
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-secondary-container/20 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-primary/40 rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-secondary-container/10 text-secondary-fixed text-xs font-bold tracking-[0.2em] uppercase">Advocating for Modern Legal Thought</span>
            <h1 className="text-6xl md:text-8xl font-headline text-white leading-[0.9] tracking-tight">
              The Law, <br />
              <span className="italic text-secondary-container">Refined.</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-md font-body leading-relaxed">
              Redefining legal discourse through high-contrast editorial analysis and relentless pursuit of justice in the modern age.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <Link to="/blogs" className="px-8 py-4 bg-secondary-container text-on-secondary-container rounded-xl font-bold text-lg hover:scale-105 transition-transform">Start the Brief</Link>
              <button className="px-8 py-4 text-white border border-white/20 rounded-xl font-bold text-lg backdrop-blur-sm hover:bg-white/10 transition-colors">Our Vision</button>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative border border-white/10">
              <img className="w-full h-full object-cover" alt="abstract architectural shot" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAilLVP7QNHDNKoXApculjOdh6wAqUfyq6vE1NI6O2BHg2Ep_B0L6TnFFxwSOhvCBStoOnfmEwUGFsLW7_TW_UO1kZ79KL4zVtcjDKnW90ElC2zgYc7HlXgnr5ivhfaN4U2GMv2jreLnddYiRge2AYoLFPOCjua2FZMe7D6zSkwvBsdNFGfHxkRD6h9UZXB2zHrk99MgTEIe7B2F4qCLvdUX-RfhWq8NZgdqsnikAttG6A_iBjdmD2ObmMpr6oO6Z-S4V95PPiDTBw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white font-headline text-2xl">"Justice is the first virtue of social institutions."</p>
                <p className="text-secondary-container mt-2 font-label text-sm uppercase tracking-widest">— John Rawls</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Goal & Why We Exist Section */}
      <section className="py-32 px-8 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="brief-accent mb-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-primary">Foundational Pillars</h2>
            <p className="text-on-surface-variant font-body mt-2">The architecture of our mission and purpose.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-surface-container-low p-12 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <span className="material-symbols-outlined text-secondary text-5xl mb-6">gavel</span>
                <h3 className="text-3xl font-headline font-bold mb-6">Our Definitive Goal</h3>
                <p className="text-lg text-on-surface-variant leading-relaxed mb-8">
                  We aim to bridge the gap between complex legal scholarship and public understanding. By translating the intricacies of the court into compelling editorial narratives, we empower the modern citizen to engage with the law.
                </p>
              </div>
              <div className="flex items-center gap-4 text-primary font-bold hover:gap-6 transition-all cursor-pointer">
                <span>Read the Manifesto</span>
                <span className="material-symbols-outlined">arrow_forward</span>
              </div>
            </div>
            <div className="md:col-span-5 bg-[#141a32] p-12 rounded-3xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <span className="material-symbols-outlined text-9xl">balance</span>
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-headline font-bold mb-6">Why We Exist</h3>
                <p className="text-slate-300 leading-relaxed">
                  Because tradition without evolution is stagnation. The legal world has long remained an ivory tower; we exist to deconstruct its walls through transparency and modern discourse.
                </p>
              </div>
            </div>
            <div className="md:col-span-4 bg-[#fdd25c] p-8 rounded-3xl flex items-center justify-center text-center">
              <div>
                <div className="text-5xl font-headline font-extrabold text-[#241a00] mb-2">500+</div>
                <div className="text-sm font-label uppercase tracking-widest text-[#594400]">Legal Analyses</div>
              </div>
            </div>
            <div className="md:col-span-4 bg-gray-100 p-8 rounded-3xl flex items-center justify-center text-center">
              <div>
                <div className="text-5xl font-headline font-extrabold text-primary mb-2">24/7</div>
                <div className="text-sm font-label uppercase tracking-widest text-gray-500">Active Advocacy</div>
              </div>
            </div>
            <div className="md:col-span-4 bg-gray-200 p-8 rounded-3xl flex items-center justify-center text-center">
              <div>
                <div className="text-5xl font-headline font-extrabold text-primary mb-2">15k</div>
                <div className="text-sm font-label uppercase tracking-widest text-gray-500">Community Members</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Reels Carousel */}
      <section className="py-24 bg-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 mb-12 flex justify-between items-end">
          <div className="brief-accent">
            <h2 className="text-4xl font-headline font-bold">Trending Verdicts</h2>
            <p className="text-gray-500 mt-2 font-body">Bite-sized legal insights from our social community.</p>
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
        <div className="flex gap-6 px-8 overflow-x-auto no-scrollbar pb-8">
          {[
            { id: 1, views: '124k', title: 'Understanding Tort Reform in 60 Seconds', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCn_MxZ687OpgfqHNhuydnh1sAQ6TkjE5UY-6b4h2tfOHqXBrHaEsHHHCsPPH8WlxKgjsSuiwrs2hGLs8dMzgi-bUjbNuuSsgCPvZ_e9lbR9jxfHWLLG6AnrE35IVyieDQEHQ6jqPQbzVu1xZaeFqJv9Jrv8A5__az7svLxUoJIabDljyWRZykuUKyV_RJ8IOmU8VWOZ2z59B4MvOw3IBQ8WCscRkU7Dh6uGEKjGuD3XGT7ZnAl5Lx0zX2nVk__fnPckQqZEwTwRtw' },
            { id: 2, views: '89k', title: 'The Future of Intellectual Property', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3q6AOmgC-NBulLq0yj4cOYu-O-A7f-kmBp2dfhBfBwkTIGCmIVyzllfzJcmecCApljO7fBnYN7Rsh19nI_Wye-Xxxp1EPy36OasFGLXPaPwxO945880buqZxyjImNbCkwhrl2Tt2uywH6dMXDC9hoZDkVLmv2_cfkwpQPgF7BjQTqkVFFAAdZ4_6D6Gfvg1Hd2egwPk_7Pply3BIDd5Qms6YvSrzM2zk5PodKAWdIu54u061ho5ZLubdPFtEkdBvOYY8eHucvxdg' },
            { id: 3, views: '210k', title: 'Corporate Ethics vs. Compliance', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBen557_nxI0JpTwiijZPGCyRyNyWeAPouRNnPD6YjhmbKJ90wATd-gOfTZGiaw9LjmeGjG83HmlufVntm1Hgw3oFtaqqfyCEuMRr55ahhI6EbSPm_ZU-cDoum0ifYrLsCd14c8sUcMB3LwHMVbzSyx5Qz3vv5z801G05X08C-VdtIgS9vUthhLKHQMlD_AEk5Jhnz1juwmH88IbuRAoWB2k8mAmasV0D7xc4wNN6JWQoKqhkn0Rk97Pqa_AhY-Y3fIduowOxhxJpg' },
            { id: 4, views: '56k', title: 'Navigating Privacy in the Digital Era', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCvcfw8rFCuyIPjUlRj4xgUfYWu617ZMZY_Mkw_qFtHs3vvw2cW463r8UBiwaSa1jwts44q9qo8M08iScbMxGVM0ZRStTdIxxgUsvA5-LRP5VY6PU2lGfH496d734IYzcBObeRJPFTY5K_FofwTxX5QdF-8Stug_-hF_87-qYc7By4DX-KBUzsNGzBWJDP56ylx8ZwLFNSvg2_efuKmPuUkc5hNaABAZoLn-60rCFYlz95nmc7f4NfCNxxlSnncKS_bdSte0-sgwjk' }
          ].map(reel => (
            <div key={reel.id} className="flex-none w-72 aspect-[9/16] rounded-2xl bg-black relative group cursor-pointer overflow-hidden">
              <img className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt={reel.title} src={reel.img} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
                  <span className="material-symbols-outlined text-sm">play_circle</span>
                  <span>{reel.views} views</span>
                </div>
                <p className="text-white font-bold leading-tight">{reel.title}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Meet the Team Section */}
      <section id="team" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-headline font-bold text-primary mb-4">The Editorial Board</h2>
            <div className="w-24 h-1 bg-[#fdd25c] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: 'Julian Sterling', role: 'Editor-in-Chief', desc: 'Former appellate attorney turned digital advocate for judicial transparency.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBS9A6x0uPQtyqdMH4KMu5Q3F-XML8YxUud1K4PAuVdBBTaMGGot6rvORbJ7cHyWTs9MaX9Btd01afdvw2h4qvOf7h5_K6cPzLQPF7YuNWzjapnVkMdjKSLYzNmLd90NS2p6A8hkwU9GoFdnemuYjelL-6IaYnB7uAWn2w76PX5WvN6aFjC-iFKkm1O2o--jtxf3nKOamUmAfMXYHDObNnPU6NzJIC_oaFN0L29JwKt0HqrWsP8yrH--bN7pfo7ewh_357f6Pf8WYM' },
              { name: 'Elena Vance', role: 'Senior Legal Strategist', desc: 'Specializing in the intersection of constitutional law and emerging technologies.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxgMGPaaeLJem1j5j5f60Y9mokyn2vQAx4jGce58T_XnAmDpkIZ0kdTUj5dHVKRLTgtrk5m4MmwPNvoGn2QkTg_EV3nAOv9bVQcT8FnW1XMneYhs1wXO9JXJiXEomVNhWG4b8DCXHl3fKB0jPhgfDVkwS1eSk8MCkz1UHa26Ei84KbmtKFQ8seM6QZsjIDVGh274ZzrLurLP-flhaHoe24iUsbHWdRvBlmeQ2MNLsKbgCX2ywG_X3rPh2tkAIPkknIJJhemNKlH3I' },
              { name: 'Marcus Thorne', role: 'Head of Content', desc: 'Crafting narratives that humanize the legal process for a global audience.', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBSS58NThocTUgkzcW3bhS-q1Ct-tVU60s2ZFU7QhUbuMJCmvZY8tfm1H0Fh1jjV3_bt4D154jOIWphYgCMjE4iU6ERNMPG7EnmCfJIPPi-dkCLIIBWaq9hWNUxBxr4zw-yO5OGWNc-It37U8y100WegmaSVvk0ol4lAdMepDjtmJz-0hasq5YS3yrx5SoZJOMwt8M_yxLg6hB5LsupE-1D3QP8aPD__u5gIrR_jGwaEmSRL2b6bbTS76tu7US-doo2Yp_zVRIHwSw' }
            ].map(member => (
              <div key={member.name} className="group">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6 grayscale hover:grayscale-0 transition-all duration-500">
                  <img className="w-full h-full object-cover" alt={member.name} src={member.img} />
                </div>
                <h4 className="text-2xl font-headline font-bold text-primary">{member.name}</h4>
                <p className="text-secondary font-label text-xs uppercase tracking-widest mb-4">{member.role}</p>
                <p className="text-on-surface-variant font-body text-sm leading-relaxed">{member.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section id="contact" className="py-32 px-8 bg-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-24 items-start">
          <div>
            <div className="brief-accent mb-8">
              <h2 className="text-5xl font-headline font-bold">Submit a Brief</h2>
            </div>
            <p className="text-xl text-on-surface-variant leading-relaxed mb-12">
              Have a case study or a legal perspective you'd like us to feature? Reach out to our editorial desk directly.
            </p>
            <div className="space-y-8">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">mail</span>
                </div>
                <div>
                  <p className="text-xs font-label uppercase tracking-widest text-gray-500">Email</p>
                  <p className="text-lg font-bold">briefs@clauseandeffect.law</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <p className="text-xs font-label uppercase tracking-widest text-gray-500">Studio</p>
                  <p className="text-lg font-bold">1200 Avenue of the Stars, Century City</p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-12 rounded-3xl shadow-sm border border-gray-100">
            <form className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-label uppercase tracking-widest text-gray-500">Full Name</label>
                <input className="w-full bg-transparent border-b-2 border-gray-200 focus:border-[#fdd25c] transition-colors py-4 px-0 focus:ring-0 outline-none placeholder:text-slate-400" placeholder="John Doe" type="text" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-label uppercase tracking-widest text-gray-500">Legal Interest</label>
                <select className="w-full bg-transparent border-b-2 border-gray-200 focus:border-[#fdd25c] transition-colors py-4 px-0 focus:ring-0 outline-none">
                  <option>Constitutional Law</option>
                  <option>Corporate Litigation</option>
                  <option>Intellectual Property</option>
                  <option>General Inquiry</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-label uppercase tracking-widest text-gray-500">The Brief</label>
                <textarea className="w-full bg-transparent border-b-2 border-gray-200 focus:border-[#fdd25c] transition-colors py-4 px-0 focus:ring-0 outline-none placeholder:text-slate-400" placeholder="Describe your inquiry..." rows={4}></textarea>
              </div>
              <button className="w-full py-5 bg-black text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors mt-8">Send Inquiry</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
};

const BlogList = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'posts'), 
      where('status', '==', 'published'),
      orderBy('publishedAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching posts:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-40 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16">
          <h1 className="text-5xl font-serif font-bold mb-4">The Briefings</h1>
          <p className="text-gray-500 text-lg">Latest legal analysis and editorial insights, sorted by date.</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-gray-900">No briefings found</h3>
            <p className="text-gray-500 mt-2">Check back later for new editorial content.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <Link to={`/post/${post.id}`} className="block aspect-video overflow-hidden">
                  <img 
                    src={post.coverImage} 
                    alt={post.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                </Link>
                <div className="p-8">
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-xs text-gray-400">{post.readingTime}</span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-400">{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold mb-4 group-hover:text-gray-700 transition-colors">
                    <Link to={`/post/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={post.authorImage} 
                        alt={post.authorName} 
                        className="w-8 h-8 rounded-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs font-bold">{post.authorName}</span>
                    </div>
                    <Link to={`/post/${post.id}`} className="p-2 bg-gray-50 rounded-full group-hover:bg-black group-hover:text-white transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const docRef = doc(db, 'posts', id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setPost({ id: docSnap.id, ...docSnap.data() } as Post);
      } else {
        navigate('/');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;
  if (!post) return null;

  return (
    <div className="pt-20 pb-40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-12"
        >
          <Link to="/blogs" className="inline-flex items-center space-x-2 text-sm font-bold text-gray-500 hover:text-black mb-12 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Briefings</span>
          </Link>

          <div className="flex items-center space-x-3 mb-8">
            <span className="text-gray-400 text-sm">{post.readingTime}</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-serif font-bold leading-tight mb-12">
            {post.title}
          </h1>

          <div className="flex items-center space-x-6 mb-16 pb-8 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <img 
                src={post.authorImage} 
                alt={post.authorName} 
                className="w-12 h-12 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div>
                <p className="font-bold">{post.authorName}</p>
                <p className="text-sm text-gray-500">{post.authorRole}</p>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="text-sm text-gray-500">
              <p>Published</p>
              <p className="font-medium text-black">{new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>

          <div className="aspect-[21/9] rounded-3xl overflow-hidden mb-16 shadow-lg">
            <img 
              src={post.coverImage} 
              alt={post.title} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="markdown-body prose-serif max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const AdminDashboard = ({ user }: { user: FirebaseUser | null }) => {
  const isAdmin = user?.email === 'avantika.agarwal2505@gmail.com';
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({
    title: '',
    excerpt: '',
    content: '',
    category: 'Analysis',
    authorName: user?.displayName || '',
    authorRole: 'Contributor',
    authorImage: user?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
    coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200&h=800',
    readingTime: '5 min read',
    status: 'draft',
    publishedAt: new Date().toISOString(),
    views: 0
  });

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('publishedAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Post[]);
    });
    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (currentPost.id) {
        await updateDoc(doc(db, 'posts', currentPost.id), {
          ...currentPost,
          publishedAt: currentPost.status === 'published' ? new Date().toISOString() : currentPost.publishedAt
        });
      } else {
        await addDoc(collection(db, 'posts'), {
          ...currentPost,
          category: 'Analysis',
          publishedAt: new Date().toISOString()
        });
      }
      setIsEditing(false);
      setCurrentPost({
        title: '',
        excerpt: '',
        content: '',
        category: 'Analysis',
        authorName: user?.displayName || '',
        authorRole: 'Contributor',
        authorImage: user?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
        coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200&h=800',
        readingTime: '5 min read',
        status: 'draft',
        publishedAt: new Date().toISOString(),
        views: 0
      });
    } catch (err) {
      console.error("Error saving post:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      await deleteDoc(doc(db, 'posts', id));
    }
  };

  if (!user) return <div className="pt-40 text-center">Please sign in to access the dashboard.</div>;
  if (!isAdmin) return (
    <div className="pt-40 text-center max-w-md mx-auto px-4">
      <Lock className="w-12 h-12 text-red-500 mx-auto mb-6" />
      <h2 className="text-2xl font-serif font-bold mb-4">Access Restricted</h2>
      <p className="text-gray-500">
        The editorial dashboard is only accessible to authorized administrators. 
        If you believe this is an error, please contact the system administrator.
      </p>
      <Link to="/" className="inline-block mt-8 text-sm font-bold underline">Return to Home</Link>
    </div>
  );

  return (
    <div className="pt-32 pb-40 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-serif font-bold">Editorial Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage your publications and analysis</p>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-900 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Analysis</span>
          </button>
        </div>

        {isEditing ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
          >
            <form onSubmit={handleSave} className="space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Headline</label>
                  <input 
                    type="text"
                    required
                    value={currentPost.title}
                    onChange={e => setCurrentPost({...currentPost, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                    placeholder="Enter a compelling headline..."
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Excerpt</label>
                <textarea 
                  required
                  value={currentPost.excerpt}
                  onChange={e => setCurrentPost({...currentPost, excerpt: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all h-24"
                  placeholder="A brief summary for the feed..."
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-bold text-gray-700">Content (Markdown)</label>
                <textarea 
                  required
                  value={currentPost.content}
                  onChange={e => setCurrentPost({...currentPost, content: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all h-96 font-mono text-sm"
                  placeholder="# Start writing your analysis..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Cover Image URL</label>
                  <input 
                    type="text"
                    value={currentPost.coverImage}
                    onChange={e => setCurrentPost({...currentPost, coverImage: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                  />
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Status</label>
                  <select 
                    value={currentPost.status}
                    onChange={e => setCurrentPost({...currentPost, status: e.target.value as 'draft' | 'published'})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-700">Reading Time</label>
                  <input 
                    type="text"
                    value={currentPost.readingTime}
                    onChange={e => setCurrentPost({...currentPost, readingTime: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-black outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-8">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-8 py-3 rounded-full font-bold text-gray-500 hover:text-black transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="bg-black text-white px-10 py-3 rounded-full font-bold hover:bg-gray-900 transition-all flex items-center space-x-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Save Analysis</span>
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Analysis</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Status</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Date</th>
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="font-bold text-gray-900 line-clamp-1">{post.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{post.excerpt.substring(0, 60)}...</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={cn(
                        "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                        post.status === 'published' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {post.status === 'published' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                        <span>{post.status}</span>
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-500">
                      {new Date(post.publishedAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end space-x-2">
                        <button 
                          onClick={() => { setCurrentPost(post); setIsEditing(true); }}
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(post.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <Router>
      <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-black selection:text-white">
        <Navbar user={user} />
        
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/blogs" element={<BlogList />} />
            <Route path="/post/:id" element={<PostDetail />} />
            <Route path="/admin" element={<AdminDashboard user={user} />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}
