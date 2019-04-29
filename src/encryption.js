// code for encryption / decryption
// we will use the AES-256-CBC encryption algorithm, one of the most secure
// requires a 256-bit key (64 characters as hex)

const crypto = require('crypto');

// this method will generate a cryptographically secure psedorandom number
// will be used upon new User creation to set their key
function generateCryptoKey(){

    const buf = crypto.randomBytes(32); // 256 bits 
    const key = buf.toString('hex');

    return key;
}

// after generating a key, we cannot store it directly in the database
// because that will be easily found in a data breach
// so we will obscure the key in a way to store it in the mongo database
// and we will retrieve it by unsalting it with unobscureKey
// returns an array of integers, each integer being the new hex code per hexdecimal char in key
function obscureKey(key){

    let addFactor = 75; //arbitrary
    let obscuredArr = [];

    for (let i = 0; i < key.length; i++){
        const hexChar = key.charAt(i);
        const hexCode = hexChar.charCodeAt(0);

        const newCode = hexCode + (addFactor % 15);

        obscuredArr.push(newCode);

        addFactor += (212 * (addFactor / 2)) + Math.floor(addFactor*1.73); 
    }

    return obscuredArr;

}

function unobscureKey(obscuredArr){
    let addFactor = 75;
    let res = "";

    for (let i = 0; i < obscuredArr.length; i++){

        const hexCode = obscuredArr[i];
        const newCode = hexCode - (addFactor % 15);

        res += String.fromCharCode(newCode);

        addFactor += (212 * (addFactor / 2)) + Math.floor(addFactor*1.73);
    }

    return res;
}

function encryptText(key, text) {

    const cipher = crypto.createCipher("aes-256-cbc", key);

    let result = cipher.update(text, "utf8", "hex");
    result += cipher.final("hex");

    return result;
}

function decryptText(key, text) {

    const decipher = crypto.createDecipher("aes-256-cbc", key);

    let result = decipher.update(text, "hex");
    result += decipher.final();

    return result;
}

module.exports = {
    generateCryptoKey: generateCryptoKey,
    encryptText: encryptText,
    decryptText: decryptText,
    obscureKey: obscureKey,
    unobscureKey: unobscureKey
}