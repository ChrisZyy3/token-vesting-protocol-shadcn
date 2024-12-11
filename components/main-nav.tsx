"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"

import { siteConfig } from "@/config/site"
import { cn } from "@/lib/utils"

interface MainNavProps {
  items: {
    title: string
    href: string
  }[]
}

export function MainNav({ items }: MainNavProps) {
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
