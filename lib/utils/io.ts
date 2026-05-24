
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

    u8(value: number) {
        this.view.setUint8(this.offset++, value);
    }

    u16be(value: number) {
        this.view.setUint16(this.offset, value, false); // Big Endian
        this.offset += 2;
    }

    u24be(value: number) {
        this.u8((value >> 16) & 0xFF);
        this.u8((value >> 8) & 0xFF);
        this.u8(value & 0xFF);
    }

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
            '👤': 0x5D,
            '0': 0xF6, '1': 0xF7, '2': 0xF8, '3': 0xF9, '4': 0xFA, '5': 0xFB, '6': 0xFC, '7': 0xFD, '8': 0xFE, '9': 0xFF,
            "'": 0xE0, '’': 0xE0, '`': 0xE0,
            '♂': 0xEF, '♀': 0xF5,
            '/': 0xF3, ',': 0xF4,
            'é': 0xBA
        };

        const JPN_KATAKANA = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンッャュョ";
        const JPN_HIRAGANA = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをんっゃゅょ";
        const JPN_LATIN = "ABCDEFGHIJJKLMN:";

        const CHAR_MAP_JP_REV: Record<string, number> = {
            ' ': 0x7F,
            '♂': 0xEF,
            '♀': 0xF5,
            '円': 0xF0,
            'ー': 0xE3,
            '゜': 0xE4,
            '゛': 0xE5,
            '?': 0xE6,
            '!': 0xE7,
            '。': 0xE8,
            '×': 0xF1,
            '👤': 0x5D,
            '0': 0xF6, '1': 0xF7, '2': 0xF8, '3': 0xF9, '4': 0xFA, '5': 0xFB, '6': 0xFC, '7': 0xFD, '8': 0xFE, '9': 0xFF
        };

        for (let i = 0; i < maxLength; i++) {
            if (i < str.length) {
                const char = str[i];
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
