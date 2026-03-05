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
                        <p className="font-semibold text-[var(--color-text)] mb-2">Last Updated: March 2026</p>
                        <p className="font-semibold text-[var(--color-text)] mb-2">Welcome to <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Shayariprime</Link>.</p>
                        <p className="mb-2">
                            Your privacy matters to us. This Privacy Policy explains what kind of information we collect, how we use it, and how we protect it when you visit or interact with our website.
                        </p>
                        <p className="mb-2">
                            This policy applies to the website:{' '}
                            <a href="https://shayariprime.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2 break-all">
                                https://shayariprime.com
                            </a>
                        </p>
                        <p>
                            By accessing or using our website, you agree to the terms described in this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">1️⃣</span> Information We Collect
                        </h2>
                        <p className="mb-2">When you visit Shayari Prime, we may collect certain types of information to improve the website experience.</p>
                        <p className="mb-2">This may include:</p>
                        <ul className="list-disc list-inside space-y-1 mb-4 ml-2">
                            <li>Basic non-personal details such as browser type, device type, pages visited, and time spent on the website.</li>
                            <li>Cookies and usage data that help us understand how visitors interact with our content.</li>
                            <li>Information you voluntarily provide, such as your email address when contacting us or creating an account.</li>
                        </ul>
                        <p>We do not collect sensitive personal information without your consent.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">2️⃣</span> How We Use Your Information
                        </h2>
                        <p className="mb-2">The information we collect helps us run and improve the website.</p>
                        <p className="mb-2">We may use it to:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Improve website performance and user experience</li>
                            <li>Understand visitor behavior and traffic patterns</li>
                            <li>Respond to user questions or feedback</li>
                            <li>Maintain the security and stability of the website</li>
                            <li>Display relevant advertisements when applicable</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">3️⃣</span> Cookies Policy
                        </h2>
                        <p className="mb-2">Shayari Prime uses cookies to enhance the browsing experience.</p>
                        <p className="mb-2">Cookies help us:</p>
                        <ul className="list-disc list-inside space-y-1 mb-4 ml-2">
                            <li>Remember user preferences</li>
                            <li>Understand how visitors use our website</li>
                            <li>Improve site performance</li>
                        </ul>
                        <p>You can disable cookies anytime through your browser settings if you prefer not to allow them.</p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">4️⃣</span> Google AdSense &amp; Third-Party Advertising
                        </h2>
                        <div className="space-y-3">
                            <p>Our website may use third-party advertising services such as Google AdSense to display ads.</p>
                            <p>These services may use cookies or web beacons to show advertisements based on your previous visits to this website or other websites.</p>
                            <p>Google may use the DoubleClick Cookie to serve personalized ads to users.</p>
                            <p>
                                If you prefer not to see personalized ads, you can manage or disable them here:{' '}
                                <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2 break-all">
                                    https://www.google.com/settings/ads
                                </a>
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">5️⃣</span> Google Sign-In Information
                        </h2>
                        <div className="space-y-3">
                            <p>If you choose to sign in using your Google account, we may receive basic information from Google such as:</p>
                            <ul className="list-disc list-inside space-y-1 mb-4 ml-2">
                                <li>Your name</li>
                                <li>Email address</li>
                                <li>Profile picture</li>
                            </ul>
                            <p>This information is used only to authenticate your account and allow you to log in to Shayari Prime.</p>
                            <p>We do not have access to your Google password, and we do not store it.</p>
                            <p>Your Google account information is not shared with third parties, except when necessary to provide secure authentication services.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">6️⃣</span> Third-Party Links
                        </h2>
                        <div className="space-y-3">
                            <p>Our website may contain links to external websites for additional information or resources.</p>
                            <p>Please note that we are not responsible for the privacy policies or practices of those external sites.</p>
                            <p>We recommend reviewing their privacy policies before sharing any personal information.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">7️⃣</span> Data Protection
                        </h2>
                        <div className="space-y-3">
                            <p>We take reasonable measures to protect your information and maintain website security.</p>
                            <p>However, it is important to understand that no method of internet transmission or electronic storage is completely secure.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">8️⃣</span> Children&apos;s Information
                        </h2>
                        <div className="space-y-3">
                            <p>Shayari Prime does not knowingly collect personal information from children under the age of 13.</p>
                            <p>If you believe that a child has submitted personal information on our website, please contact us and we will take steps to remove that information.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">9️⃣</span> Consent
                        </h2>
                        <p>
                            By using our website, you acknowledge that you have read and agree to this Privacy Policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">🔟</span> Updates to This Policy
                        </h2>
                        <div className="space-y-3">
                            <p>We may update this Privacy Policy occasionally to reflect changes in our services or legal requirements.</p>
                            <p>Whenever updates are made, the revised version will be posted on this page with the updated date.</p>
                        </div>
                    </section>

                    <section className="pt-4 border-t border-purple-500/20">
                        <h2 className="text-xl font-semibold mb-4 text-[var(--color-text)] flex items-center gap-2">
                            <span className="text-2xl">📩</span> Contact Us
                        </h2>
                        <p className="mb-3">
                            If you have any questions about this Privacy Policy, you can contact us through:
                        </p>
                        <div className="space-y-2">
                            <p className="flex items-center gap-2">
                                <span className="text-xl">📧</span>
                                <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">
                                    Contact Form on our website
                                </Link>
                            </p>
                            <p className="flex items-center gap-2">
                                <span className="text-xl">🌍</span>
                                <a href="https://shayariprime.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2 break-all">
                                    https://shayariprime.com
                                </a>
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
