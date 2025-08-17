import type { Duration } from 'luxon'

export type Stringish      = string
export type Whim           = string
/** a word or term */
export type Word         = string
/** a word of lower-cased letters (matching /^[a-z]+[a-z0-9]*$/) */
export type Label      = string
/* A single lower-cased letter */
export type Letter       = string

// == [BagBagBagBagBag] ==

/** Lookup table / dictionary of generic properties */
export type Bag<VT> = Record<string, VT>
/** Lookup table / dictionary of generic properties */
export type PartBag<KT extends string, VT> = Partial<Record<KT, VT>>
/** Generic bag of properties */
export type AnyBag = Bag<any>
/** Bag of strings */
export type StrBag = Bag<string>
export type StringBag   = Bag<string>
export type BoolBag     = Bag<boolean>
export type NumberBag   = Bag<number>
export type EmptyBag    = Bag<never>
export type Nullbag     = Bag<null>
export type AnyFunc     = (...args: any[]) => any
export type PartialBag<KT extends string | number | symbol = string, VT = any> = Partial<Record<KT, VT>>

// **********************************************************************
//
// Semantic String Types
//

export type Ipv4host       = string
export type Ipv6host       = string
export type Hostname       = string
export type Hostorip       = string
export type Handle         = string

/** String or we'll figure it out for you */
export type StringMaybe    = string | null | undefined
export type NumberMaybe    = number  | null | undefined
export type BoolMaybe      = boolean | null | undefined
export type NestedStringMaybes = StringMaybe | NestedStringMaybes[] // use with _.flattenDeep

// **********************************************************************
//
// Primitive Type Aliases
//
export type Int64          = number
export type Intjs          = number
export type SafeInt        = number
export type Safenum        = number
export type Int32          = number
export type BigInt         = number
export type Float          = number
export type Quantity       = number
export type Anynum         = string
export type Asciish        = string
export type Backingname    = string

export type Lat            = number
export type Lng            = number

export type Topicname      = string
export type Shortstr       = string
export type Idkey          = string
export type Idkeystr       = string
export type Medstr         = string
export type Fullstr        = string
export type Bigstr         = string
export type Notestr        = string
export type Alnumbar       = string
export type Upalnumbar     = string
export type Plain          = string
export type Intish         = string
export type Numberish      = string
export type Namestr        = string
export type Name_part      = string
export type Titleish       = string
export type Longtitle      = string
export type Noteish        = string
export type Classname      = string
/** A string that starts with [a-zA-Z] and has only [a-zA-Z0-9_] */
export type Fieldname      = string // & { _: 'Fieldname' }
export type Dotfield       = string

export type Email          = string
export type URLStr         = string
export type URLPath        = string
export type Portnum        = number
export type URLFixme       = string
export type VerifCode      = string
export type Password       = string
export type Phone          = string
export type Postcode       = string
export type Country        = string
export type Login2faCode   = string
export type Treepath       = string
export type Treecode       = string
export type Treelvl        = number
export type Sorder         = string
export type SmsfullV       = string
export type Keyish         = string
export type Extkeyish      = string
export type Pctenc_key     = string
export type Labelsegs      = string
export type Handleish      = string
export type Flowhandle     = string
export type Nsphandle      = string
export type NodeID         = string
export type CenterID       = string
export type SpanID         = string
export type LooseID        = string
export type Agentkey       = string
export type Pfx            = string
export type Okey           = string
export type Ukey           = string
export type UkeyR          = string
export type StableGUID     = string
export type RandomGUID     = string
export type TimeGUID       = string
export type AnyGUID        = string
export type Hexstring      = string
export type Timestamp      = number
// export type ISO         = string
export type Timecode       = string
export type Tctimepart     = string
export type Tcuniqpart     = string
export type ISODur         = string | Duration
export type ISOTime        = string
export type ISONearFut     = string
export type ISONowish      = string
export type ISONearPast    = string
export type ISOYmdhms      = string
export type ISOYmd         = string

export type Yearnum        = number
export type Month          = number
export type Monthnum       = number
export type Monthday       = number
export type NearYear       = number
export type Year           = number
export type Nearyear      = number
export type NearFutTC     = string
export type NearTC        = string
export type NearFutTS     = number
export type NearTS        = number

export type Years          = number
export type Quarters       = number
export type Months         = number
export type Weeks          = number
export type Days           = number
export type Hours          = number
export type Minutes        = number
export type Seconds        = number
export type Millis         = number
export type HexColor       = string
export type Moneyish       = string
export type TaxRate        = string
export type Emoji          = string
export type Hexrange       = string
export type Image_path     = string
export type ImageOrUrl     = string
export type Phrasetag      = string
export type Masked_num     = string
export type Record_count   = number

export type TreeLvl        = number

export type Boolish        = string

export type Sintish        = string
export type Namepart       = string
export type Company        = string

export type PctencKey      = string
export type Tagsegs        = string

export type CognitoAttr    = string

export type GUIDV4T         = string

export type ID26Str        = string
export type Cogkey         = string
export type Numstr         = string
export type Qtystr         = string
export type Pricestr       = string

export type ASIN           = string
export type CurrencyAmount = string
export type DID            = string
export type HSL            = string
export type HSLA           = string
export type HexColorCode   = string
export type IBAN           = string
export type ISBN           = string
export type MAC            = string
export type ObjectID       = string
export type PhoneNumber    = string
export type Port           = string
export type PostalCode     = string
export type RGB            = string
export type RGBA           = string
export type ImagePath      = string
//
export type Camel          = string
export type Locamel        = string
export type Snake          = string
export type Varname        = string
export type Tstype         = string

export type EmailAddress   = string
export type Hexadecimal    = string
export type ISODuration    = string
export type JWT            = string
export type Name           = string
export type UUID           = string
export type UtcOffset      = string
export type Regexstr       = string

export type UUIDStr        = string

export type RecordCount    = number
export type MaskedNum      = string
export type Gitbranch      = string
export type VverStr        = string
export type TkverStr       = string
export type Vmaj           = number
export type Vmin           = number
export type Vpat           = number
export type Vpre           = string
export type Schemaver      = string
export type Gitcommit      = string

export type  Pfxstr             = string
export type  Typenamestr        = string

export type Byte           = number
export type Latitude       = number
export type Longitude      = number
export type Weight         = number

export  type { ArrNZRO, StrArrNZRO, ArrNZ, StrArrNZ, NonEmptyArray, NonEmptyStringArray } from './TSTools.ts'
