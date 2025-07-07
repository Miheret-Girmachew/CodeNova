// src/pages/WeekContentPage.tsx

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button.js';
import { Checkbox } from '../components/ui/checkbox.js';
import { Loader2, AlertCircle, ArrowLeft, CheckSquare, HelpCircle, ArrowRight, CheckCircle, Download, Book, Video, FileText, Beaker } from 'lucide-react';
import * as apiService from '../services/api';
import type { Week, Section, ContentItem, RichContentItemBlock, UserQuizSubmission } from '../services/api';
import QuizDisplay from '../components/QuizDisplay';
import { useAuth } from '../context/AuthContext.js';
import ReactPlayer from 'react-player';
import { cn } from '../lib/utils';

const DEFAULT_PASSING_SCORE = 70;

interface WeekWithCourseDefaults extends Week {
    defaultCoursePassingScore?: number;
}

const WeekContentPage: React.FC = () => {
    // All state and logic hooks are 100% preserved.
    const { courseId, weekId } = useParams<{ courseId: string; weekId: string }>();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [weekData, setWeekData] = useState<WeekWithCourseDefaults | null>(null);
    const [currentSection, setCurrentSection] = useState<Section | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [userProgress, setUserProgress] = useState<Record<string, boolean>>({});
    const [isProgressUpdating, setIsProgressUpdating] = useState<Record<string, boolean>>({});
    const [initialSubmissions, setInitialSubmissions] = useState<Record<string, UserQuizSubmission | null>>({});
    const [loadingSubmissions, setLoadingSubmissions] = useState<Record<string, boolean>>({});

    const fetchInitialQuizSubmission = useCallback(async (dbQuizId: string) => {
        if (!currentUser || !dbQuizId) return;
        setLoadingSubmissions(p => ({ ...p, [dbQuizId]: true }));
        try {
            const submission = await apiService.getMySubmissionForQuiz(dbQuizId);
            setInitialSubmissions(p => ({ ...p, [dbQuizId]: submission }));
        } catch (err) {
            setInitialSubmissions(p => ({ ...p, [dbQuizId]: null }));
        } finally {
            setLoadingSubmissions(p => ({ ...p, [dbQuizId]: false }));
        }
    }, [currentUser]);

    useEffect(() => {
        if (!courseId || !weekId) return;
        const fetchWeekAndProgress = async () => {
            setIsLoading(true);
            try {
                const [fetchedWeek, fetchedProgress] = await Promise.all([
                    apiService.getWeekWithDetails(weekId) as Promise<WeekWithCourseDefaults>,
                    apiService.getUserWeekProgress(weekId)
                ]);
                if (fetchedWeek?.sections) {
                    const sortedSections = [...fetchedWeek.sections].sort((a, b) => (a.order || 0) - (b.order || 0));
                    setWeekData({ ...fetchedWeek, sections: sortedSections });
                    const hashSectionId = window.location.hash.substring(1);
                    const restoredSection = sortedSections.find(s => s.id === hashSectionId);
                    setCurrentSection(restoredSection || sortedSections[0] || null);
                } else { throw new Error("Week data or sections not found."); }
                if (fetchedProgress) setUserProgress(fetchedProgress);
            } catch (err: any) {
                setError(err.message || "Failed to fetch week data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchWeekAndProgress();
    }, [courseId, weekId]);

    useEffect(() => {
        currentSection?.content?.forEach(item =>
            item.richContent?.forEach(block => {
                const dbQuizId = (block as any).quizContent?.databaseQuizId;
                if (block.type === 'quiz' && dbQuizId && initialSubmissions[dbQuizId] === undefined && !loadingSubmissions[dbQuizId]) {
                    fetchInitialQuizSubmission(dbQuizId);
                }
            })
        );
    }, [currentSection, fetchInitialQuizSubmission, initialSubmissions, loadingSubmissions]);

    useEffect(() => {
        if (currentSection?.id && window.location.hash !== `#${currentSection.id}`) {
            navigate(`#${currentSection.id}`, { replace: true });
        }
    }, [currentSection, navigate]);

    const handleSectionSelect = useCallback((sectionId: string) => {
        const selected = weekData?.sections?.find(s => s.id === sectionId);
        if (selected) {
            setCurrentSection(selected);
            document.getElementById('main-content-area')?.scrollTo(0, 0);
        }
    }, [weekData]);

    const handleMarkSectionComplete = async (sectionId: string, isCompleted: boolean) => {
        if (!weekId) return;
        setIsProgressUpdating(prev => ({ ...prev, [sectionId]: true }));
        const previousProgress = { ...userProgress };
        setUserProgress(prev => ({ ...prev, [sectionId]: isCompleted }));
        try {
            await apiService.updateSectionProgress(weekId, sectionId, isCompleted);
        } catch (error) {
            setUserProgress(previousProgress);
        } finally {
            setIsProgressUpdating(prev => ({ ...prev, [sectionId]: false }));
        }
    };
    
    // This function remains the same, as it correctly handles the RichContentItemBlock type
    const renderRichContentBlock = (block: RichContentItemBlock, index: number) => {
        const blockKey = block.id || `block-${index}`;
        switch (block.type) {
            case 'text':
                return <div key={blockKey} className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: block.content || '' }} />;
            case 'video':
                const vc = (block as any).videoContent;
                if (!vc?.videoUrl) return <div key={blockKey}>Video not available.</div>;
                return <div key={blockKey} className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-md"><ReactPlayer url={vc.videoUrl} controls width="100%" height="100%" /></div>;
            case 'document':
                 const dc = (block as any).documentContent;
                 if (!dc?.documentUrl) return <div key={blockKey}>Document not available.</div>;
                 return <a key={blockKey} href={dc.documentUrl} target="_blank" rel="noopener noreferrer"><Button><Download className="mr-2 h-4 w-4"/>{dc.title || 'Download Document'}</Button></a>;
            case 'quiz':
                const qc = (block as any).quizContent;
                const dbQuizId = qc?.databaseQuizId;
                if (!dbQuizId || !courseId || !weekId) return <div key={blockKey}>Quiz configuration error.</div>;
                const passingScore = weekData?.defaultCoursePassingScore ?? qc?.settings?.passingScore ?? DEFAULT_PASSING_SCORE;
                return <QuizDisplay key={dbQuizId} databaseQuizId={dbQuizId} quizData={qc} initialUserSubmission={initialSubmissions[dbQuizId]} isLoadingInitialSubmission={loadingSubmissions[dbQuizId]} onQuizSubmitSuccess={() => fetchInitialQuizSubmission(dbQuizId)} courseId={courseId} weekId={weekId} passingScore={passingScore} />;
            default:
                return <div key={blockKey} className="text-red-500 text-sm">Unsupported content block type.</div>;
        }
    };

    if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-sky-500" /></div>;
    if (error) return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><AlertCircle className="h-12 w-12 text-red-500 mb-4" /><h2 className="text-xl font-semibold mb-2">Error Loading Week</h2><p className="text-slate-600 mb-6 max-w-md">{error}</p><Button onClick={() => navigate(-1)}>Go Back</Button></div>;
    if (!weekData) return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><HelpCircle className="h-12 w-12 text-slate-400 mb-4" /><h2 className="text-xl font-semibold mb-2">Week Not Found</h2><Button onClick={() => navigate(-1)}>Go Back</Button></div>;

    const sortedSections = weekData.sections || [];
    const currentSectionIndex = currentSection ? sortedSections.findIndex(s => s.id === currentSection.id) : -1;
    const nextSection = currentSectionIndex > -1 && currentSectionIndex < sortedSections.length - 1 ? sortedSections[currentSectionIndex + 1] : null;

    // Helper to get the correct icon for a ContentItem
    const getContentItemIcon = (itemType: ContentItem['type']) => {
        switch(itemType) {
            case 'text': return Book;
            case 'video': return Video;
            case 'document': return FileText;
            case 'quiz_link': return Beaker; // Assuming this is also a quiz-like item
            default: return Book;
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-950">
            <aside className="w-full md:w-80 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 md:sticky md:top-0 md:h-screen overflow-y-auto shrink-0">
                <div className="mb-4">
                    {courseId && <Button variant="ghost" onClick={() => navigate(`/courses/${courseId}`)} className="p-0 mb-3 text-sm text-sky-600 dark:text-sky-400 hover:text-sky-500 flex items-center"><ArrowLeft className="mr-1.5 h-4 w-4" />Back to Module</Button>}
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Week {weekData.weekNumber}: {weekData.title}</h2>
                    <p className="text-sm mt-1 text-slate-600 dark:text-slate-400">{weekData.description}</p>
                </div>
                <nav className="space-y-1.5">
                    {sortedSections.map(section => (
                        <button key={section.id} onClick={() => handleSectionSelect(section.id!)} className={cn('w-full text-left h-auto py-2.5 px-3 rounded-md transition-colors duration-150 flex items-center gap-3 text-sm', currentSection?.id === section.id ? 'bg-sky-100 dark:bg-sky-500/10 text-sky-700 dark:text-sky-300 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800')}>
                            {userProgress[section.id!] ? <CheckSquare className="h-5 w-5 text-emerald-500 shrink-0" /> : <div className="h-5 w-5 border-2 border-slate-300 dark:border-slate-600 rounded-md shrink-0"/>}
                            <span className="truncate">{section.order}. {section.title}</span>
                        </button>
                    ))}
                </nav>
            </aside>

            <main id="main-content-area" className="flex-1 p-4 sm:p-6 md:p-8 lg:p-12 overflow-y-auto">
                {currentSection ? (
                    <article key={currentSection.id} id={currentSection.id}>
                        <h1 className="text-3xl lg:text-4xl font-bold mb-3 text-slate-900 dark:text-white">{currentSection.title}</h1>
                        <p className="text-lg mb-8 text-slate-600 dark:text-slate-400">{currentSection.description}</p>
                        
                        <div className="space-y-8 divide-y divide-slate-200 dark:divide-slate-800">
                             {/* FIXED: Corrected rendering logic */}
                            {currentSection.content?.sort((a,b) => (a.order || 0) - (b.order || 0)).map((item, index) => {
                                const Icon = getContentItemIcon(item.type);
                                return (
                                    <div key={item.id || `ci-${index}`} className="pt-8 first:pt-0">
                                        <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100 flex items-center gap-3">
                                            <Icon className="h-6 w-6 text-sky-500"/>
                                            {item.title}
                                        </h2>
                                        <div className="ml-9 space-y-6">
                                            {item.richContent && item.richContent.map((block, blockIndex) => renderRichContentBlock(block, blockIndex))}
                                            
                                            {item.type === 'text' && !item.richContent && item.content && (
                                                <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: item.content }} />
                                            )}

                                            {item.type === 'video' && !item.richContent && item.url && (
                                                <div className="aspect-video w-full bg-black rounded-lg overflow-hidden shadow-md"><ReactPlayer url={item.url} controls width="100%" height="100%" /></div>
                                            )}
                                            
                                            {item.type === 'quiz_link' && item.url && (
                                                <a href={item.url} target="_blank" rel="noopener noreferrer"><Button>Go to Quiz</Button></a>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center space-x-3">
                                <Checkbox id={`complete-${currentSection.id}`} checked={!!userProgress[currentSection.id!]} disabled={isProgressUpdating[currentSection.id!]} onCheckedChange={(checked) => handleMarkSectionComplete(currentSection.id!, !!checked)} className="h-5 w-5 rounded data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                                <label htmlFor={`complete-${currentSection.id}`} className="font-medium text-slate-700 dark:text-slate-300 cursor-pointer">{isProgressUpdating[currentSection.id!] ? 'Updating...' : 'Mark as Completed'}</label>
                            </div>
                            {nextSection ? (
                                <Button onClick={() => handleSectionSelect(nextSection.id!)} className="bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto group">Next Section<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" /></Button>
                            ) : (
                                <Button onClick={() => navigate(`/courses/${courseId}`)} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto">Finish Week<CheckCircle className="ml-2 h-4 w-4" /></Button>
                            )}
                        </div>
                    </article>
                ) : (
                    <div className="text-center py-10"><HelpCircle className="mx-auto h-16 w-16 text-slate-400" /><p className="mt-5 text-xl font-semibold text-slate-700 dark:text-slate-200">Select a section from the sidebar to begin.</p></div>
                )}
            </main>
        </div>
    );
};

export default WeekContentPage;