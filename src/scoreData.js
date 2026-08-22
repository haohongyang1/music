import aiDeMoFaPage1 from './assets/imgs/ai-de-mo-fa-01.jpg'
import aiDeMoFaPage2 from './assets/imgs/ai-de-mo-fa-02.jpg'
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
import dangAiZaiKaoJinPage1 from './assets/imgs/dang-ai-zai-kao-jin-01.jpg'
import fuQinPage1 from './assets/imgs/fuqin.jpg'
import jiMoShaZhouLengPage1 from './assets/imgs/ji-mo-sha-zhou-leng-01.jpg'
import liXiangSanXunPage1 from './assets/imgs/li-xiang-san-xun-01.png'
import manManXiHuanNiPage1 from './assets/imgs/man-man-xi-huan-ni.jpg'
import nuanNuanPage1 from './assets/imgs/nuan-nuan-01.jpg'
import qiYueShangPage1 from './assets/imgs/qi-yue-shang.jpg'
import suiYueShenTouPage1 from './assets/imgs/sui-yue-shen-tou.jpg'
import suiSuiPage1 from './assets/imgs/suisui-1.png'
import suiSuiPage2 from './assets/imgs/suisui-2.jpg'
import suiSuiPage3 from './assets/imgs/suisui-3.jpg'
import xiaTianDeFengPage1 from './assets/imgs/xia-tian-de-feng-01.jpg'
import xiaTianDeFengPage2 from './assets/imgs/xia-tian-de-feng-02.jpg'
import xiaoBanPage1 from './assets/imgs/xiao-ban-01.jpg'
import mingYunPage1 from './assets/imgs/ming-yun-01.jpg'
import mingYunPage2 from './assets/imgs/ming-yun-02.jpg'
import mingYunPage3 from './assets/imgs/ming-yun-03.jpg'
import yuJianPage1 from './assets/imgs/yujian.jpg'
import woXiHuanShangNiShiDeNeiXinHuoDongPage1 from './assets/imgs/wo-xi-huan-shang-ni-shi-de-nei-xin-huo-dong.jpg'
import zheShiJieNaMeDuoRenPage1 from './assets/imgs/zhe-shi-jie-na-me-duo-ren-01.png'
import zheShiJieNaMeDuoRenPage2 from './assets/imgs/zhe-shi-jie-na-me-duo-ren-02.png'
import zheShiJieNaMeDuoRenPage3 from './assets/imgs/zhe-shi-jie-na-me-duo-ren-03.png'

export const STORAGE_KEYS = {
  SPEED: 'score-autoplay-speed',
  SHOW_SECTION_INDICATOR: 'score-show-section-indicator'
}

const rawScores = [
  {
    id: 'ai-de-mo-fa',
    title: '爱的魔法',
    artist: '金莎',
    arranger: '未标注',
    originalKey: '未标注',
    selectedKey: 'C',
    tuning: '标准调弦',
    firstLetter: 'A',
    sortKey: 'ai de mo fa',
    tags: ['和弦歌词谱', '弹唱谱', '2 页'],
    source: '用户提供图片：两页和弦歌词谱',
    summary:
      '两页吉他弹唱谱，主要和弦为 Am、F、G、C，包含前奏、主歌、导歌、副歌与间奏，并标注了对应扫弦节奏。',
    pages: [
      { src: aiDeMoFaPage1, label: '第 1 页', focus: '前奏、主歌' },
      { src: aiDeMoFaPage2, label: '第 2 页', focus: '导歌、副歌、间奏' },
    ],
  },
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
    marks: [
      { id: 'mark-1779614186516', name: 'A', ratio: 0 },
      { id: 'mark-1779614189334', name: 'B', ratio: 0.06770159551530833 },
      { id: 'mark-1779614190825', name: 'C', ratio: 0 },
      { id: 'mark-1779614197700', name: 'D', ratio: 0.3208279430789133 },
      { id: 'mark-1779614201750', name: 'E', ratio: 0 },
      { id: 'mark-1779614204821', name: 'F', ratio: 0.07072013799051315 },
      { id: 'mark-1779614206212', name: 'G', ratio: 0 },
    ],
    playOrder: 'A → B → C → D → E → F → G',
    sections: [
      { id: 'intro', name: '前奏', startRatio: 0, endRatio: 0.12 },
      { id: 'verse-a', name: 'A段', startRatio: 0.12, endRatio: 0.35 },
      { id: 'verse-b', name: 'B段', startRatio: 0.35, endRatio: 0.55 },
      { id: 'interlude', name: '间奏', startRatio: 0.55, endRatio: 0.70 },
      { id: 'chorus-c', name: 'C段', startRatio: 0.70, endRatio: 0.88 },
      { id: 'outro', name: '尾奏', startRatio: 0.88, endRatio: 1.0 },
    ],
    repeats: [
      {
        type: 'segment',
        startSection: 'verse-a',
        endSection: 'verse-b',
        jumpToSection: 'verse-a',
        times: 2
      }
    ]
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
  {
    id: 'dang-ai-zai-kao-jin',
    title: '当爱在靠近',
    artist: '刘若英',
    arranger: '未标注',
    originalKey: '未标注',
    selectedKey: 'C',
    tuning: '标准调弦',
    firstLetter: 'D',
    sortKey: 'dang ai zai kao jin',
    tags: ['和弦歌词谱', '弹唱谱', '1 页'],
    source: '图片内容识别',
    summary:
      '一页吉他弹唱谱，适合弹唱练习。',
    pages: [
      { src: dangAiZaiKaoJinPage1, label: '第 1 页', focus: '完整曲谱' },
    ],
  },
  {
    id: 'fu-qin',
    title: '父亲',
    artist: '筷子兄弟',
    arranger: '未标注',
    originalKey: 'E',
    selectedKey: 'C',
    tuning: '变调夹 4 品',
    firstLetter: 'F',
    sortKey: 'fu qin',
    tags: ['六线谱', '弹唱谱', '1 页'],
    source: '图片标注：筷子兄弟，1=E，变调夹 4 品',
    summary:
      '一页吉他弹唱谱，主要和弦为 C、F、G、Am、Em，含前奏、主歌与副歌，适合配合变调夹 4 品演奏。',
    pages: [
      { src: fuQinPage1, label: '第 1 页', focus: '前奏、主歌、副歌' },
    ],
  },
  {
    id: 'li-xiang-san-xun',
    title: '理想三旬',
    artist: '陈鸿宇',
    arranger: '未标注',
    originalKey: '未标注',
    selectedKey: 'C',
    tuning: '标准调弦',
    firstLetter: 'L',
    sortKey: 'li xiang san xun',
    tags: ['和弦歌词谱', '弹唱谱', '1 页'],
    source: '图片内容识别',
    summary:
      '一页吉他弹唱谱，适合弹唱练习。',
    pages: [
      { src: liXiangSanXunPage1, label: '第 1 页', focus: '完整曲谱' },
    ],
  },
  {
    id: 'lan-lian-hua',
    title: '蓝莲花',
    artist: '许巍',
    arranger: '有谱么 APP',
    originalKey: '未标注',
    selectedKey: '未标注',
    tuning: 'APP 曲谱',
    firstLetter: 'L',
    sortKey: 'lan lian hua',
    tags: ['有谱么 APP', '外部曲谱'],
    source: '曲谱位于有谱么 APP',
    summary:
      '这首曲谱暂不存放本地图片，已作为外部来源条目收录在列表中，需要在有谱么 APP 内查看。',
    pages: [],
    externalSource: {
      label: '有谱么 APP',
      description: '打开有谱么 APP 搜索《蓝莲花》查看曲谱。',
    },
  },
  {
    id: 'ji-mo-sha-zhou-leng',
    title: '寂寞沙洲冷',
    artist: '未标注',
    arranger: '革命吉他制造',
    originalKey: 'G',
    selectedKey: 'G',
    tuning: '标准调弦',
    firstLetter: 'J',
    sortKey: 'ji mo sha zhou leng',
    tags: ['六线谱', '弹唱谱', '1 页'],
    source: '图片标注：革命吉他制造，1=G，4/4，含笑微信 GEMINGJITA',
    summary:
      '单页吉他弹唱谱，图片标注 1=G、4/4，主要和弦包含 G、C、D/F#、Bm、Em、D，含前奏、主歌与尾段。',
    pages: [
      { src: jiMoShaZhouLengPage1, label: '第 1 页', focus: '完整曲谱' },
    ],
  },
  {
    id: 'man-man-xi-huan-ni',
    title: '慢慢喜欢你',
    artist: '莫文蔚',
    arranger: '岛屿吉他',
    originalKey: 'G',
    selectedKey: 'G',
    tuning: '标准调弦',
    firstLetter: 'M',
    sortKey: 'man man xi huan ni',
    tags: ['和弦歌词谱', '弹唱谱', '1 页'],
    source: '图片标注：岛屿吉他，原 key G，选调 G',
    summary:
      '一页吉他弹唱谱，主要和弦包含 G、E7、C、Am7、A7、Bm、Cm、B7、Dm、D、Dsus4、Bbm，标注 A、B 段扫弦节奏。',
    pages: [
      { src: manManXiHuanNiPage1, label: '第 1 页', focus: '完整曲谱' },
    ],
  },
  {
    id: 'qi-yue-shang',
    title: '七月上',
    artist: 'Jam',
    arranger: '大树老师',
    originalKey: 'bB',
    selectedKey: 'C',
    tuning: '吉他标准音降半调',
    firstLetter: 'Q',
    sortKey: 'qi yue shang',
    tags: ['和弦歌词谱', '弹唱谱', '1 页'],
    source: '图片标注：大树乐器，原调 bB，选调 C（吉他标准音降半调变回原调）',
    summary:
      '一页吉他弹唱谱，词曲 Jam，主要和弦为 C、G、Am7、F、Dm7，含前奏扫弦与节奏型标注。',
    pages: [
      { src: qiYueShangPage1, label: '第 1 页', focus: '前奏、主歌、副歌' },
    ],
  },
  {
    id: 'nuan-nuan',
    title: '暖暖',
    artist: '梁静茹',
    arranger: '未标注',
    originalKey: '未标注',
    selectedKey: 'C',
    tuning: '标准调弦',
    firstLetter: 'N',
    sortKey: 'nuan nuan',
    tags: ['和弦歌词谱', '弹唱谱', '1 页'],
    source: '图片内容识别',
    summary:
      '一页吉他弹唱谱，适合弹唱练习。',
    pages: [
      { src: nuanNuanPage1, label: '第 1 页', focus: '完整曲谱' },
    ],
  },
  {
    id: 'sui-yue-shen-tou',
    title: '岁月神偷',
    artist: '金玟岐',
    arranger: '大树老师Roger',
    originalKey: 'G',
    selectedKey: 'G',
    tuning: '标准调弦',
    firstLetter: 'S',
    sortKey: 'sui yue shen tou',
    tags: ['和弦歌词谱', '弹唱谱', '1 页'],
    source: '图片标注：大树乐器，原调 G，选调 G',
    summary:
      '一页吉他弹唱谱，主要和弦为 G、D/#F、Em、Bm7、C、Am7、D，含前奏、A 段、B 段与两种节奏型标注。',
    pages: [
      { src: suiYueShenTouPage1, label: '第 1 页', focus: '前奏、A 段、B 段' },
    ],
  },
  {
    id: 'sui-sui',
    title: '岁岁',
    artist: '任素汐',
    arranger: '尼克猫',
    originalKey: 'E',
    selectedKey: 'C',
    tuning: '变调夹 4 品',
    firstLetter: 'S',
    sortKey: 'sui sui',
    tags: ['指弹谱', '弹唱谱', '3 页'],
    source: '图片标注：电视剧《故乡，别来无恙》重逢曲，1=E，C 把位，Capo=4',
    summary:
      '三页吉他弹唱谱，主和弦围绕 C、Fmaj7、G、Em、Am 展开，包含前奏、主歌、副歌与尾段，适合配合变调夹 4 品演奏。',
    pages: [
      { src: suiSuiPage1, label: '第 1 页', focus: '前奏、主歌前半' },
      { src: suiSuiPage2, label: '第 2 页', focus: '主歌后半、副歌前半' },
      { src: suiSuiPage3, label: '第 3 页', focus: '副歌后半、尾段' },
    ],
  },
  {
    id: 'xiao-ban',
    title: '小半',
    artist: '陈粒',
    arranger: '岛屿吉他',
    originalKey: 'G',
    selectedKey: 'G',
    tuning: '标准调弦',
    firstLetter: 'X',
    sortKey: 'xiao ban',
    tags: ['和弦歌词谱', '弹唱谱', '1 页'],
    source: '图片标注：岛屿吉他，原 key G，选调 G',
    summary:
      '一页吉他弹唱谱，主要和弦为 G、E、C、Am、Cmaj7、Em、D，标注了 A、B 段扫弦节奏与根音弹奏位置。',
    pages: [
      { src: xiaoBanPage1, label: '第 1 页', focus: '完整曲谱' },
    ],
  },
  {
    id: 'ming-yun',
    title: '命运',
    artist: '未标注',
    arranger: '革命吉他制造',
    originalKey: 'C',
    selectedKey: 'C',
    tuning: '标准调弦',
    firstLetter: 'M',
    sortKey: 'ming yun',
    tags: ['六线谱', '弹唱谱', '3 页'],
    source: '图片标注：革命吉他制造，含笑微信 GEMINGJITA',
    summary:
      '三页吉他弹唱谱，主要和弦包含 C、G、Am、Em、F、Dm 等，含前奏、主歌与副歌。',
    pages: [
      { src: mingYunPage1, label: '第 1 页', focus: '前奏、主歌前半' },
      { src: mingYunPage2, label: '第 2 页', focus: '主歌后半' },
      { src: mingYunPage3, label: '第 3 页', focus: '副歌、尾段' },
    ],
  },
  {
    id: 'xia-tian-de-feng',
    title: '夏天的风',
    artist: '温岚',
    arranger: '革命吉他',
    originalKey: 'D',
    selectedKey: 'D',
    tuning: '变调夹 2 品',
    firstLetter: 'X',
    sortKey: 'xia tian de feng',
    tags: ['六线谱', '弹唱谱', '2 页'],
    source: '图片标注：革命吉他制谱，1=D，4/4，变调夹 2 品',
    summary:
      '两页吉他弹唱谱，含前奏、主歌、副歌与反复段落。主要和弦围绕 Fmaj7、G、Em7、Am7、Dm7、C 展开，适合练习稳定分解与扫弦转换。',
    pages: [
      { src: xiaTianDeFengPage1, label: '第 1 页', focus: '前奏、主歌、副歌前半' },
      { src: xiaTianDeFengPage2, label: '第 2 页', focus: '副歌后半、反复与结尾' },
    ],
  },
  {
    id: 'yu-jian',
    title: '遇见',
    artist: '孙燕姿',
    arranger: '尼克猫',
    originalKey: '#G',
    selectedKey: 'G',
    tuning: '变调夹 1 品',
    firstLetter: 'Y',
    sortKey: 'yu jian',
    tags: ['六线谱', '弹唱谱', '1 页'],
    source: '图片标注：词易家扬，曲林一峰，原 key #G，选 G，变调夹 1 品',
    summary:
      '一页吉他弹唱谱，主要和弦为 G、D、Em、C，编配以分解与扫弦节奏为主，适合配合变调夹 1 品演奏。',
    pages: [
      { src: yuJianPage1, label: '第 1 页', focus: '完整曲谱' },
    ],
  },
  {
    id: 'wo-xi-huan-shang-ni-shi-de-nei-xin-huo-dong',
    title: '我喜欢上你时的内心活动',
    artist: '陈绮贞',
    arranger: '岛屿吉他',
    originalKey: 'C',
    selectedKey: 'C',
    tuning: '标准调弦',
    firstLetter: 'W',
    sortKey: 'wo xi huan shang ni shi de nei xin huo dong',
    tags: ['和弦歌词谱', '弹唱谱', '1 页'],
    source: '图片标注：岛屿吉他，词韩寒，曲陈光荣，原唱陈绮贞，原 key C，选 C',
    summary:
      '一页吉他和弦歌词谱，包含前奏、A 段、间奏和 B 段，主要和弦为 C、C7、Am、Dm、Em7、F、Fm、G7、G，适合 C 调弹唱练习。',
    pages: [
      { src: woXiHuanShangNiShiDeNeiXinHuoDongPage1, label: '第 1 页', focus: '前奏、A 段、间奏、B 段' },
    ],
  },
  {
    id: 'zhe-shi-jie-na-me-duo-ren',
    title: '这世界那么多人',
    artist: '莫文蔚',
    arranger: '革命吉他制谱',
    originalKey: 'B',
    selectedKey: 'G',
    tuning: '变调夹 4 品',
    firstLetter: 'Z',
    sortKey: 'zhe shi jie na me duo ren',
    tags: ['六线谱', '弹唱谱', '3 页'],
    source: '图片标注：革命吉他制谱，1=B，变调夹 4 品',
    summary:
      '三页吉他六线谱，主要和弦围绕 G、D、Em、C、Am7 等展开，包含前奏、主歌、副歌与尾段，适合配合变调夹 4 品演奏。',
    pages: [
      { src: zheShiJieNaMeDuoRenPage1, label: '第 1 页', focus: '前奏、主歌前半' },
      { src: zheShiJieNaMeDuoRenPage2, label: '第 2 页', focus: '主歌后半、副歌' },
      { src: zheShiJieNaMeDuoRenPage3, label: '第 3 页', focus: '副歌收束、尾段' },
    ],
  },
]

export const scores = rawScores
  .map((score) => {
    const pages = score.pages || []

    return {
      ...score,
      pages,
      pageCount: pages.length,
      thumbnail: pages[0]?.src || null,
    }
  })
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

export function getSectionAtPosition(position, maxScroll, clientHeight, sections) {
  if (!sections?.length) return null

  const maxScrollSafe = maxScroll || 1
  const scrollHeight = maxScrollSafe + (clientHeight || 0)
  const centerPosition = position + (clientHeight || 0) / 2
  const positionRatio = Math.min(1, Math.max(0, centerPosition / scrollHeight))

  return sections.find(s =>
    positionRatio >= s.startRatio &&
    positionRatio < s.endRatio
  ) || null
}

export function getNextSection(currentSectionId, sections) {
  if (!sections?.length) return null

  const currentIndex = sections.findIndex(s => s.id === currentSectionId)
  if (currentIndex === -1 || currentIndex >= sections.length - 1) return null

  return sections[currentIndex + 1]
}

export function validateScoreData(score) {
  if (!score.sections) return true

  for (let i = 0; i < score.sections.length; i++) {
    const s = score.sections[i]
    if (s.startRatio >= s.endRatio) {
      console.warn(`[Validation] Invalid section ${s.id}: startRatio >= endRatio`)
      return false
    }
    if (i > 0) {
      const prev = score.sections[i - 1]
      if (prev.endRatio > s.startRatio) {
        console.warn(`[Validation] Overlapping sections: ${prev.id} and ${s.id}`)
        return false
      }
    }
  }

  if (!score.repeats) return true

  for (const r of score.repeats) {
    if (!score.sections?.find(s => s.id === r.fromSection)) {
      console.warn(`[Validation] Invalid repeat: fromSection ${r.fromSection} not found`)
      return false
    }
    if (!score.sections?.find(s => s.id === r.toSection)) {
      console.warn(`[Validation] Invalid repeat: toSection ${r.toSection} not found`)
      return false
    }
    if (r.times < 1) {
      console.warn(`[Validation] Invalid repeat: times must be >= 1`)
      return false
    }
  }

  return true
}
