import { BlogResponse, ItemResponse } from './responses';
import FeedType from '../consts/feed-type';

export async function fetchBlog(blogURL: string): Promise<BlogResponse> {
  const response = await fetch('https://query.yahooapis.com/v1/public/yql?format=json&q=' + encodeURIComponent('select * from htmlstring where url = \'' + blogURL + '\'') + '&env=' + encodeURIComponent('store://datatables.org/alltableswithkeys'));
  const json: YahooAPIs.HTMLString.Response = await response.json();
  const htmlText = json.query.results.result;

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlText, 'text/html');
  const snapshots = doc.evaluate('/html/head/link[@rel=\'alternate\']', doc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

  // prefer Atom than RSS
  let type: FeedType | undefined;
  let href: string | undefined;
  for (let i = 0; i < snapshots.snapshotLength || type === FeedType.Atom; i++) {
    const item = snapshots.snapshotItem(i) as HTMLAnchorElement;
    href = item.href;
    switch (item.type) {
      case 'application/atom+xml':
        type = FeedType.Atom;
        break;
      case 'application/rss+xml':
        type = FeedType.RSS;
        break;
      default:
        break;
    }
  }
  if (!href) {
    throw new Error('Feed not found: ' + blogURL);
  }
  if (!type) {
    throw new Error('Feed type unknown: ' + blogURL);    
  }
  return new BlogResponse(doc.title, blogURL, href, type);
}

export async function fetchAtom(atomUrl: string): Promise<ItemResponse[]> {
  const response = await fetch('https://query.yahooapis.com/v1/public/yql?format=json&q=' + encodeURIComponent('select * from atom(100) where url = \'' + atomUrl + '\''));
  const json: YahooAPIs.Atom.Response = await response.json();
  return json.query.results.entry
    .map((entry) => new ItemResponse(entry.title, entry.link[0].href, entry.published));
}

export async function fetchRss(rssUrl: string): Promise<ItemResponse[]> {
  const response = await fetch('https://query.yahooapis.com/v1/public/yql?format=json&q=' + encodeURIComponent('select * from rss(100) where url = \'' + rssUrl + '\''));
  const json: YahooAPIs.RSS.Response = await response.json();
  return json.query.results.item
    .map((item) => new ItemResponse(item.title, item.link, item.pubDate));
}

namespace YahooAPIs {
  export namespace Atom {
    export type Response = {
      query: Query;
      created: Date;
      count: number;
      lang: string;
    };
    export type Query  = {
      results: Results;
    };
    export type Results = {
      entry: Entry[];
    };
    export type Entry = {
      title: string;
      link: Link[];
      published: Date;
    };
    export type Link = {
      href: string;
    };
  }

  export namespace RSS {
    export type Response = {
      query: Query;
      created: Date;
      count: number;
      lang: string;
    };
    export type Query = {
      results: Results;
    };
    export type Results = {
      item: Item[];
    };
    export type Item = {
      title: string;
      link: string;
      pubDate: Date;
    };
  }

  export namespace HTMLString {
    export type Response = {
      query: Query;
      created: Date;
      count: number;
      lang: string;
    };
    export type Query = {
      results: Results;
    };
    export type Results = {
      result: string;
    };
  }
}
