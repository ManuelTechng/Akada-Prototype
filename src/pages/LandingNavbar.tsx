import React, { useState, useEffect } from 'react';
import { Menu, X, LogIn, UserPlus, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      // Update active section based on scroll position
      const sections = ['features', 'how-it-works', 'pricing', 'about'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const smoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault();
    const element = document.querySelector(target);
    if (element) {
      const navHeight = 80; // Increased for better spacing
      const elementTop = element.getBoundingClientRect().top + window.scrollY;

      // Ensure the element exists and is visible
      if (elementTop >= 0) {
        // Check if smooth scrolling is supported
        if ('scrollBehavior' in document.documentElement.style) {
          window.scrollTo({
            top: elementTop - navHeight,
            behavior: 'smooth'
          });
        } else {
          // Fallback for browsers that don't support smooth scrolling
          window.scrollTo(0, elementTop - navHeight);
        }
      }
      setIsMenuOpen(false);
    } else {
      console.warn(`Element with selector "${target}" not found`);
    }
  };

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#about', label: 'About' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/98 backdrop-blur-lg shadow-md border-b border-slate-200'
          : 'bg-white/85 backdrop-blur-sm'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-18">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
            aria-label="Akada Home"
          >
            <img
              src="/akada-logo-simple.svg"
              alt="Akada"
              className="h-10 lg:h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => smoothScroll(e, link.href)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-blue-700 bg-blue-50'
                      : 'text-slate-700 hover:text-blue-700 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600 rounded-full"></span>
                  )}
                </a>
              );
            })}

            <div className="ml-4 flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:text-blue-700 hover:bg-slate-50 rounded-lg transition-all duration-200"
                tabIndex={0}
              >
                Log In
              </Link>
              <Link
                to="/signup"
                className="group relative px-5 py-2.5 text-sm font-semibold text-white rounded-lg overflow-hidden transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30"
                tabIndex={0}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-violet-600"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative flex items-center gap-1.5">
                  Get Started
                  <ChevronDown className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white border-t border-slate-200 px-4 py-4 shadow-lg">
          <div className="space-y-1 mb-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => smoothScroll(e, link.href)}
                className="block text-slate-700 hover:text-blue-700 hover:bg-slate-50 transition-all duration-200 py-3 px-4 rounded-lg font-medium"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-slate-200">
            <Link
              to="/login"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-slate-50 text-slate-700 font-semibold hover:bg-slate-100 transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
              tabIndex={0}
            >
              <LogIn size={18}/> Log In
            </Link>
            <Link
              to="/signup"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-violet-600 text-white font-semibold hover:shadow-lg transition-all duration-200"
              onClick={() => setIsMenuOpen(false)}
              tabIndex={0}
            >
              <UserPlus size={18}/> Get Started
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;
