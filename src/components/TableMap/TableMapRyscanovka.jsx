const branchId = '22222222-2222-4222-8222';

const zoneBase = {
  gazebo: 100,
  hookah: 200,
  veranda: 300,
  hall: 400,
};

function table(zone, number, x, y, capacity = 4, shape = 'square', mergeGroup = null) {
  const numericNumber = Number.parseInt(number, 10);
  const suffixNumber = Number.isFinite(numericNumber) ? zoneBase[zone] + numericNumber : 7;

  return {
    id: `${branchId}-${String(suffixNumber).padStart(12, '0')}`,
    number: String(number),
    capacity,
    zone,
    mergeGroup,
    x,
    y,
    shape,
  };
}

export const ryscanovkaTables = [
  table('gazebo', 1, 11, 76, 6, 'gazebo-wide', 'gazebo-1'),
  table('gazebo', 2, 9.5, 56, 6, 'gazebo-tall', 'gazebo-2'),
  table('gazebo', 3, 13.5, 25, 4, 'gazebo-square', 'gazebo-3-6'),
  table('gazebo', 4, 8.5, 25, 4, 'gazebo-square', 'gazebo-3-6'),
  table('gazebo', 5, 8.5, 13, 4, 'gazebo-square', 'gazebo-3-6'),
  table('gazebo', 6, 13.5, 13, 4, 'gazebo-square', 'gazebo-3-6'),
  table('gazebo', 7, 26, 16, 8, 'gazebo-wide', 'gazebo-7'),
  table('gazebo', 8, 51.5, 25, 4, 'gazebo-square', 'gazebo-8-11'),
  table('gazebo', 9, 51.5, 13, 4, 'gazebo-square', 'gazebo-8-11'),
  table('gazebo', 10, 61.5, 13, 4, 'gazebo-square', 'gazebo-8-11'),
  table('gazebo', 11, 61.5, 25, 4, 'gazebo-square', 'gazebo-8-11'),
  table('gazebo', 12, 78, 25, 4, 'gazebo-square', 'gazebo-12-15'),
  table('gazebo', 13, 78, 13, 4, 'gazebo-square', 'gazebo-12-15'),
  table('gazebo', 14, 89, 13, 4, 'gazebo-square', 'gazebo-12-15'),
  table('gazebo', 15, 89, 25, 4, 'gazebo-square', 'gazebo-12-15'),
  table('gazebo', 16, 84, 45, 8, 'gazebo-wide', 'gazebo-16-18'),
  table('gazebo', 17, 84, 58, 8, 'gazebo-wide', 'gazebo-16-18'),
  table('gazebo', 18, 84, 72, 8, 'gazebo-wide', 'gazebo-16-18'),
  table('gazebo', 19, 28, 39, 6, 'square', 'gazebo-19'),

  table('hookah', 1, 13, 36, 4, 'hookah-square', 'hookah-1-4'),
  table('hookah', 2, 25, 36, 4, 'hookah-square', 'hookah-1-4'),
  table('hookah', 3, 13, 46, 4, 'hookah-square', 'hookah-1-4'),
  table('hookah', 4, 25, 46, 4, 'hookah-square', 'hookah-1-4'),
  table('hookah', 5, 29, 7, 4, 'hookah-wide', 'hookah-5-8'),
  table('hookah', 6, 62, 7, 4, 'hookah-wide', 'hookah-5-8'),
  table('hookah', 7, 62, 15, 4, 'hookah-wide', 'hookah-5-8'),
  table('hookah', 8, 29, 15, 4, 'hookah-wide', 'hookah-5-8'),
  table('hookah', 9, 68, 34, 4, 'hookah-square', 'hookah-9-12'),
  table('hookah', 10, 79, 34, 4, 'hookah-square', 'hookah-9-12'),
  table('hookah', 11, 68, 45, 4, 'hookah-square', 'hookah-9-12'),
  table('hookah', 12, 79, 45, 4, 'hookah-square', 'hookah-9-12'),
  table('hookah', 13, 68, 65, 8, 'hookah-vertical', 'hookah-13-16'),
  table('hookah', 14, 79, 65, 8, 'hookah-vertical', 'hookah-13-16'),
  table('hookah', 15, 68, 78, 8, 'hookah-vertical', 'hookah-13-16'),
  table('hookah', 16, 79, 78, 8, 'hookah-vertical', 'hookah-13-16'),

  table('veranda', 20, 12, 32, 4, 'tall', 'banquet-top-left'),
  table('veranda', 21, 21, 32, 4, 'tall', 'banquet-top-left'),
  table('veranda', 22, 30, 32, 4, 'tall', 'banquet-top-left'),
  table('veranda', 23, 54, 28, 4, 'tall', 'banquet-top-right'),
  table('veranda', 24, 62, 28, 4, 'tall', 'banquet-top-right'),
  table('veranda', 25, 70, 28, 4, 'tall', 'banquet-top-right'),
  table('veranda', 26, 78, 28, 4, 'tall', 'banquet-top-right'),
  table('veranda', 27, 86, 28, 4, 'tall', 'banquet-top-right'),
  table('veranda', 28, 82, 78, 4, 'tall', 'banquet-top-right'),
  table('veranda', 29, 74, 78, 4, 'tall', 'banquet-top-right'),
  table('veranda', 30, 66, 78, 4, 'tall', 'banquet-top-right'),
  table('veranda', 31, 58, 78, 4, 'tall', 'banquet-top-right'),
  table('veranda', 32, 14, 78, 4, 'tall', 'banquet-top-left'),

  table('hall', 'VIP', 12, 78, 10, 'large', 'hall-vip'),
  table('hall', 40, 52, 34, 4, 'square', 'banquet-center-right'),
  table('hall', 41, 63, 34, 4, 'square', 'banquet-center-right'),
  table('hall', 42, 74, 34, 4, 'square', 'banquet-center-right'),
  table('hall', 50, 49, 84, 4, 'square', 'banquet-bottom-right'),
  table('hall', 51, 58, 84, 4, 'square', 'banquet-bottom-right'),
  table('hall', 52, 67, 84, 4, 'square', 'banquet-bottom-right'),
  table('hall', 53, 76, 84, 4, 'square', 'banquet-bottom-right'),
  table('hall', 54, 85, 84, 4, 'square', 'banquet-bottom-right'),
  table('hall', 60, 12, 32, 4, 'square', 'banquet-left-middle'),
  table('hall', 61, 22, 32, 4, 'square', 'banquet-left-middle'),
  table('hall', 70, 12, 47, 4, 'square', 'banquet-left-middle'),
  table('hall', 71, 22, 47, 4, 'square', 'banquet-left-middle'),
  table('hall', 80, 88, 56, 8, 'wide', 'hall-80'),
];
