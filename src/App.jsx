import { useState, useEffect, useRef, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   GLOBAL STYLES — injected once
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=Noto+Sans+Bengali:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #000000;
    --bg1: #0d0d0d;
    --bg2: #161616;
    --bg3: #1e1e1e;
    --border: rgba(255,255,255,0.08);
    --border2: rgba(255,255,255,0.12);
    --text: #e7e9ea;
    --text2: #71767b;
    --text3: #536471;
    --accent: #1d9bf0;
    --accent-dim: rgba(29,155,240,0.12);
    --green: #00ba7c;
    --red: #f4212e;
    --yellow: #ffd400;
    --font: 'DM Sans', 'Noto Sans Bengali', sans-serif;
    --font-serif: 'Instrument Serif', serif;
  }
  html, body { background: var(--bg); color: var(--text); font-family: var(--font); font-size: 15px; line-height: 1.5; -webkit-font-smoothing: antialiased; }
  ::-webkit-scrollbar { width: 0px; }
  input, textarea, button { font-family: var(--font); }
  input::placeholder, textarea::placeholder { color: var(--text3); }
  textarea { resize: none; }
  button { cursor: pointer   /* Animations */
  @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
  @keyframes spinRing { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes heartPop { 0%{transform:scale(1)} 30%{transform:scale(1.4)} 60%{transform:scale(0.9)} 100%{transform:scale(1)} }
  @keyframes ripple { 0%{transform:scale(0);opacity:0.6} 100%{transform:scale(2.5);opacity:0} }
  @keyframes slideIn { from{transform:translateX(100%);opacity:0} to{transform:translateX(0);opacity:1} }
  @keyframes callPulse { 0%,100%{box-shadow:0 0 0 0 rgba(0,186,124,0.4)} 50%{box-shadow:0 0 0 16px rgba(0,186,124,0)} }
  @keyframes waveBar { 0%,100%{height:6px} 50%{height:22px} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.3} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} } fade-up { animation: fadeUp 0.35s ease forwards; }
  .fade-in { animation: fadeIn 0.25s ease forwards; }
  .scale-in { animation: scaleIn 0.2s ease forwards; }
  .slide-in { animation: slideIn 0.3s cubic-bezier(0.32,0.72,0,1) forwards; }

  .post-card { transition: background 0.15s ease; }
  .post-card:hover { background: rgba(255,255,255,0.025) !important; }
  .post-card:active { background: rgba(255,255,255,0.04) !important; }

  .action-btn { position: relative; overflow: hidden; }
  .action-btn::after { content:''; position:absolute; inset:0; border-radius:50%; background:currentColor; opacity:0; transform:scale(0); pointer-events:none; }
  .action-btn:active::after { animation: ripple 0.4s ease; }

  .nav-tab { transition: background 0.15s, color 0.15s; }
  .nav-tab:hover { background: rgba(255,255,255,0.06) !important; }

  .shimmer-line { background: linear-gradient(90deg, var(--bg2) 25%, var(--bg3) 50%, var(--bg2) 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }

  .follow-btn:hover { background: rgba(231,233,234,0.1) !important; }
  .blue-btn:hover { background: rgba(29,155,240,0.85) !important; }
  .outline-btn:hover { background: var(--accent-dim) !important; }
`; /* ─────────────────────────────────────────────────────────────
   TRANSLATIONS
───────────────────────────────────────────────────────────── */
const T = {
  en: { app:"VIBE", tagline:"What's happening?", signup:"Create account", signin:"Sign in", google:"Continue with Google", email:"Email address", phone:"Phone or email", password:"Password", name:"Your name", haveAcc:"Already have an account?", noAcc:"Don't have an account?", home:"Home", explore:"Explore", notifs:"Notifications", messages:"Messages", profile:"Profile", post:"Post", reply:"Reply", repost:"Repost", like:"Like", share:"Share", follow:"Follow", following:"Following", followers:"Followers", search:"Search", trending:"Trending", forYou:"For you", following_tab:"Following", newPost:"New post", addMedia:"Media", cancel:"Cancel", send:"Send", online:"Active now", away:"Active 1h ago", typeHere:"Start a new message", voiceCall:"Voice call", videoCall:"Video call", endCall:"End call", language:"Display language", logout:"Log out", settings:"Settings", verified:"Verified", joinedDate:"Joined January 2025", bio:"No bio yet", editProfile:"Edit profile", unread:"unread", or:"or", orSep:"New to VIBE?", loading:"Loading" },
  bn: { app:"VIBE", tagline:"কী হচ্ছে?", signup:"অ্যাকাউন্ট তৈরি করুন", signin:"সাইন ইন", google:"Google দিয়ে চালিয়ে যান", email:"ইমেইল ঠিকানা", phone:"ফোন বা ইমেইল", password:"পাসওয়ার্ড", name:"আপনার নাম", haveAcc:"ইতোমধ্যে অ্যাকাউন্ট আছে?", noAcc:"অ্যাকাউন্ট নেই?", home:"হোম", explore:"এক্সপ্লোর", notifs:"নোটিফিকেশন", messages:"বার্তা", profile:"প্রোফাইল", post:"পোস্ট", reply:"রিপ্লাই", repost:"রিপোস্ট", like:"লাইক", share:"শেয়ার", follow:"ফলো", following:"ফলোয়িং", followers:"ফলোয়ার", search:"খুঁজুন", trending:"ট্রেন্ডিং", forYou:"আপনার জন্য", following_tab:"ফলোয়িং", newPost:"নতুন পোস্ট", addMedia:"মিডিয়া", cancel:"বাতিল", send:"পাঠান", online:"এখন সক্রিয়", away:"১ঘ আগে সক্রিয়", typeHere:"নতুন বার্তা শুরু করুন", voiceCall:"ভয়েস কল", videoCall:"ভিডিও কল", endCall:"কল শেষ করুন", language:"ভাষা", logout:"লগআউট", settings:"সেটিংস", verified:"যাচাইকৃত", joinedDate:"যোগ দিয়েছেন জানুয়ারি ২০২৫", bio:"কোনো বায়ো নেই", editProfile:"প্রোফাইল সম্পাদনা", unread:"অপঠিত", or:"বা", orSep:"VIBE-এ নতুন?", loading:"লোড হচ্ছে" },
  hi: { app:"VIBE", tagline:"क्या हो रहा है?", signup:"अकाउंट बनाएं", signin:"साइन इन", google:"Google से जारी रखें", email:"ईमेल पता", phone:"फ़ोन या ईमेल", password:"पासवर्ड", name:"आपका नाम", haveAcc:"पहले से अकाउंट है?", noAcc:"अकाउंट नहीं है?", home:"होम", explore:"एक्सप्लोर", notifs:"सूचनाएं", messages:"संदेश", profile:"प्रोफ़ाइल", post:"पोस्ट", reply:"रिप्लाई", repost:"रिपोस्ट", like:"लाइक", share:"शेयर", follow:"फॉलो", following:"फॉलोइंग", followers:"फॉलोअर", search:"खोजें", trending:"ट्रेंडिंग", forYou:"आपके लिए", following_tab:"फॉलोइंग", newPost:"नई पोस्ट", addMedia:"मीडिया", cancel:"रद्द करें", send:"भेजें", online:"अभी सक्रिय", away:"1घ पहले सक्रिय", typeHere:"नया संदेश शुरू करें", voiceCall:"वॉइस कॉल", videoCall:"वीडियो कॉल", endCall:"कॉल समाप्त करें", language:"भाषा", logout:"लॉगआउट", settings:"सेटिंग्स", verified:"सत्यापित", joinedDate:"जनवरी 2025 में जुड़े", bio:"अभी तक कोई बायो नहीं", editProfile:"प्रोफ़ाइल संपादित करें", unread:"अपठित", or:"या", orSep:"VIBE पर नए हैं?", loading:"लोड हो रहा है" },
};

/* ─────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────── */
const USERS = [
  { id:1, name:"Rahim Ahmed", handle:"rahim_bd", bio:"Full-stack dev & open source contributor. Building @VibeBD 🇧🇩", verified:true, followers:12400, following:892, online:true, joined:"Jan 2024", accent:"#1d9bf0" },
  { id:2, name:"Priya Sharma", handle:"priya_creates", bio:"Artist & digital creator. Painting the world in pixels ✨🎨", verified:false, followers:3200, following:445, online:true, joined:"Mar 2024", accent:"#f91880" },
  { id:3, name:"Kabir Hassan", handle:"kabirh", bio:"Tech entrepreneur. CEO @NextBD. Forbes 30 Under 30 🚀", verified:true, followers:89000, following:201, online:false, joined:"Aug 2023", accent:"#7856ff" },
  { id:4, name:"Nadia Islam", handle:"nadia_music", bio:"Singer • Songwriter • BUET student 🎵 she/her", verified:false, followers:1500, following:680, online:true, joined:"Nov 2024", accent:"#ff7a00" },
  { id:5, name:"Aryan Dev", handle:"aryan_ux", bio:"Senior UX Designer @Google. Design is thinking made visual.", verified:true, followers:47000, following:312, online:false, joined:"Jun 2023", accent:"#00ba7c" },
]; 
const POSTS_DATA = [
  { id:1, uid:1, text:"আজ থেকে নতুন প্রজেক্ট শুরু করলাম — open-source Bangla NLP toolkit 🔥 কেউ contribute করতে চাইলে DM করুন। GitHub link soon! #OpenSource #Bangladesh #NLP", time:"2m", ts:Date.now()-120000, likes:342, reposts:89, replies:23, views:12400, liked:false, reposted:false },
  { id:2, uid:3, text:"Bangladesh's tech scene is growing faster than anyone predicted. We've gone from 0 to 500+ funded startups in under 5 years. The next decade belongs to us. 🇧🇩\n\nThread 🧵👇", time:"18m", ts:Date.now()-1080000, likes:4821, reposts:1203, replies:467, views:198000, liked:false, reposted:false },
  { id:3, uid:2, text:"Finished my biggest painting of 2025 — 3 months of work 🎨 The details in person are insane. Dropping the full process video tomorrow.\n\n✨ Let me know what you see in it first", time:"1h", ts:Date.now()-3600000, likes:1284, reposts:201, replies:89, views:43000, liked:false, reposted:false },
  { id:4, uid:5, text:"Hot take: most \"design systems\" are just collections of components without any actual design thinking.\n\nReal design systems encode decisions, not just visuals. The difference matters enormously at scale.", time:"3h", ts:Date.now()-10800000, likes:3102, reposts:892, replies:234, views:87000, liked:false, reposted:false },
  { id:5, uid:4, text:"গান গাওয়া শিখতে চাইলে শুধু প্র্যাকটিস করলেই হবে না — কান দিয়ে শুনতে শিখতে হবে আগে। অনেকেই এই ভুলটা করে। 🎵\n\nআমার জার্নি শেয়ার করব এই সপ্তাহে", time:"5h", ts:Date.now()-18000000, likes:892, reposts:134, replies:67, views:28000, liked:false, reposted:false },
];

const MSGS_DATA = [
  { uid:1, msgs:[{ from:"them", text:"ভাই, নতুন প্রজেক্টে contribute করতে চাই। কীভাবে শুরু করব?", t:"10:23" },{ from:"me", text:"অবশ্যই! GitHub repo ready হলে tag করব। Email টা দাও।", t:"10:25" },{ from:"them", text:"Done! Eagerly waiting 🔥", t:"10:26" }] },
  { uid:3, msgs:[{ from:"them", text:"Great talk at the meetup yesterday!", t:"Yesterday" },{ from:"me", text:"Thanks! Your keynote was 🔥", t:"Yesterday" }] },
  { uid:2, msgs:[{ from:"them", text:"আপনার feedback দরকার আমার নতুন series-এ 🎨", t:"Mon" }] },
  { uid:4, msgs:[{ from:"them", text:"Hi! Huge fan of your work 😊", t:"Sun" }] },
];

const TRENDS = [
  { cat:"Technology · Trending", tag:"#AI2025", posts:"284K posts" },
  { cat:"Bangladesh · Trending", tag:"#DigitalBangladesh", posts:"89.4K posts" },
  { cat:"Music · Trending", tag:"#BanglaRock", posts:"34.1K posts" },
  { cat:"Sports · Trending", tag:"#BanvsInd", posts:"1.2M posts" },
  { cat:"Tech · Trending", tag:"#OpenSource", posts:"156K posts" },
];

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const fmtNum = n => n >= 1000000 ? (n/1000000).toFixed(1)+"M" : n >= 1000 ? (n/1000).toFixed(1)+"K" : String(n);
const fmtTimer = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
const COLORS = ["#1d9bf0","#f91880","#7856ff","#ff7a00","#00ba7c","#ffd400"];
const avatarColor = id => COLORS[id % COLORS.length];

/* ─────────────────────────────────────────────────────────────
   ICONS (inline SVG)
───────────────────────────────────────────────────────────── */
const Icon = ({ name, size=20, color="currentColor", style={} }) => {
  const paths = {
    home: <><path d="M10 2L2 8v12h6v-7h4v7h6V8z" stroke={color} strokeWidth="1.75" fill="none" strokeLinejoin="round" strokeLinecap="round"/></>,
    homeF: <><path d="M10 2L2 8v12h6v-7h4v7h6V8z" fill={color}/></>,
    explore: <><circle cx="10.5" cy="10.5" r="7.5" stroke={color} strokeWidth="1.75" fill="none"/><path d="m21 21-4.35-4.35" stroke={color} strokeWidth="1.75" strokeLinecap="round"/></>,
    exploreF: <><circle cx="10.5" cy="10.5" r="7.5" fill={color}/></>,
    bell: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke={color} strokeWidth="1.75" fill="none" strokeLinejoin="round"/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="1.75" strokeLinecap="round"/></>,
    bellF: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" fill={color}/><path d="M13.73 21a2 2 0 0 1-3.46 0" stroke={color} strokeWidth="1.75" strokeLinecap="round"/></>,
    mail: <><rect x="2" y="4" width="20" height="16" rx="2" stroke={color} strokeWidth="1.75" fill="none"/><path d="m22 7-10 7L2 7" stroke={color} strokeWidth="1.75" strokeLinecap="round"/></>,
    mailF: <><rect x="2" y="4" width="20" height="16" rx="2" fill={color}/><path d="m22 7-10 7L2 7" stroke="#000" strokeWidth="1.75" strokeLinecap="round"/></>,
    user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} strokeWidth="1.75" fill="none" strokeLinejoin="round"/><circle cx="12" cy="7" r="4" stroke={color} strokeWidth="1.75" fill="none"/></>,
    userF: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" fill={color}/><circle cx="12" cy="7" r="4" fill={color}/></>,
    heart: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} strokeWidth="1.75" fill="none" strokeLinejoin="round"/></>,
    heartF: <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill={color} stroke={color} strokeWidth="1.75" strokeLinejoin="round"/></>,
    repeat: <><polyline points="17 1 21 5 17 9" stroke={color} strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 11V9a4 4 0 0 1 4-4h14" stroke={color} strokeWidth="1.75" fill="none" strokeLinecap="round"/><polyline points="7 23 3 19 7 15" stroke={color} strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 13v2a4 4 0 0 1-4 4H3" stroke={color} strokeWidth="1.75" fill="none" strokeLinecap="round"/></>,
    comment: <><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.75" fill="none" strokeLinejoin="round"/></>,
    share2: <><circle cx="18" cy="5" r="3" stroke={color} strokeWidth="1.75" fill="none"/><circle cx="6" cy="12" r="3" stroke={color} strokeWidth="1.75" fill="none"/><circle cx="18" cy="19" r="3" stroke={color} strokeWidth="1.75" fill="none"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" stroke={color} strokeWidth="1.75" strokeLinecap="round"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" stroke={color} strokeWidth="1.75" strokeLinecap="round"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="1.75" fill="none"/><circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.75" fill="none"/></>,
    phone: <><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.18 6.18l.94-.94a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke={color} strokeWidth="1.75" fill="none" strokeLinejoin="round"/></>,
    video: <><polygon points="23 7 16 12 23 17 23 7" stroke={color} strokeWidth="1.75" fill="none" strokeLinejoin="round"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2" stroke={color} strokeWidth="1.75" fill="none"/></>,
    send: <><line x1="22" y1="2" x2="11" y2="13" stroke={color} strokeWidth="1.75" strokeLinecap="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" stroke={color} strokeWidth="1.75" fill="none" strokeLinejoin="round"/></>,
    check: <><polyline points="20 6 9 17 4 12" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="1.75" fill="none"/><circle cx="8.5" cy="8.5" r="1.5" fill={color}/><polyline points="21 15 16 10 5 21" stroke={color} strokeWidth="1.75" fill="none" strokeLinejoin="round"/></>,
    back: <><polyline points="15 18 9 12 15 6" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></>,
    close: <><line x1="18" y1="6" x2="6" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/><line x1="6" y1="6" x2="18" y2="18" stroke={color} strokeWidth="2" strokeLinecap="round"/></>,
    dots: <><circle cx="12" cy="12" r="1" fill={color}/><circle cx="19" cy="12" r="1" fill={color}/><circle cx="5" cy="12" r="1" fill={color}/></>,
    globe: <><circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.75" fill="none"/><line x1="2" y1="12" x2="22" y2="12" stroke={color} strokeWidth="1.75"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} strokeWidth="1.75" fill="none"/></>,
    logout: <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"/><polyline points="16 17 21 12 16 7" stroke={color} strokeWidth="1.75" fill="none" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="1.75" strokeLinecap="round"/></>,
    mic: <><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" stroke={color} strokeWidth="1.75" fill="none"/><path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke={color} strokeWidth="1.75" fill="none" strokeLinecap="round"/><line x1="12" y1="19" x2="12" y2="23" stroke={color} strokeWidth="1.75" strokeLinecap="round"/><line x1="8" y1="23" x2="16" y2="23" stroke={color} strokeWidth="1.75" strokeLinecap="round"/></>,
    camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.75" fill="none" strokeLinejoin="round"/><circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.75" fill="none"/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={style}>
      {paths[name] || null}
    </svg>
  );
};
/* ─────────────────────────────────────────────────────────────
   AVATAR
───────────────────────────────────────────────────────────── */
const Av = ({ user, size=40, showDot=false, ring=false }) => {
  const c = avatarColor(user.id);
  const initials = user.name.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  return (
    <div style={{ position:"relative", flexShrink:0, width:size, height:size }}>
      <div style={{ width:size, height:size, borderRadius:"50%", background:`linear-gradient(135deg,${c}cc,${c}55)`, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:size*0.34, letterSpacing:"0.5px", border: ring ? `2px solid ${c}` : "none", boxShadow: ring ? `0 0 12px ${c}44` : "none" }}>
        {initials}
      </div>
      {showDot && (
        <div style={{ position:"absolute", bottom:1, right:1, width:size*0.28, height:size*0.28, borderRadius:"50%", background: user.online ? "var(--green)" : "var(--bg3)", border:"2px solid var(--bg)" }} />
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   VERIFIED BADGE
───────────────────────────────────────────────────────────── */
const VBadge = ({ color="#1d9bf0", size=16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{flexShrink:0}}>
    <circle cx="12" cy="12" r="12" fill={color}/>
    <path d="M9 12l2 2 4-4" stroke="#fff" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─────────────────────────────────────────────────────────────
   MAIN APP export default function App() {
  const [lang, setLang] = useState("bn");
  const [page, setPage] = useState("auth"); // auth | main
  const [authMode, setAuthMode] = useState("signin");
  const [tab, setTab] = useState("home");
  const [feedTab, setFeedTab] = useState("foryou");
  const [posts, setPosts] = useState(POSTS_DATA);
  const [msgs, setMsgs] = useState(MSGS_DATA);
  const [activeChat, setActiveChat] = useState(null);
  const [msgInput, setMsgInput] = useState("");
  const [composeText, setComposeText] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [call, setCall] = useState(null);
  const [callSecs, setCallSecs] = useState(0);
  const [notifs, setNotifs] = useState([
    { id:1, type:"like", uid:1, text:"liked your post", sub:"আজ থেকে নতুন প্রজেক্ট...", time:"2m", read:false },
    { id:2, type:"follow", uid:3, text:"followed you", sub:"", time:"15m", read:false },
    { id:3, type:"repost", uid:2, text:"reposted your post", sub:"গান গাওয়া শিখতে চাইলে...", time:"1h", read:false },
    { id:4, type:"reply", uid:5, text:"replied to your post", sub:"Great insight!", time:"3h", read:true },
    { id:5, type:"like", uid:4, text:"liked your reply", sub:"", time:"5h", read:true },
  ]);
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [showLangDrop, setShowLangDrop] = useState(false);
  const [followState, setFollowState] = useState({});
  const chatEndRef = useRef(null);
  const composeRef = useRef(null);
  const t = T[lang];

  // Call timer
  useEffect(() => {
    if (!call) { setCallSecs(0); return; }
    const id = setInterval(() => setCallSecs(s => s+1), 1000);
    return () => clearInterval(id);
  }, [call]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior:"smooth" }); }, [activeChat, msgs]);
  useEffect(() => { if (showCompose) composeRef.current?.focus(); }, [showCompose]);

  const getUser = id => USERS.find(u => u.id === id);

  const handleLike = id => {
    setPosts(p => p.map(post => post.id === id
      ? { ...post, liked:!post.liked, likes: post.liked ? post.likes-1 : post.likes+1 }
      : post));
  };
  const handleRepost = id => {
    setPosts(p => p.map(post => post.id === id
      ? { ...post, reposted:!post.reposted, reposts: post.reposted ? post.reposts-1 : post.reposts+1 }
      : post));
  };
  const handlePost = () => {
    if (!composeText.trim()) return;
    setPosts(prev => [{ id:Date.now(), uid:99, text:composeText, time:"now", ts:Date.now(), likes:0, reposts:0, replies:0, views:1, liked:false, reposted:false }, ...prev]);
    setComposeText("");
    setShowCompose(false);
  };
  const handleSendMsg = () => {
    if (!msgInput.trim() || !activeChat) return;
    const now = new Date().toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" });
    setMsgs(prev => prev.map(c => c.uid === activeChat.id
      ? { ...c, msgs:[...c.msgs, { from:"me", text:msgInput, t:now }] }
      : c));
    setMsgInput("");
  };

  const meUser = { id:99, name: form.name||"You", handle:"you", bio:"VIBE user", verified:false, followers:0, following:0, online:true, joined:"May 2025", accent:"#1d9bf0" };

  const unreadCount = notifs.filter(n=>!n.read).length;

  // ───────────── AUTH ─────────────
  if (page === "auth") return (
    <div style={{ background:"var(--bg)", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24, position:"relative", overflow:"hidden" }}>
      <style>{GLOBAL_CSS}</style>
      {/* subtle bg glow */}
      <div style={{ position:"fixed", top:"-20%", left:"-10%", width:"60vw", height:"60vw", borderRadius:"50%", background:"radial-gradient(circle, rgba(29,155,240,0.06) 0%, transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"fixed", bottom:"-20%", right:"-10%", width:"50vw", height:"50vw", borderRadius:"50%", background:"radial-gradient(circle, rgba(120,86,255,0.05) 0%, transparent 70%)", pointerEvents:"none" }}/>
{/* Lang toggle top right */}
      <div style={{ position:"fixed", top:16, right:16, zIndex:50 }}>
        <button onClick={()=>setShowLangDrop(p=>!p)} style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:20, padding:"6px 14px", color:"var(--text)", fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
          <Icon name="globe" size={14} color="var(--text2)"/>
          {lang==="en"?"English":lang==="bn"?"বাংলা":"हिन्दी"}
        </button>
        {showLangDrop && (
          <div className="scale-in" style={{ position:"absolute", right:0, top:40, background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:6, minWidth:150, zIndex:200 }}>
            {[["en","🇬🇧 English"],["bn","🇧🇩 বাংলা"],["hi","🇮🇳 हिन्दी"]].map(([k,v])=>(
              <button key={k} onClick={()=>{setLang(k);setShowLangDrop(false);}} style={{ display:"block", width:"100%", background: lang===k?"rgba(29,155,240,0.12)":"transparent", border:"none", color: lang===k?"var(--accent)":"var(--text)", padding:"9px 14px", borderRadius:8, textAlign:"left", fontSize:14, transition:"background 0.15s" }}>{v}</button>
            ))}
          </div>
        )}
      </div>

      <div className="fade-up" style={{ width:"100%", maxWidth:380 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:40 }}>
          <div style={{ fontSize:52, fontWeight:800, letterSpacing:"-3px", fontFamily:"'DM Sans', sans-serif", lineHeight:1 }}>
            <span style={{ color:"var(--text)" }}>V</span>
            <span style={{ color:"var(--accent)" }}>I</span>
            <span style={{ color:"var(--text)" }}>BE</span>
          </div>
          <div style={{ color:"var(--text3)", fontSize:14, marginTop:8, fontStyle:"italic", fontFamily:"var(--font-serif)" }}>Connect without boundaries</div>
        </div>

        {/* Card */}
        <div style={{ background:"var(--bg1)", border:"1px solid var(--border)", borderRadius:20, padding:28, backdropFilter:"blur(20px)" }}>
          {/* Mode toggle */}
          <div style={{ display:"flex", background:"var(--bg2)", borderRadius:12, padding:3, marginBottom:24 }}>
            {[["signin",t.signin],["signup",t.signup]].map(([k,v])=>(
              <button key={k} onClick={()=>setAuthMode(k)} style={{ flex:1, padding:"9px", borderRadius:10, border:"none", background: authMode===k?"var(--bg3)":"transparent", color: authMode===k?"var(--text)":"var(--text2)", fontWeight: authMode===k?600:400, fontSize:14, transition:"all 0.2s" }}>{v}</button>
            ))}
          </div>

          {/* Google */}
          <button onClick={()=>setPage("main")} style={{ width:"100%", background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:12, padding:"12px 16px", color:"var(--text)", fontSize:14, fontWeight:500, display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:20, transition:"background 0.15s" }}
            onMouseOver={e=>e.currentTarget.style.background="var(--bg3)"} onMouseOut={e=>e.currentTarget.style.background="var(--bg2)"}>
            <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.638-.057-1.252-.164-1.84H9v3.48h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/><path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
            {t.google}
          </button> <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20 }}>
            <div style={{ flex:1, height:1, background:"var(--border)" }}/><span style={{ color:"var(--text3)", fontSize:12 }}>{t.or}</span><div style={{ flex:1, height:1, background:"var(--border)" }}/>
          </div>

          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {authMode==="signup" && (
              <input style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:10, padding:"13px 16px", color:"var(--text)", fontSize:15, outline:"none", width:"100%", transition:"border-color 0.2s" }} placeholder={t.name} value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} onFocus={e=>e.target.style.borderColor="var(--accent)"} onBlur={e=>e.target.style.borderColor="var(--border2)"}/>
            )}
            <input style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:10, padding:"13px 16px", color:"var(--text)", fontSize:15, outline:"none", width:"100%", transition:"border-color 0.2s" }} placeholder={authMode==="signin"?t.phone:t.email} value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} onFocus={e=>e.target.style.borderColor="var(--accent)"} onBlur={e=>e.target.style.borderColor="var(--border2)"}/>
            <input type="password" style={{ background:"var(--bg2)", border:"1px solid var(--border2)", borderRadius:10, padding:"13px 16px", color:"var(--text)", fontSize:15, outline:"none", width:"100%", transition:"border-color 0.2s" }} placeholder={t.password} value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} onFocus={e=>e.target.style.borderColor="var(--accent)"} onBlur={e=>e.target.style.borderColor="var(--border2)"}/>
            <button className="blue-btn" onClick={()=>setPage("main")} style={{ background:"var(--accent)", border:"none", borderRadius:10, padding:"13px", color:"#fff", fontWeight:700, fontSize:15, marginTop:2, transition:"background 0.15s" }}>
              {authMode==="signin"?t.signin:t.signup}
            </button>
          </div>

          <div style={{ textAlign:"center", marginTop:20, color:"var(--text2)", fontSize:13 }}>
            {authMode==="signin"?t.noAcc:t.haveAcc}{" "}
            <span onClick={()=>setAuthMode(authMode==="signin"?"signup":"signin")} style={{ color:"var(--accent)", cursor:"pointer", fontWeight:600 }}>{authMode==="signin"?t.signup:t.signin}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // ───────────── CALL OVERLAY ─────────────
  const CallOverlay = () => !call ? null : (
    <div className="fade-in" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.97)", zIndex:2000, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"space-between", padding:"60px 24px 60px" }}>
      <div style={{ textAlign:"center" }}>
        <div style={{ color:"var(--text2)", fontSize:14, marginBottom:4 }}>{call.type==="voice"?"Voice Call":"Video Call"} • {call.user.name}</div>
        <div style={{ color:"var(--green)", fontSize:28, fontWeight:700, letterSpacing:"-0.5px", fontFamily:"'DM Sans',monospace" }}>{fmtTimer(callSecs)}</div>
      </div>

      {call.type==="video" ? (
        <div style={{ width:"100%", maxWidth:500, aspectRatio:"16/10", background:"var(--bg1)", borderRadius:24, border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"linear-gradient(135deg,#0d1117,#161b22)", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:12 }}>
            <Av user={call.user} size={80} ring/>
            <span style={{ color:"var(--text2)", fontSize:14 }}>Camera connecting…</span> </div>
          <div style={{ position:"absolute", bottom:16, right:16, width:90, height:120, background:"var(--bg2)", borderRadius:12, border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ color:"var(--text3)", fontSize:11 }}>You</span>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ width:140, height:140, borderRadius:"50%", border:`3px solid var(--green)`, padding:4, animation:"callPulse 2s infinite" }}>
            <Av user={call.user} size={132} />
          </div>
          {/* audio wave */}
          <div style={{ display:"flex", gap:4, alignItems:"center", justifyContent:"center", marginTop:20, height:30 }}>
            {[0,1,2,3,4,5,6].map(i=>(
              <div key={i} style={{ width:4, height:6, background:"var(--green)", borderRadius:2, animation:`waveBar 1.2s ease-in-out infinite`, animationDelay:`${i*0.15}s` }}/>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex", gap:20, alignItems:"center" }}>
        {[
          { icon:"mic", label:"Mute", col:"var(--bg2)" },
          { icon:"camera", label:"Cam", col:"var(--bg2)" },
        ].map(b=>(
          <div key={b.label} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
            <button style={{ width:56, height:56, borderRadius:"50%", background:b.col, border:"1px solid var(--border2)", display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name={b.icon} size={22} color="var(--text)"/></button>
            <span style={{ color:"var(--text2)", fontSize:11 }}>{b.label}</span>
          </div>
        ))}
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
          <button onClick={()=>setCall(null)} style={{ width:68, height:68, borderRadius:"50%", background:"var(--red)", border:"none", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon name="phone" size={26} color="#fff"/>
          </button>
          <span style={{ color:"var(--text2)", fontSize:11 }}>{t.endCall}</span>
        </div>
      </div>
    </div>
  );
// ───────────── COMPOSE MODAL ─────────────
  const ComposeModal = () => !showCompose ? null : (
    <div className="fade-in" style={{ position:"fixed", inset:0, bckground:"rgba(0,0,0,0.7)", zIndex:1000, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"60px 16px 16px" }}>
      <div className="scale-in" style={{ background:"var(--bg1)", border:"1px solid var(--border2)", borderRadius:20, padding:20, width:"100%", maxWidth:540 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <button onClick={()=>setShowCompose(false)} style={{ background:"none", border:"none", padding:6, borderRadius:"50%" }}><Icon name="close" size={20} color="var(--text2)"/></button>
          <span style={{ color:"var(--text)", fontWeight:700 }}>{t.newPost}</span>
          <button onClick={handlePost} disabled={!composeText.trim()} style={{ background: composeText.trim()?"var(--accent)":"var(--bg3)", border:"none", borderRadius:20, padding:"8px 20px", color:"#fff", fontWeight:700, fontSize:14, opacity: composeText.trim()?1:0.5 }}>{t.post}</button>
        </div>
        <div style={{ display:"flex", gap:12 }}>
          <Av user={meUser} size={44}/>
          <div style={{ flex:1 }}>
            <textarea ref={composeRef} value={composeText} onChange={e=>setComposeText(e.target.value)} placeholder={t.tagline} style={{ width:"100%", background:"transparent", border:"none", outline:"none", color:"var(--text)", fontSize:18, lineHeight:1.5, minHeight:120 }}/>
            <div style={{ borderTop:"1px solid var(--border)", paddingTop:12, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <button style={{ background:"none", border:"none", display:"flex", alignItems:"center", gap:6, color:"var(--accent)", fontSize:13, fontWeight:500 }}><Icon name="image" size={18} color="var(--accent)"/>{t.addMedia}</button>
              <span style={{ color: composeText.length>240?"var(--red)":"var(--text3)", fontSize:13 }}>{280-composeText.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  // ───────────── POST CARD ─────────────
  const PostCard = ({ post, idx }) => {
    const user = post.uid===99 ? meUser : getUser(post.uid);
    if (!user) return null;
    const ac = avatarColor(user.id);
    return (
      <div className="post-card fade-up" style={{ borderBottom:"1px solid var(--border)", padding:"14px 16px", cursor:"pointer", animationDelay:`${idx*0.04}s`, background:"var(--bg)" }}>
        <div style={{ display:"flex", gap:12 }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:0 }}>
            <Av user={user} size={44} showDot/>
            <div style={{ width:2, flex:1, background:"var(--border)", borderRadius:1, marginTop:6, minHeight:20, opacity:0.4 }}/>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", gap:6, flexWrap:"wrap", marginBottom:2 }}>
              <span style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>{user.name}</span>
              {user.verified && <VBadge color={user.accent||"#1d9bf0"}/>}
              <span style={{ color:"var(--text3)", fontSize:14 }}>@{user.handle}</span>
              <span style={{ color:"var(--text3)", fontSize:14 }}>·</span>
              <span style={{ color:"var(--text3)", fontSize:14 }}>{post.time}</span>
              <button style={{ marginLeft:"auto", background:"none", border:"none", padding:4 }}><Icon name="dots" size={18} color="var(--text3)"/></button>
            </div>
            {/* Text */}
            <p style={{ color:"var(--text)", fontSize:15, lineHeight:1.65, marginBottom:14, whiteSpace:"pre-line", wordBreak:"break-word" }}>{post.text}</p>
            {/* Actions */}
            <div style={{ display:"flex", justifyContent:"space-between", maxWidth:360 }}>
              {/* Reply */}
              <button className="action-btn" onClick={()=>{}} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:"var(--text3)", fontSize:13, padding:"4px 8px 4px 0", borderRadius:20, transition:"color 0.15s" }}
                onMouseOver={e=>{e.currentTarget.style.color="var(--accent)";}} onMouseOut={e=>{e.currentTarget.style.color="var(--text3)";}}>
                <Icon name="comment" size={18} color="currentColor"/>{fmtNum(post.replies)}
              </button>
              {/* Repost */}
              <button className="action-btn" onClick={()=>handleRepost(post.id)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color: post.reposted?"var(--green)":"var(--text3)", fontSize:13, padding:"4px 8px", borderRadius:20, transition:"color 0.15s", fontWeight: post.reposted?600:400 }}
                onMouseOver={e=>{if(!post.reposted)e.currentTarget.style.color="var(--green)";}} onMouseOut={e=>{if(!post.reposted)e.currentTarget.style.color="var(--text3)";}}>
                <Icon name="repeat" size={18} color="currentColor"/>{fmtNum(post.reposts)}
              </button>
              {/* Like */}
              <button className="action-btn" onClick={()=>handleLike(post.id)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color: post.liked?"var(--red)":"var(--text3)", fontSize:13, padding:"4px 8px", borderRadius:20, transition:"color 0.15s", fontWeight: post.liked?600:400, animation: post.liked?"heartPop 0.4s ease":undefined }}
                onMouseOver={e=>{if(!post.liked)e.currentTarget.style.color="var(--red)";}} onMouseOut={e=>{if(!post.liked)e.currentTarget.style.color="var(--text3)";}}>
                <Icon name={post.liked?"heartF":"heart"} size={18} color="currentColor"/>{fmtNum(post.likes)}
              </button>
              {/* Views */}
              <button style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:"var(--text3)", fontSize:13, padding:"4px 8px" }}>
                <Icon name="eye" size={18} color="var(--text3)"/>{fmtNum(post.views)}
              </button>
              {/* Share */}
              <button style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:"none", color:"var(--text3)", fontSize:13, padding:"4px 8px", borderRadius:20, transition:"color 0.15s" }}
                onMouseOver={e=>e.currentTarget.style.color="var(--accent)"} onMouseOut={e=>e.currentTarget.style.color="var(--text3)"}>
                <Icon name="share2" size={18} color="currentColor"/>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };   // ───────────── PAGES ─────────────
  const HomePage = () => (
    <div>
      {/* Feed Tabs */}
      <div style={{ display:"flex", borderBottom:"1px solid var(--border)", position:"sticky", top:0, background:"rgba(0,0,0,0.9)", backdropFilter:"blur(20px)", zIndex:10 }}>
        {[["foryou",t.forYou],["following",t.following_tab]].map(([k,v])=>(
          <button key={k} onClick={()=>setFeedTab(k)} style={{ flex:1, padding:"16px 0", background:"none", border:"none", color: feedTab===k?"var(--text)":"var(--text2)", fontWeight: feedTab===k?700:400, fontSize:15, position:"relative", transition:"color 0.2s" }}>
            {v}
            {feedTab===k && <div style={{ position:"absolute", bottom:-1, left:"50%", transform:"translateX(-50%)", width:48, height:3, background:"var(--accent)", borderRadius:2 }}/>}
          </button>
        ))}
      </div>
     {/* Compose row */}
      <div style={{ display:"flex", gap:12, padding:"12px 16px", borderBottom:"1px solid var(--border)" }}>
        <Av user={meUser} size={44}/>
        <div style={{ flex:1 }}>
          <div onClick={()=>setShowCompose(true)} style={{ color:"var(--text3)", fontSize:18, padding:"10px 0", cursor:"text", marginBottom:10 }}>{t.tagline}</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", gap:4 }}>
              <button onClick={()=>setShowCompose(true)} style={{ background:"none", border:"none", padding:6 }}><Icon name="image" size={20} color="var(--accent)"/></button>
            </div>
            <button onClick={()=>setShowCompose(true)} style={{ background:"var(--accent)", border:"none", borderRadius:20, padding:"7px 18px", color:"#fff", fontWeight:700, fontSize:14 }}>{t.post}</button>
          </div>
        </div>
      </div>
   {/* Posts */}
      {posts.map((p, i) => <PostCard key={p.id} post={p} idx={i}/>)}
    </div>
  );
  const ExplorePage = () => (
    <div> );
  const ExplorePage = () => (
    <div>
      <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)", position:"sticky", top:0, background:"rgba(0,0,0,0.9)", backdropFilter:"blur(20px)", zIndex:10 }}>
        <div style={{ background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:24, padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
          <Icon name="explore" size={18} color="var(--text3)"/>
          <input placeholder={t.search} style={{ background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:15, flex:1 }}/>
        </div>
      </div>
     {/* Trending */}
      <div style={{ padding:"16px 16px 6px" }}>
        <div style={{ fontWeight:800, fontSize:20, marginBottom:14 }}>🔥 {t.trending}</div>
        {TRENDS.map((tr, i)=>(
          <div key={i} className="post-card" style={{ padding:"12px 0", borderBottom:"1px solid var(--border)", cursor:"pointer" }}>
            <div style={{ color:"var(--text3)", fontSize:12 }}>{tr.cat}</div>
            <div style={{ fontWeight:700, fontSize:16, color:"var(--text)", margin:"2px 0" }}>{tr.tag}</div>
            <div style={{ color:"var(--text3)", fontSize:13 }}>{tr.posts}</div>
          </div>
        ))}
      </div>
    {/* Suggested users */}
      <div style={{ padding:"20px 16px 6px" }}>
        <div style={{ fontWeight:800, fontSize:20, marginBottom:14 }}>👥 {t.forYou}</div>
        {USERS.map(u=>(
          <div key={u.id} style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
            <Av user={u} size={48} showDot/>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontWeight:700, fontSize:15, color:"var(--text)" }}>{u.name}</span>
                {u.verified && <VBadge color={u.accent}/>}
              </div>
              <div style={{ color:"var(--text3)", fontSize:13 }}>@{u.handle}</div>
              <div style={{ color:"var(--text2)", fontSize:13, marginTop:2, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.bio}</div>
            </div>
            <button className="follow-btn" onClick={()=>setFollowState(p=>({...p,[u.id]:!p[u.id]}))} style={{ background: followState[u.id]?"transparent":"var(--text)", border: followState[u.id]?"1px solid var(--border2)":"none", borderRadius:20, padding:"7px 16px", color: followState[u.id]?"var(--text)":"var(--bg)", fontWeight:700, fontSize:14, flexShrink:0, transition:"all 0.2s" }}>
              {followState[u.id]?t.following:t.follow}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
  const NotifsPage = () => (
    <div>
      <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", fontWeight:800, fontSize:20, position:"sticky", top:0, background:"rgba(0,0,0,0.9)", backdropFilter:"blur(20px)", zIndex:10 }}>{t.notifs}</div>
      {notifs.map((n, i)=>{
        const u = getUser(n.uid);
        if (!u) return null;
        return (
          <div key={n.id} className="post-card fade-up" onClick={()=>setNotifs(p=>p.map(x=>x.id===n.id?{...x,read:true}:x))} style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", gap:12, cursor:"pointer", background: n.read?"var(--bg)":"rgba(29,155,240,0.04)", animationDelay:`${i*0.04}s` }}>
            <div style={{ width:48, display:"flex", justifyContent:"center", paddingTop:4 }}>
              {n.type==="like" && <div style={{ fontSize:22 }}>❤️</div>}
              {n.type==="follow" && <Av user={u} size={38}/>}
              {n.type==="repost" && <div style={{ fontSize:22 }}>🔁</div>}
              {n.type==="reply" && <div style={{ fontSize:22 }}>💬</div>}
            </div> <div style={{ flex:1 }}>
              <span style={{ fontWeight:700, color:"var(--text)" }}>{u.name}</span>{" "}
              <span style={{ color:"var(--text2)" }}>{n.text}</span>
              {n.sub && <div style={{ color:"var(--text3)", fontSize:13, marginTop:4, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>"{n.sub}"</div>}
              <div style={{ color:"var(--text3)", fontSize:12, marginTop:3 }}>{n.time}</div>
            </div>
            {!n.read && <div style={{ width:8, height:8, borderRadius:"50%", background:"var(--accent)", flexShrink:0, marginTop:8 }}/>}
          </div>
        );
      })}
    </div>
  );
  const MsgsPage = () => {
    if (activeChat) {
      const chatData = msgs.find(m=>m.uid===activeChat.id);
      return (
        <div style={{ display:"flex", flexDirection:"column", height:"calc(100dvh - 60px)" }}>
          {/* Chat header */}
          <div style={{ padding:"10px 16px", borderBottom:"1px solid var(--border)", display:"flex", alignItems:"center", gap:12, position:"sticky", top:0, background:"rgba(0,0,0,0.9)", backdropFilter:"blur(20px)", zIndex:10 }}>
            <button onClick={()=>setActiveChat(null)} style={{ background:"none", border:"none", padding:4 }}><Icon name="back" size={22} color="var(--text)"/></button>
            <Av user={activeChat} size={40} showDot/>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <span style={{ fontWeight:700, fontSize:15 }}>{activeChat.name}</span>
                {activeChat.verified && <VBadge color={activeChat.accent} size={14}/>}
              </div>
              <div style={{ fontSize:12, color: activeChat.online?"var(--green)":"var(--text3)" }}>{activeChat.online?t.online:t.away}</div>
            </div>
            <div style={{ display:"flex", gap:6 }}>
              <button onClick={()=>setCall({user:activeChat,type:"voice"})} style={{ background:"rgba(0,186,124,0.12)", border:"1px solid rgba(0,186,124,0.2)", borderRadius:"50%", width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="phone" size={18} color="var(--green)"/></button>
              <button onClick={()=>setCall({user:activeChat,type:"video"})} style={{ background:"var(--accent-dim)", border:"1px solid rgba(29,155,240,0.2)", borderRadius:"50%", width:38, height:38, display:"flex", alignItems:"center", justifyContent:"center" }}><Icon name="video" size={18} color="var(--accent)"/></button>
            </div>
          </div>
          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
            {chatData?.msgs.map((m, i)=>(
              <div key={i} style={{ display:"flex", justifyContent:m.from==="me"?"flex-end":"flex-start", animationDelay:`${i*0.03}s` }} className="fade-up">
                <div style={{ maxWidth:"72%", background: m.from==="me"?"var(--accent)":"var(--bg2)", borderRadius: m.from==="me"?"18px 18px 4px 18px":"18px 18px 18px 4px", padding:"10px 14px" }}>
                  <div style={{ fontSize:15, lineHeight:1.5, color: m.from==="me"?"#fff":"var(--text)" }}>{m.text}</div>
                  <div style={{ fontSize:11, color: m.from==="me"?"rgba(255,255,255,0.6)":"var(--text3)", marginTop:4, textAlign:"right" }}>{m.t}</div>
                </div>
              </div>
            ))}
            <div ref={chatEndRef}/>
          </div>
          {/* Input bar */}
          <div style={{ padding:"10px 16px", borderTop:"1px solid var(--border)", display:"flex", gap:10, alignItems:"center", background:"var(--bg)" }}>
            <div style={{ flex:1, background:"var(--bg2)", border:"1px solid var(--border)", borderRadius:24, padding:"10px 16px", display:"flex", alignItems:"center" }}>
              <input value={msgInput} onChange={e=>setMsgInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSendMsg()} placeholder={t.typeHere} style={{ flex:1, background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:15 }}/>
            </div>
            <button onClick={handleSendMsg} disabled={!msgInput.trim()} style={{ background:msgInput.trim()?"var(--accent)":"var(--bg2)", border:"none", borderRadius:"50%", width:42, height:42, display:"flex", alignItems:"center", justifyContent:"center", opacity:msgInput.trim()?1:0.4, transition:"all 0.2s" }}>
              <Icon name="send" size={18} color="#fff"/>
            </button>
          </div>
        </div>
      ); return (
      <div>
        <div style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", fontWeight:800, fontSize:20, position:"sticky", top:0, background:"rgba(0,0,0,0.9)", backdropFilter:"blur(20px)", zIndex:10 }}>{t.messages}</div>
        <div style={{ padding:"12px 16px", borderBottom:"1px solid var(--border)" }}>
          <div style={{ background:"var(--bg2)", borderRadius:24, padding:"10px 16px", display:"flex", alignItems:"center", gap:10 }}>
            <Icon name="explore" size={16} color="var(--text3)"/>
            <input placeholder={t.search} style={{ background:"none", border:"none", outline:"none", color:"var(--text)", fontSize:14, flex:1 }}/>
          </div>
        </div>
        {msgs.map((chat, i)=>{
          const u = getUser(chat.uid);
          if (!u) return null;
          const last = chat.msgs[chat.msgs.length-1];
          return (
            <div key={chat.uid} className="post-card fade-up" onClick={()=>setActiveChat(u)} style={{ padding:"14px 16px", borderBottom:"1px solid var(--border)", display:"flex", gap:12, cursor:"pointer", animationDelay:`${i*0.05}s` }}>
              <Av user={u} size={52} showDot/>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:2 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontWeight:700, fontSize:15 }}>{u.name}</span>
                    {u.verified && <VBadge color={u.accent} size={14}/>}
                  </div>
                  <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                    <span style={{ color:"var(--text3)", fontSize:12 }}>{last.t}</span>
                    <button onClick={e=>{e.stopPropagation();setCall({user:u,type:"voice"});}} style={{ background:"none", border:"none", padding:2 }}><Icon name="phone" size={16} color="var(--green)"/></button>
                    <button onClick={e=>{e.stopPropagation();setCall({user:u,type:"video"});}} style={{ background:"none", border:"none", padding:2 }}><Icon name="video" size={16} color="var(--accent)"/></button>
                  </div>
                </div>
                <div style={{ color:"var(--text3)", fontSize:14, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{last.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  const ProfilePage = () => {
    const u = meUser;
    return (
      <div>
        {/* Cover */}
        <div style={{ height:120, background:"linear-gradient(135deg,#0d1117,#1d2433,#0d1117)", position:"relative" }}>
          <div style={{ position:"absolute", bottom:-28, left:16 }}>
            <div style={{ width:72, height:72, borderRadius:"50%", background:`linear-gradient(135deg,${avatarColor(u.id)}cc,${avatarColor(u.id)}55)`, border:"3px solid var(--bg)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, fontWeight:800, color:"#fff" }}>
              {u.name.slice(0,2).toUpperCase()}
            </div>
          </div>
          <div style={{ position:"absolute", bottom:-18, right:16 }}>
            <button className="follow-btn" style={{ background:"transparent", border:"1px solid var(--border2)", borderRadius:20, padding:"7px 16px", color:"var(--text)", fontWeight:700, fontSize:14, backdropFilter:"blur(10px)" }}>{t.editProfile}</button>
          </div>
        </div>
        <div style={{ padding:"40px 16px 16px" }}>
          <div style={{ fontWeight:800, fontSize:20 }}>{u.name}</div>
          <div style={{ color:"var(--text3)", fontSize:14 }}>@{u.handle}</div>
          <div style={{ color:"var(--text2)", fontSize:14, margin:"10px 0" }}>{t.bio}</div>
          <div style={{ display:"flex", gap:20, color:"var(--text2)", fontSize:14 }}>
            <span><b style={{ color:"var(--text)" }}>0</b> {t.following}</span>
            <span><b style={{ color:"var(--text)" }}>0</b> {t.followers}</span>
          </div>
        </div>
     {/* Settings */}
        <div style={{ borderTop:"1px solid var(--border)", padding:16 }}>
          <div style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>{t.settings}</div>
        {/* Language */}
          <div style={{ marginBottom:20 }}>
            <div style={{ color:"var(--text2)", fontSize:13, marginBottom:10, display:"flex", alignItems:"center", gap:6 }}>
              <Icon name="globe" size={15} color="var(--text3)"/>{t.language}
            </div>
            <div style={{ display:"flex", gap:8 }}>
              {[["en","🇬🇧 EN"],["bn","🇧🇩 বাং"],["hi","🇮🇳 हि"]].map(([k,v])=>(
                <button key={k} onClick={()=>setLang(k)} style={{ background: lang===k?"var(--accent)":"var(--bg2)", border: lang===k?"none":"1px solid var(--border2)", borderRadius:20, padding:"7px 16px", color: lang===k?"#fff":"var(--text2)", fontWeight: lang===k?700:400, fontSize:14, transition:"all 0.2s" }}>{v}</button>
              ))}
            </div>
          </div> 
           {/* Logout */}
          <button onClick={()=>setPage("auth")} style={{ background:"rgba(244,33,46,0.1)", border:"1px solid rgba(244,33,46,0.25)", borderRadius:12, padding:"12px 20px", color:"var(--red)", fontWeight:700, fontSize:15, display:"flex", alignItems:"center", gap:10, width:"100%", transition:"background 0.15s" }}
            onMouseOver={e=>e.currentTarget.style.background="rgba(244,33,46,0.15)"} onMouseOut={e=>e.currentTarget.style.background="rgba(244,33,46,0.1)"}>
            <Icon name="logout" size={18} color="var(--red)"/>{t.logout}
          </button>
        </div>
      </div>
    );
  };
  // ───────────── BOTTOM NAV ─────────────
  const NAV = [
    { id:"home", icon:"home", iconF:"homeF" },
    { id:"explore", icon:"explore", iconF:"exploreF" },
    { id:"notifs", icon:"bell", iconF:"bellF", badge: unreadCount },
    { id:"messages", icon:"mail", iconF:"mailF" },
    { id:"profile", icon:"user", iconF:"userF" },
  ];
  return (
    <div style={{ background:"var(--bg)", minHeight:"100dvh", maxWidth:600, margin:"0 auto", position:"relative" }}>
      <style>{GLOBAL_CSS}</style>
      <CallOverlay/>
      <ComposeModal/>
    {/* Main Content */}
      <div style={{ paddingBottom:64, minHeight:"100dvh" }}>
        {tab==="home" && <HomePage/>}
        {tab==="explore" && <ExplorePage/>}
        {tab==="notifs" && <NotifsPage/>}
        {tab==="messages" && <MsgsPage/>}
        {tab==="profile" && <ProfilePage/>}
      </div>
    {/* Bottom Nav */}
      <div style={{ position:"fixed", bottom:0, left:"50%", transform:"translateX(-50%)", width:"100%", maxWidth:600, height:60, background:"rgba(0,0,0,0.95)", backdropFilter:"blur(24px)", borderTop:"1px solid var(--border)", display:"flex", alignItems:"center", zIndex:100 }}>
        {NAV.map(n=>{
          const active = tab===n.id;
          return (
            <button key={n.id} className="nav-tab" onClick={()=>setTab(n.id)} style={{ flex:1, height:"100%", background:"none", border:"none", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", borderRadius:0 }}>
              <Icon name={active?n.iconF:n.icon} size={24} color={active?"var(--text)":"var(--text3)"}/>
              {n.badge>0 && (
                <div style={{ position:"absolute", top:10, right:"calc(50% - 18px)", background:"var(--accent)", borderRadius:10, minWidth:16, height:16, fontSize:10, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", padding:"0 4px", border:"2px solid var(--bg)" }}>{n.badge}</div>
              )}
            </button>
          );
        })}
      </div>
   {/* FAB */}
      {tab==="home" && !showCompose && (
        <button onClick={()=>setShowCompose(true)} style={{ position:"fixed", bottom:76, right:"max(16px, calc(50% - 284px))", width:52, height:52, background:"var(--accent)", border:"none", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, boxShadow:"0 4px 20px rgba(29,155,240,0.35)", transition:"transform 0.15s" }}
          onMouseOver={e=>e.currentTarget.style.transform="scale(1.06)"} onMouseOut={e=>e.currentTarget.style.transform="scale(1)"}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>
        </button>
      )}
    </div>
  );
       }       
───
