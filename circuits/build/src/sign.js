import Client from 'mina-signer';
import { CircuitString, Signature, PublicKey, Encoding, Field } from 'o1js';
const client = new Client({ network: 'testnet' });
const privateKey = 'EKEiMUmYfFG4ohsQxQDVzq2oGEuEbjK6XgETrkN4hbF932X1q1zm';
const publicKey = 'B62qkN4f1prDvFexmhGHNsNz1db84XCA6vkgtJpcAaqFJk2M1runpLd';
function signString(jsonData) {
    let strData = JSON.stringify(jsonData);
    let data = 'a';
    let fields = Encoding.stringToFields(data).map(BigInt);
    let client = new Client({ network: 'mainnet' });
    let signed = client.signFields(fields, privateKey);
    // verify with mina-signer
    let fieldsSnarky = fields.map(Field);
    let signature = Signature.fromBase58(signed.signature);
    // Provable.assertEqual(Signature, signature, signatureSnarky);
    let ress = signature.verify(PublicKey.fromBase58(publicKey), fieldsSnarky);
    console.log('aaa', ress);
}
let json = {
    age: 5,
};
signString(json);
// https://discord.com/channels/484437221055922177/1161103584428032080/1161103584428032080
//# sourceMappingURL=sign.js.map