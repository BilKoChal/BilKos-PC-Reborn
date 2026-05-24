
// Helper: Parse BCD (Binary Coded Decimal) used for Money
export function parseBCD(data: Uint8Array, start: number, length: number): number {
  let result = 0;
  for (let i = 0; i < length; i++) {
    const byte = data[start + i];
    result = result * 100 + ((byte >> 4) * 10 + (byte & 0x0F));
  }
  return result;
}

// Helper: Write BCD
export function setBCD(view: DataView, offset: number, value: number, length: number) {
    let temp = value;
    for (let i = length - 1; i >= 0; i--) {
        const lower = temp % 10;
        temp = Math.floor(temp / 10);
        const upper = temp % 10;
        temp = Math.floor(temp / 10);
        view.setUint8(offset + i, (upper << 4) | lower);
    }
}

// Helper: Count set bits in a range of bytes
export function countSetBits(data: Uint8Array, start: number, length: number): number {
  let count = 0;
  for (let i = 0; i < length; i++) {
    let byte = data[start + i];
    while (byte > 0) {
      byte &= (byte - 1); 
      count++;
    }
  }
  return count;
}

// --- Big Endian Helpers (Gen 1 & 2) ---

export function getUInt16BigEndian(data: Uint8Array, offset: number): number {
  return (data[offset] << 8) | data[offset + 1];
}

export function setUInt16BigEndian(view: DataView, offset: number, value: number) {
    view.setUint8(offset, (value >> 8) & 0xFF);
    view.setUint8(offset + 1, value & 0xFF);
}

export function getUInt24BigEndian(data: Uint8Array, offset: number): number {
  return (data[offset] << 16) | (data[offset + 1] << 8) | data[offset + 2];
}

export function setUInt24BigEndian(view: DataView, offset: number, value: number) {
    view.setUint8(offset, (value >> 16) & 0xFF);
    view.setUint8(offset + 1, (value >> 8) & 0xFF);
    view.setUint8(offset + 2, value & 0xFF);
}

// --- Little Endian Helpers (Gen 3, 4, 5) ---

export function getUInt16LE(data: Uint8Array | DataView, offset: number): number {
  if (data instanceof DataView) {
    return data.getUint16(offset, true);
  }
  return data[offset] | (data[offset + 1] << 8);
}

export function getUInt32LE(data: Uint8Array | DataView, offset: number): number {
  if (data instanceof DataView) {
    return data.getUint32(offset, true);
  }
  return (
    data[offset] |
    (data[offset + 1] << 8) |
    (data[offset + 2] << 16) |
    (data[offset + 3] << 24)
  ) >>> 0; 
}

// --- Bit Manipulation Utilities ---

export class BitUtils {
    static getBit(value: number, bit: number): boolean { 
        return ((value >> bit) & 1) === 1; 
    }
    
    static getRange(value: number, start: number, length: number): number { 
        return (value >> start) & ((1 << length) - 1); 
    }
}

// Helper: Decode Status Byte
export function decodeStatus(byte: number): string {
    if (byte === 0) return "OK";
    if (byte & (1 << 2)) return "SLP";
    if (byte & (1 << 3)) return "PSN";
    if (byte & (1 << 4)) return "BRN";
    if (byte & (1 << 5)) return "FRZ";
    if (byte & (1 << 6)) return "PAR";
    return "OK";
}

// Helper to read ASCII string
export function getAsciiString(view: Uint8Array, start: number, length: number): string {
  let str = '';
  for (let i = 0; i < length; i++) {
    if (start + i >= view.length) break;
    const byte = view[start + i];
    if (byte === 0) break;
    str += String.fromCharCode(byte);
  }
  return str;
}
