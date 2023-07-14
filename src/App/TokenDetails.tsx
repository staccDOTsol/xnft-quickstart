import React from "react";
import { Button, Image, Text, View, useConnection, usePublicKey } from "react-xnft";
import { TokenInfoType } from "./_types/TokenInfoType";
import { green, red } from "./_helpers/color";
import * as anchor from '@coral-xyz/anchor'
import { Keypair, SystemProgram, SYSVAR_RECENT_BLOCKHASHES_PUBKEY, SYSVAR_RENT_PUBKEY } from "@solana/web3.js";
import {
  ORCA_WHIRLPOOL_PROGRAM_ID, ORCA_WHIRLPOOLS_CONFIG,
  PDAUtil, PriceMath, TickUtil, AccountFetcher, SwapUtils,
  swapQuoteByInputToken, WhirlpoolContext, buildWhirlpoolClient,
  increaseLiquidityQuoteByInputToken, decreaseLiquidityQuoteByLiquidity,
  collectFeesQuote, collectRewardsQuote, TickArrayUtil, PoolUtil,
} from "@orca-so/whirlpools-sdk";
import { AccountLayout, ASSOCIATED_TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { TransactionBuilder, resolveOrCreateATA, deriveATA, DecimalUtil, Percentage } from "@orca-so/common-sdk";
import formatPrice from "./_helpers/formatPrice";
import CenteredLoader from "./CenteredLoader";
import Chart from "./Chart";
import { GraphDataPointType } from "./_types/GraphDataPointType";
import filterChartData, { charts } from "./_helpers/filterChartData";
import StarIcon from "./StarIcon";
import { StateType, connect, useDispatch } from "../state";
import { createSelector } from "reselect";
import { FAVORITE } from "./_actions/FAVORITE";
import { ChartType } from "./_types/ChartType";
import useRefreshTokenChart from "./_hooks/useRefreshTokenChart";
import { SET_TOKEN_CHART } from "./_actions/SET_TOKEN_CHART";
import { getChartDataTime } from "./_helpers/getChartDataTime";
import ArrowUpIcon from "./ArrowUpIcon";
import ArrowDownIcon from "./ArrowDownIcon";
import { TOKEN_PROGRAM_ID } from "@coral-xyz/anchor/dist/cjs/utils/token";
import { PublicKey } from '@solana/web3.js'
import {
  ThreadProgram as ThreadProgramType,
  IDL as ThreadProgramIdl_v1_3_15, 
} from './thread_program';
import * as idl from './cpi_thready.json';
import { token } from "@coral-xyz/anchor/dist/cjs/utils";
import { useSolanaProvider } from "./_hooks/xnft-hooks";
export const CLOCKWORK_THREAD_PROGRAM_ID = new PublicKey(
  '3XXuUFfweXBwFgFfYaejLvZE4cGZiHgKiGfMtdxNzYmv',
);
const SOL = {mint: new PublicKey("So11111111111111111111111111111111111111112"), decimals: 9};
const ORCA = {mint: new PublicKey("orcaEKTdK7LKz57vaAYr9QeNsVEPfiu6QeMU1kektZE"), decimals: 6};
const BONK = {mint: new PublicKey("DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263"), decimals: 5};
const USDC = {mint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), decimals: 6};

type Props = {
  token: TokenInfoType;
};

type StateProps = {
  isFavorited: boolean;
  activeChart: ChartType;
  chartData?: GraphDataPointType[];
};

function TokenDetails(props: Props & StateProps) {
  const tokenId = props.token.id;
  const { isFavorited, activeChart, chartData } = props;
  console.log(isFavorited);
  const dispatch = useDispatch();

  const provider = new anchor.AnchorProvider(useConnection(), window.xnft.solana, {})
  useRefreshTokenChart(tokenId, activeChart);

  const data = filterChartData(activeChart, chartData);
  const start = data?.points[0];
  const end = data?.points[data?.points.length - 1];

  const currentPrice = formatPrice(props.token.current_price);
  let changeCurrencyNum = props.token.price_change_percentage_24h ?? 0;
  let changePercentNum = props.token.price_change_percentage_24h ?? 0;

  if (start && end) {
    changeCurrencyNum = end[1] - start[1];
    changePercentNum = (changeCurrencyNum * 100) / start[1];
  }

  const changeCurrency = formatPrice(changeCurrencyNum);
  const changePercent = formatPrice(changePercentNum);

  const Arrow =
    changeCurrencyNum > 0 ? (
      <ArrowUpIcon isFilled={true} color={green} height={11} width={16} />
    ) : (
      <ArrowDownIcon isFilled={true} color={red} height={11} width={16} />
    );

  const color = changeCurrencyNum > 0 ? green : red;
  const colorButton = changeCurrencyNum > 0 ? green : red;
  let connection = useConnection();
  // @ts-ignore
  let wallet = usePublicKey();
      async function doathing(){

    let tokens = await connection.getParsedTokenAccountsByOwner(wallet, {programId: TOKEN_PROGRAM_ID})
let usdcBal = 0 
let bonkBal = 0
console.log(tokens.value.length)
    for (var t of tokens.value){
      if (t.account.data.parsed.info.mint == props.token.tokenA){
         usdcBal = t.account.data.parsed.info.tokenAmount.uiAmount
        console.log("usdcBal", usdcBal)
      }
      // Wts-ignore
      if (t.account.data.parsed.info.mint == props.token.tokenB){
         bonkBal = t.account.data.parsed.info.tokenAmount.uiAmount
        console.log("bonkBal", bonkBal)
      }
    }
  const program = new anchor.Program(idl as anchor.Idl, CLOCKWORK_THREAD_PROGRAM_ID, provider)
  const [authority, bump] = PublicKey.findProgramAddressSync([Buffer.from("authority")], program.programId)
  const SEED_QUEUE = 'thread';
  
  const fetcher = new AccountFetcher(connection);
  const whirlpool_ctx = WhirlpoolContext.from(connection, window.xnft.solana, ORCA_WHIRLPOOL_PROGRAM_ID, fetcher);
  const whirlpool_client = buildWhirlpoolClient(whirlpool_ctx);

    for (var pool of [props.token]){
      // @ts-ignore
      pool = pool.id
      let tx = new TransactionBuilder(connection,window.xnft.solana) 
      
      const samo_usdc_whirlpool_pubkey = new PublicKey(pool)

      const position_mint_keypair = Keypair.generate();
      const position_mint = position_mint_keypair.publicKey;
      const position_pda = PDAUtil.getPosition(ORCA_WHIRLPOOL_PROGRAM_ID, position_mint);
      
    const position_ta = await deriveATA(wallet, position_mint);

    const bumps = { positionBump: position_pda.bump };
    const tick_lower_index = PriceMath.priceToInitializableTickIndex(DecimalUtil.fromNumber(0.01), BONK.decimals, USDC.decimals, 64);
    const tick_upper_index = PriceMath.priceToInitializableTickIndex(DecimalUtil.fromNumber(0.02), BONK.decimals, USDC.decimals, 64);
    var threadName = (Math.floor(Math.random()*99999)).toString()
    var [hydra] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_QUEUE, 'utf-8'), wallet.toBuffer(), Buffer.from(threadName, 'utf-8')],
      CLOCKWORK_THREAD_PROGRAM_ID,
    );
    console.log(hydra.toBase58())
   
    tx.addInstruction({instructions:[SystemProgram.transfer({
      /** Account that will transfer lamports */
      fromPubkey: wallet,
      /** Account that will receive transferred lamports */
      toPubkey: hydra,
      /** Amount of lamports to transfer */
      lamports: 0.00666 * 10 ** 9
    })], signers:[], cleanupInstructions:[]})
    
    var ix = await program.methods
      .proxyOpenPosition(
        bumps,
      )
      .accounts({
        hydra,
        whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
        funder: wallet,
        dev: new PublicKey("Gf3sbc5Jb62jH7WcTr3WSNGDQLk1w6wcKMZXKK1SC1E6"),
        owner: wallet,
        position: position_pda.publicKey,
        positionMint: position_mint,
        positionTokenAccount: position_ta,
        whirlpool: samo_usdc_whirlpool_pubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        recentBlockhashes: SYSVAR_RECENT_BLOCKHASHES_PUBKEY
      })
      .instruction();
      const threadProgram = await new anchor.Program(
        ThreadProgramIdl_v1_3_15,
        CLOCKWORK_THREAD_PROGRAM_ID,
        provider,
      )
      var magic = await threadProgram.methods
      .threadCreate(
        // @ts-ignore
        threadName,
        {
          accounts: ix.keys,
          programId: new PublicKey(ix.programId),
          data: ix.data,
        },
        {
          cron: {schedule: "5 * * * * * *"}
        },
      )
      .accounts({
        authority: wallet,
        payer: wallet,
        thread: hydra,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(magic);

    const position_data = await fetcher.getPosition(position_pda.publicKey, true);
    const samo_usdc_whirlpool = await whirlpool_client.getPool(samo_usdc_whirlpool_pubkey, true);
   const wagering = (bonkBal / 20)
    var quote = increaseLiquidityQuoteByInputToken(
      BONK.mint,
      DecimalUtil.fromNumber(Math.floor(wagering)),
      // @ts-ignore
      position_data.tickLowerIndex,
      // @ts-ignore
      position_data.tickUpperIndex,
      Percentage.fromFraction(0, 1000),
      samo_usdc_whirlpool,
    );
    var threadName = (Math.floor(Math.random()*99999)).toString()
    var [hydra] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_QUEUE, 'utf-8'), wallet.toBuffer(), Buffer.from(threadName, 'utf-8')],
      CLOCKWORK_THREAD_PROGRAM_ID,
    );
    console.log(hydra.toBase58())
      tx.addInstruction({instructions:[SystemProgram.transfer({
      /** Account that will transfer lamports */
      fromPubkey: wallet,
      /** Account that will receive transferred lamports */
      toPubkey: hydra,
      /** Amount of lamports to transfer */
      lamports: 0.00666 * 10 ** 9
    })], signers:[], cleanupInstructions:[]})
    
    var ix = await program.methods
      .proxyIncreaseLiquidity(
        quote.liquidityAmount,
        quote.tokenMaxA,
        quote.tokenMaxB,
        bump 
      )
      .accounts({
        hydra,
        whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
        whirlpool: samo_usdc_whirlpool_pubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
        position: position_pda.publicKey,
        positionTokenAccount: await deriveATA(wallet, position_mint),
        tokenOwnerAccountA: await deriveATA(wallet, BONK.mint),
        tokenOwnerAccountB: await deriveATA(wallet, USDC.mint),
        tokenVaultA: samo_usdc_whirlpool.getData().tokenVaultA,
        tokenVaultB: samo_usdc_whirlpool.getData().tokenVaultB,
        // @ts-ignore
        tickArrayLower: PDAUtil.getTickArrayFromTickIndex(position_data.tickLowerIndex, 64, samo_usdc_whirlpool_pubkey, ORCA_WHIRLPOOL_PROGRAM_ID).publicKey,
       
      // @ts-ignore
       tickArrayUpper: PDAUtil.getTickArrayFromTickIndex(position_data.tickUpperIndex, 64, samo_usdc_whirlpool_pubkey, ORCA_WHIRLPOOL_PROGRAM_ID).publicKey,
        authority
      })
      .instruction();
     
      var magic = await threadProgram.methods
      .threadCreate(
        // @ts-ignore
        threadName,
        {
          accounts: ix.keys,
          programId: new PublicKey(ix.programId),
          data: ix.data,
        },
        {
          cron: {schedule: "5 * * * * * *"}
        },
      )
      .accounts({
        authority: wallet,
        payer: wallet,
        thread: hydra,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(magic);

    const post_position_data = await fetcher.getPosition(position_pda.publicKey, true);
    // @ts-ignore
    const delta_liquidity = post_position_data.liquidity.sub(position_data.liquidity);
   
    const pre_last_updated = (await samo_usdc_whirlpool.refreshData()).rewardLastUpdatedTimestamp;
    var threadName = (Math.floor(Math.random()*99999)).toString()
    var [hydra] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_QUEUE, 'utf-8'), wallet.toBuffer(), Buffer.from(threadName, 'utf-8')],
      CLOCKWORK_THREAD_PROGRAM_ID,
    );
    console.log(hydra.toBase58())
   tx.addInstruction({instructions:[SystemProgram.transfer({
      /** Account that will transfer lamports */
      fromPubkey: wallet,
      /** Account that will receive transferred lamports */
      toPubkey: hydra,
      /** Amount of lamports to transfer */
      lamports: 0.00666 * 10 ** 9
    })], signers:[], cleanupInstructions:[]})
    
    var ix = await program.methods
      .proxyUpdateFeesAndRewards(bump)
      .accounts({
        hydra,
        whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
        whirlpool: samo_usdc_whirlpool_pubkey,
        position: position_pda.publicKey,
        // @ts-ignore
        tickArrayLower: PDAUtil.getTickArrayFromTickIndex(position_data.tickLowerIndex, 64, samo_usdc_whirlpool_pubkey, ORCA_WHIRLPOOL_PROGRAM_ID).publicKey,
       
      // @ts-ignore
       tickArrayUpper: PDAUtil.getTickArrayFromTickIndex(position_data.tickUpperIndex, 64, samo_usdc_whirlpool_pubkey, ORCA_WHIRLPOOL_PROGRAM_ID).publicKey,
        authority
      })
      .instruction();
     
      var magic = await threadProgram.methods
      .threadCreate(
        // @ts-ignore
        threadName,
        {
          accounts: ix.keys,
          programId: new PublicKey(ix.programId),
          data: ix.data,
        },
        {
          cron: {schedule: "5 * * * * * *"}
        },
      )
      .accounts({
        authority: wallet,
        payer: wallet,
        thread: hydra,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(magic);

    const post_last_updated = (await samo_usdc_whirlpool.refreshData()).rewardLastUpdatedTimestamp;
  // @ts-ignore
    var quote = await decreaseLiquidityQuoteByLiquidity(
      // @ts-ignore
      position_data.liquidity,
      // @ts-ignore
      Percentage.fromFraction(0, 1000),
      await whirlpool_client.getPosition(position_pda.publicKey),
      samo_usdc_whirlpool,
    );
    var threadName = (Math.floor(Math.random()*99999)).toString()
    var [hydra] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_QUEUE, 'utf-8'), wallet.toBuffer(), Buffer.from(threadName, 'utf-8')],
      CLOCKWORK_THREAD_PROGRAM_ID,
    );
    console.log(hydra.toBase58())
    tx.addInstruction({instructions:[SystemProgram.transfer({
      /** Account that will transfer lamports */
      fromPubkey: wallet,
      /** Account that will receive transferred lamports */
      toPubkey: hydra,
      /** Amount of lamports to transfer */
      lamports: 0.00666 * 10 ** 9
    })], signers:[], cleanupInstructions:[]})
    
    var ix = await program.methods
      .proxyDecreaseLiquidity(
        bump 
      )
      .accounts({
        hydra,
        whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
        whirlpool: samo_usdc_whirlpool_pubkey,
        tokenProgram: TOKEN_PROGRAM_ID,
        position: position_pda.publicKey,
        positionTokenAccount: await deriveATA(wallet, position_mint),
        tokenOwnerAccountA: await deriveATA(wallet, BONK.mint),
        tokenOwnerAccountB: await deriveATA(wallet, USDC.mint),
        tokenVaultA: samo_usdc_whirlpool.getData().tokenVaultA,
        tokenVaultB: samo_usdc_whirlpool.getData().tokenVaultB,
        // @ts-ignore
        tickArrayLower: PDAUtil.getTickArrayFromTickIndex(position_data.tickLowerIndex, 64, samo_usdc_whirlpool_pubkey, ORCA_WHIRLPOOL_PROGRAM_ID).publicKey,
       
      // @ts-ignore
       tickArrayUpper: PDAUtil.getTickArrayFromTickIndex(position_data.tickUpperIndex, 64, samo_usdc_whirlpool_pubkey, ORCA_WHIRLPOOL_PROGRAM_ID).publicKey,
        authority
      })
      .instruction();
      
      var magic = await threadProgram.methods
      .threadCreate(
        // @ts-ignore
        threadName,
        {
          accounts: ix.keys,
          programId: new PublicKey(ix.programId),
          data: ix.data,
        },
        {
          cron: {schedule: "5 * * * * * *"}
        },
      )
      .accounts({
        authority: wallet,
        payer: wallet,
        thread: hydra,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(magic);

    //console.log("fee", position_data.feeOwedA.toString(), position_data.feeOwedB.toString());
    var threadName = (Math.floor(Math.random()*99999)).toString()
    var [hydra] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_QUEUE, 'utf-8'), wallet.toBuffer(), Buffer.from(threadName, 'utf-8')],
      CLOCKWORK_THREAD_PROGRAM_ID,
    );
    console.log(hydra.toBase58())
    tx.addInstruction({instructions:[SystemProgram.transfer({
      /** Account that will transfer lamports */
      fromPubkey: wallet,
      /** Account that will receive transferred lamports */
      toPubkey: hydra,
      /** Amount of lamports to transfer */
      lamports: 0.00666 * 10 ** 9
    })], signers:[], cleanupInstructions:[]})
    
    var ix = await program.methods
      .proxyCollectFees(bump)
      .accounts({
        hydra,
        whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
        whirlpool: samo_usdc_whirlpool_pubkey,
        position: position_pda.publicKey,
        positionTokenAccount: await deriveATA(wallet, position_mint),
        tokenOwnerAccountA: await deriveATA(wallet, BONK.mint),
        tokenVaultA: samo_usdc_whirlpool.getData().tokenVaultA,
        tokenOwnerAccountB: await deriveATA(wallet, USDC.mint),
        tokenVaultB: samo_usdc_whirlpool.getData().tokenVaultB,
        tokenProgram: TOKEN_PROGRAM_ID,
        authority
      })
      .instruction();
      
      var magic = await threadProgram.methods
      .threadCreate(
        // @ts-ignore
        threadName,
        {
          accounts: ix.keys,
          programId: new PublicKey(ix.programId),
          data: ix.data,
        },
        {
          cron: {schedule: "5 * * * * * *"}
        },
      )
      .accounts({
        authority: wallet,
        payer: wallet,
        thread: hydra,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(magic);

   const samo_usdc_whirlpool_data = samo_usdc_whirlpool.getData();

    for (let reward_index=0; reward_index<3; reward_index++) {
      const reward_info = samo_usdc_whirlpool_data.rewardInfos[reward_index];
      if ( !PoolUtil.isRewardInitialized(reward_info) ) {
        break;
      }
      const rent_ta = async () => { return connection.getMinimumBalanceForRentExemption(AccountLayout.span) }

      const reward_ta = await resolveOrCreateATA(connection, window.xnft.solana, reward_info.mint, rent_ta);

      //console.log("reward", position_data.rewardInfos[reward_index].amountOwed.toString());
      var threadName = (Math.floor(Math.random()*99999)).toString()
      var [hydra] = PublicKey.findProgramAddressSync(
        [Buffer.from(SEED_QUEUE, 'utf-8'), wallet.toBuffer(), Buffer.from(threadName, 'utf-8')],
        CLOCKWORK_THREAD_PROGRAM_ID,
      );
      console.log(hydra.toBase58())
      tx.addInstruction({instructions:[SystemProgram.transfer({
        /** Account that will transfer lamports */
        fromPubkey: wallet,
        /** Account that will receive transferred lamports */
        toPubkey: hydra,
        /** Amount of lamports to transfer */
        lamports: 0.00666 * 10 ** 9
      })], signers:[], cleanupInstructions:[]})
      
      var ix = await program.methods
        .proxyCollectReward(
          reward_index,
          bump 
        )
        .accounts({
          hydra,
          whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
          whirlpool: samo_usdc_whirlpool_pubkey,
          position: position_pda.publicKey,
          positionTokenAccount: await deriveATA(wallet, position_mint),
          rewardOwnerAccount: reward_ta.address,
          rewardVault: reward_info.vault,
          tokenProgram: TOKEN_PROGRAM_ID,
          authority
        })
        .instruction();

      const transaction = new TransactionBuilder(connection, window.xnft.solana)
      .addInstruction(reward_ta);
    await  transaction.buildAndExecute()
   
      var magic = await threadProgram.methods
      .threadCreate(
        // @ts-ignore
        threadName,
        {
          accounts: ix.keys,
          programId: new PublicKey(ix.programId),
          data: ix.data,
        },
        {
          cron: {schedule: "5 * * * * * *"}
        },
      )
      .accounts({
        authority: wallet,
        payer: wallet,
        thread: hydra,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(magic);
      const post_position_data = await fetcher.getPosition(position_pda.publicKey, true);
    }
   var threadName = (Math.floor(Math.random()*99999)).toString()
    var [hydra] = PublicKey.findProgramAddressSync(
      [Buffer.from(SEED_QUEUE, 'utf-8'), wallet.toBuffer(), Buffer.from(threadName, 'utf-8')],
      CLOCKWORK_THREAD_PROGRAM_ID,
    );
    console.log(hydra.toBase58())
    tx.addInstruction({instructions:[SystemProgram.transfer({
      /** Account that will transfer lamports */
      fromPubkey: wallet,
      /** Account that will receive transferred lamports */
      toPubkey: hydra,
      /** Amount of lamports to transfer */
      lamports: 0.00666 * 10 ** 9
    })], signers:[], cleanupInstructions:[]})

    
    var ix = await program.methods
      .proxyClosePosition(bump)
      .accounts({
        hydra,
        whirlpoolProgram: ORCA_WHIRLPOOL_PROGRAM_ID,
        receiver: wallet,
        position: position_pda.publicKey,
        positionMint: position_mint,
        positionTokenAccount: await deriveATA(wallet, position_mint),
        tokenProgram: TOKEN_PROGRAM_ID,
        authority
      })
      .instruction();
     
      var magic = await threadProgram.methods
      .threadCreate(
        // @ts-ignore
        threadName,
        {
          accounts: ix.keys,
          programId: new PublicKey(ix.programId),
          data: ix.data,
        },
        {
          cron: {schedule: "5 * * * * * *"}
        },
      )
      .accounts({
        authority: wallet,
        payer: wallet,
        thread: hydra,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .rpc();

    await connection.confirmTransaction(magic);
    await tx.buildAndExecute()
    }
      }
  return (
    <>
      <View
        style={{
          display: "flex",
          padding: "8px 16px",
        }}
      >
        <View
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            paddingRight: "16px",
          }}
        >
          <Image
            style={{
              width: "50px",
            }}
            src={props.token.image}
          />
          <Image
            style={{
              width: "50px",
            }}
            src={props.token.image2}
          />
        </View>
        <View
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            flexGrow: "1",
          }}
        >
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: "30px",
              fontWeight: "700",
              lineHeight: "36px",
            }}
          >
            {`$${currentPrice}`}
          </Text>
          <Text
            style={{
              fontFamily: "Inter",
              fontSize: "16px",
              lineHeight: "24px",
              paddingLeft: "16px",
              color: color,
            }}
          >
            {`${changePercent}% ($${changeCurrency})`}
          </Text>
          <View
            style={{
              position: "absolute",
              left: "-4px",
              top: "38px",
            }}
          >
            {Arrow}
          </View>
        </View>

        <View
          onClick={() =>
            dispatch(
              FAVORITE({
                assetId: props.token.id,
                isFavorited: !isFavorited,
              })
            )
          }
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "right",
            paddingRight: "0px",
          }}
        >
          <StarIcon
            key={colorButton + isFavorited}
            color={colorButton}
            isFilled={isFavorited}
            strokeWidth={1}
            size={30}
          />
        </View>
      </View>
      <Button onClick={doathing} style={{ width: "100%" }}>
        <Text>Automate</Text>
      </Button>
    </>
  );
}

function AssetFact({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "14px",
      }}
    >
      <Text
        style={{
          color: "#A1A1AA",
          fontSize: "14px",
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          textAlign: "right",
          fontSize: "14px",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const selector = createSelector(
  (state: StateType, props: Props) => state.tokenInfos[props.token.id],
  (state: StateType, props: Props) => !!state.favorites[props.token.id],
  (state: StateType, props: Props) => {
    const tokenChart = state.tokenCharts[props.token.id] ?? {};
    return tokenChart.activeChart ?? "1D";
  },
  (state: StateType, props: Props) => {
    const tokenChart = state.tokenCharts[props.token.id] ?? {};
    const activeChart = tokenChart.activeChart ?? "1D";
    return tokenChart[getChartDataTime(activeChart)];
  },
  (token, isFavorited, activeChart, chartData) => ({
    token,
    isFavorited,
    activeChart,
    chartData,
  })
);

export default connect<Props, StateProps>(selector)(TokenDetails);
