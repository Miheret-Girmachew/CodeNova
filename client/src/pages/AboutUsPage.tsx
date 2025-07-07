import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import {
    Lightbulb, Users, Rocket, Terminal, LucideIcon, ArrowRight
} from 'lucide-react';
import codeNovaLogo from "../assets/logo.png";

// 1. Hard-coded content for the CodeNova About Us page.
const aboutContent = {
  hero: {
    title: "About CodeNova",
    subtitle: "We're on a mission to empower the next generation of developers with the skills they need to succeed in the tech industry.",
    logo: codeNovaLogo,
  },
  ourStory: {
    title: "Our Story",
    story: "CodeNova was founded by a team of passionate developers and educators who saw a gap between traditional computer science education and the real-world skills demanded by employers. We set out to create a learning platform that is practical, project-based, and focused on getting our students job-ready from day one. Our curriculum is constantly updated to keep pace with the ever-evolving tech landscape.",
  },
  ourValues: {
    title: "Our Core Values",
    items: [
      {
        icon: Terminal,
        title: "Hands-On Learning",
        description: "We believe the best way to learn to code is by coding. Our curriculum is built around building real, portfolio-worthy projects.",
      },
      {
        icon: Users,
        title: "Community & Collaboration",
        description: "Learning is a team sport. We foster a supportive community where students help each other grow through Discord and group sessions.",
      },
      {
        icon: Rocket,
        title: "Career-Ready Skills",
        description: "We teach the modern technologies and best practices that companies are actively hiring for right now.",
      },
      {
        icon: Lightbulb,
        title: "Clarity & Simplicity",
        description: "Complex topics are broken down into clear, easy-to-understand lessons, ensuring no student gets left behind.",
      },
    ],
  },
  cta: {
    title: "Ready to See How It Works?",
    description: "Explore our detailed curriculum and see the full 6-month journey that will transform you into a developer.",
    buttonText: "View the Curriculum",
    buttonLink: "/program-overview",
  },
};

const AboutUsPage: React.FC = () => {
  // 2. The entire component is now static. No more useState or useEffect for content.
  const content = aboutContent;

  return (
    // 3. Re-skinned with the CodeNova theme.
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 bg-slate-900 text-white relative">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <img
            src={content.hero.logo}
            alt="CodeNova Logo"
            className="h-20 w-auto mx-auto mb-4"
          />
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{content.hero.title}</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg md:text-xl text-slate-300">{content.hero.subtitle}</p>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="w-full py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{content.ourStory.title}</h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              {content.ourStory.story}
            </p>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="w-full py-16 md:py-24 bg-white dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">{content.ourValues.title}</h2>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
            {content.ourValues.items.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-900/50 mb-4">
                  <item.icon className="h-8 w-8 text-sky-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="mt-1 text-slate-600 dark:text-slate-400">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 bg-slate-100 dark:bg-slate-800/50">
        <div className="container mx-auto flex flex-col items-center gap-4 px-4 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            {content.cta.title}
          </h3>
          <p className="text-lg max-w-xl text-slate-600 dark:text-slate-400">
            {content.cta.description}
          </p>
          <Link to={content.cta.buttonLink}>
            <Button size="lg" className="bg-sky-600 hover:bg-sky-700 text-white font-semibold group mt-2">
              {content.cta.buttonText}
              <ArrowRight className="ml-2 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage;