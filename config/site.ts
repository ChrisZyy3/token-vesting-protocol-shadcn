export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "EasyLocking Protocol",
  description:
    "A protocol for creating and checking vesting assets on the Sui blockchain.",
  mainNav: [
    {
      title: "Home",
      href: "/",
    },
    {
      title: "Create",
      href: "/create",
    },
    {
      title: "Balance",
      href: "/balance",
    },
    {
      title: "List",
      href: "/list",
    },
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/shadcn/ui",
    docs: "https://ui.shadcn.com",
  },
}
