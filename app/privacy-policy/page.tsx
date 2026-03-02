import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'Privacy Policy for Shayariprime.',
};

export default function PrivacyPolicyPage() {
    return (
        <div className="max-w-4xl mx-auto px-0 md:px-4 py-6 md:py-10">
            <div
                className="glass rounded-none md:rounded-2xl px-4 py-6 md:p-10"
                style={{
                    background: 'rgba(26,16,48,0.6)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}
            >
                <h1 className="text-3xl md:text-4xl font-bold mb-8 gradient-text text-center">
                    Privacy Policy
                </h1>

                <div className="space-y-8 text-[var(--color-text-muted)] leading-relaxed text-sm md:text-base">
                    <section>
                        <p className="font-semibold text-[var(--color-text)] mb-2">Welcome to <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Shayari Prime</Link>.</p>
                        <p className="mb-2">
                            Your privacy is very important to us. This Privacy Policy explains how we collect, use, and protect your information when you visit our website.
                        </p>
                        <p>
                            By using our website, you agree to the terms of this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">1️⃣</span> Information We Collect
                        </h2>
                        <p className="mb-2">We may collect the following types of information:</p>
                        <ul className="list-disc list-inside space-y-1 mb-4 ml-2">
                            <li>Basic non-personal information (browser type, device, pages visited)</li>
                            <li>Cookies and usage data</li>
                            <li>Information you voluntarily provide (such as email when contacting us)</li>
                        </ul>
                        <p>We do not collect sensitive personal data without your consent.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">2️⃣</span> How We Use Your Information
                        </h2>
                        <p className="mb-2">We use collected information to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Improve website performance and user experience</li>
                            <li>Analyze traffic and visitor behavior</li>
                            <li>Respond to user queries</li>
                            <li>Show relevant advertisements (if applicable)</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">3️⃣</span> Cookies Policy
                        </h2>
                        <p className="mb-2">Shayari Prime uses cookies to:</p>
                        <ul className="list-disc list-inside space-y-1 mb-4 ml-2">
                            <li>Enhance user experience</li>
                            <li>Understand visitor behavior</li>
                            <li>Store preferences</li>
                        </ul>
                        <p>You can disable cookies anytime from your browser settings.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">4️⃣</span> Google AdSense &amp; Third-Party Advertising
                        </h2>
                        <div className="space-y-3">
                            <p>We may use third-party advertising services such as Google AdSense to display ads.</p>
                            <p>These services may use cookies and web beacons to show ads based on your previous visits to this or other websites.</p>
                            <p>Google may use the DoubleClick Cookie to serve personalized ads.</p>
                            <p>
                                Users can opt out of personalized advertising by visiting:{' '}
                                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2 break-all">
                                    https://www.google.com/settings/ads
                                </a>
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">5️⃣</span> Third-Party Links
                        </h2>
                        <p className="mb-2">Our website may contain links to external websites.</p>
                        <p>We are not responsible for the privacy practices of those sites.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">6️⃣</span> Data Protection
                        </h2>
                        <p>
                            We implement appropriate security measures to protect your information. However, no method of online transmission is 100% secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">7️⃣</span> Children&apos;s Information
                        </h2>
                        <p>
                            Shayari Prime does not knowingly collect personal information from children under 13.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">8️⃣</span> Consent
                        </h2>
                        <p>
                            By using our website, you hereby consent to our Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">9️⃣</span> Updates
                        </h2>
                        <p className="mb-2">We may update this Privacy Policy from time to time.</p>
                        <p>Changes will be posted on this page.</p>
                    </section>

                    <section className="pt-4 border-t border-purple-500/20">
                        <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">📩</span> Contact Us
                        </h2>
                        <p className="mb-3">
                            If you have any questions regarding this Privacy Policy, you may contact us at:
                        </p>
                        <div className="space-y-2">
                            <p className="flex items-center gap-2">
                                <span className="text-xl">📧</span>
                                <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                                    Contact Form
                                </Link>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-xl">📍</span> India
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
