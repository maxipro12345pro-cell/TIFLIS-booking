import { Armchair, CalendarDays, Check, Clock, Home, Mail, MapPin, Phone, UsersRound } from 'lucide-react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { LuxuryItem, LuxuryReveal, LuxuryStagger } from '../components/LuxuryMotion.jsx';
import TiflisLogo from '../components/TiflisLogo.jsx';
import { useTranslation } from '../hooks/useTranslation.js';
import { buildGoogleMapsHref, buildPhoneHref } from '../lib/contactLinks.js';

export default function ConfirmationPage() {
  const { state } = useLocation();
  const { copy } = useTranslation();
  const pageCopy = copy.confirmation;

  if (!state?.reservation || !state?.branch) {
    return <Navigate to="/" replace />;
  }

  const selectedTables = state.tables?.length ? state.tables : state.table ? [state.table] : [];
  const tableLabel = selectedTables.length
    ? selectedTables.map((table) => table.number).join(', ')
    : pageCopy.fallbackTable;
  const branchPhone = state.branch.phone ?? '+373 (68) 995 559';
  const branchEmail = state.branch.email ?? 'tiflis.md@gmail.com';
  const branchName = copy.branches[state.branch.slug]?.name ?? state.branch.name;
  const telHref = buildPhoneHref(branchPhone);
  const mapsHref = buildGoogleMapsHref(state.branch.address, state.branch.mapsUrl);

  const summaryRows = [
    { label: pageCopy.rows.branch, value: branchName, icon: MapPin },
    { label: pageCopy.rows.address, value: state.branch.address, icon: Home, href: mapsHref },
    { label: pageCopy.rows.date, value: state.reservation.date, icon: CalendarDays },
    { label: pageCopy.rows.time, value: state.reservation.time, icon: Clock },
    { label: pageCopy.rows.table, value: tableLabel, icon: Armchair },
    { label: pageCopy.rows.guests, value: state.reservation.guests_count, icon: UsersRound },
  ];

  return (
    <main className="confirmation-screen min-h-screen px-4 py-6 text-ink sm:px-6 lg:px-8">
      <nav className="relative z-10 mx-auto mb-8 flex w-full max-w-7xl items-center justify-between text-cream">
        <Link to="/" className="flex items-center gap-3">
          <TiflisLogo className="h-11 w-11" />
          <span className="font-display text-2xl font-semibold tracking-[0.16em]">TIFLIS</span>
        </Link>
        <a href={telHref} className="public-outline-button hidden sm:inline-flex">
          <Phone className="h-4 w-4" aria-hidden="true" />
          {branchPhone}
        </a>
      </nav>

      <section className="relative z-10 mx-auto grid min-h-[calc(100dvh-8rem)] w-full max-w-4xl place-items-center">
        <LuxuryReveal className="confirmation-card-shell w-full" subtle>
          <div className="confirmation-card-core">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-gold/45 bg-gold/10 text-gold">
              <Check className="h-8 w-8" aria-hidden="true" />
            </div>

            <div className="mt-5 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#A92A2D]">{pageCopy.created}</p>
              <h1 className="font-display mt-3 text-4xl font-semibold leading-none tracking-[-0.02em] text-ink sm:text-6xl">
                {pageCopy.title}
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-ink/65">
                {pageCopy.thankYouPrefix}, {state.reservation.name}. {pageCopy.thankYouSuffix}
              </p>
            </div>

            <LuxuryStagger className="confirmation-summary mt-8" delay={0.12}>
              {summaryRows.map((row) => {
                const Icon = row.icon;
                return (
                  <LuxuryItem key={row.label} className="confirmation-row">
                    <div className="flex items-center gap-3 text-ink/58">
                      <Icon className="h-4 w-4 text-gold" aria-hidden="true" />
                      <span>{row.label}</span>
                    </div>
                    {row.href ? (
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noreferrer"
                        className="confirmation-row-link font-semibold text-ink"
                      >
                        {row.value}
                      </a>
                    ) : (
                      <div className="font-semibold text-ink">{row.value}</div>
                    )}
                  </LuxuryItem>
                );
              })}
            </LuxuryStagger>

            <div className="confirmation-contact mt-6 grid gap-3 sm:grid-cols-2">
              <a href={telHref} className="confirmation-contact-item">
                <Phone className="h-4 w-4 text-gold" aria-hidden="true" />
                <span>{branchPhone}</span>
              </a>
              <a href={`mailto:${branchEmail}`} className="confirmation-contact-item">
                <Mail className="h-4 w-4 text-gold" aria-hidden="true" />
                <span>{branchEmail}</span>
              </a>
            </div>

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <a href={telHref} className="public-red-button justify-center">
                <Phone className="h-4 w-4" aria-hidden="true" />
                {pageCopy.call}
              </a>
              <Link to="/" className="public-cream-button justify-center">
                <Home className="h-4 w-4" aria-hidden="true" />
                {pageCopy.home}
              </Link>
            </div>

            <p className="mt-7 border-t border-ink/10 pt-5 text-center text-sm leading-6 text-ink/55">
              {pageCopy.note}
            </p>
          </div>
        </LuxuryReveal>
      </section>
    </main>
  );
}
