import {
  array,
  Infer,
  number,
  type,
  object,
  string,
  nullable,
} from "superstruct";

export type TokenInfoType = Infer<typeof TokenInfoType>;
export const TokenInfoType = type({
  id: string(),
  symbol: string(),
  name: string(),
  image: string(),
  image2: string(),
  current_price: number(),
  tokenA: string(),
  tokenB: string(),
  price_change_percentage_24h: number() ,

  sparkline_in_7d: type({
    price: array(number()),
  }),
});
