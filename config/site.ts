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
      title: "List",
      href: "/list",
    },
    // {
    //   title: "Balance",
    //   href: "/balance",
    // },
    {
      title: "Dashboard",
      href: "/dashboard",
    },
  ],
  links: {
    twitter: "https://twitter.com/",
    github: "https://github.com/chriszyy3",
    docs: "https://ui.shadcn.com",
  },
}
