import LegalLayout from '../components/layout/LegalLayout'
import { CONTACT_EMAIL } from '../lib/legal'

export default function Privacy() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        apleema.ai (we, us) is a service for creating QR codes and viewing scan analytics. This policy explains how we collect, use and protect your data. We follow India's Digital Personal Data Protection (DPDP) Act, 2023. Under this law, we are a Data Fiduciary and you are a Data Principal.
      </p>

      <h2>1. What data we collect</h2>
      <ul>
        <li><b>Account data:</b> your name, email, profile photo (from Google or GitHub login), and which login method you used.</li>
        <li><b>QR data:</b> the links you put in QR codes, and the QR design.</li>
        <li><b>Scan data (about people who scan a QR code):</b> device type, operating system, browser, approximate country and city, scan time, and a hashed identifier. We do not collect the visitor's name, phone number or exact location, and we do not store raw IP addresses.</li>
      </ul>

      <h2>2. Why we collect it</h2>
      <ul>
        <li>To create your account and let you log in</li>
        <li>To create QR codes and show scan analytics</li>
        <li>To prevent phishing, spam and misuse</li>
        <li>To respond to your questions</li>
      </ul>
      <p>We collect only what is needed for these purposes.</p>

      <h2>3. Your consent</h2>
      <p>We process your data based on the consent you give at signup. You can withdraw consent at any time. If you do, we will delete your account and data, unless the law requires us to keep it.</p>

      <h2>4. How long we keep data</h2>
      <ul>
        <li>Account data: as long as your account is active</li>
        <li>Scan logs: up to 12 months, then deleted automatically</li>
        <li>When you delete your account: your data is removed, except where the law requires otherwise</li>
      </ul>

      <h2>5. Who we share data with</h2>
      <p>We do not sell your data. These providers help us run the service:</p>
      <ul>
        <li>Google Firebase and GitHub: for login</li>
        <li>Google Gemini: for AI design suggestions (only the text you give the AI)</li>
        <li>Hosting and database providers: to store data</li>
      </ul>

      <h2>6. Your rights</h2>
      <ul>
        <li><b>Access:</b> know what data we hold about you</li>
        <li><b>Correction:</b> fix incorrect data</li>
        <li><b>Erasure:</b> have your data deleted</li>
        <li><b>Grievance:</b> raise a complaint</li>
        <li><b>Nominate:</b> name someone to exercise your rights in case of your death or incapacity</li>
      </ul>
      <p>To use these rights, write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>

      <h2>7. Children</h2>
      <p>Our service is not for people under 18. If we learn that a child has created an account, we will delete it.</p>

      <h2>8. Security and data breaches</h2>
      <p>We take reasonable steps to keep your data safe. If a data breach happens, we will inform the Data Protection Board of India and affected users as required by law.</p>

      <h2>9. Grievances</h2>
      <p>For any concern about your data, write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We will reply within the time limits set by law. If you are not satisfied with our response, you can approach the Data Protection Board of India.</p>

      <h2>10. Changes</h2>
      <p>This policy may change. For important changes, we will notify you and ask for fresh consent where needed.</p>
    </LegalLayout>
  )
}