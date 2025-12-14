import React, { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

const LandingNavbarMinimalist: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);

      // Update active section based on scroll position
      const sections = ['features', 'how-it-works', 'pricing', 'faq', 'about'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 120 && rect.bottom >= 120) {
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
      const navHeight = 80;
      const elementTop = element.getBoundingClientRect().top + window.scrollY;

      window.scrollTo({
        top: elementTop - navHeight,
        behavior: 'smooth'
      });
      setIsMenuOpen(false);
    }
  };

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
    { href: '#about', label: 'About' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white dark:bg-zinc-950 border-b-2 border-zinc-200 dark:border-zinc-800 ${
        isScrolled ? 'shadow-lg' : ''
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center group"
            aria-label="Akada Home"
          >
            <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight group-hover:text-primary transition-colors duration-300">
              Akada
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => smoothScroll(e, link.href)}
                  className={`relative text-sm font-bold transition-colors duration-200 ${
                    isActive
                      ? 'text-primary'
                      : 'text-zinc-700 dark:text-zinc-300 hover:text-primary'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary"></span>
                  )}
                </a>
              );
            })}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              className="h-11 px-6 font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <Link to="/login">Log In</Link>
            </Button>
            <Button
              asChild
              className="h-11 px-6 font-bold bg-primary hover:bg-primary/90 shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Link to="/signup">Get Started</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-all duration-200"
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
          isMenuOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <div className="bg-white dark:bg-zinc-950 border-t-2 border-zinc-200 dark:border-zinc-800 px-6 py-6 shadow-lg">
          <div className="space-y-2 mb-6">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => smoothScroll(e, link.href)}
                className="block text-zinc-700 dark:text-zinc-300 hover:text-primary hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all duration-200 py-3 px-4 rounded-xl font-bold"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="space-y-3 pt-6 border-t-2 border-zinc-200 dark:border-zinc-800">
            <Button
              asChild
              variant="outline"
              className="w-full h-12 font-bold border-2"
            >
              <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                Log In
              </Link>
            </Button>
            <Button
              asChild
              className="w-full h-12 font-bold bg-primary hover:bg-primary/90"
            >
              <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                Get Started
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbarMinimalist;
