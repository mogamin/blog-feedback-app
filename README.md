[![CircleCI](https://circleci.com/gh/ninjinkun/blog-feedback-app.svg?style=svg&circle-token=f9faff2d125195261cccf6cf8f6c9aabd1733603)](https://circleci.com/gh/ninjinkun/blog-feedback-app)

BlogFeedback is an web app visualize your blog's impact. 

<img src="https://user-images.githubusercontent.com/113420/48974171-d4738780-f093-11e8-9ec0-061c1707adba.gif">

This app is based on below modules and services.
- react
- redux
- redux-thunk
- redux-saga
- create-react-app
- styled-component
- firebase
- [YQL](https://developer.yahoo.com/yql/)
  - RSS parser, crowler over Same-Origin Policy
  - I'm considering replace it by Firebase Cloud Function.

# Commands
## Run
```
$ yarn start
```

## Storybook
```
$ yarn storybook
```

## Production Build
```
$ yarn build
```

