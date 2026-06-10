import { ArrowRight, Clock, Mail, MapPin, Phone } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../hooks/useTranslation.js';
import { buildGoogleMapsHref, buildPhoneHref } from '../lib/contactLinks.js';
import TiflisLogo from './TiflisLogo.jsx';

function formatWorkingHours(workingHours, labels) {
  if (!workingHours) return labels.hoursUnknown;

  const values = Object.values(workingHours);
  const allSameHours = values.length > 0 && values.every((hours) => hours === values[0]);

  if (allSameHours) {
    return `${labels.everyDay}: ${values[0]}`;
  }

  return Object.entries(workingHours)
    .map(([day, hours]) => `${labels.days[day] ?? day}: ${hours}`)
    .join(' · ');
}

export default function BranchCard({ branch, onSelect, selectLabel, className = '' }) {
  const { copy } = useTranslation();
  const branchCopy = copy.branches[branch.slug] ?? {};
  const branchName = branchCopy.name ?? branch.name;
  const branchDescription = branchCopy.description ?? branch.description;
  const buttonLabel = selectLabel ?? copy.branchCard.select;
  const mapsHref = buildGoogleMapsHref(branch.address, branch.mapsUrl);
  const phoneHref = buildPhoneHref(branch.phone);

  return (
    <motion.article
      className={`branch-card-shell group ${className}`}
      variants={{
        hidden: { opacity: 0, y: 18 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.64, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      whileHover={{ y: -4, scale: 1.01 }}
    >
      <div className="branch-card-core">
        <motion.button
          type="button"
          onClick={() => onSelect(branch)}
          aria-label={`${buttonLabel}: ${branchName}`}
          className="branch-card-media branch-card-media-button relative min-h-[19rem] overflow-hidden rounded-[1.55rem]"
          whileTap={{ scale: 0.99 }}
        >
          <img
            src={branch.image}
            alt={`${copy.branchCard.hallAlt} ${branchName}`}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="branch-card-image h-full min-h-[19rem] w-full object-cover transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,14,12,0.08)_0%,rgba(18,14,12,0.42)_46%,rgba(18,14,12,0.92)_100%)]" />
          <div className="absolute left-5 top-5 grid h-14 w-14 place-items-center rounded-2xl border border-cream/20 bg-ink/45">
            <TiflisLogo className="h-10 w-10 text-cream" />
          </div>
          <div className="absolute inset-x-0 bottom-0 p-6">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-gold">TIFLIS</p>
            <h2 className="font-display mt-2 text-5xl font-semibold leading-none text-cream sm:text-6xl">
              {branchName}
            </h2>
          </div>
        </motion.button>

        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="max-w-prose text-[15px] leading-7 text-cream/72">{branchDescription}</p>

          <div className="mt-6 space-y-3.5 text-sm text-cream/76">
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="branch-card-detail branch-card-detail-link"
            >
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{branch.address}</span>
            </a>
            <div className="branch-card-detail">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
              <span>{formatWorkingHours(branch.working_hours, copy.branchCard)}</span>
            </div>
            {branch.phone ? (
              <a href={phoneHref} className="branch-card-detail branch-card-detail-link">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>{branch.phone}</span>
              </a>
            ) : null}
            {branch.email ? (
              <div className="branch-card-detail">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
                <span>{branch.email}</span>
              </div>
            ) : null}
          </div>

          <motion.button
            type="button"
            onClick={() => onSelect(branch)}
            className="public-red-button mt-7 w-full justify-center"
            whileTap={{ scale: 0.98 }}
          >
            {buttonLabel}
            <span className="public-button-icon">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}
