const K={users:'kluArenaV2.users',session:'kluArenaV2.session',tournaments:'kluArenaV2.tournaments',announcements:'kluArenaV2.announcements'};
const read=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))??d}catch{return d}};
const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
export const getUsers=()=>read(K.users,[]);
export const getTournaments=()=>read(K.tournaments,[]);
export const getAnnouncements=()=>read(K.announcements,[]);
export const getSession=()=>read(K.session,null);
export const saveTournaments=v=>write(K.tournaments,v);
export const saveAnnouncements=v=>write(K.announcements,v);
const admins=(import.meta.env.VITE_ADMIN_EMAILS||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
const hash=async p=>{if(!crypto?.subtle)throw Error('Secure hashing unavailable. Run on localhost or HTTPS.');const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(p));return [...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
export const toPublicUser=u=>{if(!u)return null;const {passwordHash,...safe}=u;return safe};
export async function registerUser({name,email,password,studentId=''}){const e=email.trim().toLowerCase(),users=getUsers();if(name.trim().length<2)throw Error('Enter your full name.');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))throw Error('Enter a valid email.');if(password.length<8)throw Error('Password must have at least 8 characters.');if(users.some(u=>u.email===e))throw Error('An account with this email already exists.');const id=crypto.randomUUID(),u={id,name:name.trim(),email:e,studentId:studentId.trim(),role:admins.includes(e)?'admin':'user',active:true,createdAt:new Date().toISOString(),passwordHash:await hash(password)};write(K.users,[...users,u]);write(K.session,{userId:id,signedInAt:new Date().toISOString()});return toPublicUser(u)}
export async function loginUser(email,password){const e=email.trim().toLowerCase(),u=getUsers().find(x=>x.email===e);if(!u||u.passwordHash!==await hash(password))throw Error('Email or password is incorrect.');if(!u.active)throw Error('This account is disabled. Contact an administrator.');write(K.session,{userId:u.id,signedInAt:new Date().toISOString()});return toPublicUser(u)}
export function getCurrentUser(){const s=getSession();if(!s)return null;const u=getUsers().find(x=>x.id===s.userId);return u?.active?toPublicUser(u):null}
export const logoutUser=()=>localStorage.removeItem(K.session);
export function updateUserStatus(id,active){const users=getUsers().map(u=>u.id===id?{...u,active}:u);write(K.users,users);return users.map(toPublicUser)}
export function addTournament(item){const next={id:crypto.randomUUID(),...item,createdAt:new Date().toISOString()};write(K.tournaments,[next,...getTournaments()]);return next}
export function addAnnouncement(item){const next={id:crypto.randomUUID(),...item,createdAt:new Date().toISOString()};write(K.announcements,[next,...getAnnouncements()]);return next}