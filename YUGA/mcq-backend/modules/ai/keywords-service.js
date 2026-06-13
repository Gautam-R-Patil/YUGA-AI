import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache for aggregated keywords by subject and set
const keywordsCache = new Map();
const SUBJECT_SET_DIR = path.join(__dirname, '../../data/questions/mcq_practice');

/**
 * Extract keywords from a single question's keywords field
 */
const extractKeywordsFromQuestion = (question) => {
    const keywords = [];
    
    if (question.keywords && typeof question.keywords === 'object') {
        // If keywords is an object with key-value pairs (like { "NT": "Neurotransmitter", ... })
        Object.entries(question.keywords).forEach(([key, value]) => {
            if (value && String(value).trim().length > 0) {
                keywords.push({
                    abbreviation: key.trim(),
                    term: String(value).trim(),
                    questionId: question.id || question.original_id
                });
            }
        });
    } else if (Array.isArray(question.keywords)) {
        // If keywords is an array of strings
        question.keywords.forEach(kw => {
            if (kw && String(kw).trim().length > 0) {
                keywords.push({
                    abbreviation: '',
                    term: String(kw).trim(),
                    questionId: question.id || question.original_id
                });
            }
        });
    }
    
    return keywords;
};

/**
 * Auto-extract keywords from question text and explanation using NLP patterns
 */
const autoExtractKeywords = (question) => {
    const keywords = [];
    const text = `${question.text || ''} ${question.explanation || ''} ${question.basic_answer || ''}`;
    
    // Extract bold text patterns like **Term Name**
    const boldPattern = /\*\*([^*]+)\*\*/g;
    let match;
    while ((match = boldPattern.exec(text)) !== null) {
        const term = match[1].trim();
        if (term.length > 2 && term.length < 100) {
            keywords.push({
                abbreviation: '',
                term: term,
                source: 'extracted',
                questionId: question.id || question.original_id
            });
        }
    }
    
    // Extract scientific terms (PascalCase combinations like ArchaeBacteria, ATP)
    const scientificPattern = /\b([A-Z][a-z]+(?:[A-Z][a-z]+)*|[A-Z]{2,})\b/g;
    while ((match = scientificPattern.exec(text)) !== null) {
        const term = match[1].trim();
        // Filter out common words
        if (term.length > 2 && !['The', 'And', 'Are', 'For', 'But', 'With'].includes(term)) {
            keywords.push({
                abbreviation: '',
                term: term,
                source: 'extracted',
                questionId: question.id || question.original_id
            });
        }
    }
    
    return keywords;
};

/**
 * Load and aggregate all keywords for a specific subject and optional set number
 */
export const getKeywordsBySubjectAndSet = async (subject, setNumber = null) => {
    try {
        const normalizedSubject = normalizeSubjectName(subject);
        const cacheKey = `${normalizedSubject}_${setNumber || 'all'}`;
        
        // Check cache
        if (keywordsCache.has(cacheKey)) {
            console.log(`📚 Loaded keywords from cache for ${normalizedSubject} (Set ${setNumber || 'All'})`);
            return keywordsCache.get(cacheKey);
        }
        
        const subjectDir = path.join(SUBJECT_SET_DIR, normalizedSubject);
        
        if (!fs.existsSync(subjectDir)) {
            console.warn(`❌ Subject directory not found: ${subjectDir}`);
            return { subject: normalizedSubject, keywords: [], questionCount: 0 };
        }
        
        let allKeywords = [];
        let totalQuestions = 0;
        const setKeywordMap = {}; // Map of setNumber -> keywords
        
        // Read all set directories
        const setDirs = fs.readdirSync(subjectDir).filter(f => {
            const fullPath = path.join(subjectDir, f);
            try {
                return fs.statSync(fullPath).isDirectory() && /^Set\d+$/.test(f);
            } catch (e) {
                return false;
            }
        }).sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
        });
        
        for (const setDir of setDirs) {
            const setMatch = setDir.match(/(\d+)/);
            if (!setMatch) continue;
            
            const setNum = parseInt(setMatch[1]);
            
            // Skip if we're looking for a specific set and this isn't it
            if (setNumber !== null && setNum !== setNumber) {
                continue;
            }
            
            const setPath = path.join(subjectDir, setDir);
            const jsonFile = path.join(setPath, `set${setNum}.json`);
            
            if (!fs.existsSync(jsonFile)) {
                console.warn(`⚠️ Question file not found: ${jsonFile}`);
                continue;
            }
            
            try {
                const rawData = fs.readFileSync(jsonFile, 'utf-8');
                const questions = JSON.parse(rawData);
                
                let setKeywords = [];
                questions.forEach(q => {
                    totalQuestions++;
                    
                    // Extract explicitly defined keywords
                    const definedKeywords = extractKeywordsFromQuestion(q);
                    setKeywords = setKeywords.concat(definedKeywords);
                    allKeywords = allKeywords.concat(definedKeywords);
                    
                    // Auto-extract additional keywords if needed
                    const autoKeywords = autoExtractKeywords(q);
                    setKeywords = setKeywords.concat(autoKeywords);
                    allKeywords = allKeywords.concat(autoKeywords);
                });
                
                // Deduplicate keywords for this set
                setKeywordMap[setNum] = deduplicateKeywords(setKeywords);
                
                console.log(`✅ Loaded ${setKeywordMap[setNum].length} keywords from ${setDir} (${questions.length} questions)`);
                
            } catch (e) {
                console.error(`❌ Error reading set file ${jsonFile}:`, e);
            }
        }
        
        // Deduplicate all keywords
        const deduplicatedKeywords = deduplicateKeywords(allKeywords);
        
        const result = {
            subject: normalizedSubject,
            keywords: deduplicatedKeywords,
            questionCount: totalQuestions,
            sets: setKeywordMap,
            timestamp: new Date().toISOString()
        };
        
        // Cache the result
        keywordsCache.set(cacheKey, result);
        
        console.log(`📊 Total keywords aggregated for ${normalizedSubject}: ${deduplicatedKeywords.length} (from ${totalQuestions} questions)`);
        
        return result;
        
    } catch (e) {
        console.error(`Error getting keywords for subject ${subject}:`, e);
        return { subject, keywords: [], questionCount: 0, error: e.message };
    }
};

/**
 * Get keywords for current question set being played
 */
export const getKeywordsForCurrentSet = async (subject, setNumber) => {
    try {
        const result = await getKeywordsBySubjectAndSet(subject, setNumber);
        return result.keywords || [];
    } catch (e) {
        console.error(`Error getting keywords for set:`, e);
        return [];
    }
};

/**
 * Deduplicate keywords by term (case-insensitive)
 */
const deduplicateKeywords = (keywords) => {
    const seen = new Map();
    const deduplicated = [];
    
    keywords.forEach(kw => {
        const key = kw.term.toLowerCase();
        if (!seen.has(key)) {
            seen.set(key, true);
            deduplicated.push(kw);
        }
    });
    
    return deduplicated;
};

/**
 * Normalize subject names to match directory structure
 */
const normalizeSubjectName = (subject) => {
    if (!subject) return 'biology';
    const s = subject.toLowerCase();
    if (s.includes('physics')) return 'physics';
    if (s.includes('chemistry')) return 'chemistry';
    if (s.includes('biology') || s.includes('botany') || s.includes('zoology')) return 'biology';
    return s.trim();
};

/**
 * Create a formatted context string for LLM prompting
 */
export const formatKeywordsAsContext = (keywords) => {
    if (!keywords || keywords.length === 0) {
        return '';
    }
    
    // Group keywords by type
    const withAbbreviations = keywords.filter(kw => kw.abbreviation);
    const withoutAbbreviations = keywords.filter(kw => !kw.abbreviation);
    
    let contextStr = '\n**KEY CONCEPTS AND TERMINOLOGY:**\n\n';
    
    if (withAbbreviations.length > 0) {
        contextStr += '**Key Terms with Abbreviations:**\n';
        withAbbreviations.forEach(kw => {
            contextStr += `• **${kw.abbreviation}**: ${kw.term}\n`;
        });
        contextStr += '\n';
    }
    
    if (withoutAbbreviations.length > 0) {
        contextStr += '**Important Concepts:**\n';
        // Group into chunks for readability
        const chunkSize = Math.ceil(withoutAbbreviations.length / 3);
        for (let i = 0; i < withoutAbbreviations.length; i += chunkSize) {
            const chunk = withoutAbbreviations.slice(i, Math.min(i + chunkSize, withoutAbbreviations.length));
            contextStr += chunk.map(kw => `• ${kw.term}`).join(', ') + '\n';
        }
    }
    
    return contextStr;
};

/**
 * Get combined context including keywords for voice query LLM
 */
export const getKeywordContextForQuestion = async (subject, setNumber, questionId) => {
    try {
        const keywords = await getKeywordsForCurrentSet(subject, setNumber);
        
        // Filter to only keywords relevant to this question set
        const relevantKeywords = keywords;
        
        return {
            keywordContext: formatKeywordsAsContext(relevantKeywords),
            keywords: relevantKeywords,
            count: relevantKeywords.length
        };
    } catch (e) {
        console.error(`Error getting keyword context:`, e);
        return {
            keywordContext: '',
            keywords: [],
            count: 0
        };
    }
};

/**
 * Clear cache (useful for testing or refresh)
 */
export const clearKeywordsCache = () => {
    keywordsCache.clear();
    console.log('✅ Keywords cache cleared');
};

/**
 * Get cache statistics
 */
export const getCacheStats = () => {
    return {
        cacheSize: keywordsCache.size,
        cachedSubjects: Array.from(keywordsCache.keys())
    };
};
