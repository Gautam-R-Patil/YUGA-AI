import React from "react";
import { Link } from "react-router-dom";
import { Target, Globe, Users, Zap, BookOpen, Heart } from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";
import { AIAvatar } from "../../../shared/components/AIAvatar";

export const OurMission: React.FC = () => {
  const pillars = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Personalized Learning",
      description:
        "Every learner is unique. Our AI adapts to individual learning styles, pace, and preferences to create truly personalized educational experiences.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Accessibility",
      description:
        "Breaking down geographical and economic barriers to quality education, making world-class learning accessible to anyone with an internet connection.",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Instant Support",
      description:
        "No more waiting for help. Our AI tutors provide immediate assistance, explanations, and guidance whenever learners need it.",
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Comprehensive Curriculum",
      description:
        "From basic skills to advanced concepts, our platform covers a wide range of subjects with depth and expertise.",
    },
  ];

  const goals = [
    {
      title: "Democratize Education",
      description:
        "Make high-quality education accessible to every person on Earth, regardless of their location, economic status, or background.",
      progress: 75,
    },
    {
      title: "Eliminate Learning Barriers",
      description:
        "Remove traditional obstacles like language barriers, learning disabilities, and time constraints through adaptive AI technology.",
      progress: 60,
    },
    {
      title: "Foster Lifelong Learning",
      description:
        "Create an environment where continuous learning is natural, enjoyable, and seamlessly integrated into daily life.",
      progress: 85,
    },
    {
      title: "Empower Educators",
      description:
        "Provide teachers and institutions with powerful AI tools to enhance their teaching effectiveness and reach more students.",
      progress: 70,
    },
  ];

  return (
    <PageLayout
      title="Our Mission"
      subtitle="Democratizing education through AI to create a world where everyone can learn, grow, and thrive"
    >
      {/* Mission Statement */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <Target className="w-8 h-8 text-blue-600 mr-3" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Our Mission
                </h2>
              </div>
              <div className="prose prose-lg text-gray-600">
                <p className="text-xl mb-6 font-medium text-gray-800">
                  To democratize education by harnessing the power of artificial
                  intelligence, making personalized, high-quality learning
                  accessible to every person on Earth.
                </p>
                <p className="mb-4">
                  We believe that education is the most powerful tool for human
                  advancement. Yet billions of people worldwide lack access to
                  quality educational resources due to geographical, economic,
                  or social barriers.
                </p>
                <p className="mb-4">
                  YUGA AI exists to change this reality. Through cutting-edge AI
                  technology, we're creating a future where every individual can
                  access personalized tutoring, instant doubt resolution, and
                  adaptive learning experiences that were once available only to
                  the privileged few.
                </p>
                <p>
                  Our mission extends beyond just providing education – we're
                  building a global community of learners, educators, and
                  innovators who believe in the transformative power of
                  knowledge.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 bg-gradient-to-r from-blue-100 via-blue-100 to-cyan-100 rounded-full flex items-center justify-center">
                  <AIAvatar size="xl" emotion="teaching" isActive />
                </div>
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-blue-400 to-cyan-400 rounded-full opacity-10 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Pillars */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Core Pillars
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Four fundamental principles that guide our approach to
            revolutionizing education
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pillars.map((pillar, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                  {pillar.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {pillar.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {pillar.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision Statement */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center">
            <Heart className="w-16 h-16 mx-auto mb-6 text-blue-200" />
            <h2 className="text-3xl font-bold mb-6">Our Vision</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
              We envision a world where learning knows no boundaries – where a
              child in rural Africa can access the same quality education as a
              student in Silicon Valley, where language is no barrier to
              knowledge, and where every person has an AI tutor that understands
              their unique needs and helps them reach their full potential.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold mb-2">1 Billion</div>
                <div className="text-blue-200">Learners by 2030</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">100+</div>
                <div className="text-blue-200">Languages Supported</div>
              </div>
              <div>
                <div className="text-3xl font-bold mb-2">Zero</div>
                <div className="text-blue-200">Learning Barriers</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Goals */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Strategic Goals
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our roadmap to transforming global education through measurable
            impact and innovation
          </p>
        </div>

        <div className="space-y-8">
          {goals.map((goal, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {goal.title}
                  </h3>
                  <p className="text-gray-600">{goal.description}</p>
                </div>
                <div className="ml-6 text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {goal.progress}%
                  </div>
                  <div className="text-sm text-gray-500">Progress</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-500"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section>
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Be Part of the Mission
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join millions of learners, educators, and innovators who are already
            part of the YUGA AI community. Together, we're not just changing
            education – we're changing the world.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium">
                Start Your Journey
              </button>
            </Link>

            <Link to="/contact">
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium">
                Partner With Us
              </button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

