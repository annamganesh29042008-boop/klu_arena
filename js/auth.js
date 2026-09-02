const AUTH_USER_KEY = 'kluArenaUser';
const AUTH_SESSION_KEY = 'kluArenaLoggedIn';
const AUTH_ID_KEY = 'kluArenaLoginId';

function getStoredUser(){
  try { return JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null'); }
  catch { return null; }
}

function getActiveUser(){
  const sessionUser = sessionStorage.getItem(AUTH_USER_KEY);
  const persistentUser = localStorage.getItem(AUTH_USER_KEY);
  try { return JSON.parse(sessionUser || persistentUser || 'null'); }
  catch { return null; }
}

function isLoggedIn(){
  return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true' || localStorage.getItem(AUTH_SESSION_KEY) === 'true';
}

async function hashPassword(password){
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function createAccount({name, id, email, category, password}){
  const normalizedId = id.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const existing = getStoredUser();
  if(existing && (existing.email === normalizedEmail || existing.id === normalizedId)){
    throw new Error('An account with this email or student ID already exists.');
  }

  const user = {
    name: name.trim(),
    id: normalizedId,
    email: normalizedEmail,
    category,
    passwordHash: await hashPassword(password)
  };
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_SESSION_KEY, 'true');
  localStorage.setItem(AUTH_ID_KEY, normalizedEmail);
  return user;
}

async function loginAccount(identifier, password, remember){
  const user = getStoredUser();
  if(!user) throw new Error('No account found. Please create an account first.');

  const normalized = identifier.trim().toLowerCase();
  const matches = normalized === user.email || normalized === user.id;
  const passwordMatches = matches && user.passwordHash === await hashPassword(password);
  if(!passwordMatches) throw new Error('Invalid email/student ID or password.');

  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  storage.setItem(AUTH_SESSION_KEY, 'true');
  localStorage.setItem(AUTH_ID_KEY, normalized);
  return user;
}

function logoutAccount(){
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(AUTH_ID_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function requireLogin(next = location.pathname.split('/').pop() || 'index.html'){
  if(isLoggedIn()) return true;
  location.href = 'login.html?next=' + encodeURIComponent(next);
  return false;
}

function showLoggedInState(){
  if(!isLoggedIn()) return;
  const user = getActiveUser();
  qsa('[data-auth-name]').forEach(el => el.textContent = user?.name || 'Player');
  qsa('[data-auth-only]').forEach(el => el.hidden = false);
  qsa('[data-login-only]').forEach(el => el.hidden = true);
}

window.KLUArenaAuth = {createAccount, loginAccount, logoutAccount, isLoggedIn, getActiveUser, requireLogin};
