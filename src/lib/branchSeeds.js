export const BRANCH_SLUGS = {
  CENTER: 'center',
  RYSCANOVKA: 'ryscanovka',
};

const DAILY_HOURS = {
  mon: '11:00-23:00',
  tue: '11:00-23:00',
  wed: '11:00-23:00',
  thu: '11:00-23:00',
  fri: '11:00-23:00',
  sat: '11:00-23:00',
  sun: '11:00-23:00',
};

export const MOCK_BRANCHES = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    slug: BRANCH_SLUGS.CENTER,
    name: 'Центр',
    address: 'str. Columna 104, Chisinau',
    mapsUrl: 'https://maps.app.goo.gl/S8QEgEeb9pkQtaCt8',
    phone: '+373 (68) 995 559',
    email: 'tiflis.md@gmail.com',
    working_hours: DAILY_HOURS,
    image: '/branches/tiflis-center.webp',
    description:
      'TIFLIS в центре Кишинёва: тёплая грузинская атмосфера, винные акценты и залы для ужина, встреч и праздников.',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    slug: BRANCH_SLUGS.RYSCANOVKA,
    name: 'Рышкановка',
    address: 'Strada Studenților 1/6, Chișinău',
    mapsUrl: 'https://maps.app.goo.gl/wnJR8b5VbeCPRiH1A',
    phone: '+373 (68) 575 557',
    email: 'tiflis.md@gmail.com',
    working_hours: DAILY_HOURS,
    image: '/branches/tiflis-ryscanovka.webp',
    description:
      'Филиал на Рышкановке с домашним грузинским характером, семейными столами и уютной посадкой на каждый день.',
  },
];

export function getBranchById(branchId) {
  return MOCK_BRANCHES.find((branch) => branch.id === branchId);
}
