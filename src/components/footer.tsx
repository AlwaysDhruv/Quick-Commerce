
'use client';

import { Logo } from "./logo";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Github, Twitter, Instagram } from "lucide-react";
import Link from "next/link";

export function Footer() {
    return (
        <footer className="border-t border-border/40 py-12 bg-background/95 mt-12">
            <div className="container grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-4">
                    <Logo />
                    <p className="text-muted-foreground text-sm">
                        The premium marketplace for discerning buyers and ambitious sellers.
                    </p>
                     <div className="flex items-center gap-4">
                        <Link href="#"><Github className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" /></Link>
                        <Link href="#"><Twitter className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" /></Link>
                        <Link href="#"><Instagram className="h-5 w-5 text-muted-foreground hover:text-primary transition-colors" /></Link>
                    </div>
                </div>
                <div>
                    <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/buyer" className="text-muted-foreground hover:text-primary">Shop</Link></li>
                        <li><Link href="/seller" className="text-muted-foreground hover:text-primary">Become a Seller</Link></li>
                        <li><Link href="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                        <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                    </ul>
                </div>
                <div>
                     <h4 className="font-semibold text-lg mb-4">Help</h4>
                    <ul className="space-y-2 text-sm">
                        <li><Link href="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
                        <li><Link href="/shipping" className="text-muted-foreground hover:text-primary">Shipping Information</Link></li>
                        <li><Link href="/returns" className="text-muted-foreground hover:text-primary">Return Policy</Link></li>
                        <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                    </ul>
                </div>
                 <div>
                    <h4 className="font-semibold text-lg mb-4">Newsletter</h4>
                    <p className="text-muted-foreground text-sm mb-2">Subscribe to our newsletter for weekly updates and promotions.</p>
                     <form className="flex w-full max-w-sm items-center space-x-2">
                        <Input type="email" placeholder="Email" />
                        <Button type="submit">Subscribe</Button>
                    </form>
                </div>
            </div>
             <div className="container mt-8 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} SwiftShopper. All Rights Reserved.</p>
            </div>
        </footer>
    )
}

    