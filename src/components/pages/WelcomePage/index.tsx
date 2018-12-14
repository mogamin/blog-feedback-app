import React from 'react';
import styled from 'styled-components';
import Anker from '../../atoms/Anker/index';
import { PrimaryButton } from '../../atoms/Button/index';
import ScrollView from '../../atoms/ScrollView/index';
import Wrapper from '../../atoms/Wrapper/index';
import SocialButtons from '../../organisms/SocialButtons/index';
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
        <StyledSocialButtons />
        <Title>BlogFeedbackへようこそ！</Title>
        <MessageWrapper>
          <Text>BlogFeedbackはブログのソーシャルボタンの数を集計し、反響を確認できるサービスです。</Text>
        </MessageWrapper>
        <ImageWrapper>
          <img src="https://user-images.githubusercontent.com/113420/50003891-97424b80-ffe8-11e8-949f-def709c14aa5.gif" />
        </ImageWrapper>
        <SigninButtonWrapper>
          <PrimaryButton as="a" href="/signin">
            ユーザー登録 / ログインへ進む
          </PrimaryButton>
        </SigninButtonWrapper>
        <TermAndPrivacyWrapper>
          <Anker href="/term" target="_blank">
            利用規約
          </Anker>
          <Slash>/</Slash>
          <Anker href="/privacy" target="_blank">
            プライバシーポリシー
          </Anker>
        </TermAndPrivacyWrapper>
      </BodyWrapper>
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
  width: 400px;
  height: 867px;
`;

const SigninButtonWrapper = styled(Wrapper)`
  justify-content: center;
  margin: 24px 16px 12px 16px;
`;

const TermAndPrivacyWrapper = styled(Wrapper)`
  flex-direction: row;
  margin: 8px 0 16px 0;
  font-size: ${properties.fontSizes.s};
`;

const Slash = styled.p`
  margin: 0 0.3em 0 0.3em;
`;

const StyledSocialButtons = styled(SocialButtons)`
  margin: 16px 0 16px 0;
`;

const Text = styled.p`
  font-size: ${properties.fontSizes.s};
  color: ${properties.colors.grayDark};
  line-height: 1.4em;
  margin: 0.5em 0;
`;
