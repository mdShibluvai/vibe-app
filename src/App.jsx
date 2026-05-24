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
  button { cursor: pointer; }

  /* Animations */
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
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

  .fade-up { animation: fadeUp 0.35s ease forwards; }
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
`;

/* ─────────────────────────────────────────────────────────────
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
   MAIN APP
───────────────────────────────────────────────────────────── */
export default function App() {
  const [lang, setLang] = useState("bn");
  const [page, setPage] = useState("auth"); // auth | main
  const [authMode, setAuthMode] = useState("signin");
  const [tab,
