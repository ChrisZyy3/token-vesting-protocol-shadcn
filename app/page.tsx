import Link from "next/link"
import { siteConfig } from "@/config/site"
import ShinyButton from "@/components/ui/shiny-button"
import { WarpBackground } from "@/components/magicui/warp-background"

export default function IndexPage() {
  return (
    <section className="container relative grid min-h-[calc(100vh-4rem)] items-center gap-6 pb-8 pt-6 md:py-10">
      {/* Warp Background */}
      <WarpBackground
        className="absolute inset-0 -z-10"
        perspective={1000}
        beamsPerSide={4}
        beamSize={3}
        beamDelayMax={2}
        beamDelayMin={0}
        beamDuration={4}
        gridColor="hsl(var(--primary)/0.1)"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-muted/5" />
      </WarpBackground>

      {/* Main content */}
      <div className="flex max-w-[980px] flex-col items-start gap-6">
        {/* Title tag */}
        <div className="duration-1000 animate-in fade-in slide-in-from-top-4">
          <div className="inline-flex items-center rounded-full bg-muted/50 px-4 py-1.5 text-sm font-medium text-muted-foreground ring-1 ring-muted/30 backdrop-blur-sm">
            <span className="mr-2 size-2 animate-pulse rounded-full bg-primary/50" />
            Welcome to EasyLocking Protocol
          </div>
        </div>

        {/* Main title */}
        <div className="space-y-4 duration-1000 animate-in fade-in slide-in-from-top-8 [animation-delay:200ms]">
          <h1 className="bg-gradient-to-br from-foreground via-foreground/90 to-foreground/70 bg-clip-text text-4xl font-extrabold leading-tight tracking-tighter text-transparent md:text-5xl lg:text-6xl">
            Lock your tokens, strengthen your conviction, and build a stronger crypto community.
          </h1>
        </div>

        {/* Feature list */}
        <div className="mt-4 grid gap-4 duration-1000 animate-in fade-in slide-in-from-top-12 [animation-delay:400ms]">
          {[
            "Lock tokens to prevent impulsive selling during market volatility",
            "Choose flexible lock periods from 3 months to 2 years",
            "Track your locked tokens and unlock dates in real-time",
            "Join a community of committed long-term holders"
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

      {/* Button group */}
      <div className="flex flex-wrap gap-4 duration-1000 animate-in fade-in slide-in-from-top-16 [animation-delay:600ms]">
        <Link href="/create" className="no-underline">
          <ShinyButton className="min-w-[200px] bg-background/50">
            Lock Tokens Now
          </ShinyButton>
        </Link>

        <Link href="/dashboard" className="no-underline">
          <ShinyButton
            className="min-w-[200px] bg-background/50 hover:bg-background/60"
          >
            View Locked Tokens
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
