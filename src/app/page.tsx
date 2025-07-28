import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <h1 className="font-headline text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Elevate Your Shopping.
                <br />
                <span className="text-primary">Empower Your Business.</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Welcome to SwiftShopper, the premium marketplace for discerning buyers and ambitious sellers. Discover unique products or launch your brand with powerful AI tools.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6 lg:justify-start">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href="/buyer">
                    Start Shopping <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost">
                  <Link href="/register">
                    Become a Seller <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1587721500213-5a0398bf8a39?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxMHx8c2hvcGluZyUyMGNhcnR8ZW58MHx8fHwxNzUzNjg5MDc3fDA&ixlib=rb-4.1.0&q=80&w=1080"
                alt="SwiftShopper showcase"
                width={600}
                height={400}
                className="rounded-xl shadow-2xl ring-1 ring-white/10"
                data-ai-hint="online shopping"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-background py-20 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Why Choose SwiftShopper?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We provide a seamless and sophisticated experience for everyone.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border bg-card p-8 text-center shadow">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <CheckCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-white">For Buyers</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Discover a curated selection of high-quality products. Enjoy personalized recommendations powered by AI to find exactly what you're looking for.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-8 text-center shadow">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <CheckCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-white">For Sellers</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Leverage our AI-powered tools to create compelling product descriptions effortlessly. Manage your orders and products through an intuitive dashboard.
              </p>
            </div>
            <div className="rounded-xl border bg-card p-8 text-center shadow md:col-span-2 lg:col-span-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary">
                <CheckCircle className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mt-6 text-lg font-medium text-white">Secure & Elegant</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Experience a visually stunning platform with smooth animations and a secure checkout process, ensuring peace of mind with every transaction.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
