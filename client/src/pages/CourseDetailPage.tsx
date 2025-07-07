// src/pages/CourseDetailPage.tsx

import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Progress } from "../components/ui/progress";
import { BookOpen, PlayCircle, ArrowLeft, Loader2, AlertCircle, HelpCircle, TrendingUp, ListChecks } from "lucide-react";
import * as apiService from "../services/api";
import type { Course, Week, WeekGradeSummary, GradedItem, MonthlyProgress } from "../services/api";
import { cn } from "../lib/utils";
import { Box, Typography, Divider } from '@mui/material'; // Keeping MUI for icons as in original
import { CheckCircle as MuiCheckCircle, Cancel as MuiCancel, Pending as MuiPending } from '@mui/icons-material';

const DEFAULT_GLOBAL_PASSING_SCORE = 70;

interface CourseWithSettings extends Course {
    defaultCoursePassingScore?: number;
}
interface CourseWithWeeksData extends CourseWithSettings {
  weeks: Week[];
}

export default function CourseDetailPage() {
  const { id: routeCourseId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ALL STATE AND DATA-FETCHING LOGIC IS PRESERVED
  const [courseData, setCourseData] = useState<CourseWithWeeksData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("content");

  const [gradesData, setGradesData] = useState<WeekGradeSummary[]>([]);
  const [monthlyProgress, setMonthlyProgress] = useState<MonthlyProgress | null>(null);
  const [isLoadingGrades, setIsLoadingGrades] = useState(false);
  const [gradesError, setGradesError] = useState<string | null>(null);

  const fetchGrades = useCallback(async () => {
    if (!routeCourseId) return;
    setIsLoadingGrades(true);
    try {
      const response = await apiService.getMyCourseGrades(routeCourseId);
      if (response && typeof response === 'object') {
        if (Array.isArray(response.weeklyGrades)) {
          setGradesData(response.weeklyGrades);
        }
        if (response.monthlyProgress && typeof response.monthlyProgress === 'object') {
          setMonthlyProgress(response.monthlyProgress);
        }
      } else { throw new Error("Invalid response format from server"); }
    } catch (err: any) {
      setGradesError(err.response?.data?.message || err.message || "Failed to load grades.");
    } finally {
      setIsLoadingGrades(false);
    }
  }, [routeCourseId]);

  useEffect(() => {
    const fetchCourseAndWeeks = async () => {
      if (!routeCourseId) return;
      setIsLoading(true);
      try {
        const courseDetails = await apiService.getCourseById(routeCourseId) as CourseWithSettings;
        if (!courseDetails) throw new Error(`Course with ID ${routeCourseId} not found.`);
        const weeksForCourse = await apiService.getWeeksByCourse(routeCourseId);
        const sortedWeeks = weeksForCourse.sort((a, b) => (a.weekNumber || 0) - (b.weekNumber || 0));
        setCourseData({ ...courseDetails, weeks: sortedWeeks });
        fetchGrades();
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load course details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourseAndWeeks();
  }, [routeCourseId, fetchGrades]); 

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "grades") {
        fetchGrades(); 
    }
  };

  // RENDER LOGIC PRESERVED, STYLING UPDATED
  const renderGradedItem = (item: GradedItem) => {
    let statusIcon = <MuiPending color="action" sx={{ fontSize: '1.25rem' }} />;
    let statusText = 'Not Started';
    let scoreDisplay = '-';
    let statusTextColorClass = 'text-slate-500 dark:text-slate-400';
    let statusBgClass = 'bg-slate-100 dark:bg-slate-700/60';

    const effectivePassingScore = courseData?.defaultCoursePassingScore ?? item.passingScore ?? DEFAULT_GLOBAL_PASSING_SCORE;

    if (item.score !== null && item.score !== undefined) { 
      if (item.score >= effectivePassingScore) {
        statusIcon = <MuiCheckCircle color="success" sx={{ fontSize: '1.25rem' }} />;
        statusText = 'Passed';
        statusTextColorClass = 'text-emerald-600 dark:text-emerald-400';
        statusBgClass = 'bg-emerald-50 dark:bg-emerald-900/30';
      } else {
        statusIcon = <MuiCancel color="error" sx={{ fontSize: '1.25rem' }} />;
        statusText = 'Failed';
        statusTextColorClass = 'text-red-600 dark:text-red-400';
        statusBgClass = 'bg-red-50 dark:bg-red-900/30';
      }
      scoreDisplay = `${item.score}%`;
    } // Other statuses can be handled here if needed

    return (
      <div key={item.id} className="p-4 border-b last:border-b-0 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0"><div className={`p-2 rounded-full ${statusBgClass}`}>{statusIcon}</div><p className="font-medium truncate text-slate-800 dark:text-slate-100">{item.title}</p></div>
          <div className="flex items-center gap-4 flex-shrink-0"><div className={`px-3 py-1 rounded-full text-xs font-medium ${statusBgClass} ${statusTextColorClass}`}>{statusText}</div><p className="font-semibold w-12 text-right text-slate-800 dark:text-slate-100">{scoreDisplay}</p></div>
        </div>
      </div>
    );
  };
  
  // RENDER LOGIC PRESERVED, STYLING UPDATED
  const renderMonthlyProgress = () => {
    if (!monthlyProgress) return null;
    return (
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-3"><TrendingUp className="h-6 w-6 text-sky-500"/>Module Progress</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2"><p className="font-medium text-slate-600 dark:text-slate-300">Overall Progress</p><p className="font-bold text-lg text-slate-900 dark:text-white">{monthlyProgress.overallProgress}%</p></div>
            <Progress value={monthlyProgress.overallProgress} className="h-2 [&>div]:bg-sky-500" />
            <p className="text-sm mt-2 text-slate-500 dark:text-slate-400">Completed {monthlyProgress.completedItems} of {monthlyProgress.totalItems} items</p>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2"><ListChecks className="h-5 w-5 text-sky-500"/>Quiz Results</h4>
            {monthlyProgress.quizScores.length > 0 ? monthlyProgress.quizScores.map(quiz => (<div key={quiz.quizId} className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex items-center justify-between"><p className="font-medium text-slate-700 dark:text-slate-200">{quiz.title}</p><p className={`font-semibold ${quiz.passed ? 'text-emerald-600' : 'text-red-500'}`}>{quiz.score}%</p></div>)) : <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No quiz results available yet.</p>}
          </div>
        </CardContent>
      </Card>
    );
  };
  
  if (isLoading) return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-12 w-12 animate-spin text-sky-500" /></div>;
  if (error) return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><AlertCircle className="h-12 w-12 text-red-500 mb-4" /><h2 className="text-xl font-semibold mb-2">Error Loading Course</h2><p className="text-slate-600 mb-6 max-w-md">{error}</p><Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button></div>;
  if (!courseData) return <div className="flex flex-col justify-center items-center min-h-screen text-center p-4"><HelpCircle className="h-12 w-12 text-slate-400 mb-4" /><h2 className="text-xl font-semibold mb-2">Course Not Found</h2><Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button></div>;

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} className="flex items-center text-slate-600 dark:text-slate-400 hover:text-sky-500 p-0 h-auto font-medium"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Button>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white mt-2">Module {courseData.monthOrder}: {courseData.title}</h1>
          {courseData.description && <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-3xl">{courseData.description}</p>}
        </div>

        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 max-w-md rounded-lg p-1 bg-slate-200/80 dark:bg-slate-800">
            <TabsTrigger value="content" className={cn("rounded-md py-2 text-sm font-medium transition-all", activeTab === 'content' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300')}>Course Content</TabsTrigger>
            <TabsTrigger value="grades" className={cn("rounded-md py-2 text-sm font-medium transition-all", activeTab === 'grades' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow' : 'text-slate-600 dark:text-slate-300')}>Grades & Progress</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="mt-6 space-y-4">
            {courseData.weeks.map(week => {
              const weekProgress = gradesData.find(g => g.weekId === week.id)?.overallWeekProgress;
              return (
                <Card key={week.id} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md hover:border-sky-500/50">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div className="flex-grow">
                        <CardTitle className="text-xl font-bold flex items-center gap-3"><PlayCircle className="h-6 w-6 text-sky-500" />Week {week.weekNumber}: {week.title}</CardTitle>
                        <CardDescription className="mt-2 text-base">{week.description}</CardDescription>
                      </div>
                      <Button onClick={() => navigate(`/courses/${routeCourseId}/week/${week.id}`)} className="bg-sky-600 hover:bg-sky-700 text-white w-full sm:w-auto mt-4 sm:mt-0">View Week</Button>
                    </div>
                    {weekProgress !== undefined && !isLoadingGrades && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1"><span className="text-slate-500 dark:text-slate-400">Progress</span><span className="font-medium text-slate-700 dark:text-slate-200">{weekProgress}%</span></div>
                        <Progress value={weekProgress} className="h-2 [&>div]:bg-sky-500" />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </TabsContent>

          <TabsContent value="grades" className="mt-6">
            {isLoadingGrades ? <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-sky-500"/></div> : gradesError ? <p className="text-red-500 text-center">{gradesError}</p> : (
              <div className="space-y-6">
                {renderMonthlyProgress()}
                {gradesData.map(weekGrade => (<Card key={weekGrade.weekId} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm"><CardHeader><CardTitle>Week {weekGrade.weekNumber}: {weekGrade.weekTitle}</CardTitle></CardHeader><CardContent className="p-0">{weekGrade.items.filter(item => item.isGraded).map(renderGradedItem)}</CardContent></Card>))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}