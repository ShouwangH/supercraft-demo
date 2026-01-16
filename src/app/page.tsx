import Link from 'next/link';

export default function Home() {
  return (
    <main className="home-page">
      <div className="home-page__container">
        <h1 className="home-page__title">Supercraft Demo</h1>
        <p className="home-page__subtitle">
          Photo-to-2.5D Product Placement
        </p>

        <Link href="/upload" className="home-page__cta">
          Get Started
        </Link>
      </div>
    </main>
  );
}
