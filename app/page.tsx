import Link from "next/link"
import { siteConfig } from "@/config/site"
import ShinyButton from "@/components/ui/shiny-button"

export default function IndexPage() {
  return (
    <section className="container relative grid min-h-[calc(100vh-4rem)] items-center gap-6 pb-8 pt-6 md:py-10">
      {/* 背景装饰 - 保持原有效果并增强 */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-muted/5" />
        <div className="absolute left-0 top-0 size-[500px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-[500px] translate-x-1/2 translate-y-1/2 animate-pulse rounded-full bg-accent/10 blur-3xl [animation-delay:2s]" />
        <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-muted/30 to-transparent" />
      </div>

      {/* 主要内容 */}
      <div className="flex max-w-[980px] flex-col items-start gap-6">
        {/* 标题标签 - 增加动画效果 */}
        <div className="duration-1000 animate-in fade-in slide-in-from-top-4">
          <div className="inline-flex items-center rounded-full bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground ring-1 ring-muted/30 backdrop-blur-sm">
            <span className="mr-2 size-2 animate-pulse rounded-full bg-primary/50" />
            Welcome to EasyLocking Protocol
          </div>
        </div>

        {/* 主标题 - 增强渐变效果 */}
        <div className="space-y-4 duration-1000 animate-in fade-in slide-in-from-top-8 [animation-delay:200ms]">
          <h1 className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-4xl font-extrabold leading-tight tracking-tighter text-transparent md:text-5xl lg:text-6xl">
            A transparent protocol for creating and checking vesting assets on the
            Sui blockchain.
          </h1>
        </div>

        {/* 特性列表 - 添加交错动画 */}
        <div className="mt-4 grid gap-4 duration-1000 animate-in fade-in slide-in-from-top-12 [animation-delay:400ms]">
          {[
            "Easy to create token vesting",
            "Easy to check vesting status",
            "Everything is transparent and verifiable"
          ].map((text, i) => (
            <div key={i} className="flex items-center space-x-2 text-lg text-muted-foreground">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/25">
                <span className="size-1.5 rounded-full bg-primary/50" />
              </span>
              <p className="backdrop-blur-sm">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 按钮组 - 使用 ShinyButton */}
      <div className="flex flex-wrap gap-4 duration-1000 animate-in fade-in slide-in-from-top-16 [animation-delay:600ms]">
        <Link href="/create" className="no-underline">
          <ShinyButton className="min-w-[200px] bg-background/50">
            Create Vesting Now
          </ShinyButton>
        </Link>

        <Link href="/list" className="no-underline">
          <ShinyButton
            className="min-w-[200px] bg-background/50 hover:bg-background/60"
          >
            Check Vesting List
          </ShinyButton>
        </Link>

        <Link 
          href={siteConfig.links.github} 
          target="_blank" 
          rel="noreferrer"
          className="no-underline"
        >
          <ShinyButton
            className="min-w-[120px] bg-background/30 hover:bg-background/40"
          >
            GitHub
          </ShinyButton>
        </Link>
      </div>
    </section>
  )
}
