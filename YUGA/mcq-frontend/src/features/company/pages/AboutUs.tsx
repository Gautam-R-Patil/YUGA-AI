import React from "react";
import { Link } from "react-router-dom";
import { Target, Award, Globe, Heart, Lightbulb } from "lucide-react";
import { SEO } from "../../../shared/components/SEO";
import { PageLayout } from "../../../shared/layouts/PageLayout";
import { AIAvatar } from "../../../shared/components/AIAvatar";

export const AboutUs: React.FC = () => {
  const values = [
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Empathy-Driven",
      description:
        "We understand that every learner is unique and deserves personalized attention.",
    },
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovation First",
      description:
        "We constantly push the boundaries of what's possible in AI-powered education.",
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: "Global Impact",
      description:
        "Making quality education accessible to learners worldwide, regardless of location.",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: "Excellence",
      description:
        "We maintain the highest standards in everything we do, from AI models to user experience.",
    },
  ];

  return (
    <PageLayout
      title="About YUGA AI"
      subtitle="Revolutionizing education through artificial intelligence and human-centered design"
    >
      <SEO
        title="About Us"
        description="Learn about YUGA AI's mission to revolutionize education with AI. Meet our team and discover our vision for the future of learning."
        keywords="about YUGA AI, edtech mission, AI education vision, education revolution"
      />
      {/* Our Story */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Who We Are
              </h2>
              <div className="prose prose-lg text-gray-600">
                <p className="mb-4">
                  YUGA AI is an innovative AI-powered learning platform designed to make
                  education smarter, personalized, and accessible for every student. We
                  blend the power of artificial intelligence with the expertise of real
                  teaching methods to make learning simple, visual, and engaging.
                </p>
                <p className="mb-4">
                  Our mission is to create an AI teacher that teaches like a real mentor, using
                  interactive smart whiteboard explanations, AI-generated notes and concept
                  breakdowns, and multilingual support for better understanding.
                </p>
                <p>
                  We aim to empower every student to learn at their own pace — anytime, anywhere.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <div className="relative">
                <AIAvatar size="xl" emotion="teaching" isActive />
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 via-blue-400 to-cyan-400 rounded-full opacity-20 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Vision & Mission */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-white">
            <Target className="w-12 h-12 mb-4 text-blue-200" />
            <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
            <p className="text-blue-100 text-lg">
              To revolutionize the way students learn by bringing high-quality education
              to every corner of the world — guided by intelligent technology, curiosity, and care.
            </p>
          </div>
          <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-2xl p-8 text-white">
            <Lightbulb className="w-12 h-12 mb-4 text-cyan-200" />
            <h3 className="text-2xl font-bold mb-4">Our Story</h3>
            <p className="text-cyan-100 text-lg">
              YUGA AI was founded with a simple belief — "Every student deserves a teacher
              who never gets tired of explaining." Our team of educators, developers, and
              AI researchers came together to build a digital teacher that feels real,
              personal, and supportive — making learning joyful, not stressful.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="mb-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Commitment
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're dedicated to transforming education through responsible AI innovation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section>
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Join Our Mission
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Whether you're a learner, educator, or innovator, there's a place for you
            in the YUGA AI community. Together, we're building the future of education.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium">
                Start Learning Today
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium">
                Get In Touch
              </button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
