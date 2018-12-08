import React from 'react';
import styled from 'styled-components';
import { PrimaryButton } from '../../atoms/Button/index';
import ScrollView from '../../atoms/ScrollView/index';
import Wrapper from '../../atoms/Wrapper/index';
import FacebookButton from '../../molecules/SocialButtons/FacebookButton/index';
import HatenaBookmarkButton from '../../molecules/SocialButtons/HatenaBookmarkButton/index';
import TweetButton from '../../molecules/SocialButtons/TweetButton/index';
import * as properties from '../../properties';
import PageLayout from '../../templates/PageLayout/index';

const WelcomePage = () => (
  <PageLayout
    header={{
      title: 'BlogFeedback',
    }}
  >
    <StyledScrollView>
      <BodyWrapper>
        <Title>BlogFeedbackへようこそ！</Title>
        <MessageWrapper>
          BlogFeedbackはブログのソーシャルボタンの数を集計し、反響を確認できるサービスです。
        </MessageWrapper>
        <ImageWrapper>
          <img src="https://user-images.githubusercontent.com/113420/48974171-d4738780-f093-11e8-9ec0-061c1707adba.gif" />
        </ImageWrapper>
        <SigninButtonWrapper>
          <PrimaryButton as="a" href="/signin">
            ユーザー登録 / ログインへ進む
          </PrimaryButton>
        </SigninButtonWrapper>
      </BodyWrapper>
      <SocialButtonsWrapper>
        <ButtonWrapper>
          <TweetButton url="https://blog-feedback.app/" />
        </ButtonWrapper>
        <ButtonWrapper>
          <FacebookButton url="https://blog-feedback.app/" />
        </ButtonWrapper>
        <ButtonWrapper>
          <HatenaBookmarkButton url="https://blog-feedback.app/" />
        </ButtonWrapper>
      </SocialButtonsWrapper>
    </StyledScrollView>
  </PageLayout>
);

export default WelcomePage;

const StyledScrollView = styled(ScrollView)`
  padding: 16px;
  min-height: 100%;
`;

const Title = styled.h2`
  color: ${properties.colors.grayDark};
  font-size: ${properties.fontSizes.xl};
`;

const BodyWrapper = styled(Wrapper)`
  font-size: ${properties.fontSizes.m};
  align-items: center;
`;

const MessageWrapper = styled(Wrapper)`
  color: ${properties.colors.grayDark};
  font-size: ${properties.fontSizes.m};
  max-width: 30em;
  line-height: 1.5em;
`;

const ImageWrapper = styled(Wrapper)`
  margin: 24px 16px 16px 16px;
`;

const SigninButtonWrapper = styled(Wrapper)`
  justify-content: center;
  margin: 24px;
`;

const SocialButtonsWrapper = styled(Wrapper)`
  flex-direction: row;
  justify-content: center;
  margin: 16px;
`;

const ButtonWrapper = styled(Wrapper)`
  margin: 0 4px;
`;