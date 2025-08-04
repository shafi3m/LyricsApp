export const translations = {
  en: {
    not_provided: "Not provided",
    // Header
    home: "Home",
    categories: "Categories",
    about: "About",

    // Home page
    title: "Rida-e-Bakhshish",
    subtitle:
      "Discover the poetry of Allama Qalandar Razvi Sahab in English and Urdu",
    searchPlaceholder: "Type here to search...",
    featuredPoems: "Featured Poems",
    viewAll: "View All",
    searchResults: "Search Results",

    // Categories
    browseCategories: "Browse Categories",
    exploreCollection:
      "Explore the collection of Hamd, Naath, Manqabaat and much more",
    filters: "Filters",
    allCategories: "All",
    allLanguages: "All Languages",
    allPoems: "All Poems",

    // Poem detail
    goBack: "Go back",
    description: "Description",

    // General
    english: "English",
    urdu: "اردو",
    both: "Both",
    noPoems: "No poems found.",
    loading: "Loading...",

    // Stats
    totalPoems: "15+",
    languages: "2",
    spiritualPeace: "∞",
    sacredPoems: "Growing Collection",
    languagesText: "Languages",
    spiritualPeaceText: "Spiritual Peace",

    // About
    aboutTitle: "About Rida-e-Bakhshish",
    aboutSubtitle: "A digital sanctuary for the timeless kalaam",

    // Footer
    footerTagline: "A Beautiful Glimpse into Naatiya Literature",
    footerCopyright:
      "© 2025 Rida-e-Bakhshish. Preserving spiritual poetry in English & Urdu, built with care and purpose.",
  },
  ur: {
    not_provided: "مہیا نہیں کی گئی",
    // Header
    home: "ہوم",
    categories: "کیٹگری",
    about: "تعارف",

    // Home page
    title: "ردائے بخشش",
    subtitle: "انگریزی اور اردو میں خوبصورت مذہبی شاعری دریافت کریں",
    searchPlaceholder: "تلاش کرنے کے لیے یہاں لکھیں...",
    featuredPoems: "مایاں نظمیں",
    viewAll: " تمام کلام",
    searchResults: "تلاش کے نتائج",

    // Categories
    browseCategories: "  زمرے دیکھیں",
    exploreCollection:
      "کیٹگری اور زبانوں کے مطابق منظم مذہبی شاعری کا ہمارا مجموعہ دیکھیں",
    filters: "فلٹرز",
    allCategories: "تمام کیٹگری",
    allLanguages: "تمام زبانیں",
    allPoems: "تمام نظمیں",

    // Poem detail
    goBack: " واپس جائیں",
    description: "شائع شدہ",

    // General
    english: "English",
    urdu: "اردو",
    both: "دونوں",
    noPoems: "کوئی نظم نہیں ملی۔",
    loading: "لوڈ ہو رہا ہے...",

    // Stats
    totalPoems: "15+",
    languages: "2",
    spiritualPeace: "∞",
    sacredPoems: "سعت مجموعہ ",
    languagesText: "زبانیں",
    spiritualPeaceText: "روحانی سکون",

    // About
    aboutTitle: "رداۓ بخشش کا تعارف",
    aboutSubtitle: "روحانی کلام کا ایک آن لائن مسکن",

    // Footer
    footerTagline: "نعتیہ ادب کی حسین جھلک",
    footerCopyright:
      "© 2025 رداۓ بخشش۔ اردو و انگریزی میں روحانی کلام کو محفوظ رکھنے کی ایک کوشش۔",
  },
};

export const getTranslation = (key, language) => {
  return translations[language]?.[key] || translations.en[key] || key;
};
