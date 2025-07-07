// src/pages/HomePage.tsx

import React from 'react';
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { ChevronRight, Code, TerminalSquare, GitBranch, Rocket, LayoutDashboard, DollarSign } from "lucide-react";
import logoPlaceholder from "../assets/logo.png";
import { useAuth } from '../context/AuthContext';
import { codeNovaHomePageContent } from '../content/homePageContent'; // <-- Import our new hard-coded content

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const content = codeNovaHomePageContent; // Use the imported content directly

  // New Tech-Themed Colors (replaces browns and golds)
  const primaryText = 'text-slate-100';
  const secondaryText = 'text-slate-400';
  const accentColor = 'text-sky-400';
  const accentBg = 'bg-sky-500';
  const accentBgHover = 'hover:bg-sky-600';
  const accentBorder = 'border-sky-500';
  const lightBg = 'bg-white'; // For light mode
  const darkBg = 'dark:bg-slate-900';

  // New Tech-Themed Icons
  const highlightIconsMap: { [key: string]: React.ElementType } = {
    curriculum: Code,
    projects: TerminalSquare,
    mentorship: GitBranch,
    community: Rocket,
    default: Code,
  };

  const getHighlightIcon = (text: string) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("curriculum")) return highlightIconsMap.curriculum;
    if (lowerText.includes("project")) return highlightIconsMap.projects;
    if (lowerText.includes("mentor")) return highlightIconsMap.mentorship;
    if (lowerText.includes("community")) return highlightIconsMap.community;
    return highlightIconsMap.default;
  };

  const heroLogoUrl = logoPlaceholder; // Use the new logo

  return (
    <div className={`flex flex-col min-h-screen ${lightBg} ${darkBg}`}>
      {/* Hero Section */}
      <section className="w-full py-20 md:py-28 lg:py-36 bg-slate-900 dark:bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-repeat opacity-10"></div>
        <div className="container relative px-4 md:px-6 z-10 mx-auto">
          <div className="flex flex-col items-center space-y-6 text-center">
            <img
              src={heroLogoUrl}
              alt="CodeNova Logo"
              className="h-20 w-20 md:h-24 md:w-24 mx-auto mb-4"
              onError={(e) => { (e.target as HTMLImageElement).src = 'path/to/fallback/logo.svg'; }}
            />
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold tracking-tight text-white drop-shadow-md animate-[fadeInDown_1s_ease-out]">
                {content.hero.title}
              </h1>
              <p className={`mx-auto max-w-[750px] ${secondaryText} text-lg md:text-xl lg:text-2xl animate-[fadeInUp_1.2s_ease-out]`}>
                {content.hero.subtitle}
              </p>
            </div>
            <div className="flex flex-col items-center sm:flex-row sm:justify-center gap-4 pt-4 animate-[fadeInUp_1.5s_ease-out]">
              <Link to="/courses"> {/* <-- Updated link */}
                <Button
                  size="lg"
                  className={`${accentBg} ${accentBgHover} text-white transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg font-semibold group text-base md:text-lg`}
                >
                  View Curriculum
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
              </Link>
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button
                    size="lg"
                    variant="outline"
                    className={`text-slate-100 ${accentBorder} hover:bg-sky-500/20 dark:text-sky-400 dark:border-sky-400 dark:hover:bg-sky-500/10 dark:hover:text-sky-300 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md font-medium group text-base md:text-lg`}
                  >
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button
                    size="lg"
                    variant="outline"
                    className={`border-sky-400 text-sky-400 hover:bg-sky-500/10 hover:text-sky-300 transition-all duration-300 ease-in-out transform hover:scale-105 shadow-md font-medium text-base md:text-lg`}
                  >
                    Enroll Now
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Program Highlights & Learning Outcomes Section */}
      <section className={`w-full py-16 md:py-24 lg:py-32 ${lightBg} ${darkBg}`}>
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 xl:gap-20">
            {/* Program Highlights */}
            <div className="space-y-5 animate-[fadeInRight_1s_ease-out] text-center lg:text-left">
              <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className={`h-1 w-12 ${accentBg}`}></div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  {content.programHighlights.title}
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl">
                {content.programHighlights.description}
              </p>
              <ul className="space-y-3 pt-2">
                {content.programHighlights.items.map((item, index) => {
                  const IconComponent = getHighlightIcon(item.text);
                  return (
                    <li key={`ph-${index}`} className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg shadow-sm justify-center lg:justify-start">
                      <IconComponent className={`h-6 w-6 ${accentColor} flex-shrink-0`} />
                      <span className="text-slate-700 dark:text-slate-300 text-base md:text-lg">{item.text}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
            {/* Learning Outcomes */}
            <div className="space-y-5 animate-[fadeInLeft_1s_ease-out] text-center lg:text-left">
               <div className="flex items-center gap-3 mb-4 justify-center lg:justify-start">
                <div className={`h-1 w-12 ${accentBg}`}></div>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
                  {content.learningOutcomes.title}
                </h2>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg md:text-xl">
                {content.learningOutcomes.description}
              </p>
              <ul className="space-y-3 pt-2">
                {content.learningOutcomes.items.map((item, index) => (
                   <li key={`lo-${index}`} className="flex items-start gap-3 p-3 bg-slate-100 dark:bg-slate-800/60 rounded-lg shadow-sm text-left">
                    <div className={`mt-1 flex-shrink-0 rounded-full ${accentBg} text-white h-6 w-6 flex items-center justify-center text-sm font-semibold`}>
                      {index + 1}
                    </div>
                    <span className="text-slate-700 dark:text-slate-300 text-base md:text-lg">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="w-full py-16 md:py-24 lg:py-28 bg-slate-900/95 dark:bg-black/50 backdrop-blur-sm text-white">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-6 text-center animate-[fadeInUp_1s_ease-out]">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              {content.cta.title}
            </h2>
            <p className={`mx-auto max-w-[700px] ${secondaryText} text-lg md:text-xl lg:text-2xl`}>
              {content.cta.description}
            </p>

            {/* Simplified Payment Info for All Users */}
            {!isAuthenticated && (
              <div className="mt-4 p-4 bg-sky-500/10 dark:bg-sky-500/5 border border-sky-500/30 rounded-lg shadow-inner max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2">
                  <DollarSign className={`h-6 w-6 ${accentColor} flex-shrink-0`} />
                  <p className={`text-base md:text-lg font-semibold ${accentColor}`}>
                    {content.cta.investmentLabel}{' '}
                    <span className="text-white">
                      ${content.cta.investmentValue}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <div className="pt-4">
              {isAuthenticated ? (
                 <Link to="/dashboard">
                   <Button size="lg" className={`${accentBg} ${accentBgHover} text-white font-semibold text-lg`}>
                     <LayoutDashboard className="mr-2 h-5 w-5" />
                     Continue Learning
                   </Button>
                 </Link>
              ) : (
                <Link to="/register">
                  <Button size="lg" className={`${accentBg} ${accentBgHover} text-white font-semibold text-lg`}>
                    Start Your Application
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;