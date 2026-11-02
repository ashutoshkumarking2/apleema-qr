import LegalLayout from '../components/layout/LegalLayout'
import { CONTACT_EMAIL } from '../lib/legal'

export default function Terms() {
  return (
    <LegalLayout title="Terms of Service">
      <p>By using apleema.ai, you agree to these Terms. If you do not agree, please do not use the service.</p>

      <h2>1. Our service</h2>
      <p>apleema.ai lets you create QR codes, choose their design, and view scan analytics. Some features are powered by AI.</p>

      <h2>2. Who can use it</h2>
      <p>The service is only for people who are <b>18 years or older</b>. By creating an account, you confirm that you are 18 or older.</p>

      <h2>3. Your account</h2>
      <p>You are responsible for keeping your login secure. Do not share your password. Tell us immediately if you notice anything suspicious.</p>

      <h2>4. What is not allowed</h2>
      <ul>
        <li>Creating QR codes for phishing, scam or fraudulent links</li>
        <li>Links that spread malware or viruses</li>
        <li>Links to illegal, violent or adult content</li>
        <li>Infringing other people's copyright or trademarks</li>
        <li>Spam or trying to inflate scans with fake traffic</li>
        <li>Trying to break or overload our systems</li>
      </ul>

      <h2>5. Your links</h2>
      <p>You are fully responsible for the links you put in your QR codes. We may check links using safety services, and we may disable a QR code if we think it is harmful or misleading.</p>

      <h2>6. How dynamic QR codes work</h2>
      <p>Our QR codes pass through our short link before taking people to your destination, so that scans can be counted. If your account is closed or deleted, these QR codes will stop working.</p>

      <h2>7. Scan analytics and visitor data</h2>
      <p>We record some anonymous data about people who scan your QR codes (see our Privacy Policy). You will use this data only for analytics, and not to identify or harass anyone. Where the law requires, you are responsible for informing your visitors about this.</p>

      <h2>8. AI features</h2>
      <p>AI suggestions can be wrong or incomplete. Please review them before using them.</p>

      <h2>9. Availability and liability</h2>
      <p>We try to keep the service running, but we do not guarantee it will always be available. To the extent allowed by law, our liability for any loss from using the service is limited.</p>

      <h2>10. Ending your account</h2>
      <p>You can delete your account at any time. If you break these Terms, we may suspend or close your account.</p>

      <h2>11. Governing law</h2>
      <p>These Terms are governed by the laws of India.</p>

      <h2>12. Contact</h2>
      <p>Questions? Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </LegalLayout>
  )
}