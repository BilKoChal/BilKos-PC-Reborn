/**
 * Shared Game Boy Japanese character set constants.
 *
 * These arrays define the Katakana, Hiragana, and Latin characters used in
 * the Gen 1/2 Japanese text encoding.
 *
 * Following PKHeX's pattern: character data is defined once per generation
 * (in StringConverter1/StringConverter2) and shared by all consumers.
 * The GameBoyTextCodec class uses these arrays for both encoding and decoding,
 * ensuring the data can never drift between validation and decoding.
 */

/** Katakana characters for Japanese Game Boy text encoding.
 *  Byte range: 0x80–0xB1 (50 characters) */
export const JPN_KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンッャュョ".split("");

/** Hiragana characters for Japanese Game Boy text encoding.
 *  Byte range: 0xB2–0xE3 (50 characters) */
export const JPN_HIRAGANA = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんっゃゅょ".split("");

/** Latin characters available in Japanese Game Boy text encoding.
 *  Byte range: 0x60–0x6F (16 characters) */
export const JPN_LATIN = "ABCDEFGHIJJKLMN:";
