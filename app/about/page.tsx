import type { Metadata } from 'next';
import Link from 'next/link';
export const metadata: Metadata = {
    title: 'About Us',
    description: 'About Shayariprime - Unveiling the passion behind our Hindi Shayari, Poetry, and Kavita collection.',
};

export default function AboutPage() {
    return (
        <div className="max-w-4xl mx-auto px-0 md:px-4 py-6 md:py-10">
            <div
                className="glass rounded-none md:rounded-2xl px-4 py-6 md:p-10 lg:p-12 mb-8"
                style={{
                    background: 'rgba(26,16,48,0.6)',
                    border: '1px solid rgba(124,58,237,0.2)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}
            >
                <h1 className="text-[28px] md:text-4xl lg:text-5xl font-semibold md:font-bold mb-8 gradient-text text-center flex items-start md:items-center justify-center gap-1 md:gap-3">
                    <span className="text-xl md:text-4xl lg:text-4xl">📌</span> About Us – Shayariprime.com
                </h1>

                <div className="space-y-12 text-[var(--color-text-muted)] leading-relaxed text-sm md:text-base">

                    {/* Section: About Shayariprime (English & Hindi) */}
                    <section className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-[var(--color-text)] border-b border-purple-500/20 pb-2 inline-block">About Shayariprime</h2>
                            <p>
                                Shayariprime.com is a dedicated <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Hindi Shayari</Link> and <Link href="/kavita" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">Poetry</Link> website created for people who express their emotions through words. We bring you a thoughtfully curated collection of Hindi Shayari, <Link href="/?category=romantic" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Romantic Shayari</Link>, <Link href="/?category=sad" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">Sad Shayari</Link>, and heartfelt Poetry in Hindi that truly connects with the soul.
                            </p>
                            <p>
                                Our platform is built for readers who believe that sometimes “dil ki alfaaz” can say more than long conversations. From khamosh mohabbat to unkahe izhaar, from ek tarfa mohabbat to deep emotional poetry — Shayariprime aims to capture every shade of human feelings.
                            </p>
                        </div>

                        <div className="space-y-4 p-5 rounded-xl bg-purple-900/10 border border-purple-500/10">
                            <h2 className="text-2xl font-semibold text-[var(--color-text)] border-b border-purple-500/20 pb-2 inline-block">शायरिप्राइम के बारे में</h2>
                            <p className="font-hindi text-base md:text-lg">
                                Shayariprime एक समर्पित हिंदी शायरी और कविता वेबसाइट है, जहाँ आप अपने जज़्बातों को शब्दों में महसूस कर सकते हैं। यहाँ आपको मिलेगी बेहतरीन हिंदी शायरी, रोमांटिक शायरी, दर्द भरी शायरी और दिल को छू लेने वाली कविताएँ।
                            </p>
                            <p className="font-hindi text-base md:text-lg">
                                हमारा उद्देश्य है कि “दिल की अल्फाज़” सही तरीके से आप तक पहुँचें। चाहे वह खामोश मोहब्बत हो, अनकहे इज़हार हों, या एकतरफा मोहब्बत की गहराई — हम हर एहसास को शब्दों में ढालने की कोशिश करते हैं।
                            </p>
                        </div>
                    </section>

                    {/* Section: Our Mission (English & Hindi) */}
                    <section className="space-y-6">
                        <div className="space-y-4">
                            <h2 className="text-2xl font-semibold text-[var(--color-text)] flex items-center gap-2">
                                <span className="text-2xl">🎯</span> Our Mission
                            </h2>
                            <p>
                                Our mission is to create a trustworthy and meaningful Shayari website where readers can explore authentic Hindi poetry without distraction. We focus on:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Original and creative <Link href="/" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">Hindi Shayari</Link></li>
                                <li>Emotion-driven <Link href="/kavita" className="text-pink-400 hover:text-pink-300 underline underline-offset-2">poetry</Link></li>
                                <li>Clean and user-friendly reading experience</li>
                                <li>Regular content updates</li>
                            </ul>
                            <p className="font-medium text-purple-300">
                                We believe Shayari is not just text — it is emotion, silence, love, pain, and expression.
                            </p>
                        </div>

                        <div className="space-y-4 p-5 rounded-xl bg-pink-900/10 border border-pink-500/10">
                            <h2 className="text-2xl font-semibold text-[var(--color-text)] flex items-center gap-2">
                                <span className="text-2xl">💫</span> हमारा लक्ष्य
                            </h2>
                            <p className="font-hindi text-base md:text-lg">
                                हमारा लक्ष्य है एक भरोसेमंद हिंदी शायरी प्लेटफ़ॉर्म बनाना जहाँ पाठक बिना किसी भ्रम के सच्ची और भावनात्मक कविताएँ पढ़ सकें।
                            </p>
                            <p className="font-hindi text-base md:text-lg">हम विशेष रूप से ध्यान देते हैं:</p>
                            <ul className="list-disc list-inside space-y-2 ml-4 font-hindi text-base md:text-lg">
                                <li>मौलिक और रचनात्मक शायरी</li>
                                <li>भावनात्मक गहराई</li>
                                <li>सरल और मोबाइल-फ्रेंडली अनुभव</li>
                                <li>नियमित अपडेट</li>
                            </ul>
                        </div>
                    </section>

                    {/* Section: Why Choose Shayariprime */}
                    <section>
                        <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/20 relative overflow-hidden">
                            {/* Decorative background glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

                            <h2 className="text-2xl font-semibold text-[var(--color-text)] flex items-center gap-2 mb-6">
                                <span className="text-2xl">🌍</span> Why Choose Shayariprime?
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Dedicated Hindi Shayari Directory",
                                    "Romantic, Sad & Emotional Poetry Collection",
                                    "Clean layout and fast loading experience",
                                    "Designed especially for Hindi readers in India and worldwide"
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-start gap-3">
                                        <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                                        </div>
                                        <p>{item}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-6 text-center font-medium italic text-pink-300/80">
                                &quot;Shayariprime is built with passion for those who understand that poetry is not just written — it is felt.&quot;
                            </p>
                        </div>
                    </section>

                    {/* Section: What You'll Find Here */}
                    <section>
                        <h2 className="text-2xl font-semibold text-[var(--color-text)] flex items-center gap-2 mb-4">
                            <span className="text-2xl">📖</span> What You’ll Find Here
                        </h2>
                        <p className="mb-4">On Shayariprime.com, you can explore:</p>
                        <div className="flex flex-wrap gap-3">
                            {[
                                "Romantic Shayari in Hindi",
                                "Sad Shayari in Hindi",
                                "Dil ki Alfaaz Shayari",
                                "Khamosh Mohabbat Poetry",
                                "Unkahe Izhaar Shayari",
                                "Ek Tarfa Mohabbat Shayari",
                                "Emotional Hindi Poetry"
                            ].map((tag) => (
                                <span
                                    key={tag}
                                    className="px-4 py-2 rounded-full text-sm font-medium bg-black/30 border border-purple-500/20 text-purple-200"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                        <p className="mt-6 border-l-2 border-purple-500 pl-4 py-1 italic">
                            Every piece is written or carefully curated to reflect real human emotions.
                        </p>
                    </section>

                    {/* Section: Our Commitment */}
                    <section>
                        <h2 className="text-2xl font-semibold text-[var(--color-text)] flex items-center gap-2 mb-3">
                            <span className="text-2xl">🤝</span> Our Commitment
                        </h2>
                        <p>
                            We respect creativity and originality. If you ever find any content that needs correction or attribution, please <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">contact us</Link>. We are committed to maintaining authenticity and transparency.
                        </p>
                    </section>

                    {/* Section: Contact */}
                    <section className="text-center pt-8 border-t border-white/5">
                        <h2 className="text-xl font-semibold text-[var(--color-text)] flex items-center justify-center gap-2 mb-4">
                            <span className="text-2xl">📩</span> Get in Touch
                        </h2>
                        <p className="mb-6 max-w-2xl mx-auto">
                            If you have feedback, suggestions, or would like to contribute your own Hindi Shayari or Poetry, feel free to reach out.
                        </p>
                        <Link
                            href="/contact"
                            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all active:scale-95"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                boxShadow: '0 4px 15px rgba(236, 72, 153, 0.3)'
                            }}
                        >
                            Contact Us
                        </Link>
                    </section>

                </div>
            </div>
        </div>
    );
}
