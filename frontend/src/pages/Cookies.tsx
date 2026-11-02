import LegalLayout from '../components/layout/LegalLayout'
import { CONTACT_EMAIL } from '../lib/legal'

export default function Cookies() {
  return (
    <LegalLayout title="Cookie Policy">
      <p>Cookies and browser storage are small pieces of data saved in your browser. This policy explains how apleema.ai uses them.</p>

      <h2>1. What we use (all essential)</h2>
      <ul>
        <li><b>Login session (Firebase):</b> keeps you logged in</li>
        <li><b>apleema_consent:</b> remembers your consent</li>
        <li><b>apleema_cookie_choice:</b> remembers your cookie choice</li>
      </ul>

      <h2>2. Third parties</h2>
      <ul>
        <li><b>Google Fonts:</b> our fonts load from Google's servers, so your IP address reaches Google when fonts load</li>
        <li><b>Google and GitHub login:</b> when you log in with them, they handle data under their own policies</li>
      </ul>

      <h2>3. Analytics and advertising cookies</h2>
      <p>We do not currently use any advertising or tracking cookies. If we add them in future, we will ask you first.</p>

      <h2>4. For people who scan QR codes</h2>
      <p>For scan analytics we use a hashed identifier instead of a cookie. It does not contain your name or raw IP address.</p>

      <h2>5. Your choices</h2>
      <ul>
        <li>Click <b>Cookie settings</b> in the footer to change your choice at any time</li>
        <li>You can delete cookies and storage in your browser settings. This will log you out.</li>
      </ul>

      <h2>6. Contact</h2>
      <p>Questions? Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </LegalLayout>
  )
}