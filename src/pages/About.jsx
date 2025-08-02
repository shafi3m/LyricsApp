import React from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getTranslation } from "../utils/translations";
import {
  BookOpenIcon,
  HeartIcon,
  GlobeAltIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

const About = () => {
  const { language } = useTheme();

  const features = [
    {
      icon: BookOpenIcon,
      titleEn: "Rich Collection",
      titleUr: "بھرپور مجموعہ",
      descriptionEn:
        "Curated Islamic poetry from Allama Qalandar Razvi Sahab Qibla.",
      descriptionUr:
        "دل کو چھو لینے والے وہ اشعار جو دل میں نور، ذہن میں سکون اور روح میں عشق پیدا کریں۔",
    },
    {
      icon: GlobeAltIcon,
      titleEn: "Multilingual Support",
      titleUr: "کثیر لسانی سہولت",
      descriptionEn:
        "Read poems in English and Urdu with seamless language switching.",
      descriptionUr: "اردو یا انگریزی میں صرف ایک کلک سے۔",
    },
    {
      icon: HeartIcon,
      titleEn: "Spiritual Connection",
      titleUr: "روحانی رابطہ",
      descriptionEn:
        "Feel the love for the Prophet ﷺ through heartfelt verses.",
      descriptionUr: "نعتیہ کلام سے عشقِ رسول ﷺ کی جھلک۔",
    },
    {
      icon: SparklesIcon,
      titleEn: "Beautiful Design",
      titleUr: "خوبصورت ڈیزائن",
      descriptionEn:
        "Enjoy poetry in a clean, modern interface with dark mode support.",
      descriptionUr: "صاف، جدید انٹرفیس میں شاعری کا لطف اٹھائیں۔",
    },
  ];

  const aboutContent = {
    en: {
      author: "Author",
      authorText:
        "Hazrat Allama Maulana Hafiz-o-Qari Muhammad Qalandar Razvi Sahab Qibla, Sheikh-ul-Hadith, Jamia Raza-e-Mustafa, Gulshan-e-Razvi, Raichur, Karnataka.",
      aim: "Our Aim",
      aimText:
        "Our aim is to provide easy access to categorized, searchable, and authentic verses in the form of Naath, Manqabat, Hamd, and more.",

      team: "Development Team",
      teamText:
        "This project was developed with love and dedication to serve the global community of believers. We welcome contributions and feedback to improve this platform.",
    },
    ur: {
      author: " مصنف",
      authorText:
        "حضرت علامہ مولانا حافظ و قاری محمد قلندر رضوی صاحب قبلہ، شیخ الحدیث، جامعہ رضأ مصطفیٰ، گلشنِ رضوی، رائچور، کرناٹک",
      aim: "ہمارا مقصد ",
      aimText:
        "ہمارا مقصد نعت، منقبت، حمد اور دیگر کلام کو مستند، تلاش کے قابل اور ترتیب یافتہ انداز میں پیش کرنا ہے۔",

      team: "ڈیولپمنٹ ٹیم",
      teamText:
        "یہ پروجیکٹ مومنین کی عالمی برادری کی خدمت کے لیے محبت اور لگن سے تیار کیا گیا ہے۔ ہم اس پلیٹ فارم کو بہتر بنانے کے لیے تعاون اور تجاویز کا خیرمقدم کرتے ہیں۔",
    },
  };

  const content = aboutContent[language];

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1
          className={`text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-4 ${
            language === "ur" ? "urdu-text" : ""
          }`}
        >
          {getTranslation("aboutTitle", language)}
        </h1>
        <p
          className={`text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto ${
            language === "ur" ? "urdu-text" : ""
          }`}
        >
          {getTranslation("aboutSubtitle", language)}
        </p>
      </div>

      {/* Content Sections */}
      <div className="space-y-12">
        {/* Author */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <h2
            className={`text-2xl font-bold text-gray-800 dark:text-white mb-4 ${
              language === "ur" ? "urdu-text" : ""
            }`}
          >
            {content.author}
          </h2>
          <p
            className={`text-gray-600 dark:text-gray-300 leading-relaxed ${
              language === "ur" ? "urdu-text text-right" : ""
            }`}
          >
            {content.authorText}
          </p>
        </section>

        {/* Aim */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <h2
            className={`text-2xl font-bold text-gray-800 dark:text-white mb-4 ${
              language === "ur" ? "urdu-text" : ""
            }`}
          >
            {content.aim}
          </h2>
          <p
            className={`text-gray-600 dark:text-gray-300 leading-relaxed ${
              language === "ur" ? "urdu-text text-right" : ""
            }`}
          >
            {content.aimText}
          </p>
        </section>

        {/* Team */}
        <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <h2
            className={`text-2xl font-bold text-gray-800 dark:text-white mb-4 ${
              language === "ur" ? "urdu-text" : ""
            }`}
          >
            {content.team}
          </h2>
          <p
            className={`text-gray-600 dark:text-gray-300 leading-relaxed ${
              language === "ur" ? "urdu-text text-right" : ""
            }`}
          >
            {content.teamText}
          </p>
        </section>

        {/* Credits */}
        {/* <section className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
          <h2
            className={`text-2xl font-bold text-gray-800 dark:text-white mb-4 ${
              language === "ur" ? "urdu-text" : ""
            }`}
          >
            {content.credits}
          </h2>
          <p
            className={`text-gray-600 dark:text-gray-300 leading-relaxed ${
              language === "ur" ? "urdu-text text-right" : ""
            }`}
          >
            {content.creditsText}
          </p>
        </section> */}
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-4">
              <feature.icon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3
              className={`text-lg font-semibold text-gray-800 dark:text-white mb-2 ${
                language === "ur" ? "urdu-text" : ""
              }`}
            >
              {language === "ur" ? feature.titleUr : feature.titleEn}
            </h3>
            <p
              className={`text-gray-600 dark:text-gray-300 text-sm ${
                language === "ur" ? "urdu-text" : ""
              }`}
            >
              {language === "ur"
                ? feature.descriptionUr
                : feature.descriptionEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default About;
