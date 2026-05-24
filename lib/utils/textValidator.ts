// Valid characters according to Gen I and Gen II Character Encodings.

const JPN_KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンッャュョ";
const JPN_HIRAGANA = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんっゃゅょ";
const JPN_LATIN = "ABCDEFGHIJJKLMN:";

// Set of valid English/International characters
const ALLOWED_ENG_CHARS = new Set([
  // Uppercase
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  // Lowercase
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  // Digits
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  // Space
  ' ',
  // Special punctuation symbols
  '(', ')', ':', ';', '[', ']', '?', '!', '.', '-', ',', '/', 
  // Custom game elements
  '👤', '♂', '♀', 'é'
]);

// Set of valid Japanese characters
const ALLOWED_JPN_CHARS = new Set([
  // Space
  ' ',
  // Digits
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  // Gender symbols etc
  '♂', '♀', '円', 'ー', '゜', '゛', '?', '!', '。', '×', '👤'
]);

// Populate individual Katakana, Hiragana, and Japanese latin characters into ALLOWED_JPN_CHARS
for (const char of JPN_KATAKANA) ALLOWED_JPN_CHARS.add(char);
for (const char of JPN_HIRAGANA) ALLOWED_JPN_CHARS.add(char);
for (const char of JPN_LATIN) ALLOWED_JPN_CHARS.add(char);

/**
 * Validates if a single character is supported by Gen I / II encoding.
 */
export function isValidPokemonChar(char: string, isJapanese?: boolean): boolean {
  if (isJapanese) {
    return ALLOWED_JPN_CHARS.has(char);
  }
  // Standard English single quote alternatives can be treated as valid since we sanitize them
  if (char === "'" || char === "’" || char === "`") {
    return true;
  }
  return ALLOWED_ENG_CHARS.has(char);
}

/**
 * Sanitizes a string input, stripping out any unsupported Gen I / II characters.
 * It also normalizes single quote variants into standard single quotes.
 */
export function sanitizePokemonText(text: string, isJapanese?: boolean): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (isJapanese) {
      if (ALLOWED_JPN_CHARS.has(char)) {
        result += char;
      }
    } else {
      if (char === "'" || char === "’" || char === "`") {
        result += "'"; // Map to standard single quote representable in the game
      } else if (ALLOWED_ENG_CHARS.has(char)) {
        result += char;
      }
    }
  }
  return result;
}

/**
 * Checks if a ParsedSave object corresponds to a Japanese save game
 */
export function isJapaneseSave(save: { rawData?: Uint8Array; generation?: number }): boolean {
  if (!save || !save.rawData || save.generation !== 1) return false;
  const view = save.rawData;
  if (view.byteLength < 0x3524) return false;
  const intPartyCount = view[0x2F2C];
  const intFirstSpecies = view[0x2F2D];
  const jpnPartyCount = view[0x2ED5];
  const jpnFirstSpecies = view[0x2ED6];
  
  const intPartyValid = intPartyCount >= 1 && intPartyCount <= 6 && intFirstSpecies !== 0xFF && intFirstSpecies !== 0x00;
  const jpnPartyValid = jpnPartyCount >= 1 && jpnPartyCount <= 6 && jpnFirstSpecies !== 0xFF && jpnFirstSpecies !== 0x00;
  
  if (jpnPartyValid && !intPartyValid) {
    return true;
  }
  return false;
}
