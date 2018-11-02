import * as firebase from 'firebase/app';
import 'firebase/auth';

import { Dispatch, Action, ActionCreator } from 'redux';

import { ItemEntity, CountEntity } from '../../models/entities';
import { fetchUser, fetchOrCurrenUser } from './user-action';
import { CountType } from '../../consts/count-type';
import { findBlog, saveBlog } from '../../models/repositories/blog-repository';
import { findAllItems, saveItemBatch, CountSaveEntities } from '../../models/repositories/item-repository';
import { crawl } from '../../models/crawler';
import { BlogResponse, ItemResponse, CountResponse } from '../../models/responses';
import { writeBatch } from '../../models/repositories/app-repository';
import { ThunkAction, ThunkDispatch } from 'redux-thunk';
import { AppState } from '../states/app-state';

export interface FeedBlogURLChangeAction extends Action {
  type: 'FeedBlogURLChangeAction';
  blogURL: string;
}

export function feedBlogURLChange(blogURL: string): FeedBlogURLChangeAction {
  return {
    type: 'FeedBlogURLChangeAction',
    blogURL,
  };
}

export interface FeedBlogURLClearAction extends Action {
  type: 'FeedBlogURLClearAction';
}

export function feedBlogURLClear(): FeedBlogURLClearAction {
  return {
    type: 'FeedBlogURLClearAction',
  };
}

export interface FeedFirebaseRequestAction extends Action {
  type: 'FeedFirebaseRequestAction';
  blogURL: string;
}

function feedFirebaseRequest(blogURL: string): FeedFirebaseRequestAction {
  return {
    type: 'FeedFirebaseRequestAction',
    blogURL,
  }
}

export interface FeedFirebaseItemsResponseAction extends Action {
  type: 'FeedFirebaseItemsResponseAction';
  blogURL: string;
  items: ItemEntity[];
}

export function feedFirebaseResponse(blogURL: string, items: ItemEntity[]): FeedFirebaseItemsResponseAction {
  return {
    type: 'FeedFirebaseItemsResponseAction',
    blogURL,
    items,
  };
}

export interface FeedFirebaseBlogTitleResponseAction extends Action {
  type: 'FeedFirebaseBlogTitleResponseAction';
  blogURL: string;
  title: string;
}

export function feedFirebaseBlogTitleResponse(blogURL: string, title: string) : FeedFirebaseBlogTitleResponseAction {
  return {
    type: 'FeedFirebaseBlogTitleResponseAction',
    blogURL,
    title,
  };
}

type FeedFirebaseAction = FeedFirebaseRequestAction | FeedFirebaseItemsResponseAction | FeedFirebaseBlogTitleResponseAction;

export function fetchFirebaseFeed(auth: firebase.auth.Auth, blogURL: string) {
  return (dispatch: ThunkDispatch<AppState, undefined, FeedFirebaseActions>) => {
    dispatch(fetchOrCurrenUser(auth, async (user) => {
      if (user) {
        dispatch(feedFirebaseRequest(blogURL));

        const blogData = (await findBlog(user.uid, blogURL)).data();
        if (blogData) {
          dispatch(feedFirebaseBlogTitleResponse(blogURL, blogData.title));
        }

        const itemEntities = await findAllItems(user.uid, blogURL);
        dispatch(feedFirebaseResponse(blogURL, itemEntities));
      }
    }));
  }
}


export type FeedFirebaseActions = FeedFirebaseRequestAction | FeedFirebaseItemsResponseAction | FeedFirebaseBlogTitleResponseAction;

export interface FeedCrowlerRequestAction extends Action {
  type: 'FeedCrowlerRequestAction';
  blogURL: string;
}

export function feedCrowlerRequest(blogURL: string): FeedCrowlerRequestAction {
  return {
    type: 'FeedCrowlerRequestAction',
    blogURL,
  };
}

export interface FeedCrowlerTitleResponseAction extends Action {
  type: 'FeedCrowlerTitleResponseAction';
  blogURL: string;
  title: string;
}

export function feedCrowlerTitleResponseAction(blogURL: string, title: string): FeedCrowlerTitleResponseAction {
  return {
    type: 'FeedCrowlerTitleResponseAction',
    blogURL,
    title,
  };
}

export interface FeedCrowlerItemsResponseAction extends Action {
  type: 'FeedCrowlerItemsResponseAction';
  blogURL: string;
  items: ItemResponse[];
}

export function feedCrowlerItemsResponse(blogURL: string, items: ItemResponse[]): FeedCrowlerItemsResponseAction {
  return {
    type: 'FeedCrowlerItemsResponseAction',
    blogURL,
    items,
  };
}

export interface FeedCrowlerCountsResponseAction extends Action {
  type: 'FeedCrowlerCountsResponseAction';
  blogURL: string;
  counts: CountResponse[];
}

export function feedCrowlerCountsResponse(blogURL: string, counts: CountResponse[]): FeedCrowlerCountsResponseAction {
  return {
    type: 'FeedCrowlerCountsResponseAction',
    blogURL,
    counts,
  };
}

export interface FeedCrowlerErrorAction extends Action {
  type: 'FeedCrowlerErrorAction';
  blogURL: string;
  error: Error;
}

export function feedCrowlerErrorResponse(blogURL: string, error: Error): FeedCrowlerErrorAction {
  return {
    type: 'FeedCrowlerErrorAction',
    blogURL,
    error,
  };
}

export type ItemEntitiesFunction = () => ItemEntity[];

export function fetchOnlineFeed(auth: firebase.auth.Auth, blogURL: string, getFirebaseEntities: ItemEntitiesFunction): ThunkAction<void, AppState, undefined, FeedCrowlerActions> {
  return (dispatch: ThunkDispatch<AppState, undefined, FeedCrowlerActions>, getState) => {
    dispatch(fetchOrCurrenUser(auth, async (user) => {
      if (user) {
        dispatch(feedCrowlerRequest(blogURL));
        const [fetchBlog, fetchFeed, fetchCount] = crawl(blogURL);
        let blogResponse: BlogResponse | undefined;
        try {
          blogResponse = await fetchBlog;
          if (blogResponse) {
            const { url, title, feedURL, feedType } = blogResponse;
            saveBlog(user.uid, url, title, feedURL, feedType);
            dispatch(feedCrowlerTitleResponseAction(blogURL, title));
          }
        } catch (e) {
          dispatch(feedCrowlerErrorResponse(blogURL, e));
        }

        let feedItemsResponse: ItemResponse[] | undefined;
        try {
          feedItemsResponse = await fetchFeed;
          if (feedItemsResponse) {
            dispatch(feedCrowlerItemsResponse(blogURL, feedItemsResponse));
          }
        } catch (e) {
          dispatch(feedCrowlerErrorResponse(blogURL, e));
        }

        try {
          const countsResponse = await fetchCount;
          if (countsResponse) {
            dispatch(feedCrowlerCountsResponse(blogURL, countsResponse));

            const batch = writeBatch();
            const counts = countsResponse.filter((count: CountResponse) => count && count.count > 0);
            const facebookMap = new Map<string, CountResponse>(counts.filter(c => c.type === CountType.Facebook).map(c => [c.url, c] as [string, CountResponse]));
            const hatenaBookmarkMap = new Map<string, CountResponse>(counts.filter(c => c.type === CountType.HatenaBookmark).map(c => [c.url, c] as [string, CountResponse]));

            const firebaseEntities = getFirebaseEntities();
            const firebaseMap = new Map<string, ItemEntity>(firebaseEntities.map(i => [i.url, i] as [string, ItemEntity]));
            const firebaseFacebookMap = new Map<string, CountEntity>(firebaseEntities.filter(e => e.counts && e.counts[CountType.Facebook]).map(e => [e.url, e.counts && e.counts[CountType.Facebook]] as [string, CountEntity]));
            const firebaseHatenaBookmarkMap = new Map<string, CountEntity>(firebaseEntities.filter(e => e.counts && e.counts[CountType.HatenaBookmark]).map(e => [e.url, e.counts && e.counts[CountType.HatenaBookmark]] as [string, CountEntity]));
            const firebasePrevFacebookMap = new Map<string, CountEntity>(firebaseEntities.filter(e => e.counts && e.prevCounts[CountType.Facebook]).map(e => [e.url, e.counts && e.prevCounts[CountType.Facebook]] as [string, CountEntity]));
            const firebasePrevHatenaBookmarkMap = new Map<string, CountEntity>(firebaseEntities.filter(e => e.counts && e.prevCounts[CountType.HatenaBookmark]).map(e => [e.url, e.counts && e.prevCounts[CountType.HatenaBookmark]] as [string, CountEntity]));

            if (blogResponse && feedItemsResponse) {
              let shouldCommit = false;
              for (let item of feedItemsResponse) {
                const itemCounts: CountSaveEntities = {};
                const facebookCount = facebookMap.get(item.url);
                const firebaseFacebookCount = firebaseFacebookMap.get(item.url);
                if (facebookCount) {
                  const { count } = facebookCount;
                  itemCounts.facebook = {
                    count,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                  };
                } else if (firebaseFacebookCount) {
                  itemCounts.facebook = firebaseFacebookCount;
                }

                const hatenaBookmarkCount = hatenaBookmarkMap.get(item.url);
                const firebaseHatenaBookmarkCount = firebaseHatenaBookmarkMap.get(item.url);
                if (hatenaBookmarkCount) {
                  const { count } = hatenaBookmarkCount;
                  itemCounts.hatenabookmark = {
                    count,
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                  };
                } else if (firebaseHatenaBookmarkCount) {
                  itemCounts.hatenabookmark = firebaseHatenaBookmarkCount;
                }

                const prevCounts: CountSaveEntities = {};
                const prevFacebookCount = firebasePrevFacebookMap.get(item.url);
                if (firebaseFacebookCount && firebaseFacebookCount.timestamp.seconds < (firebase.firestore.Timestamp.now().seconds - 60 * 10)) {
                  prevCounts.facebook = firebaseFacebookCount;
                } else if (prevFacebookCount) {
                  prevCounts.facebook = prevFacebookCount;
                } else if (!prevFacebookCount && itemCounts.facebook) {
                  prevCounts.facebook = itemCounts.facebook;
                }

                const prevHatenaBookmarkCount = firebasePrevHatenaBookmarkMap.get(item.url);
                if (firebaseHatenaBookmarkCount && firebaseHatenaBookmarkCount.timestamp.seconds < (firebase.firestore.Timestamp.now().seconds - 60 * 10)) {
                  prevCounts.hatenabookmark = firebaseHatenaBookmarkCount;
                } else if (prevHatenaBookmarkCount) {
                  prevCounts.hatenabookmark = prevHatenaBookmarkCount;
                } else if (!prevHatenaBookmarkCount && itemCounts.hatenabookmark) {
                  prevCounts.hatenabookmark = itemCounts.hatenabookmark;
                }

                const firebaseItem = firebaseMap.get(item.url);

                const isTitleChanged = !firebaseItem || firebaseItem && item.title !== firebaseItem.title;
                const isHatenaBookmarkCountChanged = !firebaseHatenaBookmarkCount || hatenaBookmarkCount && firebaseHatenaBookmarkCount &&
                  hatenaBookmarkCount.count !== firebaseHatenaBookmarkCount.count;
                const isFacebookCountChanged = !firebaseFacebookCount || facebookCount && firebaseFacebookCount &&
                  facebookCount.count !== firebaseFacebookCount.count;

                const firebasePrevHatenaBookmarkCount = firebasePrevHatenaBookmarkMap.get(item.url);
                const isPrevHatenaBookmarkCountChanged = !firebaseHatenaBookmarkCount ||
                  prevHatenaBookmarkCount && firebasePrevHatenaBookmarkCount && prevHatenaBookmarkCount.count !== firebasePrevHatenaBookmarkCount.count;
                const firebasePrevFacebookCount = firebasePrevFacebookMap.get(item.url);
                const isPrevFacebookCountChanged = !firebaseFacebookCount ||
                  prevFacebookCount && firebasePrevFacebookCount && prevFacebookCount.count !== firebasePrevFacebookCount.count;

                const shouldSave = isTitleChanged || isHatenaBookmarkCountChanged || isFacebookCountChanged || isPrevHatenaBookmarkCountChanged || isPrevFacebookCountChanged;
                if (shouldSave) {
                  saveItemBatch(
                    batch,
                    user.uid,
                    blogURL,
                    item.url,
                    item.title,
                    item.published,
                    itemCounts,
                    prevCounts,
                  );
                  shouldCommit = true;
                }
              }
              if (shouldCommit) {
                await batch.commit();
              }
            }
          }
        } catch (e) {
          dispatch(feedCrowlerErrorResponse(blogURL, e));
        }
      }
    }));
  }
}

type FeedCrowlerActions = FeedCrowlerRequestAction | FeedBlogURLClearAction | FeedCrowlerTitleResponseAction | FeedCrowlerItemsResponseAction | FeedCrowlerCountsResponseAction | FeedCrowlerErrorAction;

export type FeedActions = FeedBlogURLChangeAction | FeedFirebaseAction | FeedCrowlerActions;