"use client"

import * as React from "react"
import Link from "next/link"

import { Icons } from "@/components/icons"
import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

export function MainNav() {
  const items: { title: string; href: string }[] = [
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
  ]

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Icons.logo className="size-6" />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "flex items-center text-sm font-medium text-muted-foreground",
            "hover:text-primary"
          )}
        >
          {item.title}
        </Link>
      ))}
    </div>
  )
}
