import { generateExplanation } from './exam-analysis-service.js';
import { generatePDF, generateReportHTML, getAIAnalysis } from './report-service.js';

export const downloadPerformanceReport = async (req, res) => {
    try {
        const { stats, subjectData, topicData, weakAreas, format = 'pdf', reportStyle = 'fancy' } = req.body;

        if (!stats) {
            return res.status(400).json({ error: 'Missing performance data' });
        }

        // 1. Get AI Analysis (Common for both)
        // Check if we need to regenerate or if passed (optimization optional, for now regenerate)
        // Actually generatePDF inside report-service already calls getAIAnalysis. 
        // We should refactor slightly or just let generatePDF do its thing, but for HTML we need to call it manually.
        // Let's call getAIAnalysis here if format is html, or let generatePDF handle it if pdf.

        // Wait, generatePDF calls getAIAnalysis internally. 
        // If we want HTML, we need to call getAIAnalysis and then generateReportHTML.

        if (format === 'json') {
            const aiAnalysis = await getAIAnalysis(stats, subjectData, weakAreas, { style: reportStyle, topicData });
            return res.json({ aiAnalysis, stats, subjectData, topicData, weakAreas });
        }

        if (format === 'html') {
            const aiAnalysis = await getAIAnalysis(stats, subjectData, weakAreas, { style: reportStyle, topicData });
            const html = generateReportHTML({ stats, subjectData, topicData, weakAreas }, aiAnalysis);
            return res.send(html);
        }

        try {
            const pdfBuffer = await generatePDF({ stats, subjectData, topicData, weakAreas, reportStyle });

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="performance-report.pdf"',
                'Content-Length': pdfBuffer.length
            });

            return res.end(pdfBuffer);
        } catch (pdfErr) {
            console.error('PDF generation failed, falling back to HTML report:', pdfErr);
            // Fallback: generate HTML and return it so frontend can open/save it
            try {
                const aiAnalysis = await getAIAnalysis(stats, subjectData, weakAreas, { style: reportStyle, topicData });
                const html = generateReportHTML({ stats, subjectData, topicData, weakAreas }, aiAnalysis);
                res.set({
                    'Content-Type': 'text/html',
                    'Content-Disposition': 'attachment; filename="performance-report.html"'
                });
                return res.send(html);
            } catch (htmlErr) {
                console.error('Fallback HTML generation also failed:', htmlErr);
                return res.status(500).json({ error: 'Report generation failed' });
            }
        }
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ error: error.message || 'Failed to generate report' });
    }
};

export const getQuestionExplanation = async (req, res) => {
    try {
        const { question, options, correctAnswer, selectedAnswer, subject } = req.body;

        if (!question || !options || !correctAnswer) {
            return res.status(400).json({ error: 'Missing required question fields' });
        }

        const explanation = await generateExplanation({
            question,
            options,
            correctAnswer,
            selectedAnswer,
            subject: subject || 'General'
        });

        res.json({ explanation });
    } catch (error) {
        console.error('Error in getQuestionExplanation:', error);
        res.status(500).json({ error: 'Failed to generate explanation' });
    }
};
