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
class AuthPage extends React.PureComponent<Props> {
  componentDidMount() {
    this.props.fetchUser(firebase.auth());
  }
  render() {
    const { loading, user } = this.props.user;
    if (user) {
      return <Redirect to="/blogs" />;
    } else {
      return (
        <PageLayout
          header={{
            title: 'ログイン',
          }}
        >
          {(() => {
            if (loading && !user) {
              return <LoadingView />;
            } else {
              return <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />;
            }
          })()}
        </PageLayout>
      );
    }
  }
}

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: '/blogs/',
  // We will display Google and Facebook as auth providers.
  signInOptions: [
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
  ],
};

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
  )(AuthPage)
);