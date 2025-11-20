
import React, { useState, useEffect, useRef } from 'react';
import { Heart, MessageCircle, Share2, Send, MoreHorizontal, Search, Bell, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

// --- MOCK DATA & PERSONAS ---

interface Comment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  timeAgo: string;
  isAi?: boolean;
}

interface Post {
  id: string;
  author: string;
  avatar: string;
  category: 'Sleep' | 'Feed' | 'Wins' | 'Rant' | 'Question';
  text: string;
  likes: number;
  comments: Comment[];
  timeAgo: string;
  isLiked: boolean;
}

const BOT_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Zack",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Molly",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
];

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Sarah M.',
    avatar: BOT_AVATARS[4],
    category: 'Sleep',
    text: "Is the 4-month sleep regression real?? 😭 My angel who slept 6 hours straight is now waking up every 45 minutes. Send coffee...",
    likes: 24,
    timeAgo: '2m ago',
    isLiked: false,
    comments: [
      { id: 'c1', author: 'MamaBear_99', avatar: BOT_AVATARS[1], text: "Oh it is VERY real. We are in the trenches with you! Hang in there.", timeAgo: '1m ago' },
      { id: 'c2', author: 'Dr. Sleep AI', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DrSleep', text: "Solidarity! Try keeping wake windows to 90-120 mins. This phase typically lasts 2-4 weeks.", timeAgo: 'Just now', isAi: true }
    ]
  },
  {
    id: '2',
    author: 'Jessica K.',
    avatar: BOT_AVATARS[3],
    category: 'Wins',
    text: "SHE ROLLED OVER! ✨ First time from back to tummy today during play mat time. I might have cried a little.",
    likes: 156,
    timeAgo: '15m ago',
    isLiked: true,
    comments: [
      { id: 'c3', author: 'Felix D.', avatar: BOT_AVATARS[0], text: "Huge milestone! Get ready, they start moving fast after this.", timeAgo: '10m ago' }
    ]
  },
  {
    id: '3',
    author: 'NewDad_Alex',
    avatar: BOT_AVATARS[2],
    category: 'Question',
    text: "Anyone else's baby suddenly refusing the bottle? He screams the moment he sees it. Breastfeeding is fine though.",
    likes: 8,
    timeAgo: '32m ago',
    isLiked: false,
    comments: []
  }
];

const CommunityHub: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [newPostText, setNewPostText] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [showNewPostIndicator, setShowNewPostIndicator] = useState(false);

  // --- SIMULATE LIVE ACTIVITY ---
  useEffect(() => {
    // Randomly add a "like" or "comment" to existing posts to make it feel alive
    const interval = setInterval(() => {
      setPosts(currentPosts => {
        const randomIndex = Math.floor(Math.random() * currentPosts.length);
        const randomPost = currentPosts[randomIndex];
        
        // 50% chance to add a like
        if (Math.random() > 0.5) {
          const updatedPosts = [...currentPosts];
          updatedPosts[randomIndex] = {
            ...randomPost,
            likes: randomPost.likes + 1
          };
          return updatedPosts;
        }
        return currentPosts;
      });
    }, 5000); // Every 5 seconds

    // Simulate a "New Post Arrived" toast occasionally
    const postInterval = setInterval(() => {
        setShowNewPostIndicator(true);
        setTimeout(() => setShowNewPostIndicator(false), 4000);
    }, 15000);

    return () => {
      clearInterval(interval);
      clearInterval(postInterval);
    };
  }, []);

  const handleLike = (postId: string) => {
    setPosts(posts.map(p => p.id === postId ? { ...p, likes: p.isLiked ? p.likes - 1 : p.likes + 1, isLiked: !p.isLiked } : p));
  };

  const handlePost = () => {
    if (!newPostText.trim()) return;

    const newPost: Post = {
      id: Date.now().toString(),
      author: 'You',
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arlo",
      category: 'Question', // Defaulting for demo
      text: newPostText,
      likes: 0,
      comments: [],
      timeAgo: 'Just now',
      isLiked: false
    };

    setPosts([newPost, ...posts]);
    setNewPostText('');

    // SIMULATE INSTANT AI REPLY
    setTimeout(() => {
      setPosts(prev => {
        const updated = [...prev];
        // Find the post we just added (it's at index 0)
        if (updated[0].id === newPost.id) {
          updated[0].comments.push({
            id: 'ai-reply-' + Date.now(),
            author: 'Village Guide Bot',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VillageBot',
            text: "Thanks for sharing! While other parents chime in, remember that you're doing a great job. Would you like me to tag the sleep experts?",
            timeAgo: 'Just now',
            isAi: true
          });
        }
        return updated;
      });
    }, 2500); // 2.5s delay for realism
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-20 md:pb-0">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl font-bold text-dark flex items-center gap-2">
              The Village <span className="bg-blue-100 text-blue-600 text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wide">July 2024</span>
            </h2>
            <p className="text-xs text-gray-500">32 parents active now</p>
          </div>
          <div className="relative">
             <Bell size={24} className="text-gray-600" />
             <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
           {['All', 'Sleep', 'Feed', 'Wins', 'Rant'].map(cat => (
             <button 
               key={cat}
               onClick={() => setActiveCategory(cat)}
               className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-dark text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
             >
               {cat}
             </button>
           ))}
        </div>
      </div>

      {/* New Post Indicator */}
      {showNewPostIndicator && (
         <div className="fixed top-32 left-1/2 -translate-x-1/2 z-20 bg-blue-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-fade-in flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({top:0, behavior:'smooth'})}>
            <Sparkles size={12} /> New activity in Sleep group
         </div>
      )}

      {/* Feed */}
      <div className="max-w-2xl mx-auto p-4 space-y-4">
         
         {/* "Create Post" Input */}
         <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex gap-3 items-start">
            <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex-shrink-0">
               <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arlo" alt="You" />
            </div>
            <div className="flex-1 relative">
               <textarea
                 value={newPostText}
                 onChange={(e) => setNewPostText(e.target.value)}
                 placeholder="Share a win, or ask for help..."
                 className="w-full bg-gray-50 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none h-20"
               />
               <button 
                 onClick={handlePost}
                 disabled={!newPostText.trim()}
                 className="absolute bottom-2 right-2 p-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
               >
                  <Send size={14} />
               </button>
            </div>
         </div>

         {/* Post List */}
         {posts.map(post => (
           <div key={post.id} className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 animate-fade-in">
              {/* Post Header */}
              <div className="flex justify-between items-start mb-3">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden border border-gray-100">
                       <img src={post.avatar} alt={post.author} />
                    </div>
                    <div>
                       <h4 className="font-bold text-sm text-gray-800">{post.author}</h4>
                       <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>{post.timeAgo}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded font-bold uppercase text-[10px] ${post.category === 'Sleep' ? 'bg-indigo-50 text-indigo-500' : post.category === 'Wins' ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-500'}`}>
                            {post.category}
                          </span>
                       </div>
                    </div>
                 </div>
                 <button className="text-gray-300">
                    <MoreHorizontal size={20} />
                 </button>
              </div>

              {/* Post Body */}
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                 {post.text}
              </p>

              {/* Post Actions */}
              <div className="flex items-center gap-6 border-t border-gray-50 pt-3">
                 <button 
                   onClick={() => handleLike(post.id)}
                   className={`flex items-center gap-1.5 text-sm font-bold transition-colors ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'}`}
                 >
                    <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} />
                    {post.likes}
                 </button>
                 <button className="flex items-center gap-1.5 text-sm font-bold text-gray-400 hover:text-blue-500 transition-colors">
                    <MessageCircle size={18} />
                    {post.comments.length}
                 </button>
                 <button className="ml-auto text-gray-400">
                    <Share2 size={18} />
                 </button>
              </div>

              {/* Comments Preview */}
              {post.comments.length > 0 && (
                 <div className="mt-4 bg-gray-50 rounded-xl p-3 space-y-3">
                    {post.comments.map(comment => (
                       <div key={comment.id} className="flex gap-2 items-start">
                          <img src={comment.avatar} className="w-6 h-6 rounded-full" alt={comment.author} />
                          <div className="flex-1">
                             <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-700">{comment.author}</span>
                                {comment.isAi && <span className="bg-blue-100 text-blue-600 text-[8px] px-1 rounded uppercase font-bold">Bot</span>}
                                <span className="text-[10px] text-gray-400">{comment.timeAgo}</span>
                             </div>
                             <p className="text-xs text-gray-600 leading-snug mt-0.5">{comment.text}</p>
                          </div>
                       </div>
                    ))}
                 </div>
              )}
           </div>
         ))}
         
         <div className="py-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100 text-xs font-bold text-gray-500">
               <Loader2 size={14} className="animate-spin" /> Loading more posts...
            </div>
         </div>

      </div>
    </div>
  );
};

export default CommunityHub;
