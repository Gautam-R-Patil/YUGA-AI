import React, { useState } from "react";
import {
  MapPin,
  Clock,
  DollarSign,
  Users,
  Briefcase,
  Heart,
  Zap,
  Globe,
} from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";

export const Careers: React.FC = () => {
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  const benefits = [
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Health & Wellness",
      description:
        "Comprehensive health insurance, mental health support, and wellness programs",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Learning & Growth",
      description:
        "Unlimited learning budget, conference attendance, and skill development programs",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Remote-First",
      description:
        "Work from anywhere with flexible hours and home office setup allowance",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Inclusive Culture",
      description:
        "Diverse, inclusive environment with employee resource groups and mentorship",
    },
  ];

  const jobOpenings = [
    {
      id: 1,
      title: "Senior AI Research Scientist",
      department: "Engineering",
      location: "Thiruvananthapuram, Kerala / Remote",
      type: "Full-time",
      salary: "₹25,00,000 - ₹35,00,000",
      description:
        "Lead research in natural language processing and machine learning for educational applications.",
      requirements: [
        "PhD in AI/ML or related field",
        "5+ years research experience",
        "Published papers in top-tier conferences",
      ],
    },
    {
      id: 2,
      title: "Product Manager - AI Education",
      department: "Product",
      location: "Thiruvananthapuram, Kerala / Remote",
      type: "Full-time",
      salary: "₹20,00,000 - ₹25,00,000",
      description:
        "Drive product strategy for our AI-powered educational platform and avatar interactions.",
      requirements: [
        "5+ years product management experience",
        "EdTech background preferred",
        "Strong analytical skills",
      ],
    },
    {
      id: 3,
      title: "Frontend Engineer - React/TypeScript",
      department: "Engineering",
      location: "Thiruvananthapuram, Kerala / Remote",
      type: "Full-time",
      salary: "₹12,00,000 - ₹20,00,000",
      description:
        "Build beautiful, responsive user interfaces for our educational platform.",
      requirements: [
        "3+ years React experience",
        "TypeScript proficiency",
        "UI/UX design sensibility",
      ],
    },
    {
      id: 4,
      title: "Educational Content Designer",
      department: "Content",
      location: "Thiruvananthapuram, Kerala / Remote",
      type: "Full-time",
      salary: "₹6,00,000 - ₹12,00,000",
      description:
        "Create engaging educational content and curriculum for AI-powered learning experiences.",
      requirements: [
        "Education or instructional design background",
        "Content creation experience",
        "Understanding of learning theory",
      ],
    },
    {
      id: 5,
      title: "DevOps Engineer",
      department: "Engineering",
      location: "Thiruvananthapuram, Kerala / Remote",
      type: "Full-time",
      salary: "₹15,00,000 - ₹25,00,000",
      description:
        "Scale our infrastructure to support millions of learners worldwide.",
      requirements: [
        "AWS/GCP experience",
        "Kubernetes proficiency",
        "CI/CD pipeline expertise",
      ],
    },
    {
      id: 6,
      title: "UX Researcher",
      department: "Design",
      location: "Thiruvananthapuram, Kerala / Remote",
      type: "Full-time",
      salary: "₹10,00,000 - ₹18,00,000",
      description:
        "Conduct user research to improve learning outcomes and user experience.",
      requirements: [
        "UX research experience",
        "Quantitative and qualitative methods",
        "EdTech experience preferred",
      ],
    },
  ];

  const departments = [
    "all",
    "Engineering",
    "Product",
    "Design",
    "Content",
    "Marketing",
    "Operations",
  ];

  const filteredJobs =
    selectedDepartment === "all"
      ? jobOpenings
      : jobOpenings.filter((job) => job.department === selectedDepartment);

  return (
    <PageLayout
      title="Careers at YUGA AI"
      subtitle="Join us in revolutionizing education through artificial intelligence"
    >
      {/* Why Work Here */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Work at YUGA AI?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Be part of a mission-driven team that's transforming how the world
              learns. We're building the future of education from Thiruvananthapuram, Kerala.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {benefit.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {benefit.title}
                </h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture & Values */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Culture</h2>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-blue-100">
                    <strong className="text-white">Innovation-First:</strong> We
                    encourage bold ideas and creative problem-solving
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-blue-100">
                    <strong className="text-white">Collaborative:</strong>{" "}
                    Cross-functional teams working together toward common goals
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-blue-100">
                    <strong className="text-white">Impact-Driven:</strong> Every
                    role directly contributes to democratizing education
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-200 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-blue-100">
                    <strong className="text-white">Growth-Oriented:</strong>{" "}
                    Continuous learning and development opportunities
                  </p>
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="bg-white bg-opacity-10 rounded-2xl p-8">
                <div className="text-4xl font-bold mb-2">95%</div>
                <div className="text-blue-200 mb-4">
                  Employee Satisfaction
                </div>
                <div className="text-4xl font-bold mb-2">4.8/5</div>
                <div className="text-blue-200 mb-4">Glassdoor Rating</div>
                <div className="text-4xl font-bold mb-2">50+</div>
                <div className="text-blue-200">Countries Represented</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Openings */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Open Positions
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join our growing team and help us build the future of AI-powered
            education from Kerala, India
          </p>

          {/* Department Filter */}
          <div className="flex flex-wrap justify-center gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDepartment === dept
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {dept === "all" ? "All Departments" : dept}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {job.title}
                    </h3>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                      {job.department}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {job.location}
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {job.type}
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="w-4 h-4 mr-1" />
                      {job.salary}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-3">{job.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {job.requirements.map((req, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs"
                      >
                        {req}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 lg:mt-0 lg:ml-6">
                  <button
                    onClick={() =>
                      window.open(
                        `mailto:yuga@navodhan.com?subject=Application for ${job.title}&body=Please find my application attached for the ${job.title} position.`,
                        "_blank"
                      )
                    }
                    className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No openings in this department
            </h3>
            <p className="text-gray-500">
              Check back soon or explore other departments
            </p>
          </div>
        )}
      </section>

      {/* Application Process */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Our Hiring Process
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Application</h3>
              <p className="text-gray-600 text-sm">
                Submit your application and we'll review it within 48 hours
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Phone Screen</h3>
              <p className="text-gray-600 text-sm">
                30-minute conversation with our talent team
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-gray-900 mb-2">
                Technical Interview
              </h3>
              <p className="text-gray-600 text-sm">
                Role-specific assessment with team members
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-lg">
                4
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Final Interview</h3>
              <p className="text-gray-600 text-sm">
                Meet with leadership and discuss your future at YUGA AI
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section>
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Don't See the Right Role?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            We're always looking for exceptional talent. Send us your resume and
            tell us how you'd like to contribute to our mission.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-all duration-200 font-medium"
              onClick={() =>
                window.open(
                  "mailto:yuga@navodhan.com?subject=General Application&body=Please find my general application attached.",
                  "_blank"
                )
              }
            >
              Send General Application
            </button>
            <button
              className="px-8 py-3 border-2 border-white text-white rounded-lg hover:bg-white hover:text-blue-600 transition-all duration-200 font-medium"
              onClick={() =>
                window.open(
                  "mailto:ceo@navodhan.com?subject=Talent Network&body=I would like to join your talent network.",
                  "_blank"
                )
              }
            >
              Join Our Talent Network
            </button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
