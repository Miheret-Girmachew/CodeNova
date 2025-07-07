import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import {
  Code, Calendar, Clock, Terminal, Rocket, CheckCircle2, GraduationCap,
  LucideIcon, DollarSign, LayoutDashboard,
} from "lucide-react";
import { useAuth } from '../context/AuthContext';
import { ProgramOverviewPageContentData } from '../types/programOverviewContentTypes';

const ETHIOPIA_COUNTRY_CODE = 'ET';

const codeNovaProgramOverviewContent: ProgramOverviewPageContentData = {
  hero: {
    title: "The Full-Stack Developer Path",
    subtitle: "From the fundamentals of HTML to advanced full-stack applications with Next.js, this is your complete journey to becoming a job-ready developer.",
  },
  programStructure: {
    title: "Program Structure",
    description: "A high-level overview of the program's timeline and what to expect.",
    items: [
      { id: "1", title: "Total Duration", desc: "6 Months, self-paced within each module." },
      { id: "2", title: "Weekly Commitment", desc: "10-15 hours of study and practice." },
      { id: "3", title: "Core Curriculum", desc: "6 courses covering the MERN stack and Next.js." },
      { id: "4", title: "Hands-On Projects", desc: "6 portfolio-worthy projects, one for each course." },
    ],
  },
  learningApproach: {
    title: "Our Learning Approach",
    description: "We believe in learning by doing. Our curriculum is heavily focused on practical, hands-on coding to build real-world skills.",
    points: [
      { id: "1", text: "Project-based modules to build a strong portfolio." },
      { id: "2", text: "Clear video tutorials and written guides." },
      { id: "3", text: "Live mentorship sessions and code reviews." },
      { id: "4", text: "Active community support on Discord." },
    ],
    weeklyComponentsTitle: "What a Typical Week Looks Like",
    weeklyComponents: [
      { id: "wc1", text: "Video Lectures & Readings" },
      { id: "wc2", text: "Coding Exercises" },
      { id: "wc3", text: "Project Milestones" },
      { id: "wc4", text: "Community Q&A" },
    ],
  },
  courseCurriculum: {
    title: "The 6-Month Curriculum",
    description: "Each month, you'll master a new technology and build a significant project to showcase your skills.",
    courses: [
      { id: "html", title: "Month 1: HTML & CSS Foundations", ects: 4, description: "Learn the building blocks of the web. Master semantic HTML and modern CSS layouts.", weeks: [{id:"w1", text:"Semantic HTML5"}, {id:"w2", text:"Advanced CSS"}, {id:"w3", text:"Flexbox & Grid"}], assessments: [{id:"a1", text:"Build a professional portfolio website."}] },
      { id: "js", title: "Month 2: JavaScript Fundamentals", ects: 4, description: "Dive deep into the language of the web. Understand the DOM, handle events, and work with APIs.", weeks: [{id:"w1", text:"Variables & Logic"}, {id:"w2", text:"DOM Manipulation"}, {id:"w3", text:"Asynchronous JS"}], assessments: [{id:"a1", text:"Create an interactive quiz application."}] },
      { id: "react", title: "Month 3: Building with React", ects: 4, description: "Master the most popular frontend library. Learn about components, state, hooks, and routing.", weeks: [{id:"w1", text:"Components & JSX"}, {id:"w2", text:"State & Hooks"}, {id:"w3", text:"React Router"}], assessments: [{id:"a1", text:"Develop an e-commerce site frontend."}] },
      { id: "nodejs", title: "Month 4: Backend with Node.js & Express", ects: 4, description: "Build powerful server-side applications. Create REST APIs and connect to a database.", weeks: [{id:"w1", text:"Intro to Node.js"}, {id:"w2", text:"Express REST APIs"}, {id:"w3", text:"MongoDB & Mongoose"}], assessments: [{id:"a1", text:"Build the e-commerce site backend."}] },
      { id: "nextjs1", title: "Month 5: Advanced React", ects: 4, description: "Level up your React skills with advanced patterns and robust state management.", weeks: [{id:"w1", text:"Redux Toolkit"}, {id:"w2", text:"Performance Optimization"}, {id:"w3", text:"Testing with Jest & RTL"}], assessments: [{id:"a1", text:"Integrate Redux into the e-commerce app."}] },
      { id: "nextjs2", title: "Month 6: Full-Stack with Next.js", ects: 4, description: "Bring it all together with the leading full-stack framework and deploy your application.", weeks: [{id:"w1", text:"Next.js App Router"}, {id:"w2", text:"Server Components"}, {id:"w3", text:"Deployment"}], assessments: [{id:"a1", text:"Build and deploy a full-stack blog."}] },
    ],
  },
  certification: {
    title: "Certificate of Completion",
    description: "Upon successful completion of all courses and projects, you will receive a personalized certificate to showcase your new skills.",
    mockup: {
      titlePrefix: "This Certificate is Awarded To",
      mainTitle: "Your Name Here",
      awardedBy: "For successfully completing the CodeNova Full-Stack Developer Program.",
      credits: "Issued by CodeNova",
    },
    whatYoullReceiveTitle: "Showcase Your Achievement",
    details: [
      { id: "d1", text: "A personalized, shareable certificate to add to your profiles." },
      { id: "d2", text: "Official validation of your skills in modern web technologies." },
      { id: "d3", text: "A credential to enhance your resume and LinkedIn profile." },
    ],
    quote: "\"The best way to predict the future is to build it.\"",
  },
  cta: {
    title: "Ready to Become a Developer?",
    description: "Enroll today and get lifetime access to all course materials, projects, and our exclusive developer community.",
    investmentLabel: "Full Program Investment:",
    investmentValueUSD: "100",
    investmentValueETB: "5000",
    investmentNote: "One-time payment for lifetime access. No recurring fees.",
  },
};

const ProgramOverviewPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [userCountryCode, setUserCountryCode] = useState<string | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [displayInvestmentValue, setDisplayInvestmentValue] = useState<string | null>(null);
  const content = codeNovaProgramOverviewContent;

  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoadingLocation(true);
      const fetchLocationAsync = async () => {
        try {
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            if (data.country_code) setUserCountryCode(data.country_code);
          }
        } catch (e) { console.error("Location fetch failed:", e); }
        finally { setIsLoadingLocation(false); }
      };
      fetchLocationAsync();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated || !content.cta) {
      setDisplayInvestmentValue(null);
      return;
    }
    const { investmentValueUSD, investmentValueETB } = content.cta;
    if (isLoadingLocation && userCountryCode === null) {
      setDisplayInvestmentValue(investmentValueUSD || null);
      return;
    }
    if (userCountryCode === ETHIOPIA_COUNTRY_CODE && investmentValueETB) {
      setDisplayInvestmentValue(investmentValueETB);
    } else {
      setDisplayInvestmentValue(investmentValueUSD || null);
    }
  }, [content, userCountryCode, isLoadingLocation, isAuthenticated]);

  const getProgramStructureIcon = (title: string): LucideIcon => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes("duration")) return Calendar;
    if (lowerTitle.includes("commitment")) return Clock;
    if (lowerTitle.includes("projects")) return Terminal;
    if (lowerTitle.includes("curriculum")) return Code;
    return Code;
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <section className="w-full py-20 md:py-32 bg-slate-900 text-slate-50 relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{content.hero.title}</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-slate-300">{content.hero.subtitle}</p>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid gap-16 lg:grid-cols-2">
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">{content.programStructure.title}</h2>
              <p className="text-muted-foreground">{content.programStructure.description}</p>
              <div className="space-y-4">
                {content.programStructure.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 bg-primary/10 p-3 rounded-lg">
                      {React.createElement(getProgramStructureIcon(item.title), { className: "h-6 w-6 text-primary" })}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-foreground">{content.learningApproach.title}</h2>
              <p className="text-muted-foreground">{content.learningApproach.description}</p>
              <ul className="space-y-3">
                {content.learningApproach.points.map(item => (
                  <li key={item.id} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5" />
                    <span className="text-foreground/90">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{content.courseCurriculum.title}</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">{content.courseCurriculum.description}</p>
          </div>
          <div className="space-y-8">
            {content.courseCurriculum.courses.map(course => (
              <div key={course.id} className="border border-border rounded-lg overflow-hidden shadow-sm bg-card">
                <div className="p-6 bg-secondary flex justify-between items-center">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">{course.title}</h3>
                  <div className="text-sm font-semibold bg-primary/10 text-primary px-3 py-1 rounded-full">{course.weeks.length} Weeks</div>
                </div>
                <div className="p-6 grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Key Topics</h4>
                    <ul className="space-y-2 text-sm">
                      {course.weeks.map(week => (
                        <li key={week.id} className="flex gap-2 text-muted-foreground">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> {week.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-3">Core Project</h4>
                    <ul className="space-y-2 text-sm">
                      {course.assessments.map(assessment => (
                        <li key={assessment.id} className="flex gap-2 text-muted-foreground">
                          <Terminal className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> {assessment.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">{content.certification.title}</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground">{content.certification.description}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="bg-card p-8 border border-border rounded-lg shadow-lg text-center transform hover:scale-105 hover:shadow-2xl transition-all duration-300">
              <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">{content.certification.mockup.titlePrefix}</p>
              <h3 className="text-2xl font-bold my-2 text-foreground">{content.certification.mockup.mainTitle}</h3>
              <p className="text-sm text-muted-foreground/80">{content.certification.mockup.awardedBy}</p>
              <div className="mt-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{content.certification.mockup.credits}</div>
            </div>
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-foreground">{content.certification.whatYoullReceiveTitle}</h3>
              <ul className="space-y-3">
                {content.certification.details.map(item => (
                  <li key={item.id} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-accent mt-0.5 flex-shrink-0" />
                    <span className="text-foreground/90">{item.text}</span>
                  </li>
                ))}
              </ul>
              <p className="italic text-muted-foreground pt-2">{content.certification.quote}</p>
            </div>
          </div>
        </div>
      </section>
      
      <section className="w-full py-16 md:py-24 bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50">{content.cta.title}</h2>
          <p className="mt-3 max-w-xl mx-auto text-slate-300">{content.cta.description}</p>
          {!isAuthenticated && displayInvestmentValue && (
            <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg max-w-sm mx-auto">
              <div className="flex items-center justify-center gap-2">
                <p className="font-semibold text-primary">
                  {content.cta.investmentLabel}{' '}
                  <span className="text-slate-50">{userCountryCode === 'ET' ? 'ETB' : '$'}{displayInvestmentValue}</span>
                </p>
              </div>
              {content.cta.investmentNote && <p className="text-xs text-slate-400 mt-2">{content.cta.investmentNote}</p>}
            </div>
          )}
          <div className="mt-8 flex justify-center gap-4">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <LayoutDashboard className="mr-2 h-5 w-5"/>Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link to="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  <Rocket className="mr-2 h-5 w-5"/>Start Learning Now
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProgramOverviewPage;