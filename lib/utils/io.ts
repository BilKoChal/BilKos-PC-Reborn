
import { GameBoyTextCodec } from './GameBoyTextCodec';

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

    /**
     * Encode and write a Game Boy text string (Gen 1/2).
     *
     * Delegates to GameBoyTextCodec.encode() — the single source of truth
     * for character mapping data.
     *
     * @param str Text to encode
     * @param maxLength Buffer length in bytes
     * @param terminator Terminator byte (default 0x50)
     * @param isJapanese Whether to use the Japanese charmap
     */
    string(str: string, maxLength: number, terminator: number = 0x50, isJapanese?: boolean) {
        const region = isJapanese ? 'japanese' as const : 'international' as const;
        const codec = new GameBoyTextCodec(region);
        const encoded = codec.encode(str, maxLength, terminator);
        this.bytes(encoded);
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
