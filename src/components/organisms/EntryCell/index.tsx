import * as React from 'react';
import styled from 'styled-components';
import * as properties from '../../properties';
import CountButton from '../../molecules/CountButton/index';
import { CountType } from '../../../consts/count-type';
import Favicon from '../../atoms/Favicon/index';

type Count = {
    type: CountType;
    count?: number;
};

type Props = {
    favicon: string;
    title: string;
    counts: Count[];
};

const EntryCell = ({...props}: Props) => (
    <Wrapper {...props}>
        <Favicon src={props.favicon}/>
        <ContentWrapper>
            <Title>{props.title}</Title>
            <ButtonWrapper>
                {props.counts.map(count => <StyledCountButton type={count.type} count={count.count} key={count.type} />)}
            </ButtonWrapper>
        </ContentWrapper>
    </Wrapper>
);

export default EntryCell;

const Wrapper = styled.div`
display: flex;
flex-direction: row;
padding: 8px;
background: ${properties.colorsValue.white};
border: ${properties.border};
margin: 16px;
box-shadow: 0px 0px 0.5px 0.5px #ddd;
`;

const ContentWrapper = styled.div`
display: flex;
flex-direction: column;
width: 100%;
`;

const Title = styled.h3`
  font-size: ${properties.fontSizes.m};
  margin: 0 8px 8px 8px;
`;

const ButtonWrapper = styled.div`
  display: flex;
  width: 100%;
  justify-content: stretch;
`;

const StyledCountButton = styled(CountButton)`
  margin: 0.2rem;
  flex-grow: 1;
`;