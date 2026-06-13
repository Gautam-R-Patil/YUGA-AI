import React from "react";
import { Shield, FileText, Users, AlertTriangle, Scale, Globe } from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";

export const TermsAndConditions: React.FC = () => {
  const lastUpdated = 'October 10, 2025';

  const sections = [
    {
      title: 'Acceptance of Terms',
      icon: <FileText className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Agreement to Terms',
          text: 'By creating an account or using YUGA AI, you agree to comply with these Terms and all applicable laws. If you do not agree, you must stop using the App and website immediately.'
        },
        {
          subtitle: 'Changes to Terms',
          text: 'We may update these Terms occasionally. Any changes will be posted on our website and app with the updated "Last Updated" date. Continued use after changes means you accept the revised Terms.'
        },
        {
          subtitle: 'Eligibility',
          text: 'YUGA AI is intended for students and learners. If you are under 18, you must use the App under parental or institutional supervision.'
        }
      ]
    },
    {
      title: 'Services Provided',
      icon: <Users className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Educational Services',
          text: 'YUGA AI offers AI-powered learning support for students (e.g., explanations, study materials), visual whiteboard teaching sessions and interactive lessons.'
        },
        {
          subtitle: 'Purpose',
          text: 'These services are provided for educational purposes only and do not replace professional teaching or certified educational institutions.'
        }
      ]
    },
    {
      title: 'User Accounts',
      icon: <Globe className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Account Creation',
          text: 'You must provide accurate and complete information during registration. You are responsible for maintaining the confidentiality of your login credentials.'
        },
        {
          subtitle: 'Account Security',
          text: 'You agree not to share your account or use another user\'s account without permission. We may suspend or terminate accounts found violating our policies or engaging in misuse.'
        }
      ]
    },
    {
      title: 'Subscription and Payments',
      icon: <Scale className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Subscription Plans',
          text: 'You have to choose a plan for availing features of the YUGA AI. Subscription fees, durations, and renewal terms will be clearly displayed before purchase.'
        },
        {
          subtitle: 'Payment Processing',
          text: 'Payments are processed through PayU platform. All fees are non-refundable except where required by law or explicitly stated by YUGA AI.'
        }
      ]
    },
    {
      title: 'Intellectual Property',
      icon: <Shield className="w-6 h-6" />,
      content: [
        {
          subtitle: 'Ownership',
          text: 'All content within the App — including lessons, videos, AI explanations, graphics, logos, and text — is the property of Navodhan Educational Technology Private Limited or its content partners.'
        },
        {
          subtitle: 'License',
          text: 'Users are granted a limited, non-transferable, non-exclusive license to access and use the App for personal learning purposes only. Copying, redistributing, modifying, or commercially using our content without permission is strictly prohibited.'
        }
      ]
    },
    {
      title: 'User Content and Privacy',
      icon: <AlertTriangle className="w-6 h-6" />,
      content: [
        {
          subtitle: 'User Content',
          text: 'You may upload, type, or share content (e.g., questions, notes, images). By doing so, you grant us a limited license to use that content to improve our educational services and AI models.'
        },
        {
          subtitle: 'Content Guidelines',
          text: 'You must ensure that uploaded content does not infringe any copyright, contain inappropriate material, or violate laws.'
        },
        {
          subtitle: 'Privacy',
          text: 'Your privacy is important to us. Our Privacy Policy explains how we collect, use, and protect your personal data. By using the App, you consent to our data practices described there.'
        }
      ]
    }
  ];

  return (
    <PageLayout 
      title="Terms and Conditions" 
      subtitle="Legal terms and conditions governing your use of YUGA AI services"
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
            <Scale className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Terms and Conditions</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Welcome to YUGA AI, an educational application ("App") developed by
              Navodhan Educational Technologies Private Limited ("we", "our", or
              "us"). By downloading, accessing, or using YUGA AI, you ("user",
              "student", "parent", or "you") agree to the following Terms and
              Conditions ("Terms"). Please read them carefully before using our services.
            </p>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-600">
            <p>
              These Terms and Conditions govern your use of YUGA AI's educational platform 
              and services. Please read these terms carefully before using our services.
            </p>
            <p>
              By accessing or using our Services, you agree to be bound by these Terms. If you disagree 
              with any part of these terms, then you may not access the Services.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Important Disclaimers</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">AI-Generated Content Disclaimer</h3>
              <p className="text-gray-600 leading-relaxed">
                Responses and explanations generated by YUGA AI are based on machine
                learning models and may not always be 100% accurate. Users should use
                their discretion and verify information when necessary. YUGA AI is meant
                to supplement human learning, not replace qualified teachers.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Prohibited Uses</h3>
              <p className="text-gray-600 leading-relaxed">
                You agree not to use YUGA AI for illegal, unethical, or commercial purposes;
                attempt to hack, reverse-engineer, or damage the App; or upload harmful code 
                or misuse the AI in any way.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Limitation of Liability</h3>
              <p className="text-gray-600 leading-relaxed">
                YUGA AI and its creators are not liable for any data loss, inaccuracy,
                or service interruption. We are also not responsible for decisions or
                actions taken based on AI responses or for any damages arising from the
                use or inability to use the App.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Governing Law */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law and Termination</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Governing Law</h3>
              <p className="text-gray-600 leading-relaxed">
                These Terms are governed by the laws of India, and any disputes shall be
                subject to the exclusive jurisdiction of the courts in Kerala.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Termination</h3>
              <p className="text-gray-600 leading-relaxed">
                We reserve the right to suspend or terminate your access if you breach
                these Terms or misuse the platform. Upon termination, your license to
                use the App will end immediately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Information */}
      <section>
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Questions About These Terms?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              If you have any questions about these Terms and Conditions, please contact our team.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold mb-2">Contact Email</h3>
                <p className="text-blue-200">yuga@navodhan.com</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Phone Support</h3>
                <p className="text-blue-200">+91 8089846983</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
