interface NavProps {
  route: string;
}

const LINKS = [
  { href: '#/', label: 'Check-in' },
  { href: '#/dashboard', label: 'Dashboard' },
  { href: '#/history', label: 'History' },
  { href: '#/settings', label: 'Settings' },
];

export default function Nav({ route }: NavProps) {
  const active = (href: string) =>
    href === '#/'
      ? route === '#/' || route === '' || route === '#'
      : route === href;

  return (
    <nav className="nav" aria-label="Main navigation">
      {LINKS.map(({ href, label }) => (
        <a
          key={href}
          href={href}
          className={active(href) ? 'nav-item active' : 'nav-item'}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
