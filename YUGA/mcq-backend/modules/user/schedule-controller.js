import * as ScheduleService from "./schedule-service.js";

// Generate assessment questions based on subjects
export const generateAssessmentQuestions = async (req, res) => {
  try {
    const { subjectStrengths } = req.body;
    const questions = await ScheduleService.generateAssessmentQuestions(subjectStrengths);
    res.json({ success: true, questions });
  } catch (error) {
    console.error('Error generating assessment questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate assessment questions',
      message: error.message
    });
  }
};

// Generate personalized study schedule based on user data
export const generateStudySchedule = async (req, res) => {
  try {
    const scheduleData = await ScheduleService.generateStudySchedule({ ...req.body, userId: req.user?.id });
    res.json({ success: true, schedule: scheduleData });
  } catch (error) {
    console.error('Error generating study schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate study schedule',
      message: error.message
    });
  }
};

// Update/customize schedule
export const customizeSchedule = async (req, res) => {
  try {
    const { schedule, modifications } = req.body;
    const updatedSchedule = await ScheduleService.customizeSchedule(schedule, modifications);
    res.json({ success: true, schedule: updatedSchedule });
  } catch (error) {
    console.error('Error customizing schedule:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to customize schedule',
      message: error.message
    });
  }
};
