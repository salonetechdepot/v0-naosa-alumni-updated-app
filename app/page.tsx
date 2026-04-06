import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, Heart, ArrowRight } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-primary py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-primary-foreground/10 text-primary-foreground">
            <span className="text-4xl font-bold">N</span>
          </div>
          <h1 className="mb-4 text-balance text-4xl font-bold tracking-tight text-primary-foreground md:text-5xl lg:text-6xl">
            Nasir Ahmadiyya Muslim Secondary School
          </h1>
          <p className="mb-2 text-xl text-primary-foreground/90 md:text-2xl">
            Old Students Association
          </p>
          <p className="mb-8 text-lg text-primary-foreground/80">
            Kenema, Sierra Leone
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2">
                Join Our Community
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
              Welcome to NAOSA
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We are a community of proud alumni from Nasir Ahmadiyya Muslim Secondary School, 
              united by our shared experiences and commitment to supporting our alma mater. 
              Join us in fostering connections, supporting current students, and celebrating 
              our rich heritage.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-secondary/50 py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="mb-12 text-center text-3xl font-bold text-foreground md:text-4xl">
            Why Join Our Association?
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="border-0 bg-card shadow-sm">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <CardTitle>Connect with Alumni</CardTitle>
                <CardDescription>
                  Reconnect with old classmates and build lasting professional networks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our alumni network spans across Sierra Leone and beyond. Stay connected 
                  with fellow graduates and expand your professional circle.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card shadow-sm">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle>Support Education</CardTitle>
                <CardDescription>
                  Contribute to the growth and development of our school
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Help provide scholarships, improve facilities, and mentor current 
                  students to ensure the legacy of our school continues to thrive.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 bg-card shadow-sm">
              <CardHeader>
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Heart className="h-6 w-6" />
                </div>
                <CardTitle>Give Back</CardTitle>
                <CardDescription>
                  Make a meaningful impact in your community
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Through various initiatives and programs, contribute to the 
                  betterment of Kenema and the broader Sierra Leonean community.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-4">
          <Card className="border-0 bg-primary text-primary-foreground">
            <CardContent className="flex flex-col items-center gap-6 p-8 text-center md:p-12">
              <h2 className="text-2xl font-bold md:text-3xl">
                Ready to Join Our Alumni Community?
              </h2>
              <p className="max-w-2xl text-primary-foreground/90">
                Register today and become part of a growing network of NAOSA members 
                dedicated to excellence, service, and community building.
              </p>
              <Link href="/register">
                <Button size="lg" variant="secondary" className="gap-2">
                  Register Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
