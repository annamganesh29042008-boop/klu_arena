const AUTH_USER_KEY = 'kluArenaUser';
const AUTH_SESSION_KEY = 'kluArenaLoggedIn';
const AUTH_ID_KEY = 'kluArenaLoginId';
const AUTH_NOTIFICATION_SEEN_KEY = 'kluArenaAnnouncementsSeen';
const KLU_ID_MIN = 2500030000;
const KLU_ID_MAX = 2500199999;

function normalizeStudentId(id){ return String(id || '').trim(); }
function isValidStudentId(id){
  const value = normalizeStudentId(id);
  return /^\d{10}$/.test(value) && Number(value) >= KLU_ID_MIN && Number(value) <= KLU_ID_MAX;
}
function getStudentIdError(){ return 'ID not found.'; }

async function findUserByStudentId(id){
  const normalizedId = normalizeStudentId(id);
  if(!isValidStudentId(normalizedId)) return null;
  const db = getFirebaseDb();
  const idSnap = await db.collection('studentIds').doc(normalizedId).get();
  if(!idSnap.exists) return null;
  const uid = idSnap.data().uid;
  if(!uid) return null;
  const userSnap = await db.collection('users').doc(uid).get();
  if(!userSnap.exists) return null;
  const data = userSnap.data() || {};
  return { uid, name:data.name || '', id:normalizedId, email:(data.email || '').toLowerCase(), category:data.category || '' };
}

function firebaseReady(){
  return typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0;
}
function getFirebaseAuth(){ if(!firebaseReady()) throw new Error('Firebase is not ready. Please refresh and try again.'); return firebase.auth(); }
function getFirebaseDb(){ if(!firebaseReady()) throw new Error('Firebase is not ready. Please refresh and try again.'); return firebase.firestore(); }

function publicUser(user){
  if(!user) return null;
  return {
    uid: user.uid,
    name: user.name || user.displayName || '',
    id: normalizeStudentId(user.id || ''),
    email: (user.email || '').toLowerCase(),
    category: user.category || ''
  };
}
function cacheUser(user){
  const safe = publicUser(user);
  if(!safe) return;
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(safe));
  localStorage.setItem(AUTH_ID_KEY, safe.email || safe.id || '');
}
function getActiveUser(){
  try {
    const cached = JSON.parse(localStorage.getItem(AUTH_USER_KEY) || 'null');
    if(cached) return cached;
  } catch {}
  const current = firebaseReady() ? firebase.auth().currentUser : null;
  return current ? {uid:current.uid,name:current.displayName || '',email:(current.email || '').toLowerCase()} : null;
}
function isLoggedIn(){
  // Firebase is the source of truth. Local storage is only a profile/UI cache.
  return firebaseReady() && !!firebase.auth().currentUser;
}
async function setPersistence(remember){
  const auth = getFirebaseAuth();
  await auth.setPersistence(remember ? firebase.auth.Auth.Persistence.LOCAL : firebase.auth.Auth.Persistence.SESSION);
}
function mapFirebaseError(error){
  const code = error && error.code || '';
  const messages = {
    'auth/email-already-in-use':'An account already exists with this email. Please login instead.',
    'auth/invalid-email':'Please enter a valid email address.',
    'auth/weak-password':'Password must be at least 6 characters.',
    'auth/invalid-credential':'Incorrect email or password.',
    'auth/user-not-found':'No account found with this email.',
    'auth/wrong-password':'Incorrect email or password.',
    'auth/too-many-requests':'Too many attempts. Please wait and try again.',
    'auth/network-request-failed':'Network error. Check your internet connection and try again.'
  };
  const message = messages[code] || (error && error.message) || 'Authentication failed. Please try again.';
  const e = new Error(message);
  e.code = code;
  return e;
}

async function createAccount({name,id,email,category,password}){
  const normalizedId = normalizeStudentId(id);
  const normalizedEmail = email.trim().toLowerCase();
  if(!isValidStudentId(normalizedId)){ const error=new Error('ID not found.'); error.code='INVALID_ID'; throw error; }
  if(!category){ const error=new Error('Please choose your arena.'); error.code='INVALID_CATEGORY'; throw error; }
  if(!password || password.length < 6){ const error=new Error('Password must be at least 6 characters.'); error.code='WEAK_PASSWORD'; throw error; }

  const auth = getFirebaseAuth();
  const db = getFirebaseDb();
  let credential = null;

  // Check the Student ID before creating the Auth user so duplicate IDs fail early.
  const existingId = await db.collection('studentIds').doc(normalizedId).get();
  if(existingId.exists){ const error=new Error('An account already exists with this Student ID. Please login instead.'); error.code='ID_EXISTS'; throw error; }

  try {
    credential = await auth.createUserWithEmailAndPassword(normalizedEmail, password);
    const user = credential.user;
    await user.updateProfile({displayName:name.trim()});

    const batch = db.batch();
    batch.set(db.collection('users').doc(user.uid), {
      name:name.trim(),
      studentId:normalizedId,
      email:normalizedEmail,
      category,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    batch.set(db.collection('studentIds').doc(normalizedId), {
      uid:user.uid,
      createdAt:firebase.firestore.FieldValue.serverTimestamp()
    });
    await batch.commit();

    const profile = {uid:user.uid,name:name.trim(),id:normalizedId,email:normalizedEmail,category};
    cacheUser(profile);
    localStorage.setItem(AUTH_SESSION_KEY,'true');
    localStorage.removeItem(AUTH_NOTIFICATION_SEEN_KEY);
    return profile;
  } catch(error) {
    if(credential && credential.user) {
      try { await credential.user.delete(); } catch {}
    }
    if(error && error.code === 'permission-denied'){
      const e=new Error('This Student ID is already registered, or your Firebase security rules need to be published.'); e.code='ID_EXISTS'; throw e;
    }
    if(error && error.code === 'auth/email-already-in-use') throw mapFirebaseError(error);
    throw error && error.code && String(error.code).startsWith('auth/') ? mapFirebaseError(error) : error;
  }
}

async function loginAccount(identifier,password,remember){
  const normalized = identifier.trim().toLowerCase();
  if(/^\d+$/.test(normalized)){
    throw new Error('Please use your registered email address to log in. Student ID login will be added in the next database phase.');
  }
  if(!normalized) throw new Error('Enter your email address.');
  if(!password) throw new Error('Enter your password.');

  const auth = getFirebaseAuth();
  try {
    await setPersistence(remember);
    const credential = await auth.signInWithEmailAndPassword(normalized,password);
    const user = credential.user;
    let profile = {uid:user.uid,name:user.displayName || '',id:'',email:(user.email || normalized).toLowerCase(),category:''};

    try {
      const snap = await getFirebaseDb().collection('users').doc(user.uid).get();
      if(snap.exists){
        const data=snap.data();
        profile={uid:user.uid,name:data.name || profile.name,id:normalizeStudentId(data.studentId || ''),email:data.email || profile.email,category:data.category || ''};
      }
    } catch {}

    cacheUser(profile);
    localStorage.setItem(AUTH_SESSION_KEY,'true');
    localStorage.removeItem(AUTH_NOTIFICATION_SEEN_KEY);
    return profile;
  } catch(error){ throw mapFirebaseError(error); }
}

async function requestPasswordReset(identifier){
  const normalized = identifier.trim().toLowerCase();
  if(!normalized) throw new Error('Enter your email address.');
  if(/^\d+$/.test(normalized)) throw new Error('Please enter the email address linked to your KLU Arena account.');

  try {
    await getFirebaseAuth().sendPasswordResetEmail(normalized);
    return {sent:true,email:normalized};
  } catch(error){ throw mapFirebaseError(error); }
}

async function logoutAccount(){
  try {
    if(firebaseReady()) await firebase.auth().signOut();
  } catch(error) {
    // Clear local UI state even if the network is temporarily unavailable.
  }
  localStorage.removeItem(AUTH_SESSION_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_ID_KEY);
  localStorage.removeItem(AUTH_NOTIFICATION_SEEN_KEY);
  sessionStorage.removeItem(AUTH_SESSION_KEY);
  sessionStorage.removeItem(AUTH_USER_KEY);
}

function requireLogin(next = location.pathname.split('/').pop() || 'index.html'){
  if(isLoggedIn()) return true;
  location.href = 'login.html?next=' + encodeURIComponent(next);
  return false;
}

if(firebaseReady()){
  firebase.auth().onAuthStateChanged(user => {
    if(!user){
      localStorage.removeItem(AUTH_SESSION_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_ID_KEY);
    }
    window.dispatchEvent(new CustomEvent('kluArenaAuthChanged',{detail:{user}}));
  });
}

window.KLUArenaAuth = {
  createAccount,
  loginAccount,
  logoutAccount,
  requestPasswordReset,
  isLoggedIn,
  getActiveUser,
  isValidStudentId,
  getStudentIdError,
  findUserByStudentId,
  KLU_ID_MIN,
  KLU_ID_MAX,
  requireLogin
};
