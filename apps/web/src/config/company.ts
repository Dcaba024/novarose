import type { FAQ, NavItem, PricingPlan, ProcessStep, Service, UseCase } from "@/types/marketing";

export const companyConfig = {
  name: "NovaRose AI",
  domain: "novaroseai.com",
  email: "contact@caballerotechnologies.com",
  tagline:
    "AI systems that help businesses capture more leads, respond instantly, and automate repetitive work."
} as const;

export const navItems: NavItem[] = [
  { label: "Problem", href: "#problem" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" }
];

export const services: Service[] = [
  {
    title: "AI Lead Intake Systems",
    description: "Capture visitor intent, ask qualifying questions, and turn conversations into structured lead records.",
    outcome: "Fewer missed opportunities"
  },
  {
    title: "AI Website Sales Agents",
    description: "Give your website a 24/7 sales assistant that answers questions and routes serious buyers.",
    outcome: "Instant buyer response"
  },
  {
    title: "AI Customer Support Agents",
    description: "Automate high-volume questions while preserving escalation paths for sensitive or complex issues.",
    outcome: "Cleaner customer experience"
  },
  {
    title: "CRM + Email Automations",
    description: "Move qualified leads, follow-ups, and summaries into the systems your team already uses.",
    outcome: "Less manual admin"
  },
  {
    title: "Appointment Booking Automations",
    description: "Help prospects choose the right next step and guide them toward booked calls or service appointments.",
    outcome: "More booked conversations"
  },
  {
    title: "Custom AI Workflow Automation",
    description: "Design targeted automations around repetitive operational work, handoffs, and internal coordination.",
    outcome: "Higher leverage teams"
  }
];

export const problemPoints = [
  "Leads arrive after hours and go cold before anyone responds.",
  "Teams repeat the same answers, follow-ups, and data entry every day.",
  "Website traffic does not turn into enough booked calls or qualified opportunities.",
  "Customer experience depends too heavily on manual handoffs."
] as const;

export const solutionPoints = [
  "AI agents respond instantly and collect the information your team needs.",
  "Automations route leads, summaries, and follow-ups into the right workflow.",
  "Every system is configured around business outcomes instead of AI novelty.",
  "The same agent foundation can be adapted for new industries and demos."
] as const;

export const processSteps: ProcessStep[] = [
  {
    title: "Map the revenue leak",
    description: "We identify the missed lead moments, repetitive tasks, and handoffs costing the business time or money."
  },
  {
    title: "Design the agent workflow",
    description: "We define the agent behavior, qualification logic, booking path, and automation triggers before building."
  },
  {
    title: "Launch the first system",
    description: "We ship a focused production workflow that captures leads, responds instantly, and creates useful records."
  },
  {
    title: "Measure and improve",
    description: "We review conversations, outcomes, and friction points so the system gets sharper after launch."
  }
];

export const useCases: UseCase[] = [
  {
    industry: "Law firms",
    description: "Qualify new matters, collect context, and route consultation requests."
  },
  {
    industry: "Home services",
    description: "Capture urgent service requests, estimate intent, and trigger follow-up."
  },
  {
    industry: "Medical and dental",
    description: "Answer common questions, collect appointment intent, and escalate safely."
  },
  {
    industry: "Real estate",
    description: "Qualify buyers, sellers, and investors with clean CRM-ready summaries."
  },
  {
    industry: "B2B services",
    description: "Turn website visitors into booked calls with instant qualification."
  }
];

export const pricingPlans: PricingPlan[] = [
  {
    name: "Launch",
    price: "Custom",
    description: "A focused AI intake or sales agent for one website workflow.",
    features: ["Agent strategy", "Website widget", "Lead capture flow", "Basic email routing"]
  },
  {
    name: "Growth",
    price: "Custom",
    description: "A fuller automation system for teams ready to connect lead capture and operations.",
    features: ["Everything in Launch", "CRM-ready lead summaries", "Booking flow", "Workflow automations"],
    highlighted: true
  },
  {
    name: "Scale",
    price: "Custom",
    description: "Multi-workflow automation for businesses with higher volume and more complex operations.",
    features: ["Everything in Growth", "Multiple agent workflows", "Advanced routing logic", "Ongoing optimization"]
  }
];

export const faqs: FAQ[] = [
  {
    question: "Is NovaRose AI selling generic chatbots?",
    answer:
      "No. Sprint 1 positions NovaRose AI around business outcomes: more qualified leads, faster response times, and less repetitive work."
  },
  {
    question: "Can the agent be customized for different industries?",
    answer:
      "Yes. Agent behavior starts from configuration, so demos for law firms, home services, medical offices, and other industries can reuse the same foundation."
  },
  {
    question: "Does this version connect to OpenAI, n8n, Supabase, or a CRM?",
    answer:
      "Not yet. Sprint 1 includes the architecture, configuration files, and mock agent experience. Real provider integrations belong in Sprint 2."
  },
  {
    question: "How quickly can a first workflow launch?",
    answer:
      "Most first workflows should start with a narrow lead intake, sales agent, or booking automation so value can be measured before expanding."
  }
];
