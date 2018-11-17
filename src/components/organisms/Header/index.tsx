import * as React from 'react';
import styled from 'styled-components';
import * as properties from '../../properties';
import { MdArrowBack, MdAdd } from 'react-icons/md';
import HeaderLoadingIndicator from '../../molecules/HeaderLoadingIndicator/index';

export type HeaderProps = {
    title: string,
    loadingLabel?: string
    loadingRatio?: number,
    loading?: boolean,
    onHeaderClick?: React.MouseEventHandler,
    onBackButtonClick?: React.MouseEventHandler,
    onAddButtonClick?: React.MouseEventHandler,
    onSettingButtonClick?: React.MouseEventHandler,
};

const Header = ({onBackButtonClick, onAddButtonClick, onHeaderClick, loadingRatio, loadingLabel, loading, title, ...props}: HeaderProps) => (
    <HeaderLayout onClick={onHeaderClick} {...props}>
        <HeaderLoadingIndicator 
            ratio={loadingRatio} 
            label={loadingLabel} 
            loading={!!loading}
        />
        <HeaderContent>
            {onBackButtonClick ? <BackButton size={24} onClick={onBackButtonClick}/> : <Spacer />}
            <TitleLayout><Title>{title}</Title></TitleLayout>
            {onAddButtonClick ? <AddButton size={24} onClick={onAddButtonClick}/> : <Spacer />}
        </HeaderContent>
        <UnderLine />
    </HeaderLayout>
);

export default Header;

const HeaderLayout = styled.header`
font-family: ${properties.fontFamily};
height: ${properties.headerHeight};
display: flex;
flex-direction: column;
border-width: 0;
background-color: ${properties.colorsBlanding.accent};
color: white;
`;

const HeaderContent = styled.div`
display: flex;
flex-direction: row;
box-sizing: border-box;
flex-basis: 100%;
align-items: center;
margin-left: auto;
margin-right: auto;
width: 100%;
max-width: 600px;
`;

const TitleLayout = styled.div`
justify-content: center;
display: flex;
box-pack: center;
box-sizing: border-box;
flex: 1 1 auto;
overflow: hidden;
`;

const Title = styled.div`
font-size: 1.25rem;
font-weight: bold;
white-space: nowrap;
overflow: hidden;
`;

const BackButton = styled(MdArrowBack)`
cursor: pointer;
padding: 8px;
flex: 0 0 auto;
`;

const AddButton = styled(MdAdd)`
cursor: pointer;
padding: 8px;
flex: 0 0 auto;
`;

const Spacer = styled.div`
  width: 28px;
  padding: 8px;
`;

const UnderLine = styled.div`
background-color: rgba(0, 0, 0, 0.298039);
display: flex;
height: ${properties.lineWidth};
flex-basis: ${properties.lineWidth};;
`;