// Supabase Configuration - UPDATED
const SUPABASE_URL = 'https://chcepamgczwfguzroddn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoY2VwYW1nY3p3Zmd1enJvZGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1NTQxODgsImV4cCI6MjA1NDEzMDE4OH0.ojtRcp7dUNGMlon33jkKuw_gYzkSLPM';

// Initialize Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper: Get current user
function getCurrentUser(){
  return {
    id: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
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

console.log('✅ Supabase connected:', SUPABASE_URL);
