import TheMovieDb from '@server/api/themoviedb';
import { getSettings } from '@server/lib/settings';
import logger from '@server/logger';

interface FilterableResult {
  id: number;
  media_type?: string;
  original_language?: string;
  origin_country?: string[] | string;
}

interface ContentFilter {
  languages: Set<string>;
  countries: Set<string>;
}

const parseList = (value: string | undefined): string[] =>
  (value ?? '')
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

export const getContentFilter = (): ContentFilter => {
  const settings = getSettings();

  return {
    languages: new Set(
      parseList(settings.main.excludedLanguages).map((l) => l.toLowerCase())
    ),
    countries: new Set(
      parseList(settings.main.excludedCountries).map((c) => c.toUpperCase())
    ),
  };
};

/**
 * Whether every language in a TMDB `with_original_language` value is hidden,
 * in which case there is no point in querying TMDB at all.
 */
export const isOnlyExcludedLanguages = (value: string | undefined): boolean => {
  const languages = (value ?? '')
    .split(/[|,]/)
    .map((language) => language.trim().toLowerCase())
    .filter(Boolean);

  if (!languages.length) {
    return false;
  }

  const filter = getContentFilter();

  return languages.every((language) => filter.languages.has(language));
};

const toCountryList = (value: string[] | string | undefined): string[] =>
  (Array.isArray(value) ? value : value ? [value] : []).map((c) =>
    c.toUpperCase()
  );

/**
 * Removes movies, TV shows and collections whose original language is
 * excluded, or whose origin countries are all excluded, in the global
 * settings. People are kept.
 *
 * TMDB list results for movies do not include an origin country, so when
 * countries are excluded the (cached) movie details are looked up instead.
 * If that lookup fails, the movie is kept.
 */
export const filterExcludedMedia = async <T extends FilterableResult>(
  results: T[],
  defaultMediaType?: 'movie' | 'tv'
): Promise<T[]> => {
  const filter = getContentFilter();

  if (!filter.languages.size && !filter.countries.size) {
    return results;
  }

  const tmdb = new TheMovieDb();

  const keep = await Promise.all(
    results.map(async (result) => {
      const mediaType = result.media_type ?? defaultMediaType;

      if (mediaType === 'person') {
        return true;
      }

      if (
        result.original_language &&
        filter.languages.has(result.original_language.toLowerCase())
      ) {
        return false;
      }

      if (!filter.countries.size || mediaType === 'collection') {
        return true;
      }

      let countries = toCountryList(result.origin_country);

      if (!countries.length && mediaType === 'movie') {
        try {
          countries = toCountryList(
            await tmdb.getMovieOriginCountries({ movieId: result.id })
          );
        } catch (e) {
          logger.debug('Unable to determine origin country for movie', {
            label: 'Content Filter',
            movieId: result.id,
            errorMessage: e.message,
          });
        }
      }

      // Co-productions are only hidden when every origin country is hidden
      return (
        !countries.length ||
        !countries.every((country) => filter.countries.has(country))
      );
    })
  );

  return results.filter((_, index) => keep[index]);
};

/**
 * Same as filterExcludedMedia, for paginated TMDB responses.
 */
export const filterExcludedResults = async <
  T extends { results: FilterableResult[] },
>(
  data: T,
  defaultMediaType?: 'movie' | 'tv'
): Promise<T> => ({
  ...data,
  results: (await filterExcludedMedia(
    data.results,
    defaultMediaType
  )) as T['results'],
});
