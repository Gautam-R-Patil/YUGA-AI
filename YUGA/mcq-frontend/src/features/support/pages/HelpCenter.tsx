import React, { useState } from "react";
import { ChatInterface } from "../../../shared/components/ChatInterface";
import {
  Search,
  Book,
  MessageCircle,
  Video,
  FileText,
  ChevronRight,
  Star,
} from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";
import { useNavigate } from "react-router-dom";

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    { id: "all", name: "All Topics", icon: <Book className="w-5 h-5" /> },
    {
      id: "getting-started",
      name: "Getting Started",
      icon: <Star className="w-5 h-5" />,
    },
    {
      id: "courses",
      name: "Courses & Learning",
      icon: <Video className="w-5 h-5" />,
    },
    {
      id: "ai-avatar",
      name: "AI Avatar",
      icon: <MessageCircle className="w-5 h-5" />,
    },
    {
      id: "account",
      name: "Account & Billing",
      icon: <FileText className="w-5 h-5" />,
    },
  ];

  const articles = [
    {
      id: 1,
      title: "How to get started with YUGA AI",
      category: "getting-started",
      views: 15420,
      helpful: 98,
      excerpt:
        "Learn the basics of navigating the platform and starting your first course.",
    },
    {
      id: 2,
      title: "Understanding AI Avatar interactions",
      category: "ai-avatar",
      views: 12350,
      helpful: 95,
      excerpt:
        "Discover how to effectively communicate with your AI tutor for better learning outcomes.",
    },
    {
      id: 3,
      title: "Customizing your learning preferences",
      category: "courses",
      views: 9870,
      helpful: 92,
      excerpt:
        "Personalize your learning experience by setting preferences and goals.",
    },
    {
      id: 4,
      title: "Managing your subscription and billing",
      category: "account",
      views: 8650,
      helpful: 89,
      excerpt:
        "Everything you need to know about payments, upgrades, and cancellations.",
    },
    {
      id: 5,
      title: "Troubleshooting video playback issues",
      category: "courses",
      views: 7230,
      helpful: 87,
      excerpt: "Solutions for common video and audio problems during lessons.",
    },
    {
      id: 6,
      title: "Using the doubt solver feature",
      category: "ai-avatar",
      views: 6890,
      helpful: 94,
      excerpt:
        "Get instant answers to your questions with our AI-powered doubt resolution system.",
    },
  ];

  const quickActions = [
    {
      title: "Start a Live Chat",
      description: "Get instant help from our support team",
      icon: <MessageCircle className="w-8 h-8" />,
      action: "chat",
    },
    {
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      icon: <Video className="w-8 h-8" />,
      action: "videos",
    },
    {
      title: "Contact Support",
      description: "Send us a detailed message",
      icon: <FileText className="w-8 h-8" />,
      action: "contact",
    },
  ];

  const filteredArticles = articles.filter((article) => {
    const matchesCategory =
      selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  function handleQuickAction(action: string) {
    switch (action) {
      case "chat":
        setIsChatOpen(true);
        break;
      case "videos":
        navigate("/help-center/videos");
        break;
      case "contact":
        navigate("/contact");
        break;
      default:
        break;
    }
  }

  function handleArticleClick(articleId: number) {
    navigate(`/help-center/article/${articleId}`);
  }

  function handleContactSupport() {
    navigate("/contact");
  }

  function handleJoinCommunity() {
    navigate("/community");
  }

  return (
    <>
      <PageLayout
        title="Help Center"
        subtitle="Find answers to your questions and get the most out of YUGA AI"
      >
        <section className="mb-12">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="w-6 h-6 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search for help articles, tutorials, and guides..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg"
              />
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Need Immediate Help?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <div
                key={index}
                tabIndex={0}
                role="button"
                onClick={() => handleQuickAction(action.action)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleQuickAction(action.action);
                  }
                }}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white">
                  {action.icon}
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {action.title}
                </h3>
                <p className="text-gray-600 mb-4">{action.description}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuickAction(action.action);
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </section>
        {/* Quick Actions */}

        {/* Categories and Articles */}
        <section className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Browse by Category
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-pressed={selectedCategory === category.id}
                  >
                    {category.icon}
                    <span className="font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Articles */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedCategory === "all"
                    ? "All Articles"
                    : categories.find((c) => c.id === selectedCategory)?.name}
                </h3>
                <span className="text-gray-600">
                  {filteredArticles.length} articles
                </span>
              </div>

              <div className="space-y-4">
                {filteredArticles.length > 0 ? (
                  filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      tabIndex={0}
                      role="button"
                      onClick={() => handleArticleClick(article.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleArticleClick(article.id);
                        }
                      }}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label={`Read article: ${article.title}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                            {article.title}
                          </h4>
                          <p className="text-gray-600 mb-3">
                            {article.excerpt}
                          </p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{article.views.toLocaleString()} views</span>
                            <span>{article.helpful}% found this helpful</span>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-400 ml-4" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-gray-600 mb-2">
                      No articles found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search or browse different categories
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Popular Topics */}
        <section className="mb-12">
          <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white">
            <h2 className="text-3xl font-bold mb-6 text-center">
              Popular Topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-bold mb-2">Course Navigation</h3>
                <p className="text-blue-100 text-sm">
                  Learn how to navigate through courses and track your progress
                </p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-bold mb-2">AI Avatar Features</h3>
                <p className="text-blue-100 text-sm">
                  Discover all the capabilities of your AI learning companion
                </p>
              </div>
              <div className="bg-white bg-opacity-10 rounded-lg p-4">
                <h3 className="font-bold mb-2">Account Settings</h3>
                <p className="text-blue-100 text-sm">
                  Manage your profile, preferences, and subscription settings
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Still Need Help */}
        <section>
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Can't find what you're looking for? Our support team is here to
              help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContactSupport}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium"
              >
                Contact Support
              </button>
              <button
                onClick={handleJoinCommunity}
                className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium"
              >
                Join Community Forum
              </button>
            </div>
          </div>
        </section>
        {/* More sections here like Categories, Articles, etc. */}
      </PageLayout>

      {/* Render ChatInterface if open */}
      {isChatOpen && (
        <ChatInterface
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />
      )}
    </>
  );
};

