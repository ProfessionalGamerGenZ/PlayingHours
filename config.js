// PlayingHours - Supabase Configuration
const SUPABASE_URL = 'https://chcepamgczwfguzroddn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoY2VwYW1nY3p3Zmd1enJvZGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1NTQxODgsImV4cCI6MjA1NDEzMDE4OH0.ojtRcp7dUNGMlon33jkKuw_gYzkSLPM';

// Initialize Supabase client
let supabase;
if(typeof window.supabase !== 'undefined'){
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  console.log('✅ Supabase initialized from config.js');
} else {
  console.error('❌ Supabase library not loaded. Make sure CDN is included.');
}

// Helper: Get current user
function getCurrentUser(){
  return {
    id: localStorage.getItem('userId'),
    username: localStorage.getItem('username') || 'Player',
    coins: parseInt(localStorage.getItem('coins')) || 0,
    isGuest: localStorage.getItem('isGuest') === 'true',
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true'
  };
}

// Helper: Check auth
function checkAuth(){
  const user = getCurrentUser();
  if(!user.isLoggedIn){
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}

// Helper: Logout
function logout(){
  if(confirm('Are you sure you want to logout?')){
    localStorage.clear();
    window.location.href = 'index.html';
  }
}

console.log('📝 Config loaded - URL:', SUPABASE_URL);
