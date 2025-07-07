// src/pages/DashboardPage.tsx

import React, { useState, useEffect, useMemo, MouseEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { CheckCircle2, PlayCircle, Lock, Loader2, AlertCircle, Film, Sparkles } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as apiService from "../services/api";
import type { ProcessedCourseOverviewItem } from "../services/api";
import GuidanceVideoModal from "../components/modals/GuidanceVideoModal";
import { cn } from "../lib/utils";

export interface AccessibleContentWeek {
  id: string;
  weekNumber: number;
  title: string;
  isCompleted?: boolean;
  progress?: number;
}

export interface AccessibleContentCourse {
  id: string;
  title: string;
  monthOrder: number;
  weeks: AccessibleContentWeek[];
}

interface DashboardProcessedCourse extends ProcessedCourseOverviewItem {
    detailedWeeks?: AccessibleContentWeek[];
}

const dummyDashboardPageContent = {
    guidanceSection: {
        title: "Welcome to Your Dashboard!",
        description: "This is your central hub for tracking progress and accessing your courses. Watch our quick guide to get started.",
        buttonText: "Watch Platform Tour",
        videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    }
};

const dummyCourseAccessState = {
    enrollmentMessage: null,
    courses: [
        { id: "html", title: "Month 1: HTML & CSS Foundations", description: "Learn the structural and stylistic building blocks of the web.", monthOrder: 1, status: 'completed', progress: 100 },
        { id: "javascript", title: "Month 2: JavaScript Fundamentals", description: "Dive deep into the language of the web, from variables to asynchronous programming.", monthOrder: 2, status: 'active', progress: 45 },
        { id: "react", title: "Month 3: Building with React", description: "Master the most popular frontend library for building modern user interfaces.", monthOrder: 3, status: 'locked', progress: 0 },
        { id: "nodejs", title: "Month 4: Backend with Node.js & Express", description: "Build powerful server-side applications and REST APIs.", monthOrder: 4, status: 'locked', progress: 0 },
        { id: "advanced-react", title: "Month 5: Advanced React", description: "Level up your skills with advanced patterns and state management.", monthOrder: 5, status: 'locked', progress: 0 },
        { id: "nextjs", title: "Month 6: Full-Stack with Next.js", description: "Bring it all together with the leading full-stack framework.", monthOrder: 6, status: 'locked', progress: 0 },
    ]
};

const dummyAccessibleContent: AccessibleContentCourse[] = [
    { id: "html", title: "Month 1: HTML & CSS", monthOrder: 1, weeks: [
        { id: "html-w1", weekNumber: 1, title: "Intro to HTML", progress: 100 },
        { id: "html-w2", weekNumber: 2, title: "Styling with CSS", progress: 100 },
        { id: "html-w3", weekNumber: 3, title: "Flexbox & Grid", progress: 100 },
        { id: "html-w4", weekNumber: 4, title: "Responsive Design", progress: 100 },
    ]},
    { id: "javascript", title: "Month 2: JavaScript", monthOrder: 2, weeks: [
        { id: "js-w1", weekNumber: 1, title: "JS Fundamentals", progress: 100 },
        { id: "js-w2", weekNumber: 2, title: "DOM Manipulation", progress: 80 },
        { id: "js-w3", weekNumber: 3, title: "Async JS & APIs", progress: 0 },
        { id: "js-w4", weekNumber: 4, title: "Core Project", progress: 0 },
    ]},
];

const accentColor = "text-sky-500 dark:text-sky-400";
const primaryText = "text-slate-900 dark:text-slate-50";
const secondaryText = "text-slate-600 dark:text-slate-400";
const mutedText = "text-slate-500 dark:text-slate-400";
const cardBg = "bg-white dark:bg-slate-900";
const cardBorder = "border border-slate-200 dark:border-slate-800";
const sectionBg = "bg-slate-50 dark:bg-slate-950";
const tabsListBg = "bg-slate-200/80 dark:bg-slate-800";
const positiveColor = "text-emerald-600 dark:text-emerald-400";
const lockedColor = `text-slate-500 dark:text-slate-400`;
const lockedBg = `bg-slate-100 dark:bg-slate-800`;
const activeColor = accentColor;
const tabsTriggerBaseClasses = `px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200`;
const tabsTriggerInactiveClasses = `text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50`;
const tabsTriggerActiveClasses = `shadow bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-300 font-semibold`;
const accentButtonBg = 'bg-sky-500';
const accentButtonBgHover = 'hover:bg-sky-600';

export default function DashboardPage() {
    const { currentUser: user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [dashboardCourses, setDashboardCourses] = useState<DashboardProcessedCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("overview");
    const [showGuidanceVideoModal, setShowGuidanceVideoModal] = useState(false);

    const announcements = [
        { id: 1, title: "New Project: Portfolio Showcase", date: "June 15, 2024", content: "We've added a new optional project to the HTML/CSS module to help you build a stunning portfolio." },
        { id: 2, title: "Live Q&A: JavaScript Deep Dive", date: "June 10, 2024", content: "Join our live session this Friday to ask questions about asynchronous JavaScript and closures." },
    ];

    useEffect(() => {
        if (authLoading) return;

        const loadDummyDashboardData = () => {
            setIsLoading(true);
            setError(null);
            
            try {
                const accessState = dummyCourseAccessState;
                setEnrollmentMessage(accessState.enrollmentMessage);
                let coursesFromAccessState = accessState.courses.sort((a, b) => a.monthOrder - b.monthOrder);
                let processedCourses: DashboardProcessedCourse[] = coursesFromAccessState.map(c => ({
                    ...c,
                    progress: c.progress ?? 0,
                    status: c.status as "completed" | "active" | "locked"
                }));
                
                if (user) {
                    const detailedContentCourses = dummyAccessibleContent;
                    processedCourses = processedCourses.map(course => {
                        const detailedMatch = detailedContentCourses.find(dp => dp.id === course.id);
                        let finalStatus = course.status;
                        let calculatedCourseProgress = course.progress ?? 0;
                        if (detailedMatch?.weeks?.length) {
                            const sumOfWeeksProgress = detailedMatch.weeks.reduce((sum, week) => sum + (week.progress || 0), 0);
                            calculatedCourseProgress = Math.round(sumOfWeeksProgress / detailedMatch.weeks.length);
                            const allWeeksCompleted = detailedMatch.weeks.every(w => w.progress === 100);
                            if (allWeeksCompleted && finalStatus !== 'locked') {
                                finalStatus = 'completed';
                                calculatedCourseProgress = 100;
                            }
                        }
                        return { ...course, status: finalStatus, progress: calculatedCourseProgress, detailedWeeks: detailedMatch?.weeks };
                    });
                }
                setDashboardCourses(processedCourses);
            } catch (err: any) {
                setError("Failed to load dashboard dummy data.");
            } finally {
                setTimeout(() => setIsLoading(false), 500);
            }
        };

        if (!authLoading && user) {
            loadDummyDashboardData();
        } else if (!authLoading && !user) {
            setIsLoading(false);
        }
    }, [user, authLoading]);

    const { completedCoursesCount, overallProgramProgressPercent } = useMemo(() => {
        const trackableCourses = dashboardCourses.filter(c => c.status !== 'locked');
        if (trackableCourses.length === 0) return { completedCoursesCount: 0, overallProgramProgressPercent: 0 };
        const totalProgressSum = trackableCourses.reduce((sum, course) => sum + (course.progress || 0), 0);
        const actualCompletedCount = trackableCourses.filter(c => c.status === 'completed' || c.progress === 100).length;
        const avgProgress = trackableCourses.length > 0 ? Math.round(totalProgressSum / trackableCourses.length) : 0;
        return { completedCoursesCount: actualCompletedCount, overallProgramProgressPercent: avgProgress };
    }, [dashboardCourses]);

    if (authLoading || isLoading) {
        return <div className={`flex flex-col min-h-screen ${sectionBg} justify-center items-center p-4`}><Loader2 className="h-12 w-12 animate-spin text-sky-500" /><p className={`mt-4 text-base ${primaryText}`}>Loading dashboard...</p></div>;
    }

    if (error) {
        return <div className={`flex flex-col min-h-screen ${sectionBg} justify-center items-center p-4 text-center`}><AlertCircle className="h-12 w-12 text-red-500 mb-4" /><h2 className={`text-xl font-semibold mb-2 ${primaryText}`}>Error Loading Dashboard</h2><p className={`text-base ${secondaryText} mb-4`}>{error}</p><Button onClick={() => window.location.reload()} className={`${accentButtonBg} ${accentButtonBgHover} text-white font-semibold`}>Try Again</Button></div>;
    }

    if (!user) {
        return <div className={`flex flex-col min-h-screen ${sectionBg} justify-center items-center p-4 text-center`}><Lock className="h-12 w-12 text-sky-500 mb-4" /><h2 className={`text-xl font-semibold mb-2 ${primaryText}`}>Access Denied</h2><p className={`text-base ${secondaryText} mb-4`}>Please log in to view your dashboard.</p><Button onClick={() => navigate('/login')} className={`${accentButtonBg} ${accentButtonBgHover} text-white font-semibold`}>Go to Login</Button></div>;
    }
    
    return (
        <div className={`flex flex-col min-h-screen ${sectionBg}`}>
            <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
                <div className="mb-8 md:mb-12">
                    <h1 className={`text-3xl md:text-4xl font-bold tracking-tight ${primaryText}`}>Dashboard</h1>
                    <p className={`text-lg ${secondaryText}`}>Welcome back, {user?.displayName || 'Developer'}!</p>
                </div>
                
                {dummyDashboardPageContent.guidanceSection.videoUrl && (
                     <div className={`mb-8 p-6 rounded-lg shadow-sm bg-sky-500/10 border border-sky-500/20`}>
                        <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
                            <Sparkles className={`h-10 w-10 text-sky-500 flex-shrink-0`} />
                            <div className="flex-grow">
                                <h3 className={`text-lg font-semibold mb-1 ${primaryText}`}>{dummyDashboardPageContent.guidanceSection.title}</h3>
                                <p className={`${secondaryText} text-sm max-w-2xl`}>{dummyDashboardPageContent.guidanceSection.description}</p>
                            </div>
                            <Button size="sm" onClick={() => setShowGuidanceVideoModal(true)} className={`${accentButtonBg} ${accentButtonBgHover} text-white font-semibold shadow-sm group mt-2 sm:mt-0 shrink-0`}>
                                <Film className="mr-2 h-4 w-4" />{dummyDashboardPageContent.guidanceSection.buttonText}
                            </Button>
                        </div>
                    </div>
                )}

                {enrollmentMessage && (
                  <Card className={`mb-8 ${cardBg} ${cardBorder} border-l-4 border-amber-500`}><CardContent className="p-4"><div className="flex items-center"><AlertCircle className={`h-5 w-5 mr-3 text-amber-500 flex-shrink-0`} /><p className={`${primaryText} text-sm`}>{enrollmentMessage}</p></div></CardContent></Card>
                )}

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className={`grid w-full grid-cols-2 max-w-md rounded-lg p-1 ${tabsListBg} shadow-inner`}>
                        <TabsTrigger value="overview" className={cn(tabsTriggerBaseClasses, activeTab === 'overview' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses)}>Overview</TabsTrigger>
                        <TabsTrigger value="announcements" className={cn(tabsTriggerBaseClasses, activeTab === 'announcements' ? tabsTriggerActiveClasses : tabsTriggerInactiveClasses)}>Announcements</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="mt-6 space-y-8">
                        <Card className={`${cardBg} ${cardBorder} shadow-sm`}>
                            <CardHeader><CardTitle className={`text-xl ${primaryText}`}>Program Progress</CardTitle><CardDescription className={`${secondaryText}`}>Your overall journey through the CodeNova curriculum.</CardDescription></CardHeader>
                            <CardContent>
                                <div className="mb-2 flex justify-between"><span className={`text-sm font-medium ${secondaryText}`}>Overall Progress</span><span className={`text-sm font-medium ${primaryText}`}>{overallProgramProgressPercent}%</span></div>
                                <Progress value={overallProgramProgressPercent} className="h-2 [&>div]:bg-sky-500" />
                                <p className={`mt-2 text-sm ${mutedText}`}>{completedCoursesCount} of {dashboardCourses.filter(c => c.status !== 'locked').length} required modules completed.</p>
                            </CardContent>
                        </Card>
                        
                        <div>
                            <h2 className={`text-2xl font-bold mb-4 ${primaryText}`}>Your Modules</h2>
                            <div className="space-y-3">
                                {dashboardCourses.map((course) => {
                                    const isLocked = course.status === 'locked';
                                    let statusText = 'View Module';
                                    let statusIconElement = <PlayCircle className={`h-5 w-5 ${activeColor} flex-shrink-0`} />;
                                    let rowBgClass = `bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50`;
                                    
                                    if (course.status === 'completed') {
                                        statusText = 'Completed';
                                        statusIconElement = <CheckCircle2 className={`h-5 w-5 ${positiveColor} flex-shrink-0`} />;
                                    } else if (isLocked) {
                                        statusText = 'Locked';
                                        statusIconElement = <Lock className="h-5 w-5 flex-shrink-0" />;
                                        rowBgClass = `${lockedBg}`;
                                    }

                                    return (
                                        <Link key={course.id} to={isLocked ? '#' : `/courses/${course.id}`} className={cn(`block p-4 rounded-lg border text-sm transition-all duration-150`, cardBorder, rowBgClass, isLocked ? 'cursor-not-allowed opacity-70' : 'cursor-pointer')}>
                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                                <div className="flex items-center gap-4 flex-grow min-w-0">
                                                    {statusIconElement}
                                                    <div className="truncate"><p className={`font-semibold ${isLocked ? lockedColor : primaryText}`}>Module {course.monthOrder}: {course.title}</p><p className={`text-xs ${isLocked ? lockedColor : secondaryText}`}>{course.description}</p></div>
                                                </div>
                                                <div className="flex items-center justify-end sm:justify-normal gap-3 flex-shrink-0 w-full sm:w-auto pl-9 sm:pl-0">
                                                    {course.status === 'active' && <div className="flex items-center text-xs w-24"><Progress value={course.progress} className={`h-1.5 w-full [&>div]:bg-sky-500`} /><span className={`ml-2 font-medium ${secondaryText}`}>{course.progress}%</span></div>}
                                                    <Button variant={isLocked ? 'secondary' : 'default'} size="sm" disabled={isLocked} className={isLocked ? '' : `${accentButtonBg} ${accentButtonBgHover} text-white`}>{statusText}</Button>
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="announcements" className="space-y-4">
                        {announcements.map((announcement) => (
                            <Card key={announcement.id} className={`${cardBg} ${cardBorder} shadow-sm`}>
                                <CardHeader><div className="flex justify-between items-start gap-2"><CardTitle className={`text-lg font-semibold ${primaryText}`}>{announcement.title}</CardTitle><span className={`text-xs pt-1 ${mutedText}`}>{announcement.date}</span></div></CardHeader>
                                <CardContent><p className={`text-sm ${secondaryText}`}>{announcement.content}</p></CardContent>
                            </Card>
                        ))}
                    </TabsContent>
                </Tabs>
            </div>
            {dummyDashboardPageContent.guidanceSection.videoUrl && (
                <GuidanceVideoModal isOpen={showGuidanceVideoModal} onClose={() => setShowGuidanceVideoModal(false)} videoUrl={dummyDashboardPageContent.guidanceSection.videoUrl} />
            )}
        </div>
    );
}