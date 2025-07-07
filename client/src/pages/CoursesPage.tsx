// src/pages/CoursesPage.tsx

import React, { useState, useEffect, MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Lock, PlayCircle, CheckCircle2, ChevronRight, Loader2, AlertCircle, LayoutDashboard, Lightbulb, FolderSearch } from "lucide-react";
import codeNovaLogo from  "../assets/logo.png";
import { useAuth } from "../context/AuthContext";
import * as apiService from "../services/api";
import GuidanceVideoModal from "../components/modals/GuidanceVideoModal";

interface ProcessedCourseData {
    id: string;
    title: string;
    description?: string;
    monthOrder: number;
    status: 'locked' | 'active' | 'completed';
    progress?: number;
}

const dummyCourseAccessState = {
    enrollmentMessage: null,
    courses: [
        { id: "html", title: "Month 1: HTML & CSS Foundations", description: "Learn the structural and stylistic building blocks of the web. Master semantic HTML5 and modern CSS layouts like Flexbox and Grid.", monthOrder: 1, status: 'completed', progress: 100 },
        { id: "javascript", title: "Month 2: JavaScript Fundamentals", description: "Dive deep into the language of the web. Understand the DOM, handle events, work with APIs, and master asynchronous programming.", monthOrder: 2, status: 'active', progress: 45 },
        { id: "react", title: "Month 3: Building with React", description: "Master the most popular frontend library. Learn about components, state management with hooks, client-side routing, and more.", monthOrder: 3, status: 'locked', progress: 0 },
        { id: "nodejs", title: "Month 4: Backend with Node.js & Express", description: "Build powerful server-side applications. Create REST APIs, connect to databases, and handle authentication like a pro.", monthOrder: 4, status: 'locked', progress: 0 },
        { id: "advanced-react", title: "Month 5: Advanced React & State Management", description: "Level up your React skills with advanced patterns, performance optimization, and robust state management using Redux Toolkit.", monthOrder: 5, status: 'locked', progress: 0 },
        { id: "nextjs", title: "Month 6: Full-Stack with Next.js", description: "Bring it all together with the leading full-stack framework. Learn server components, advanced routing, and deployment.", monthOrder: 6, status: 'locked', progress: 0 },
    ]
};

const accentColor = "text-sky-500 dark:text-sky-400";
const primaryText = "text-slate-900 dark:text-slate-50";
const secondaryText = "text-slate-600 dark:text-slate-400";
const cardBg = "bg-white dark:bg-slate-900";
const cardBorder = "border border-slate-200 dark:border-slate-800";
const sectionBg = "bg-slate-50 dark:bg-slate-950";
const lockedColor = `text-slate-500 dark:text-slate-400`;
const lockedBg = `bg-slate-100 dark:bg-slate-800`;
const activeColor = `text-sky-600 dark:text-sky-400`;
const activeBg = `bg-sky-100 dark:bg-sky-500/20`;
const completedColor = `text-emerald-600 dark:text-emerald-400`;
const completedBg = `bg-emerald-100 dark:bg-emerald-500/20`;
const accentButtonBg = 'bg-sky-500';
const accentButtonBgHover = 'hover:bg-sky-600';

export default function CoursesPage() {
    const { currentUser: user, loading: authLoading } = useAuth();
    const [courses, setCourses] = useState<ProcessedCourseData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [enrollmentMessage, setEnrollmentMessage] = useState<string | null>(null);
    const [showGuidanceVideoModal, setShowGuidanceVideoModal] = useState(false);
    const guidanceVideoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

    useEffect(() => {
        if (authLoading) return;

        const loadDummyData = () => {
            setIsLoading(true);
            try {
                const accessState = dummyCourseAccessState;
                const finalCourses = accessState.courses
                    .sort((a, b) => a.monthOrder - b.monthOrder)
                    .map(course => ({
                        ...course,
                        status: course.status as 'locked' | 'active' | 'completed'
                    }));
                setCourses(finalCourses);
                setEnrollmentMessage(accessState.enrollmentMessage);
            } catch (err: any) {
                setError("Failed to load dummy course information.");
            } finally {
                setTimeout(() => setIsLoading(false), 500);
            }
        };

        loadDummyData();
    }, [user, authLoading]);

    if (isLoading || authLoading) {
        return <div className="flex justify-center items-center min-h-[60vh]"><Loader2 className="h-12 w-12 animate-spin text-sky-500" /></div>;
    }

    if (error) {
        return <div className="container mx-auto p-8 text-center text-red-500"><AlertCircle className="inline-block mr-2 h-6 w-6"/> Error: {error}</div>;
    }

    return (
        <div className={`flex flex-col min-h-screen ${sectionBg}`}>
            <section className="w-full py-20 md:py-28 lg:py-36 bg-slate-900 dark:bg-slate-950 relative">
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10"></div>
                <img src={codeNovaLogo} alt="CodeNova Logo" className="h-20 w-auto mx-auto mb-4" />
                <div className="container relative px-4 md:px-6 z-10 mx-auto">
                    <div className="flex flex-col items-center space-y-4 text-center">
                        <h1 className="text-4xl text-white font-bold tracking-tight sm:text-5xl md:text-6xl">
                            Our Full-Stack Curriculum
                        </h1>
                        <p className="mx-auto max-w-[750px] text-slate-300 md:text-xl">
                            Your 6-month journey from foundational HTML to advanced Next.js development.
                        </p>
                    </div>
                </div>
            </section>
            
            {user && !enrollmentMessage && (
                <section className="w-full py-12 bg-slate-800 text-white">
                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
                            <div className="space-y-2">
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Developer Dashboard</h2>
                                <p className="text-slate-300 max-w-2xl md:text-lg">Track your progress, access course materials, and connect with the community.</p>
                            </div>
                            <Link to="/dashboard">
                                <Button size="lg" className={`${accentButtonBg} ${accentButtonBgHover} text-white font-semibold group shrink-0`}>
                                    Go to Dashboard
                                    <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {user && (
                 <section className="w-full py-10 bg-sky-500/10 dark:bg-sky-500/5 border-y border-sky-500/20">
                    <div className="container mx-auto px-4 flex flex-col items-center text-center">
                        <Lightbulb className={`h-8 w-8 ${accentColor} mb-3`} />
                        <h3 className={`text-xl sm:text-2xl font-semibold mb-2 ${primaryText}`}>New to the Platform?</h3>
                        <p className={`${secondaryText} mb-4 max-w-xl`}>
                            Watch our quick tour to see how you can get the most out of your CodeNova learning experience.
                        </p>
                        <Button
                            size="lg"
                            onClick={() => setShowGuidanceVideoModal(true)}
                            className={`${accentButtonBg} ${accentButtonBgHover} text-white font-semibold transition-all transform hover:scale-105 shadow-md group`}
                        >
                            Watch Platform Tour
                        </Button>
                    </div>
                </section>
            )}

            {enrollmentMessage && (
                <section className="w-full py-4 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">
                    <div className="container mx-auto px-4 text-center">
                        <AlertCircle className="inline-block h-5 w-5 mr-2 align-middle" />
                        <p className="inline align-middle md:text-lg">{enrollmentMessage}</p>
                    </div>
                </section>
            )}
            
            <section className={`w-full py-16 md:py-24 ${sectionBg}`}>
                <div className="container mx-auto px-4 md:px-6">
                    {courses.length === 0 && !isLoading && !error && !enrollmentMessage && (
                        <div className="text-center py-10">
                            <FolderSearch className={`mx-auto h-16 w-16 ${secondaryText} opacity-50 mb-4`} />
                            <h3 className={`text-2xl font-semibold mb-2 ${primaryText}`}>The Curriculum is Being Prepared</h3>
                            <p className={`${secondaryText}`}>Check back soon for our full list of courses.</p>
                        </div>
                    )}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {courses.map((course) => {
                            const isEffectivelyDisabled = course.status === 'locked' && !!user;
                            const linkHref = user && !isEffectivelyDisabled ? `/courses/${course.id}` : '/register';
                            
                            return (
                                <Link
                                    key={course.id}
                                    to={linkHref}
                                    className={`block ${cardBg} ${cardBorder} rounded-lg overflow-hidden shadow-md
                                       transition-all duration-300 group relative
                                       ${isEffectivelyDisabled ? 'opacity-60 cursor-not-allowed' :
                                         'hover:shadow-xl hover:-translate-y-1 hover:border-sky-500/50'
                                       }
                                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-950`}
                                    aria-disabled={isEffectivelyDisabled}
                                    onClick={(e: MouseEvent) => { if (isEffectivelyDisabled) e.preventDefault(); }}
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <span className={`text-5xl font-bold ${lockedColor}`}>{String(course.monthOrder).padStart(2, '0')}</span>
                                            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full shrink-0 ${
                                                course.status === 'completed' ? `${completedBg} ${completedColor}` :
                                                course.status === 'active' ? `${activeBg} ${activeColor}` :
                                                `${lockedBg} ${lockedColor}`
                                            }`}>
                                                {course.status === 'completed' ? <CheckCircle2 className="h-4 w-4" /> :
                                                 course.status === 'active' ? <PlayCircle className="h-4 w-4" /> :
                                                 <Lock className="h-4 w-4" />}
                                                <span>{course.status.charAt(0).toUpperCase() + course.status.slice(1)}</span>
                                            </div>
                                        </div>

                                        <h2 className={`mt-4 text-2xl font-bold ${primaryText}`}>{course.title}</h2>
                                        <p className={`${secondaryText} mt-2 text-base line-clamp-2 min-h-[2.5rem]`}>{course.description || "Description coming soon."}</p>
                                    </div>
                                    <div className="px-6 py-4 bg-slate-100/50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800">
                                        <span className={`inline-flex items-center text-sm font-semibold ${isEffectivelyDisabled ? lockedColor : accentColor}`}>
                                            {course.status === 'locked' ? (user ? 'Content Locked' : 'Learn More & Enroll') : 'Start Learning'}
                                            {(course.status !== 'locked' || !user) && <ChevronRight className="ml-1 h-4 w-4" />}
                                        </span>
                                    </div>
                                    {isEffectivelyDisabled && (
                                        <div className="absolute inset-0 bg-slate-400/10 dark:bg-slate-900/30 backdrop-blur-sm" />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </section>
            <GuidanceVideoModal 
                isOpen={showGuidanceVideoModal} 
                onClose={() => setShowGuidanceVideoModal(false)} 
                videoUrl={guidanceVideoUrl} 
            />
        </div>
    );
}