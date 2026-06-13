import ReactGA from "react-ga4";

// Initialize Google Analytics
export const initGA = () => {
  const measurementId = import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID;
  
  if (measurementId && measurementId !== 'G-XXXXXXXXXX') {
    try {
      ReactGA.initialize(measurementId, {
        gaOptions: {
          send_page_view: false,
          cookie_flags: 'SameSite=None;Secure',
        },
        gtagOptions: {
          anonymize_ip: true,
          cookie_expires: 63072000, // 2 years
        },
      });
      console.log('Google Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Google Analytics:', error);
    }
  } else {
    console.warn('Google Analytics Measurement ID not found. Analytics disabled.');
  }
};

// Track page views
export const trackPageView = (path: string) => {
  try {
    ReactGA.send({ hitType: 'pageview', page: path });
  } catch (error) {
    console.warn('Failed to track page view:', error);
  }
};

// Track custom events
export const trackEvent = (
  category: string,
  action: string,
  label?: string,
  value?: number
) => {
  try {
    ReactGA.event({
      category,
      action,
      label,
      value,
    });
  } catch (error) {
    console.warn('Failed to track event:', error);
  }
};

// Track user authentication events
export const trackAuthEvent = (action: string, method: string = 'email') => {
  try {
    trackEvent('Authentication', action, method);
  } catch (error) {
    console.warn('Failed to track auth event:', error);
  }
};

// Track course interactions
export const trackCourseEvent = (action: string, courseName: string, courseId?: string) => {
  try {
    trackEvent('Course', action, `${courseName}${courseId ? ` (${courseId})` : ''}`);
  } catch (error) {
    console.warn('Failed to track course event:', error);
  }
};

// Track lesson interactions
export const trackLessonEvent = (action: string, lessonName: string, courseName: string) => {
  try {
    trackEvent('Lesson', action, `${lessonName} - ${courseName}`);
  } catch (error) {
    console.warn('Failed to track lesson event:', error);
  }
};

// Track AI interactions
export const trackAIEvent = (action: string, feature: string) => {
  try {
    trackEvent('AI Interaction', action, feature);
  } catch (error) {
    console.warn('Failed to track AI event:', error);
  }
};

// Track doubt solving
export const trackDoubtEvent = (action: string, subject?: string) => {
  try {
    trackEvent('Doubt Solving', action, subject);
  } catch (error) {
    console.warn('Failed to track doubt event:', error);
  }
};

// Track quiz/assessment events
export const trackAssessmentEvent = (action: string, score?: number, total?: number) => {
  try {
    trackEvent('Assessment', action, score !== undefined ? `Score: ${score}/${total}` : undefined);
  } catch (error) {
    console.warn('Failed to track assessment event:', error);
  }
};

// Track user progress
export const trackProgressEvent = (action: string, progress: number, courseName: string) => {
  try {
    trackEvent('Progress', action, `${courseName} - ${progress}%`, progress);
  } catch (error) {
    console.warn('Failed to track progress event:', error);
  }
};

// Set user properties
export const setUserProperties = (properties: Record<string, string | number | boolean>) => {
  try {
    ReactGA.set(properties);
  } catch (error) {
    console.warn('Failed to set user properties:', error);
  }
};

// Track user ID for cross-device tracking
export const setUserId = (userId: string) => {
  try {
    ReactGA.set({ userId });
  } catch (error) {
    console.warn('Failed to set user ID:', error);
  }
};

// Track timing (performance metrics)
export const trackTiming = (category: string, variable: string, value: number, label?: string) => {
  try {
    ReactGA.event({
      category: 'Timing',
      action: `${category}_${variable}`,
      label,
      value: Math.round(value),
    });
  } catch (error) {
    console.warn('Failed to track timing:', error);
  }
};

// Track errors
export const trackError = (description: string, fatal: boolean = false) => {
  try {
    ReactGA.event({
      category: 'Error',
      action: 'error_occurred',
      label: description,
      value: fatal ? 1 : 0,
    });
  } catch (error) {
    console.warn('Failed to track error:', error);
  }
};

// Track engagement time
export const trackEngagement = (timeInSeconds: number, contentType: string) => {
  try {
    trackEvent('Engagement', 'time_spent', contentType, timeInSeconds);
  } catch (error) {
    console.warn('Failed to track engagement:', error);
  }
};

// Track search
export const trackSearch = (searchTerm: string, resultCount?: number) => {
  try {
    ReactGA.event({
      category: 'Search',
      action: 'search_performed',
      label: searchTerm,
      value: resultCount,
    });
  } catch (error) {
    console.warn('Failed to track search:', error);
  }
};

// Track video interactions
export const trackVideoEvent = (action: string, videoTitle: string, timestamp?: number) => {
  try {
    ReactGA.event({
      category: 'Video',
      action,
      label: videoTitle,
      value: timestamp ? Math.round(timestamp) : undefined,
    });
  } catch (error) {
    console.warn('Failed to track video event:', error);
  }
};

// Track button clicks
export const trackButtonClick = (buttonName: string, location: string) => {
  try {
    trackEvent('Button', 'click', `${buttonName} - ${location}`);
  } catch (error) {
    console.warn('Failed to track button click:', error);
  }
};

// Track feature usage
export const trackFeatureUsage = (featureName: string, action: string) => {
  try {
    trackEvent('Feature', action, featureName);
  } catch (error) {
    console.warn('Failed to track feature usage:', error);
  }
};

// Track social sharing
export const trackSocialShare = (platform: string, contentType: string, contentId?: string) => {
  try {
    trackEvent('Social', 'share', `${platform} - ${contentType}${contentId ? ` - ${contentId}` : ''}`);
  } catch (error) {
    console.warn('Failed to track social share:', error);
  }
};
