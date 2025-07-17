declare module 'esm-seedrandom' {
  export interface PRNGenerator {
    ():       number;
    double(): number;
    int32():  number;
    quick():  number;
  }
  export interface AleaPRNGenerator extends PRNGenerator {
    /** @see {@link quick} A random float, `0 <= x < 1`, with 32 bits of randomness. @see {@link prng_alea} for examples */
    ():       number;
    /** @see {@link double} A random float, `0 <= x < 1`, with 56 bits of randomness. @see {@link prng_alea} for examples */
    double(): number;
    /** A random integer, `0 <= x < 2^32`, with 32 bits of randomness. @see {@link prng_alea} for examples */
    int32():  number;
    /** A random float, `0 <= x < 1`, with 32 bits of randomness. @see {@link prng_alea} for examples */
    quick():  number;
  }

  /**
   *
   * @param seed
   *
   * ```
   * // Use alea for Johannes Baagøe's clever and fast floating-point RNG.
   * import {prng_alea} from 'esm-seedrandom';
   * let myrng = prng_alea('hello.');
   * // By default provides 32 bits of randomness in a float
   *  console.log(myrng()); // Always 0.2594452982302755 for this seed and sequence
   *  console.log(myrng()); // Always 0.8253263409715146 for this seed and sequence
   *  console.log(myrng()); // Always 0.42280301195569336 for this seed and sequence
   *  // Use "quick" to get only 32 bits of randomness in a float.
   *  console.log(myrng.quick()); // Always 0.9045045920647681 for this seed and sequence
   *  console.log(myrng.quick()); // Always 0.7626296668313444 for this seed and sequence
   *  // Use "int32" to get a 32 bit (signed) integer
   *  console.log(myrng.int32()); // Always 1157605039 for this seed and sequence
   *  console.log(myrng.int32()); // Always 346379077 for this seed and sequence
   * // Use "double" to get 56 bits of randomness
   *  console.log(myrng.double()); // Always 0.9541419381134651 for this seed and sequence
   *  console.log(myrng.double()); // Always 0.7982540860513401 for this seed and sequence
   * ```
   */
  export function prng_alea(seed?: string | number): AleaPRNGenerator
}