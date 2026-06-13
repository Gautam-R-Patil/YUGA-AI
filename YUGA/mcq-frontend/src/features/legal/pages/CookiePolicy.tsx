import React, { useState } from "react";
import { Cookie, Settings, Eye, BarChart3, Shield, Globe } from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";

export const CookiePolicy: React.FC = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    personalization: true
  });

  const lastUpdated = 'January 15, 2024';

  const cookieTypes = [
    {
      name: 'Necessary Cookies',
      key: 'necessary',
      icon: <Shield className="w-6 h-6" />,
      description: 'Essential for the website to function properly. These cannot be disabled.',
      examples: ['Authentication tokens', 'Security settings', 'Language preferences'],
      required: true
    },
    {
      name: 'Analytics Cookies',
      key: 'analytics',
      icon: <BarChart3 className="w-6 h-6" />,
      description: 'Help us understand how visitors interact with our website.',
      examples: ['Google Analytics', 'Page view tracking', 'User behavior analysis'],
      required: false
    },
    {
      name: 'Marketing Cookies',
      key: 'marketing',
      icon: <Eye className="w-6 h-6" />,
      description: 'Used to track visitors across websites for advertising purposes.',
      examples: ['Ad targeting', 'Social media pixels', 'Conversion tracking'],
      required: false
    },
    {
      name: 'Personalization Cookies',
      key: 'personalization',
      icon: <Settings className="w-6 h-6" />,
      description: 'Remember your preferences to provide a personalized experience.',
      examples: ['Learning preferences', 'UI customizations', 'Course recommendations'],
      required: false
    }
  ];

  const handleCookieToggle = (key: string) => {
    if (key === 'necessary') return; // Cannot disable necessary cookies
    
    setCookiePreferences(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev]
    }));
  };

  const handleSavePreferences = () => {
    // In a real app, this would save preferences to localStorage or send to server
    alert('Cookie preferences saved successfully!');
  };

  return (
    <PageLayout 
      title="Cookie Policy" 
      subtitle="How we use cookies and similar technologies to enhance your learning experience"
    >
      {/* Last Updated */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-blue-800">
          <strong>Last Updated:</strong> {lastUpdated}
        </p>
      </div>

      {/* Introduction */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <Cookie className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Cookie Policy</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              This Cookie Policy explains how YUGA AI uses cookies and similar technologies to recognize you 
              when you visit our website and use our services.
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <h3 className="text-xl font-bold text-gray-900 mb-3">What are cookies?</h3>
            <p className="mb-4">
              Cookies are small data files that are placed on your computer or mobile device when you visit a website. 
              Cookies are widely used by website owners to make their websites work, or to work more efficiently, 
              as well as to provide reporting information.
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Why do we use cookies?</h3>
            <p className="mb-4">
              We use cookies for several reasons. Some cookies are required for technical reasons in order for our 
              website to operate, and we refer to these as "necessary" or "strictly necessary" cookies. Other cookies 
              enable us to track and target the interests of our users to enhance the experience on our platform.
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">How can you control cookies?</h3>
            <p>
              You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights 
              by setting your preferences in the Cookie Preference Center below or through your browser settings.
            </p>
          </div>
        </div>
      </section>

      {/* Cookie Types and Preferences */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Cookie Preference Center</h2>
          
          <div className="space-y-6">
            {cookieTypes.map((type) => (
              <div key={type.key} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                      {type.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">{type.name}</h3>
                      <p className="text-gray-600 mb-3">{type.description}</p>
                      <div className="mb-3">
                        <h4 className="font-medium text-gray-900 mb-1">Examples:</h4>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {type.examples.map((example, index) => (
                            <li key={index}>{example}</li>
                          ))}
                        </ul>
                      </div>
                      {type.required && (
                        <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                          Always Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences[type.key as keyof typeof cookiePreferences]}
                        onChange={() => handleCookieToggle(type.key)}
                        disabled={type.required}
                        className="sr-only peer"
                      />
                      <div className={`w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 ${type.required ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <button
              onClick={handleSavePreferences}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </section>

      {/* Third-Party Cookies */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              In addition to our own cookies, we may also use various third-party cookies to report usage 
              statistics of the service, deliver advertisements on and through the service, and so on.
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Third-Party Services We Use:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Google Analytics</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Helps us understand how users interact with our website
                </p>
                <a href="https://policies.google.com/privacy" className="text-blue-600 hover:text-blue-700 text-sm">
                  Google Privacy Policy
                </a>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Stripe</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Processes payments securely for our subscription services
                </p>
                <a href="https://stripe.com/privacy" className="text-blue-600 hover:text-blue-700 text-sm">
                  Stripe Privacy Policy
                </a>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Intercom</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Powers our customer support chat functionality
                </p>
                <a href="https://www.intercom.com/legal/privacy" className="text-blue-600 hover:text-blue-700 text-sm">
                  Intercom Privacy Policy
                </a>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Hotjar</h4>
                <p className="text-gray-600 text-sm mb-2">
                  Provides heatmaps and user session recordings for UX improvement
                </p>
                <a href="https://www.hotjar.com/legal/policies/privacy/" className="text-blue-600 hover:text-blue-700 text-sm">
                  Hotjar Privacy Policy
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browser Controls */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="flex items-center mb-6">
            <Globe className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Browser Cookie Controls</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              Most web browsers allow you to control cookies through their settings preferences. However, 
              if you limit the ability of websites to set cookies, you may worsen your overall user experience.
            </p>
            
            <h3 className="text-xl font-bold text-gray-900 mb-3">Browser-Specific Instructions:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Chrome</h4>
                <p className="text-gray-600 text-sm">
                  Settings → Privacy and security → Cookies and other site data
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Firefox</h4>
                <p className="text-gray-600 text-sm">
                  Options → Privacy & Security → Cookies and Site Data
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Safari</h4>
                <p className="text-gray-600 text-sm">
                  Preferences → Privacy → Manage Website Data
                </p>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-bold text-gray-900 mb-2">Edge</h4>
                <p className="text-gray-600 text-sm">
                  Settings → Cookies and site permissions → Cookies and site data
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section>
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Cookies?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              If you have any questions about our use of cookies or other technologies, please contact us.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-2">Privacy Team</h3>
                <p className="text-blue-200">yuga@navodhan.com</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Data Protection Team</h3>
                <p className="text-blue-200">ceo@navodhan.com</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
