import * as firebase from 'firebase/app';
import 'firebase/auth';
import React from 'react';
import styled from 'styled-components';

import { StyledFirebaseAuth } from 'react-firebaseui';
import { connect } from 'react-redux';
import { Redirect, RouteComponentProps, withRouter } from 'react-router-dom';
import { bindActionCreators, Dispatch } from 'redux';
import { fetchUser } from '../../../redux/actions/user-action';
import { AppState } from '../../../redux/states/app-state';
import { UserState } from '../../../redux/states/user-state';
import LoadingView from '../../molecules/LoadingView/index';
import PageLayout from '../../templates/PageLayout/index';

type StateProps = {
  user: UserState;
};

type DispatchProps = {
  fetchUser: (auth: firebase.auth.Auth) => any;
};

type Props = StateProps & DispatchProps & RouteComponentProps;
class IndexPage extends React.PureComponent<Props> {
  componentDidMount() {
    this.props.fetchUser(firebase.auth());
  }
  render() {
    const { loading, user } = this.props.user;
    if (loading) {
      return (
        <PageLayout
          header={{
            title: 'BlogFeedback',
          }}
        >
          <LoadingView />
        </PageLayout>
      );
    } else if (user) {
      return <Redirect to="/blogs" />;
    } else {
      return <Redirect to="/signin" />;
    }
  }
}

const mapStateToProps = (state: AppState): StateProps => ({
  user: state.user,
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps =>
  bindActionCreators(
    {
      fetchUser,
    },
    dispatch
  );

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(IndexPage)
);