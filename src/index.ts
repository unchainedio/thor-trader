import _ from 'lodash'
import axios from 'axios'
import chalk from 'chalk'
import * as dotenv from 'dotenv'
import * as dfd from "danfojs-node"
import { baseAmount, AssetBTC, AssetBNB, AssetETH, AssetRuneNative, assetAmount, formatAssetAmountCurrency, assetFromString, baseToAsset,assetToBase, Asset } from '@xchainjs/xchain-util'
import { Network } from '@xchainjs/xchain-client'
import { NetworkApi, THORNODE_API_9R_URL, Configuration, TransactionsApi, QueueApi} from '@xchainjs/xchain-thornode'
import { Wallet, ThorchainCache, LiquidityPoolCache, doSwap, CryptoAmount, EstimateSwapParams, Midgard, SwapEstimate, ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { generatePhrase, validatePhrase, encryptToKeyStore, decryptFromKeystore } from '@xchainjs/xchain-crypto'
import {
  MidgardApi,
  Configuration as MidgardConfig,
  MIDGARD_API_9R_URL,
  PoolDetail,
} from '@xchainjs/xchain-midgard'
import fs from 'fs'
import BigNumber from 'bignumber.js'
import {assetAmount, assetFromString, baseToAsset} from '@xchainjs/xchain-util'
import {ThorchainAMM} from '@xchainjs/xchain-thorchain-amm'
import {genKeystore, keystorelocation, keypasswd} from './genkey.js'

//dotenv.config()
//console.log(process.env)
//const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
//console.log((PRIVATE_KEY)

const run = async (wallet: Wallet, amm: ThorchainAMM) => {
    // const keystore1 = JSON.parse(fs.readFileSync(keystorelocation, 'utf8'))
    // let phrase = await decryptFromKeystore(keystore1, keypasswd)
    let toRune : boolean
    let fromAsset: Asset
    let toAsset: Asset

    const combowallet = wallet
    console.log(combowallet.clients['THOR'].getAddress())     
    
    const allBalances = await combowallet.getAllBalances()
                                                                                                                                                                       
    const thorchainAmm = amm
    const thor = _.filter(allBalances, { 'chain': 'THOR' })
    const bnb = _.filter(allBalances, { 'chain': 'BNB' })
    thor[0].balances? console.log(chalk.green('Printing Rune balance')) : console.log(chalk.red('No Rune Balance'))
    thor[0].balances? console.log(                                                                                                                                                    
                `${formatAssetAmountCurrency({                                                                                                                                
                  amount: baseToAsset(thor[0].balances[0].amount),                                                                                                                        
                  asset: thor[0].balances[0].asset,                                                                                                                                       
                  trimZeros: true,                                                                                                                                            
                })}`,                                                                                                                                                         
            ) : 
      

    bnb[0].balances? console.log(chalk.green('Printing BNB balance')) : console.log(chalk.red('No BNB Balance'))
    bnb[0].balances? console.log(                                                                                                                                                    
                    `${formatAssetAmountCurrency({                                                                                                                                
                      amount: baseToAsset(bnb[0].balances[0].amount),                                                                                                                        
                      asset: bnb[0].balances[0].asset,                                                                                                                                       
                      trimZeros: true,                                                                                                                                            
                    })}`,                                                                                                                                                         
               ) :

    console.log(bnb[0].balances[1])
    bnb[0].balances[1]? console.log(chalk.green('Printing BUSD balance')) : console.log(chalk.red('No BUSD Balance'))                                                                             
    bnb[0].balances[1]? console.log(                                                                                                                                                    
                        `${formatAssetAmountCurrency({                                                                                                                                
                          amount: baseToAsset(bnb[0].balances[1].amount),                                                                                                                        
                          asset: bnb[0].balances[1].asset,                                                                                                                                       
                          trimZeros: true,                                                                                                                                            
                        })}`,                                                                                                                                                                                                                               
                   ) :
    console.log(baseToAsset(thor[0].balances[0].amount).gte(0))
    console.log(bnb[0].address)
    console.log(_.filter(thor, { 'type': 'BASE' }))
    const BUSD = assetFromString('BNB.BUSD-BD1')
    const RUNE = assetFromString('THOR.RUNE')      
     
    bnb[0].balances[1]? (baseToAsset(bnb[0].balances[1].amount).gte(1)? toRune = true : toRune = false) : toRune = false

    switch(toRune){
        case true:
            fromAsset = BUSD
            toAsset = RUNE
            console.log(chalk.green('toRune is true'))
            console.log(toAsset)
            if (!RUNE) throw Error('bad asset')                                                           
  //          // const swap = new CryptoAmount(thor[0].balances[0].amount, assetFromString('THOR.RUNE'))
  //          // const fees = new CryptoAmount(baseAmount('10000000'), assetFromString('THOR.RUNE'))                                                                                                                                                          
  //          // const netswap = swap.minus(fees)    
                                                                                                   
            const swapParams: EstimateSwapParams = {
                                input: new CryptoAmount(bnb[0].balances[1].amount, assetFromString('BNB.BUSD-BD1')),
                   // input: netswap,
                                destinationAsset: RUNE,
                  // affiliateFeePercent: 0.003, //optional                                                                                                                                                                                                                     slipLimit: new BigNumber('0.03'), //optional                                                                                                                                                                                             }
            }
            try{                                                                                                                                                                                                                                            
                await sendSwap(combowallet, swapParams, thorchainAmm, combowallet.clients['THOR'].getAddress())
                } catch (e) {
                    console.error(e)
                    }
        break

        case false:
            console.log(chalk.red('toRune is false'))
            const swap = new CryptoAmount(thor[0].balances[0].amount, assetFromString('THOR.RUNE')) 
            const fees = new CryptoAmount(baseAmount('10000000'), assetFromString('THOR.RUNE'))
            const netswap = swap.minus(fees)
            const busdswapParams: EstimateSwapParams = {
                //input: new CryptoAmount(thor[0].balances[0].amount, assetFromString('THOR.RUNE')),
                input: netswap,
                destinationAsset: BUSD,
            // affiliateFeePercent: 0.003, //optional
            slipLimit: new BigNumber('0.03'), //optional
            }
            try{
            await sendSwap(combowallet, busdswapParams, thorchainAmm, bnb[0].address)
            } catch(e){
                console.error(e)
            }
        break;
                }
    }




const sendSwap = async( wallet: Wallet, params: EstimateSwapParams, amm: ThorchainAMM, address: string ) => {

    try{
        const estimate = await amm.estimateSwap(params)
        console.log(chalk.green('inside swap'))
        print(estimate, params.input)
        if(estimate.canSwap){
        const transaction = await amm.doSwap(wallet, params, address)
        console.log(transaction)
        const jsonstring = JSON.stringify(transaction, null, 2)
        //console.log(jsonstring)
        await fs.writeFileSync('./executedtrades.json', jsonstring, {flag:'a'})
        // console.log(`Tx hash: ${transaction.hash},\n Tx url: ${transaction.url}\n WaitTime: ${transaction.waitTimeSeconds}`)
        }                                                                                                                                                     
        // console.log(transaction)
    } catch(err){
        console.log(err)
        }
    }


                                                     
  /**
 * Estimate swap function
 * Returns estimate swap object
 */
const estimateSwap = async (amm: ThorchainAMM) => {
  try {
    const network = Network.Mainnet //process.argv[2] as Network
    const amount = '35700' //process.argv[3]
    const fromAsset = assetFromString(`THOR.RUNE`)
    const toAsset = assetFromString(`BTC.BTC`)
    //const midgard = new Midgard(network)
    //const cache = new ThorchainCache(midgard)
    const thorchainAmm = amm

    const swapParams: EstimateSwapParams = {
      input: new CryptoAmount(assetToBase(assetAmount(amount)), fromAsset),
      destinationAsset: toAsset,
      // affiliateFeePercent: 0.003, //optional
      slipLimit: new BigNumber('0.03'), //optional
    }
    const estimate = await thorchainAmm.estimateSwap(swapParams)
    print(estimate, swapParams.input)
    const estimateInFromAsset = await thorchainAmm.getFeesIn(estimate.totalFees, fromAsset)
    estimate.totalFees = estimateInFromAsset
    print(estimate, swapParams.input)
  } catch (e) {
    console.error(e)
  }
}




function print(estimate: SwapEstimate, input: CryptoAmount) {
  const expanded = {
    input: input.formatedAssetString(),
    totalFees: {
      inboundFee: estimate.totalFees.inboundFee.formatedAssetString(),
      swapFee: estimate.totalFees.swapFee.formatedAssetString(),
      outboundFee: estimate.totalFees.outboundFee.formatedAssetString(),
      affiliateFee: estimate.totalFees.affiliateFee.formatedAssetString(),
    },
    slipPercentage: estimate.slipPercentage.toFixed(),
    netOutput: estimate.netOutput.formatedAssetString(),
    waitTimeSeconds: estimate.waitTimeSeconds.toFixed(),
    canSwap: estimate.canSwap,
    errors: estimate.errors,
  }
  console.log(expanded)
}

async function getData(mapi: midgardApi, qapi: queueApi, napi: networkApi, tapi: TransactionsApi){
    console.log(chalk.green("Gathering Data..."))
    
    const midgardApi = mapi
    const thornode = tapi
    const queueApi = qapi
    const networkApi = napi 


   try {                                                                                                                                                                                                                                                   
    const poolDetailsData = await midgardApi.getDepthHistory("BTC.BTC", "hour", "24")
        
      //console.log(poolDetailsData.data['intervals'])                                                                                                                                                                                                               
 
         let df = new dfd.DataFrame(poolDetailsData.data['intervals'])
         console.log(df.columns)
         //console.log(df['assetPrice, assetPriceUSD'])
         //df = df.assetPriceUSD
         //console.log("axis:" + df.axis)
         //console.log("max: " + df.max())
         //console.log("median: " + df.median())
         console.log(df.assetDepth)
         console.log(df.runeDepth)
         console.log(df.runeDepth.div(df.assetDepth))
         console.log(df.assetDepth.div(df.runeDepth))
         //console.log("min: " + df.min())
                                                                                                
    } catch (err) {                                                                                                                                                                                                                                         
    console.log(err)                                                                                                                                                                                                                                   
    }                            
   //const scheduledOutbound = await queueApi.queueScheduled()
   ////console.log(scheduledOutbound)
   //const queueOutbound = await queueApi.queueOutbound()
   //console.log(queueOutbound.data) 
   ////let outbound_df = new dfd.DataFrame(queueOutbound.data)
   //    //outbound_df? console.log(outbound_df.coin) : console.log(chalk.green("NO OUTBOUND TRANSACTIONS IN QUE"))
   //queueOutbound.data? console.log(chalk.red("This many outbound: ") + queueOutbound.data.length) : console.log(chalk.green("Wow! 0 outbound"))
    
    
   //const lastBlock = await networkApi.lastblock()  
   //console.log(lastBlock.data)
   //const test = await thornode.tx("BDF3507E7A4E4966BF415DD786AFD31AFA04FBF22BEA2EF2B906C9F067A30D83")


   //console.log(test.data.observed_tx)
   //const lastBlockHeight = lastBlock.data.find((item) => item.thorchain)
   ////console.log(queueOutbound.data.find((item) => item.chain))
   //const schedHeight = scheduledOutbound.data.find((item) => item.height)
   //console.log(lastBlockHeight)
   //console.log(schedHeight)
}
async function getPrice(fA: String, tA: String, tcc: ThorchainCache){
    const fromAsset = assetFromString(fA)
    const toAsset = assetFromString(tA)

    const er = await tcc.getExchangeRate(fromAsset, toAsset)
    console.log(er.toString())
}
async function main(){
//if( ! fs.existsSync(keystorelocation)){                                                                                                                                                                                                                   //genKeystore()
    ////  }

    dotenv.config()
    const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
    //console.log('privatekey: ' + PRIVATE_KEY)
    //const keystore1 = JSON.parse(fs.readFileSync(keystorelocation, 'utf8'))
    //let phrase = await decryptFromKeystore(keystore1, keypasswd) 
    let phrase = PRIVATE_KEY
    const midgard = new Midgard(Network.Mainnet) //defaults to mainnet
    const cache = new ThorchainCache(midgard)
    const midgardBaseUrl = MIDGARD_API_9R_URL                                                                                                                                                                                                                   const midgardApiConfig = new MidgardConfig({ basePath: midgardBaseUrl })                                                                                                                                                                                
    const midgardApi = new MidgardApi(midgardApiConfig)
    const baseUrl = THORNODE_API_9R_URL                                                                                                                                                                                                                     
    const apiConfigMID = new Configuration({ basePath: baseUrl })                                                                                                                                                                                             
    const thornode = new TransactionsApi(apiConfigMID)                                                                                                                                                                                                      
    const queueApi = new QueueApi(apiConfigMID)                                                                                                                                                                                                             
    const networkApi = new NetworkApi(apiConfigMID)
    
    const thorchainAmm = new ThorchainAMM(cache)
    const combowallet= new Wallet(phrase, cache)
    
    //while(true){
    //await estimateSwap(thorchainAmm)
    //await new Promise(r => setTimeout(r, 12000))
    //}
    await getPrice("THOR.RUNE", "BTC.BTC", cache)
    await getData(midgardApi, queueApi, networkApi, thornode)
    //await run(combowallet, thorchainAmm)

}




main()
    .then(() => process.exit(0))
    .catch((err) => console.error(err))
