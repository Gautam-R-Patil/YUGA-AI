import React, { useState } from "react";
import { Users, MessageSquare, Heart, Star, Search, Filter, TrendingUp, Award, Calendar } from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";

export const Community: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Discussions', count: 1247 },
    { id: 'general', name: 'General', count: 423 },
    { id: 'ai-avatars', name: 'AI Avatars', count: 312 },
    { id: 'courses', name: 'Courses', count: 289 },
    { id: 'technical', name: 'Technical Help', count: 156 },
    { id: 'feedback', name: 'Feedback', count: 67 }
  ];

  const discussions = [
    {
      id: 1,
      title: 'How to get the most out of AI avatar interactions?',
      author: 'Sarah Chen',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'ai-avatars',
      replies: 23,
      likes: 45,
      views: 312,
      lastActivity: '2 hours ago',
      isPinned: true,
      tags: ['tips', 'ai-avatar', 'learning']
    },
    {
      id: 2,
      title: 'Best practices for machine learning course progression',
      author: 'Alex Rodriguez',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'courses',
      replies: 18,
      likes: 32,
      views: 245,
      lastActivity: '4 hours ago',
      isPinned: false,
      tags: ['machine-learning', 'study-tips']
    },
    {
      id: 3,
      title: 'Feature request: Dark mode for the platform',
      author: 'Maya Patel',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'feedback',
      replies: 67,
      likes: 128,
      views: 892,
      lastActivity: '6 hours ago',
      isPinned: false,
      tags: ['feature-request', 'ui-ux']
    },
    {
      id: 4,
      title: 'Troubleshooting video playback issues on mobile',
      author: 'David Kim',
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'technical',
      replies: 12,
      likes: 19,
      views: 156,
      lastActivity: '8 hours ago',
      isPinned: false,
      tags: ['mobile', 'video', 'troubleshooting']
    }
  ];

  const topContributors = [
    {
      name: 'Dr. Emily Watson',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
      posts: 156,
      reputation: 2847,
      badge: 'Expert'
    },
    {
      name: 'Marcus Johnson',
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=100',
      posts: 134,
      reputation: 2156,
      badge: 'Mentor'
    },
    {
      name: 'Lisa Zhang',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=100',
      posts: 98,
      reputation: 1789,
      badge: 'Helper'
    }
  ];

  const communityStats = [
    {
      label: 'Total Members',
      value: '25.4K',
      icon: <Users className="w-6 h-6" />,
      growth: '+12%'
    },
    {
      label: 'Discussions',
      value: '1.2K',
      icon: <MessageSquare className="w-6 h-6" />,
      growth: '+8%'
    },
    {
      label: 'Solutions',
      value: '3.8K',
      icon: <Star className="w-6 h-6" />,
      growth: '+15%'
    },
    {
      label: 'Active Today',
      value: '892',
      icon: <TrendingUp className="w-6 h-6" />,
      growth: '+5%'
    }
  ];

  const events = [
    {
      title: 'AI in Education Webinar',
      date: '2024-01-25',
      time: '2:00 PM PST',
      attendees: 234,
      type: 'Webinar'
    },
    {
      title: 'Community Q&A Session',
      date: '2024-01-30',
      time: '11:00 AM PST',
      attendees: 156,
      type: 'Live Session'
    }
  ];

  const filteredDiscussions = discussions.filter(discussion => {
    const matchesCategory = selectedCategory === 'all' || discussion.category === selectedCategory;
    const matchesSearch = discussion.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         discussion.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <PageLayout 
      title="Community" 
      subtitle="Connect with fellow learners, share knowledge, and get help from the YUGA AI community"
    >
      {/* Community Stats */}
      <section className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {communityStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                  {stat.icon}
                </div>
                <span className="text-green-600 text-sm font-medium">{stat.growth}</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Search and Filters */}
      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search discussions, topics, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 transition-all duration-200 font-medium">
              New Discussion
            </button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Categories</h3>
            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-medium">{category.name}</span>
                  <span className="text-sm text-gray-500">{category.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top Contributors</h3>
            <div className="space-y-4">
              {topContributors.map((contributor, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <img
                    src={contributor.avatar}
                    alt={contributor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{contributor.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        contributor.badge === 'Expert' ? 'bg-blue-100 text-blue-700' :
                        contributor.badge === 'Mentor' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {contributor.badge}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{contributor.reputation} reputation</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Upcoming Events</h3>
            <div className="space-y-4">
              {events.map((event, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">{event.type}</span>
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">{event.title}</h4>
                  <p className="text-sm text-gray-600">{event.date} at {event.time}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.attendees} attending</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="space-y-4">
            {filteredDiscussions.map((discussion) => (
              <div key={discussion.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start space-x-4">
                  <img
                    src={discussion.avatar}
                    alt={discussion.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          {discussion.isPinned && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              Pinned
                            </span>
                          )}
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                            {categories.find(c => c.id === discussion.category)?.name}
                          </span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer">
                          {discussion.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                          <span>by {discussion.author}</span>
                          <span>{discussion.lastActivity}</span>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {discussion.tags.map((tag, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-4 h-4" />
                          <span>{discussion.replies} replies</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-4 h-4" />
                          <span>{discussion.likes} likes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{discussion.views} views</span>
                        </div>
                      </div>
                      <button className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium">
                        Join Discussion
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredDiscussions.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No discussions found</h3>
              <p className="text-gray-500">Try adjusting your search or browse different categories</p>
            </div>
          )}
        </div>
      </div>

      {/* Community Guidelines */}
      <section className="mt-16">
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white">
          <div className="text-center mb-8">
            <Award className="w-16 h-16 mx-auto mb-4 text-blue-200" />
            <h2 className="text-3xl font-bold mb-4">Community Guidelines</h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Help us maintain a welcoming and productive environment for all learners
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="font-bold mb-2">Be Respectful</h3>
              <p className="text-blue-200 text-sm">Treat all community members with kindness and respect</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold mb-2">Stay On Topic</h3>
              <p className="text-blue-200 text-sm">Keep discussions relevant to learning and education</p>
            </div>
            <div className="text-center">
              <h3 className="font-bold mb-2">Help Others</h3>
              <p className="text-blue-200 text-sm">Share knowledge and support fellow learners</p>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
