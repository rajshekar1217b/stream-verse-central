
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Youtube, Globe } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-ott-background border-t border-gray-800 pt-12 pb-6">
      <div className="container mx-auto px-4">
        {/* Social Media Icons */}
        <div className="flex space-x-6 mb-8 justify-center">
          <a href="#" className="text-gray-400 hover:text-white">
            <Facebook size={24} />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <Twitter size={24} />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <Instagram size={24} />
          </a>
          <a href="#" className="text-gray-400 hover:text-white">
            <Youtube size={24} />
          </a>
        </div>
        
        {/* Links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 text-sm">
          <div>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-white">Audio Description</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Investor Relations</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Legal Notices</Link></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-white">Help Center</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Jobs</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Cookie Preferences</Link></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-white">Gift Cards</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Terms of Use</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Corporate Information</Link></li>
            </ul>
          </div>
          <div>
            <ul className="space-y-3">
              <li><Link to="#" className="text-gray-400 hover:text-white">Media Center</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Privacy</Link></li>
              <li><Link to="#" className="text-gray-400 hover:text-white">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        
        {/* Language Selector */}
        <div className="mb-8 flex justify-center">
          <div className="border border-gray-700 rounded p-2 flex items-center">
            <Globe size={16} className="text-gray-400 mr-2" />
            <select className="bg-transparent text-gray-400 focus:outline-none">
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="text-center text-gray-500 text-sm">
          <p>© 2023 StreamVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
