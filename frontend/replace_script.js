const fs = require('fs');
let content = fs.readFileSync('src/assets/dummyStyles.js', 'utf8');
const lines = content.split('\n');

const start = 598; // 0-indexed line 599 is 598
const end = 739;   // 0-indexed line 739 is 738, but slice is exclusive

const newStyles = `export const navbarStyles = {
  // Main container
  navbarContainer: "fixed top-0 w-full z-50 bg-white/60 backdrop-blur-2xl border-b border-white/80 shadow-[0_4px_30px_rgba(0,0,0,0.05)] transition-transform duration-500",
  navbarHidden: "-translate-y-full",
  navbarVisible: "translate-y-0",
  
  // Border animation
  navbarBorder: "navbar-border",
  
  // Content wrapper
  contentWrapper: "max-w-7xl font-sans mx-auto px-4 sm:px-6 lg:px-8",
  flexContainer: "flex items-center justify-between gap-6 py-4",
  
  // Logo section
  logoLink: "shrink-0 hover:scale-105 transition-transform duration-300",
  logoShell: "flex items-center gap-3 rounded-2xl border border-white/50 bg-white/40 px-4 py-2 shadow-[0_8px_16px_rgba(0,0,0,0.03)]",
  logoContainer: "relative group h-12 w-12 rounded-xl bg-linear-to-br from-indigo-50 via-white to-purple-50",
  logoImageWrapper: "relative flex items-center justify-center overflow-hidden h-full w-full rounded-xl",
  logoImage: "w-10 h-10 object-contain drop-shadow-md",
  logoTextContainer: "hidden sm:block",
  logoTitle: "text-2xl leading-none font-extrabold bg-clip-text text-transparent bg-linear-to-r from-indigo-600 via-purple-600 to-indigo-800 tracking-tight",
  logoSubtitle: "mt-1 text-[0.7rem] font-medium tracking-wider text-slate-500 uppercase",
  
  // Desktop navigation
  desktopNav: "hidden flex-1 justify-center lg:flex",
  navItemsContainer: "flex items-center gap-2 rounded-full border border-white/40 bg-white/50 p-1.5 shadow-[0_8px_16px_rgba(0,0,0,0.04)] backdrop-blur-md",
  navItem: "nav-item px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
  navItemActive: "active text-indigo-700",
  navItemInactive: "text-slate-600 hover:text-indigo-600 hover:bg-white/60",
  
  // Right side
  rightContainer: "flex items-center gap-4 shrink-0",
  
  // Signed out buttons
  doctorAdminButton: "hidden lg:inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-700 hover:text-indigo-700 hover:bg-indigo-50/50 transition-all duration-300",
  doctorAdminIcon: "w-4 h-4",
  doctorAdminText: "whitespace-nowrap",
  loginButton: "hidden lg:flex text-sm items-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white px-6 py-2.5 rounded-full font-semibold shadow-lg hover:shadow-indigo-500/30 hover:scale-105 transition-all duration-300",
  loginIcon: "w-4 h-4",
  
  // Mobile toggle
  mobileToggle: "lg:hidden rounded-full border border-white/50 bg-white/50 p-2.5 shadow-sm hover:bg-indigo-50 transition-colors",
  toggleIcon: "w-6 h-6 text-slate-800",
  
  // Mobile menu
  mobileMenu: "mobile-menu lg:hidden mt-4 space-y-2 rounded-3xl border border-white/60 bg-white/80 backdrop-blur-2xl p-4 shadow-2xl",
  mobileMenuItem: "block px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300",
  mobileMenuItemActive: "bg-indigo-50 text-indigo-700 shadow-sm",
  mobileMenuItemInactive: "text-slate-600 hover:bg-slate-50 hover:text-indigo-600",
  
  // Mobile signed out buttons
  mobileDoctorAdminButton: "w-full flex items-center justify-center gap-2 py-3.5 mt-2 rounded-2xl border border-white/60 bg-white text-sm font-semibold text-slate-700 hover:bg-indigo-50 transition-all",
  mobileLoginContainer: "w-full mt-3",
  mobileLoginButton: "w-full flex items-center justify-center gap-2 bg-linear-to-r from-indigo-600 to-purple-600 text-white py-3.5 rounded-2xl font-semibold shadow-md hover:shadow-lg transition-all",
  
  // Animation styles
  animationStyles: \`
    @keyframes borderFlow {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .navbar-border {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 3px;
      z-index: 51;
      background: linear-gradient(90deg, #4f46e5, #9333ea, #3b82f6, #4f46e5);
      background-size: 300% 100%;
      animation: borderFlow 4s ease infinite;
    }
    .nav-item {
      position: relative;
      overflow: hidden;
    }
    .nav-item.active {
      background: rgba(255, 255, 255, 0.8) !important;
      box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);
    }
    .nav-item.active::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 15%;
      width: 70%;
      height: 3px;
      background: linear-gradient(90deg, #4f46e5, #9333ea);
      border-radius: 9999px;
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .mobile-menu {
      animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      transform-origin: top;
    }
  \`
};`;

lines.splice(start, end - start, newStyles);
fs.writeFileSync('src/assets/dummyStyles.js', lines.join('\n'), 'utf8');
console.log('Replaced successfully');
