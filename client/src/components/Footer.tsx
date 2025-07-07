import React from 'react';
import { Link } from "react-router-dom";
import { Github, Mail, Linkedin, ArrowRight } from 'lucide-react';
import { Button } from './ui/button'; 
import codeNovaLogo from "../assets/logo.png";


const siteConfig = {
  name: "CodeNova",
  description: "Empowering the next generation of web developers through project-based learning.",
  copyright: `© ${new Date().getFullYear()} CodeNova. All Rights Reserved.`,
};

const footerNav = {
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Contact Us", href: "/contact" },
  ],
};

const socialLinks = [
  { name: "GitHub", href: "https://github.com/Miheret-Girmachew", icon: Github },
  { name: "Email", href: "mailto:miheretgirmachew@gmail.com", icon: Mail },
  { name: "LinkedIn", href: "https://www.linkedin.com/in/miheret-girmachew-734848297/", icon: Linkedin },
];



// --- The Footer Component ---

export default function Footer() {
  return (
    <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">

      
      {/* 1. Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Brand Info & Socials (takes up more space) */}
          <div className="lg:col-span-7">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src={codeNovaLogo} alt={`${siteConfig.name} Logo`} className="h-9 w-auto" />
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-50">{siteConfig.name}</span>
            </Link>
            <p className="text-base text-slate-600 dark:text-slate-400 max-w-md">
              {siteConfig.description}
            </p>
            <div className="mt-6 flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="h-6 w-6" />
                </a>
              ))}
            </div>
          </div>
          
          {/* Spacer Column (for layout on large screens) */}
          <div className="hidden lg:block lg:col-span-2"></div>

          {/* Legal Links (on the far right) */}
          <div className="lg:col-span-3 text-sm">
            <h3 className="font-semibold text-slate-900 dark:text-slate-200 mb-4">Legal & Support</h3>
            <ul className="space-y-3">
              {footerNav.legal.map((item) => (
                <li key={item.name}>
                  <Link to={item.href} className="text-base text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 2. Bottom Bar for Copyright */}
      <div className="border-t border-slate-200 dark:border-slate-800">
         <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                {siteConfig.copyright}
            </p>
        </div>
      </div>
    </footer>
  );
}