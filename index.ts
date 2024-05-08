import { birthRateData, birthRateDataStd } from './birthRate';

const calcCorr = (data: { value: number; area: string }[]) => {
  try {
    const dataMean =
      data.reduce((acc, cur) => acc + cur.value, 0) / data.length;
    const dataStd = Math.sqrt(
      data.reduce((acc, cur) => acc + (cur.value - dataMean) ** 2, 0) /
        data.length
    );
    const cov =
      birthRateData
        .map(
          (od) =>
            od.value * (data.find((d) => d.area === od.code)!.value - dataMean)
        )
        .reduce((acc, cur) => acc + cur, 0) / birthRateData.length;
    return cov / (birthRateDataStd * dataStd);
  } catch (err) {
    console.error(err);
    return NaN;
  }
};

const callApi = async (
  method: string,
  params: Record<string, string>
): Promise<any> => {
  const base = 'https://api.e-stat.go.jp/rest/3.0/app/json';
  const appId = process.env.APP_ID!;
  const searchParams = new URLSearchParams({
    appId,
    ...params,
  });

  const requestUri = `${base}/${method}?${searchParams.toString()}`;
  const data = fetch(requestUri).then((r) => r.json());

  return data;
};

const listResult = await callApi('getStatsList', {
  surveyYears: '2021',
  collectArea: '2',
});
const list = listResult.GET_STATS_LIST.DATALIST_INF.TABLE_INF;
const dataIds = list.map((d) => d['@id']);

const fetchStats = async (dataId: string) => {
  const dataResult = await callApi('getStatsData', {
    statsDataId: dataId,
  });
  const name =
    dataResult.GET_STATS_DATA.STATISTICAL_DATA.TABLE_INF.STATISTICS_NAME;
  const data = dataResult.GET_STATS_DATA.STATISTICAL_DATA.DATA_INF.VALUE;
  const columns =
    dataResult.GET_STATS_DATA.STATISTICAL_DATA.CLASS_INF.CLASS_OBJ.map(
      (c) => c['@id']
    );

  const dataMap = new Map<string, { value: number; area: string }[]>();
  for (const row of data) {
    const { $, '@area': area, ...props } = row;
    const value = Number($);
    const currentProps = JSON.stringify(props);
    if (dataMap.has(currentProps)) {
      dataMap.get(currentProps)!.push({ value, area });
    } else {
      dataMap.set(JSON.stringify(props), [{ value, area }]);
    }
  }

  const result = [];
  for (const [props, data] of dataMap.entries()) {
    const corr = calcCorr(data);
    result.push({ props, corr });
  }
  return { name, result };
};

const resultFile = Bun.file('result.csv');
const writer = resultFile.writer();
for (let i = 0; i < dataIds.length; i++) {
  const dataId = dataIds[i];
  const result = await fetchStats(dataId);
  for (const { props, corr } of result.result) {
    if (isNaN(corr)) {
      continue;
    }
    writer.write(`${dataId}\t${result.name}\t${props}\t${corr}\n`);
  }
  writer.flush();
  console.log(`${i + 1}/${dataIds.length} finished`);
}
