export { api, apiRequest } from "./api";
export {
  trackPageView,
  trackEvent,
  trackAuthEvent,
  trackCourseEvent,
  trackLessonEvent,
  trackAIEvent,
  trackDoubtEvent,
  trackAssessmentEvent,
  trackProgressEvent,
  setUserProperties,
  setUserId,
  trackTiming,
  initGA,
} from "./analytics";
export { formatScientificText } from "./textFormatting";
export {
  resolveAudioMime,
  createAudioBlobFromBase64,
  createObjectUrlFromBase64Audio,
  createAudioDataUrl,
} from "./audio";
export * from "./mockData";

