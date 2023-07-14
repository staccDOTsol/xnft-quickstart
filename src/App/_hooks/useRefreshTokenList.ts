import { useEffect } from "react";
import { useDispatch } from "../../state";
import { SET_TOKENLIST } from "../_actions/SET_TOKENLIST";
import { TokenListType } from "../_types/TokenListType";

const refreshtime = 1000 * 60;
const count = 250;
const url = `https://api.mainnet.orca.so/v1/whirlpool/list`;

function useRefreshTokenList() {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchTokenList = () => {
      fetch(url)
        .then(async (response) => {
          const jsona = await response.json();
          let json: TokenListType = []
          let goodLogo = ""
          for(var j in jsona.whirlpools){
            jsona.whirlpools[j].tokenA.logoURI ? goodLogo = jsona.whirlpools[j].tokenA.logoURI:  goodLogo = goodLogo
            console.log(j)
            json.push({
              tokenA: jsona.whirlpools[j].tokenA.mint,
              tokenB: jsona.whirlpools[j].tokenB.mint,
              price_change_percentage_24h: jsona.whirlpools[j].priceRange ? jsona.whirlpools[j].priceRange.day.max - jsona.whirlpools[j].priceRange.day.min : 0,
              sparkline_in_7d:jsona.whirlpools[j].priceRange ? { price: [
                jsona.whirlpools[j].priceRange.day.min,
               jsona.whirlpools[j].priceRange.week.min,
               jsona.whirlpools[j].priceRange.month.min
              ]} : {
                price: []
              },
  id: jsona.whirlpools[j].address.toString(),
  symbol: jsona.whirlpools[j].tokenA.symbol +'-' + jsona.whirlpools[j].tokenB.symbol,
  name: jsona.whirlpools[j].tokenA.name +'-' + jsona.whirlpools[j].tokenB.name,
  image: jsona.whirlpools[j].tokenA.logoURI || goodLogo,
  image2: jsona.whirlpools[j].tokenB.logoURI || goodLogo,
  current_price: jsona.whirlpools[j].price 
            })
          }
          if (TokenListType.is(json)) {
            dispatch(
              SET_TOKENLIST({
                tokenData: json,
              })
            );
          } else {
            throw TokenListType.validate(json)[0];
          }
        })
        .catch((e) => {
          console.error(e, "refreshing in", refreshtime);
        });
    };
    fetchTokenList();
    const refresh = setInterval(fetchTokenList, refreshtime);
    return () => {
      clearInterval(refresh);
    };
  }, []);
}

export default useRefreshTokenList;
