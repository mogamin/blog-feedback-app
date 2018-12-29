import flatten from 'lodash/flatten';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { CountType } from '../../consts/count-type';
import { BlogEntity, ItemEntity } from '../../models/entities';
import { fetchFeed as fetchFeedAction } from '../../models/fetchers/feed-fetcher';
import { findBlog } from '../../models/repositories/blog-repository';
import { findAllItems } from '../../models/repositories/item-repository';
import { CountResponse, FeedResponse, ItemResponse } from '../../models/responses';
import { saveFeedsAndCounts } from '../../models/save-count-response';
import {
  feedCrowlerErrorResponse,
  FeedFetchFeedAction,
  feedFetchRSSRequest,
  feedFetchRSSResponse,
  feedFirebaseBlogRequest,
  feedFirebaseBlogResponse,
  feedFirebaseFeedItemsResponse,
  feedSaveFeedFirebaseResponse,
  feedSaveFeedRequest,
} from '../actions/feed-action';
import { fetchFacebookCounts } from './feed-sagas/facebook-saga';
import { fetchHatenaBookmarkCounts } from './feed-sagas/hatenabookmark-saga';
import { fetchHatenaStarCounts } from './feed-sagas/hatenastar-saga';
import { fetchPocketCounts } from './feed-sagas/pocket-saga';
import { fetchFiresbaseUser } from './user-saga';

export default function* feedSaga() {
  yield takeLatest('FeedFetchFeedAction', handleFetchAction);
}

// main
function* handleFetchAction(action: FeedFetchFeedAction) {
  const { blogURL, auth } = action;

  const user: firebase.User = yield call(fetchFiresbaseUser, auth);

  const blogEntity: BlogEntity = yield call(firebaseBlog, user, blogURL);
  const { services, feedURL } = blogEntity;

  const [firebaseItems, fetchedItems]: [ItemEntity[], ItemResponse[]] = yield all([
    call(firebaseFeed, user, blogURL),
    call(fetchFeed, blogURL, feedURL),
  ]);

  const urls = fetchedItems.map(i => i.url);
  const countServices = [];
  const countTypes: CountType[] = [];
  if (services) {
    const { hatenabookmark, hatenastar, pocket, facebook } = services;
    if (hatenabookmark) {
      countServices.push(call(fetchHatenaBookmarkCounts, blogURL, urls));
      countTypes.push(CountType.HatenaBookmark);
    }
    if (hatenastar) {
      countServices.push(call(fetchHatenaStarCounts, blogURL, urls));
      countTypes.push(CountType.HatenaStar);
    }
    if (pocket) {
      countServices.push(call(fetchPocketCounts, blogURL, urls));
      countTypes.push(CountType.Pocket);
    }
    if (facebook) {
      countServices.push(call(fetchFacebookCounts, blogURL, urls));
      countTypes.push(CountType.Facebook);
    }
  }

  const counts: CountResponse[] = flatten(yield all(countServices));
  yield call(saveBlogFeedItemsAndCounts, user, blogURL, firebaseItems, fetchedItems, counts, countTypes);
}

function* firebaseBlog(user: firebase.User, blogURL: string) {
  try {
    yield put(feedFirebaseBlogRequest(blogURL));
    const blogData: BlogEntity = yield call(findBlog, user.uid, blogURL);
    yield put(feedFirebaseBlogResponse(blogURL, blogData, user));
    return blogData;
  } catch (e) {
    yield put(feedCrowlerErrorResponse(blogURL, e));
  }
}

function* firebaseFeed(user: firebase.User, blogURL: string) {
  try {
    yield put(feedFirebaseBlogRequest(blogURL));
    const items: ItemEntity[] = yield call(findAllItems, user.uid, blogURL);
    yield put(feedFirebaseFeedItemsResponse(blogURL, items));
    return items;
  } catch (e) {
    yield put(feedCrowlerErrorResponse(blogURL, e));
  }
}

function* fetchFeed(blogURL: string, feedURL: string) {
  try {
    yield put(feedFetchRSSRequest(blogURL));
    const feed: FeedResponse = yield call(fetchFeedAction, feedURL);
    yield put(feedFetchRSSResponse(blogURL, feed.items));
    return feed.items;
  } catch (e) {
    yield put(feedCrowlerErrorResponse(blogURL, e));
  }
}

function* saveBlogFeedItemsAndCounts(
  user: firebase.User,
  blogURL: string,
  firebaseItems: ItemEntity[],
  fetchedItems: ItemResponse[],
  counts: CountResponse[],
  countTypes: CountType[]
) {
  try {
    yield put(feedSaveFeedRequest(blogURL, firebaseItems, fetchedItems, counts));
    yield call(saveFeedsAndCounts, user, blogURL, firebaseItems, fetchedItems, counts, countTypes);
    yield put(feedSaveFeedFirebaseResponse(blogURL));
  } catch (e) {
    yield put(feedCrowlerErrorResponse(blogURL, e));
  }
}
