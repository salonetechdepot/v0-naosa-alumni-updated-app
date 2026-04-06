'use client'

import { usePathname } from 'next/navigation'

export function Footer() {
  const pathname = usePathname()

  // Don't show footer on admin pages
  if (pathname.startsWith('/admin')) {
    return null
  }

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
            N
          </div>
          <div>
            <p className="font-semibold text-foreground">
              Nasir Ahmadiyya Muslim Secondary School
            </p>
            <p className="text-sm text-muted-foreground">
              Old Students Association (NAOSA) - Kenema, Sierra Leone
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} NAOSA. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
