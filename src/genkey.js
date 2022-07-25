var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import fs from 'fs';
import { generatePhrase, validatePhrase, encryptToKeyStore } from '@xchainjs/xchain-crypto';
const keystorelocation = './keystore.json';
const keypasswd = '1234';
// Generate Keystore and save it to a keystore file
const genKeystore = () => __awaiter(void 0, void 0, void 0, function* () {
    if (!fs.existsSync(keystorelocation)) {
        const phrase = generatePhrase();
        console.log(`phrase: ${phrase}`);
        const isCorrect = validatePhrase(phrase); //validate phrase if needed returns Boolean
        console.log(`Phrase valid?: ${isCorrect}`);
        const keystore = yield encryptToKeyStore(phrase, keypasswd);
        fs.writeFileSync(`./keystore.json`, JSON.stringify(keystore, null, 4), 'utf8');
    }
    else {
        console.log("Keystore Already Exists, Will Not Create New");
    }
});
export { genKeystore, keystorelocation, keypasswd };
