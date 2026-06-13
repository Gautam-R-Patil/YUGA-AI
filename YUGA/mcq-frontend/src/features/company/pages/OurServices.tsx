import React from "react";
import { Link } from "react-router-dom";
import { Book, GraduationCap, Briefcase, Languages, Target } from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";

export const OurServices: React.FC = () => {
  const services = [
    {
      icon: <Book className="w-8 h-8" />,
      title: "School Curriculum-Based Teaching",
      description: "Comprehensive AI-powered lessons aligned with school curricula, covering all major subjects and grade levels with interactive learning experiences.",
    },
    {
      icon: <GraduationCap className="w-8 h-8" />,
      title: "Professional Exam Preparation",
      description: "Targeted preparation for competitive exams and professional certifications with adaptive learning paths and mock tests.",
    },
    {
      icon: <Briefcase className="w-8 h-8" />,
      title: "Job Preparation Training",
      description: "Career-focused training programs, interview preparation, and skill development for today's competitive job market.",
    },
    {
      icon: <Book className="w-8 h-8" />,
      title: "University Curriculum-Based Learning",
      description: "Advanced learning solutions for college and university students, covering specialized subjects and academic disciplines.",
    },
    {
      icon: <Languages className="w-8 h-8" />,
      title: "English Learning and Communication Skills",
      description: "Comprehensive English language training with focus on speaking, writing, and communication skills for academic and professional success.",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Career Guidance and Skill Development",
      description: "Personalized career counseling and skill-building programs to help students and professionals achieve their career goals.",
    },
  ];

  return (
    <PageLayout
      title="Our Services"
      subtitle="AI-powered learning solutions for students, professionals, and lifelong learners"
    >
      {/* Introduction */}
      <section className="mb-16">
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Comprehensive AI-Powered Learning
          </h2>
          <div className="prose prose-lg text-gray-600 max-w-4xl mx-auto">
            <p className="mb-4">
              YUGA AI offers a comprehensive range of AI-powered learning services designed to 
              support students, professionals, and aspirants at every stage of their educational 
              and career journey. Our intelligent platform combines expert teaching, adaptive 
              technology, and personalized feedback to make learning more effective and enjoyable.
            </p>
            <p className="text-xl font-semibold text-blue-600">
              At YUGA AI, we believe that learning should be <strong>personal, powerful, and lifelong</strong>.
            </p>
            <p className="mt-4">
              Our mission is to bridge the gap between curiosity and success by bringing 
              AI-powered education to everyone — anytime, anywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                {service.title}
              </h3>
              <p className="text-gray-600 text-center">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Highlight */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Why Choose YUGA AI?</h2>
            <p className="text-xl text-blue-100">
              Experience the future of education with our innovative features
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">AI-Powered</div>
              <div className="text-blue-100">Smart adaptive learning technology</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-blue-100">Always available learning support</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">Personalized</div>
              <div className="text-blue-100">Tailored to your learning style</div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section>
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Join thousands of students and professionals who are already experiencing 
            the future of education with YUGA AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/courses">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium">
                Explore Courses
              </button>
            </Link>
            <Link to="/contact">
              <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium">
                Get Free Demo
              </button>
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
