import { fetchAtom, fetchRss } from './feed-fetcher';
import { fetchHatenaBookmarkCounts, fetchFacebookCounts } from './count-fetcher';
import { BlogResponse, ItemResponse, CountResponse } from './responses';
import { FeedType } from '../consts/feed-type';

// 4 parallel fetch
const Parallel = 4;

export function crawl(feedType: FeedType, feedURL: string): [Promise<ItemResponse[]>, Promise<CountResponse[] | undefined>] {
  const fetchingFeed = fetchFeed(feedType, feedURL);
  const fetchingCount = fetchCount(fetchingFeed);
  return [fetchingFeed, fetchingCount];
}

export async function fetchFeed(feedType: FeedType, feedURL: string): Promise<ItemResponse[]> {
  switch (feedType) {
    case FeedType.Atom:
      return fetchAtom(feedURL);
    case FeedType.RSS:
      return fetchRss(feedURL);
    default:
      throw new Error(`Unknown feed type: ${feedType}`);
  }
}

async function fetchCount(fetchingFeed: Promise<ItemResponse[]>): Promise<CountResponse[] | undefined> {
  const itemsResponse = await fetchingFeed;
  if (itemsResponse) {
    const fetchHatenaBookmark = fetchHatenaBookmarkCounts(itemsResponse.map((item: ItemResponse) => item.url));
    const fetchFacebooks = fetchFacebookCounts(itemsResponse.map((item: ItemResponse) => item.url));
    const promises: Promise<void | CountResponse | CountResponse[]>[] =
      ([] as Promise<CountResponse[] | CountResponse>[]).concat(
        [fetchHatenaBookmark], fetchFacebooks).map((p) => p.catch((e: Error) => undefined)
        ); // FIXME: ignore fetch error

    let countResponses: (void | CountResponse | CountResponse[])[] = [];
    for (let i = 0, j = promises.length; i < j; i += Parallel) {
      countResponses = countResponses.concat(await Promise.all(promises.slice(i, i + Parallel)));
    }
    // flatten
    return [].concat.apply([], countResponses).filter((c: CountResponse) => c !== undefined);
  } else {
    return undefined;
  }
}