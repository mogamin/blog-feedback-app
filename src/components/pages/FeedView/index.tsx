import * as React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';
import { ActivityIndicator } from 'react-native';
import styled from 'styled-components';
import * as firebase from 'firebase';

import { ItemResponse, CountResponse } from '../../../models/responses';
import { ItemEntity } from '../../../models/entities';
import ScrollView from '../../atoms/ScrollView/index';
import { CountType } from '../../../consts/count-type';
import EntryCell from '../../organisms/EntryCell/index';
import Wrapper from '../../atoms/Wrapper/index';
import Spinner from '../../atoms/Spinner/index';
import { AppState } from '../../../redux/states/app-state';
import { feedBlogURLChange, fetchFirebaseFeed, fetchOnlineFeed, feedBlogURLClear, ItemEntitiesFunction } from '../../../redux/actions/feed-action';
import { FeedsState } from '../../../redux/states/feeds-state';
import { colorsValue } from '../../properties';

type StateProps = {
  feeds: FeedsState;
};

type DispatchProps = {
  feedBlogURLClear: () => any;
  feedBlogURLChange: (blogURL: string) => any;
  fetchFirebaseFeed: (auth: firebase.auth.Auth, blogURL: string) => any;
  fetchOnlineFeed: (auth: firebase.auth.Auth, blogURL: string, getItemEntities: ItemEntitiesFunction) => any;
};

type Props = { url: string } & StateProps & DispatchProps;

class FeedView extends React.Component<Props> {
  componentDidMount() {
    const blogURL = this.props.url;
    this.props.feedBlogURLChange(blogURL);
    this.props.fetchFirebaseFeed(firebase.auth(), blogURL);

    this.getItemEntities = this.getItemEntities.bind(this);
    this.props.fetchOnlineFeed(firebase.auth(), blogURL, this.getItemEntities);
  }

  getItemEntities(): ItemEntity[] {
    const { feeds, url } = this.props;
    const feed = feeds.feeds[url];
    return feed && feed.firebaseEntities ? feed.firebaseEntities : [];
  }

  componentWillUnmount() {
    this.props.feedBlogURLClear();
  }

  render() {
    const { feeds, url } = this.props;
    const feed = feeds.feeds[url];

    if ((!feed || feed.loading) && !(feed && feed.fethcedEntities || feed && feed.firebaseEntities)) {
      return (<SpinnerContainer><Spinner /></SpinnerContainer>);
    } else {
      const { firebaseEntities, fethcedEntities, fetchedCounts } = feed;

      const [facebookMap, facebookAnimateMap] = this.stateToViewData(fetchedCounts, firebaseEntities, CountType.Facebook);
      const [hatenabookmarkMap, hatenabookmarkAnimateMap] = this.stateToViewData(fetchedCounts, firebaseEntities, CountType.HatenaBookmark);

      const items: (ItemResponse | ItemEntity)[] = fethcedEntities && fethcedEntities.length ? fethcedEntities : firebaseEntities && firebaseEntities.length ? firebaseEntities : [];
      return (
        <StyledScrollView>
          {items
            .map(item =>
              <EntryCell
                key={item.url}
                title={item.title}
                favicon={`http://www.google.com/s2/favicons?domain=${item.url}`}
                counts={[
                  { type: CountType.Twitter, count: 0, animate: false },
                  { type: CountType.Facebook, count: facebookMap.get(item.url) || 0, animate: !!(facebookAnimateMap && facebookAnimateMap.get(item.url)) },
                  { type: CountType.HatenaBookmark, count: hatenabookmarkMap.get(item.url) || 0, animate: !!(hatenabookmarkAnimateMap && hatenabookmarkAnimateMap.get(item.url)) }
                ]}
                url={item.url}
              />
            )}
        </StyledScrollView>);
    }
  }

  stateToViewData(fetchedCounts: CountResponse[] | undefined, firebaseEntities: ItemEntity[] | undefined, countType: CountType): [Map<string, number>, Map<string, boolean>] {
    const filteredFetchedCounts: CountResponse[] = fetchedCounts && fetchedCounts.filter(({ type }) => type === countType) || [];
    const fetchedMap: Map<string, number> = new Map<string, number>(filteredFetchedCounts.map(({ url, count }) => [url, count] as [string, number]));

    const filteredFirebaseCounts = firebaseEntities && firebaseEntities.filter(({ counts }) => counts && (counts[countType])) || [];
    const firebaseMap = new Map<string, number>(filteredFirebaseCounts.map(({ url, counts }) => [url, counts[countType].count] as [string, number]));

    const countsMap = new Map([...firebaseMap, ...fetchedMap]);

    const prevFirebaseCounts = filteredFirebaseCounts.filter(i => i.prevCounts && i.prevCounts[countType]);
    const prevFirebaseMap = new Map<string, number>(prevFirebaseCounts.map(({ url, prevCounts }) => [url, prevCounts[countType].count] as [string, number]));
    const animateMap = new Map<string, boolean>(filteredFetchedCounts.map(({ url, count }) => [url, (count > (prevFirebaseMap.get(url) || 0))] as [string, boolean]));

    return [countsMap, animateMap];
  }
}

const StyledScrollView = styled(ScrollView)`
  background-color: ${colorsValue.grayPale};
  min-height: 100vh;
`;

const SpinnerContainer = styled(Wrapper)`
  background-color: ${colorsValue.grayPale};
  min-height: 100%;
  width: 100%;
  height: 100%;
  align-items: center;
  padding-top: 16px;
`;

const mapStateToProps = (state: AppState) => ({
  feeds: state.feeds
});

function mapDispatchToProps(dispatch: Dispatch<AppState>) {
  return {
    feedBlogURLClear: () => dispatch(feedBlogURLClear()),
    feedBlogURLChange: (blogURL: string) => dispatch(feedBlogURLChange(blogURL)),
    fetchFirebaseFeed: (auth: firebase.auth.Auth, blogURL: string) => fetchFirebaseFeed(auth, blogURL)(dispatch),
    fetchOnlineFeed: (auth: firebase.auth.Auth, blogURL: string, getItemEntities: ItemEntitiesFunction) => fetchOnlineFeed(auth, blogURL, getItemEntities)(dispatch),
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FeedView);