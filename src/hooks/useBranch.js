import { useContext } from 'react';
import { BranchContext } from '../context/BranchContextValue.js';

export function useBranch() {
  const context = useContext(BranchContext);

  if (!context) {
    throw new Error('useBranch должен использоваться внутри BranchProvider');
  }

  return context;
}
