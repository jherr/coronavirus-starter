import fs from 'fs';
import React from 'react';
import ReactDOM from 'react-dom';
import Chart from 'react-apexcharts';

const counties = fs
  .readFileSync('./us-counties.csv', 'utf8')
  .toString()
  .split(/\n/)
  .map(l => l.trim().split(','))
  .filter(([date]) => date !== 'date')
  .map(([date, county, state, fips, cases, deaths]) => ({
    date: new Date(Date.parse(date)),
    county,
    state,
    fips,
    cases: parseInt(cases),
    deaths: parseInt(deaths)
  }));

const names = {};
counties
  .forEach(({ state, county, fips }) => names[fips] = `${county}, ${state}`);

const lastDate = counties.reduce(
  (a, { date }) => date > a ? date : a,
  counties[0].date
);

const toDays = (delta) => delta / (24 * 60 * 60 * 1000);

const dataForFips = (location) => {
  const options = {
    xaxis: {
      categories: [],
    },
    dataLabels: {
      enabled: true,
      enabledOnSeries: [0, 1],
    },
  };
  const series = [
    {
      name: 'cases',
      type: 'column',
      data: [],
    },
    {
      name: 'deaths',
      type: 'line',
      data: [],
    },
  ];

  counties
    .filter(({ fips }) => fips === location)
    .filter(({ date }) => toDays(lastDate - date) < 14)
    .forEach(({ date, cases, deaths }) => {
      options.xaxis.categories.push(toDays(lastDate - date));
      series[0].data.push(cases);
      series[1].data.push(deaths);
    });

  return {
    options,
    series,
  };
}

const FipsChart = (({ fips }) => {
  return (
    <div>
      <h1>
        {names[fips]}
      </h1>
      <Chart
        {...dataForFips(fips)}
        width="100%"
        height={320}
      />
    </div>
  );
});

const App = () => (
  <div>
    {['41005', '41067', '41051'].map(fips => (
      <FipsChart
        key={fips}
        fips={fips}
      />
    ))}
  </div>
)

ReactDOM.render(<App />, document.getElementById('app'))