import React from "react";
import { Trophy, Calendar, Clock, Award } from "lucide-react";
import { UserProgress } from "../../core/types";
import { AIAvatar } from "./AIAvatar";
import { trackProgressEvent, trackEvent } from "../../core/utils/analytics";

interface ProgressDashboardProps {
  progress: UserProgress;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ progress }) => {
  const completionRate = Math.round((progress.completedCourses / progress.totalCourses) * 100);

  // Track dashboard view
  React.useEffect(() => {
    trackEvent('Progress', 'dashboard_view', 'Progress Dashboard');
    trackProgressEvent('view', completionRate, 'Overall Progress');
  }, [completionRate]);

  const stats = [
    {
      icon: <Trophy className="w-6 h-6" />,
      label: 'Courses Completed',
      value: progress.completedCourses,
      total: progress.totalCourses,
      color: 'text-yellow-600 bg-yellow-50'
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      label: 'Current Streak',
      value: progress.currentStreak,
      unit: 'days',
      color: 'text-emerald-600 bg-emerald-50'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: 'Total Hours',
      value: progress.totalHours,
      unit: 'hrs',
      color: 'text-blue-600 bg-blue-50'
    },
    {
      icon: <Award className="w-6 h-6" />,
      label: 'Achievements',
      value: progress.achievements.length,
      color: 'text-blue-600 bg-blue-50'
    }
  ];

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Header with AI Avatar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Learning Journey</h2>
          <p className="text-gray-600">Keep up the great work!</p>
        </div>
        <AIAvatar size="large" emotion="encouraging" isActive />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4">
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${stat.color} mb-3`}>
              {stat.icon}
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {stat.value}{stat.total && `/${stat.total}`}
              {stat.unit && <span className="text-sm text-gray-500 ml-1">{stat.unit}</span>}
            </div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Completion Rate Circle */}
      <div className="bg-gradient-to-r from-blue-50 to-blue-50 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overall Progress</h3>
            <p className="text-gray-600">You're doing amazing! Keep learning.</p>
          </div>
          <div className="relative w-24 h-24">
            <svg className="w-24 h-24 transform -rotate-90">
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-gray-200"
              />
              <circle
                cx="48"
                cy="48"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${2 * Math.PI * 40}`}
                strokeDashoffset={`${2 * Math.PI * 40 * (1 - completionRate / 100)}`}
                className="text-blue-600 transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xl font-bold text-gray-900">{completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-600" />
          Recent Achievements
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {progress.achievements.map((achievement, index) => (
            <div
              key={index}
              className="flex items-center p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => {
                trackEvent('Achievement', 'view', achievement.title);
                trackEvent('Progress', 'achievement_click', achievement.title);
              }}
            >
              <Trophy className="w-8 h-8 text-yellow-600 mr-3" />
              <div>
                <div className="font-medium text-gray-900">{achievement.title}</div>
                <div className="text-xs text-gray-600">Recently earned</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

