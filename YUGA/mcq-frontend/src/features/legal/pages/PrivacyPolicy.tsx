import React from "react";
import { Shield, Eye, Lock, Users, Database, Globe } from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";

export const PrivacyPolicy: React.FC = () => {
  const lastUpdated = 'October 10, 2025';

  const sections = [
    {
      title: 'Information We Collect',
      icon: <Database className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Personal Information',
          text: 'Name, email address, phone number, and age (if provided).'
        },
        {
          subtitle: 'Account Information',
          text: 'Username, password, and user preferences.'
        },
        {
          subtitle: 'Usage Data',
          text: 'Lessons viewed, progress, quiz performance, and session activity.'
        },
        {
          subtitle: 'Device Information',
          text: 'IP address, browser type, device model, operating system, and app version.'
        }
      ]
    },
    {
      title: 'How We Use Your Information',
      icon: <Eye className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Service Provision',
          text: 'Provide and improve our educational services and personalize your learning experience.'
        },
        {
          subtitle: 'Communication',
          text: 'Send updates, notifications, and relevant communications.'
        },
        {
          subtitle: 'Analytics & Improvement',
          text: 'Analyze performance and improve AI accuracy, ensure security and prevent misuse.'
        },
        {
          subtitle: 'Compliance',
          text: 'Comply with applicable laws and regulations.'
        }
      ]
    },
    {
      title: 'Sharing of Information',
      icon: <Users className="w-6 h-6" />,
      content: [
        {
          subtitle: 'No Sale of Data',
          text: 'We do not sell or rent your personal data.'
        },
        {
          subtitle: 'Service Providers',
          text: 'We may share limited data with service providers for payment processing, analytics, and hosting services.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'If required by law or in response to valid legal requests, we may share information with legal authorities.'
        },
        {
          subtitle: 'Analytics Partners',
          text: 'To improve performance and enhance the learning experience, we may share data with analytics partners.'
        }
      ]
    },
    {
      title: 'Data Storage and Security',
      icon: <Lock className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Security Measures',
          text: 'We store your data securely using encryption and access control measures.'
        },
        {
          subtitle: 'Risk Acknowledgement',
          text: 'However, no online service can guarantee complete security, and users share data at their own risk.'
        }
      ]
    },
    {
      title: 'Your Rights and Choices',
      icon: <Shield className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Access and Update',
          text: 'You can access and update your personal information.'
        },
        {
          subtitle: 'Data Deletion',
          text: 'You can request deletion of your account and data.'
        },
        {
          subtitle: 'Marketing Preferences',
          text: 'You can opt out of marketing or promotional emails.'
        },
        {
          subtitle: 'How to Exercise Rights',
          text: 'You can make these requests by contacting us at yuga@navodhan.com.'
        }
      ]
    },
    {
      title: "Children's Privacy",
      icon: <Globe className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Intended Audience',
          text: 'YUGA AI is intended for students and learners. If you are under 18, you must use the App under parental or institutional supervision.'
        },
        {
          subtitle: 'Data Collection from Children',
          text: 'We do not knowingly collect personal data from children without consent.'
        }
      ]
    }
  ];

  return (
    <PageLayout 
      title="Privacy Policy" 
      subtitle="How we collect, use, and protect your personal information"
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
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Privacy Matters</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              YUGA AI ("we", "our", or "us") values your privacy. This Privacy Policy
              explains how we collect, use, disclose, and protect your information
              when you use the YUGA AI App and related services ("Services").
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              By using our App, you consent to the data practices described in this Policy.
              This Privacy Policy applies to all services offered by YUGA AI, including 
              our website, mobile applications, and AI-powered educational platform.
            </p>
            <p>
              We may update this Privacy Policy from time to time. The updated version will
              be posted on our website and app. Continued use after changes indicates
              acceptance of the new terms.
            </p>
          </div>
        </div>
      </section>

      {/* Main Sections */}
      {sections.map((section, index) => (
        <section key={index} className="mb-12">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white mr-4">
                {section.icon}
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
            </div>
            
            <div className="space-y-6">
              {section.content.map((item, itemIndex) => (
                <div key={itemIndex}>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">{item.subtitle}</h3>
                  <p className="text-gray-600 leading-relaxed">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Additional Sections */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Privacy Information</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Third-Party Services</h3>
              <p className="text-gray-600 leading-relaxed">
                Our App may include integrations with third-party services (e.g.,
                payment processors, analytics tools, or content providers). Their
                privacy practices are governed by their own policies, not ours.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Data Retention</h3>
              <p className="text-gray-600 leading-relaxed">
                We retain data as long as necessary to provide our services or comply
                with legal requirements. You can request deletion of your data at any time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section className="mb-12">
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About Privacy?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              If you have any questions about this Privacy Policy or our data practices, 
              please don't hesitate to contact us.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-2">Email</h3>
                <p className="text-blue-200">yuga@navodhan.com</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Phone</h3>
                <p className="text-blue-200">+91 8089846983</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Principles */}
      <section>
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Our Privacy Principles</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Transparency</h3>
              <p className="text-gray-600 text-sm">We are clear about what data we collect and how we use it</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Security</h3>
              <p className="text-gray-600 text-sm">We protect your data with industry-leading security measures</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Control</h3>
              <p className="text-gray-600 text-sm">You have control over your personal information and privacy settings</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
