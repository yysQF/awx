import 'styled-components/macro';
import React, { useContext } from 'react';
import { withI18n } from '@lingui/react';
import { t } from '@lingui/macro';
import styled from 'styled-components';
import { func, number } from 'prop-types';
import { Button, Tooltip } from '@patternfly/react-core';
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CaretUpIcon,
  DesktopIcon,
  HomeIcon,
  MinusIcon,
  PlusIcon,
  TimesIcon,
} from '@patternfly/react-icons';
import { WorkflowDispatchContext } from '../../contexts/Workflow';

const Wrapper = styled.div`
  background-color: white;
  border: 1px solid #c7c7c7;
  height: 215px;
  position: relative;
`;

const Header = styled.div`
  border-bottom: 1px solid #c7c7c7;
  padding: 10px;
`;

const Pan = styled.div`
  align-items: center;
  display: flex;
`;

const PanCenter = styled.div`
  display: flex;
  flex-direction: column;
`;

const Tools = styled.div`
  align-items: center;
  display: flex;
  padding: 20px;
`;

const Close = styled(TimesIcon)`
  cursor: pointer;
  position: absolute;
  right: 10px;
  top: 15px;
`;

function WorkflowTools({
  i18n,
  onFitGraph,
  onPan,
  onPanToMiddle,
  onZoomChange,
  zoomPercentage,
}) {
  const dispatch = useContext(WorkflowDispatchContext);
  const zoomIn = () => {
    const newScale =
      Math.ceil((zoomPercentage + 10) / 10) * 10 < 200
        ? Math.ceil((zoomPercentage + 10) / 10) * 10
        : 200;
    onZoomChange(newScale / 100);
  };

  const zoomOut = () => {
    const newScale =
      Math.floor((zoomPercentage - 10) / 10) * 10 > 10
        ? Math.floor((zoomPercentage - 10) / 10) * 10
        : 10;
    onZoomChange(newScale / 100);
  };

  return (
    <Wrapper>
      <Header>
        <b>{i18n._(t`工具`)}</b>
        <Close onClick={() => dispatch({ type: 'TOGGLE_TOOLS' })} />
      </Header>
      <Tools>
        <Tooltip
          content={i18n._(t`使图表适合可用的屏幕尺寸`)}
          position="bottom"
        >
          <Button
            variant="tertiary"
            css="margin-right: 30px;"
            onClick={() => onFitGraph()}
          >
            <DesktopIcon />
          </Button>
        </Tooltip>
        <Tooltip content={i18n._(t`缩小`)} position="bottom">
          <Button
            variant="tertiary"
            css="margin-right: 10px;"
            onClick={() => zoomOut()}
          >
            <MinusIcon />
          </Button>
        </Tooltip>
        <input
          id="zoom-slider"
          max="200"
          min="10"
          onChange={event =>
            onZoomChange(parseInt(event.target.value, 10) / 100)
          }
          step="10"
          type="range"
          value={zoomPercentage}
        />
        <Tooltip content={i18n._(t`放大`)} position="bottom">
          <Button
            variant="tertiary"
            css="margin: 0px 25px 0px 10px;"
            onClick={() => zoomIn()}
          >
            <PlusIcon />
          </Button>
        </Tooltip>
        <Pan>
          <Tooltip content={i18n._(t`向左平移`)} position="left">
            <Button
              variant="tertiary"
              css="margin-right: 10px;"
              onClick={() => onPan('left')}
            >
              <CaretLeftIcon />
            </Button>
          </Tooltip>
          <PanCenter>
            <Tooltip content={i18n._(t`向上平移`)} position="top">
              <Button
                variant="tertiary"
                css="margin-bottom: 10px;"
                onClick={() => onPan('up')}
              >
                <CaretUpIcon />
              </Button>
            </Tooltip>
            <Tooltip
              content={i18n._(t`将缩放设置为 100% 并居中图形`)}
              position="top"
            >
              <Button variant="tertiary" onClick={() => onPanToMiddle()}>
                <HomeIcon />
              </Button>
            </Tooltip>
            <Tooltip content={i18n._(t`向下平移`)} position="bottom">
              <Button
                variant="tertiary"
                css="margin-top: 10px;"
                onClick={() => onPan('down')}
              >
                <CaretDownIcon />
              </Button>
            </Tooltip>
          </PanCenter>
          <Tooltip content={i18n._(t`向右平移`)} position="right">
            <Button
              variant="tertiary"
              css="margin-left: 10px;"
              onClick={() => onPan('right')}
            >
              <CaretRightIcon />
            </Button>
          </Tooltip>
        </Pan>
      </Tools>
    </Wrapper>
  );
}

WorkflowTools.propTypes = {
  onFitGraph: func.isRequired,
  onPan: func.isRequired,
  onPanToMiddle: func.isRequired,
  onZoomChange: func.isRequired,
  zoomPercentage: number.isRequired,
};

export default withI18n()(WorkflowTools);
