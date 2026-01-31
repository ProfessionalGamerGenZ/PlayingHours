// GLOBAL THEME LOADER - Include in ALL pages
(function(){
const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
})();
