import logo from '../assets/logo.png'
import { Link } from 'react-router-dom'

function LandingPage() {
  return (
    <main className="landing-page">
      <section className="hero-card">
        <img src={logo} alt="Подготви-ме лого" className="logo-img" />

        <p className="hero-text">
          Иновативна платформа за подготовка по математика за НВО в 7. клас.
        </p>

        <Link to="/auth" className="start-button">
            Започни подготовка
        </Link>
      </section>
    </main>
  )
}

export default LandingPage