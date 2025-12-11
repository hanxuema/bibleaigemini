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

export const LANGUAGES = [
  'English',
  'Chinese (Simplified)',
  'Chinese (Traditional)',
  'Spanish',
  'German',
  'French',
  'Korean',
  'Portuguese'
];

export const FAITH_STATUS_OPTIONS = [
  { value: FaithStatus.BELIEVER, label: 'I am a Believer', desc: 'I want to deepen my walk with God.' },
  { value: FaithStatus.SEEKER, label: 'I am a Seeker', desc: 'I have questions and am looking for answers.' },
  { value: FaithStatus.LEADER, label: 'I am a Church Leader', desc: 'I need tools for sermons and ministry.' },
  { value: FaithStatus.SKEPTIC, label: 'I am Curious', desc: 'I want to understand what the Bible says.' },
];

export const UI_TRANSLATIONS: Record<string, any> = {
  'English': {
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
      pastor: "Pastor Chat",
      prayer: "Prayer Room",
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
      aiFooter: "AI answers are generated based on your selected Bible version. Always verify with original texts.",
      consulting: "Consulting scripture...",
      emptyPastor: "Ask a theological question or seek advice to begin.",
      emptyPrayer: "What should we pray for today?",
      you: "You"
    },
    sub: {
      title: "Unlock Full Spiritual Depth",
      desc: "Support our mission and gain access to deeper theological insights, unlimited prayer generation, and church leader tools.",
      free: "Free Plan",
      pro: "Disciple Pro",
      rec: "RECOMMENDED",
      trial: "Start Free Trial",
      current: "Current Plan"
    },
    settings: {
        title: "Settings",
        denom: "Denomination",
        version: "Bible Version",
        reset: "Reset Preferences"
    }
  },
  'Chinese (Simplified)': {
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
      pastor: "牧师问答",
      prayer: "祷告室",
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
      aiFooter: "AI 回答基于您选择的圣经版本生成。请务必查证原文。",
      consulting: "正在查考圣经...",
      emptyPastor: "请提出神学问题或寻求建议以开始。",
      emptyPrayer: "今天我们为什么祷告？",
      you: "你"
    },
    sub: {
      title: "解锁属灵深度",
      desc: "支持我们的事工，解锁更深层的神学见解、无限次祷告生成和教会领袖工具。",
      free: "免费计划",
      pro: "门徒 Pro",
      rec: "推荐",
      trial: "开始免费试用",
      current: "当前计划"
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