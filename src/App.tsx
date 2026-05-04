/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Fuse from 'fuse.js';
import { 
  Star, 
  Circle, 
  User, 
  Shield, 
  Search, 
  Minus, 
  ChevronRight, 
  ArrowLeft, 
  Send,
  MoreHorizontal,
  Bookmark,
  Settings,
  X,
  MessageSquare
} from 'lucide-react';

// --- Types ---

type Page = 'home' | 'messages' | 'profile' | 'chat_detail' | 'create_picker' | 'create_post' | 'create_channel' | 'create_card';

interface Post {
  id: string;
  author: string;
  avatar: string;
  content: string;
  image?: string;
  timestamp: string;
  type: 'post';
  likes: number;
  isLiked: boolean;
  isCollected: boolean;
  comments: number;
}

interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  isGroup?: boolean;
  type: 'chat';
}

interface Channel {
  id: string;
  name: string;
  desc: string;
  avatar: string;
  memberCount: string;
  type: 'channel';
}

interface Message {
  id: string;
  sender: 'me' | 'other';
  text: string;
  timestamp: string;
}

// --- Mock Data ---

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: '虚空游者',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
    content: '在纯粹的黑白中，万物呈现出它们最本质的结构。色彩不过是感官的幻觉。',
    timestamp: '2小时前',
    type: 'post',
    likes: 12,
    isLiked: false,
    isCollected: false,
    comments: 3
  },
  {
    id: '2',
    author: '极简主义者',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100',
    content: '今日摄于荒野。极致的构图不需要色彩来修饰。',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    timestamp: '5小时前',
    type: 'post',
    likes: 45,
    isLiked: true,
    isCollected: true,
    comments: 8
  },
  {
    id: 'card-1',
    author: '光影记录员',
    avatar: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&q=80&w=100',
    content: '【群聊邀请】加入“黑白摄影研习社”，共同探索光影轨迹。',
    timestamp: '刚刚',
    type: 'post',
    likes: 5,
    isLiked: false,
    isCollected: false,
    comments: 1
  }
];

const MOCK_CHATS: Chat[] = [
  {
    id: 'c1',
    name: '林深见鹿',
    avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=100',
    lastMessage: '这个周末有空出来扫街吗？',
    timestamp: '14:20',
    type: 'chat'
  },
  {
    id: 'c2',
    name: '黑白摄影研习社',
    avatar: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=100',
    lastMessage: '张三：分享了一张新照片',
    timestamp: '昨天',
    isGroup: true,
    type: 'chat'
  },
  {
    id: 'c3',
    name: '未知联络人',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100',
    lastMessage: '[图片消息]',
    timestamp: '2023/10/24',
    type: 'chat'
  }
];

const INITIAL_HISTORIES: Record<string, Message[]> = {
  'c1': [
    { id: 'm1', sender: 'other', text: '你好。', timestamp: '10:00' },
    { id: 'm2', sender: 'me', text: '你好。', timestamp: '10:01' },
    { id: 'm3', sender: 'other', text: '看到你发的帖子了，摄影技术很棒。', timestamp: '10:02' },
    { id: 'm4', sender: 'me', text: '谢谢，还在学习中。', timestamp: '10:05' },
  ],
  'c2': [
    { id: 'g1', sender: 'other', text: '欢迎加入研习社！', timestamp: '09:00' },
    { id: 'g2', sender: 'other', text: '张三：分享了一张新照片', timestamp: '09:10' }
  ],
  'c3': [
    { id: 'u1', sender: 'other', text: '[图片消息]', timestamp: '昨天' }
  ]
};

const MOCK_CHANNELS: Channel[] = [
  {
    id: 'ch1',
    name: '此时此刻',
    desc: '全球实时黑白影像流',
    avatar: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=100',
    memberCount: '1.2k',
    type: 'channel'
  },
  {
    id: 'ch2',
    name: '极简主义实验室',
    desc: '探索Less is More的终极边界',
    avatar: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=100',
    memberCount: '850',
    type: 'channel'
  }
];

// --- Components ---

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button 
      onClick={() => setIsDark(!isDark)}
      className="p-3 rounded-2xl border-2 border-noir-black dark:border-noir-white flex items-center justify-center transition-all hover:bg-noir-black hover:text-noir-white dark:hover:bg-noir-white dark:hover:text-noir-black shadow-sm hover:shadow-lg active:scale-95"
    >
      <div className={`w-5 h-5 rounded-full ${isDark ? 'bg-noir-white' : 'bg-noir-black'}`} />
    </button>
  );
};

interface PageTransitionProps {
  children: React.ReactNode;
}

const PageTransition: React.FC<PageTransitionProps> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    className="w-full h-full flex flex-col"
  >
    {children}
  </motion.div>
);

export default function App() {
  const [activePage, setActivePage] = useState<Page>('home');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [chatHistories, setChatHistories] = useState<Record<string, Message[]>>(INITIAL_HISTORIES);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Form states
  const [newPostText, setNewPostText] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDesc, setNewChannelDesc] = useState('');
  const [chatInput, setChatInput] = useState('');

  // --- Search Engine Integration ---
  
  const searchableData = useMemo(() => [
    ...posts.map(p => ({ ...p, title: p.author, desc: p.content })),
    ...MOCK_CHATS.map(c => ({ ...c, title: c.name, desc: c.lastMessage })),
    ...MOCK_CHANNELS.map(ch => ({ ...ch, title: ch.name, desc: ch.desc }))
  ], [posts]);

  const fuse = useMemo(() => new Fuse(searchableData, {
    keys: ['title', 'desc', 'content', 'author', 'name'],
    threshold: 0.3,
    ignoreLocation: true,
    distance: 100,
    minMatchCharLength: 1
  }), [searchableData]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return fuse.search(searchQuery).map(r => r.item);
  }, [fuse, searchQuery]);

  // --- Handlers ---

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedChat) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistories(prev => ({
      ...prev,
      [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage]
    }));
    setChatInput('');
  };

  const toggleLike = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          isLiked: !p.isLiked,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  const toggleCollect = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return { ...p, isCollected: !p.isCollected };
      }
      return p;
    }));
  };

  const navigateToChat = (chat: Chat) => {
    setSelectedChat(chat);
    setActivePage('chat_detail');
    setIsSearchOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePublishPost = () => {
    if (!newPostText.trim() && !selectedImage) return;
    const newPost: Post = {
      id: Date.now().toString(),
      author: '虚空游者',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100',
      content: newPostText,
      image: selectedImage || undefined,
      timestamp: '刚刚',
      type: 'post',
      likes: 0,
      isLiked: false,
      isCollected: false,
      comments: 0
    };
    setPosts([newPost, ...posts]);
    setNewPostText('');
    setSelectedImage(null);
    setActivePage('home');
  };

  const handleCreateChannel = () => {
    if (!newChannelName.trim()) return;
    setActivePage('home');
  };

  // --- Layout Components ---

  const NavItem = ({ page, icon: Icon, label }: { page: Page, icon: any, label: string }) => {
    const isActive = activePage === page || (page === 'messages' && activePage === 'chat_detail');
    return (
      <button 
        onClick={() => setActivePage(page)}
        className={`flex lg:flex-row flex-col items-center gap-3 p-4 lg:px-8 lg:py-4 transition-all w-full rounded-2xl
          ${isActive 
            ? 'bg-noir-black text-noir-white dark:bg-noir-white dark:text-noir-black font-black shadow-lg translate-x-1' 
            : 'hover:bg-noir-black/5 dark:hover:bg-noir-white/5 opacity-40 hover:opacity-100 font-bold'}`}
      >
        <Icon size={24} fill={(isActive && (page === 'home' || page === 'profile')) ? 'currentColor' : 'none'} />
        <span className="text-[10px] lg:text-sm uppercase tracking-[0.2em]">{label}</span>
      </button>
    );
  };

  return (
    <div className="flex justify-center bg-noir-white dark:bg-noir-black min-h-screen text-noir-black dark:text-noir-white overflow-hidden selection:bg-noir-black selection:text-noir-white dark:selection:bg-noir-white dark:selection:text-noir-black">
      
      {/* Container with max width for desktop */}
      <div className="w-full max-w-[1400px] h-[100vh] flex relative">
        
        {/* --- LEFT SIDEBAR (Desktop Only Navigation) --- */}
        <nav className="hidden lg:flex w-80 border-r border-noir-black/5 dark:border-noir-white/5 flex-col py-12 z-40 px-6">
           <div className="px-4 mb-20 text-center lg:text-left">
             <h1 className="text-5xl font-black italic tracking-tighter cursor-pointer hover:scale-105 transition-transform" onClick={() => setActivePage('home')}>NOIR.</h1>
           </div>
           
           <div className="flex-1 space-y-3">
             <NavItem page="home" icon={Star} label="万象首页" />
             <NavItem page="messages" icon={Circle} label="消息中心" />
             <NavItem page="profile" icon={User} label="个人档案" />
           </div>

           <div className="mt-auto">
             <button 
               onClick={() => setActivePage('create_picker')}
               className="w-full py-5 bg-noir-black text-noir-white dark:bg-noir-white dark:text-noir-black rounded-3xl hover:shadow-xl hover:-translate-y-1 transition-all font-black uppercase tracking-widest text-sm"
             >
               新发布 +
             </button>
           </div>
        </nav>

        {/* --- MAIN COLUMN --- */}
        <main className="flex-1 lg:border-r border-noir-black/10 dark:border-noir-white/10 flex flex-col relative overflow-hidden bg-noir-white dark:bg-noir-black">
          
          {/* Global Search Overlay (Full screen on mobile, absolute inside main on desktop) */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 bg-noir-white dark:bg-noir-black flex flex-col pt-2 lg:pt-0"
              >
                <header className="sticky top-0 z-50 bg-noir-white/90 dark:bg-noir-black/90 backdrop-blur-xl border-b border-noir-black/10 dark:border-noir-white/10 px-6 h-16 lg:h-24 flex items-center gap-6 shadow-sm">
                  <Search size={24} className="opacity-30" />
                  <input 
                    autoFocus
                    placeholder="在这里搜索一切..."
                    className="flex-1 bg-transparent border-none text-xl lg:text-2xl font-black focus:outline-none placeholder:opacity-10 uppercase tracking-tighter"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setIsSearchOpen(false)}
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="p-3 bg-noir-black/5 dark:bg-noir-white/5 rounded-full hover:rotate-90 transition-all"><X size={28} /></button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-4">
                  {searchResults.length > 0 ? (
                    searchResults.map((item: any, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => {
                          if (item.type === 'chat') navigateToChat(item);
                          else { setActivePage('home'); setIsSearchOpen(false); }
                        }}
                        className="p-6 rounded-3xl bg-noir-black/5 dark:bg-noir-white/5 flex items-center gap-6 hover:bg-noir-black hover:text-noir-white dark:hover:bg-noir-white dark:hover:text-noir-black cursor-pointer group transition-all hover:shadow-xl hover:-translate-y-1"
                      >
                         <div className="text-[10px] font-black uppercase border-2 border-current px-3 py-1 rounded-full tracking-tighter shrink-0">{item.type}</div>
                         <div className="flex-1 min-w-0">
                           <div className="font-black text-xl uppercase truncate tracking-tight">{item.title || item.name}</div>
                           <div className="text-xs opacity-50 truncate italic mt-1">{item.desc || item.content}</div>
                         </div>
                         <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0 transition-all" />
                      </div>
                    ))
                  ) : searchQuery.trim() ? (
                    <div className="p-20 text-center opacity-20 font-black uppercase tracking-[0.5em]">虚无...</div>
                  ) : (
                    <div className="p-12 space-y-8">
                       <h3 className="text-[10px] font-black uppercase tracking-widest opacity-30">推荐探索</h3>
                       <div className="flex flex-wrap gap-3">
                         {['# minimalist', '# pure_white', '# shadow', '# symmetry'].map(t => (
                           <button key={t} onClick={() => setSearchQuery(t)} className="px-4 py-2 border-2 border-noir-black dark:border-noir-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-noir-black hover:text-noir-white dark:hover:bg-noir-white dark:hover:text-noir-black transition-all">
                             {t}
                           </button>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto pb-24 lg:pb-0 scroll-smooth">
            <AnimatePresence mode="wait">
              
              {activePage === 'home' && (
                <PageTransition key="home">
                  <header className="sticky top-0 z-30 bg-noir-white/80 dark:bg-noir-black/80 backdrop-blur-xl border-b border-noir-black/5 dark:border-noir-white/5 px-6 h-16 lg:h-24 flex items-center justify-between shadow-sm">
                    <button onClick={() => setActivePage('create_picker')} className="lg:hidden p-3 bg-noir-black/5 rounded-2xl"><Shield size={24} /></button>
                    <h1 className="text-3xl font-black uppercase tracking-tight italic">万象</h1>
                    <button onClick={() => setIsSearchOpen(true)} className="p-3 bg-noir-black/5 dark:bg-noir-white/5 rounded-2xl hover:shadow-md"><Search size={24} /></button>
                  </header>
                  
                  <div className="max-w-4xl mx-auto py-12 px-4 lg:px-8 space-y-8">
                    {posts.map(post => (
                      <div key={post.id} className="p-8 lg:p-12 bg-noir-white dark:bg-noir-black border border-noir-black/5 dark:border-noir-white/5 rounded-[3rem] shadow-soft hover:shadow-2xl transition-all group">
                        <div className="flex gap-6 lg:gap-10">
                          <div className="shrink-0">
                            <img src={post.avatar} className="w-14 h-14 lg:w-20 lg:h-20 rounded-3xl border-2 border-noir-black/10 dark:border-noir-white/10 object-cover shadow-sm" referrerPolicy="no-referrer" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-4">
                              <span className="font-black text-base lg:text-xl uppercase tracking-tighter flex items-center gap-2">
                                {post.author}
                                <Circle size={6} fill="currentColor" className="opacity-20" />
                                <span className="text-[10px] opacity-20 tracking-widest">{post.timestamp}</span>
                              </span>
                            </div>
                            <p className="text-lg lg:text-xl leading-relaxed mb-8 font-medium">{post.content}</p>
                            {post.image && (
                              <div className="relative mb-8 overflow-hidden rounded-[2rem] border border-noir-black/5 shadow-inner">
                                <img src={post.image} className="w-full grayscale hover:grayscale-0 transition-all duration-700 cursor-zoom-in scale-100 hover:scale-105" referrerPolicy="no-referrer" />
                              </div>
                            )}
                            <div className="flex gap-12 lg:gap-16">
                               <button 
                                 onClick={() => toggleLike(post.id)}
                                 className={`flex items-center gap-3 text-sm font-black transition-all ${post.isLiked ? 'text-noir-black dark:text-noir-white scale-110' : 'opacity-20 hover:opacity-100 hover:scale-110'}`}
                               >
                                 <Star size={24} fill={post.isLiked ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                 <span className="tabular-nums">{post.likes}</span>
                               </button>
                               <button className="flex items-center gap-3 text-sm font-black opacity-20 hover:opacity-100 transition-all hover:scale-110">
                                 <MessageSquare size={24} strokeWidth={2.5} />
                                 <span className="tabular-nums">{post.comments}</span>
                               </button>
                               <button 
                                 onClick={() => toggleCollect(post.id)}
                                 className={`flex items-center gap-3 text-sm font-black transition-all ${post.isCollected ? 'text-noir-black dark:text-noir-white scale-110' : 'opacity-20 hover:opacity-100 hover:scale-110'}`}
                                >
                                  <Bookmark size={24} fill={post.isCollected ? 'currentColor' : 'none'} strokeWidth={2.5} />
                                </button>
                             </div>
                           </div>
                         </div>
                       </div>
                     ))}
                     
                     <div className="py-24 text-center opacity-5 font-black uppercase tracking-[1.5em] select-none">LIMINAL SPACE</div>
                   </div>
                </PageTransition>
              )}

              {activePage === 'messages' && (
                <PageTransition key="messages">
                  <header className="sticky top-0 z-30 bg-noir-white/80 dark:bg-noir-black/80 backdrop-blur-xl border-b border-noir-black/5 dark:border-noir-white/5 px-6 h-16 lg:h-24 flex items-center justify-between shadow-sm">
                    <h1 className="text-3xl font-black uppercase tracking-tight italic">消息中心</h1>
                    <button onClick={() => setIsSearchOpen(true)} className="p-3 bg-noir-black/5 dark:bg-noir-white/5 rounded-2xl hover:shadow-md"><Search size={26} /></button>
                  </header>
                  <div className="p-4 lg:p-8 space-y-4">
                    {MOCK_CHATS.map(chat => (
                      <div key={chat.id} onClick={() => navigateToChat(chat)} className="p-8 rounded-[2.5rem] flex items-center gap-6 bg-noir-white dark:bg-noir-black border border-noir-black/5 dark:border-noir-white/5 hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all group">
                        <div className="relative">
                          <img src={chat.avatar} className="w-20 h-20 rounded-3xl border-2 border-noir-black/10 dark:border-noir-white/10 grayscale group-hover:grayscale-0 transition-all shadow-sm" />
                          {chat.isGroup && <div className="absolute -bottom-2 -right-2 bg-noir-black text-noir-white dark:bg-noir-white dark:text-noir-black text-[10px] font-black px-3 py-1 rounded-full border-2 border-current uppercase shadow-lg">GP</div>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-2">
                            <h2 className="font-black text-2xl uppercase tracking-tighter">{chat.name}</h2>
                            <span className="text-[10px] font-black uppercase opacity-20 tracking-widest">{chat.timestamp}</span>
                          </div>
                          <p className="text-base opacity-40 truncate italic font-medium tracking-tight">“{chat.lastMessage}”</p>
                        </div>
                        <ChevronRight className="opacity-0 group-hover:opacity-100 transition-all -translate-x-6 group-hover:translate-x-0" size={28} />
                      </div>
                    ))}
                  </div>
                </PageTransition>
              )}

              {activePage === 'chat_detail' && (
                <PageTransition key="chat_detail">
                  <header className="sticky top-0 z-40 bg-noir-white/90 dark:bg-noir-black/90 backdrop-blur-xl border-b border-noir-black/10 dark:border-noir-white/10 px-8 h-16 lg:h-24 flex items-center gap-6 shadow-sm">
                    <button onClick={() => setActivePage('messages')} className="lg:hidden p-3 bg-noir-black/5 rounded-2xl"><ArrowLeft size={24} /></button>
                    <div className="w-12 h-12 rounded-2xl border-2 border-noir-black dark:border-noir-white overflow-hidden shrink-0 shadow-sm">
                      <img src={selectedChat?.avatar} className="w-full h-full object-cover grayscale" />
                    </div>
                    <h1 className="flex-1 font-black uppercase text-xl lg:text-2xl truncate tracking-tighter">{selectedChat?.name}</h1>
                    <button className="p-3 bg-noir-black/5 dark:bg-noir-white/5 rounded-2xl hover:shadow-md transition-all"><MoreHorizontal size={24} /></button>
                  </header>

                  <div className="flex-1 p-8 lg:p-12 space-y-10 overflow-y-auto">
                    {selectedChat && chatHistories[selectedChat.id]?.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] lg:max-w-[55%] p-6 lg:p-8 text-base lg:text-lg font-bold flex flex-col gap-3 rounded-[2.5rem]
                          ${msg.sender === 'me' 
                            ? 'bg-noir-black text-noir-white dark:bg-noir-white dark:text-noir-black shadow-2xl rounded-tr-none' 
                            : 'bg-noir-black/5 dark:bg-noir-white/5 border border-noir-black/10 rounded-tl-none'}`}>
                          {msg.text}
                          <div className={`text-[10px] font-black uppercase tracking-[0.2em] opacity-30 mt-2 ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>{msg.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-8 lg:p-12 border-t border-noir-black/10 dark:border-noir-white/10 bg-noir-white/95 dark:bg-noir-black/95 sticky bottom-0 z-40 backdrop-blur-md">
                    <div className="flex gap-6 items-center max-w-5xl mx-auto bg-noir-black/5 dark:bg-noir-white/5 p-4 rounded-[3rem] shadow-inner border border-noir-black/5">
                       <input 
                         autoFocus
                         type="text" 
                         value={chatInput}
                         onChange={(e) => setChatInput(e.target.value)}
                         onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                         placeholder="向深核发送讯息..."
                         className="flex-1 bg-transparent p-4 text-xl font-black focus:outline-none placeholder:opacity-10 uppercase tracking-tighter"
                       />
                       <button onClick={handleSendMessage} className="p-5 bg-noir-black text-noir-white dark:bg-noir-white dark:text-noir-black rounded-full shadow-xl hover:scale-110 active:scale-90 transition-all">
                         <Send size={28} strokeWidth={3} />
                       </button>
                    </div>
                  </div>
                </PageTransition>
              )}

              {activePage === 'profile' && (
                <PageTransition key="profile">
                   <div className="max-w-xl mx-auto py-24 px-8 flex flex-col items-center">
                      <div className="relative mb-12 group">
                        <div className="w-48 h-48 rounded-[3.5rem] border-[12px] border-noir-black dark:border-noir-white overflow-hidden bg-noir-black/5 shadow-2xl">
                          <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover transition-all grayscale group-hover:grayscale-0 duration-1000 scale-100 group-hover:scale-110" />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-noir-black text-noir-white dark:bg-noir-white dark:text-noir-black px-5 py-2 font-black text-sm uppercase tracking-widest border-4 border-current rounded-3xl shadow-2xl">VETERAN LOG</div>
                      </div>
                      
                      <h1 className="text-6xl font-black uppercase mb-4 tracking-tighter selection:bg-noir-black selection:text-noir-white italic">虚空游者</h1>
                      <p className="text-[10px] font-black opacity-20 uppercase tracking-[1em] mb-16">NOIR SOCIAL ID #0001</p>
                      
                      <div className="w-full flex flex-col gap-4 mb-20">
                        {[
                          { label: '我的发布集', count: 12 },
                          { label: '深空收藏夹', count: 56 },
                          { label: '黑白影集库', count: 3 }
                        ].map((item, idx) => (
                          <button key={idx} className="w-full p-10 flex items-center justify-between bg-noir-white dark:bg-noir-black rounded-[2.5rem] border border-noir-black/5 dark:border-noir-white/5 hover:border-noir-black dark:hover:border-noir-white hover:shadow-2xl hover:scale-[1.02] transition-all group">
                            <span className="font-black text-xl lg:text-2xl uppercase tracking-tighter">{item.label}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-xs font-black opacity-20 px-5 py-2 bg-noir-black/5 dark:bg-noir-white/5 rounded-full group-hover:opacity-100 group-hover:bg-noir-black group-hover:text-noir-white dark:group-hover:bg-noir-white dark:group-hover:text-noir-black transition-all tabular-nums tracking-widest">{item.count}</span>
                              <ChevronRight size={20} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                            </div>
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-col items-center gap-10 p-12 bg-noir-black/5 dark:bg-noir-white/5 rounded-[4rem] w-full border border-noir-black/5">
                        <span className="text-[10px] font-black opacity-20 uppercase tracking-[1em]">视觉场域调节</span>
                        <DarkModeToggle />
                      </div>
                   </div>
                </PageTransition>
              )}

              {activePage === 'create_post' && (
                <PageTransition key="create_post">
                   <header className="sticky top-0 z-40 bg-noir-white/80 dark:bg-noir-black/80 backdrop-blur-xl h-16 lg:h-24 border-b border-noir-black/10 dark:border-noir-white/10 px-8 flex items-center justify-between shadow-sm">
                      <button onClick={() => setActivePage('create_picker')} className="p-3 bg-noir-black/5 dark:bg-noir-white/5 rounded-2xl hover:shadow-md transition-all"><ArrowLeft size={24} /></button>
                      <h1 className="text-2xl font-black uppercase tracking-tight italic">记录瞬间</h1>
                      <button 
                        onClick={handlePublishPost}
                        disabled={!newPostText.trim() && !selectedImage}
                        className="px-8 py-3 bg-noir-black text-noir-white dark:bg-noir-white dark:text-noir-black font-black uppercase text-sm tracking-widest rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20 disabled:scale-100 disabled:shadow-none"
                      >
                        即刻发布
                      </button>
                   </header>
                   <div className="p-8 lg:p-12 max-w-4xl mx-auto w-full flex-1 flex flex-col gap-10">
                      <textarea 
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="在黑与白的边缘留下你的印记..."
                        className="w-full flex-1 min-h-[300px] bg-transparent text-3xl lg:text-4xl font-black focus:outline-none placeholder:opacity-5 selection:bg-noir-black selection:text-noir-white border-none resize-none leading-tight"
                        autoFocus
                      />
                      
                      {selectedImage && (
                        <div className="relative group rounded-[3rem] overflow-hidden border-4 border-noir-black dark:border-noir-white shadow-2xl">
                          <img src={selectedImage} className="w-full max-h-[500px] object-cover grayscale" />
                          <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 p-3 bg-noir-black text-noir-white dark:bg-noir-white dark:text-noir-black rounded-2xl shadow-lg border-2 border-current hover:rotate-90 transition-all"><X size={24} /></button>
                        </div>
                      )}

                      <div className="pt-10 border-t border-noir-black/10 dark:border-noir-white/10 flex items-center justify-between">
                         <div className="flex gap-6">
                           <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                           <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-noir-black/5 dark:bg-noir-white/5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-noir-black hover:text-noir-white dark:hover:bg-noir-white dark:hover:text-noir-black transition-all shadow-sm">
                             {selectedImage ? '更换光影图像' : '上传纯净影像'}
                           </button>
                         </div>
                         <div className="text-[10px] font-black opacity-20 uppercase tracking-[0.3em] font-mono">{newPostText.length} CH_TRACKED</div>
                      </div>
                   </div>
                </PageTransition>
              )}

              {activePage === 'create_picker' && (
                <PageTransition key="create_picker">
                   <div className="p-10 lg:p-24 max-w-5xl mx-auto h-full flex flex-col justify-center">
                      <button onClick={() => setActivePage('home')} className="mb-16 self-start flex items-center gap-4 bg-noir-black/5 dark:bg-noir-white/5 py-3 px-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.4em] opacity-40 hover:opacity-100 transition-all hover:shadow-md">
                         <ArrowLeft size={18} /> 返回主序
                      </button>
                      <h2 className="text-6xl lg:text-8xl font-black uppercase tracking-tighter italic mb-20 leading-[0.9] select-none">
                        你想在 <br /> <span className="px-4 py-2 bg-noir-black text-noir-white dark:bg-noir-white dark:text-noir-black rounded-3xl shadow-xl">绝对场域</span> 中 <br /> 写入什么？
                      </h2>
                      <div className="grid md:grid-cols-2 gap-10">
                        {[
                          { id: 'create_post', title: '发布图文动态', desc: '以光影作为唯一的语言', icon: <Star /> },
                          { id: 'create_channel', title: '建立永久频道', desc: '构建属于你的意识形态广场', icon: <Circle /> }
                        ].map(item => (
                          <button key={item.id} onClick={() => setActivePage(item.id as Page)} className="p-12 rounded-[3rem] border border-noir-black/10 dark:border-noir-white/10 text-left bg-noir-white dark:bg-noir-black hover:bg-noir-black hover:text-noir-white dark:hover:bg-noir-white dark:hover:text-noir-black transition-all group hover:shadow-2xl hover:-translate-y-2">
                             <div className="mb-10 opacity-30 group-hover:opacity-100 transition-all scale-100 group-hover:scale-110">
                               {React.cloneElement(item.icon as React.ReactElement, { size: 56, strokeWidth: 2.5 })}
                             </div>
                             <div className="text-3xl font-black uppercase tracking-tighter mb-3">{item.title}</div>
                             <div className="text-xs font-black opacity-30 uppercase tracking-[0.2em] leading-relaxed group-hover:opacity-60">{item.desc}</div>
                          </button>
                        ))}
                      </div>
                   </div>
                </PageTransition>
              )}

            </AnimatePresence>
          </div>

          <nav className="lg:hidden absolute bottom-0 w-full h-16 bg-noir-white dark:bg-noir-black border-t-4 border-noir-black dark:border-noir-white grid grid-cols-3 z-30">
            <NavItem page="home" icon={Star} label="万象" />
            <NavItem page="messages" icon={Circle} label="消息" />
            <NavItem page="profile" icon={User} label="个人" />
          </nav>
        </main>

        <aside className="hidden xl:flex w-[400px] flex-col p-12 space-y-12 z-40">
           <div className="p-10 rounded-[3rem] bg-noir-black/5 dark:bg-noir-white/5 border border-noir-black/5 flex flex-col gap-8 shadow-inner">
              <div className="flex justify-between items-center">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.6em] opacity-30">深海意识流</h3>
                 <div className="flex gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-noir-black dark:bg-noir-white animate-pulse" />
                 </div>
              </div>
              <div className="flex flex-col gap-6">
                 <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase opacity-20 tracking-widest text-center lg:text-left">极简世界共鸣</span>
                    <span className="text-3xl font-black uppercase italic tracking-tighter truncate leading-none">THE PURE ESSENCE.</span>
                 </div>
                 <div className="h-2 w-full bg-noir-black/10 rounded-full overflow-hidden">
                    <div className="h-full bg-noir-black dark:bg-noir-white w-2/3 shadow-lg" />
                 </div>
              </div>
           </div>

           <div className="space-y-12">
              <h3 className="text-[10px] font-black uppercase tracking-[1em] opacity-20 text-center lg:text-left">意识流推荐</h3>
              <div className="space-y-8">
                {MOCK_CHANNELS.map(ch => (
                  <div key={ch.id} className="group cursor-pointer p-6 rounded-[2rem] hover:bg-noir-black hover:text-noir-white dark:hover:bg-noir-white dark:hover:text-noir-black transition-all hover:shadow-xl hover:-translate-x-2">
                    <div className="flex items-center gap-6 mb-4">
                       <img src={ch.avatar} className="w-14 h-14 rounded-2xl border-2 border-noir-black/10 dark:border-noir-white/10 grayscale group-hover:grayscale-0 transition-all shadow-sm" />
                       <div className="flex-1">
                          <h4 className="text-lg font-black uppercase tracking-tighter group-hover:underline">{ch.name}</h4>
                          <p className="text-[10px] opacity-40 font-black uppercase tracking-widest mt-1">{ch.memberCount} M_BITS</p>
                       </div>
                    </div>
                    <p className="text-xs font-medium leading-relaxed italic opacity-40 group-hover:opacity-100 transition-opacity px-2 border-l-2 border-current">“{ch.desc}”</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="mt-auto space-y-4">
              <div className="p-6 border-2 border-noir-black/10 dark:border-noir-white/10 hover:border-noir-black dark:hover:border-noir-white transition-all">
                <h5 className="text-[9px] font-black uppercase tracking-widest mb-2 italic">黑白格言.</h5>
                <p className="text-xs font-bold leading-relaxed opacity-60">
                  “去掉色彩，便是去掉谎言。只留下纯粹的结构与真相。”
                </p>
              </div>
              <div className="flex justify-between text-[8px] font-black uppercase opacity-20 tracking-widest px-1">
                 <span>© NOIR. v2.0</span>
                 <span>PRIVACY. ESSENCE.</span>
              </div>
           </div>
        </aside>

      </div>
    </div>
  );
}
