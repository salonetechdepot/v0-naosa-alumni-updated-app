import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Phone, Mail, CreditCard, MapPin, Users } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4">
        {/* Page Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
            Contact Us
          </h1>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Get in touch with NAOSA. We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Contact Persons */}
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle>Contact Persons</CardTitle>
              <CardDescription>
                Reach out to our association coordinators
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-foreground">Augustine Ngegba</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a
                    href="tel:+23276232900"
                    className="hover:text-primary transition-colors"
                  >
                    +232-76-232900
                  </a>
                </div>
              </div>
              <div>
                <p className="font-medium text-foreground">
                  Baimba Augustine Bockarie
                </p>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <a
                    href="tel:+23276792218"
                    className="hover:text-primary transition-colors"
                  >
                    +232-76-792218
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Email */}
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <CardTitle>Email Address</CardTitle>
              <CardDescription>Send us an email anytime</CardDescription>
            </CardHeader>
            <CardContent>
              <a
                href="mailto:naosakenema@gmail.com"
                className="text-lg font-medium text-primary hover:underline"
              >
                naosakenema@gmail.com
              </a>
              <p className="mt-2 text-sm text-muted-foreground">
                We typically respond within 24-48 hours
              </p>
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-5 w-5" />
              </div>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                For registration fees and donations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-2">
                Send payments to:
              </p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <a
                  href="tel:+23276792218"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors"
                >
                  +232-76-792218
                </a>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Please include your name and purpose in the payment reference.
              </p>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <CardTitle>Location</CardTitle>
              <CardDescription>Our school and association base</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-medium text-foreground">
                Nasir Ahmadiyya Muslim Secondary School
              </p>
              <p className="text-muted-foreground">
                Kenema, Eastern Province
                <br />
                Sierra Leone
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <Card className="mt-8 border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <h3 className="mb-2 text-lg font-semibold text-foreground">
              Want to Get Involved?
            </h3>
            <p className="text-muted-foreground">
              Whether you want to volunteer, donate, or simply reconnect with
              fellow alumni, we welcome your participation. Reach out to us
              through any of the channels above and let&apos;s work together to
              support our alma mater.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
