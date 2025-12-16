import { FaithStatus } from './types';

export const BIBLE_VERSIONS = [
  { code: 'NIV', name: 'New International Version (NIV)', lang: 'English' },
  { code: 'ESV', name: 'English Standard Version (ESV)', lang: 'English' },
  { code: 'KJV', name: 'King James Version (KJV)', lang: 'English' },
  { code: 'NASB', name: 'New American Standard Bible (NASB)', lang: 'English' },
  { code: 'CUV', name: 'Chinese Union Version (CUV - 和合本)', lang: 'Chinese' },
  { code: 'RCUV', name: 'Revised Chinese Union Version (RCUV - 和合本修订版)', lang: 'Chinese' },
  { code: 'LUTH', name: 'Luther Bible', lang: 'German' },
  { code: 'RVR60', name: 'Reina-Valera 1960', lang: 'Spanish' },
];

export const DENOMINATIONS = [
  'Non-Denominational',
  'Baptist',
  'Catholic',
  'Methodist',
  'Presbyterian',
  'Pentecostal/Charismatic',
  'Lutheran',
  'Anglican/Episcopal',
  'Orthodox',
  'Reformed',
  'Other'
];

export const LANGUAGE_OPTIONS = [
  { code: 'English', label: 'English' },
  { code: 'Chinese (Simplified)', label: '中文 (简体)' },
  { code: 'Chinese (Traditional)', label: '中文 (繁體)' },
  { code: 'Spanish', label: 'Español' },
  { code: 'German', label: 'Deutsch' },
  { code: 'French', label: 'Français' },
  { code: 'Korean', label: '한국어' },
  { code: 'Portuguese', label: 'Português' }
];

export const LANGUAGES = LANGUAGE_OPTIONS.map(l => l.code);

export const FAITH_STATUS_OPTIONS = [
  { value: FaithStatus.BELIEVER, label: 'I am a Believer', desc: 'I want to deepen my walk with God.' },
  { value: FaithStatus.SEEKER, label: 'I am a Seeker', desc: 'I have questions and am looking for answers.' },
  { value: FaithStatus.LEADER, label: 'I am a Church Leader', desc: 'I need tools for sermons and ministry.' },
  { value: FaithStatus.SKEPTIC, label: 'I am Curious', desc: 'I want to understand what the Bible says.' },
];

// Simple hardcoded verses for the ticker (can be expanded)
export const DAILY_VERSES = [
    { 
      en: { text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", ref: "Jeremiah 29:11" },
      zh: { text: "耶和华说：我知道我向你们所怀的意念是赐平安的意念，不是降灾祸的意念，要叫你们末后有指望。", ref: "耶利米书 29:11" }
    },
    {
      en: { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
      zh: { text: "耶和华是我的牧者，我必不致缺乏。", ref: "诗篇 23:1" }
    },
    {
      en: { text: "I can do all things through him who strengthens me.", ref: "Philippians 4:13" },
      zh: { text: "我靠着那加给我力量的，凡事都能做。", ref: "腓立比书 4:13" }
    },
    {
      en: { text: "But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness.", ref: "Galatians 5:22" },
      zh: { text: "圣灵所结的果子，就是仁爱、喜乐、和平、忍耐、恩慈、良善、信实。", ref: "加拉太书 5:22" }
    }
];

export const UI_TRANSLATIONS: Record<string, any> = {
  'English': {
    denominations: [
      'Non-Denominational', 'Baptist', 'Catholic', 'Methodist', 'Presbyterian', 
      'Pentecostal/Charismatic', 'Lutheran', 'Anglican/Episcopal', 'Orthodox', 'Reformed', 'Other'
    ],
    common: {
        rateLimit: "You have reached your daily limit of 30 messages. Please seek God's peace and return tomorrow.",
        dailyVerse: "Daily Verse",
        quizBtn: "Take Quiz",
        comingSoon: "Coming Soon",
        advancedQaTitle: "Deep Study",
        advancedQaDesc: "Analyze original texts (Hebrew/Greek), historical context, and theological themes.",
        errorGeneric: "An error occurred while connecting to the service. Please try again.",
    },
    onboarding: {
      welcome: "Welcome to BibleAI",
      langStep: "Let's personalize your spiritual journey. First, what is your preferred language?",
      journeyTitle: "Your Journey",
      journeyDesc: "How would you describe your current walk with faith?",
      bgTitle: "Church Background",
      bgDesc: "This helps our Pastor AI understand your theological context.",
      versionLabel: "Preferred Bible Version",
      startBtn: "Start My Journey",
      faithOptions: {
        [FaithStatus.BELIEVER]: { label: 'I am a Believer', desc: 'I want to deepen my walk with God.' },
        [FaithStatus.SEEKER]: { label: 'I am a Seeker', desc: 'I have questions and am looking for answers.' },
        [FaithStatus.LEADER]: { label: 'I am a Church Leader', desc: 'I need tools for sermons and ministry.' },
        [FaithStatus.SKEPTIC]: { label: 'I am Curious', desc: 'I want to understand what the Bible says.' },
      }
    },
    nav: {
      menu: "Menu",
      search: "Scripture Search",
      pastor: "Deep Study",
      prayer: "Prayer Room",
      quiz: "Bible Quiz",
      sub: "Premium Plan",
      settings: "Settings",
      account: "Account"
    },
    search: {
      title: "Scripture Search",
      subtitle: (ver: string) => `Find verses in the ${ver} Bible concerning any topic or keyword.`,
      placeholder: "e.g. 'Love your neighbor', 'Anxiety', 'John 3:16'",
      button: "Search",
      loading: "Searching...",
      resultsTitle: (ver: string) => `Results from ${ver}`,
      share: "Share Results"
    },
    chat: {
      placeholder: "Type a message...",
      pastorPlaceholder: "Ask about original text, history, or theology...",
      aiFooter: "AI answers are generated based on your selected Bible version. Always verify with original texts.",
      consulting: "Consulting scripture...",
      emptyPastor: "Enter a topic to receive original text analysis (Hebrew/Greek), historical context, and theological reading recommendations.",
      emptyPrayer: "What should we pray for today?",
      you: "You",
      viewReferences: "View Related Verses"
    },
    quiz: {
      title: "Bible Quiz",
      startBtn: "Start Daily Challenge",
      loading: "Preparing your quiz...",
      question: "Question",
      next: "Next Question",
      finish: "See Results",
      scoreTitle: "Quiz Complete!",
      scoreDesc: "You scored",
      alreadyPlayed: "You've already played today!",
      comeBack: "Come back tomorrow for new questions.",
      correct: "Correct!",
      wrong: "Incorrect"
    },
    sub: {
      title: "Unlock Full Spiritual Depth",
      desc: "Our premium features are currently under development. Stay tuned for deeper theological tools.",
      free: "Free Plan",
      pro: "Disciple Pro",
      rec: "TO BE RELEASED",
      trial: "Notify Me When Available",
      current: "Current Plan",
      feature1: "Deep Theological Exegesis",
      feature2: "Unlimited Prayer Generation",
      feature3: "Sermon Builder"
    },
    settings: {
        title: "Settings",
        denom: "Denomination",
        version: "Bible Version",
        reset: "Reset Preferences"
    }
  },
  'Chinese (Simplified)': {
    denominations: [
      '非宗派教会 (Non-Denominational)', '浸信会 (Baptist)', '天主教 (Catholic)', '卫理公会 (Methodist)', 
      '长老会 (Presbyterian)', '五旬节派/灵恩派 (Pentecostal)', '路德宗 (Lutheran)', '圣公会 (Anglican)', 
      '东正教 (Orthodox)', '改革宗 (Reformed)', '其他 (Other)'
    ],
    common: {
        rateLimit: "您已达到每日 30 条消息的限制。请安息主怀，明天再来。",
        dailyVerse: "每日金句",
        quizBtn: "挑战测试",
        comingSoon: "即将推出",
        advancedQaTitle: "深度研经",
        advancedQaDesc: "分析圣经原文（希伯来文/希腊文）、历史背景及神学主题。",
        errorGeneric: "连接服务时发生错误。请稍后重试。",
    },
    onboarding: {
      welcome: "欢迎来到 BibleAI",
      langStep: "让我们为您定制属灵旅程。首先，您偏好的语言是？",
      journeyTitle: "您的信仰旅程",
      journeyDesc: "您如何描述目前的信仰状态？",
      bgTitle: "教会背景",
      bgDesc: "这有助于AI牧师了解您的神学背景。",
      versionLabel: "偏好的圣经版本",
      startBtn: "开始我的旅程",
      faithOptions: {
        [FaithStatus.BELIEVER]: { label: '我是信徒', desc: '我希望加深与神的关系。' },
        [FaithStatus.SEEKER]: { label: '我是慕道友', desc: '我有疑问，正在寻找答案。' },
        [FaithStatus.LEADER]: { label: '我是教会领袖', desc: '我需要讲章和事工辅助工具。' },
        [FaithStatus.SKEPTIC]: { label: '我很好奇', desc: '我想了解圣经到底讲了什么。' },
      }
    },
    nav: {
      menu: "菜单",
      search: "经文查询",
      pastor: "深度研经",
      prayer: "祷告室",
      quiz: "圣经测试",
      sub: "高级会员",
      settings: "设置",
      account: "账户"
    },
    search: {
      title: "经文查询",
      subtitle: (ver: string) => `在 ${ver} 圣经中查找相关经文或主题。`,
      placeholder: "例如：'爱邻舍'，'焦虑'，'约翰福音 3:16'",
      button: "搜索",
      loading: "搜索中...",
      resultsTitle: (ver: string) => `${ver} 搜索结果`,
      share: "分享结果"
    },
    chat: {
      placeholder: "输入消息...",
      pastorPlaceholder: "询问原文解析、历史背景或神学问题...",
      aiFooter: "AI 回答基于您选择的圣经版本生成。请务必查证原文。",
      consulting: "正在查考圣经...",
      emptyPastor: "请输入主题以获取原文解析（希伯来文/希腊文）、历史背景及相关神学阅读推荐。",
      emptyPrayer: "今天我们为什么祷告？",
      you: "你",
      viewReferences: "查看相关章节"
    },
    quiz: {
      title: "圣经测试",
      startBtn: "开始今日挑战",
      loading: "正在准备考题...",
      question: "问题",
      next: "下一题",
      finish: "查看结果",
      scoreTitle: "测验完成！",
      scoreDesc: "您的得分",
      alreadyPlayed: "您今天已经完成测验了！",
      comeBack: "请明天再来挑战新的题目。",
      correct: "回答正确！",
      wrong: "回答错误"
    },
    sub: {
      title: "解锁属灵深度",
      desc: "我们的高级功能正在开发中。敬请期待更深层的神学工具。",
      free: "免费计划",
      pro: "门徒 Pro",
      rec: "即将推出",
      trial: "上线时通知我",
      current: "当前计划",
      feature1: "深度神学释经",
      feature2: "无限次祷告生成",
      feature3: "讲章构建工具"
    },
    settings: {
        title: "设置",
        denom: "教派 / 宗派",
        version: "圣经版本",
        reset: "重置偏好设置"
    }
  }
};

export const getText = (lang: string) => {
    return UI_TRANSLATIONS[lang] || UI_TRANSLATIONS['English'];
}