import React from 'react';
import { Mail, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

const LandingFooterMinimalist: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'How It Works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'FAQ', href: '#faq' }
    ],
    resources: [
      { name: 'Blog', href: '#' },
      { name: 'Scholarship Guide', href: '#' },
      { name: 'Visa Requirements', href: '#' },
      { name: 'Success Stories', href: '#success-stories' }
    ],
    company: [
      { name: 'About', href: '#about' },
      { name: 'Careers', href: '#' },
      { name: 'Contact', href: 'mailto:support@akada.edu.ng' },
      { name: 'Partners', href: '#' }
    ]
  };

  const socialLinks = [
    { icon: Github, href: 'https://github.com/adeyemi-o/AI-Powered-Student-Landing-Page', label: 'GitHub' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  return (
    <footer className="bg-zinc-950 text-white pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <h3 className="text-3xl font-black mb-4">Akada</h3>
            <p className="text-lg text-zinc-400 mb-6 max-w-sm leading-relaxed">
              Democratizing Global Education for African Students
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:support@akada.edu.ng"
                className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group"
              >
                <Mail className="h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">support@akada.edu.ng</span>
              </a>
              <div className="flex items-center gap-3 text-zinc-400">
                <MapPin className="h-5 w-5" />
                <span className="text-sm font-medium">Yaba, Lagos, Nigeria</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 mt-8">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="p-3 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all duration-300 hover:scale-110"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="text-sm font-black uppercase tracking-wider mb-6 text-white">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-wider mb-6 text-white">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-black uppercase tracking-wider mb-6 text-white">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-zinc-400 hover:text-white transition-colors font-medium"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t-2 border-zinc-900">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-zinc-500">
              © {currentYear} Akada. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors font-medium">
                Terms
              </a>
              <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors font-medium">
                Privacy
              </a>
              <a href="#" className="text-sm text-zinc-500 hover:text-white transition-colors font-medium">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooterMinimalist;
