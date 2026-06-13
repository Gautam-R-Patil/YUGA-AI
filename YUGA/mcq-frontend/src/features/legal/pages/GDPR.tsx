import React, { useState, useRef } from "react";
import {
  Shield,
  Download,
  Trash2,
  Edit,
  Eye,
  UserCheck,
  FileText,
  Mail,
} from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";

export const GDPR: React.FC = () => {
  const [requestType, setRequestType] = useState("access");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    requestDetails: "",
    verificationMethod: "email",
  });
  const [alertMessage, setAlertMessage] = useState("");
  const alertRef = useRef<HTMLDivElement | null>(null);
  const [showAlert, setShowAlert] = useState(false);

  const rights = [
    {
      title: "Right to Access",
      icon: <Eye className="w-6 h-6" />,
      description:
        "You have the right to request copies of your personal data.",
      action: "Request a copy of all personal data we hold about you",
    },
    {
      title: "Right to Rectification",
      icon: <Edit className="w-6 h-6" />,
      description:
        "You have the right to request correction of inaccurate personal data.",
      action: "Update or correct your personal information",
    },
    {
      title: "Right to Erasure",
      icon: <Trash2 className="w-6 h-6" />,
      description:
        "You have the right to request deletion of your personal data.",
      action: "Request deletion of your personal data",
    },
    {
      title: "Right to Data Portability",
      icon: <Download className="w-6 h-6" />,
      description:
        "You have the right to receive your data in a portable format.",
      action: "Download your data in a machine-readable format",
    },
    {
      title: "Right to Object",
      icon: <Shield className="w-6 h-6" />,
      description:
        "You have the right to object to processing of your personal data.",
      action: "Object to specific data processing activities",
    },
    {
      title: "Right to Restrict Processing",
      icon: <UserCheck className="w-6 h-6" />,
      description: "You have the right to request restriction of processing.",
      action: "Limit how we process your personal data",
    },
  ];

  const dataCategories = [
    {
      category: "Account Information",
      description: "Name, email address, profile picture, account preferences",
      retention: "3 years after account deletion",
      purpose: "Account management and service provision",
    },
    {
      category: "Learning Data",
      description:
        "Course progress, quiz results, learning preferences, AI interactions",
      retention: "5 years for educational records",
      purpose: "Personalized learning experience and progress tracking",
    },
    {
      category: "Usage Analytics",
      description:
        "Page views, feature usage, session duration, device information",
      retention: "2 years",
      purpose: "Service improvement and analytics",
    },
    {
      category: "Communication Data",
      description: "Support tickets, chat messages, email communications",
      retention: "3 years",
      purpose: "Customer support and service improvement",
    },
  ];

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    setAlertMessage(
      "✅ Your GDPR request has been submitted. We will respond within 30 days."
    );
    setShowAlert(true);

    setTimeout(() => setShowAlert(false), 5000);

    setFormData({
      name: "",
      email: "",
      requestDetails: "",
      verificationMethod: "email",
    });

    // Scroll to alert after state updates
    setTimeout(() => {
      alertRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 100); // slight delay to allow DOM update
  };

  return (
    <PageLayout
      title="GDPR Compliance"
      subtitle="Your data protection rights under the General Data Protection Regulation"
    >
      {/* Introduction */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your Data Rights
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              As a data subject under GDPR, you have specific rights regarding
              your personal data. We are committed to helping you exercise these
              rights in a transparent and efficient manner.
            </p>
          </div>

          <div className="prose prose-lg max-w-none text-gray-600">
            <p className="mb-4">
              The General Data Protection Regulation (GDPR) gives individuals in
              the European Union specific rights regarding their personal data.
              YUGA AI is committed to protecting your privacy and ensuring
              compliance with GDPR requirements.
            </p>
            <p>
              This page explains your rights under GDPR and provides tools to
              help you exercise them. If you have any questions or need
              assistance, please don't hesitate to contact our Data Protection
              Team.
            </p>
          </div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Your GDPR Rights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rights.map((right, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white mb-4">
                {right.icon}
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">
                {right.title}
              </h3>
              <p className="text-gray-600 mb-4">{right.description}</p>
              <p className="text-sm text-blue-600 font-medium">
                {right.action}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Data We Collect */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Data We Collect and Process
          </h2>

          <div className="space-y-6">
            {dataCategories.map((data, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  {data.category}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Data Types
                    </h4>
                    <p className="text-gray-600 text-sm">{data.description}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">Purpose</h4>
                    <p className="text-gray-600 text-sm">{data.purpose}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-1">
                      Retention Period
                    </h4>
                    <p className="text-gray-600 text-sm">{data.retention}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request Form */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Submit a GDPR Request
            </h2>
            <p className="text-gray-600">
              Use this form to exercise your data protection rights. We will
              respond within 30 days.
            </p>
          </div>
          {showAlert && (
            <div
              ref={alertRef}
              className="mb-6 p-4 rounded-lg bg-green-100 border border-green-300 text-green-800 text-sm relative"
            >
              <span>{alertMessage}</span>
              <button
                className="absolute top-2 right-2 text-green-500 hover:text-green-700"
                onClick={() => setShowAlert(false)}
                type="button"
              >
                ✕
              </button>
            </div>
          )}

          <form
            onSubmit={handleSubmitRequest}
            className="max-w-2xl mx-auto space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type of Request *
              </label>
              <select
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="access">Data Access Request</option>
                <option value="rectification">Data Correction Request</option>
                <option value="erasure">Data Deletion Request</option>
                <option value="portability">Data Portability Request</option>
                <option value="objection">Object to Processing</option>
                <option value="restriction">Restrict Processing</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Method
              </label>
              <select
                value={formData.verificationMethod}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    verificationMethod: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="email">Email verification</option>
                <option value="account">Account login verification</option>
                <option value="document">Document verification</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Details
              </label>
              <textarea
                rows={4}
                value={formData.requestDetails}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    requestDetails: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Please provide specific details about your request..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <strong>Note:</strong> To protect your privacy, we may need to
                verify your identity before processing your request. This may
                involve additional verification steps depending on the nature of
                your request.
              </p>
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium"
            >
              Submit GDPR Request
            </button>
          </form>
        </div>
      </section>

      {/* Legal Basis */}
      <section className="mb-12">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Legal Basis for Processing
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">
                Contract Performance
              </h3>
              <p className="text-gray-600 text-sm">
                Processing necessary for the performance of our contract with
                you (e.g., providing educational services)
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">
                Legitimate Interest
              </h3>
              <p className="text-gray-600 text-sm">
                Processing for our legitimate interests (e.g., improving our
                services, fraud prevention)
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Consent</h3>
              <p className="text-gray-600 text-sm">
                Processing based on your explicit consent (e.g., marketing
                communications, optional features)
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-2">Legal Obligation</h3>
              <p className="text-gray-600 text-sm">
                Processing required to comply with legal obligations (e.g., tax
                records, regulatory requirements)
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact DPO */}
      <section>
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center">
            <Mail className="w-16 h-16 mx-auto mb-6 text-blue-200" />
            <h2 className="text-3xl font-bold mb-4">
              Contact Our Data Protection Team
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              If you have questions about your data rights or need assistance
              with a GDPR request, our Data Protection Team is here to help.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="font-bold mb-2">Email</h3>
                <p className="text-blue-200">ceo@navodhan.com</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Response Time</h3>
                <p className="text-blue-200">Within 30 days</p>
              </div>
              <div>
                <h3 className="font-bold mb-2">Phone</h3>
                <p className="text-blue-200">+91 80898 46983</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
