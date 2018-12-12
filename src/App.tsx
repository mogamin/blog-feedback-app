import React from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import { GlobalStyle } from './components/base-style';
import ScrollToTop from './components/templates/ScrollToTop/index';
import SmartphoneLayout from './components/templates/SmartphoneLayout/index';
import { initializeFirebase } from './firebase';
import { appStore } from './redux/create-store';

import AddBlogPage from './components/pages/AddBlogPage/index';
import AuthPage from './components/pages/AuthPage/index';
import BlogsPage from './components/pages/BlogsPage/index';
import EntriesPage from './components/pages/EntriesPage/index';
import IndexPage from './components/pages/IndexPage/index';
import PrivacyPage from './components/pages/PrivarcyPage/index';
import SettingPage from './components/pages/SettingPage/index';
import SettingsPage from './components/pages/SettingsPage/index';
import TermPage from './components/pages/TermPage/index';
import { initializeGoogleAnalytics } from './ga';
import withTracker from './withTracker';

initializeFirebase();
initializeGoogleAnalytics();

const App = () => (
  <React.Fragment>
    <GlobalStyle />
    <Provider store={appStore}>
      <SmartphoneLayout>
        <Router>
          <ScrollToTop>
            <Route exact={true} path="/" component={withTracker(IndexPage)} />
            <Route exact={true} path="/signin" component={withTracker(AuthPage)} />
            <Route exact={true} path="/blogs" component={withTracker(BlogsPage)} />
            <Route exact={true} path="/add" component={withTracker(AddBlogPage)} />
            <Route exact={true} path="/settings" component={withTracker(SettingsPage)} />
            <Route exact={true} path="/settings/:blogURL" component={withTracker(SettingPage)} />
            <Route exact={true} path="/blogs/:blogURL" component={withTracker(EntriesPage)} />
            <Route exact={true} path="/term" component={withTracker(TermPage)} />
            <Route exact={true} path="/privacy" component={withTracker(PrivacyPage)} />
          </ScrollToTop>
        </Router>
      </SmartphoneLayout>
    </Provider>
  </React.Fragment>
);
export default App;
