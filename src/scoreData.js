import redHighHeelsPage1 from './assets/imgs/hong-se-gao-gen-xie-01.jpg'
import redHighHeelsPage2 from './assets/imgs/hong-se-gao-gen-xie-02.jpg'
import redHighHeelsPage3 from './assets/imgs/hong-se-gao-gen-xie-03.jpg'
import redHighHeelsPage4 from './assets/imgs/hong-se-gao-gen-xie-04.jpg'
import huGuangShengPage1 from './assets/imgs/hu-guang-sheng-01.jpg'
import huGuangShengPage2 from './assets/imgs/hu-guang-sheng-02.jpg'
import shengXiaDeGuoShiPage1 from './assets/imgs/sheng-xia-de-guo-shi-01.jpg'
import daoJiangXingPage1 from './assets/imgs/dao-jiang-xing-01.jpg'
import daoJiangXingPage2 from './assets/imgs/dao-jiang-xing-02.jpg'
import daoJiangXingPage3 from './assets/imgs/dao-jiang-xing-03.jpg'

const rawScores = [
  {
    id: 'hong-se-gao-gen-xie',
    title: '红色高跟鞋',
    artist: '蔡健雅',
    arranger: '大树音乐屋',
    originalKey: 'D',
    selectedKey: 'C',
    tuning: '标准调弦',
    firstLetter: 'H',
    sortKey: 'hong se gao gen xie',
    tags: ['指弹节奏', '弹唱谱', '4 页'],
    source: '图片标注：大树音乐屋，选调 C，原调 D',
    summary:
      '四页吉他六线谱，包含前奏、A 段、B 段、间奏、C 段与尾奏。主和弦围绕 Fmaj7、G、Am7、C、D、Fm 展开，适合练习稳定扫弦与闷音节奏。',
    pages: [
      { src: redHighHeelsPage1, label: '第 1 页', focus: '前奏、A 段、B 段' },
      { src: redHighHeelsPage2, label: '第 2 页', focus: '间奏、C 段' },
      { src: redHighHeelsPage3, label: '第 3 页', focus: 'C 段延展、尾奏' },
      { src: redHighHeelsPage4, label: '第 4 页', focus: '尾奏收束' },
    ],
  },
  {
    id: 'sheng-xia-de-guo-shi',
    title: '盛夏的果实',
    artist: '莫文蔚',
    arranger: '未标注',
    originalKey: '未标注',
    selectedKey: 'C',
    tuning: '标准调弦',
    firstLetter: 'S',
    sortKey: 'sheng xia de guo shi',
    tags: ['和弦歌词谱', '弹唱谱', '1 页'],
    source: '图片内容识别：C 调和弦歌词谱',
    summary:
      '一页长图和弦歌词谱，主要和弦为 C、G、Am、Em、F。适合按歌词推进弹唱，自动播放速度默认更慢，便于跟唱换和弦。',
    pages: [
      {
        src: shengXiaDeGuoShiPage1,
        label: '第 1 页',
        focus: '主歌、副歌与反复段落',
      },
    ],
  },
  {
    id: 'dao-jiang-xing',
    title: '盗将行',
    artist: '花粥 / 马雨阳',
    arranger: '未标注',
    originalKey: 'D',
    selectedKey: 'C',
    tuning: '标准调弦',
    firstLetter: 'D',
    sortKey: 'dao jiang xing',
    tags: ['和弦歌词谱', '指弹前奏', '3 页'],
    source: '图片标注：原唱调 1=D，拍号 4/4',
    summary:
      '三页和弦歌词谱，含前奏、间奏、副歌与尾奏。主要和弦为 Fmaj7、G、Em、Am，适合慢速跟唱并练习前奏与尾奏的分解节奏。',
    pages: [
      { src: daoJiangXingPage1, label: '第 1 页', focus: '前奏、主歌、副歌' },
      { src: daoJiangXingPage2, label: '第 2 页', focus: '间奏、主歌推进' },
      { src: daoJiangXingPage3, label: '第 3 页', focus: '副歌收束、尾奏' },
    ],
  },
  {
    id: 'hu-guang-sheng',
    title: '胡广生',
    artist: '任素汐',
    arranger: '杨可爱',
    originalKey: 'D',
    selectedKey: 'C',
    tuning: '标准调弦',
    firstLetter: 'H',
    sortKey: 'hu guang sheng',
    tags: ['分解和弦', '弹唱谱', '2 页'],
    source: '图片标注：原调 D 调，选调 C 调',
    summary:
      '两页吉他弹唱谱，编配以 Am7、Em7、F、G、Em、Am、C 等和弦为主，前半段分解和弦清晰，后半段加入持续反复与收束。',
    pages: [
      { src: huGuangShengPage1, label: '第 1 页', focus: '前奏、主歌与第一段推进' },
      { src: huGuangShengPage2, label: '第 2 页', focus: '后半段反复与结尾' },
    ],
  },
]

export const scores = rawScores
  .map((score) => ({
    ...score,
    pageCount: score.pages.length,
    thumbnail: score.pages[0].src,
  }))
  .sort((a, b) => a.sortKey.localeCompare(b.sortKey, 'en'))

export const scoreGroups = scores.reduce((groups, score) => {
  const group = groups.find((item) => item.letter === score.firstLetter)
  if (group) {
    group.scores.push(score)
  } else {
    groups.push({ letter: score.firstLetter, scores: [score] })
  }
  return groups
}, [])

export function getScoreById(scoreId) {
  return scores.find((score) => score.id === scoreId)
}

export function getAdjacentScores(scoreId) {
  const index = scores.findIndex((score) => score.id === scoreId)

  if (index === -1) {
    return { previous: null, next: null }
  }

  return {
    previous: scores[(index - 1 + scores.length) % scores.length],
    next: scores[(index + 1) % scores.length],
  }
}
