import { ParsedSave, PokemonStats, Item } from '../../parser/types';
import { GEN1_INTERNAL_TO_DEX } from './data/offsets';
import { BinaryWriter } from '../../utils/io';
import { OFFSETS_INT, OFFSETS_JPN, isSaveJapanese } from './parser';

// Reverse map: National Dex ID -> Internal ID
const DEX_TO_INTERNAL: Record<number, number> = {};
GEN1_INTERNAL_TO_DEX.forEach((dex, internal) => {
    if (dex !== 0) DEX_TO_INTERNAL[dex] = internal;
});

// Helper: Write Pokedex Flags
function writePokedexFlags(writer: BinaryWriter, flags: boolean[]) {
    // Gen 1 uses 19 bytes (152 bits)
    for (let i = 0; i < 19; i++) {
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
            const dexNum = (i * 8) + bit; 
            if (flags[dexNum] === true) {
                byte |= (1 << bit);
            }
        }
        writer.u8(byte);
    }
}

// Helper: Write Event Flags
function writeEventFlags(writer: BinaryWriter, flags: boolean[]) {
    for (let i = 0; i < 32; i++) { // 32 bytes
        let byte = 0;
        for (let bit = 0; bit < 8; bit++) {
            const flagIndex = (i * 8) + bit;
            if (flags[flagIndex] === true) {
                byte |= (1 << bit);
            }
        }
        writer.u8(byte);
    }
}

// Helper: Write Items
function writeItems(writer: BinaryWriter, items: Item[], maxCapacity: number) {
    writer.u8(items.length); // Item Count
    
    for (let i = 0; i < items.length && i < maxCapacity; i++) {
        writer.u8(items[i].id);
        writer.u8(items[i].count);
    }
    writer.u8(0xFF); // Terminator
}

// Helper: Write Pokemon Structure
function writePokemonStruct(writer: BinaryWriter, mon: PokemonStats, isParty: boolean) {
    const internalId = DEX_TO_INTERNAL[mon.dexId] || 1; 
    writer.u8(internalId);
    
    const currentHp = Math.min(mon.hp, mon.maxHp);
    writer.u16be(currentHp);
    writer.u8(mon.level);
    
    // Status (04)
    writer.u8(0); 

    // Types (05, 06)
    writer.u8(mon.type1);
    writer.u8(mon.type2);

    // Catch Rate (07)
    writer.u8(mon.catchRate);

    // Moves (08-0B)
    for (let i = 0; i < 4; i++) {
        writer.u8(mon.moveIds[i] || 0);
    }

    // OT ID (0C-0D)
    writer.u16be(mon.originalTrainerId);

    // Exp (0E-10)
    writer.u24be(mon.exp);

    // EV/Stat Exp (11-1A)
    writer.u16be(mon.ev.hp);
    writer.u16be(mon.ev.attack);
    writer.u16be(mon.ev.defense);
    writer.u16be(mon.ev.speed);
    writer.u16be(mon.ev.special);

    // DVs (1B-1C)
    const ivByte1 = ((mon.iv.attack & 0xF) << 4) | (mon.iv.defense & 0xF);
    const ivByte2 = ((mon.iv.speed & 0xF) << 4) | (mon.iv.special & 0xF);
    writer.u8(ivByte1);
    writer.u8(ivByte2);

    // PP (1D-20)
    for (let i = 0; i < 4; i++) {
        const ppVal = (mon.movePp[i] & 0x3F) | ((mon.movePpUps[i] & 0x3) << 6);
        writer.u8(ppVal);
    }

    if (isParty) {
        // Party Specifics (Level, Stats) - Offset 33
        writer.u8(mon.level);
        writer.u16be(mon.maxHp);
        writer.u16be(mon.attack);
        writer.u16be(mon.defense);
        writer.u16be(mon.speed);
        writer.u16be(mon.special);
    }
}

// Helper: Write a full Box
function writeBox(writer: BinaryWriter, boxPokemon: PokemonStats[], offsets: Record<string, number>, isJapanese: boolean) {
    const monCount = offsets.BOX_MON_COUNT;

    // 1. Count
    writer.u8(boxPokemon.length);

    // 2. Species List
    for (const p of boxPokemon) {
        const internal = DEX_TO_INTERNAL[p.dexId] || 1;
        writer.u8(internal);
    }
    writer.u8(0xFF); // Terminator

    // Padding for Species List
    const bytesWritten = 1 + boxPokemon.length + 1;
    const paddingNeeded = (monCount + 2) - bytesWritten; 
    for (let k = 0; k < paddingNeeded; k++) writer.u8(0); 

    // 3. Pokemon Structs
    for (let i = 0; i < monCount; i++) { // Always write slot space
        if (i < boxPokemon.length) {
            writePokemonStruct(writer, boxPokemon[i], false);
        } else {
            // Write Empty Struct (33 bytes)
            for (let j = 0; j < 33; j++) writer.u8(0);
        }
    }

    // 4. OT Names (STR_LEN bytes * monCount)
    for (let i = 0; i < monCount; i++) {
        if (i < boxPokemon.length) {
            writer.string(boxPokemon[i].originalTrainerName, offsets.STR_LEN, 0x50, isJapanese);
        } else {
            for (let j = 0; j < offsets.STR_LEN; j++) writer.u8(0x50);
        }
    }

    // 5. Nicknames (STR_LEN bytes * monCount)
    for (let i = 0; i < monCount; i++) {
        if (i < boxPokemon.length) {
            writer.string(boxPokemon[i].nickname, offsets.STR_LEN, 0x50, isJapanese);
        } else {
            for (let j = 0; j < offsets.STR_LEN; j++) writer.u8(0x50);
        }
    }
}

function calculateChecksum(buffer: Uint8Array, start: number, end: number): number {
    let sum = 0;
    for (let i = start; i <= end; i++) {
        sum += buffer[i];
    }
    return (~sum) & 0xFF;
}

/**
 * Creates a standard .pk1 binary (69 bytes)
 * Format: 3 Bytes Padding + 44 Bytes (Party Struct) + 11 Bytes (OT) + 11 Bytes (Nickname)
 * This format ensures compatibility with PKHeX and other tools.
 */
export function createPk1Binary(mon: PokemonStats): Uint8Array {
    const writer = new BinaryWriter(69);
    
    // 1. Write Header/Padding (3 bytes)
    writer.u8(0); writer.u8(0); writer.u8(0);

    // 2. Write Struct (Force Party Format = 44 bytes to include stats)
    // Starts at offset 3
    writePokemonStruct(writer, mon, true);
    
    // 3. Write OT Name (11 bytes) - Offset 44 + 3 = 47
    writer.seek(47);
    writer.string(mon.originalTrainerName, 11);

    // 4. Write Nickname (11 bytes) - Offset 55 + 3 = 58
    writer.seek(58);
    writer.string(mon.nickname, 11);

    return writer.getBuffer();
}

export function writeGen1Save(save: ParsedSave): Uint8Array {
    // Clone raw data
    const writer = new BinaryWriter(new Uint8Array(save.rawData));
    const isJapanese = isSaveJapanese(save.rawData);
    const offsets = isJapanese ? OFFSETS_JPN : OFFSETS_INT;

    // --- MAIN DATA BANK (Bank 1) ---

    // 0. Game Options
    if (save.options && offsets.OPTIONS !== undefined) {
        let byte = 0;
        if (save.options.battleAnimation === 'Off') {
            byte |= 0x80;
        }
        if (save.options.battleStyle === 'Set') {
            byte |= 0x40;
        }
        
        // Text speed raw or named
        let speedVal = 3; // Default Normal
        const ts = save.options.textSpeed;
        if (ts === 'Fast' || ts === '1') speedVal = 1;
        else if (ts === 'Slow' || ts === '5') speedVal = 5;
        else if (ts === 'Instant' || ts === '0') speedVal = 0;
        else if (ts === 'Normal' || ts === '3') speedVal = 3;
        else {
            const parsed = parseInt(ts, 10);
            if (!isNaN(parsed) && parsed >= 0 && parsed <= 7) {
                speedVal = parsed;
            }
        }
        byte |= speedVal;

        if (save.options.sound === 'Earphone1') {
            byte |= 0x10;
        } else if (save.options.sound === 'Earphone2') {
            byte |= 0x20;
        } else if (save.options.sound === 'Earphone3') {
            byte |= 0x30;
        } else if (save.options.sound === 'Stereo') {
            byte |= 0x10;
        }
        writer.seek(offsets.OPTIONS);
        writer.u8(byte);
    }

    // 1. Trainer Name
    writer.seek(offsets.PLAYER_NAME);
    writer.string(save.trainer.name, offsets.STR_LEN, 0x50, isJapanese);

    // 1.5 Badges
    if (save.trainer.badges !== undefined && offsets.BADGES !== undefined) {
        writer.seek(offsets.BADGES);
        writer.u8(save.trainer.badges);
    }

    // 2. Pokedex Flags
    writer.seek(offsets.POKEDEX_OWNED);
    writePokedexFlags(writer, save.pokedexOwnedFlags);
    
    writer.seek(offsets.POKEDEX_SEEN);
    writePokedexFlags(writer, save.pokedexSeenFlags);
    
    // 3. Event Flags
    if (save.eventFlags && save.eventFlags.length > 0) {
        writer.seek(offsets.MISSABLE_OBJECTS);
        writeEventFlags(writer, save.eventFlags);
    }

    // 4. Inventory (Bag)
    writer.seek(offsets.ITEM_BAG);
    writeItems(writer, save.items, 20);

    // 5. Money & Coins
    writer.seek(offsets.MONEY);
    writer.bcd(save.trainer.money, 3);
    
    writer.seek(offsets.CASINO_COINS);
    writer.bcd(save.trainer.coins, 2);

    // 6. Trainer ID
    writer.seek(offsets.PLAYER_ID);
    writer.u16be(parseInt(save.trainer.id));

    // 6.5 Play Time
    if (save.trainer.playTime) {
        let hours = 0;
        let minutes = 0;
        let seconds = 0;
        
        if (save.trainer.playTime.includes(':')) {
            const parts = save.trainer.playTime.split(':');
            hours = parseInt(parts[0], 10) || 0;
            minutes = parseInt(parts[1], 10) || 0;
            seconds = parseInt(parts[2], 10) || 0;
        } else {
            const hoursMatch = save.trainer.playTime.match(/(\d+)\s*h/i);
            const minutesMatch = save.trainer.playTime.match(/(\d+)\s*m/i);
            const secondsMatch = save.trainer.playTime.match(/(\d+)\s*s/i);
            if (hoursMatch) hours = parseInt(hoursMatch[1], 10) || 0;
            if (minutesMatch) minutes = parseInt(minutesMatch[1], 10) || 0;
            if (secondsMatch) seconds = parseInt(secondsMatch[1], 10) || 0;
        }
        
        writer.seek(offsets.PLAY_TIME);
        writer.u8(hours);
        writer.seek(offsets.PLAY_TIME + 2);
        writer.u8(minutes);
        writer.seek(offsets.PLAY_TIME + 3);
        writer.u8(seconds);
    }

    // 6.6 Yellow-only Pikachu Friendship & Surf Record
    if (save.trainer.pikachuFriendship !== undefined && offsets.PIKACHU_FRIENDSHIP !== undefined) {
        writer.seek(offsets.PIKACHU_FRIENDSHIP);
        writer.u8(save.trainer.pikachuFriendship);
    }
    
    if (save.trainer.pikachuSurfScore !== undefined && offsets.PIKACHU_SURF_RECORD !== undefined) {
        const val = save.trainer.pikachuSurfScore;
        const d4 = Math.floor(val / 1000) % 10;
        const d3 = Math.floor(val / 100) % 10;
        const d2 = Math.floor(val / 10) % 10;
        const d1 = val % 10;
        
        const lowByte = (d2 << 4) | d1;
        const highByte = (d4 << 4) | d3;
        
        writer.seek(offsets.PIKACHU_SURF_RECORD);
        writer.u8(lowByte);
        writer.u8(highByte);
    }

    // 7. PC Items
    writer.seek(offsets.PC_ITEMS);
    writeItems(writer, save.pcItems, 50);

    // 8. Current Box ID
    writer.seek(offsets.CURRENT_BOX_ID);
    writer.u8((save.currentBoxId & 0x7F) | 0x80);

    // 9. Party Pokemon
    writer.seek(offsets.PARTY_DATA);
    writer.u8(save.party.length);
    for (const p of save.party) {
        const internal = DEX_TO_INTERNAL[p.dexId] || 1;
        writer.u8(internal);
    }
    writer.u8(0xFF); 

    // Jump to structs (Party Data + 8)
    writer.seek(offsets.PARTY_DATA + 8);
    for (let i = 0; i < 6; i++) {
        if (i < save.party.length) {
            writePokemonStruct(writer, save.party[i], true);
        } else {
            // Fill empty slots with 0
            for (let j = 0; j < 44; j++) writer.u8(0);
        }
    }

    // Party OT Names
    writer.seek(offsets.PARTY_OT_NAMES);
    for (let i = 0; i < 6; i++) {
        if (i < save.party.length) {
            writer.string(save.party[i].originalTrainerName, offsets.STR_LEN, 0x50, isJapanese);
        } else {
            for (let j = 0; j < offsets.STR_LEN; j++) writer.u8(0x50);
        }
    }

    // Party Nicknames
    writer.seek(offsets.PARTY_NICKNAMES);
    for (let i = 0; i < 6; i++) {
        if (i < save.party.length) {
            writer.string(save.party[i].nickname, offsets.STR_LEN, 0x50, isJapanese);
        } else {
            for (let j = 0; j < offsets.STR_LEN; j++) writer.u8(0x50);
        }
    }

    // --- EXTERNAL BANKS (PC BOXES) ---
    
    // Adaptive checksum config based on region
    const BANK2_START = 0x4000;
    const BANK2_CHKSUM_ALL = isJapanese ? 0x5D2C : 0x5A4C;
    const BANK2_CHKSUM_INDIV = isJapanese ? 0x5D2D : 0x5A4D; 
    const BANK2_END_DATA = isJapanese ? 0x5D32 : 0x5A52; 

    const BANK3_START = 0x6000;
    const BANK3_CHKSUM_ALL = isJapanese ? 0x7D2C : 0x7A4C;
    const BANK3_CHKSUM_INDIV = isJapanese ? 0x7D2D : 0x7A4D; 
    const BANK3_END_DATA = isJapanese ? 0x7D32 : 0x7A52;

    const buffer = writer.getBuffer();
    const maxBoxes = isJapanese ? 8 : 12;

    for (let i = 0; i < maxBoxes; i++) {
        let boxOffset = 0;
        let isBank2 = false;
        
        if (isJapanese) {
            isBank2 = i < 4;
            if (isBank2) boxOffset = offsets.PC_BANK_2_START + (i * offsets.BOX_STRUCT_SIZE);
            else boxOffset = offsets.PC_BANK_3_START + ((i - 4) * offsets.BOX_STRUCT_SIZE);
        } else {
            isBank2 = i < 6;
            if (isBank2) boxOffset = offsets.PC_BANK_2_START + (i * offsets.BOX_STRUCT_SIZE);
            else boxOffset = offsets.PC_BANK_3_START + ((i - 6) * offsets.BOX_STRUCT_SIZE);
        }
        
        const boxMons = save.pcBoxes[i] || [];
        
        writer.seek(boxOffset);
        writeBox(writer, boxMons, offsets, isJapanese);

        // Copy to Current Box Data Area (RAM cache) if active
        if (i === save.currentBoxId) {
            writer.seek(offsets.CURRENT_BOX_DATA);
            writeBox(writer, boxMons, offsets, isJapanese);
        }

        // Calculate Individual Checksum
        const boxChecksum = calculateChecksum(buffer, boxOffset, boxOffset + offsets.BOX_STRUCT_SIZE - 1);
        
        if (isBank2) {
            const idxOffset = isJapanese ? (i) : (i);
            writer.seek(BANK2_CHKSUM_INDIV + idxOffset);
            writer.u8(boxChecksum);
        } else {
            const idxOffset = isJapanese ? (i - 4) : (i - 6);
            writer.seek(BANK3_CHKSUM_INDIV + idxOffset);
            writer.u8(boxChecksum);
        }
    }

    // Bank 2 Checksum
    let b2Sum = 0;
    for (let j = BANK2_START; j <= BANK2_END_DATA; j++) {
        if (j !== BANK2_CHKSUM_ALL) b2Sum += buffer[j];
    }
    writer.seek(BANK2_CHKSUM_ALL);
    writer.u8((~b2Sum) & 0xFF);

    // Bank 3 Checksum
    let b3Sum = 0;
    for (let j = BANK3_START; j <= BANK3_END_DATA; j++) {
        if (j !== BANK3_CHKSUM_ALL) b3Sum += buffer[j];
    }
    writer.seek(BANK3_CHKSUM_ALL);
    writer.u8((~b3Sum) & 0xFF);

    // Main Checksum
    const mainChecksum = calculateChecksum(buffer, offsets.PLAYER_NAME, 0x3522);
    writer.seek(offsets.CHECKSUM);
    writer.u8(mainChecksum);

    return buffer;
}
