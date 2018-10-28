import * as React from 'react';
import styled from 'styled-components';
import * as firebase from 'firebase/app';
import 'firebase/auth';

import { StyledFirebaseAuth } from 'react-firebaseui';
import { BrowserRouter, Route, Link, Redirect, match as matchParam, withRouter, RouteComponentProps } from 'react-router-dom';
import { AppState } from '../../../redux/states/app-state';
import { connect } from 'react-redux';
import { UserState } from '../../../redux/states/user-state';
import { Dispatch } from 'redux';
import { fetchUser } from '../../../redux/actions/user-action';
import LoadingView from '../../molecules/LoadingView/index';

type Props = {
    user: UserState,
    fetchUser: (auth: firebase.auth.Auth) => any,
};

class LoginView extends React.PureComponent<Props & RouteComponentProps> {
    componentDidMount() {
      this.props.fetchUser(firebase.auth());
    }
    render() {
        const { loading, user } = this.props.user;
        if (loading && !user) {
            return (
                <LoadingView />
            );
        } else if (user) {
            return (
                <Redirect to="/blogs" />
            );
        } else {
            return (
                <StyledFirebaseAuth 
                    uiConfig={uiConfig} 
                    firebaseAuth={firebase.auth()} 
                />
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
        firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
};

const mapStateToProps = (state: AppState) => ({
    user: state.user
});

function mapDispatchToProps(dispatch: Dispatch<AppState>) {
    return {
        fetchUser: (auth: firebase.auth.Auth) => fetchUser(auth)(dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(LoginView));
