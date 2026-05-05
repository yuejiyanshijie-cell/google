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
  MessageSquare,
  Plus,
  Bell,
  Heart,
  Share2
} from 'lucide-react';

// --- Types ---

type Page = 'home' | 'messages' | 'profile' | 'chat_detail' | 'create_picker' | 'create_post' | 'create_channel';

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
    content: '在纯粹的白空间中，万物呈现出它们最本质的结构。少即是多，空即是满。',
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
    content: '今日摄于荒野。极致的构图不需要多余的色彩修饰，只有光线在舞动。',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    timestamp: '5小时前',
    type: 'post',
    likes: 45,
    isLiked: true,
    isCollected: true,
    comments: 8
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
    name: '极简构图社',
    avatar: 'https://images.unsplash.com/photo-1527631746610-bca00a040d60?auto=format&fit=crop&q=80&w=100',
    lastMessage: '张利：这张白墙的光影太绝了',
    timestamp: '昨天',
    isGroup: true,
    type: 'chat'
  }
];

const MOCK_CHANNELS: Channel[] = [
  {
    id: 'ch1',
    name: '此时此刻',
    desc: '全球实时极简影像流',
    avatar: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&q=80&w=100',
    memberCount: '1.2k',
    type: 'channel'
  }
];

const INITIAL_HISTORIES: Record<string, Message[]> = {
  'c1': [
    { id: 'm1', sender: 'other', text: '你好。', timestamp: '10:00' },
    { id: 'm2', sender: 'me', text: '你好，很高兴认识你。', timestamp: '10:01' },
  ]
};

// --- Components ---

const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.02 }}
    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    className="w-full h-full flex flex-col"
  >
    {children}
  </motion.div>
);

const IconButton: React.FC<{ icon: any; onClick?: () => void; className?: string }> = ({ icon: Icon, onClick, className }) => (
  <button 
    onClick={onClick}
    className={`p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 active:scale-90 transition-all text-gray-900 group ${className}`}
  >
    <Icon size={22} className="group-hover:scale-110 transition-transform" />
  </button>
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
  const [newPostText, setNewPostText] = useState('');
  const [chatInput, setChatInput] = useState('');

  // --- Search Engine ---
  const searchableData = useMemo(() => [
    ...posts.map(p => ({ ...p, title: p.author, desc: p.content, type: 'post' })),
    ...MOCK_CHATS.map(c => ({ ...c, title: c.name, desc: c.lastMessage, type: 'chat' })),
    ...MOCK_CHANNELS.map(ch => ({ ...ch, title: ch.name, desc: ch.desc, type: 'channel' }))
  ], [posts]);

  const fuse = useMemo(() => new Fuse(searchableData, {
    keys: ['title', 'desc'],
    threshold: 0.3
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
    setChatHistories(prev => ({ ...prev, [selectedChat.id]: [...(prev[selectedChat.id] || []), newMessage] }));
    setChatInput('');
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

  const NavItem = ({ page, icon: Icon, label }: { page: Page, icon: any, label: string }) => {
    const isActive = activePage === page || (page === 'messages' && activePage === 'chat_detail');
    return (
      <button 
        onClick={() => setActivePage(page)}
        className={`flex lg:flex-row flex-col items-center gap-4 p-4 lg:px-6 lg:py-4 transition-all w-full rounded-[1.5rem] relative group
          ${isActive 
            ? 'bg-gray-900 text-white shadow-xl shadow-gray-200' 
            : 'hover:bg-gray-50 text-gray-400 hover:text-gray-900'}`}
      >
        <Icon size={22} className={`${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`} />
        {isActive && (
          <motion.div layoutId="nav-pill" className="absolute left-0 w-1 h-6 bg-white rounded-full hidden lg:block" />
        )}
        <span className={`text-[10px] lg:text-sm font-bold uppercase tracking-widest ${isActive ? 'opacity-100' : 'opacity-60'}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex justify-center bg-white min-h-screen text-gray-900 overflow-hidden font-sans">
      
      <div className="w-full max-w-[1440px] h-[100vh] flex relative">
        
        {/* --- Sidebar --- */}
        <aside className="hidden lg:flex w-72 border-r border-gray-100 flex-col py-10 px-6 z-40">
           <div className="px-2 mb-16">
             <h1 className="text-3xl font-black italic tracking-tighter cursor-pointer hover:rotate-3 transition-transform inline-block" onClick={() => setActivePage('home')}>PURE.</h1>
           </div>
           
           <nav className="flex-1 space-y-2">
             <NavItem page="home" icon={Star} label="发现万象" />
             <NavItem page="messages" icon={MessageSquare} label="即时通讯" />
             <NavItem page="profile" icon={User} label="个人档案" />
           </nav>

           <div className="mt-auto">
             <button 
               onClick={() => setActivePage('create_picker')}
               className="w-full py-4 bg-gray-900 text-white rounded-[1.8rem] hover:shadow-2xl hover:-translate-y-1 active:scale-95 transition-all font-bold uppercase tracking-widest text-xs flex items-center justify-center gap-2"
             >
               <Plus size={18} /> 发布动态
             </button>
           </div>
        </aside>

        {/* --- Main Contents --- */}
        <main className="flex-1 flex flex-col relative overflow-hidden bg-white">
          
          {/* Search Overlay */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 z-50 bg-white/95 backdrop-blur-3xl flex flex-col"
              >
                <header className="px-8 h-24 flex items-center gap-6 border-b border-gray-100">
                  <Search size={22} className="text-gray-300" />
                  <input 
                    autoFocus
                    placeholder="寻找灵感、好友或频道..."
                    className="flex-1 bg-transparent border-none text-2xl font-bold focus:outline-none placeholder:text-gray-200"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <IconButton icon={X} onClick={() => setIsSearchOpen(false)} />
                </header>

                <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full space-y-4">
                  {searchResults.map((item: any, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => {
                        if (item.type === 'chat') { setSelectedChat(item); setActivePage('chat_detail'); }
                        else setActivePage('home');
                        setIsSearchOpen(false);
                      }}
                      className="p-6 rounded-[2rem] hover:bg-gray-50 flex items-center gap-6 cursor-pointer group shadow-elegant"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center font-bold text-[10px] uppercase">{item.type}</div>
                      <div className="flex-1">
                        <div className="font-bold text-lg">{item.title}</div>
                        <div className="text-sm text-gray-400 truncate">{item.desc}</div>
                      </div>
                      <ChevronRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 overflow-y-auto pb-24 lg:pb-0 scroll-smooth">
            <AnimatePresence mode="wait">
              
              {/* HOME PAGE */}
              {activePage === 'home' && (
                <PageTransition key="home">
                  <header className="sticky top-0 z-30 glass-morphism h-20 lg:h-24 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <IconButton icon={Plus} className="lg:hidden" onClick={() => setActivePage('create_picker')} />
                      <h1 className="text-2xl font-black tracking-tight text-gray-900">此刻万象</h1>
                    </div>
                    <div className="flex items-center gap-3">
                      <IconButton icon={Search} onClick={() => setIsSearchOpen(true)} />
                      <IconButton icon={Bell} className="relative">
                        <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                      </IconButton>
                    </div>
                  </header>
                  
                  <div className="max-w-3xl mx-auto py-10 px-6 space-y-10">
                    {posts.map(post => (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        key={post.id} 
                        className="bg-white p-8 lg:p-10 rounded-[3rem] border border-gray-50 shadow-elegant hover:shadow-deep transition-all"
                      >
                         <div className="flex gap-6">
                            <img src={post.avatar} className="w-14 h-14 rounded-2xl object-cover hover:scale-110 transition-transform cursor-pointer" />
                            <div className="flex-1">
                               <div className="flex justify-between items-center mb-4">
                                  <div className="flex flex-col">
                                     <span className="font-bold text-lg hover:underline cursor-pointer">{post.author}</span>
                                     <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">{post.timestamp}</span>
                                  </div>
                                  <IconButton icon={MoreHorizontal} className="!p-2 bg-transparent hover:bg-gray-50" />
                               </div>
                               <p className="text-lg leading-relaxed text-gray-800 mb-6 font-medium whitespace-pre-wrap">{post.content}</p>
                               {post.image && (
                                 <div className="rounded-[2.5rem] overflow-hidden mb-6 border border-gray-100 group">
                                    <img src={post.image} className="w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                 </div>
                               )}
                               <div className="flex gap-8 items-center border-t border-gray-50 pt-6">
                                  <button onClick={() => setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes-1 : p.likes+1 } : p))} 
                                    className={`flex items-center gap-2 text-sm font-bold transition-all ${post.isLiked ? 'text-pink-500 scale-110' : 'text-gray-300 hover:text-gray-900'}`}>
                                    <Heart size={20} fill={post.isLiked ? 'currentColor' : 'none'} />
                                    <span>{post.likes}</span>
                                  </button>
                                  <button className="flex items-center gap-2 text-sm font-bold text-gray-300 hover:text-gray-900 transition-all">
                                    <MessageSquare size={20} />
                                    <span>{post.comments}</span>
                                  </button>
                                  <button className="ml-auto text-gray-300 hover:text-gray-900 transition-all">
                                    <Share2 size={20} />
                                  </button>
                               </div>
                            </div>
                         </div>
                      </motion.div>
                    ))}
                    <div className="py-20 text-center text-[10px] font-bold text-gray-100 tracking-[1em] uppercase">已到达意识深处</div>
                  </div>
                </PageTransition>
              )}

              {/* MESSAGES */}
              {activePage === 'messages' && (
                <PageTransition key="messages">
                   <header className="h-24 px-8 flex items-center justify-between border-b border-gray-50">
                      <h1 className="text-3xl font-black tracking-tighter">极简交流</h1>
                      <IconButton icon={Settings} />
                   </header>
                   <div className="p-6 lg:p-10 space-y-4">
                     {MOCK_CHATS.map(chat => (
                       <div key={chat.id} onClick={() => { setSelectedChat(chat); setActivePage('chat_detail'); }} className="p-8 rounded-[2.5rem] bg-white border border-gray-50 hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-6 shadow-elegant hover:-translate-y-1">
                          <div className="relative">
                            <img src={chat.avatar} className="w-16 h-16 rounded-[1.5rem] object-cover" />
                            {chat.isGroup && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white">G</div>}
                          </div>
                          <div className="flex-1 min-w-0">
                             <div className="flex justify-between items-baseline mb-1">
                                <h3 className="font-bold text-xl">{chat.name}</h3>
                                <span className="text-[10px] text-gray-300 font-bold">{chat.timestamp}</span>
                             </div>
                             <p className="text-sm text-gray-400 truncate font-medium">“{chat.lastMessage}”</p>
                          </div>
                          <ChevronRight size={20} className="text-gray-200" />
                       </div>
                     ))}
                   </div>
                </PageTransition>
              )}

              {/* CHAT DETAIL */}
              {activePage === 'chat_detail' && selectedChat && (
                <PageTransition key="chat_detail">
                   <header className="h-24 px-8 flex items-center gap-6 border-b border-gray-50 glass-morphism sticky top-0 z-40">
                      <IconButton icon={ArrowLeft} onClick={() => setActivePage('messages')} />
                      <div className="w-12 h-12 rounded-2xl overflow-hidden bg-gray-100">
                         <img src={selectedChat.avatar} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                         <h2 className="font-bold text-xl">{selectedChat.name}</h2>
                         <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                            <span className="text-[10px] text-gray-400 font-bold uppercase">在线</span>
                         </div>
                      </div>
                      <IconButton icon={MoreHorizontal} />
                   </header>
                   <div className="flex-1 p-8 space-y-8 overflow-y-auto min-h-0">
                      {chatHistories[selectedChat.id]?.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                           <div className={`max-w-[75%] p-6 rounded-[2rem] text-sm lg:text-base font-medium shadow-elegant ${msg.sender === 'me' ? 'bg-gray-900 text-white rounded-tr-none' : 'bg-gray-50 text-gray-900 rounded-tl-none'}`}>
                              {msg.text}
                              <div className={`text-[9px] mt-2 opacity-40 font-bold uppercase tracking-widest ${msg.sender === 'me' ? 'text-right' : 'text-left'}`}>{msg.timestamp}</div>
                           </div>
                        </div>
                      ))}
                   </div>
                   <div className="p-8 border-t border-gray-50 bg-white/80 backdrop-blur-md">
                      <div className="max-w-4xl mx-auto flex items-center gap-4 bg-gray-50 p-3 rounded-[2rem] border border-gray-100 shadow-inner">
                         <input 
                           autoFocus
                           className="flex-1 bg-transparent p-3 text-lg font-bold focus:outline-none placeholder:text-gray-300"
                           placeholder="在此编织你的文字..."
                           value={chatInput}
                           onChange={(e) => setChatInput(e.target.value)}
                           onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                         />
                         <button onClick={handleSendMessage} className="p-4 bg-gray-900 text-white rounded-full hover:scale-110 active:scale-90 transition-all shadow-lg">
                           <Send size={20} fill="currentColor" />
                         </button>
                      </div>
                   </div>
                </PageTransition>
              )}

              {/* PROFILE */}
              {activePage === 'profile' && (
                <PageTransition key="profile">
                   <div className="max-w-2xl mx-auto py-20 px-8 flex flex-col items-center">
                      <div className="w-48 h-48 rounded-[3.5rem] border-[12px] border-white shadow-deep overflow-hidden mb-10 group relative">
                         <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                         <div className="absolute inset-0 bg-gray-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-bold text-xs uppercase tracking-widest px-4 py-2 bg-gray-900/40 backdrop-blur-sm rounded-full">编辑头像</span>
                         </div>
                      </div>
                      <h1 className="text-5xl font-black italic mb-3">虚空游者</h1>
                      <p className="text-sm font-bold text-gray-300 uppercase tracking-[0.4em] mb-12">ID #0001 • 极简开拓者</p>
                      
                      <div className="w-full grid grid-cols-3 gap-4 mb-16">
                         {[
                           { label: '发布的万象', count: 12 },
                           { label: '感悟的留存', count: 56 },
                           { label: '连接的心灵', count: 231 }
                         ].map((s, i) => (
                           <div key={i} className="p-6 rounded-[2rem] bg-gray-50 flex flex-col items-center gap-2 border border-white hover:shadow-elegant transition-all">
                              <span className="text-2xl font-black">{s.count}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter text-center">{s.label}</span>
                           </div>
                         ))}
                      </div>

                      <div className="w-full space-y-4">
                         {[
                           { title: '感悟收藏夹', icon: Bookmark },
                           { title: '系统设置', icon: Settings }
                         ].map((item, i) => (
                           <button key={i} className="w-full p-8 rounded-[2.5rem] bg-white border border-gray-50 flex items-center justify-between hover:bg-gray-50 group hover:shadow-elegant transition-all">
                              <div className="flex items-center gap-4">
                                 <div className="p-4 bg-gray-50 rounded-2xl text-gray-400 group-hover:text-gray-900 transition-colors">
                                    <item.icon size={22} />
                                 </div>
                                 <span className="font-bold text-xl">{item.title}</span>
                              </div>
                              <ChevronRight size={20} className="text-gray-200" />
                           </button>
                         ))}
                      </div>
                   </div>
                </PageTransition>
              )}

              {/* CREATE PICKER */}
              {activePage === 'create_picker' && (
                <PageTransition key="create_picker">
                   <div className="max-w-4xl mx-auto h-full px-8 flex flex-col justify-center">
                      <button onClick={() => setActivePage('home')} className="mb-10 text-[10px] font-bold uppercase tracking-widest text-gray-300 hover:text-gray-900 flex items-center gap-2 group transition-colors">
                         <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 返回万象首页
                      </button>
                      <h2 className="text-6xl font-black italic tracking-tighter mb-16 leading-[1.1]">
                        你想在 <br /> <span className="px-4 py-2 bg-gray-900 text-white rounded-[2rem]">纯白灵感</span> 中 <br /> 写入什么？
                      </h2>
                      <div className="grid md:grid-cols-2 gap-8">
                         <button onClick={() => setActivePage('create_post')} className="p-10 rounded-[3rem] bg-white border border-gray-100 text-left hover:shadow-deep transition-all group hover:-translate-y-2">
                             <div className="mb-8 p-6 bg-gray-50 rounded-[2rem] inline-block text-gray-300 group-hover:text-gray-900 transition-colors">
                                <Star size={40} strokeWidth={2} />
                             </div>
                             <h4 className="text-3xl font-bold mb-2">发布光影</h4>
                             <p className="text-sm text-gray-400 font-medium leading-relaxed">用一张图和一段文字，在这片白空间里画下你的心情。</p>
                         </button>
                         <button className="p-10 rounded-[3rem] bg-white border border-gray-100 text-left hover:shadow-deep transition-all group opacity-50 cursor-not-allowed">
                             <div className="mb-8 p-6 bg-gray-100 rounded-[2rem] inline-block text-gray-200">
                                <Circle size={40} strokeWidth={2} />
                             </div>
                             <h4 className="text-3xl font-bold mb-2">创建频道</h4>
                             <p className="text-sm text-gray-400 font-medium leading-relaxed">聚集志同道合的游者。此功能由于灵感过载正在维护中。</p>
                         </button>
                      </div>
                   </div>
                </PageTransition>
              )}

              {/* CREATE POST */}
              {activePage === 'create_post' && (
                <PageTransition key="create_post">
                   <header className="h-24 px-8 flex items-center justify-between glass-morphism sticky top-0 z-40">
                      <IconButton icon={ArrowLeft} onClick={() => setActivePage('create_picker')} />
                      <h1 className="text-xl font-bold uppercase tracking-widest">描绘光影</h1>
                      <button 
                        onClick={handlePublishPost}
                        disabled={!newPostText.trim() && !selectedImage}
                        className="px-8 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-20"
                      >
                        即刻开启
                      </button>
                   </header>
                   <div className="p-10 max-w-3xl mx-auto w-full flex-1 flex flex-col gap-10">
                      <textarea 
                        autoFocus
                        value={newPostText}
                        onChange={(e) => setNewPostText(e.target.value)}
                        placeholder="在纯净的一刻，留下你的意识流..."
                        className="w-full flex-1 min-h-[300px] bg-transparent text-3xl font-bold focus:outline-none placeholder:text-gray-100 resize-none leading-relaxed"
                      />
                      {selectedImage && (
                        <div className="relative rounded-[3rem] overflow-hidden border-2 border-gray-50 shadow-deep group">
                          <img src={selectedImage} className="w-full max-h-[500px] object-cover" />
                          <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 p-4 bg-white/80 backdrop-blur-md rounded-full shadow-lg hover:rotate-90 transition-all text-gray-900">
                            <X size={20} />
                          </button>
                        </div>
                      )}
                      <div className="pt-8 border-t border-gray-50 flex items-center justify-between">
                         <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                         <button onClick={() => fileInputRef.current?.click()} className="px-8 py-4 bg-gray-50 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors">
                           {selectedImage ? '重新捕捉影像' : '上传纯净原片'}
                         </button>
                         <span className="text-[10px] font-bold text-gray-200 uppercase tracking-widest">{newPostText.length} 符号</span>
                      </div>
                   </div>
                </PageTransition>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom Bar Mobile */}
          <nav className="lg:hidden absolute bottom-0 w-full h-20 bg-white/70 backdrop-blur-3xl border-t border-gray-50 grid grid-cols-3 z-40 px-4 items-center">
            <NavItem page="home" icon={Star} label="发现" />
            <NavItem page="messages" icon={MessageSquare} label="交流" />
            <NavItem page="profile" icon={User} label="我的" />
          </nav>
        </main>

        {/* --- Right Aside --- */}
        <aside className="hidden xl:flex w-[420px] flex-col p-10 space-y-10 z-30">
           <div className="p-10 rounded-[3rem] bg-gray-50 border border-white shadow-inner flex flex-col gap-6">
              <div className="flex justify-between items-center opacity-40">
                 <span className="text-[10px] font-bold uppercase tracking-[0.4em]">今日意识形态</span>
                 <div className="w-2 h-2 rounded-full bg-gray-900 animate-ping" />
              </div>
              <h3 className="text-4xl font-black italic tracking-tighter leading-tight">WHITE IS <br /> THE NEW <br /> EVERYTHING.</h3>
              <div className="flex items-center gap-3 mt-4">
                 <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">1.8k</div>
                 <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">游者共鸣中</span>
              </div>
           </div>

           <div className="space-y-8">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-gray-300 px-6">为你推荐</h4>
              <div className="space-y-2">
                {MOCK_CHANNELS.map(ch => (
                  <div key={ch.id} className="p-6 rounded-[2.2rem] hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all cursor-pointer group">
                     <div className="flex items-center gap-4 mb-3">
                        <img src={ch.avatar} className="w-12 h-12 rounded-2xl object-cover grayscale group-hover:grayscale-0 transition-all" />
                        <div className="flex-1">
                           <h5 className="font-bold text-lg group-hover:underline">{ch.name}</h5>
                           <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{ch.memberCount} 参与者</span>
                        </div>
                     </div>
                     <p className="text-xs text-gray-400 font-medium italic pl-16 opacity-60 group-hover:opacity-100 transition-opacity">“{ch.desc}”</p>
                  </div>
                ))}
              </div>
           </div>

           <div className="mt-auto space-y-6 px-4">
              <div className="p-8 rounded-[2.5rem] bg-gray-50 border border-white italic">
                 <p className="text-sm font-medium text-gray-400 leading-relaxed">
                   “在这个喧嚣的世界，我们构建一个绝对纯白的港湾。没有杂念，只有最纯粹的表达。”
                 </p>
              </div>
              <div className="flex items-center justify-between text-[8px] font-bold text-gray-200 uppercase tracking-[0.5em] px-2">
                 <span>VER 3.0 PURE</span>
                 <span>LOGGED IN</span>
              </div>
           </div>
        </aside>

      </div>
    </div>
  );
}
