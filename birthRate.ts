const areas = [
  { code: '00000', name: '全国' },
  { code: '01000', name: '北海道' },
  { code: '02000', name: '青森県' },
  { code: '03000', name: '岩手県' },
  { code: '04000', name: '宮城県' },
  { code: '05000', name: '秋田県' },
  { code: '06000', name: '山形県' },
  { code: '07000', name: '福島県' },
  { code: '08000', name: '茨城県' },
  { code: '09000', name: '栃木県' },
  { code: '10000', name: '群馬県' },
  { code: '11000', name: '埼玉県' },
  { code: '12000', name: '千葉県' },
  { code: '13000', name: '東京都' },
  { code: '14000', name: '神奈川県' },
  { code: '15000', name: '新潟県' },
  { code: '16000', name: '富山県' },
  { code: '17000', name: '石川県' },
  { code: '18000', name: '福井県' },
  { code: '19000', name: '山梨県' },
  { code: '20000', name: '長野県' },
  { code: '21000', name: '岐阜県' },
  { code: '22000', name: '静岡県' },
  { code: '23000', name: '愛知県' },
  { code: '24000', name: '三重県' },
  { code: '25000', name: '滋賀県' },
  { code: '26000', name: '京都府' },
  { code: '27000', name: '大阪府' },
  { code: '28000', name: '兵庫県' },
  { code: '29000', name: '奈良県' },
  { code: '30000', name: '和歌山県' },
  { code: '31000', name: '鳥取県' },
  { code: '32000', name: '島根県' },
  { code: '33000', name: '岡山県' },
  { code: '34000', name: '広島県' },
  { code: '35000', name: '山口県' },
  { code: '36000', name: '徳島県' },
  { code: '37000', name: '香川県' },
  { code: '38000', name: '愛媛県' },
  { code: '39000', name: '高知県' },
  { code: '40000', name: '福岡県' },
  { code: '41000', name: '佐賀県' },
  { code: '42000', name: '長崎県' },
  { code: '43000', name: '熊本県' },
  { code: '44000', name: '大分県' },
  { code: '45000', name: '宮崎県' },
  { code: '46000', name: '鹿児島県' },
  { code: '47000', name: '沖縄県' },
];

const rawBirthRateData = (await Bun.file('./birth_rate2021.csv').text())
  .split('\n')
  .slice(1)
  .map((l) => ({
    code: areas.find(
      (a) => a.name === l.split(',')[1].substring(1, l.split(',')[1].length - 1)
    )!.code,
    value: Number(l.split(',')[3].substring(1, l.split(',')[3].length - 1)),
  }));

const birthRateDataMean =
  rawBirthRateData.reduce((acc, cur) => acc + cur.value, 0) /
  rawBirthRateData.length;

export const birthRateData = rawBirthRateData.map((d) => ({
  code: d.code,
  value: d.value - birthRateDataMean,
}));

export const birthRateDataStd = Math.sqrt(
  birthRateData.reduce((acc, cur) => acc + cur.value ** 2, 0) /
    birthRateData.length
);
