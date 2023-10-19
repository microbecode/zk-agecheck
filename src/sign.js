import Client from 'mina-signer';
import { CircuitString } from 'o1js';
const client = new Client({ network: 'testnet' });
const privateKey = 'EKFAeEdgVzB6RTLmNY11wFRz4LBJyDxF3wQG8gP1oh9pRXKDNEZs';

function signString(jsonData) {
  let strData = JSON.stringify(jsonData);
  // Wrapped BigInt() around since it was giving TypeError: Cannot mix BigInt and other types, use explicit conversions
  const fieldStr = BigInt(CircuitString.fromString(strData).hash());
  const signature = client.signFields([fieldStr], privateKey);
  console.log(signature);
}

let json = {
  age: 5,
};

signString(json);
// https://discord.com/channels/484437221055922177/1161103584428032080/1161103584428032080
