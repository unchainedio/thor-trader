import fs from 'fs'
import { generatePhrase, validatePhrase, encryptToKeyStore, decryptFromKeystore } from '@xchainjs/xchain-crypto'

const keystorelocation = './keystore.json'
const keypasswd = '1234'
// Generate Keystore and save it to a keystore file
const  genKeystore = async () => {
     if( ! fs.existsSync(keystorelocation)){
        const phrase = generatePhrase()
        console.log(`phrase: ${phrase}`)
        const isCorrect = validatePhrase(phrase) //validate phrase if needed returns Boolean
        console.log(`Phrase valid?: ${isCorrect}`)
        const keystore = await encryptToKeyStore(phrase, keypasswd)
        fs.writeFileSync(`./keystore.json`, JSON.stringify(keystore, null, 4), 'utf8')
        } else{
        console.log("Keystore Already Exists, Will Not Create New")
        }
}

export {
    genKeystore,
    keystorelocation,
    keypasswd
}

