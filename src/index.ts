import _ from 'lodash'
import axios from 'axios'
import chalk from 'chalk'
import * as dotenv from 'dotenv'
import { baseAmount, AssetBTC, AssetBNB, AssetETH, AssetRuneNative, assetAmount, formatAssetAmountCurrency, assetFromString, baseToAsset,assetToBase, Asset } from '@xchainjs/xchain-util'
import { Network } from '@xchainjs/xchain-client'
import { Wallet, ThorchainCache, LiquidityPoolCache, doSwap, CryptoAmount, EstimateSwapParams, Midgard, SwapEstimate, ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { generatePhrase, validatePhrase, encryptToKeyStore, decryptFromKeystore } from '@xchainjs/xchain-crypto'
import fs from 'fs'
import BigNumber from 'bignumber.js'
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

    dotenv.config()
    const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
    //console.log('privatekey: ' + PRIVATE_KEY)
    //const keystore1 = JSON.parse(fs.readFileSync(keystorelocation, 'utf8'))
    //let phrase = await decryptFromKeystore(keystore1, keypasswd) 
    let phrase = PRIVATE_KEY
    const midgard = new Midgard(Network.Mainnet) //defaults to mainnet
    const cache = new ThorchainCache(midgard)
    const thorchainAmm = new ThorchainAMM(cache)
    const combowallet= new Wallet(phrase, cache)
    await run(combowallet, thorchainAmm)

  }




main()
    .then(() => process.exit(0))
    .catch((err) => console.error(err))
