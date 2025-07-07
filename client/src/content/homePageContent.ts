// src/content/homePageContent.ts

// Define the structure of our content
export interface HomePageContent {
  hero: {
    title: string;
    subtitle: string;
  };
  programHighlights: {
    title: string;
    description: string;
    items: { text: string }[];
  };
  learningOutcomes: {
    title: string;
    description: string;
    items: { text: string }[];
  };
  cta: { // Call to Action
    title: string;
    description: string;
    investmentLabel: string;
    investmentValue: string; // Simplified to one value for now
  };
}

// Fill it with our new CodeNova content
export const codeNovaHomePageContent: HomePageContent = {
  hero: {
    title: "CodeNova: From Zero to Full-Stack Developer",
    subtitle: "Master HTML, CSS, JavaScript, React, and Next.js in our comprehensive 6-month, project-driven program. Your journey to becoming a professional developer starts now.",
  },
  programHighlights: {
    title: "Why Choose CodeNova?",
    description: "Our curriculum is designed to give you the real-world skills that employers are looking for. We focus on hands-on learning and practical application.",
    items: [
      { text: "6-Month Comprehensive Curriculum" },
      { text: "Project-Based Learning" },
      { text: "Live Mentorship & Code Reviews" },
      { text: "Vibrant Discord Community Support" },
    ],
  },
  learningOutcomes: {
    title: "What You Will Build & Learn",
    description: "By the end of this program, you won't just know the theory; you'll have a portfolio of projects to prove your skills.",
    items: [
      { text: "Build responsive and beautiful websites with HTML & CSS." },
      { text: "Create interactive web applications with JavaScript & React." },
      { text: "Develop robust server-side applications with Node.js & Express." },
      { text: "Master full-stack development with Next.js." },
      { text: "Deploy and manage your applications like a pro." },
    ],
  },
  cta: {
    title: "Ready to Start Your Coding Career?",
    description: "Enroll in CodeNova today and gain access to our full curriculum, expert mentors, and a community of passionate learners.",
    investmentLabel: "Full Program Investment:",
    investmentValue: "50", // We will keep it simple with one USD price for now
  },
};