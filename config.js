// Supabase Configuration for PlayingHours
// Location: Root directory (same level as index.html)

const SUPABASE_URL = 'https://pnvhciuclghgbweltttt.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBudmhjaXVjbGdoZ2J3ZWx0dHR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzc5NjU5MTksImV4cCI6MjA1MzU0MTkxOX0.eNigOtFRljKSNF0hIsdD4A_reAnOnre';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Helper function to get current user from localStorage
function getCurrentUser(){
  return {
    id: localStorage.getItem('userId'),
    username: localStorage.getItem('username'),
    coins: parseInt(localStorage.getItem('coins')) || 0,
    isGuest: localStorage.getItem('isGuest') === 'true',
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true'
  };
}

// Helper function to check auth
function checkAuth(){
  const user = getCurrentUser();
  if(!user.isLoggedIn){
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}

// Helper function to logout
function logout(){
  localStorage.clear();
  window.location.href = 'index.html';
}

console.log('✅ Supabase configured successfully!');
