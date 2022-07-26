import axios from 'axios'
import { MidgardApi, Configuration, MIDGARD_API_TS_URL, MIDGARD_API_9R_URL, MIDGARD_API_TC_URL } from '@xchainjs/xchain-midgard'
import { AssetBTC, assetAmount, assetFromString, baseToAsset,assetToBase } from '@xchainjs/xchain-util'
import { Network } from '@xchainjs/xchain-client'
// import { CryptoAmount, EstimateSwapParams, Midgard, SwapEstimate, ThorchainAMM } from '@xchainjs/xchain-thorchain-amm'
import { generatePhrase, validatePhrase, encryptToKeyStore, decryptFromKeystore } from '@xchainjs/xchain-crypto'
import fs from 'fs'
import BigNumber from 'bignumber.js'
// import { thorWallet } from './thor-client.js'
// import { Client, getChainIds, getDefaultClientUrl} from '@xchainjs/xchain-thorchain'
import { Client } from '@xchainjs/xchain-ethereum'
import {genKeystore, keystorelocation, keypasswd} from './genkey.js'
import { Wallet } from './wallet.js'
// import { Wallet } from '@xchainjs/xchain-thorchain-amm'

const theUrl = 'https://midgard.thorchain.info/v2/thorchain/inbound_addresses'

const btcpoolUrl= 'https://midgard.thorchain.info/v2/pool/BTC.BTC'

async function main(){

    if( ! fs.existsSync(keystorelocation)){
        genKeystore()

        ethWallet()
    // const rune = thorWallet()
    // console.log(rune)

}
}


const newWallet  = async () => {
      const keystore1 = JSON.parse(fs.readFileSync(keystorelocation, 'utf8'))
      let phrase = await decryptFromKeystore(keystore1, keypasswd)
      const combowallet= new Wallet(Network.Mainnet, phrase)
      const balances = await combowallet.getAllBalances()
     console.log(balances)
      // let address = ethClient.getAddress()
     // console.log(`Address: ${address}`)
      // try {
      //     const balance = await ethClient.getBalance(address)                                                                                                                                                                                                 
      //    console.log(balance)                                                                                                    
      //     let assetAmount = (baseToAsset(balance[0].amount)).amount()                                                            
      //     console.log(`With balance: ${assetAmount}`)                                                                            
      //     console.log(`Address ${address} With balance: ${assetAmount}`)                                                         
      // } catch (error) {                                                                                                          
      //    console.log(`Caught ${error}`)                                                                                          
      // }                                                                                                                          
  }                          

const ethWallet  = async () => {
    const keystore1 = JSON.parse(fs.readFileSync(keystorelocation, 'utf8'))
    let phrase = await decryptFromKeystore(keystore1, keypasswd)
    const ethClient = new Client({network: Network.Mainnet, phrase: phrase})
//    console.log(ethClient)
    let address = ethClient.getAddress()
   console.log(`Address: ${address}`)
    try {
        const balance = await ethClient.getBalance(address)
       console.log(balance)
        let assetAmount = (baseToAsset(balance[0].amount)).amount()
        console.log(`With balance: ${assetAmount}`)
        console.log(`Address ${address} With balance: ${assetAmount}`)
    } catch (error) {
       console.log(`Caught ${error}`)
    }
}



// const thorWallet  = async () => {
//       const keystore1 = JSON.parse(fs.readFileSync(keystorelocation, 'utf8'))
//       const chainIds = await getChainIds(getDefaultClientUrl())
//       let phrase = await decryptFromKeystore(keystore1, keypasswd)
//      // console.log(Network)
//        const thorClient = new Client({network: Network.Mainnet, phrase: phrase, chainIds})
//   //  const thorClient = new Client({network: Network.Mainnet, phrase: phrase, chainIds})
//      console.log(thorClient)                                                                                                                                                                                                                                  
//       let address = thorClient.getAddress()
//       console.log(`Address: ${address}`)   
//       try {
//           const balance = await thorClient.getBalance(address)
//          console.log(balance)
//           let assetAmount = (baseToAsset(balance[0].amount)).amount()
//           console.log(`Address ${address} With balance: ${assetAmount}`)
//       } catch (error) {
//          console.log(`Caught ${error}`)
//       }
//   }    


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

// const expanded = {
//   input: input.formatedAssetString(),
//   totalFees: {
//     inboundFee: estimate.totalFees.inboundFee.formatedAssetString(),
//     swapFee: estimate.totalFees.swapFee.formatedAssetString(),
//     outboundFee: estimate.totalFees.outboundFee.formatedAssetString(),
//     affiliateFee: estimate.totalFees.affiliateFee.formatedAssetString(),
//   },
//   slipPercentage: estimate.slipPercentage.toFixed(),
//   netOutput: estimate.netOutput.formatedAssetString(),
//   waitTimeSeconds: estimate.waitTimeSeconds.toFixed(),
//   canSwap: estimate.canSwap,
//   errors: estimate.errors,
// }
// console.log(expanded)
// }

// const estSwap = async() => {

//    const BUSD = assetFromString('BNB.BUSD-BD1')
// if (!BUSD) throw Error('bad asset')


// try {
//   const midgard = new Midgard(Network.Mainnet) //defaults to mainnet
//   const thorchainAmm = new ThorchainAMM(midgard)
//   const swapParams = {
//     input: new CryptoAmount(assetToBase(assetAmount('1')), AssetBTC),
//     destinationAsset: BUSD,
//     // affiliateFeePercent: 0.003, //optional
//     slipLimit: new BigNumber('0.03'), //optional
//   }
//   const estimate = await thorchainAmm.estimateSwap(swapParams)
//   // print(estimate, swapParams.input)

//   // convert fees (by defualt returned in RUNE) to a different asset (BUSD)
//   const estimateInBusd = await thorchainAmm.getFeesIn(estimate.totalFees, BUSD)
//   estimate.totalFees = estimateInBusd
//   // print(estimate, swapParams.input)
// } catch (e) {
//   console.error(e)
// }
// }

newWallet()
// main()
ethWallet()
getbtcPool()
getInboundAddress()
