import { Navigate, useNavigate } from 'react-router-dom';
import BranchCard from '../components/BranchCard.jsx';
import { useBranch } from '../hooks/useBranch.js';
import { useTranslation } from '../hooks/useTranslation.js';
import { hasHostessAccess } from '../lib/hostessAccess.js';

export default function HostessBranchSelect() {
  const navigate = useNavigate();
  const { branches, selectBranch } = useBranch();
  const { copy } = useTranslation();
  const hostessCopy = copy.hostess;

  if (!hasHostessAccess()) {
    return <Navigate to="/hostess" replace />;
  }

  return (
    <main className="hostess-branch-select-screen min-h-screen px-4 py-8 text-ink sm:px-6 lg:px-8">
      <section className="mx-auto max-w-7xl">
        <header className="hostess-branch-select-header mb-6 rounded-2xl p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-wine">{hostessCopy.panel}</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{hostessCopy.chooseBranch}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-ink/62">{copy.branchSelect.intro}</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          {branches.map((branch) => (
            <BranchCard
              key={branch.id}
              branch={branch}
              className={`hostess-branch-card ${branch.slug === 'ryscanovka' ? 'order-first lg:order-none' : ''}`}
              onSelect={(selectedBranch) => {
                selectBranch(selectedBranch);
                navigate('/hostess/dashboard');
              }}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
