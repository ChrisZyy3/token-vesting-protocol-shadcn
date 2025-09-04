"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

interface MainNavProps {
  items: {
    title: string
    href: string
  }[]
}

export function MainNav({ items }: MainNavProps) {
  const pathname = usePathname()

  return (
    <div className="flex gap-6 md:gap-10">
      <Link href="/" className="flex items-center space-x-2">
        <Image
          src="/esl-icon.png"
          alt="EasyLocking Protocol Logo"
          width={24}
          height={24}
          className="dark:invert"
        />
        <span className="inline-block font-bold">{siteConfig.name}</span>
      </Link>
      {items.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center text-sm transition-colors",
              isActive
                ? "font-bold text-primary"
                : "font-medium text-muted-foreground hover:text-foreground"
            )}
          >
            {item.title}
          </Link>
        )
      })}
    </div>
  )
}
