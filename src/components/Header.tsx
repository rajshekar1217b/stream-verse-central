
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Bell, User, ChevronDown, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();

  // Check if currently on admin page
  const isAdminPage = location.pathname.startsWith('/admin');

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header 
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/90 backdrop-blur-sm py-2' : 'bg-gradient-to-b from-black/80 to-transparent py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo and Navigation */}
        <div className="flex items-center">
          <Link to="/" className="mr-8">
            <h1 className="text-2xl font-bold text-ott-accent">StreamVerse</h1>
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link to="/" className="text-sm hover:text-white">Home</Link>
            <Link to="/movies" className="text-sm hover:text-white">Movies</Link>
            <Link to="/tv-shows" className="text-sm hover:text-white">TV Shows</Link>
            <Link to="/categories" className="text-sm hover:text-white">Categories</Link>
            {isAuthenticated && (
              <Link to="/admin" className="text-sm hover:text-white">Admin</Link>
            )}
          </nav>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        
        {/* Search, Notifications, and Profile */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <Input
                  type="text"
                  placeholder="Search titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/60 border-gray-700 text-sm w-44 h-9"
                  autoFocus
                />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setSearchOpen(false)}
                  className="text-gray-400"
                >
                  ✕
                </Button>
              </form>
            ) : (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setSearchOpen(true)}
                className="text-gray-300 hover:text-white"
              >
                <Search size={20} />
              </Button>
            )}
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white">
            <Bell size={20} />
          </Button>
          
          {/* Profile */}
          <div className="relative group">
            <Button variant="ghost" className="flex items-center space-x-1 p-1 text-gray-300 hover:text-white">
              <div className="w-7 h-7 rounded-sm bg-ott-accent flex items-center justify-center">
                <User size={18} />
              </div>
              <ChevronDown size={16} />
            </Button>
            
            {/* Profile Dropdown */}
            <div className="absolute right-0 top-full w-48 mt-1 bg-ott-card rounded-md shadow-lg overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
              <div className="py-2">
                <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-white/10">Profile</Link>
                <Link to="/settings" className="block px-4 py-2 text-sm hover:bg-white/10">Settings</Link>
                {isAuthenticated ? (
                  <button 
                    onClick={logout} 
                    className="w-full text-left px-4 py-2 text-sm hover:bg-white/10"
                  >
                    Log Out
                  </button>
                ) : (
                  <Link to="/admin-login" className="block px-4 py-2 text-sm hover:bg-white/10">Admin Login</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-black absolute top-full left-0 right-0 p-4 border-t border-gray-800">
          <nav className="flex flex-col space-y-3">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/movies" className="hover:text-white">Movies</Link>
            <Link to="/tv-shows" className="hover:text-white">TV Shows</Link>
            <Link to="/categories" className="hover:text-white">Categories</Link>
            {isAuthenticated && (
              <Link to="/admin" className="hover:text-white">Admin</Link>
            )}
            
            <div className="pt-2 border-t border-gray-800">
              <form onSubmit={handleSearchSubmit} className="flex mb-3">
                <Input
                  type="text"
                  placeholder="Search titles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-black/60 border-gray-700 mr-2"
                />
                <Button type="submit">Search</Button>
              </form>
              
              <Link to="/profile" className="block py-2">Profile</Link>
              <Link to="/settings" className="block py-2">Settings</Link>
              
              {isAuthenticated ? (
                <button onClick={logout} className="w-full text-left py-2">
                  Log Out
                </button>
              ) : (
                <Link to="/admin-login" className="block py-2">Admin Login</Link>
              )}
            </div>
          </nav>
        </div>
      )}
      
      {/* Admin Warning Banner */}
      {isAdminPage && isAuthenticated && (
        <div className="bg-amber-500 text-black py-1 text-center text-sm">
          You are currently in Admin Mode
        </div>
      )}
    </header>
  );
};

export default Header;
