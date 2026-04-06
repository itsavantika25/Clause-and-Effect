import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  const navigate = useNavigate();

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
    { name: 'Home', path: '/', isAnchor: true },
    { name: 'About Us', path: '/#about', isAnchor: true },
    { name: 'Our Team', path: '/#team', isAnchor: true },
    { name: 'Contact', path: '/#contact', isAnchor: true },
    { name: 'Blogs', path: '/blogs', isAnchor: false },
  ];

  const handleNavClick = (path: string, isAnchor: boolean) => {
    if (isAnchor) {
      if (location.pathname !== '/') {
        navigate('/');
        // Wait for navigation to complete before scrolling
        setTimeout(() => {
          const id = path.split('#')[1] || 'hero';
          const element = document.getElementById(id);
          if (element) element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        const id = path.split('#')[1] || 'hero';
        const element = document.getElementById(id);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="flex justify-between items-center px-4 md:px-8 py-3 md:py-4 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <button onClick={() => handleNavClick('/', true)} className="flex items-center gap-4 group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center transition-transform">
               <img src="/img/logo.png" className="w-8 h-8 md:w-10 md:h-10 object-contain" />
              </div>
              <span className="text-lg md:text-2xl font-serif text-[#050a18] tracking-tighter font-headline font-bold">Clause & Effect</span>
            </button>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8 font-headline tracking-tight">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => handleNavClick(link.path, link.isAnchor)}
                className={cn(
                  "transition-all duration-300 ease-in-out pb-1 font-bold",
                  (location.pathname === link.path || (location.pathname === '/' && link.path === '/'))
                    ? "text-[#050a18] border-b-2 border-[#fdd25c]" 
                    : "text-slate-500 hover:text-[#050a18]"
                )}
              >
                {link.name}
              </button>
            ))}
            {user && (
              <Link 
                to="/admin" 
                className={cn(
                  "transition-all duration-300 ease-in-out pb-1 font-bold",
                  location.pathname === '/admin' 
                    ? "text-slate-900 border-b-2 border-[#fdd25c]" 
                    : "text-slate-500 hover:text-[#0A1128]"
                )}
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-2 md:gap-4">
            {user ? (
         <div className="flex items-center gap-2 md:gap-4">
  <img 
    src={user.photoURL || ''} 
    alt={user.displayName || ''} 
    className="hidden md:block w-8 h-8 rounded-full" 
  />
  <button 
    onClick={logout}
    className="px-3 md:px-6 py-2 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all text-sm md:text-base"
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
            <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 ml-1">
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
             <div className="px-4 pt-2 pb-6 space-y-4 font-headline">
                {navLinks.map((link) => (
                  <button
                    key={link.name}
                    onClick={() => handleNavClick(link.path, link.isAnchor)}
                    className="block w-full text-left text-lg font-bold text-[#050a18] py-2"
                  >
                    {link.name}
                  </button>
                ))}
                {user && (
                  <Link
                    to="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block text-lg font-bold text-[#050a18] py-2"
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

const Footer = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full py-16 px-8 border-t border-slate-100 bg-[#050a18] text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-7xl mx-auto">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="font-headline text-2xl font-bold tracking-tighter">Clause and Effect</div>
          </div>
          <p className="text-slate-400 font-body text-sm uppercase tracking-widest leading-loose">
            © 2026 Clause and Effect.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[#fdd25c] font-bold text-xs uppercase tracking-widest mb-6">Navigation</h4>
            <button onClick={() => scrollToSection('hero')} className="block text-left text-slate-400 hover:text-[#fdd25c] transition-colors font-body text-sm uppercase tracking-widest">Home</button>
            <button onClick={() => scrollToSection('about')} className="block text-left text-slate-400 hover:text-[#fdd25c] transition-colors font-body text-sm uppercase tracking-widest">About Us</button>
            <button onClick={() => scrollToSection('team')} className="block text-left text-slate-400 hover:text-[#fdd25c] transition-colors font-body text-sm uppercase tracking-widest">Our Team</button>
            <button onClick={() => scrollToSection('contact')} className="block text-left text-slate-400 hover:text-[#fdd25c] transition-colors font-body text-sm uppercase tracking-widest">Contact Us</button>
          </div>
            <div className="space-y-4">
            <h4 className="text-[#fdd25c] font-bold text-xs uppercase tracking-widest mb-6">Social Links</h4>
            <button onClick={() => window.open('https://www.instagram.com/clauseandeffect_', '_blank')} className="block text-left text-slate-400 hover:text-[#fdd25c] transition-colors font-body text-sm uppercase tracking-widest">Instagram</button>
            <button onClick={() => window.open('https://www.youtube.com/@clauseandeffect57', '_blank')} className="block text-left text-slate-400 hover:text-[#fdd25c] transition-colors font-body text-sm uppercase tracking-widest">YouTube</button>
          </div>
        </div>
      </div>
    </footer>
  );
};

// --- Pages ---

const Landing = () => {
  const [selectedReel, setSelectedReel] = useState<any>(null);

  const team = [
    { name: 'Ridhima Khanna', role: 'Founder & President', img: '/img/ridhima.jpeg' },
    { name: 'Asees Kaur Oberoi', role: 'Co-Founder & Vice president', img: '/img/asees.png' },
    { name: 'Avantika Agarwal', role: 'Co-Founder & Technical Head', img: '/img/avantika.JPG' },
    { name: 'Devanshi Pahwa', role: 'Research Head', img: '/img/devanshi.webp' },
    { name: 'Hiya Agarwal', role: 'Graphic Designer', img: '/img/hiya.jpeg' }
  ];

  const reels = [
    { id: 1, views: '124k', title: 'Understanding Tort Reform in 60 Seconds', img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=400&h=700', video: 'https://assets.mixkit.co/videos/preview/mixkit-lawyer-reading-a-document-in-his-office-40011-large.mp4' },
    { id: 2, views: '89k', title: 'The Future of Intellectual Property', img: 'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=400&h=700', video: 'https://assets.mixkit.co/videos/preview/mixkit-lawyer-working-at-his-desk-40010-large.mp4' },
    { id: 3, views: '210k', title: 'Corporate Ethics vs. Compliance', img: 'https://images.unsplash.com/photo-1450175804616-78ff2560c047?auto=format&fit=crop&q=80&w=400&h=700', video: 'https://assets.mixkit.co/videos/preview/mixkit-lawyer-talking-on-the-phone-in-his-office-40009-large.mp4' },
    { id: 4, views: '56k', title: 'Navigating Privacy in the Digital Era', img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=400&h=700', video: 'https://assets.mixkit.co/videos/preview/mixkit-lawyer-writing-on-a-notebook-40012-large.mp4' }
  ];

  return (
    <main className="pt-20">
      {/* Hero Section */}
      <section id="hero" className="relative min-h-[921px] flex items-center overflow-hidden px-8">
        <div className="absolute inset-0 z-0 bg-[#050a18]">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1920&h=1080')" }}></div>
          <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#fdd25c]/10 rounded-full blur-[120px]"></div>
          <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#fdd25c]/10 rounded-full blur-[120px]"></div>
        </div>
        <div className="relative z-10 max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-[#fdd25c]/10 text-[#fdd25c] text-xs font-bold tracking-[0.2em] uppercase">Asking the Questions Others are too Scared to Think Of.</span>
            <h1 className="text-6xl md:text-8xl font-headline text-white leading-[0.9] tracking-tight">
             Breaking Down <br />
              <span className="italic text-[#fdd25c]">the Indian Law.</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-md font-body leading-relaxed">
              Creating change through conversations, sparking thought and encouraging the youth to think past just what we're told.
            </p>
            <div className="flex items-center gap-6 pt-4">
              <Link to="/blogs" className="px-8 py-4 bg-[#fdd25c] text-[#050a18] rounded-xl font-bold text-lg hover:scale-105 transition-transform">Blogs</Link>
              <button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="px-8 py-4 text-white border border-white/20 rounded-xl font-bold text-lg backdrop-blur-sm hover:bg-white/10 transition-colors">Our Vision</button>
            </div>
          </motion.div>
          <div className="relative hidden md:block">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl relative border border-white/10"
            >
              <img className="w-full h-full object-cover" alt="abstract architectural shot" src="https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&q=80&w=800&h=1000" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-8 left-8 right-8">
                <p className="text-white font-headline text-2xl">"It is the Responsibility of the Patriot to Protect his Country from its Government."</p>
                <p className="text-[#fdd25c] mt-2 font-label text-sm uppercase tracking-widest">— Thomas Paine.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Goal & Why We Exist Section */}
      <section className="py-32 px-8 bg-white" id="about">
        <div className="max-w-7xl mx-auto">
          <div className="brief-accent mb-16">
            <h2 className="text-4xl md:text-5xl font-headline font-bold text-[#050a18]">About Us</h2>
            <p className="text-gray-500 font-body mt-2">How Clause and Effect came to be and its future.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-7 bg-gray-50 p-12 rounded-3xl shadow-sm flex flex-col justify-between">
              <div>
                <Scale className="text-[#fdd25c] w-12 h-12 mb-6" />
                <h3 className="text-3xl font-headline font-bold mb-6">Our Definitive Goal</h3>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  We aim to bridge the gap between complex legal scholarship and public understanding. By translating the intricacies of the court into compelling editorial narratives, we empower the modern citizen to engage with the law.
                </p>
              </div>
            </div>
            <div className="md:col-span-5 bg-[#050a18] p-12 rounded-3xl text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Shield className="w-32 h-32" />
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
                <div className="text-5xl font-headline font-extrabold text-[#050a18] mb-2">68k+</div>
                <div className="text-sm font-label uppercase tracking-widest text-[#050a18]/60">Views on Instagram</div>
              </div>
            </div>
            <div className="md:col-span-4 bg-gray-100 p-8 rounded-3xl flex items-center justify-center text-center">
              <div>
                <div className="text-5xl font-headline font-extrabold text-[#050a18] mb-2">210+</div>
                <div className="text-sm font-label uppercase tracking-widest text-gray-500">Followers on Instagram</div>
              </div>
            </div>
            <div className="md:col-span-4 bg-gray-200 p-8 rounded-3xl flex items-center justify-center text-center">
              <div>
                <div className="text-5xl font-headline font-extrabold text-[#050a18] mb-2">15k</div>
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
            <p className="text-gray-500 mt-2 font-body">Bite-sized legal insights from our social community <a href="https://instagram.com/clauseandeffect_" target="_blank" rel="noopener noreferrer" className="text-[#fdd25c] font-bold">@clauseandeffect_</a></p>
          </div>
          <div className="flex gap-2">
            <button className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button className="p-3 bg-white rounded-full shadow-sm hover:bg-slate-50 transition-colors">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="flex gap-6 px-8 overflow-x-auto no-scrollbar pb-8">
          {reels.map(reel => (
            <motion.div 
              key={reel.id} 
              whileHover={{ y: -10 }}
              onClick={() => setSelectedReel(reel)}
              className="flex-none w-72 aspect-[9/16] rounded-2xl bg-black relative group cursor-pointer overflow-hidden shadow-xl"
            >
              <img className="w-full h-full object-cover opacity-80 group-hover:scale-110 transition-transform duration-700" alt={reel.title} src={reel.img} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center gap-2 text-white/80 text-xs mb-2">
                  <Eye className="w-4 h-4" />
                  <span>{reel.views} views</span>
                </div>
                <p className="text-white font-bold leading-tight">{reel.title}</p>
              </div>
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30">
                  <ArrowRight className="w-8 h-8 text-white" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Meet the Team Section */}
      <section id="team" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-headline font-bold text-[#050a18] mb-4">Meet the Team</h2>
            <div className="w-24 h-1 bg-[#fdd25c] mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {team.map(member => (
              <div key={member.name} className="group">
                <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-6 grayscale hover:grayscale-0 transition-all duration-500 shadow-lg">
                  <img className="w-full h-full object-cover" alt={member.name} src={member.img} />
                </div>
                <h4 className="text-xl font-headline font-bold text-[#050a18]">{member.name}</h4>
                <p className="text-[#fdd25c] font-label text-[10px] font-bold uppercase tracking-widest mb-4">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
<section id="contact" className="py-20 px-4 sm:px-6 md:py-32 md:px-8 bg-[#050a18] text-white">
  <div className="max-w-7xl mx-auto text-center">
    
    <div className="inline-block w-16 sm:w-24 h-1 bg-[#fdd25c] mb-8 sm:mb-12"></div>

    <h2 className="text-3xl sm:text-5xl md:text-7xl font-headline font-bold mb-6 sm:mb-8">
      Contact Us, 24/7
    </h2>

    <p className="text-base sm:text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 sm:mb-16 px-2">
      Feel free to reach out to us anytime for legal advice, debates or just to talk about any legal topics. DM us on Instagram, or email us for more formal queries.
    </p>
    
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
      
      <a 
        href="https://instagram.com/clauseandeffect_" 
        target="_blank" 
        rel="noopener noreferrer"
        className="flex flex-col items-center p-8 sm:p-12 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#fdd25c] flex items-center justify-center text-[#050a18] mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
          <Globe className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-headline font-bold mb-1 sm:mb-2">Instagram</h3>
        <p className="text-[#fdd25c] font-bold text-sm sm:text-base break-all">
          @clauseandeffect_
        </p>
      </a>
      
      <a 
        href="mailto:clause.and.effect57@gmail.com"
        className="flex flex-col items-center p-8 sm:p-12 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group"
      >
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#fdd25c] flex items-center justify-center text-[#050a18] mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
          <Send className="w-6 h-6 sm:w-8 sm:h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-headline font-bold mb-1 sm:mb-2">Email</h3>
        <p className="text-[#fdd25c] font-bold text-sm sm:text-base break-all">
          clause.and.effect57@gmail.com
        </p>
      </a>

    </div>
  </div>
</section>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedReel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedReel(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md aspect-[9/16] bg-black rounded-3xl overflow-hidden shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <button 
                onClick={() => setSelectedReel(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-black/50 text-white rounded-full hover:bg-black transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <video 
                src={selectedReel.video} 
                autoPlay 
                controls 
                loop
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black to-transparent">
                <h3 className="text-white text-xl font-bold mb-2">{selectedReel.title}</h3>
                <p className="text-white/60 text-sm">Watch more on Instagram @clauseandeffect_</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
          <h1 className="text-5xl font-serif font-bold mb-4">C&E Blog</h1>
          <p className="text-gray-500 text-lg">Read our views and analysis on various legal issues and updates today.</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-serif font-bold text-gray-900">No blogs found</h3>
            <p className="text-gray-500 mt-2">Check back later for new content.</p>
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
            <span>Back to Blogs</span>
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
              <p className="font-medium text-black">{new Date(post.publishedAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
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

const AdminEmails = [
  'avantika.agarwal2505@gmail.com',
  'clause.and.effect57@gmail.com',
  'ridhimakhanna2001@gmail.com',
  'aseeskauroberoi@gmail.com',
  'devanshi.pahwa@gmail.com',
  'hiyaconnect@gmail.com'
];

const AdminDashboard = ({ user }: { user: FirebaseUser | null }) => {
  const navigate = useNavigate();
  const isAdmin = user?.email && AdminEmails.includes(user.email);
  const [posts, setPosts] = useState<Post[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPost, setCurrentPost] = useState<Partial<Post>>({
    title: '',
    excerpt: '',
    content: '',
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
        publishedAt: currentPost.status === 'published'
          ? new Date().toISOString()
          : currentPost.publishedAt
      });
    } else {
      await addDoc(collection(db, 'posts'), {
        ...currentPost,
        publishedAt: new Date().toISOString()
      });
    }

    setIsEditing(false);

    setCurrentPost({
      id: undefined, 
      title: '',
      excerpt: '',
      content: '',
      authorName: user?.displayName || '',
      authorRole: 'Contributor',
      authorImage: user?.photoURL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100&h=100',
      coverImage: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&q=80&w=1200&h=800',
      readingTime: '5 min read',
      status: 'published',
      publishedAt: new Date().toISOString(),
      views: 0
    });

    navigate('/blogs');
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
            <p className="text-gray-500 mt-2">Manage your publications and blogs</p>
          </div>
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 bg-black text-white px-6 py-3 rounded-full font-bold hover:bg-gray-900 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>New Blog</span>
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
                  placeholder="# Start writing your blog..."
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
                  <span>Save Blog</span>
                </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-4 text-xs font-bold uppercase tracking-widest text-gray-500">Blog</th>
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
