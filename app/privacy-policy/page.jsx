import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy – TagTune',
  description: 'TagTune Privacy Policy',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Header */}
      <header className="border-b border-[#e5e5e5] px-6 py-4 flex items-center justify-between max-w-5xl mx-auto">
        <Link href="/" className="text-2xl font-black tracking-tight hover:text-[#FF0000] transition-colors">
          TAGTUNE
        </Link>
        <nav className="flex gap-6 text-sm font-semibold text-gray-500">
          <Link href="/terms-of-use" className="hover:text-black transition-colors">Terms of Use</Link>
          <Link href="/privacy-policy" className="text-black border-b-2 border-[#FF0000]">Privacy Policy</Link>
        </nav>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-16 animate-fade-in">
        <h1 className="text-4xl font-black uppercase mb-12">Privacy Policy</h1>

        <div className="space-y-6 text-[15px] leading-relaxed text-gray-700">

          <p>
            Your privacy is important to us. It is TagTune's policy to respect your privacy regarding any information we may collect from you across our website,{' '}
            <a href="https://tag-tune.vercel.app" className="text-[#FF0000] hover:underline">https://tag-tune.vercel.app</a>.
            We don't collect any personal information beyond what is strictly necessary to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we're collecting it and how it will be used.
          </p>

          <p>
            To improve your experience on our site, we may use 'cookies'. Cookies are an industry standard and most major websites use them. A cookie is a small text file that our site may place on your computer as a tool to remember your preferences and keep you logged in. You may refuse the use of cookies by selecting the appropriate settings on your browser, however please note that if you do this you may not be able to use the full functionality of this website.
          </p>

          <p>
            TagTune's use and transfer to any other app of information received from Google APIs will adhere to the{' '}
            <a
              href="https://developers.google.com/terms/api-services-user-data-policy#additional_requirements_for_specific_api_scopes"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF0000] hover:underline"
            >
              Google API Services User Data Policy
            </a>
            , including the Limited Use requirements.
          </p>

          <p>
            TagTune uses the{' '}
            <a
              href="https://developers.google.com/youtube/terms/api-services-terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF0000] hover:underline"
            >
              YouTube API Services
            </a>. Please also check out the{' '}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF0000] hover:underline"
            >
              Google Privacy Policy
            </a>. TagTune uses YouTube user information to access, provide and display YouTube data on TagTune. TagTune will be able to retrieve your Google username and profile, and create YouTube playlists on your behalf. User data is only used to provide TagTune services and is not shared with any external service. You can always revoke TagTune's access to your data via the{' '}
            <a
              href="https://myaccount.google.com/permissions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#FF0000] hover:underline"
            >
              Google security settings page
            </a>{' '}
            and can also contact TagTune with any questions or complaints{' '}
            <Link href="/" className="text-[#FF0000] hover:underline">here</Link>.
          </p>

          <p>
            We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we'll protect within commercially acceptable means to prevent loss and theft, as well as unauthorised access, disclosure, copying, use or modification.
          </p>

          <p>
            We don't share any personally identifying information publicly or with third-parties, except when required to by law.
          </p>

          <p>
            Our website may link to external sites that are not operated by us. Please be aware that we have no control over the content and practices of these sites, and cannot accept responsibility or liability for their respective privacy policies.
          </p>

          <p>
            You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services. Your continued use of our website will be regarded as acceptance of our practices around privacy and personal information. If you have any questions about how we handle user data and personal information, feel free to contact us.
          </p>

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
