import React from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Heart,
  Globe,
  Smartphone
} from "lucide-react";
import logo from "../../assets/yuga_ai_logo.jfif";
import { trackButtonClick } from "../../core/utils/analytics";

const ANDROID_APP_INSTALL_URL =
  "https://expo.dev/accounts/navodhan-yuga/projects/yuga-ai/builds/fc0386ee-aee3-432d-9ea2-8597a606b2f5";

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();


  const footerLinks = {
    product: [
      { name: "Features", href: "/#features" },
      { name: "Pricing", href: "/premium" },
      { name: "Success Stories", href: "/#testimonials" },
      { name: "AI Technology", href: "/about" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Our Mission", href: "/mission" },
      { name: "Careers", href: "/careers" },
      { name: "Press & News", href: "/press" },
    ],
    support: [
      { name: "Help Center", href: "/help" },
      { name: "Contact Support", href: "/contact" },
      { name: "System Status", href: "/status" },
      { name: "Community Forum", href: "/community" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "GDPR Compliance", href: "/gdpr" },
    ],
  };

  const socialLinks = [
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/yuga-ai/", color: "hover:text-[#0077b5]" },
    { name: "Twitter", icon: Twitter, href: "#", color: "hover:text-[#1DA1F2]" },
    { name: "Instagram", icon: Instagram, href: "#", color: "hover:text-[#E1306C]" },
    { name: "YouTube", icon: Youtube, href: "#", color: "hover:text-[#FF0000]" },
    { name: "Facebook", icon: Facebook, href: "#", color: "hover:text-[#4267B2]" },
  ];

  return (
    <footer className="relative bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white overflow-hidden transition-colors duration-300 print:hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[300px] md:w-[500px] h-[300px] md:h-[500px] rounded-full bg-purple-600/5 blur-[80px] md:blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[350px] md:w-[600px] h-[350px] md:h-[600px] rounded-full bg-purple-600/5 blur-[80px] md:blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:pt-20 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-8 mb-12 md:mb-16">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">
            <Link to="/" className="flex items-center space-x-3 group w-fit">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-xl flex items-center justify-center p-0.5 shadow-lg group-hover:shadow-purple-500/25 transition-all duration-300">
                <img
                  src={logo}
                  alt="YUGA AI"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div>
                <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                  YUGA AI
                </span>
                <p className="text-[10px] md:text-xs text-purple-400 font-medium tracking-wider uppercase">Future of Learning</p>
              </div>
            </Link>

            <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm text-sm md:text-base">
              Empowering students with AI-driven personalized education. Join the revolution in learning technology today.
            </p>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                <Smartphone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-sm font-semibold">Get the Android app</span>
              </div>

              <a
                href="/download-app"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gradient inline-flex items-center justify-center w-full md:w-auto"
                onClick={() => trackButtonClick("Open Download Page", "Footer")}
              >
                Download & Install
              </a>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Install directly from this link (no Play Store needed).
              </p>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300">
                  <Mail className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-sm font-medium">yuga@navodhan.com</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300">
                  <Phone className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-sm font-medium">+91 8089846983</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300">
                  <MapPin className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-sm font-medium">Thiruvananthapuram, Kerala</span>
              </div>
              <a href="https://navodhan.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-400 group cursor-pointer hover:text-white transition-colors">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-white/5 flex items-center justify-center group-hover:bg-purple-600 transition-all duration-300">
                  <Globe className="w-4 h-4 md:w-5 md:h-5" />
                </div>
                <span className="text-sm font-medium">navodhan.com</span>
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 md:gap-8">
            <div className="space-y-4 md:space-y-6">
              <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Product</h4>
              <ul className="space-y-3 md:space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-[1px] bg-purple-400 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 md:space-y-6">
              <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Company</h4>
              <ul className="space-y-3 md:space-y-4">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-[1px] bg-purple-400 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 md:space-y-6">
              <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Support</h4>
              <ul className="space-y-3 md:space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 text-sm font-medium transition-colors flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-[1px] bg-purple-400 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4 md:space-y-6">
              <h4 className="text-xs md:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Legal</h4>
              <ul className="space-y-3 md:space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link to={link.href} className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-medium transition-colors flex items-center gap-2 group">
                      <span className="w-0 group-hover:w-2 h-[1px] bg-blue-400 transition-all duration-300"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>


        {/* Bottom Bar */}
        <div className="pt-6 md:pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="order-2 md:order-1 text-center md:text-left">
            <p className="text-gray-500 text-xs md:text-sm">
              &copy; {currentYear} YUGA AI. All rights reserved.
              <span className="hidden sm:inline"> | </span>
              <br className="sm:hidden" />
              Made with <Heart className="w-3 h-3 text-red-500 inline mx-1 fill-current" /> in India
            </p>
          </div>

          <div className="order-1 md:order-2 flex items-center gap-4">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-9 h-9 md:w-10 md:h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400 transition-all duration-300 hover:bg-purple-600 dark:hover:bg-white hover:text-white dark:hover:text-gray-900 hover:scale-110 ${social.color}`}
                aria-label={social.name}
              >
                <social.icon className="w-4 h-4 md:w-5 md:h-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

