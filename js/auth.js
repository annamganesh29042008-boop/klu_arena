const AUTH_ACCOUNTS_KEY = 'kluArenaAccounts';
const AUTH_SESSION_KEY = 'kluArenaLoggedIn';
const AUTH_ID_KEY = 'kluArenaLoginId';
const AUTH_USER_KEY = 'kluArenaUser';
const AUTH_NOTIFICATION_SEEN_KEY = 'kluArenaAnnouncementsSeen';
const RESET_STATE_KEY = 'kluArenaPasswordReset';
const RESET_CODE_TTL = 10 * 60 * 1000;
const RESET_MAX_ATTEMPTS = 5;

function getAccounts(){
  try { const accounts = JSON.parse(localStorage.getItem(AUTH_ACCOUNTS_KEY) || '[]'); if(Array.isArray(accounts)) return accounts; }
  catch {}
  return [];
}
function saveAccounts(accounts){ localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts)); }
function publicUser(user){ if(!user) return null; const {passwordHash,...safeUser} = user; return safeUser; }
function getActiveUser(){
  const sessionUser = sessionStorage.getItem(AUTH_USER_KEY);
  const persistentUser = localStorage.getItem(AUTH_USER_KEY);
  try { return JSON.parse(sessionUser || persistentUser || 'null'); } catch { return null; }
}
function isLoggedIn(){ return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true' || localStorage.getItem(AUTH_SESSION_KEY) === 'true'; }
async function hashPassword(password){
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
function randomCode(){ return String(Math.floor(100000 + Math.random() * 900000)); }
function randomToken(){ return `${Date.now().toString(36)}-${crypto.getRandomValues(new Uint32Array(2)).join('-')}`; }
function getResetState(){
  try { return JSON.parse(sessionStorage.getItem(RESET_STATE_KEY) || 'null'); } catch { return null; }
}
function saveResetState(state){ sessionStorage.setItem(RESET_STATE_KEY, JSON.stringify(state)); }
function clearResetState(){ sessionStorage.removeItem(RESET_STATE_KEY); }

async function createAccount({name,id,email,category,password}){
  const normalizedId = id.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getAccounts();
  if(accounts.some(user => user.email === normalizedEmail || user.id === normalizedId)) throw new Error('An account with this email or student ID already exists.');
  const user = {name:name.trim(),id:normalizedId,email:normalizedEmail,category,passwordHash:await hashPassword(password)};
  accounts.push(user); saveAccounts(accounts); setLogin(user,true); return publicUser(user);
}
function setLogin(user,remember){
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(AUTH_USER_KEY,JSON.stringify(publicUser(user)));
  storage.setItem(AUTH_SESSION_KEY,'true');
  localStorage.setItem(AUTH_ID_KEY,user.email);
  localStorage.removeItem(AUTH_NOTIFICATION_SEEN_KEY);
  if(remember){ sessionStorage.removeItem(AUTH_USER_KEY); sessionStorage.removeItem(AUTH_SESSION_KEY); }
}
async function loginAccount(identifier,password,remember){
  const normalized = identifier.trim().toLowerCase();
  const user = getAccounts().find(account => account.email === normalized || account.id === normalized);
  if(!user) throw new Error('No account found for that email or student ID.');
  if(user.passwordHash !== await hashPassword(password)) throw new Error('Incorrect password.');
  setLogin(user,remember); return publicUser(user);
}

function requestPasswordReset(identifier){
  const normalized = identifier.trim().toLowerCase();
  if(!normalized) throw new Error('Enter your email or student ID.');
  const user = getAccounts().find(account => account.email === normalized || account.id === normalized);
  if(!user) throw new Error('No account found for that email or student ID.');
  const state = {identifier:normalized, code:randomCode(), expiresAt:Date.now()+RESET_CODE_TTL, attempts:0, verified:false, token:null};
  saveResetState(state);
  return {maskedDestination: user.email.replace(/^(.{2}).*(@.*)$/, '$1••••$2'), demoCode:state.code, expiresAt:state.expiresAt};
}

function verifyPasswordResetCode(code){
  const state = getResetState();
  if(!state) throw new Error('Your reset request has expired. Start again.');
  if(Date.now() > state.expiresAt){ clearResetState(); throw new Error('Verification code expired. Request a new code.'); }
  if(state.attempts >= RESET_MAX_ATTEMPTS) throw new Error('Too many incorrect attempts. Request a new code.');
  if(String(code).trim() !== state.code){
    state.attempts += 1; saveResetState(state);
    const remaining = RESET_MAX_ATTEMPTS - state.attempts;
    throw new Error(remaining ? `Incorrect verification code. ${remaining} attempts remaining.` : 'Too many incorrect attempts. Request a new code.');
  }
  state.verified = true; state.token = randomToken(); state.code = null; saveResetState(state);
  return {token:state.token};
}

async function resetPassword(identifier,newPassword,resetToken){
  const normalized = identifier.trim().toLowerCase();
  const state = getResetState();
  if(!state || state.identifier !== normalized || !state.verified || !state.token || state.token !== resetToken) throw new Error('Verify the code before creating a new password.');
  if(!newPassword || newPassword.length < 8) throw new Error('Password must be at least 8 characters.');
  const accounts = getAccounts();
  const index = accounts.findIndex(account => account.email === normalized || account.id === normalized);
  if(index === -1) throw new Error('No account found for that email or student ID.');
  accounts[index].passwordHash = await hashPassword(newPassword);
  saveAccounts(accounts);
  clearResetState();
  // End any active local session after a credential change.
  logoutAccount();
}
function logoutAccount(){
  localStorage.removeItem(AUTH_SESSION_KEY); localStorage.removeItem(AUTH_USER_KEY); localStorage.removeItem(AUTH_ID_KEY); localStorage.removeItem(AUTH_NOTIFICATION_SEEN_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY); sessionStorage.removeItem(AUTH_USER_KEY);
}
function requireLogin(next = location.pathname.split('/').pop() || 'index.html'){
  if(isLoggedIn()) return true;
  location.href = 'login.html?next=' + encodeURIComponent(next); return false;
}
window.KLUArenaAuth = {createAccount,loginAccount,logoutAccount,requestPasswordReset,verifyPasswordResetCode,resetPassword,isLoggedIn,getActiveUser,requireLogin};
