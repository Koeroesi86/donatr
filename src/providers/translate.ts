import axios from "axios";
import https from "https";

const libretranslateLanguages = [
  "en",
  "ar",
  "az",
  "zh",
  "cs",
  "nl",
  "fi",
  "fr",
  "de",
  "hi",
  "hu",
  "id",
  "ga",
  "it",
  "ja",
  "ko",
  "pl",
  "pt",
  "ru",
  "es",
  "sv",
  "tr",
  "uk",
  "vi"
];

const cache: { [k: string]: string } = {};

const getKey = (text: string, targetLocale: string) => `${targetLocale}##${text}`;

const tryLibretranslate = async (text: string, targetLocale: string): Promise<string> => {
  const urls =[
    'https://libretranslate.esmailelbob.xyz/translate',
    'https://translate.api.skitzen.com/translate', // 100 per 1 minute
    'https://libretranslate.com', // 80 per min
    'https://translate.argosopentech.com/translate', // 20 per min
    'https://libretranslate.de/translate', // 20 per min
    'https://trans.zillyhuhn.com/translate', // 5 per 1 minute
    'https://libretranslate.pussthecat.org/translate',
  ];

  for (const url of urls) {
    try {
      const { data: { translatedText } } = await axios.request<{ translatedText: string }>({
        url,
        method: 'POST',
        data: {
          q: text,
          source: 'auto',
          target: targetLocale,
          format: 'text'
        },
        headers: { 'Content-Type': 'application/json' },
        httpsAgent: new https.Agent({
          rejectUnauthorized: false
        }),
      });
      return translatedText;
    } catch {
      // try the next endpoint
    }
  }

  return '';
}

const isLibretranslateEnabled = false;

const translate = async (text: string, targetLocale: string): Promise<string> => {
  if (cache[getKey(text, targetLocale)]) {
    return cache[getKey(text, targetLocale)];
  }

  // TODO: translations are bad
  if (isLibretranslateEnabled && libretranslateLanguages.includes(targetLocale)) {
    const translatedText = await tryLibretranslate(text, targetLocale);

    if (translatedText) {
      cache[getKey(text, targetLocale)] = translatedText;
      return translatedText;
    }
  }

  return text;
};

export default translate;
