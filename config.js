// Supabase Configuration
const SUPABASE_CONFIG = {
  url: 'https://chcepamgczwfguzroddn.supabase.co',
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNoY2VwYW1nY3p3Zmd1enJvZGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg1NTQxODgsImV4cCI6MjA1NDEzMDE4OH0.ojtRcp7dUNGMlon33jkKuw_gYzkSLPM'
};

function getCurrentUser(){
  return {
    id: localStorage.getItem('userId'),
    username: localStorage.getItem('username') || 'Player',
    coins: parseInt(localStorage.getItem('coins')) || 0,
    isLoggedIn: localStorage.getItem('isLoggedIn') === 'true'
  };
}

function checkAuth(){
  const user = getCurrentUser();
  if(!user.isLoggedIn){
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}

function logout(){
  if(confirm('Are you sure you want to logout?')){
    localStorage.clear();
    window.location.href = 'index.html';
  }
}
