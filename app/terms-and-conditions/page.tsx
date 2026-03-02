import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = {
    title: 'Terms and Conditions',
    description: 'Terms and conditions for using Shayariprime.',
};

export default function TermsAndConditionsPage() {
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
                    Terms and Conditions
                </h1>

                <div className="space-y-8 text-[var(--color-text-muted)] leading-relaxed text-sm md:text-base">
                    <section>
                        <p className="font-semibold text-[var(--color-text)] mb-2">Welcome to <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Shayariprime.com</Link>.</p>
                        <p>
                            By accessing and using this website, you accept and agree to be bound by the following terms and conditions.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">1️⃣</span> Use of Website
                        </h2>
                        <ul className="space-y-2 list-disc list-inside">
                            <li>You agree to use this website for lawful purposes only.</li>
                            <li>You must not use this website in any way that causes damage or affects accessibility.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">2️⃣</span> Intellectual Property Rights
                        </h2>
                        <p className="mb-4">
                            Unless otherwise stated, Shayariprime.com owns the intellectual property rights for the content published on this website.
                        </p>
                        <div className="space-y-4 ml-6">
                            <div>
                                <strong className="text-purple-300 block mb-1">You may:</strong>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>View and read content for personal use.</li>
                                </ul>
                            </div>
                            <div>
                                <strong className="text-pink-400 block mb-1">You may not:</strong>
                                <ul className="list-disc list-inside space-y-1">
                                    <li>Copy or republish content without permission.</li>
                                    <li>Use our content for commercial purposes without authorization.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">3️⃣</span> User Submissions
                        </h2>
                        <p className="mb-2">If you submit content (such as <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Shayari</Link> or suggestions):</p>
                        <ul className="space-y-1 list-disc list-inside ml-2">
                            <li>You grant us the right to use, modify, or publish it.</li>
                            <li>You confirm that the content is your original work.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">4️⃣</span> External Links
                        </h2>
                        <p>
                            Our website may contain links to third-party websites. We are not responsible
                            for the content or policies of those websites.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">5️⃣</span> Limitation of Liability
                        </h2>
                        <p>
                            We are not liable for any losses or damages arising from the use of this website.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">6️⃣</span> Changes to Terms
                        </h2>
                        <p>
                            We may update these Terms and Conditions at any time. Continued use of the website
                            means you accept those changes.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">7️⃣</span> Contact Information
                        </h2>
                        <p>
                            If you have any questions about these Terms and Conditions, please{' '}
                            <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                                contact us
                            </Link>{' '}
                            through our Contact Us page.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
}
