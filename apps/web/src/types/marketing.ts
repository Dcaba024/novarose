export type Service = {
  title: string;
  description: string;
  outcome: string;
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type UseCase = {
  industry: string;
  description: string;
};

export type PricingPlan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  highlighted?: boolean;
};

export type FAQ = {
  question: string;
  answer: string;
};

export type NavItem = {
  label: string;
  href: string;
};
