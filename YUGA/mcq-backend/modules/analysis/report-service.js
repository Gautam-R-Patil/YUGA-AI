import puppeteer from 'puppeteer';
import { getCompletion } from '../ai/llm-service.js';

export const getAIAnalysis = async (stats = {}, subjectData = [], weakAreas = [], options = {}) => {
    const style = options.style || 'fancy';
    const topicData = options.topicData || [];

    // Plain style prompt: concise, simple bullets, no gamified language
    const plainPrompt = `You are an academic tutor. Produce a detailed, plain-language HTML report (no <html>, <head>, or <body> tags) containing:
- A "Strengths" section listing specific TOPICS the student did well in (bullet list). For each topic, briefly mention the question type (e.g., conceptual, numerical) they mastered.
- A "Weaknesses" section listing specific TOPICS with low accuracy (bullet list).
- For each weakness, provide 2 specific, non-generic study actions the student can take.
- At the end, provide 3 overall study suggestions to improve performance.

Use the following data to fill in the report:
STATS: Overall Score: ${stats?.averageScore || 0}%, Effort: ${stats?.studyHours || 0}
SUBJECT DATA:
${Array.isArray(subjectData) ? subjectData.map(s => `- ${s.subject}: ${s.score}% (avgTime:${s.avgTime}s)`).join('\n') : 'None'}
TOPIC DATA:
${Array.isArray(topicData) ? topicData.map(t => `- ${t.topic} (${t.subject}): ${t.accuracy}% attempted:${t.attempted}`).join('\n') : 'None'}
WEAK AREAS:
${Array.isArray(weakAreas) ? weakAreas.map(w => `- ${w.topic}: ${w.accuracy}%`).join('\n') : 'None'}

Return only the report HTML with simple tags: <h3>, <ul>, <li>, <p>, <strong>.`;

    // Fancy (existing) prompt
    const fancyPrompt = `
    You are 'Apex', an Elite Academic Performance Coach for high-achieving students preparing for competitive exams like NEET/JEE. 
    Your tone is: **High-Energy, Motivational, Precise, and Analytical.** 
    Think of yourself as a master strategist for a top-tier candidate.

    STUDENT CLASSIFICATION:
    - Overall Score: ${stats?.averageScore || 0}%
    - Rank Projection: ${stats?.averageScore < 50 ? 'N/A (Hide Rank - Focus on Growth)' : '#' + (stats?.projectedRank || '--')}
    - Study Hours/Effort: ${stats?.studyHours || 0}
    
    SPECIAL INSTRUCTION FOR LOW SCORES (< 50%):
    If the score is below 50%, do NOT be discouraging. Treat them as a "Rising Star" with "Uncapped Potential". Focus on the 1-2 small wins they achieved and emphasize that they are building the foundation for a massive comeback.
    
    MISSION DATA (Subject Performance):
    ${Array.isArray(subjectData) ? subjectData.map(s => `- ${s.subject}: ${s.score}% (Pace: ${s.avgTime}s/q)`).join('\n') : 'No specific subject data available.'}

    TOPIC-LEVEL INTELLIGENCE (Crucial):
    ${Array.isArray(topicData) ? topicData.map(t => `- [${t.subject}] ${t.topic}: ${t.accuracy}% Accuracy (Attempted: ${t.attempted})`).join('\n') : 'None'}

    CRITICAL WEAKNESSES (The Boss Level):
    ${Array.isArray(weakAreas) ? weakAreas.map(w => `- ${w.topic} (${w.accuracy}% accuracy)`).join('\n') : 'No specific weak areas identified.'}

    OBJECTIVE:
    Generate a laser-focused battle plan. Return ONLY the HTML content (no <html>, <head>, or <body> tags) with the following specific structure:

    <div class="mission-brief">
        <h3>🚀 Mission Briefing</h3>
        <p>[3-4 sentences: Detailed assessment. Use terms like "Tier 1 Specialist", "Concept Legend", "Focus Required". Analyze their overall balance between subjects.]</p>
    </div>

    <div class="strategy-section">
        <h3>⚔️ Attack Protocols (Strengths)</h3>
        <p><strong>Top Concept Mastery:</strong> [Detailed paragraph: Mention the top 2-3 specific topics from TOPIC DATA where they hit high accuracy. Explain the 'type' of questions they likely excelled at - e.g., "High-level conceptual applications in Physics" or "Factual retention in Biology". Don't just list a subject; name the topics.]</p>
    </div>

    <div class="strategy-section">
        <h3>🛡️ Defense Upgrades (Weaknesses)</h3>
        <p>[Name the specific 2-3 topics that are dragging the score down. Call it "Patching the Glitch". Identify if the error type is likely "Conceptual Gap" or "Calculation Speed" based on the speed vs accuracy in that subject.]</p>
    </div>

    <div class="roadmap-section">
        <h3>🏆 The Victory Roadmap</h3>
        <ul>
            <li><strong>Phase 1 (Immediate):</strong> [Specific drill for one weak topic]</li>
            <li><strong>Phase 2 (Weekly):</strong> [Habit relating to revision or simulation tests]</li>
            <li><strong>Phase 3 (Mastery):</strong> [Long term goal for rank stabilization]</li>
        </ul>
    </div>
    `;

    const prompt = style === 'plain' ? plainPrompt : fancyPrompt;

    try {
        const aiResponse = await getCompletion(
            [{ role: "user", content: prompt }],
            'NEET',
            'analysis',
            false // Don't cache report generation to ensure freshness
        );
        return aiResponse || "<p>AI Analysis offline.</p>";
    } catch (error) {
        console.error("AI Report Generation Error:", error);
        return "<p>AI Connection Failed. Please try again later.</p>";
    }
};

export const generateReportHTML = (data, aiAnalysis) => {
    const date = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const stats = data?.stats || {};
    const subjectData = data?.subjectData || [];
    const weakAreas = data?.weakAreas || [];

    // Calculate a "Level" based on score
    const avgScore = stats?.averageScore || 0;
    const level = Math.floor(avgScore / 10) + 1;
    const levelName = avgScore > 90 ? "Grandmaster" : avgScore > 75 ? "Elite" : avgScore > 50 ? "Challenger" : "Novice";

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&display=swap');
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
            
            :root {
                --primary: #7c3aed;
                --secondary: #db2777;
                --accent: #06b6d4;
                --dark: #0f172a;
                --light: #f8fafc;
                --success: #10b981;
                --danger: #ef4444;
            }

            body {
                font-family: 'Inter', sans-serif; /* Better for reading text */
                margin: 0;
                padding: 0;
                background-color: #fff;
                color: var(--dark);
                -webkit-print-color-adjust: exact;
            }
            
            h1, h2, h3, h4, .stat-value, .logo, .level-value {
                font-family: 'Outfit', sans-serif; /* Display font */
            }

            /* Cover Header */
            .hero-header {
                background: linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%);
                color: white;
                padding: 40px;
                border-bottom-left-radius: 40px;
                border-bottom-right-radius: 40px;
                margin-bottom: 50px;
                position: relative;
                overflow: hidden;
            }

            .hero-pattern {
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background-image: radial-gradient(circle at 10% 20%, rgba(255,255,255,0.1) 0%, transparent 20%),
                                  radial-gradient(circle at 90% 80%, rgba(255,255,255,0.1) 0%, transparent 20%);
                opacity: 0.6;
            }

            .header-content {
                position: relative;
                z-index: 10;
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
            }

            .logo {
                font-size: 20px;
                font-weight: 800;
                letter-spacing: 2px;
                opacity: 0.8;
                margin-bottom: 10px;
            }

            h1 {
                font-size: 56px;
                margin: 0;
                font-weight: 800;
                line-height: 1;
                background: linear-gradient(to right, #fff, #e9d5ff);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0 10px 30px rgba(0,0,0,0.2);
            }

            .player-badge {
                background: rgba(255,255,255,0.1);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.2);
                padding: 15px 25px;
                border-radius: 20px;
                text-align: right;
                box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            }

            .level-label {
                font-size: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #e9d5ff;
                margin-bottom: 2px;
            }

            .level-value {
                font-size: 28px;
                font-weight: 800;
                color: #fff;
            }

            /* Container */
            .container {
                padding: 0 50px;
            }

            /* Stats Grid */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 24px;
                margin-bottom: 50px;
            }

            .stat-card {
                background: white;
                border-radius: 24px;
                padding: 24px;
                box-shadow: 0 10px 40px -10px rgba(0,0,0,0.08);
                border: 1px solid #f1f5f9;
                text-align: center;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
            }

            .stat-label {
                font-size: 11px;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #64748b;
                font-weight: 700;
                margin-bottom: 8px;
            }

            .stat-value {
                font-size: 36px;
                font-weight: 800;
                color: var(--dark);
            }
            
            /* Radial Progress for Score */
            .radial-progress {
                width: 80px;
                height: 80px;
                border-radius: 50%;
                background: conic-gradient(var(--primary) ${avgScore * 3.6}deg, #e2e8f0 0deg);
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 15px;
                position: relative;
            }
            .radial-progress::before {
                content: '';
                position: absolute;
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: white;
            }
            .radial-inner {
                position: relative;
                z-index: 10;
                font-size: 20px;
                font-weight: 800;
                color: var(--primary);
            }

            /* AI Section */
            .ai-container {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 40px;
            }

            .main-content {
                background: #fff;
                /* No border or bg needed really, clean look */
            }

            .side-bar {
                display: flex;
                flex-direction: column;
                gap: 24px;
            }

            /* AI Content Styling */
            h3 {
                margin-top: 0;
                font-size: 20px;
                color: var(--primary);
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 16px;
                padding-bottom: 10px;
                border-bottom: 1px solid #e2e8f0;
            }

            p {
                font-size: 15px;
                line-height: 1.7;
                color: #334155;
                margin-bottom: 24px;
            }

            /* Roadmap specific Checklist Style */
            ul {
                list-style: none;
                padding: 0;
            }

            li {
                background: white;
                padding: 18px;
                border-radius: 16px;
                margin-bottom: 12px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 4px 6px -2px rgba(0,0,0,0.03);
                font-size: 14px;
                line-height: 1.5;
                display: flex;
                flex-direction: column;
                position: relative;
                padding-left: 50px; /* Space for checkbox */
            }
            
            li::before {
                content: '';
                position: absolute;
                left: 18px;
                top: 18px;
                width: 20px;
                height: 20px;
                border: 2px solid var(--accent);
                border-radius: 6px;
            }

            li strong {
                display: block;
                color: var(--primary);
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 4px;
            }

            /* Skill Bars */
            .skill-card {
                background: white;
                padding: 24px;
                border-radius: 24px;
                border: 1px solid #e2e8f0;
                box-shadow: 0 10px 30px -10px rgba(0,0,0,0.08);
            }

            .skill-title {
                font-weight: 800;
                font-size: 16px;
                margin-bottom: 20px;
                color: var(--dark);
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .skill-item {
                margin-bottom: 16px;
            }

            .skill-header {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                font-weight: 600;
                margin-bottom: 6px;
                color: #64748b;
            }

            .progress-bg {
                height: 10px;
                background: #f1f5f9;
                border-radius: 5px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                border-radius: 5px;
                transition: width 1s ease-out;
            }

            /* Footer */
            .footer {
                margin-top: 80px;
                text-align: center;
                padding: 30px;
                border-top: 1px solid #e2e8f0;
                color: #cbd5e1;
                font-size: 10px;
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
        </style>
    </head>
    <body>
        <div class="hero-header">
            <div class="hero-pattern"></div>
            <div class="header-content">
                <div>
                    <div class="logo">YUGA AI</div>
                    <h1>Performance<br>Analysis</h1>
                    <div style="font-size: 15px; opacity: 0.8; margin-top: 12px; font-weight: 500;">
                        Generated on ${date}
                    </div>
                </div>
                <div class="player-badge">
                    <div class="level-label">Player Rank</div>
                    <div class="level-value">Level ${level} • ${levelName}</div>
                </div>
            </div>
        </div>

        <div class="container">
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="radial-progress">
                        <div class="radial-inner">${avgScore}%</div>
                    </div>
                    <div class="stat-label">Global Score</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--secondary); font-size: ${avgScore < 50 ? '24px' : '42px'};">
                        ${avgScore < 50 ? 'Rising Star' : '#' + (stats.projectedRank > 0 ? stats.projectedRank.toLocaleString() : '--')}
                    </div>
                    <div class="stat-label">${avgScore < 50 ? 'Potential Legend' : 'Projected Rank'}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: var(--accent);">${stats.questionsSolved}</div>
                    <div class="stat-label">Missions Cleared</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="color: #10b981;">${Math.floor(stats.studyHours)}h</div>
                    <div class="stat-label">Training Time</div>
                </div>
            </div>

            <div class="ai-container">
                <div class="main-content">
                    ${aiAnalysis}
                </div>

                <div class="side-bar">
                    <div class="skill-card">
                        <div class="skill-title">⚡ Subject Mastery</div>
                        ${subjectData.slice(0, 5).map(s => `
                        <div class="skill-item">
                            <div class="skill-header">
                                <span>${s.subject}</span>
                                <span>${s.score}%</span>
                            </div>
                            <div class="progress-bg">
                                <div class="progress-fill" style="width: ${s.score}%; background: ${s.subject.includes('Physics') ? '#9333EA' :
            s.subject.includes('Chemistry') ? '#10B981' :
                s.subject.includes('Math') ? '#3B82F6' : '#F43F5E'
        };"></div>
                            </div>
                        </div>
                        `).join('')}
                    </div>

                    <div class="skill-card">
                        <div class="skill-title">🎯 Critical Focus</div>
                        ${weakAreas.slice(0, 5).map(w => `
                        <div class="skill-item">
                            <div class="skill-header">
                                <span>${w.topic}</span>
                                <span style="color: #ef4444;">${w.accuracy}%</span>
                            </div>
                            <div class="progress-bg">
                                <div class="progress-fill" style="width: ${w.accuracy}%; background: #ef4444;"></div>
                            </div>
                        </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        </div>
        
        <div class="footer">
            Yuga AI Learning Platform • Official Performance Document • Generated by Apex Engine
        </div>
    </body>
    </html>
    `;
};

export const generatePDF = async (data) => {
    // 1. Get AI Analysis
    const aiAnalysis = await getAIAnalysis(data.stats, data.subjectData, data.weakAreas, { style: data.reportStyle || 'fancy' });

    // 2. Generate HTML
    const html = generateReportHTML(data, aiAnalysis);

    // 3. Convert to PDF using Puppeteer
    let browser;
    try {
        console.log("Launching Puppeteer...");

        const fs = await import('fs');

        // Base launch args - NOTE: --single-process is Linux-only and crashes Chrome on Windows
        const baseArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
            '--disable-extensions',
            '--disable-background-networking',
        ];

        const launchConfig = {
            headless: true,
            args: baseArgs,
            timeout: 30000,
        };

        // Priority 1: Explicit env var override (e.g., set on Render/production)
        if (process.env.PUPPETEER_EXECUTABLE_PATH) {
            launchConfig.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
            console.log(`Using configured executable path: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
        }

        // Priority 2: Find a system browser (Chrome, then Edge as guaranteed Windows fallback)
        if (!launchConfig.executablePath) {
            const platform = process.platform;
            let possiblePaths = [];

            if (platform === 'win32') {
                possiblePaths = [
                    // Chrome paths
                    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
                    'D:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
                    // Edge paths (guaranteed to exist on Windows 10/11)
                    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
                    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
                    process.env.LOCALAPPDATA + '\\Microsoft\\Edge\\Application\\msedge.exe',
                ];
            } else if (platform === 'linux') {
                possiblePaths = [
                    '/usr/bin/google-chrome',
                    '/usr/bin/google-chrome-stable',
                    '/usr/bin/chromium-browser',
                    '/usr/bin/chromium',
                ];
            } else if (platform === 'darwin') {
                possiblePaths = [
                    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
                    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
                ];
            }

            const foundPath = possiblePaths.find(p => {
                try { return fs.existsSync(p); } catch { return false; }
            });

            if (foundPath) {
                console.log(`Found browser at: ${foundPath}`);
                launchConfig.executablePath = foundPath;
            } else {
                console.warn("No system browser found in standard locations. Attempting Puppeteer bundled browser...");
            }
        }

        browser = await puppeteer.launch(launchConfig);
        console.log("Puppeteer launched successfully.");

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        return pdfBuffer;
    } catch (error) {
        console.error("Puppeteer PDF Generation failed:", error);
        // Log to file for debugging
        const fs = await import('fs');
        fs.appendFileSync('puppeteer-error.log', `${new Date().toISOString()} - PDF Gen Error: ${error.message}\nStack: ${error.stack}\n\n`);
        throw new Error(`PDF Generation failed: ${error.message}`);
    } finally {
        if (browser) {
            try { await browser.close(); } catch (e) { /* ignore close errors */ }
        }
    }
};
