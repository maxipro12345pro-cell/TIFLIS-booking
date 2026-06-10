import { ChevronDown, Store } from 'lucide-react';
import { useBranch } from '../hooks/useBranch.js';

export default function BranchSwitcher() {
  const { branches, currentBranch, selectBranch } = useBranch();

  return (
    <label className="relative inline-flex min-h-11 items-center gap-2 rounded-lg border border-ink/10 bg-cream px-3 py-2 text-sm text-ink shadow-sm transition focus-within:ring-2 focus-within:ring-wine focus-within:ring-offset-2 focus-within:ring-offset-linen">
      <Store className="h-4 w-4 text-wine" aria-hidden="true" />
      <select
        value={currentBranch?.id ?? ''}
        onChange={(event) => {
          const branch = branches.find((item) => item.id === event.target.value);
          if (branch) selectBranch(branch);
        }}
        className="appearance-none bg-transparent pr-7 font-medium outline-none"
        aria-label="Выбрать филиал"
      >
        {branches.map((branch) => (
          <option key={branch.id} value={branch.id}>
            {branch.name}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 h-4 w-4 text-ink/60" />
    </label>
  );
}
