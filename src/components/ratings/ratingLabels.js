export const RATING_LABELS = {
  0.5: 'Awful', 1: 'Poor', 1.5: 'Weak', 2: 'Below average', 2.5: 'Mixed', 3: 'Decent', 3.5: 'Good', 4: 'Great', 4.5: 'Excellent', 5: 'Masterpiece',
};
export const ratingLabel = (v) => (v ? `${v} / 5 · ${RATING_LABELS[v] || ''}` : 'Not rated');
