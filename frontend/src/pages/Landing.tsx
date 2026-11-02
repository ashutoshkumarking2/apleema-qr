import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Hero from '../components/landing/Hero'
import FeatureCards from '../components/landing/FeatureCards'
import UseCases from '../components/landing/UseCases'
import Pricing from '../components/landing/Pricing'

export default function Landing() {
  return (
    <div className="dots-bg relative min-h-screen overflow-hidden bg-[#09090b] text-white">
      <Navbar />
      <main>
        <Hero />
        <FeatureCards />
        <UseCases />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}