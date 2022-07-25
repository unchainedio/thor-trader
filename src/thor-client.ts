import * as fs from 'fs'
import { generatePhrase, validatePhrase, encryptToKeyStore, decryptFromKeystore } from "@xchainjs/xchain-crypto"
import { Network } from "@xchainjs/xchain-client"
import { Client, getChainIds, getDefaultClientUrl} from '@xchainjs/xchain-thorchain'
import { assetToBase, baseToAsset, assetAmount } from "@xchainjs/xchain-util"
import 'dotenv/config' // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import {genKeystore, keystorelocation, keypasswd} from './genkey.js'




const thorWallet  = async () => {
    const keystore1 = JSON.parse(fs.readFileSync(keystorelocation, 'utf8'))
    const chainIds = await getChainIds(getDefaultClientUrl())
    let phrase = await decryptFromKeystore(keystore1, keypasswd)
   // console.log(Network)
     const thorClient = new Client({network: Network.Mainnet, phrase: phrase, chainIds})
//  const thorClient = new Client({network: Network.Mainnet, phrase: phrase, chainIds})
   console.log(thorClient)
    let address = thorClient.getAddress()
    console.log(`Address: ${address}`)
    try {
        const balance = await thorClient.getBalance(address)
       console.log(balance)
        let assetAmount = (baseToAsset(balance[0].amount)).amount()
        console.log(`Address ${address} With balance: ${assetAmount}`)
    } catch (error) {
       console.log(`Caught ${error}`)
    }
}

export {
  thorWallet

}

//thorWallet()
// Create new instance of the client and query chain for balances.

