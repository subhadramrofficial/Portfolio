// ─────────────────────────────────────────────────────────────────────────────
//  EDIT THIS FILE to update your portfolio. No component code needs to change.
//
//  • Anything set to null is simply hidden (never shown as a broken link).
//  • Put your photo/resume in client/public/ and reference them with a leading
//    slash, e.g.  photo: "/profile.jpg"   resume: "/Subhadra_MR_Resume.pdf"
// ─────────────────────────────────────────────────────────────────────────────
import { normalizeProfile } from "../lib/links.js";

const rawProfile = {
  name: "Subhadra M.R.",
  title: "MERN Stack Developer",
  intro:
    "I build practical web applications using React, Node.js, Express and MongoDB. I also work with AI tools to support development and explore AI-powered project ideas, combining problem-solving with continuous learning.",

  photo: "/profile.png",
  resume: "/Subhadra_MR_Resume.pdf",
  resumeFileName: "Subhadra_MR_Resume.pdf",

  email: "subhadramr.official@gmail.com",
  github: "https://github.com/subhadramrofficial",
  linkedin: "https://www.linkedin.com/in/subhadra-mr/",
};

const { profile, problems } = normalizeProfile(rawProfile);
export { profile, problems as profileProblems };

export const about = {
  paragraphs: [
    "I'm a BCA graduate currently developing my skills in full-stack web development through MERN stack training and hands-on projects. I enjoy turning ideas into working applications, solving problems and understanding how different parts of a system work together.",
    "Alongside web development, I have experience using AI tools to assist with development and explore AI-powered project ideas. I'm interested in building practical applications that combine web technologies with AI, and I'm eager to keep learning and contribute to real-world software projects.",
  ],
  interests: [
    "Full-stack web development",
    "AI-assisted development and AI-powered projects",
    "Building practical applications",
    "Problem solving",
    "Learning new technologies",
  ],
};

export const skillGroups = [
  {
    title: "Frontend",
    skills: [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "React Router",
      "Bootstrap",
      "Tailwind CSS",
    ],
  },
  {
    title: "Backend",
    skills: ["Node.js", "Express.js", "Python", "Flask", "PHP"],
  },
  {
    title: "Database",
    skills: ["MongoDB", "MySQL", "SQL"],
  },
  {
    title: "Tools & Mobile",
    skills: [
      "Git",
      "GitHub",
      "Postman",
      "XAMPP",
      "React Native",
      "AI-assisted development tools",
    ],
  },
];

// github / demo: set to a full https URL when available, otherwise leave null.
// highlights: optional bullet list shown under "View details".
export const projects = [
  {
    id: "mombridge",
    name: "MomBridge",
    label: "Major academic project (BCA)",
    image: "/projects/mombridge.png",
    description:
      "A support platform designed to connect single mothers with charity, employment, sponsorship and social support services.",
    highlights: [
      "Multiple user roles: mothers, charity providers, job providers, social workers and administrators",
      "Built with React, Python Flask and MongoDB",
    ],
    tech: ["React", "Python", "Flask", "MongoDB"],
    github: "https://github.com/subhadramrofficial/MomBridge",
    demo: null,
  },
  {
    id: "skillswap",
    name: "SkillSwap",
    label: "MERN stack project",
    image: "/projects/skillswap.png",
    description:
      "A skill-exchange platform concept where users can connect and exchange skills through profiles, authentication and skill-based interactions.",
    highlights: [
      "JWT-based user authentication",
      "User profiles with skills offered and wanted",
      "Skill-based partner matching",
      "Exchange requests and status tracking",
      "Real-time chat between accepted partners",
      "Notifications for matches, requests and messages",
      "Exchange history and user ratings",
      "Admin dashboard for platform management",
      "Send a Coffee feature",
    ],
    tech: ["MongoDB", "Express.js", "React", "Node.js"],
    github: "https://github.com/subhadramrofficial/SkillSwap",
    demo: "https://skill-swap-sigma-seven.vercel.app",
  },
  {
    id: "blogging-website",
    name: "Blogging Website",
    label: "Full-stack project",
    image: "/projects/blogging-website.png",
    description:
      "A full-stack blogging application featuring authentication, post management, image uploads and user interactions.",
    highlights: [
      "User registration and login with JWT authentication",
      "Create posts, upload post images and view posts",
      "Like posts and add comments",
      "Edit and delete your own posts",
      "User profile functionality",
    ],
    tech: ["React", "Tailwind CSS", "Node.js", "Express.js", "MongoDB"],
    github: "https://github.com/subhadramrofficial/Blogging-Website",
    demo: "https://blogging-website-mocha-five.vercel.app",
  },
  {
    id: "learnhub",
    name: "LearnHub",
    label: "Frontend learning project",
    image: "/projects/learnhub.png",
    description:
      "A frontend learning project created to practise web interface development and strengthen foundational frontend skills.",
    highlights: null,
    tech: ["React", "Web UI"],
    github: "https://github.com/subhadramrofficial/LearnHub",
    demo: "https://learnhub-sooty-five.vercel.app/",
  },
];

export const education = {
  degree: "Bachelor of Computer Applications (BCA)",
  institution: "Mahatma Gandhi University",
  year: "2023",
  cgpa: "7.50",
};

// Technical training - not employment.
export const training = {
  title: "MERN Stack Training",
  organization: "Zoople Technologies, Kochi",
  period: "2026 – Present",
  topics: [
    "MERN stack development",
    "JavaScript",
    "React",
    "Node.js",
    "Express",
    "MongoDB",
    "REST APIs",
    "Git/GitHub",
    "Postman",
  ],
};
