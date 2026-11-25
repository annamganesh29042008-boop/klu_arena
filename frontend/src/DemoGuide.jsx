import { Link } from 'react-router-dom';

const modules = [
  {
    number: '01',
    title: 'USER MODULE',
    description: 'Player registration, login, profile details, tournament listings and announcements.',
    features: ['Create a player account', 'Sign in and sign out', 'View player dashboard and profile', 'Browse published tournaments'],
    action: 'Open user registration',
    to: '/signup',
  },
  {
    number: '02',
    title: 'ADMIN MODULE',
    description: 'Admin control room for managing players and publishing arena updates.',
    features: ['View registered users', 'Enable or disable player accounts', 'Create tournaments and prize pools', 'Publish announcements'],
    action: 'Open admin login',
    to: '/login',
  },
];

export default function DemoGuide() {
  return (
    <main className="container page demo-page">
      <p className="eyebrow">PROJECT PRESENTATION · KLU ARENA</p>
      <h1>MODULE <em>DEMO.</em></h1>
      <p className="hero-copy">A quick presentation guide for the User Module and Admin Module. Use the links below to open the actual application screens.</p>
      <div className="demo-grid">
        {modules.map((module) => (
          <section className="panel demo-card" key={module.number}>
            <span className="tag">MODULE {module.number}</span>
            <h2>{module.title}</h2>
            <p>{module.description}</p>
            <ul>{module.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <Link className="button primary" to={module.to}>{module.action} →</Link>
          </section>
        ))}
      </div>
      <section className="panel demo-steps section">
        <h2>TEACHER DEMONSTRATION FLOW</h2>
        <ol>
          <li>Open User Registration and create a normal player account.</li>
          <li>Sign in and show the player profile, dashboard and tournament list.</li>
          <li>Sign out, then sign in with an administrator account.</li>
          <li>Show the Admin Console: create a tournament, publish an announcement and manage player status.</li>
        </ol>
        <p className="hint">Admin access is assigned to email addresses configured in <code>VITE_ADMIN_EMAILS</code> when an account is registered. Set this value in the project's <code>.env</code> file, then restart the Vite server.</p>
        <Link className="button ghost" to="/">Back to KLU Arena home</Link>
      </section>
    </main>
  );
}
