const AUTH_ACCOUNTS_KEY = 'kluArenaAccounts';
const AUTH_SESSION_KEY = 'kluArenaLoggedIn';
const AUTH_ID_KEY = 'kluArenaLoginId';
const AUTH_USER_KEY = 'kluArenaUser';

function getAccounts(){
  try {
    const accounts = JSON.parse(localStorage.getItem(AUTH_ACCOUNTS_KEY) || '[]');
    if(Array.isArray(accounts)) return accounts;
  } catch {}
  return [];
}
function saveAccounts(accounts){ localStorage.setItem(AUTH_ACCOUNTS_KEY, JSON.stringify(accounts)); }
function getActiveUser(){
  const sessionUser = sessionStorage.getItem(AUTH_USER_KEY);
  const persistentUser = localStorage.getItem(AUTH_USER_KEY);
  try { return JSON.parse(sessionUser || persistentUser || 'null'); } catch { return null; }
}
function isLoggedIn(){
  return sessionStorage.getItem(AUTH_SESSION_KEY) === 'true' || localStorage.getItem(AUTH_SESSION_KEY) === 'true';
}
async function hashPassword(password){
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
async function createAccount({name,id,email,category,password}){
  const normalizedId = id.trim().toLowerCase();
  const normalizedEmail = email.trim().toLowerCase();
  const accounts = getAccounts();
  if(accounts.some(user => user.email === normalizedEmail || user.id === normalizedId)) throw new Error('An account with this email or student ID already exists.');
  const user = {name:name.trim(),id:normalizedId,email:normalizedEmail,category,passwordHash:await hashPassword(password)};
  accounts.push(user); saveAccounts(accounts); setLogin(user,true); return user;
}
function setLogin(user,remember){
  const storage = remember ? localStorage : sessionStorage;
  storage.setItem(AUTH_USER_KEY,JSON.stringify(user)); storage.setItem(AUTH_SESSION_KEY,'true'); localStorage.setItem(AUTH_ID_KEY,user.email);
  if(remember){ sessionStorage.removeItem(AUTH_USER_KEY); sessionStorage.removeItem(AUTH_SESSION_KEY); }
}
async function loginAccount(identifier,password,remember){
  const normalized = identifier.trim().toLowerCase();
  const user = getAccounts().find(account => account.email === normalized || account.id === normalized);
  if(!user) throw new Error('No account found for that email or student ID.');
  if(user.passwordHash !== await hashPassword(password)) throw new Error('Incorrect password.');
  setLogin(user,remember); return user;
}
async function resetPassword(identifier,newPassword){
  const normalized = identifier.trim().toLowerCase(); const accounts = getAccounts();
  const index = accounts.findIndex(account => account.email === normalized || account.id === normalized);
  if(index === -1) throw new Error('No account found for that email or student ID.');
  accounts[index].passwordHash = await hashPassword(newPassword); saveAccounts(accounts);
}
function logoutAccount(){
  localStorage.removeItem(AUTH_SESSION_KEY); localStorage.removeItem(AUTH_USER_KEY); localStorage.removeItem(AUTH_ID_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY); sessionStorage.removeItem(AUTH_USER_KEY);
}
function requireLogin(next = location.pathname.split('/').pop() || 'index.html'){
  if(isLoggedIn()) return true;
  location.href = 'login.html?next=' + encodeURIComponent(next); return false;
}
window.KLUArenaAuth = {createAccount,loginAccount,logoutAccount,resetPassword,isLoggedIn,getActiveUser,requireLogin};
