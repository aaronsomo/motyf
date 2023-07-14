import React from 'react';
import { OfferingStats } from 'types';
import ReactECharts from 'echarts-for-react';
import styled from 'styled-components';

interface Props {
  stats: OfferingStats;
}

export const DividendsGraph: React.FC<Props> = ({ stats }) => {
  const barChart = {
    grid: { top: 8, right: 8, bottom: 24, left: 36 },
    color: ['#76E3AD', '#ffffff1a'],
    xAxis: {
      type: 'category',
      data: stats.quarters,
    },
    yAxis: {
      axisLabel: {
        // eslint-disable-next-line
        formatter: '${value}',
      },
      type: 'value',
    },
    series: [
      {
        data: stats.payouts,
        type: 'bar',
        stack: 'x',
      },
      {
        data: stats.fillers,
        type: 'bar',
        stack: 'x',
      },
    ],
    tooltip: {
      trigger: 'axis',
      formatter: function (params: any) {
        return 'Payout: $' + params[0].value + '<br/>Period: ' + params[0].axisValue;
      },
    },
  };

  const raidialChart = {
    color: ['#76E3AD', '#A8DFFF', '#BEB6FF', '#ECB7FF', '#FFFFFF'],
    label: {
      color: 'white',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        data: stats.songs,
        roseType: 'area',
        radius: ['0', '50%'],
      },
    ],
  };

  const ringChart = {
    color: ['#76E3AD', '#ffffff'],
    label: {
      color: 'white',
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b} ({d}%)',
    },
    series: [
      {
        type: 'pie',
        data: stats.regions,
        radius: ['50%', '40%'],
      },
    ],
  };

  return (
    <OfferingCharts>
      <GradientText>Historical Asset Performance</GradientText>
      <BarGraphContainer>
        <ReactECharts option={barChart} />
      </BarGraphContainer>
      <br />
      <Link href="/home">View Offering Circular</Link>
      <GraphPair>
        <GraphContainer>
          <GradientText>Revenue by Song</GradientText>
          <ReactECharts option={raidialChart} />
        </GraphContainer>
        <GraphContainer>
          <GradientText>Revenue by Region</GradientText>
          <ReactECharts option={ringChart} />
        </GraphContainer>
      </GraphPair>
    </OfferingCharts>
  );
};

const OfferingCharts = styled.div`
  width: 100%;
  margin-left: 10%;
`;

const BarGraphContainer = styled.div`
  width: 90%;
`;

const GraphPair = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  padding-top: 80px;
`;

const GraphContainer = styled.div`
  width: 50%;
`;

const Link = styled.a``;

const GradientText = styled.div`
  background: linear-gradient(93.87deg, #a8e0ff 4.65%, #a8b6ff 46.64%, #ecb7ff 79.12%);
  -webkit-background-clip: text, padding-box;
  -webkit-text-fill-color: transparent;
  margin: 0 3px;
  width: fit-content;
  text-transform: uppercase;
  padding-bottom: 16px;
`;
