import { Flame, HeartHandshake, MapPin, Wine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BranchCard from '../components/BranchCard.jsx';
import { LuxuryItem, LuxuryReveal, LuxuryStagger } from '../components/LuxuryMotion.jsx';
import { useBranch } from '../hooks/useBranch.js';
import { useTranslation } from '../hooks/useTranslation.js';

const FEATURES = [
  Flame,
  MapPin,
  Wine,
  HeartHandshake,
];

export default function BranchSelectPage() {
  const navigate = useNavigate();
  const { branches, selectBranch, isLoadingBranches, branchError } = useBranch();
  const { copy } = useTranslation();
  const pageCopy = copy.branchSelect;

  const handleSelectBranch = (branch) => {
    if (branch.slug === 'center') return;

    selectBranch(branch);
    navigate('/booking');
  };

  return (
    <main className="public-flow min-h-screen overflow-x-hidden text-cream">
      <section id="booking" className="branch-select-section relative min-h-screen bg-[#171310] px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <LuxuryReveal className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#FF7A6F]">{pageCopy.eyebrow}</p>
              <h2 className="font-display mt-3 text-4xl font-semibold tracking-[-0.02em] text-cream sm:text-6xl">
                {pageCopy.title}
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-7 text-cream/66">
              {pageCopy.intro}
            </p>
          </LuxuryReveal>

          {branchError ? (
            <div className="mb-6 rounded-2xl border border-[#A92A2D]/35 bg-[#A92A2D]/10 px-4 py-3 text-sm text-cream">
              {pageCopy.loadError} {branchError}
            </div>
          ) : null}

          {isLoadingBranches ? (
            <div className="grid gap-6 lg:grid-cols-2">
              {[0, 1].map((item) => (
                <div key={item} className="h-[560px] animate-pulse rounded-[2rem] bg-cream/8 ring-1 ring-cream/10" />
              ))}
            </div>
          ) : (
            <LuxuryStagger id="contacts" className="grid gap-6 lg:grid-cols-2" delay={0.1}>
              {branches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  branch={branch}
                  onSelect={handleSelectBranch}
                  selectLabel={pageCopy.chooseBranch}
                  inactive={branch.slug === 'center'}
                  inactiveLabel={pageCopy.centerInactiveLabel}
                  inactiveText={pageCopy.centerInactiveText}
                  className={branch.slug === 'ryscanovka' ? 'order-first lg:order-none' : ''}
                />
              ))}
            </LuxuryStagger>
          )}

          <LuxuryStagger className="mt-10 grid gap-3 md:grid-cols-4" delay={0.18}>
            {pageCopy.features.map((feature, index) => {
              const Icon = FEATURES[index];
              return (
                <LuxuryItem key={feature.label} className="public-feature">
                  <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-cream">{feature.label}</p>
                    <p className="mt-1 text-sm text-cream/58">{feature.detail}</p>
                  </div>
                </LuxuryItem>
              );
            })}
          </LuxuryStagger>
        </div>
      </section>
    </main>
  );
}
