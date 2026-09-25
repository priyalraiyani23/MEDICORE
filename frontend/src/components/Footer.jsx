import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Send, MapPin, Phone, Mail } from 'lucide-react';
import logo from '../assets/logo.png';

const Twitter = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
);
const Linkedin = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
);
const Facebook = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
);

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-16">
          {/* Logo and Contact Info */}
          <div className="flex flex-col space-y-6 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="MediCore logo" className="w-10 h-10 object-contain" />
              <div className="flex flex-col">
                <span className="text-2xl leading-none font-extrabold text-slate-800 tracking-tight">MEDICORE</span>
              </div>
            </Link>
            
            <p className="text-[15px] text-gray-500 leading-relaxed max-w-xs">
              We understand that life challenges can sometimes be overwhelming.
            </p>
            
            <div className="flex items-center gap-3">
              <a href="#" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-[#2c4761] hover:text-white hover:border-[#2c4761] transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-[#2c4761] hover:text-white hover:border-[#2c4761] transition-colors">
                <Send className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-[#2c4761] hover:text-white hover:border-[#2c4761] transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-600 hover:bg-[#2c4761] hover:text-white hover:border-[#2c4761] transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-slate-800 text-lg mb-6">Product</h3>
            <ul className="space-y-4 text-sm font-semibold text-slate-600">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Admissions</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Charting</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Billing</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Outcomes</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold text-slate-800 text-lg mb-6">Company</h3>
            <ul className="space-y-4 text-sm font-semibold text-slate-600">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Why MediCore</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Testimonials</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-slate-800 text-lg mb-6">Support</h3>
            <ul className="space-y-4 text-sm font-semibold text-slate-600">
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-slate-800 text-lg mb-6">Get In Touch</h3>
            <p className="text-[15px] text-gray-600 mb-6 leading-relaxed">
              Subscribe Our Newsletter To Get Our Latest Updated News!
            </p>
            <div className="flex items-center w-full max-w-sm bg-slate-50 border border-slate-200 rounded-lg p-1.5 shadow-sm">
              <input 
                type="email" 
                placeholder="Your Email Address" 
                className="flex-1 px-3 py-2 text-sm bg-transparent outline-none placeholder:text-gray-400 text-slate-800"
              />
              <button className="bg-primary-500 hover:bg-primary-700 text-white p-2.5 rounded-md transition-colors shrink-0">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1 font-medium text-slate-600">
            <span>©</span>
            <span>MediCore - 2026 All rights reserved.</span>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 font-medium text-slate-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span>50 S. 16th Street, Philadelphia, PA 19102</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              <span>215-326-9369</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span>info@medicore.io</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
