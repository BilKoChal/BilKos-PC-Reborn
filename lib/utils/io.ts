
export class BinaryWriter {
    private buffer: Uint8Array;
    private view: DataView;
    private offset: number;

    constructor(sizeOrBuffer: number | Uint8Array) {
        if (typeof sizeOrBuffer === 'number') {
            this.buffer = new Uint8Array(sizeOrBuffer);
        } else {
            this.buffer = sizeOrBuffer; // Edit in place or copy
        }
        this.view = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
        this.offset = 0;
    }

    seek(offset: number) {
        this.offset = offset;
    }

    tell(): number {
        return this.offset;
    }

    getBuffer(): Uint8Array {
        return this.buffer;
    }

    // --- Unsigned integers ---

    u8(value: number) {
        this.view.setUint8(this.offset++, value);
    }

    /** Write a 16-bit unsigned integer in Big Endian (Gen 1/2 native). */
    u16be(value: number) {
        this.view.setUint16(this.offset, value, false); // Big Endian
        this.offset += 2;
    }

    /** Write a 16-bit unsigned integer in Little Endian (Gen 3+ native). */
    u16le(value: number) {
        this.view.setUint16(this.offset, value, true); // Little Endian
        this.offset += 2;
    }

    /** Write a 24-bit unsigned integer in Big Endian. */
    u24be(value: number) {
        this.u8((value >> 16) & 0xFF);
        this.u8((value >> 8) & 0xFF);
        this.u8(value & 0xFF);
    }

    /** Write a 32-bit unsigned integer in Big Endian. */
    u32be(value: number) {
        this.view.setUint32(this.offset, value, false); // Big Endian
        this.offset += 4;
    }

    /** Write a 32-bit unsigned integer in Little Endian (Gen 3+ PID, EXP, IV32, Secret ID). */
    u32le(value: number) {
        this.view.setUint32(this.offset, value, true); // Little Endian
        this.offset += 4;
    }

    // --- Signed integers ---

    /** Write an 8-bit signed integer. */
    i8(value: number) {
        this.view.setInt8(this.offset, value);
        this.offset += 1;
    }

    /** Write a 16-bit signed integer in Little Endian. */
    i16le(value: number) {
        this.view.setInt16(this.offset, value, true);
        this.offset += 2;
    }

    /** Write a 16-bit signed integer in Big Endian. */
    i16be(value: number) {
        this.view.setInt16(this.offset, value, false);
        this.offset += 2;
    }

    /** Write a 32-bit signed integer in Little Endian. */
    i32le(value: number) {
        this.view.setInt32(this.offset, value, true);
        this.offset += 4;
    }

    // --- Navigation helpers ---

    /** Advance the write position by `n` bytes without writing. Fills with zeros. */
    skip(n: number) {
        for (let i = 0; i < n; i++) {
            this.view.setUint8(this.offset + i, 0);
        }
        this.offset += n;
    }

    /** Advance the write position to the next multiple of `alignment`. Fills gap with zeros. */
    align(alignment: number) {
        const remainder = this.offset % alignment;
        if (remainder !== 0) {
            this.skip(alignment - remainder);
        }
    }

    // --- Compound types ---

    // Binary Coded Decimal
    bcd(value: number, length: number) {
        let temp = value;
        const start = this.offset;
        for (let i = length - 1; i >= 0; i--) {
            const lower = temp % 10;
            temp = Math.floor(temp / 10);
            const upper = temp % 10;
            temp = Math.floor(temp / 10);
            this.view.setUint8(start + i, (upper << 4) | lower);
        }
        this.offset += length;
    }

    bytes(data: Uint8Array | number[]) {
        if (data instanceof Uint8Array) {
            this.buffer.set(data, this.offset);
        } else {
            this.buffer.set(new Uint8Array(data), this.offset);
        }
        this.offset += data.length;
    }

    // Gen 1 String Encoding
    string(str: string, maxLength: number, terminator: number = 0x50, isJapanese?: boolean) {
        const CHAR_MAP_REV: Record<string, number> = {
            'A': 0x80, 'B': 0x81, 'C': 0x82, 'D': 0x83, 'E': 0x84, 'F': 0x85, 'G': 0x86, 'H': 0x87,
            'I': 0x88, 'J': 0x89, 'K': 0x8A, 'L': 0x8B, 'M': 0x8C, 'N': 0x8D, 'O': 0x8E, 'P': 0x8F,
            'Q': 0x90, 'R': 0x91, 'S': 0x92, 'T': 0x93, 'U': 0x94, 'V': 0x95, 'W': 0x96, 'X': 0x97,
            'Y': 0x98, 'Z': 0x99, '(': 0x9A, ')': 0x9B, ':': 0x9C, ';': 0x9D, '[': 0x9E, ']': 0x9F,
            'a': 0xA0, 'b': 0xA1, 'c': 0xA2, 'd': 0xA3, 'e': 0xA4, 'f': 0xA5, 'g': 0xA6, 'h': 0xA7,
            'i': 0xA8, 'j': 0xA9, 'k': 0xAA, 'l': 0xAB, 'm': 0xAC, 'n': 0xAD, 'o': 0xAE, 'p': 0xAF,
            'q': 0xB0, 'r': 0xB1, 's': 0xB2, 't': 0xB3, 'u': 0xB4, 'v': 0xB5, 'w': 0xB6, 'x': 0xB7,
            'y': 0xB8, 'z': 0xB9, ' ': 0x7F, '?': 0xE6, '!': 0xE7, '.': 0xE8, '-': 0xE3, 
            '\u{1F464}': 0x5D,
            '0': 0xF6, '1': 0xF7, '2': 0xF8, '3': 0xF9, '4': 0xFA, '5': 0xFB, '6': 0xFC, '7': 0xFD, '8': 0xFE, '9': 0xFF,
            "'": 0xE0, '\u2019': 0xE0, '`': 0xE0,
            '\u2642': 0xEF, '\u2640': 0xF5,
            '/': 0xF3, ',': 0xF4,
            '\u00E9': 0xBA
        };

        const JPN_KATAKANA = "\u30A2\u30A4\u30A6\u30A8\u30AA\u30AB\u30AD\u30AF\u30B1\u30B3\u30B5\u30B7\u30B9\u30BB\u30BD\u30BF\u30C1\u30C4\u30C6\u30C8\u30CA\u30CB\u30CC\u30CD\u30CE\u30CF\u30D2\u30D5\u30D8\u30DB\u30DE\u30DF\u30E0\u30E1\u30E2\u30E4\u30E6\u30E8\u30E9\u30EA\u30EB\u30EC\u30ED\u30ED\u30F2\u30F3\u30C3\u30E3\u30E5\u30E7";
        const JPN_HIRAGANA = "\u3042\u3044\u3046\u3048\u304A\u304B\u304D\u304F\u3051\u3053\u3055\u3057\u3059\u305B\u305D\u305F\u3061\u3064\u3066\u3068\u306A\u306B\u306C\u306D\u306E\u306F\u3072\u3075\u3078\u307B\u307E\u307F\u3080\u3081\u3082\u3084\u3086\u3088\u3089\u308A\u308B\u308C\u308D\u308F\u3092\u3093\u3063\u3083\u3085\u3087";
        const JPN_LATIN = "ABCDEFGHIJJKLMN:";

        const CHAR_MAP_JP_REV: Record<string, number> = {
            ' ': 0x7F,
            '\u2642': 0xEF,
            '\u2640': 0xF5,
            '\u5186': 0xF0,
            '\u30FC': 0xE3,
            '\u309C': 0xE4,
            '\u309B': 0xE5,
            '?': 0xE6,
            '!': 0xE7,
            '\u3002': 0xE8,
            '\u00D7': 0xF1,
            '\u{1F464}': 0x5D,
            '0': 0xF6, '1': 0xF7, '2': 0xF8, '3': 0xF9, '4': 0xFA, '5': 0xFB, '6': 0xFC, '7': 0xFD, '8': 0xFE, '9': 0xFF
        };

        for (let i = 0; i < maxLength; i++) {
            if (i < str.length) {
                const char = str[i]!;
                if (isJapanese) {
                    const kIdx = JPN_KATAKANA.indexOf(char);
                    if (kIdx !== -1) {
                        this.u8(0x80 + kIdx);
                    } else {
                        const hIdx = JPN_HIRAGANA.indexOf(char);
                        if (hIdx !== -1) {
                            this.u8(0xB2 + hIdx);
                        } else {
                            const lIdx = JPN_LATIN.indexOf(char);
                            if (lIdx !== -1) {
                                this.u8(0x60 + lIdx);
                            } else if (CHAR_MAP_JP_REV[char] !== undefined) {
                                this.u8(CHAR_MAP_JP_REV[char]);
                            } else {
                                this.u8(0xE6); // question mark on unmatched
                            }
                        }
                    }
                } else {
                    this.u8(CHAR_MAP_REV[char] !== undefined ? CHAR_MAP_REV[char] : 0xE6);
                }
            } else {
                this.u8(terminator);
            }
        }
    }
}

/**
 * BinaryReader — a structured, offset-tracking wrapper around DataView.
 *
 * Provides a symmetric read API to BinaryWriter, supporting both big-endian
 * (Gen 1/2 Game Boy) and little-endian (Gen 3+ GBA/DS/3DS/Switch) numeric
 * types, plus navigation helpers (skip, align) and compound readers (bcd, bytes).
 */
export class BinaryReader {
    private buffer: Uint8Array;
    private view: DataView;
    private offset: number;

    constructor(data: Uint8Array, byteOffset = 0, byteLength?: number) {
        this.buffer = data;
        this.view = new DataView(
            data.buffer,
            data.byteOffset + byteOffset,
            byteLength ?? data.byteLength - byteOffset,
        );
        this.offset = 0;
    }

    seek(offset: number) {
        this.offset = offset;
    }

    tell(): number {
        return this.offset;
    }

    /** Returns the remaining bytes from the current offset to the end. */
    remaining(): number {
        return this.view.byteLength - this.offset;
    }

    /** Returns a reference to the underlying buffer (relative to the original byteOffset). */
    getBuffer(): Uint8Array {
        return this.buffer;
    }

    // --- Unsigned integers ---

    u8(): number {
        return this.view.getUint8(this.offset++);
    }

    /** Read a 16-bit unsigned integer in Big Endian (Gen 1/2). */
    u16be(): number {
        const value = this.view.getUint16(this.offset, false);
        this.offset += 2;
        return value;
    }

    /** Read a 16-bit unsigned integer in Little Endian (Gen 3+). */
    u16le(): number {
        const value = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return value;
    }

    /** Read a 24-bit unsigned integer in Big Endian. */
    u24be(): number {
        const hi = this.view.getUint8(this.offset);
        const mid = this.view.getUint8(this.offset + 1);
        const lo = this.view.getUint8(this.offset + 2);
        this.offset += 3;
        return (hi << 16) | (mid << 8) | lo;
    }

    /** Read a 32-bit unsigned integer in Big Endian. */
    u32be(): number {
        const value = this.view.getUint32(this.offset, false);
        this.offset += 4;
        return value;
    }

    /** Read a 32-bit unsigned integer in Little Endian (Gen 3+ PID, EXP, IV32, Secret ID). */
    u32le(): number {
        const value = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return value;
    }

    // --- Signed integers ---

    /** Read an 8-bit signed integer. */
    i8(): number {
        const value = this.view.getInt8(this.offset);
        this.offset += 1;
        return value;
    }

    /** Read a 16-bit signed integer in Little Endian. */
    i16le(): number {
        const value = this.view.getInt16(this.offset, true);
        this.offset += 2;
        return value;
    }

    /** Read a 16-bit signed integer in Big Endian. */
    i16be(): number {
        const value = this.view.getInt16(this.offset, false);
        this.offset += 2;
        return value;
    }

    /** Read a 32-bit signed integer in Little Endian. */
    i32le(): number {
        const value = this.view.getInt32(this.offset, true);
        this.offset += 4;
        return value;
    }

    // --- Navigation helpers ---

    /** Advance the read position by `n` bytes without returning data. */
    skip(n: number) {
        this.offset += n;
    }

    /** Advance the read position to the next multiple of `alignment`. */
    align(alignment: number) {
        const remainder = this.offset % alignment;
        if (remainder !== 0) {
            this.skip(alignment - remainder);
        }
    }

    // --- Compound types ---

    /** Read a Binary Coded Decimal value of `length` bytes. */
    bcd(length: number): number {
        let result = 0;
        for (let i = 0; i < length; i++) {
            const byte = this.view.getUint8(this.offset + i);
            result = result * 100 + ((byte >> 4) * 10 + (byte & 0x0F));
        }
        this.offset += length;
        return result;
    }

    /** Read `length` raw bytes, returning a new Uint8Array. */
    bytes(length: number): Uint8Array {
        const slice = new Uint8Array(this.buffer.buffer, this.buffer.byteOffset + this.offset, length);
        const copy = new Uint8Array(length);
        copy.set(slice);
        this.offset += length;
        return copy;
    }

    /** Read `length` raw bytes as a sub-array view (no copy). */
    bytesView(length: number): Uint8Array {
        const view = new Uint8Array(this.buffer.buffer, this.buffer.byteOffset + this.offset, length);
        this.offset += length;
        return view;
    }
}

// ---------------------------------------------------------------------------
// Checksum helpers — generation-specific integrity algorithms
// ---------------------------------------------------------------------------

export const Checksums = {
    /**
     * CheckSum32 — Gen 3 save sector checksum.
     * Sums all u32 LE words in the range, then folds to u16.
     * Used by Ruby/Sapphire/Emerald/FireRed/LeafGreen per-sector validation.
     */
    checksum32(data: Uint8Array | DataView, offset: number, length: number): number {
        const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength);
        let sum = 0;
        const wordCount = length >>> 2; // length / 4, rounded down
        for (let i = 0; i < wordCount; i++) {
            sum = (sum + view.getUint32(offset + i * 4, true)) >>> 0; // accumulate as u32
        }
        return (sum & 0xFFFF); // fold to u16
    },

    /**
     * CRC16-CCITT — Gen 4/5 save block checksum.
     * Polynomial 0x1021, init 0xFFFF, no final XOR.
     * Used by Diamond/Pearl/Platinum/HeartGold/SoulSilver/Black/White/B2W2.
     */
    crc16ccitt(data: Uint8Array | DataView, offset: number, length: number): number {
        const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength);
        let crc = 0xFFFF;
        for (let i = 0; i < length; i++) {
            const byte = view.getUint8(offset + i);
            crc ^= byte << 8;
            for (let bit = 0; bit < 8; bit++) {
                if (crc & 0x8000) {
                    crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
                } else {
                    crc = (crc << 1) & 0xFFFF;
                }
            }
        }
        return crc & 0xFFFF;
    },

    /**
     * Add16 — Gen 4-9 PKM entity checksum.
     * Sums all u16 LE words in the range (excluding the checksum word itself).
     * Used for per-Pokemon integrity in Gen 4 through Gen 9.
     */
    add16(data: Uint8Array | DataView, offset: number, length: number): number {
        const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength);
        let sum = 0;
        const wordCount = length >>> 1; // length / 2, rounded down
        for (let i = 0; i < wordCount; i++) {
            sum = (sum + view.getUint16(offset + i * 2, true)) & 0xFFFF;
        }
        return sum & 0xFFFF;
    },

    /**
     * Simple 8-bit inverted byte sum — Gen 1 checksum.
     * Sums all bytes, then inverts (XOR 0xFF). The result should equal the
     * stored checksum byte for a valid save.
     */
    invertedByteSum(data: Uint8Array | DataView, offset: number, length: number): number {
        const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength);
        let sum = 0;
        for (let i = 0; i < length; i++) {
            sum = (sum + view.getUint8(offset + i)) & 0xFF;
        }
        return (~sum) & 0xFF;
    },

    /**
     * 16-bit additive sum — Gen 2 checksum.
     * Sums all bytes in pairs as big-endian u16 words, accumulating into a u16.
     */
    additiveSum16(data: Uint8Array | DataView, offset: number, length: number): number {
        const view = data instanceof DataView ? data : new DataView(data.buffer, data.byteOffset, data.byteLength);
        let sum = 0;
        const wordCount = length >>> 1;
        for (let i = 0; i < wordCount; i++) {
            sum = (sum + view.getUint16(offset + i * 2, false)) & 0xFFFF;
        }
        // If length is odd, include the trailing byte
        if (length & 1) {
            sum = (sum + (view.getUint8(offset + wordCount * 2) << 8)) & 0xFFFF;
        }
        return sum;
    },
};
