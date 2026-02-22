/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, 
  Phone, 
  Clock, 
  Instagram, 
  Facebook, 
  MessageSquare, 
  X, 
  Send, 
  ChevronRight,
  Menu as MenuIcon,
  ChefHat,
  UtensilsCrossed,
  Sparkles,
  LayoutDashboard,
  Users,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  LogOut,
  ArrowLeft
} from 'lucide-react';
import { askConcierge } from './services/geminiService';
import { cn } from './utils';

// --- Types ---

interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: string;
  description: string;
}

interface Reservation {
  id: number;
  name: string;
  email: string;
  date: string;
  time: string;
  guests: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

// --- Components ---

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4",
      isScrolled ? "bg-brand-cream/90 backdrop-blur-md shadow-sm py-3" : "bg-transparent"
    )}>
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <a href="#" className="nav-link hidden md:block">Home</a>
          <a href="#menu" className="nav-link hidden md:block">Menu</a>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl md:text-3xl font-serif tracking-tighter text-brand-dark">
            MALBRIZ <span className="italic text-brand-gold">Fusion</span>
          </h1>
        </div>

        <div className="flex items-center gap-8">
          <a href="#about" className="nav-link hidden md:block">About</a>
          <a href="#location" className="nav-link hidden md:block">Contact</a>
          <button className="md:hidden">
            <MenuIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute inset-0 z-0"
      >
        <img 
          src="https://picsum.photos/seed/restaurant-interior/1920/1080?blur=2" 
          alt="Restaurant Interior" 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/40" />
      </motion.div>

      <div className="relative z-10 text-center px-6">
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-brand-gold uppercase tracking-[0.3em] text-sm mb-4 font-medium"
        >
          A Symphony of Flavors
        </motion.p>
        <motion.h2 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-5xl md:text-8xl text-white font-serif mb-8 leading-tight"
        >
          Where Tradition <br />
          <span className="italic">Meets Innovation</span>
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <a 
            href="#menu"
            className="inline-flex items-center gap-2 bg-brand-gold hover:bg-brand-gold/90 text-white px-8 py-4 rounded-full transition-all transform hover:scale-105 uppercase tracking-widest text-xs font-bold"
          >
            Explore the Menu <ChevronRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/60"
      >
        <div className="w-px h-12 bg-white/30 mx-auto" />
      </motion.div>
    </section>
  );
};

const MenuSection = ({ menuItems }: { menuItems: MenuItem[] }) => {
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <section id="menu" className="py-24 px-6 bg-white">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <UtensilsCrossed className="w-8 h-8 text-brand-gold mx-auto mb-4" />
          <h2 className="text-4xl md:text-5xl font-serif mb-4">Our Culinary Canvas</h2>
          <div className="w-24 h-px bg-brand-gold mx-auto" />
        </div>

        <div className="grid md:grid-cols-2 gap-16">
          {categories.map((cat, idx) => (
            <div key={idx}>
              <h3 className="text-2xl font-serif italic mb-8 border-b border-brand-gold/20 pb-2">{cat}</h3>
              <div className="space-y-8">
                {menuItems.filter(item => item.category === cat).map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="text-lg font-medium group-hover:text-brand-gold transition-colors">{item.name}</h4>
                      <span className="text-brand-gold font-serif">{item.price}</span>
                    </div>
                    <p className="text-brand-dark/60 text-sm leading-relaxed">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const ReservationSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    guests: 2
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setStatus('success');
      setFormData({ name: '', email: '', date: '', time: '', guests: 2 });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      console.error(error);
      setStatus('idle');
    }
  };

  return (
    <section id="reservations" className="py-24 px-6 bg-brand-cream">
      <div className="max-w-3xl mx-auto glass-card rounded-3xl p-8 md:p-12">
        <div className="text-center mb-10">
          <Calendar className="w-8 h-8 text-brand-gold mx-auto mb-4" />
          <h2 className="text-3xl md:text-4xl font-serif mb-2">Book a Table</h2>
          <p className="text-brand-dark/60 italic">Join us for an unforgettable evening</p>
        </div>

        {status === 'success' ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-2xl font-serif mb-2">Reservation Received</h3>
            <p className="text-brand-dark/60">We'll confirm your booking via email shortly.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-brand-dark/60">Full Name</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-brand-dark/60">Email Address</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-brand-dark/60">Date</label>
              <input 
                required
                type="date" 
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-brand-dark/60">Time</label>
              <input 
                required
                type="time" 
                value={formData.time}
                onChange={e => setFormData({...formData, time: e.target.value})}
                className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs uppercase tracking-widest font-bold text-brand-dark/60">Number of Guests</label>
              <input 
                required
                type="number" 
                min="1"
                max="20"
                value={formData.guests}
                onChange={e => setFormData({...formData, guests: parseInt(e.target.value)})}
                className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors"
              />
            </div>
            <button 
              disabled={status === 'loading'}
              className="md:col-span-2 bg-brand-dark text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brand-gold transition-all disabled:opacity-50"
            >
              {status === 'loading' ? 'Processing...' : 'Confirm Reservation'}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

const AdminDashboard = ({ onBack }: { onBack: () => void }) => {
  const [activeTab, setActiveTab] = useState<'menu' | 'reservations'>('reservations');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({ totalMenuItems: 0, totalReservations: 0, pendingReservations: 0 });
  const [newItem, setNewItem] = useState({ name: '', category: 'Starters', price: '', description: '' });

  const fetchData = async () => {
    const [mRes, rRes, sRes] = await Promise.all([
      fetch('/api/menu'),
      fetch('/api/reservations'),
      fetch('/api/stats')
    ]);
    setMenuItems(await mRes.json());
    setReservations(await rRes.json());
    setStats(await sRes.json());
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch('/api/menu', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem)
    });
    setNewItem({ name: '', category: 'Starters', price: '', description: '' });
    fetchData();
  };

  const handleDeleteMenuItem = async (id: number) => {
    await fetch(`/api/menu/${id}`, { method: 'DELETE' });
    fetchData();
  };

  const handleUpdateReservation = async (id: number, status: string) => {
    await fetch(`/api/reservations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-brand-dark text-white p-6 flex flex-col">
        <div className="mb-12">
          <h1 className="text-xl font-serif tracking-tighter">
            MALBRIZ <span className="italic text-brand-gold">Admin</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('reservations')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium",
              activeTab === 'reservations' ? "bg-brand-gold text-white" : "hover:bg-white/5 text-white/60"
            )}
          >
            <Calendar className="w-4 h-4" /> Reservations
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium",
              activeTab === 'menu' ? "bg-brand-gold text-white" : "hover:bg-white/5 text-white/60"
            )}
          >
            <UtensilsCrossed className="w-4 h-4" /> Menu Manager
          </button>
        </nav>

        <button 
          onClick={onBack}
          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 text-white/60 text-sm font-medium mt-auto"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Site
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-serif">Dashboard Overview</h2>
            <p className="text-slate-500 text-sm">Welcome back, Administrator.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[180px]">
              <div className="w-10 h-10 rounded-full bg-brand-gold/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pending</p>
                <p className="text-xl font-bold">{stats.pendingReservations}</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4 min-w-[180px]">
              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Res</p>
                <p className="text-xl font-bold">{stats.totalReservations}</p>
              </div>
            </div>
          </div>
        </header>

        {activeTab === 'reservations' ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs uppercase font-bold text-slate-400">Guest</th>
                  <th className="px-6 py-4 text-xs uppercase font-bold text-slate-400">Date & Time</th>
                  <th className="px-6 py-4 text-xs uppercase font-bold text-slate-400">Guests</th>
                  <th className="px-6 py-4 text-xs uppercase font-bold text-slate-400">Status</th>
                  <th className="px-6 py-4 text-xs uppercase font-bold text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map(res => (
                  <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-700">{res.name}</p>
                      <p className="text-xs text-slate-400">{res.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600">{res.date}</p>
                      <p className="text-xs text-slate-400">{res.time}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{res.guests}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        res.status === 'confirmed' ? "bg-emerald-100 text-emerald-600" :
                        res.status === 'cancelled' ? "bg-rose-100 text-rose-600" :
                        "bg-amber-100 text-amber-600"
                      )}>
                        {res.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {res.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdateReservation(res.id, 'confirmed')}
                              className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-lg transition-colors"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleUpdateReservation(res.id, 'cancelled')}
                              className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-xl font-serif mb-6">Add New Dish</h3>
                <form onSubmit={handleAddMenuItem} className="space-y-4">
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Name</label>
                    <input 
                      required
                      type="text" 
                      value={newItem.name}
                      onChange={e => setNewItem({...newItem, name: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Category</label>
                    <select 
                      value={newItem.category}
                      onChange={e => setNewItem({...newItem, category: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-gold"
                    >
                      <option>Starters</option>
                      <option>Main Courses</option>
                      <option>Desserts</option>
                      <option>Drinks</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Price</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. 45 SAR"
                      value={newItem.price}
                      onChange={e => setNewItem({...newItem, price: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-gold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Description</label>
                    <textarea 
                      required
                      value={newItem.description}
                      onChange={e => setNewItem({...newItem, description: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-brand-gold h-24 resize-none"
                    />
                  </div>
                  <button className="w-full bg-brand-dark text-white py-3 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-brand-gold transition-colors flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" /> Add to Menu
                  </button>
                </form>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs uppercase font-bold text-slate-400">Dish</th>
                      <th className="px-6 py-4 text-xs uppercase font-bold text-slate-400">Category</th>
                      <th className="px-6 py-4 text-xs uppercase font-bold text-slate-400">Price</th>
                      <th className="px-6 py-4 text-xs uppercase font-bold text-slate-400">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {menuItems.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-700">{item.name}</p>
                          <p className="text-xs text-slate-400 truncate max-w-[200px]">{item.description}</p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{item.category}</td>
                        <td className="px-6 py-4 text-sm font-serif text-brand-gold">{item.price}</td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => handleDeleteMenuItem(item.id)}
                            className="p-2 hover:bg-rose-50 text-rose-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const ConciergeChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: "Welcome to Malbriz Fusion. I am your digital concierge. How may I assist you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const aiResponse = await askConcierge(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse || "I apologize, I'm having trouble connecting. Please try again." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "I'm sorry, I encountered an error. Please contact us directly." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="absolute bottom-20 right-0 w-[350px] h-[500px] glass-card rounded-2xl flex flex-col overflow-hidden"
          >
            <div className="bg-brand-dark text-white p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold">Concierge</p>
                  <p className="text-[10px] text-white/60 uppercase tracking-widest">AI Assistant</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:text-brand-gold transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-brand-cream/30">
              {messages.map((msg, i) => (
                <div key={i} className={cn(
                  "flex",
                  msg.role === 'user' ? "justify-end" : "justify-start"
                )}>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm",
                    msg.role === 'user' 
                      ? "bg-brand-gold text-white rounded-tr-none" 
                      : "bg-white text-brand-dark shadow-sm border border-brand-dark/5 rounded-tl-none"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-brand-dark/5">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-brand-gold rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-white border-t border-brand-dark/5">
              <div className="relative">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about our menu..."
                  className="w-full bg-brand-cream/50 border border-brand-dark/10 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-brand-gold"
                />
                <button 
                  onClick={handleSend}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-gold hover:text-brand-dark transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-brand-dark text-white flex items-center justify-center shadow-2xl hover:bg-brand-gold transition-colors"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </motion.button>
    </div>
  );
};

const LoginView = ({ onLogin, onBack }: { onLogin: () => void, onBack: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin987') {
      onLogin();
    } else {
      setError('Invalid password');
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full glass-card rounded-3xl p-8 text-center">
        <LayoutDashboard className="w-12 h-12 text-brand-gold mx-auto mb-6" />
        <h2 className="text-3xl font-serif mb-2">Admin Access</h2>
        <p className="text-brand-dark/60 mb-8 italic">Please enter your credentials</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="password" 
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full bg-white border border-brand-dark/10 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-gold transition-colors text-center"
            autoFocus
          />
          {error && <p className="text-rose-500 text-xs">{error}</p>}
          <button className="w-full bg-brand-dark text-white py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-brand-gold transition-all">
            Login
          </button>
          <button type="button" onClick={onBack} className="text-brand-dark/40 text-xs hover:text-brand-dark transition-colors uppercase tracking-widest">
            Back to Site
          </button>
        </form>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<'public' | 'admin' | 'login'>('public');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    const fetchMenu = async () => {
      const res = await fetch('/api/menu');
      const data = await res.json();
      setMenuItems(data);
    };
    fetchMenu();
  }, [view]);

  if (view === 'admin') {
    return <AdminDashboard onBack={() => setView('public')} />;
  }

  if (view === 'login') {
    return <LoginView onLogin={() => setView('admin')} onBack={() => setView('public')} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <main>
        <Hero />
        
        {/* About Section */}
        <section id="about" className="py-24 px-6 bg-brand-cream overflow-hidden">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-gold/10 rounded-full blur-3xl" />
              <img 
                src="https://picsum.photos/seed/chef/800/1000" 
                alt="Chef at work" 
                className="rounded-2xl shadow-2xl relative z-10"
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-2xl shadow-xl z-20 hidden md:block">
                <p className="text-brand-gold font-serif text-4xl mb-2 italic">12+</p>
                <p className="text-xs uppercase tracking-widest font-bold text-brand-dark/60">Years of Excellence</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
            >
              <ChefHat className="w-10 h-10 text-brand-gold mb-6" />
              <h2 className="text-4xl md:text-5xl font-serif mb-8 leading-tight">
                A Journey Through <br />
                <span className="italic">Global Flavors</span>
              </h2>
              <p className="text-brand-dark/70 leading-relaxed mb-6">
                At Malbriz Fusion, we believe that food is a universal language. Our mission is to bridge the gap between cultures through a curated dining experience that honors Saudi heritage while embracing international innovation.
              </p>
              <p className="text-brand-dark/70 leading-relaxed mb-8">
                Every dish is a story, meticulously crafted by our chefs using the finest local ingredients and global spices. From our signature Lamb Kabsa Risotto to our delicate Fusion Mezze, we invite you to rediscover the familiar in an entirely new light.
              </p>
              <div className="flex gap-12">
                <div>
                  <p className="font-serif text-2xl mb-1">Authentic</p>
                  <p className="text-xs uppercase tracking-widest text-brand-dark/40">Heritage</p>
                </div>
                <div>
                  <p className="font-serif text-2xl mb-1">Modern</p>
                  <p className="text-xs uppercase tracking-widest text-brand-dark/40">Technique</p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <MenuSection menuItems={menuItems} />

        <ReservationSection />

        {/* Location & Contact */}
        <section id="location" className="py-24 px-6 bg-brand-dark text-white">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-4xl md:text-5xl font-serif mb-12">Visit Us</h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-white/60 uppercase tracking-widest text-[10px] mb-2 font-bold">Location</p>
                    <p className="text-lg">Al Malaz District, Riyadh, Saudi Arabia</p>
                    <a 
                      href="https://www.google.com/maps/place/Malbriz+fusion/@24.654602,46.7230866,17z" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-brand-gold text-sm hover:underline mt-2 inline-block"
                    >
                      Get Directions
                    </a>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-white/60 uppercase tracking-widest text-[10px] mb-2 font-bold">Reservations</p>
                    <p className="text-lg">+966 11 234 5678</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-brand-gold" />
                  </div>
                  <div>
                    <p className="text-white/60 uppercase tracking-widest text-[10px] mb-2 font-bold">Hours</p>
                    <p className="text-lg">Daily: 1:00 PM - 12:00 AM</p>
                  </div>
                </div>
              </div>

              <div className="mt-16 flex gap-6">
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-brand-gold transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="h-[400px] md:h-auto rounded-2xl overflow-hidden grayscale hover:grayscale-0 transition-all duration-700">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3625.351658428234!2d46.72089791500147!3d24.65460198415185!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f05b98b95f229%3A0x85546a5b30e75a1e!2sMalbriz%20fusion!5e0!3m2!1sen!2ssa!4v1645440000000!5m2!1sen!2ssa" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 px-6 bg-brand-cream border-t border-brand-dark/5 text-center">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-brand-dark/40 text-xs uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} Malbriz Fusion. All rights reserved.
          </p>
          <button 
            onClick={() => setView('login')}
            className="text-brand-dark/20 hover:text-brand-gold transition-colors text-[10px] uppercase tracking-widest font-bold flex items-center gap-2"
          >
            <LayoutDashboard className="w-3 h-3" /> Staff Portal
          </button>
        </div>
      </footer>

      <ConciergeChat />
    </div>
  );
}
