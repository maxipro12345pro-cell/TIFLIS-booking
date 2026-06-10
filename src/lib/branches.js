import { supabase } from './supabase.js';
import { MOCK_BRANCHES } from './branchSeeds.js';

function enrichBranch(branch) {
  const fallback = MOCK_BRANCHES.find((item) => item.name === branch.name) ?? MOCK_BRANCHES[0];

  return {
    ...fallback,
    ...branch,
    slug: fallback.slug,
    image: fallback.image,
    description: fallback.description,
    email: branch.email ?? fallback.email,
  };
}

export async function getBranches() {
  if (!supabase) {
    return MOCK_BRANCHES;
  }

  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return data
    .map(enrichBranch)
    .sort((left, right) => {
      if (left.name === 'Центр') return -1;
      if (right.name === 'Центр') return 1;
      return left.name.localeCompare(right.name, 'ru');
    });
}

export async function getStaffBranches(userId) {
  if (!supabase) {
    return MOCK_BRANCHES;
  }

  const { data, error } = await supabase
    .from('staff_branches')
    .select('branch:branches(*)')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return data.map((row) => row.branch);
}
