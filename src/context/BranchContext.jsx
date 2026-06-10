import { useEffect, useMemo, useState } from 'react';
import { MOCK_BRANCHES } from '../lib/branchSeeds.js';
import { getBranches } from '../lib/branches.js';
import { BranchContext } from './BranchContextValue.js';

const STORAGE_KEY = 'tiflis.currentBranchId';

export function BranchProvider({ children }) {
  const [branches, setBranches] = useState(MOCK_BRANCHES);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [isLoadingBranches, setIsLoadingBranches] = useState(true);
  const [branchError, setBranchError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    getBranches()
      .then((items) => {
        if (!isMounted) return;
        setBranches(items);

        const storedId = localStorage.getItem(STORAGE_KEY);
        const storedBranch = items.find((branch) => branch.id === storedId);
        setCurrentBranch(storedBranch ?? null);
      })
      .catch((error) => {
        if (!isMounted) return;
        setBranchError(error.message);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingBranches(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const selectBranch = (branch) => {
    setCurrentBranch(branch);
    localStorage.setItem(STORAGE_KEY, branch.id);
  };

  const value = useMemo(
    () => ({
      branches,
      currentBranch,
      selectBranch,
      isLoadingBranches,
      branchError,
    }),
    [branchError, branches, currentBranch, isLoadingBranches],
  );

  return <BranchContext.Provider value={value}>{children}</BranchContext.Provider>;
}
