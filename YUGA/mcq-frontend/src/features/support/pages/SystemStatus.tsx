import React from "react";
import { CheckCircle, AlertTriangle, XCircle, Clock, Activity, Server, Globe, Database } from "lucide-react";
import { PageLayout } from "../../../shared/layouts/PageLayout";

export const SystemStatus: React.FC = () => {
  const currentStatus = 'operational'; // operational, degraded, outage

  const services = [
    {
      name: 'AI Avatar Service',
      status: 'operational',
      uptime: '99.98%',
      responseTime: '120ms',
      description: 'Interactive AI tutors and avatar functionality'
    },
    {
      name: 'Course Platform',
      status: 'operational',
      uptime: '99.95%',
      responseTime: '85ms',
      description: 'Course delivery and learning management system'
    },
    {
      name: 'User Authentication',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '45ms',
      description: 'Login, registration, and account management'
    },
    {
      name: 'Video Streaming',
      status: 'degraded',
      uptime: '99.87%',
      responseTime: '250ms',
      description: 'Video content delivery and streaming services'
    },
    {
      name: 'Doubt Solver API',
      status: 'operational',
      uptime: '99.96%',
      responseTime: '95ms',
      description: 'AI-powered question answering system'
    },
    {
      name: 'Mobile Apps',
      status: 'operational',
      uptime: '99.94%',
      responseTime: '110ms',
      description: 'iOS and Android mobile applications'
    }
  ];

  const incidents = [
    {
      id: 1,
      title: 'Intermittent video streaming delays',
      status: 'investigating',
      severity: 'minor',
      startTime: '2024-01-15 14:30 UTC',
      description: 'Some users may experience slower video loading times. Our team is investigating the issue.',
      updates: [
        {
          time: '2024-01-15 15:45 UTC',
          message: 'We have identified the cause and are implementing a fix. Expected resolution within 2 hours.'
        },
        {
          time: '2024-01-15 14:30 UTC',
          message: 'We are investigating reports of slower video streaming performance.'
        }
      ]
    }
  ];

  const maintenanceSchedule = [
    {
      title: 'Database optimization',
      date: '2024-01-20',
      time: '02:00 - 04:00 UTC',
      impact: 'Minor performance improvements, no downtime expected',
      services: ['Course Platform', 'User Authentication']
    },
    {
      title: 'AI model updates',
      date: '2024-01-25',
      time: '01:00 - 03:00 UTC',
      impact: 'Enhanced AI responses, brief interruption possible',
      services: ['AI Avatar Service', 'Doubt Solver API']
    }
  ];

  const metrics = [
    {
      label: 'Overall Uptime',
      value: '99.96%',
      period: 'Last 30 days',
      icon: <Activity className="w-6 h-6" />
    },
    {
      label: 'Response Time',
      value: '95ms',
      period: 'Average',
      icon: <Clock className="w-6 h-6" />
    },
    {
      label: 'Active Users',
      value: '98.2K',
      period: 'Currently online',
      icon: <Globe className="w-6 h-6" />
    },
    {
      label: 'API Requests',
      value: '2.4M',
      period: 'Last 24 hours',
      icon: <Server className="w-6 h-6" />
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'outage':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'outage':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-green-600 bg-green-50 border-green-200';
    }
  };

  return (
    <PageLayout 
      title="System Status" 
      subtitle="Real-time status and performance metrics for all YUGA AI services"
    >
      {/* Overall Status */}
      <section className="mb-12">
        <div className={`rounded-2xl p-8 border-2 ${getStatusColor(currentStatus)}`}>
          <div className="flex items-center justify-center mb-4">
            {getStatusIcon(currentStatus)}
            <h2 className="text-2xl font-bold ml-3">
              {currentStatus === 'operational' ? 'All Systems Operational' :
               currentStatus === 'degraded' ? 'Some Systems Degraded' :
               'System Outage Detected'}
            </h2>
          </div>
          <p className="text-center text-lg">
            {currentStatus === 'operational' 
              ? 'All YUGA AI services are running smoothly with optimal performance.'
              : 'We are experiencing some issues and are working to resolve them quickly.'
            }
          </p>
        </div>
      </section>

      {/* Key Metrics */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Performance Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white">
                  {metric.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="text-gray-600 font-medium mb-1">{metric.label}</div>
              <div className="text-sm text-gray-500">{metric.period}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Service Status */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Service Status</h2>
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {services.map((service, index) => (
              <div key={index} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(service.status)}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{service.name}</h3>
                      <p className="text-gray-600 text-sm">{service.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <div>
                        <div className="font-medium">Uptime</div>
                        <div>{service.uptime}</div>
                      </div>
                      <div>
                        <div className="font-medium">Response</div>
                        <div>{service.responseTime}</div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(service.status)}`}>
                        {service.status}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Current Incidents */}
      {incidents.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Current Incidents</h2>
          <div className="space-y-6">
            {incidents.map((incident) => (
              <div key={incident.id} className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      <h3 className="text-xl font-bold text-gray-900">{incident.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        incident.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        incident.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {incident.severity}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{incident.description}</p>
                    <p className="text-sm text-gray-500">Started: {incident.startTime}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    incident.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    incident.status === 'monitoring' ? 'bg-blue-100 text-blue-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {incident.status}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Updates</h4>
                  <div className="space-y-3">
                    {incident.updates.map((update, updateIndex) => (
                      <div key={updateIndex} className="flex space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                        <div>
                          <p className="text-gray-600">{update.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{update.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Scheduled Maintenance */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Scheduled Maintenance</h2>
        <div className="space-y-4">
          {maintenanceSchedule.map((maintenance, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Database className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{maintenance.title}</h3>
                    <p className="text-gray-600 mb-2">{maintenance.impact}</p>
                    <div className="flex flex-wrap gap-2">
                      {maintenance.services.map((service, serviceIndex) => (
                        <span key={serviceIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium text-gray-900">{maintenance.date}</div>
                  <div className="text-sm text-gray-600">{maintenance.time}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section>
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-cyan-500 rounded-2xl p-8 md:p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Informed</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Subscribe to status updates and get notified about incidents, maintenance, and service improvements.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500"
            />
            <button className="px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};
