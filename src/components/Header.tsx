
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 0) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Close mobile menu when navigating
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const navigateToAdmin = () => {
    navigate('/admin-login');
  };

  return (
    <header
      className={`fixed w-full z-50 transition-colors duration-300 ${
        isScrolled ? 'bg-ott-background/90 backdrop-blur-md shadow-md' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-xl font-bold text-ott-accent">Where 2 Watch</h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-300 hover:text-white">
              Home
            </Link>
            <Link to="/movies" className="text-gray-300 hover:text-white">
              Movies
            </Link>
            <Link to="/tv-shows" className="text-gray-300 hover:text-white">
              TV Shows
            </Link>
            <Link to="/categories" className="text-gray-300 hover:text-white">
              Categories
            </Link>
          </nav>

          {/* Right side - Search, Admin, User */}
          <div className="flex items-center">
            {/* Search Form */}
            <form onSubmit={handleSearchSubmit} className="relative mr-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="py-1 pl-3 pr-8 rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-1 focus:ring-ott-accent w-32 md:w-44"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400"
                aria-label="Search"
              >
                <Search size={16} />
              </button>
            </form>

            {/* Admin Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="ml-2" 
              onClick={navigateToAdmin}
              title="Admin Dashboard"
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* User Icon/Menu */}
            <Button variant="ghost" size="icon" className="ml-2">
              <User className="h-5 w-5" />
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="ml-2 md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 animate-fade-in">
            <ul className="flex flex-col space-y-4">
              <li>
                <Link to="/" className="block text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="block text-gray-300 hover:text-white">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/tv-shows" className="block text-gray-300 hover:text-white">
                  TV Shows
                </Link>
              </li>
              <li>
                <Link to="/categories" className="block text-gray-300 hover:text-white">
                  Categories
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
