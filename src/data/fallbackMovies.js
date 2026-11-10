// Demo data used only when no TMDB credentials are configured.
// Ratings and counts are approximate and exist solely to demonstrate the interface.
const movie = (id, title, release_date, genre_ids, vote_average, popularity, overview, extra = {}) => ({
  id,
  title,
  release_date,
  genre_ids,
  vote_average,
  vote_count: 1000,
  popularity,
  overview,
  poster_path: null,
  backdrop_path: null,
  ...extra,
});

export const DEMO_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 14, name: 'Fantasy' },
  { id: 10751, name: 'Family' },
  { id: 36, name: 'History' },
  { id: 10752, name: 'War' },
  { id: 27, name: 'Horror' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
];

export const DEMO_MOVIES = [
  movie(603, 'The Matrix', '1999-03-30', [28, 878], 8.2, 90, 'A hacker learns that reality is a simulation and joins a rebellion against its controllers.', { runtime: 136, tagline: 'Welcome to the Real World.' }),
  movie(157336, 'Interstellar', '2014-11-05', [12, 18, 878], 8.4, 120, 'Explorers travel through a wormhole in search of a new home for humanity.', { runtime: 169, tagline: 'Mankind was born on Earth. It was never meant to die here.' }),
  movie(27205, 'Inception', '2010-07-15', [28, 878, 12], 8.4, 110, 'A thief who steals secrets through dreams is offered a chance to plant an idea instead.', { runtime: 148, tagline: 'Your mind is the scene of the crime.' }),
  movie(238, 'The Godfather', '1972-03-14', [18, 80], 8.7, 80, 'The aging patriarch of a crime dynasty hands control to his reluctant youngest son.', { runtime: 175 }),
  movie(496243, 'Parasite', '2019-05-30', [35, 53, 18], 8.5, 85, 'A poor family schemes its way into the lives of a wealthy household.', { runtime: 133, original_language: 'ko' }),
  movie(155, 'The Dark Knight', '2008-07-16', [18, 28, 80, 53], 8.5, 130, 'Batman faces the Joker, a criminal mastermind who pushes Gotham toward chaos.', { runtime: 152 }),
  movie(129, 'Spirited Away', '2001-07-20', [16, 10751, 14], 8.5, 70, 'A girl wanders into a world of spirits and must work to free her parents.', { runtime: 125, original_language: 'ja' }),
  movie(680, 'Pulp Fiction', '1994-09-10', [53, 80], 8.5, 75, 'Intertwined stories of hitmen, a boxer and a gangster\'s wife in Los Angeles.', { runtime: 154 }),
  movie(424, 'Schindler\'s List', '1993-12-15', [18, 36, 10752], 8.6, 60, 'A businessman saves over a thousand Jewish people during the Holocaust.', { runtime: 195 }),
  movie(98, 'Gladiator', '2000-05-01', [28, 18, 12], 8.2, 72, 'A betrayed Roman general returns as a gladiator to avenge his family.', { runtime: 155 }),
  movie(329865, 'Arrival', '2016-11-10', [18, 878, 9648], 7.6, 65, 'A linguist is recruited to communicate with visitors who have landed on Earth.', { runtime: 116 }),
  movie(274, 'The Silence of the Lambs', '1991-02-14', [80, 18, 53, 27], 8.3, 66, 'A trainee FBI agent consults an imprisoned killer to catch another.', { runtime: 119 }),
  movie(120467, 'The Grand Budapest Hotel', '2014-02-26', [35, 18], 8.0, 68, 'A legendary concierge and his lobby boy are drawn into the theft of a priceless painting.', { runtime: 100 }),
  movie(11036, 'The Notebook', '2004-06-25', [10749, 18], 7.9, 55, 'A man reads an old love story to a woman with memory loss.', { runtime: 123 }),
  movie(4935, 'Howl\'s Moving Castle', '2004-11-20', [16, 10749, 14], 8.4, 58, 'A young woman cursed to look old takes refuge in a wizard\'s walking castle.', { runtime: 119, original_language: 'ja' }),
  movie(694, 'The Shining', '1980-05-23', [27, 53], 8.2, 62, 'A writer and his family are isolated in a haunted mountain hotel for the winter.', { runtime: 146 }),
];
