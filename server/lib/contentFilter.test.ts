import TheMovieDb from '@server/api/themoviedb';
import {
  filterExcludedMedia,
  filterExcludedResults,
  isOnlyExcludedLanguages,
} from '@server/lib/contentFilter';
import { getSettings } from '@server/lib/settings';
import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';

let movieCountries: Record<number, string[]> = {};
let movieLookups: number[] = [];

Object.defineProperty(TheMovieDb.prototype, 'getMovieOriginCountries', {
  get() {
    return async ({ movieId }: { movieId: number }) => {
      movieLookups.push(movieId);
      if (!(movieId in movieCountries)) {
        throw new Error('not found');
      }
      return movieCountries[movieId];
    };
  },
  set() {},
  configurable: true,
});

const setFilter = (excludedLanguages: string, excludedCountries: string) => {
  const settings = getSettings();
  settings.main.excludedLanguages = excludedLanguages;
  settings.main.excludedCountries = excludedCountries;
};

describe('content filter', () => {
  beforeEach(() => {
    movieCountries = {};
    movieLookups = [];
    setFilter('', '');
  });

  it('returns results untouched when no filter is configured', async () => {
    const results = [{ id: 1, media_type: 'movie', original_language: 'zh' }];

    assert.equal(await filterExcludedMedia(results), results);
  });

  it('removes media with an excluded original language', async () => {
    setFilter('zh|hi', '');

    const results = await filterExcludedMedia([
      { id: 1, media_type: 'movie', original_language: 'zh' },
      { id: 2, media_type: 'tv', original_language: 'HI' },
      { id: 3, media_type: 'movie', original_language: 'en' },
      { id: 4, media_type: 'collection', original_language: 'zh' },
    ]);

    assert.deepEqual(
      results.map((r) => r.id),
      [3]
    );
    assert.equal(movieLookups.length, 0);
  });

  it('removes TV shows by origin country without extra lookups', async () => {
    setFilter('', 'CN|IN');

    const results = await filterExcludedMedia(
      [
        { id: 1, original_language: 'en', origin_country: ['US'] },
        { id: 2, original_language: 'en', origin_country: ['in'] },
      ],
      'tv'
    );

    assert.deepEqual(
      results.map((r) => r.id),
      [1]
    );
    assert.equal(movieLookups.length, 0);
  });

  it('only removes co-productions when every origin country is excluded', async () => {
    setFilter('', 'CN|HK');

    const results = await filterExcludedMedia(
      [
        { id: 1, original_language: 'en', origin_country: ['CN', 'US'] },
        { id: 2, original_language: 'cn', origin_country: ['HK', 'CN'] },
        { id: 3, original_language: 'en', origin_country: [] },
      ],
      'tv'
    );

    assert.deepEqual(
      results.map((r) => r.id),
      [1, 3]
    );
  });

  it('looks up movie origin countries when not in the result', async () => {
    setFilter('', 'CN');
    movieCountries = { 1: ['CN'], 2: ['US'] };

    const results = await filterExcludedMedia(
      [
        { id: 1, original_language: 'en' },
        { id: 2, original_language: 'en' },
        // Lookup fails: keep it
        { id: 3, original_language: 'en' },
      ],
      'movie'
    );

    assert.deepEqual(
      results.map((r) => r.id),
      [2, 3]
    );
    assert.deepEqual(movieLookups.sort(), [1, 2, 3]);
  });

  it('never removes people', async () => {
    setFilter('zh', 'CN');

    const data = await filterExcludedResults({
      page: 1,
      total_pages: 1,
      total_results: 2,
      results: [
        { id: 1, media_type: 'person' },
        { id: 2, media_type: 'tv', original_language: 'zh' },
      ],
    });

    assert.deepEqual(
      data.results.map((r) => r.id),
      [1]
    );
    assert.equal(data.total_results, 2);
  });

  it('detects requests for hidden languages only', () => {
    setFilter('zh|cn', '');

    assert.equal(isOnlyExcludedLanguages(undefined), false);
    assert.equal(isOnlyExcludedLanguages(''), false);
    assert.equal(isOnlyExcludedLanguages('zh'), true);
    assert.equal(isOnlyExcludedLanguages('zh|cn'), true);
    assert.equal(isOnlyExcludedLanguages('zh|ja'), false);
  });
});
