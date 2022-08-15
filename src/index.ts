import _ from 'lodash'
import axios from 'axios'
import { MidgardApi, Configuration, MIDGARD_API_TS_URL, MIDGARD_API_9R_URL, MIDGARD_API_TC_URL } from '@xchainjs/xchain-midgard'
import { baseAmount, AssetBTC, AssetBNB, AssetETH, AssetRuneNative, assetAmount, formatAssetAmountCurrency, assetFromString, baseToAsset,assetToBase } from '@xchainjs/xchain-util'
import { Network } from '@xchainjs/xchain-client'
import { doSwap, CryptoAmount, EstimateSwapParams, Midgard, SwapEstimate, ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { generatePhrase, validatePhrase, encryptToKeyStore, decryptFromKeystore } from '@xchainjs/xchain-crypto'
import fs from 'fs'
import BigNumber from 'bignumber.js'
// import { thorWallet } from './thor-client.js'
// import { Client, getChainIds, getDefaultClientUrl} from '@xchainjs/xchain-thorchain'
import { Client } from '@xchainjs/xchain-ethereum'
import {genKeystore, keystorelocation, keypasswd} from './genkey.js'
// import { Wallet } from './wallet.js'
import { Wallet } from '@xchainjs/xchain-thorchain-amm'
import {balance} from '@cosmos-client/core/cjs/rest/bank/module.js'
// import {EstimateSwapParams, EstimateSwapParams} from './types.js'
// import {Wallet} from 'ethers'
// import {Midgard} from './utils/midgard.js'
// import {Wallet} from 'ethers'

const theUrl = 'https://midgard.thorchain.info/v2/thorchain/inbound_addresses'

const btcpoolUrl= 'https://midgard.thorchain.info/v2/pool/BTC.BTC'





const run = async (wallet: Wallet, amm: ThorchainAMM) => {
    // const keystore1 = JSON.parse(fs.readFileSync(keystorelocation, 'utf8'))
    // let phrase = await decryptFromKeystore(keystore1, keypasswd)
    let toRune : boolean
    
  
    const combowallet = wallet
    // console.log(combowallet)     
    
    const allBalances = await combowallet.getAllBalances()
                                                                                                                                                                       
    const thorchainAmm = amm
    const thor = _.filter(allBalances, { 'chain': 'THOR' })
    const bnb = _.filter(allBalances, { 'chain': 'BNB' })
    thor[0].balances? console.log('Printing Rune balance') : console.log('No Rune Balance')
    thor[0].balances? console.log(                                                                                                                                                    
                `${formatAssetAmountCurrency({                                                                                                                                
                  amount: baseToAsset(thor[0].balances[0].amount),                                                                                                                        
                  asset: thor[0].balances[0].asset,                                                                                                                                       
                  trimZeros: true,                                                                                                                                            
                })}`,                                                                                                                                                         
            ) : 
      

    bnb[0].balances? console.log('Printing BNB balance') : console.log('No BNB Balance')
    bnb[0].balances? console.log(                                                                                                                                                    
                    `${formatAssetAmountCurrency({                                                                                                                                
                      amount: baseToAsset(bnb[0].balances[0].amount),                                                                                                                        
                      asset: bnb[0].balances[0].asset,                                                                                                                                       
                      trimZeros: true,                                                                                                                                            
                    })}`,                                                                                                                                                         
               ) :

    console.log(bnb[0].balances[1])
    bnb[0].balances[1]? console.log('Printing BUSD balance') : console.log('No BUSD Balance')                                                                             
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
            console.log("toRune is true")
            console.log(RUNE)
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
                await sendSwap(combowallet, swapParams, thorchainAmm, thor[0].address)
                } catch (e) {
                    console.error(e)
                    }
        break

        case false:
            console.log("toRune is false")
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
            await sendSwap(combowallet, busdswapParams, thorchainAmm, bnb[0].address)
        break;
                }
    }




const sendSwap = async( wallet: Wallet, params: EstimateSwapParams, amm: ThorchainAMM, address: string ) => {

    try{
        const estimate = await amm.estimateSwap(params)
        console.log("inside swap")
        print(estimate, params.input)
        if(estimate.canSwap){
        const transaction = await amm.doSwap(wallet, params, address)
        console.log(transaction)
        const jsonstring = JSON.stringify(transaction, null, 2)
        console.log(jsonstring)
        await fs.writeFileSync('./executedtrades.json', jsonstring, {flag:'a'})
        // console.log(`Tx hash: ${transaction.hash},\n Tx url: ${transaction.url}\n WaitTime: ${transaction.waitTimeSeconds}`)
        }                                                                                                                                                     
        // console.log(transaction)
    } catch(err){
        console.log(err)
        }
    }


    const getbtcPool = async() => {

    try {
            const baseUrl = MIDGARD_API_9R_URL
            const apiconfig = new Configuration({ basePath: baseUrl })
            const midgardApi = new MidgardApi(apiconfig)
            //console.log(midgardApi)
            const data = await midgardApi.getPool('BTC.BTC')
            
            const assetDepth:any = data.data.assetDepth
            const runeDepth:any = data.data.runeDepth
            console.log(data.data)
            console.log('Asset Depth: ' + assetDepth)
            console.log('Rune Depth: ' + runeDepth)
            console.log(runeDepth/assetDepth)
            console.log('RUNE/BTC: ' + assetDepth/runeDepth)
            //console.log(calcSwapSlip(36000, assetDepth, runeDepth, false)*100)

        //const stats = await midgardApi.getStats('BTC.BTC')
            //console.log(stats.data)
            //console.log(stats.data.assetDepth)
            //console.log(stats.data.runeDepth)
          //const resp = await  axios.get(btcpoolUrl)
          //console.log(resp.data.length)
          //const btcPool = resp.data
          //for(i = 0;  i < pools.length; i++){
          //console.log(btcPool.asset)
          //console.log(btcPool.assetPrice)

          //}

      } catch (err) {
          console.log(err);
      }

  }


const  getInboundAddress = async() => {
    try {
        const resp = await  axios.get(theUrl)
        console.log(resp.data);

    } catch (err) {
        console.log(err);
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

async function main(){
    if( ! fs.existsSync(keystorelocation)){                                                                                                                                                                                                                   genKeystore()
    }
    const keystore1 = JSON.parse(fs.readFileSync(keystorelocation, 'utf8'))
    let phrase = await decryptFromKeystore(keystore1, keypasswd) 
    const combowallet= new Wallet(Network.Mainnet, phrase)
    const midgard = new Midgard(Network.Mainnet) //defaults to mainnet
    const thorchainAmm = new ThorchainAMM(midgard)
    await run(combowallet, thorchainAmm)

  }




main()
    .then(() => process.exit(0))
    .catch((err) => console.error(err))
