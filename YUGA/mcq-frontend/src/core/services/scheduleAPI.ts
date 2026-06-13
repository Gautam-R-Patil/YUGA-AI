import axios from "axios";
import { API_BASE_URL } from "../utils/api";

const API_URL = API_BASE_URL;

export const scheduleAPI = {
    // Generate assessment questions using LLM based on subject strengths
    generateAssessmentQuestions: async (subjectStrengths?: {
        physics: string;
        chemistry: string;
        biology: string;
        mathematics?: string;
    }) => {
        try {
            const response = await axios.post(`${API_URL}/schedule/assessment/generate`, {
                subjectStrengths
            }, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error generating assessment questions:', error);
            throw error;
        }
    },

    // Generate personalized study schedule
    generateSchedule: async (data: {
        availability: {
            hoursPerDay: number;
            availableDays: string[];
            preferredTimeSlots: string[];
            sessionDuration?: number;
            dailyHours?: { [key: string]: number };
            dailyTimeSlots?: { [key: string]: string[] };
            dailySlotRanges?: { [key: string]: { [slot: string]: string } };
        };
        subjectStrengths: {
            physics: string;
            chemistry: string;
            biology: string;
            mathematics?: string;
        };
        assessmentResults?: {
            score: number;
            total: number;
            weakAreas?: string[];
        };
        daysUntilExam: number;
        studentClass?: string;
        currentDate?: string;
        currentTime?: string;
    }) => {
        try {
            const response = await axios.post(`${API_URL}/schedule/generate`, data, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error generating schedule:', error);
            throw error;
        }
    },

    // Customize existing schedule
    customizeSchedule: async (data: {
        schedule: any;
        modifications: any;
    }) => {
        try {
            const response = await axios.post(`${API_URL}/schedule/customize`, data, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error('Error customizing schedule:', error);
            throw error;
        }
    }
};

