import Link from 'next/link';

export const metadata = {
  title: 'Terms of Use – TagTune',
  description: 'TagTune Terms of Use',
};

export default function TermsOfUsePage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Header */}
      <header className="border-b border-[#e5e5e5] px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="text-2xl font-black tracking-tight hover:text-[#FF0000] transition-colors">
          TAGTUNE
        </Link>
        <nav className="flex gap-6 text-sm font-semibold text-gray-500">
          <Link href="/terms-of-use" className="text-black border-b-2 border-[#FF0000]">Terms of Use</Link>
          <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 animate-fade-in">
        <h1 className="text-4xl font-black uppercase mb-2">Terms of Use</h1>
        <p className="text-sm text-gray-400 mb-12">
          <a href="https://tagtune.app" className="hover:text-[#FF0000] transition-colors">https://tagtune.app</a>
        </p>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Terms</h2>
            <p>
              By accessing the website at TagTune, you are agreeing to be bound by these terms of service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site. The materials contained in this website are protected by applicable copyright and trademark law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Use License</h2>
            <p className="mb-3">
              Permission is granted to temporarily use TagTune for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>modify or copy the materials;</li>
              <li>use the materials for any commercial purpose, or for any public display (commercial or non-commercial);</li>
              <li>attempt to decompile or reverse engineer any software contained in TagTune;</li>
              <li>remove any copyright or other proprietary notations from the materials; or</li>
              <li>transfer the materials to another person or "mirror" the materials on any other server.</li>
            </ul>
            <p className="mt-3">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by TagTune at any time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Disclaimer</h2>
            <p>
              The materials on TagTune's website are provided on an 'as is' basis. TagTune makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
            <p className="mt-3">
              Further, TagTune does not warrant or make any representations concerning the accuracy, likely results, or reliability of the use of the materials on its website or otherwise relating to such materials or on any sites linked to this site.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Limitations</h2>
            <p>
              In no event shall TagTune or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on TagTune's website, even if TagTune or a TagTune authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Accuracy of Materials</h2>
            <p>
              The materials appearing on TagTune's website could include technical, typographical, or photographic errors. TagTune does not warrant that any of the materials on its website are accurate, complete or current. TagTune may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Links</h2>
            <p>
              TagTune has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by TagTune of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Modifications</h2>
            <p>
              TagTune may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Third Party Platform</h2>
            <p>
              TagTune integrates with third-party platforms to provide its services. By using TagTune, you also agree to the terms and conditions of these platforms. TagTune is not responsible for any actions taken by these third-party platforms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-black mb-3">Third Party Terms of Service</h2>
            <p className="mb-3">TagTune uses the following third-party services. Please review their respective terms:</p>
            <ul className="space-y-2">
              <li>
                <a href="https://www.youtube.com/t/terms" target="_blank" rel="noopener noreferrer" className="text-[#FF0000] hover:underline">YouTube Terms of Service</a>
              </li>
              <li>
                <a href="https://developers.google.com/youtube/terms/api-services-terms-of-service" target="_blank" rel="noopener noreferrer" className="text-[#FF0000] hover:underline">YouTube API Services Terms of Service</a>
              </li>
              <li>
                <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#FF0000] hover:underline">Google Privacy Policy</a>
              </li>
              <li>
                <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-[#FF0000] hover:underline">Manage Google Account Permissions</a>
              </li>
            </ul>
            <p className="mt-3">
              You can revoke TagTune's access to your Google/YouTube account at any time through the{' '}
              <a href="https://myaccount.google.com/permissions" target="_blank" rel="noopener noreferrer" className="text-[#FF0000] hover:underline">Google security settings page</a>.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5e5e5] py-8 mt-12 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} TagTune. All rights reserved.</p>
        <div className="flex justify-center gap-6 mt-3">
          <Link href="/terms-of-use" className="hover:text-black transition-colors">Terms of Use</Link>
          <Link href="/privacy-policy" className="hover:text-black transition-colors">Privacy Policy</Link>
        </div>
      </footer>
    </div>
  );
}
