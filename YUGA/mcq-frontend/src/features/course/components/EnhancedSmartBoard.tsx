import React, { useState, useEffect, useRef, useMemo } from "react";
import { Trash2, Edit3, Sparkles, BookOpen, Lightbulb, Calculator, FileText, Image as ImageIcon, Eraser, Keyboard as KeyboardIcon, Undo2, Redo2, Grid, Circle, Square, Minus, Move, ChevronRight, ChevronDown, ChevronUp, X } from "lucide-react";
import { HighlightedLectureScript } from './HighlightedLectureScript';
import { FormattedText } from '../../../shared/components/FormattedText';

interface SmartBoardContent {
    type: 'keyword' | 'equation' | 'definition' | 'diagram' | 'text' | 'formula';
    content: string;
    displayContent?: React.ReactNode; // For rich rendering
    metadata?: {
        title?: string;
        description?: string;
        details?: string;
        relatedConcepts?: string[];
        examples?: string[];
        clickableElements?: Array<{
            text: string;
            info: string;
        }>;
    };
    position?: number;
}

interface EnhancedSmartBoardProps {
    content: string[];
    lessonTitle: string;
    currentSegment: string;
    isActive: boolean;
    explanation?: string;
    isExplaining?: boolean;
    isAudioPlaying?: boolean;
    highlightedText?: string;
    hasSections?: boolean;
    currentKeyPointIndex?: number;
    totalKeyPoints?: number;
    onAddToNotes?: (text: string) => void;
    currentSpeech?: string; // New prop for real-time speech analysis
    structuredData?: {
        images?: { url: string; description: string }[];
        keywords?: string[];
        formulas?: { formula: string; description: string }[];
        definitions?: { term: string; definition: string }[];
        lecture_script?: string;
        metadata?: { topic?: string; subject?: string; class?: string };
    };
    hideHeader?: boolean;
    hideFooter?: boolean;
}

export interface SmartBoardRightPanelProps {
    isActive: boolean;
    lessonTitle: string;
    currentSegment: string;
    userNotes?: string;
    onNotesChange?: (notes: string) => void;
}

const TypewriterText = ({ text, speed = 80 }: { text: string, speed?: number }) => {
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        setIsTyping(true);
        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText(text.substring(0, i + 1));
            i++;
            if (i === text.length) {
                clearInterval(timer);
                setIsTyping(false);
            }
        }, speed);
        return () => clearInterval(timer);
    }, [text, speed]);

    return <span>{displayedText}{isTyping && <span className="animate-pulse border-r-2 border-current ml-0.5"></span>}</span>;
};

const EnhancedSmartBoard: React.FC<EnhancedSmartBoardProps> = ({
    content,
    isActive,
    explanation,
    structuredData,
    hideHeader = false,
    hideFooter = false,
    ...props
}) => {
    const [parsedContent, setParsedContent] = useState<SmartBoardContent[]>([]);
    const [imageError, setImageError] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    // Reset image error and loading state when content changes
    useEffect(() => {
        setImageError(false);
        setIsImageLoaded(false);
    }, [structuredData, props.lessonTitle]);

    // Interactivity State
    const [selectedDetailCategory, setSelectedDetailCategory] = useState<'keywords' | 'formulas' | 'definitions' | 'images' | null>(null);

    const [activeVisualKeywords, setActiveVisualKeywords] = useState<SmartBoardContent[]>([]);
    const bottomRef = useRef<HTMLDivElement>(null);

    // Image Modal State
    const [selectedImage, setSelectedImage] = useState<{ url: string; description: string } | null>(null);

    // Auto-scroll to bottom when new content is added
    useEffect(() => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [activeVisualKeywords]);

    const dynamicKeywords = parsedContent.filter((c: SmartBoardContent) => c.type === 'keyword').length;
    const dynamicFormulas = parsedContent.filter((c: SmartBoardContent) => c.type === 'formula').length;
    const dynamicDefinitions = parsedContent.filter((c: SmartBoardContent) => c.type === 'definition').length;



    const renderFormula = (formula: string): React.ReactNode => {
        // If the formula contains LaTeX markers like '\', use FormattedText
        if (formula.includes('\\') || formula.includes('^')) {
            // Strip pre-existing markdown/math delimiters to prevent nested crashing ($$$$)
            const cleanFormula = formula
                .replace(/\$\$/g, '')
                .replace(/\$/g, '')
                .replace(/\\\[/g, '')
                .replace(/\\\]/g, '')
                .replace(/\\\(/g, '')
                .replace(/\\\)/g, '')
                .trim();
            
            return (
                <div className="font-serif tracking-wide text-white scale-110 origin-left">
                    <FormattedText content={`$$${cleanFormula}$$`} />
                </div>
            );
        }

        let rendered = formula;

        // Detect and style subscripts (H_2O or F_c -> H₂O or F subscript c) includes numbers and letters after underscore
        rendered = rendered.replace(/_([a-zA-Z0-9]+)/g, '<sub>$1</sub>');

        // Detect and style implicit numerical subscripts (H2O -> H₂O) - specifically letter followed by number
        rendered = rendered.replace(/([A-Z][a-z]?)(\d+)/g, '$1<sub>$2</sub>');

        // Detect and style superscripts (E=mc^2)
        rendered = rendered.replace(/\^([a-zA-Z0-9]+)/g, '<sup>$1</sup>');

        // Style arrows
        rendered = rendered.replace(/->/g, ' <span style="color: #60a5fa; font-weight: bold;">→</span> ');
        rendered = rendered.replace(/<->/g, ' <span style="color: #60a5fa; font-weight: bold;">⇌</span> ');

        // Style operators with spacing
        rendered = rendered.replace(/([+\-=])/g, ' <span style="color: #60a5fa; font-weight: bold; margin: 0 4px;">$1</span> ');

        return <span className="font-serif text-lg tracking-wide text-white block mt-1" dangerouslySetInnerHTML={{ __html: rendered }} />;
    };

    // Extract clickable chemical elements from formulas
    const extractChemicalElements = (formula: string): Array<{ text: string; info: string }> => {
        const elements: Array<{ text: string; info: string }> = [];
        const elementInfo: Record<string, string> = {
            'H': 'Hydrogen - Atomic Number: 1, Symbol: H, Lightest element',
            'H2': 'Hydrogen Gas - Molecular formula: H₂, Diatomic molecule',
            'O': 'Oxygen - Atomic Number: 8, Symbol: O, Essential for respiration',
            'O2': 'Oxygen Gas - Molecular formula: O₂, Diatomic molecule, 21% of air',
            'H2O': 'Water - Molecular formula: H₂O, Universal solvent, Essential for life',
            'CO2': 'Carbon Dioxide - Molecular formula: CO₂, Greenhouse gas, Product of respiration',
            'C': 'Carbon - Atomic Number: 6, Symbol: C, Basis of organic chemistry',
            'N': 'Nitrogen - Atomic Number: 7, Symbol: N, 78% of atmosphere',
            'Ca': 'Calcium - Atomic Number: 20, Symbol: Ca, Essential for bones',
            'Fe': 'Iron - Atomic Number: 26, Symbol: Fe, Essential for blood',
            'Na': 'Sodium - Atomic Number: 11, Symbol: Na, Essential electrolyte',
            'Cl': 'Chlorine - Atomic Number: 17, Symbol: Cl, Forms table salt with sodium',
        };

        // Extract all chemical symbols from the formula
        const matches = formula.match(/[A-Z][a-z]?\d*/g);
        if (matches) {
            matches.forEach(match => {
                if (elementInfo[match]) {
                    elements.push({ text: match, info: elementInfo[match] });
                }
            });
        }

        return elements;
    };

    // Generate detailed information for equations
    const generateEquationDetails = (equation: string): string => {
        if (/E\s*=\s*mc/i.test(equation)) {
            return `Einstein's mass-energy equivalence equation. E represents energy, m is mass, and c is the speed of light. This fundamental equation shows that mass and energy are interchangeable.`;
        }
        if (/F\s*=\s*ma/i.test(equation)) {
            return `Newton's Second Law of Motion. Force equals mass times acceleration. This fundamental equation describes how force affects the motion of objects.`;
        }
        if (/V\s*=\s*IR/i.test(equation)) {
            return `Ohm's Law. Voltage equals current times resistance. This fundamental equation describes the relationship between voltage, current, and resistance in electrical circuits.`;
        }
        return `This equation represents a mathematical or scientific relationship between different quantities.`;
    };



    // Helper to check if content is "junk" or noise
    const isJunkContent = (text: string): boolean => {
        const lower = text.toLowerCase();
        // Reject headers and generic labels
        if (lower.includes('lesson') || lower.includes('class') || lower.includes('chapter') || lower.includes('unit')) return true;
        if (lower.includes('key points') || lower.includes('summary') || lower.includes('introduction') || lower.includes('objectives')) return true;
        if (lower.includes('loading') || lower.includes('please wait')) return true;

        // Reject long sentences or lists (indicated by commas or length)
        if (text.includes(',') && text.split(' ').length > 3) return true; // Allow short lists like "Mass, Force" but not sentences

        // Allow formulas even if long (contains =)
        if (text.includes('=') && text.split(' ').length <= 10) return false;

        if (text.split(' ').length > 3) return true; // Reject phrases longer than 3 words

        // Reject common stop words at start
        if (lower.startsWith('the ') || lower.startsWith('a ') || lower.startsWith('an ')) return true;

        return false;
    };

    // Enhanced content parser with better detection
    const parseSmartContent = (rawContent: string[]): SmartBoardContent[] => {
        const parsed: SmartBoardContent[] = [];

        rawContent.forEach((line, index) => {
            // Skip empty lines and section headers
            if (!line.trim() || line.includes('=====') || line.includes('🔑') || line.includes('🎯') || line.includes('📝')) {
                return;
            }

            const trimmedLine = line.trim().replace(/^[•-]\s*/, '');

            // STRICT FILTER: Reject junk content immediately
            if (isJunkContent(trimmedLine)) {
                return;
            }

            // PRIORITY 1: Detect Chemical Equations (highest priority)
            const chemicalPattern = /\d*[A-Z][a-z]?\d*\s*[+\-→⇌]\s*\d*[A-Z][a-z]?\d*/;
            if (chemicalPattern.test(trimmedLine)) {
                const clickableElements = extractChemicalElements(trimmedLine);
                parsed.push({
                    type: 'formula',
                    content: trimmedLine,
                    displayContent: renderFormula(trimmedLine),
                    metadata: {
                        title: 'Chemical Equation',
                        description: 'Click to explore each element',
                        details: 'This chemical equation shows the reactants and products of a chemical reaction. Click on individual elements to learn more about them.',
                        clickableElements: clickableElements,
                    },
                    position: index
                });
                return;
            }

            // PRIORITY 2: Detect Mathematical Equations
            // Updated regex to support lowercase variables like f=ma
            if (/[a-zA-Z]\s*=\s*[^,]/.test(trimmedLine) || /\d+\s*[+\-×÷]\s*\d+/.test(trimmedLine)) {
                parsed.push({
                    type: 'equation',
                    content: trimmedLine,
                    displayContent: renderFormula(trimmedLine),
                    metadata: {
                        title: 'Mathematical Equation',
                        description: 'Mathematical relationship or formula',
                        details: generateEquationDetails(trimmedLine),
                    },
                    position: index
                });
                return;
            }

            // PRIORITY 3: Detect Keywords (important terms, years, concepts)
            // Only keep if it looks like a significant keyword or concept
            // Updated regex to be more flexible but still filter noise
            const keywordMatch = trimmedLine.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*|[A-Z]{2,}|\d{4}|aerodynamics|thermodynamics|kinematics|photosynthesis)\b/i);
            if (keywordMatch && keywordMatch.length > 0) {
                // Double check length constraint
                if (trimmedLine.split(' ').length <= 3) {
                    parsed.push({
                        type: 'keyword',
                        content: trimmedLine,
                        metadata: {
                            title: 'Key Concept',
                            description: 'Important term or concept',
                            details: `Key terms identified: ${keywordMatch.join(', ')}. These are important concepts that you should remember and understand thoroughly.`,
                            relatedConcepts: keywordMatch.slice(0, 5),
                        },
                        position: index
                    });
                }
                return;
            }

            // Skip definitions, diagrams, and long text as per user request
        });

        return parsed;
    };





    // Build Knowledge Base from props.content (memoized)
    // This acts as a reference for "correct" formatting of terms if they appear in speech
    const knowledgeBase = useMemo(() => {
        if (structuredData) {
            const items: SmartBoardContent[] = [];

            structuredData.images?.forEach((img, idx) => {
                items.push({
                    type: 'diagram',
                    content: img.description,
                    displayContent: (
                        <div className="flex flex-col gap-2">
                            <img src={img.url} alt={img.description} className="rounded-lg w-full max-h-32 object-contain bg-black/20" />
                            <span className="text-sm text-gray-300">{img.description}</span>
                        </div>
                    ),
                    metadata: { title: 'Diagram', description: img.description },
                    position: idx
                });
            });

            structuredData.keywords?.forEach((kw, idx) => {
                items.push({
                    type: 'keyword',
                    content: kw,
                    metadata: { title: 'Keyword', description: kw },
                    position: 100 + idx
                });
            });

            structuredData.formulas?.forEach((f, idx) => {
                if (!f || !f.formula) {
                    return;
                }

                let triggerContent = f.formula;
                if (f.formula.includes(':')) {
                    triggerContent = f.formula.split(':')[0].trim();
                } else if (f.formula.includes('=')) {
                    triggerContent = f.formula.split('=')[0].trim();
                }

                // Refine triggers - use keywords if the label is complex
                const lowerTrigger = triggerContent.toLowerCase();
                if (lowerTrigger.includes('addition')) triggerContent = 'addition';
                else if (lowerTrigger.includes('multiplication')) triggerContent = 'multiplication';
                else if (lowerTrigger.includes('absolute error')) triggerContent = 'absolute error';
                else if (lowerTrigger.includes('relative error')) triggerContent = 'relative error';
                else if (lowerTrigger.includes('percentage error')) triggerContent = 'percentage error';

                items.push({
                    type: 'formula',
                    content: triggerContent,
                    displayContent: renderFormula(f.formula),
                    metadata: { title: 'Formula', description: f.description },
                    position: 200 + idx
                });
            });

            structuredData.definitions?.forEach((d, idx) => {
                items.push({
                    type: 'definition',
                    content: d.term,
                    displayContent: <span><b>{d.term}</b>: {d.definition}</span>,
                    metadata: { title: 'Definition', description: d.definition },
                    position: 300 + idx
                });
            });
            return items;
        }

        return parseSmartContent(content);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [content, structuredData]);

    useEffect(() => {
        if (!isActive || !props.currentSpeech) return;

        const speech = props.currentSpeech;

        // Find ALL chronological occurrences
        const matches: { item: SmartBoardContent, index: number }[] = [];

        knowledgeBase.forEach(item => {
            // Escape special regex characters
            const regex = new RegExp(item.content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            let match;
            while ((match = regex.exec(speech)) !== null) {
                matches.push({ item: { ...item, position: match.index }, index: match.index });
            }
        });

        if (matches.length > 0) {
            // Sort exactly by speech position (Chronological History)
            matches.sort((a, b) => a.index - b.index);

            // GLOBAL DEDUPLICATION & PRIORITY LOGIC
            const uniqueHistory: SmartBoardContent[] = [];
            const seenContents = new Map<string, number>(); // Key -> Index in uniqueHistory

            for (const m of matches) {
                const key = m.item.content.toLowerCase();
                const type = m.item.type;

                // Unique key includes type for formulas to allow them to coexist with definitions
                const storageKey = type === 'formula' ? `${key}-formula` : key;

                if (seenContents.has(storageKey)) {
                    const existingIdx = seenContents.get(storageKey)!;
                    const existingItem = uniqueHistory[existingIdx];

                    if (existingItem.type === 'keyword' && m.item.type === 'definition') {
                        uniqueHistory[existingIdx] = m.item;
                    }
                } else {
                    uniqueHistory.push(m.item);
                    seenContents.set(storageKey, uniqueHistory.length - 1);
                }
            }

            // LOG & UPDATE
            setActiveVisualKeywords(prev => {
                // Stability Check: If history hasn't changed, don't update
                if (prev.length === uniqueHistory.length && prev.every((v, i) => v.content === uniqueHistory[i].content && v.type === uniqueHistory[i].type)) {
                    return prev;
                }
                return uniqueHistory;
            });
        }
    }, [props.currentSpeech, knowledgeBase, isActive, structuredData]);



    // Get color scheme for each content type - Enterprise Edition


    return (
        <div className={`flex-1 flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden transition-all duration-500 relative`}>
            {/* Header - Professional */}
            {!hideHeader && (
                <div className="relative px-6 py-3 border-b border-white/5 bg-slate-900/50 backdrop-blur-xl flex-shrink-0 z-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-400/30">
                                <Sparkles className="w-5 h-5 text-violet-400" />
                            </div>
                            <div>
                                <h3 className="text-white text-lg font-semibold tracking-tight">Smart Board</h3>
                                <p className="text-slate-400 text-xs">Live lecture insights</p>
                            </div>
                        </div>

                        {/* Summary Categories - Moved to Header Right */}
                        <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-4 text-[10px] font-bold uppercase tracking-widest bg-slate-800/50 rounded-lg px-3 py-1.5 border border-white/5">
                                <button
                                    onClick={() => setSelectedDetailCategory(selectedDetailCategory === 'keywords' ? null : 'keywords')}
                                    className={`flex items-center gap-1.5 transition-colors ${selectedDetailCategory === 'keywords' ? '' : 'text-slate-400 hover:text-slate-200'}`}
                                    style={selectedDetailCategory === 'keywords' ? { color: '#2DD4BF' } : {}}
                                >
                                    <Lightbulb className="w-3 h-3" />
                                    <span className="hidden sm:inline">Keywords ({(structuredData?.keywords?.length || 0) + dynamicKeywords})</span>
                                    <span className="sm:hidden">({(structuredData?.keywords?.length || 0) + dynamicKeywords})</span>
                                    {selectedDetailCategory === 'keywords' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                                <div className="w-px h-3 bg-white/10"></div>
                                <button
                                    onClick={() => setSelectedDetailCategory(selectedDetailCategory === 'formulas' ? null : 'formulas')}
                                    className={`flex items-center gap-1.5 transition-colors ${selectedDetailCategory === 'formulas' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <Calculator className="w-3 h-3" />
                                    <span className="hidden sm:inline">Formulas ({(structuredData?.formulas?.length || 0) + dynamicFormulas})</span>
                                    <span className="sm:hidden">({(structuredData?.formulas?.length || 0) + dynamicFormulas})</span>
                                    {selectedDetailCategory === 'formulas' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                                <div className="w-px h-3 bg-white/10"></div>
                                <button
                                    onClick={() => setSelectedDetailCategory(selectedDetailCategory === 'definitions' ? null : 'definitions')}
                                    className={`flex items-center gap-1.5 transition-colors ${selectedDetailCategory === 'definitions' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <BookOpen className="w-3 h-3" />
                                    <span className="hidden sm:inline">Definitions ({(structuredData?.definitions?.length || 0) + dynamicDefinitions})</span>
                                    <span className="sm:hidden">({(structuredData?.definitions?.length || 0) + dynamicDefinitions})</span>
                                    {selectedDetailCategory === 'definitions' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                                <div className="w-px h-3 bg-white/10"></div>
                                <button
                                    onClick={() => setSelectedDetailCategory(selectedDetailCategory === 'images' ? null : 'images')}
                                    className={`flex items-center gap-1.5 transition-colors ${selectedDetailCategory === 'images' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    <ImageIcon className="w-3 h-3" />
                                    <span className="hidden sm:inline">Images ({structuredData?.images?.length || 0})</span>
                                    <span className="sm:hidden">({structuredData?.images?.length || 0})</span>
                                    {selectedDetailCategory === 'images' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Categories Detailed View Overlay/Expansion - Anchored to Header */}
                    {selectedDetailCategory && (
                        <div className="absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-white/10 z-50 p-5 max-h-[340px] overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-300 scrollbar-premium shadow-[0_30px_60px_rgba(0,0,0,0.8)]">
                            <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2.5">
                                    {selectedDetailCategory === 'keywords' && <><div className="p-1 rounded" style={{ backgroundColor: 'rgba(45, 212, 191, 0.2)' }}><Lightbulb className="w-4 h-4" style={{ color: '#2DD4BF' }} /></div> Key Concepts</>}
                                    {selectedDetailCategory === 'images' && <><div className="p-1 rounded bg-blue-500/20"><ImageIcon className="w-4 h-4 text-blue-400" /></div> Topic Images</>}
                                    {selectedDetailCategory === 'formulas' && <><div className="p-1 rounded bg-emerald-500/20"><Calculator className="w-4 h-4 text-emerald-400" /></div> Equations & Formulas</>}
                                    {selectedDetailCategory === 'definitions' && <><div className="p-1 rounded bg-amber-500/20"><BookOpen className="w-4 h-4 text-amber-400" /></div> Important Definitions</>}
                                </h3>
                                <button onClick={() => setSelectedDetailCategory(null)} className="p-1.5 hover:bg-white/10 rounded-full transition-all hover:rotate-90 group">
                                    <X className="w-4 h-4 text-slate-400 group-hover:text-white" />
                                </button>
                            </div>

                            {selectedDetailCategory === 'keywords' && (
                                <div className="flex flex-wrap gap-2 mb-6">
                                    {[...(structuredData?.keywords || []), ...parsedContent.filter((c: SmartBoardContent) => c.type === 'keyword').map((c: SmartBoardContent) => c.content)].filter((v: string, i: number, a: string[]) => a.indexOf(v) === i).map((kw, i) => (
                                        <span key={i} className="px-3 py-1.5 text-[11px] rounded-lg font-medium shadow-sm transition-colors" style={{ backgroundColor: 'rgba(45, 212, 191, 0.1)', borderColor: 'rgba(45, 212, 191, 0.1)', color: '#2DD4BF', border: '1px solid' }} onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.4)'} onMouseLeave={(e) => e.currentTarget.style.borderColor = 'rgba(45, 212, 191, 0.1)'}>
                                            {kw}
                                        </span>
                                    ))}
                                    {((structuredData?.keywords?.length || 0) + dynamicKeywords) === 0 && <p className="text-slate-500 text-[10px] italic">No keywords detected yet.</p>}
                                </div>
                            )}

                            {selectedDetailCategory === 'formulas' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                    {[...(structuredData?.formulas || []), ...parsedContent.filter((c: SmartBoardContent) => c.type === 'formula').map((c: SmartBoardContent) => ({ formula: c.content, description: c.metadata?.description }))].map((f, i) => (
                                        <div key={i} className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl space-y-2 hover:border-emerald-500/30 transition-colors">
                                            <div className="text-emerald-300 font-mono text-xs p-2 bg-black/20 rounded border border-emerald-500/5 select-all">{f.formula}</div>
                                            <div className="text-slate-400 text-[10px] leading-relaxed px-1">{f.description}</div>
                                        </div>
                                    ))}
                                    {((structuredData?.formulas?.length || 0) + dynamicFormulas) === 0 && <p className="text-slate-500 text-[10px] italic">No formulas detected yet.</p>}
                                </div>
                            )}

                            {selectedDetailCategory === 'definitions' && (
                                <div className="grid grid-cols-1 gap-4 mb-6">
                                    {[...(structuredData?.definitions || []), ...parsedContent.filter((c: SmartBoardContent) => c.type === 'definition').map((c: SmartBoardContent) => ({ term: c.content, definition: c.metadata?.description }))].map((d, i) => (
                                        <div key={i} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl group hover:border-amber-500/30 hover:bg-amber-500/10 transition-all duration-300 transform hover:-translate-y-0.5">
                                            <div className="flex flex-col gap-2">
                                                <div className="text-amber-300 font-bold text-[13px] group-hover:text-amber-200 transition-colors flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50 group-hover:bg-amber-400"></div>
                                                    {d.term}
                                                </div>
                                                <div className="text-slate-400 text-[11px] leading-relaxed border-l-2 border-amber-500/20 pl-4 mt-0.5 group-hover:text-slate-200 transition-colors">
                                                    {d.definition}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {((structuredData?.definitions?.length || 0) + dynamicDefinitions) === 0 && <p className="text-slate-500 text-[10px] italic">No definitions detected yet.</p>}
                                </div>
                            )}

                            {selectedDetailCategory === 'images' && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    {structuredData?.images?.map((img, i) => (
                                        <div
                                            key={i}
                                            className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-3 hover:border-blue-500/30 transition-all duration-300 group cursor-pointer"
                                            onClick={() => setSelectedImage(img)}
                                        >
                                            <div className="relative overflow-hidden rounded-lg bg-black/20">
                                                <img
                                                    src={img.url}
                                                    alt={img.description}
                                                    className="w-full h-48 object-contain transition-transform duration-300 group-hover:scale-105"
                                                    onError={(e) => {
                                                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23334155" width="100" height="100"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%2364748b" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
                                                    }}
                                                />
                                                {/* Click to Enlarge Hint */}
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full border border-white/20">
                                                        <span className="text-white text-xs font-medium">Click to enlarge</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-slate-400 text-[10px] leading-relaxed px-1">{img.description}</div>
                                        </div>
                                    ))}
                                    {(structuredData?.images?.length || 0) === 0 && <p className="text-slate-500 text-[10px] italic">No images available for this topic.</p>}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Compact Layout - Optimized for Content */}
            <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-slate-950 to-slate-900">

                {/* 1. TOPIC HEADER - Now at Top */}
                {/* 1. TOPIC HEADER - With Live Indicator */}
                <div className="px-4 py-2 border-b border-white/10 bg-slate-900/30 flex-shrink-0 relative z-30">
                    <h2 className="text-sm font-bold text-center text-white tracking-tight">
                        {props.lessonTitle}
                    </h2>
                    {isActive && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center space-x-1.5 px-2 py-0.5 bg-emerald-500/10 backdrop-blur-sm rounded-full border border-emerald-400/30">
                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></div>
                            <span className="text-[10px] text-emerald-300 font-bold tracking-wider">LIVE</span>
                        </div>
                    )}
                </div>

                {/* 3. MAIN CONTENT: Full Width Visual Board */}
                <div className="flex-1 p-3 overflow-hidden min-h-0 flex flex-col">
                    {/* Visual Board - Full Space */}
                    <div className="flex-1 flex flex-col border border-slate-700/50 rounded-xl bg-slate-900/40 p-3 overflow-hidden shadow-inner group relative">
                        <div className="flex items-center justify-between mb-2 flex-shrink-0 relative z-10">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                                <ImageIcon className="w-3.5 h-3.5" />
                                Visual Board
                            </h3>
                            {structuredData?.images?.[0] && (
                                <span className="text-[10px] text-slate-600 font-medium">Educational Illustration</span>
                            )}
                        </div>

                        {/* Main Interaction Area: Unified Scrolling for Content and Images */}
                        <div className="flex-1 flex flex-row overflow-y-auto custom-scrollbar min-h-0 relative z-0">
                            {/* Left Side: Live Content Flow (Keywords, Formulas, Definitions) */}
                            <div className="flex-1 px-4 py-2 flex flex-col items-start gap-4">
                                {activeVisualKeywords.length === 0 && !structuredData?.images?.length && (
                                    <div className="w-full h-full flex items-center justify-center text-slate-600 italic">
                                        Listening to lecture...
                                    </div>
                                )}
                                {activeVisualKeywords.map((content, idx) => (
                                    <div
                                        key={idx}
                                        className="animate-in slide-in-from-bottom-2 fade-in duration-500 w-full"
                                    >
                                        {/* KEYWORDS -> Headings */}
                                        {content.type === 'keyword' && (
                                            <h2 className="text-2xl font-bold font-serif italic drop-shadow-md underline underline-offset-4 mt-2 mb-1" style={{ color: '#2DD4BF', textDecorationColor: 'rgba(45, 212, 191, 0.3)' }}>
                                                {content.content}
                                            </h2>
                                        )}

                                        {/* FORMULAS -> Block Math */}
                                        {content.type === 'formula' && (
                                            <div className="my-2 p-3 bg-emerald-950/40 border-l-4 border-emerald-500/50 rounded-r-lg backdrop-blur-sm w-fit max-w-[90%]">
                                                <div className="text-emerald-300 font-mono text-lg font-bold tracking-wider drop-shadow-sm">
                                                    {content.displayContent || content.content}
                                                </div>
                                            </div>
                                        )}

                                        {/* DEFINITIONS -> Keyword Title + Definition Paragraph */}
                                        {content.type === 'definition' && (
                                            <div className="w-full">
                                                {/* Show as Keyword Title First */}
                                                <h2 className="text-2xl font-bold font-serif italic drop-shadow-md underline underline-offset-4 mt-2 mb-1" style={{ color: '#2DD4BF', textDecorationColor: 'rgba(45, 212, 191, 0.3)' }}>
                                                    {content.content}
                                                </h2>
                                                {/* Then show definition paragraph */}
                                                <p className="text-sm text-slate-200 leading-relaxed font-sans opacity-90 pl-4 border-l-2 border-amber-500/30 ml-1 mt-1">
                                                    {content.metadata?.description || "Definition..."}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                <div ref={bottomRef} className="h-4" /> {/* Auto-scroll Anchor */}
                            </div>

                            {/* Right Side: Topic Images Grid (Landscape Mode) */}
                            {structuredData?.images && structuredData.images.length > 0 && (
                                <div className="w-[45%] border-l border-white/5 bg-black/10 p-3 flex flex-col gap-3">
                                    <div className={`grid gap-3 ${structuredData.images.length >= 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                        {structuredData.images.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="group relative aspect-video bg-white rounded-lg overflow-hidden border border-white/10 hover:border-cyan-500/40 transition-all cursor-pointer shadow-xl"
                                                onClick={() => setSelectedImage(img)}
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.description}
                                                    className="w-full h-full object-cover"
                                                    onLoad={() => setIsImageLoaded(true)}
                                                    onError={() => setImageError(true)}
                                                />
                                                {/* Enlarge Icon Hint */}
                                                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="p-1 bg-black/40 backdrop-blur-md rounded-md border border-white/10">
                                                        <Sparkles className="w-3 h-3 text-cyan-300" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Summarization Section */}
            {!hideFooter && (
                <div className="relative px-6 py-3 border-t border-white/5 bg-slate-900/50 backdrop-blur-xl z-10 flex flex-col max-h-[180px]">
                    <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-400/30">
                            <FileText className="w-4 h-4 text-blue-400" />
                        </div>
                        <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Lecture Script</h4>
                    </div>
                    <div className="text-slate-300 text-xs leading-relaxed pl-4 border-l-2 border-blue-500/40 overflow-y-auto pr-2 custom-scrollbar max-h-[4.5rem] min-h-[4.5rem]">
                        {structuredData?.lecture_script ? (
                            <HighlightedLectureScript
                                fullScript={structuredData.lecture_script}
                                currentSpeech={props.currentSpeech || ''}
                            />
                        ) : (
                            <span className="text-slate-500 italic">Lecture script loading...</span>
                        )}
                    </div>
                </div>
            )}

            {/* Image Lightbox Modal */}
            {selectedImage && (
                <div
                    className="absolute inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200"
                    onClick={() => setSelectedImage(null)}
                >
                    <div className="relative w-full h-full flex flex-col max-w-full max-h-full">
                        {/* Close Button */}
                        <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-2 right-2 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm border border-white/20 transition-all group"
                        >
                            <X className="w-5 h-5 text-white group-hover:rotate-90 transition-transform duration-300" />
                        </button>

                        {/* Image Container */}
                        <div
                            className="flex-1 flex items-center justify-center overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={selectedImage.url}
                                alt={selectedImage.description}
                                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>

                        {/* Description */}
                        <div className="bg-slate-900/90 backdrop-blur-md border-t border-white/10 p-3 rounded-b-lg flex-shrink-0">
                            <p className="text-slate-200 text-xs leading-relaxed text-center line-clamp-2">
                                {selectedImage.description}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export const SmartBoardRightPanel: React.FC<SmartBoardRightPanelProps> = ({
    userNotes: propUserNotes,
    onNotesChange
}) => {
    const [localUserNotes, setLocalUserNotes] = useState('');
    const userNotes = propUserNotes !== undefined ? propUserNotes : localUserNotes;

    const setUserNotes = (value: string | ((prev: string) => string)) => {
        const newValue = typeof value === 'function' ? value(userNotes) : value;
        if (onNotesChange) {
            onNotesChange(newValue);
        } else {
            setLocalUserNotes(newValue);
        }
    };
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentColor, setCurrentColor] = useState('#8b5cf6');
    const [brushSize, setBrushSize] = useState(3);
    const [drawingTool, setDrawingTool] = useState<'pen' | 'eraser'>('pen');
    const [drawingShape, setDrawingShape] = useState<'free' | 'line' | 'rect' | 'circle'>('free');
    const [canvasBg, setCanvasBg] = useState<'none' | 'grid' | 'lines' | 'dots'>('none');
    const boardTheme = 'dark';
    const [showSymbolKeyboard, setShowSymbolKeyboard] = useState(false);

    // Canvas History
    const [history, setHistory] = useState<ImageData[]>([]);
    const [historyStep, setHistoryStep] = useState(-1);
    const [startPos, setStartPos] = useState<{ x: number, y: number } | null>(null);
    const [snapshot, setSnapshot] = useState<ImageData | null>(null);


    const [collapsedSections, setCollapsedSections] = useState({
        canvas: false,
        notes: false
    });

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Symbol sets for the virtual keyboard
    const symbolSets = {
        math: ['+', '-', '×', '÷', '=', '≠', '≈', '±', '≤', '≥', '∞', 'π', '√', '∑', '∫', '∆', '°', '∠'],
        greek: ['α', 'β', 'γ', 'δ', 'ε', 'θ', 'λ', 'μ', 'π', 'ρ', 'σ', 'φ', 'ω', 'Ω'],
        chemistry: ['→', '⇌', '↑', '↓', '⁺', '⁻', '₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉']
    };

    const insertSymbol = (symbol: string) => {
        if (textareaRef.current) {
            const start = textareaRef.current.selectionStart;
            const end = textareaRef.current.selectionEnd;
            const text = userNotes;
            const newText = text.substring(0, start) + symbol + text.substring(end);
            setUserNotes(newText);

            // Restore focus and cursor position
            setTimeout(() => {
                if (textareaRef.current) {
                    textareaRef.current.focus();
                    textareaRef.current.setSelectionRange(start + symbol.length, start + symbol.length);
                }
            }, 0);
        } else {
            setUserNotes(prev => prev + symbol);
        }
    };

    // Clear board
    const clearBoard = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            saveHistory(); // Save clear state
        }
    };

    // Canvas History Functions
    const saveHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const newHistory = history.slice(0, historyStep + 1);
        newHistory.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
        setHistory(newHistory);
        setHistoryStep(newHistory.length - 1);
    };

    const undo = () => {
        if (historyStep > 0) {
            const newStep = historyStep - 1;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx && history[newStep]) {
                ctx.putImageData(history[newStep], 0, 0);
                setHistoryStep(newStep);
            }
        }
    };

    const redo = () => {
        if (historyStep < history.length - 1) {
            const newStep = historyStep + 1;
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d');
            if (canvas && ctx && history[newStep]) {
                ctx.putImageData(history[newStep], 0, 0);
                setHistoryStep(newStep);
            }
        }
    };

    // Drawing functions
    const startDrawing = (e: React.MouseEvent) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setIsDrawing(true);
        setStartPos({ x, y });

        const ctx = canvas.getContext('2d');
        if (ctx) {
            setSnapshot(ctx.getImageData(0, 0, canvas.width, canvas.height));
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.strokeStyle = drawingTool === 'eraser' ? (boardTheme === 'dark' ? '#1f2937' : '#ffffff') : currentColor;
            ctx.lineWidth = drawingTool === 'eraser' ? brushSize * 5 : brushSize;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            if (drawingTool === 'eraser') {
                ctx.globalCompositeOperation = 'destination-out';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }
        }
    };

    const draw = (e: React.MouseEvent) => {
        if (!isDrawing || !startPos) return;
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const ctx = canvas.getContext('2d');
        if (ctx) {
            if (drawingShape !== 'free' && snapshot) {
                ctx.putImageData(snapshot, 0, 0);
                ctx.beginPath();
            }

            if (drawingShape === 'free') {
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if (drawingShape === 'line') {
                ctx.beginPath();
                ctx.moveTo(startPos.x, startPos.y);
                ctx.lineTo(x, y);
                ctx.stroke();
            } else if (drawingShape === 'rect') {
                ctx.beginPath();
                ctx.rect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
                ctx.stroke();
            } else if (drawingShape === 'circle') {
                ctx.beginPath();
                const radius = Math.sqrt(Math.pow(x - startPos.x, 2) + Math.pow(y - startPos.y, 2));
                ctx.arc(startPos.x, startPos.y, radius, 0, 2 * Math.PI);
                ctx.stroke();
            }
        }
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            saveHistory();
        }
    };

    // Initialize history
    useEffect(() => {
        if (canvasRef.current && history.length === 0) {
            saveHistory();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helper to toggle sections
    const toggleSection = (section: keyof typeof collapsedSections) => {
        setCollapsedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    // Get CSS background for canvas
    const getCanvasBackground = () => {
        const color = 'var(--canvas-grid-color)';
        switch (canvasBg) {
            case 'grid':
                return `linear-gradient(${color} 1px, transparent 1px), linear-gradient(90deg, ${color} 1px, transparent 1px)`;
            case 'lines':
                return `repeating-linear-gradient(0deg, ${color}, ${color} 1px, transparent 1px, transparent 20px)`;
            case 'dots':
                return `radial-gradient(${color} 1px, transparent 1px)`;
            default:
                return 'none';
        }
    };

    const getCanvasBgSize = () => {
        switch (canvasBg) {
            case 'grid': return '20px 20px';
            case 'dots': return '20px 20px';
            default: return 'auto';
        }
    };

    const boardBgClass = 'bg-transparent';
    const boardTextClass = 'text-slate-200';

    return (
        <div className={`flex-1 flex flex-col ${boardBgClass} overflow-hidden transition-all duration-500 border-l border-gray-200 dark:border-gray-800`}>
            {/* Header */}
            <div className="relative p-4 border-b border-slate-200 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md flex-shrink-0">
                <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">My Notes & Canvas</h3>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={clearBoard}
                            className="p-2 text-red-300 bg-red-500/10 hover:bg-red-500/20 backdrop-blur-sm rounded-xl border border-red-500/20 transition-all"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Drawing Canvas */}
                <div className="mt-0">
                    <div
                        className="flex items-center justify-between mb-3 cursor-pointer group"
                        onClick={() => toggleSection('canvas')}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full">
                                <Edit3 className="w-5 h-5 text-white" />
                            </div>
                            <h4 className={`font-bold ${boardTextClass} text-base group-hover:text-blue-500 transition-colors`}>Visual Notes & Sketches</h4>
                            {collapsedSections.canvas ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                    </div>

                    {!collapsedSections.canvas && (
                        <div className={`space-y-4 transition-all duration-300`}>
                            {/* Canvas Toolbar */}
                            <div className={`flex flex-wrap items-center gap-4 p-3 rounded-2xl border border-white/10 bg-[#0f111a]/80 shadow-2xl backdrop-blur-xl`}>
                                {/* Tools */}
                                <div className="flex items-center space-x-1.5 border-r border-white/10 pr-3">
                                    <button
                                        onClick={() => setDrawingTool('pen')}
                                        className={`p-2.5 rounded-xl transition-all duration-300 ${drawingTool === 'pen' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                        title="Pen"
                                    >
                                        <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => setDrawingTool('eraser')}
                                        className={`p-2.5 rounded-xl transition-all duration-300 ${drawingTool === 'eraser' ? 'bg-blue-500 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                        title="Eraser"
                                    >
                                        <Eraser className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Colors */}
                                <div className="flex items-center space-x-2 border-r border-white/10 pr-3">
                                    {['#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#ffffff'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => {
                                                setCurrentColor(color);
                                                setDrawingTool('pen');
                                            }}
                                            className={`w-6 h-6 rounded-full border-2 transition-all duration-300 ${currentColor === color && drawingTool === 'pen' ? 'border-white scale-125 shadow-lg' : 'border-transparent hover:scale-110'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>

                                {/* Brush Size */}
                                <div className="flex items-center space-x-3 border-r border-white/10 pr-3">
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={brushSize}
                                        onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                        className="w-20 accent-blue-500 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                        title="Brush Size"
                                    />
                                    <span className="text-[10px] font-bold text-gray-400 w-4">{brushSize}</span>
                                </div>

                                <div className="flex items-center space-x-1.5 border-r border-white/10 pr-3">
                                    <button onClick={() => setDrawingShape('free')} className={`p-2 rounded-lg transition-all ${drawingShape === 'free' ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30' : 'text-gray-400 hover:bg-white/5'}`}><Move className="w-4 h-4" /></button>
                                    <button onClick={() => setDrawingShape('line')} className={`p-2 rounded-lg transition-all ${drawingShape === 'line' ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30' : 'text-gray-400 hover:bg-white/5'}`}><Minus className="w-4 h-4" /></button>
                                    <button onClick={() => setDrawingShape('rect')} className={`p-2 rounded-lg transition-all ${drawingShape === 'rect' ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30' : 'text-gray-400 hover:bg-white/5'}`}><Square className="w-4 h-4" /></button>
                                    <button onClick={() => setDrawingShape('circle')} className={`p-2 rounded-lg transition-all ${drawingShape === 'circle' ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30' : 'text-gray-400 hover:bg-white/5'}`}><Circle className="w-4 h-4" /></button>
                                </div>

                                <div className="flex items-center space-x-1">
                                    <button onClick={() => setCanvasBg('none')} className={`p-2 rounded-lg transition-all ${canvasBg === 'none' ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30' : 'text-gray-400 hover:bg-white/5'}`} title="No Background"><Square className="w-4 h-4" /></button>
                                    <button onClick={() => setCanvasBg('grid')} className={`p-2 rounded-lg transition-all ${canvasBg === 'grid' ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30' : 'text-gray-400 hover:bg-white/5'}`} title="Grid"><Grid className="w-4 h-4" /></button>
                                </div>

                                <div className="flex-1"></div>

                                <div className="flex items-center space-x-1">
                                    <button onClick={undo} disabled={historyStep <= 0} className="p-2 text-gray-400 disabled:opacity-30 hover:bg-white/5 rounded-lg transition-colors"><Undo2 className="w-4 h-4" /></button>
                                    <button onClick={redo} disabled={historyStep >= history.length - 1} className="p-2 text-gray-400 disabled:opacity-30 hover:bg-white/5 rounded-lg transition-colors"><Redo2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            {/* Canvas Area */}
                            <div className={`relative w-full h-64 rounded-xl overflow-hidden border-2 border-white/10 bg-black/20 shadow-inner cursor-crosshair group`}>
                                <canvas
                                    ref={canvasRef}
                                    width={800}
                                    height={600}
                                    className="w-full h-full touch-none"
                                    style={{
                                        backgroundImage: getCanvasBackground(),
                                        backgroundSize: getCanvasBgSize()
                                    }}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Personal Notes Section */}
                <div className="mt-6">
                    <div
                        className="flex items-center justify-between mb-3 cursor-pointer group"
                        onClick={() => toggleSection('notes')}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full">
                                <FileText className="w-5 h-5 text-white" />
                            </div>
                            <h4 className={`font-bold ${boardTextClass} text-base group-hover:text-blue-500 transition-colors`}>Personal Notes</h4>
                            {collapsedSections.notes ? <ChevronRight className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                        </div>
                    </div>

                    {!collapsedSections.notes && (
                        <div className={`relative transition-all duration-300`}>
                            <div className={`absolute top-2 right-2 flex items-center space-x-1 z-10`}>
                                <button
                                    onClick={() => setShowSymbolKeyboard(!showSymbolKeyboard)}
                                    className={`p-1.5 rounded-lg ${showSymbolKeyboard ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                                    title="Symbol Keyboard"
                                >
                                    <KeyboardIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <textarea
                                ref={textareaRef}
                                value={userNotes}
                                onChange={(e) => setUserNotes(e.target.value)}
                                placeholder="Type your notes here... (Supports Markdown)"
                                className={`w-full h-48 p-4 rounded-xl border-2 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 
                                    bg-black/20 border-white/10 text-slate-200 placeholder-slate-500
                                    shadow-sm`}
                            />

                            {/* Virtual Keyboard */}
                            {showSymbolKeyboard && (
                                <div className={`mt-2 p-3 rounded-xl border ${boardTheme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} shadow-lg animate-in slide-in-from-top-2`}>
                                    <div className="space-y-3">
                                        {Object.entries(symbolSets).map(([category, symbols]) => (
                                            <div key={category}>
                                                <div className="text-xs font-semibold text-gray-500 uppercase mb-1.5">{category}</div>
                                                <div className="flex flex-wrap gap-1">
                                                    {symbols.map(symbol => (
                                                        <button
                                                            key={symbol}
                                                            onClick={() => insertSymbol(symbol)}
                                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${boardTheme === 'dark'
                                                                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                                }`}
                                                        >
                                                            {symbol}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export { EnhancedSmartBoard };

