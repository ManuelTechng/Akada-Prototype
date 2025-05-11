import React, { useState, useEffect } from 'react';
import { Menu, X, GraduationCap, LogIn, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

const LandingNavbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900">Akada</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <a href="#features" className="text-gray-600 hover:text-indigo-600 transition-colors">Features</a>
            <a href="#how-it-works" className="text-gray-600 hover:text-indigo-600 transition-colors">How It Works</a>
            <a href="#pricing" className="text-gray-600 hover:text-indigo-600 transition-colors">Pricing</a>
            <a href="#about" className="text-gray-600 hover:text-indigo-600 transition-colors">About</a>
            <Link to="/login" className="flex items-center gap-1 px-5 py-2 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 border border-indigo-200 transition-all duration-200 ml-2" tabIndex={0}><LogIn size={18}/> Log In</Link>
            <Link to="/signup" className="flex items-center gap-1 px-5 py-2 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-200 ml-2" tabIndex={0}><UserPlus size={18}/> Sign Up</Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      }`}>
        <div className="bg-white border-t px-4 py-6 space-y-4 flex flex-col">
          <a href="#features" className="block text-gray-600 hover:text-indigo-600 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Features</a>
          <a href="#how-it-works" className="block text-gray-600 hover:text-indigo-600 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>How It Works</a>
          <a href="#pricing" className="block text-gray-600 hover:text-indigo-600 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>Pricing</a>
          <a href="#about" className="block text-gray-600 hover:text-indigo-600 transition-colors py-2" onClick={() => setIsMenuOpen(false)}>About</a>
          <Link to="/login" className="flex items-center gap-1 px-5 py-3 rounded-lg bg-indigo-50 text-indigo-700 font-semibold hover:bg-indigo-100 border border-indigo-200 transition-all duration-200" onClick={() => setIsMenuOpen(false)} tabIndex={0}><LogIn size={18}/> Log In</Link>
          <Link to="/signup" className="flex items-center gap-1 px-5 py-3 rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all duration-200" onClick={() => setIsMenuOpen(false)} tabIndex={0}><UserPlus size={18}/> Sign Up</Link>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;