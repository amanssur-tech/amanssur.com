import en from './en';
import de from './de';

// Define the shape of each translation file
export type TranslationSchema = {
  meta: {
    title: string;
    description: string;
  };
  hero: {
    heading: string;
    subheading: string;
    cta: string;
  };
  about: {
    heading: string;
    paragraphs: string[];
    cta: string;
  };
  projects: {
    heading: string;
    paragraph: string;
    highlight1: string;
    h1p1: string;
    h1p2: string;
    highlight2: string;
    h2p1: string;
    h2p2: string;
    highlight3: string;
    h3p1: string;
    h3p2: string;
    github: string;
    explore: string;
  };
  contact: {
    heading: string;
    paragraph: string;
    form: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      message: string;
      submit: string;
      success: string;
      error: string;
      rateLimit: string;
      sending: string;
      invalid: string;
      company: string;
      website: string;
      subject: string;
      reason: string;
      reasonRecruitment: string;
      reasonCollaboration: string;
      reasonEvent: string;
      reasonInterview: string;
      reasonOther: string;
      consent1: string;
      consent2: string;
      privacy: string;
    };
    autoreply: {
      subject: string;
      greeting: string;
      lead: string;
      yourMessage: string;
      closing: string;
      regards: string;
      separator: string;
      followMe: string;
    };
  };
  footer: {
    paragraph1: string;
    paragraph2: string;
    impressum: { name: string; href: string };
    disclaimer: { name: string; href: string };
    copyright: { name: string; href: string };
    privacy: { name: string; href: string };
    follow: string;
    mywork: string;
    notice: string;
    legal: { name: string; href: string };
  };
  navlinks: {
    sitename: string;
    about: { name: string; href: string };
    projects: { name: string; href: string };
    contact: { name: string; href: string };
    cv: { name: string; href: string };
  };
  cv: {
    photoUnselected: string;
    photoSelected: string;
    download: string;
    fileNoPhoto: string;
    fileWithPhoto: string;
  };
  impressum: {
    title: string;
    heading: string;
    responsible: string;
    email: string;
    menu: string;
    note: string;
    form: { name: string; href: string};
  };
  notFound: {heading: string; home: string};
  // ... add more sections as needed
  // e.g., blog, services, testimonials, etc.
};

// Map of all translations
export const translations = {
  en,
  de,
} as const;

export type Lang = keyof typeof translations;
export type ComponentKey = keyof TranslationSchema;

// Helper function to get translated props for a component
export const getProps = <K extends ComponentKey>(
  lang: Lang,
  key: K
): TranslationSchema[K] => {
  return translations[lang][key];
};