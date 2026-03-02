import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = {
    title: 'Disclaimer',
    description: 'Disclaimer and legal information for Shayariprime.',
};

export default function DisclaimerPage() {
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
                    Disclaimer
                </h1>

                <div className="space-y-8 text-[var(--color-text-muted)] leading-relaxed text-sm md:text-base">
                    <section>
                        <p className="font-semibold text-[var(--color-text)] mb-2">Welcome to <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Shayariprime.com</Link>.</p>
                        <p>
                            All the content published on this website is for educational and entertainment
                            purposes only. We aim to share meaningful <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Hindi Shayari</Link>, <Link href="/kavita" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">Poetry</Link>, and Quotes
                            that express emotions and creativity.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)]">Content Accuracy</h2>
                        <p>
                            While we try to provide original and high-quality content, we do not make
                            any guarantees regarding completeness, reliability, or accuracy. Any action
                            you take based on the information found on this website is strictly at your
                            own risk.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)]">External Links</h2>
                        <p>
                            Our website may contain links to external websites. We do not have control
                            over the content and nature of those sites. The inclusion of any links does
                            not necessarily imply a recommendation or endorsement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)]">Copyright & Content Usage</h2>
                        <div className="space-y-3">
                            <p>We respect originality and creativity.</p>
                            <p>
                                If you believe any content on our website violates your copyright, please{' '}
                                <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                                    contact us
                                </Link>
                                . We will review and remove the content if necessary.
                            </p>
                            <p>
                                You may not copy, reproduce, or republish our content without proper permission.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)]">Personal Responsibility</h2>
                        <div className="space-y-3">
                            <p>
                                The views and expressions in Shayari are artistic in nature and should not
                                be taken as professional advice (legal, medical, financial, etc.).
                            </p>
                            <p>By using our website, you agree to this disclaimer.</p>
                            <p>
                                If you have any concerns, please{' '}
                                <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                                    contact us
                                </Link>{' '}
                                via our Contact Us page.
                            </p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
