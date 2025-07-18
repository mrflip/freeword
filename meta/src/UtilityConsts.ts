  export const MAX_UINT32 = Math.pow(2, 32) - 1;
/** String with lowercase a-z, in order */
export const StrAtoZlo = 'abcdefghijklmnopqrstuvwxyz'
/** String with UPPER A-Z, in order */
export const StrAtoZup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
/** String with numerals 0-9, in order */
export const StrNumerals = '0123456789'
/** String with numerals 0-9, UPPER A-Z, and lowercase a-z, in order */
export const StrAtoZ = StrNumerals + StrAtoZup + StrAtoZlo

/** String Array of lowercase a-z, in order */
export const AtoZlos          = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'] as const
/** String Array of UPPER A-Z, in order */
export const AtoZups          = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] as const
/** Numeric Indexes of the 26 letters, in order (starting at 0) */
export const AtoZnums         = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25] as const
/** String Array of characters for '0' to '9', in order */
export const Numerals           = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const
/** String Array of UPPER 'A' to 'Z' and lower 'a' to 'z', in order */
export const CharsAZaz        =            [...AtoZups,      ...AtoZlos] as const
/** String Array of numerals '0' to '9', UPPER 'A' to 'Z' and lower 'a' to 'z', in order */
export const Chars09AZaz      = [...Numerals, ...AtoZups,      ...AtoZlos] as const
/** String Array of numerals '0' to '9', UPPER 'A' to 'Z', _underbar, and lower 'a' to 'z', in order */
export const CharsAZ09Bar     = [...Numerals, ...AtoZups, '_', ...AtoZlos] as const
