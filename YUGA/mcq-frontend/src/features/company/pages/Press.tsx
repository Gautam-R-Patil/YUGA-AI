import React from "react";
import {
  Calendar,
  ExternalLink,
  Download,
  Award,
  Newspaper,
  Users,
} from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";
import { Link } from "react-router-dom";

export const Press: React.FC = () => {
  const pressReleases = [
    {
      id: 1,
      title:
        "YUGA AI Raises $50M Series B to Democratize AI-Powered Education Globally",
      date: "2024-01-15",
      excerpt:
        "Funding will accelerate platform development and expand access to personalized learning for millions of students worldwide.",
      category: "Funding",
      link: "https://news.yugaai.com/releases/1",
    },
    {
      id: 2,
      title:
        "YUGA AI Partners with UNESCO to Bring AI Education to Underserved Communities",
      date: "2023-12-08",
      excerpt:
        "Strategic partnership aims to provide free AI-powered education to 1 million students in developing countries by 2025.",
      category: "Partnership",
      link: "https://news.yugaai.com/releases/2",
    },
    {
      id: 3,
      title:
        'YUGA AI Wins "Best EdTech Innovation" at Global Education Summit 2023',
      date: "2023-11-22",
      excerpt:
        "Recognition for revolutionary AI avatar technology that adapts to individual learning styles and preferences.",
      category: "Award",
      link: "https://news.yugaai.com/releases/3",
    },
    {
      id: 4,
      title: "YUGA AI Launches Multilingual Support for 25 Languages",
      date: "2023-10-10",
      excerpt:
        "Platform expansion breaks down language barriers, making AI-powered education accessible to non-English speakers globally.",
      category: "Product",
      link: "https://news.yugaai.com/releases/4",
    },
  ];

  const mediaKit = [
    {
      title: "Company Logo Pack",
      description: "High-resolution logos in various formats (PNG, SVG, EPS)",
      size: "2.3 MB",
      type: "ZIP",
      url: "/media-kit/logo-pack.zip",
    },
    {
      title: "Executive Headshots",
      description: "Professional photos of leadership team",
      size: "15.7 MB",
      type: "ZIP",
      url: "/media-kit/executive-headshots.zip",
    },
    {
      title: "Product Screenshots",
      description: "High-quality platform interface images",
      size: "8.9 MB",
      type: "ZIP",
      url: "/media-kit/product-screenshots.zip",
    },
    {
      title: "Company Fact Sheet",
      description: "Key statistics and company information",
      size: "1.2 MB",
      type: "PDF",
      url: "/media-kit/company-fact-sheet.pdf",
    },
  ];

  const awards = [
    {
      title: "Best EdTech Innovation 2023",
      organization: "Global Education Summit",
      year: "2023",
    },
    {
      title: "AI Excellence Award",
      organization: "TechCrunch Disrupt",
      year: "2023",
    },
    {
      title: "Top 50 EdTech Companies",
      organization: "EdTech Digest",
      year: "2023",
    },
    {
      title: "Innovation in Learning Award",
      organization: "Learning Technologies",
      year: "2022",
    },
  ];

  const mediaContacts = [
    {
      name: "Praveen R",
      title: "CEO",
      email: "ceo@navodhan.com",
      phone: "+91 80898 46983",
    },
    {
      name: "Press Team",
      title: "Press Contact",
      email: "yuga@navodhan.com",
      phone: "+91 80898 46983",
    },
  ];

  return (
    <PageLayout
      title="Press & Media"
      subtitle="Latest news, updates, and resources for media professionals"
    >
      {/* Latest News */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Latest News</h2>
          <Link
            to="/press/all"
            className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            aria-label="View all press releases"
          >
            <Newspaper className="w-5 h-5 mr-2" />
            View All Press Releases
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {pressReleases.map((release) => (
            <div
              key={release.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {release.category}
                </span>
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(release.date).toLocaleDateString()}
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600 transition-colors">
                <a
                  href={release.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  aria-label={`Read full release: ${release.title}`}
                >
                  {release.title}
                </a>
              </h3>

              <p className="text-gray-600 mb-4">{release.excerpt}</p>

              <a
                href={release.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                aria-label={`Read full release: ${release.title}`}
              >
                Read Full Release
                <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Company Stats */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">YUGA AI by the Numbers</h2>
            <p className="text-xl text-blue-100">
              Key metrics that showcase our impact on global education
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">100K+</div>
              <div className="text-blue-200">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">5M+</div>
              <div className="text-blue-200">Lessons Delivered</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-blue-200">Countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">95%</div>
              <div className="text-blue-200">Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards & Recognition */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <Award className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Awards & Recognition
            </h2>
            <p className="text-xl text-gray-600">
              Industry recognition for our innovation in AI-powered education
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {awards.map((award, index) => (
              <div
                key={index}
                className="flex items-center p-4 border border-gray-200 rounded-lg"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{award.title}</h3>
                  <p className="text-gray-600">
                    {award.organization} • {award.year}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Media Kit */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Media Kit
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mediaKit.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-gray-600 text-sm mb-2">
                    {item.description}
                  </p>
                  <span className="text-xs text-gray-500">
                    {item.size} • {item.type}
                  </span>
                </div>
                <a
                  href={item.url}
                  download
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  aria-label={`Download ${item.title}`}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </a>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <a
              href="/media-kit/complete-media-kit.zip"
              download
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium"
              aria-label="Download Complete Media Kit"
            >
              Download Complete Media Kit
            </a>
          </div>
        </div>
      </section>

      {/* Media Contacts */}
      <section>
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-8">
            <Users className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Media Contacts
            </h2>
            <p className="text-xl text-gray-600">
              Get in touch with our communications team for interviews, quotes,
              and more information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mediaContacts.map((contact, index) => (
              <div
                key={index}
                className="text-center p-6 border border-gray-200 rounded-lg"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {contact.name}
                </h3>
                <p className="text-blue-600 font-medium mb-4">
                  {contact.title}
                </p>
                <div className="space-y-2">
                  <p className="text-gray-600">
                    <a
                      href={`mailto:${contact.email}`}
                      className="hover:text-blue-600 transition-colors"
                      aria-label={`Email ${contact.name}`}
                    >
                      {contact.email}
                    </a>
                  </p>
                  <p className="text-gray-600">
                    <a
                      href={`tel:${contact.phone}`}
                      className="hover:text-blue-600 transition-colors"
                      aria-label={`Call ${contact.name}`}
                    >
                      {contact.phone}
                    </a>
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">
              For general press inquiries, please email us at{" "}
              <a
                href="mailto:yuga@navodhan.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
                aria-label="Email general press inquiries"
              >
                yuga@navodhan.com
              </a>
            </p>
            <p className="text-sm text-gray-500">
              We typically respond to media inquiries within 24 hours during
              business days.
            </p>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
