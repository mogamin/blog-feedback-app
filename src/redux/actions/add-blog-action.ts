import firebase from 'firebase/app';
import 'firebase/auth';

import { Action } from 'redux';
import { ThunkAction } from 'redux-thunk';
import { fetchBlog } from '../../models/fetchers/blog-fetcher';
import { fetchFeed } from '../../models/fetchers/feed-fetcher';
import { saveBlog } from '../../models/repositories/blog-repository';
import { BlogResponse } from '../../models/responses';
import { AppState } from '../states/app-state';
import { currenUserOronAuthStateChanged } from './user-action';

export interface AddBlogRequestAction extends Action {
  type: 'AddBlogRequestAction';
}

function addBlogRequest(): AddBlogRequestAction {
  return {
    type: 'AddBlogRequestAction',
  };
}

export interface AddBlogResponseAction extends Action {
  type: 'AddBlogResponseAction';
  response: BlogResponse;
}

export function addBlogResponse(response: BlogResponse): AddBlogResponseAction {
  return {
    type: 'AddBlogResponseAction',
    response,
  };
}

export interface AddBlogErrorAction extends Action {
  type: 'AddBlogErrorAction';
  error: Error;
}

export function addBlogError(error: Error): AddBlogErrorAction {
  return {
    type: 'AddBlogErrorAction',
    error,
  };
}

export interface AddBlogInitializeAction extends Action {
  type: 'AddBlogInitializeAction';
}

export function addBlogInitialize(): AddBlogInitializeAction {
  return {
    type: 'AddBlogInitializeAction',
  };
}

type AddBlogFetchActions = AddBlogRequestAction | AddBlogResponseAction | AddBlogErrorAction;
export type AddBlogActions = AddBlogFetchActions | AddBlogInitializeAction;

export type AddBlogThunkAction = ThunkAction<void, AppState, undefined, AddBlogFetchActions>;
export function addBlog(auth: firebase.auth.Auth, blogURL: string): AddBlogThunkAction {
  return async dispatch => {
    dispatch(addBlogRequest());
    const user = await currenUserOronAuthStateChanged(auth);
    try {
      const blogResponse = await fetchBlog(blogURL);
      if (user) {
        // default services are Twitter, Facebook and HatenaBookmark. (HatenaStar is only HatenaBlog)
        await saveBlog(
          user.uid,
          blogResponse.url,
          blogResponse.title,
          blogResponse.feedURL,
          blogResponse.feedType,
          true,
          true,
          true,
          blogResponse.isHatenaBlog,
          true
        );
        dispatch(addBlogResponse(blogResponse));
      } else {
        dispatch(addBlogError(new Error('Blog missing')));
      }
    } catch (e) {
      try {
        const feed = await fetchFeed(blogURL);
        const { url, title, feedType } = feed;
        if (user) {
          await saveBlog(user.uid, url, title, blogURL, feedType, true, true, true, false, true);
          const blogResponse: BlogResponse = {
            url,
            title,
            feedURL: blogURL,
            feedType,
            isHatenaBlog: false,
          };
          dispatch(addBlogResponse(blogResponse));
        } else {
          dispatch(addBlogError(new Error('Blog missing')));
        }
      } catch (e) {
        dispatch(addBlogError(e));
      }
    }
  };
}
