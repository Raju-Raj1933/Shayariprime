import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, MapPin, MessageSquare } from 'lucide-react';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
    title: 'Contact Us',
    description: 'Get in touch with Shayariprime for any queries, feedback, or suggestions.',
};

export default function ContactPage() {
    return (
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-16">

            {/* Page Header */}
            <div className="text-center mb-12">
                <h1 className="text-3xl md:text-5xl font-bold mb-4 gradient-text">
                    Contact Us
                </h1>
                <p className="text-sm md:text-base text-[var(--color-text-muted)] max-w-2xl mx-auto leading-relaxed">
                    Welcome to Shayariprime.com. We value our readers and aim to respond to genuine queries within 24–48 hours. We are here to help.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-start">

                {/* Left Side: Contact Information */}
                <div className="lg:col-span-2 space-y-6">
                    <div
                        className="glass rounded-2xl p-6 md:p-8"
                        style={{
                            background: 'rgba(26,16,48,0.6)',
                            border: '1px solid rgba(124,58,237,0.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                        }}
                    >
                        <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-text)] mb-6">
                            Get in Touch
                        </h2>

                        <p className="text-sm text-[var(--color-text-muted)] mb-8 leading-relaxed">
                            If you have any questions, feedback, suggestions, or copyright concerns regarding our <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Hindi Shayari</Link> and <Link href="/kavita" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">Poetry</Link> content, feel free to contact us using the form.
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-500/10 border border-purple-500/20 shrink-0">
                                    <Mail className="text-purple-400 w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-[var(--color-text)] mb-1">Email Us</h3>
                                    <a href="mailto:contact@shayariprime.com" className="text-sm text-purple-300 hover:text-purple-200 transition-colors">
                                        contact@shayariprime.com
                                    </a>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-pink-500/10 border border-pink-500/20 shrink-0">
                                    <MapPin className="text-pink-400 w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-[var(--color-text)] mb-1">Location</h3>
                                    <p className="text-sm text-[var(--color-text-muted)]">
                                        India
                                    </p>
                                </div>
                            </div>
                        </div>

                        <hr className="my-8 border-purple-500/10" />

                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-[var(--color-text)]">Whether it’s about:</h3>
                            <ul className="text-sm text-[var(--color-text-muted)] space-y-2 list-disc list-inside ml-2">
                                <li><Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Hindi Shayari</Link> content correction</li>
                                <li>Suggesting new <Link href="/kavita" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">poetry</Link> topics</li>
                                <li>Reporting copyright issues</li>
                                <li>General feedback</li>
                            </ul>
                            <p className="text-xs text-pink-300/80 italic mt-4">
                                Your feedback helps us improve and provide better content related to <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Hindi Shayari</Link>, <Link href="/?category=romantic" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">Romantic Shayari</Link>, <Link href="/?category=sad" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Sad Shayari</Link>, and emotional <Link href="/kavita" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">Poetry in Hindi</Link>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Contact Form */}
                <div className="lg:col-span-3">
                    <div
                        className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden"
                        style={{
                            background: 'linear-gradient(135deg, rgba(20,10,42,0.6) 0%, rgba(30,15,55,0.6) 100%)',
                            border: '1px solid rgba(124,58,237,0.2)',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                        }}
                    >
                        {/* Soft background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />

                        <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-text)] mb-6 flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-purple-400" />
                            Send us a Message
                        </h2>

                        <ContactForm />
                    </div>
                </div>

            </div>
        </div>
    );
}
