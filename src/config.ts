import type { Site, SocialObjects } from "./types";

export const SITE: Site = {
  website: "https://astro-paper-lilac-omega.vercel.app/", // replace this with your deployed domain
  author: "Nithissh's Blog",
  desc: "Esports athlete, Hacker, Gamer and AppSec Enthusiast",
  title: "AstroPaper",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerPage: 3,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
};

export const LOCALE = {
  lang: "en", // html lang code. Set this empty and default will be "en"
  langTag: ["en-EN"], // BCP 47 Language Tags. Set this empty [] to use the environment default
} as const;

export const LOGO_IMAGE = {
  enable: false,
  svg: true,
  width: 216,
  height: 46,
};

export const SOCIALS: SocialObjects = [
  {
    name: "Github",
    href: "https://github.com/snithissh",
    linkTitle: ` ${SITE.title} on Github`,
    active: true,
  },
  {
    name: "LinkedIn",
    href: "https://linkedin.com/in/nithisshs",
    linkTitle: `${SITE.title} on LinkedIn`,
    active: true,
  },
  {
    name: "Mail",
    href: "mailto:nithissh.sathish@skiff.com",
    linkTitle: `Send an email to ${SITE.title}`,
    active: false,
  }
];
