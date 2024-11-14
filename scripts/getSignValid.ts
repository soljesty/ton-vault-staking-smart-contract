import { Address, beginCell, BitBuilder, BitReader, BitString, Builder, Cell, Slice, toNano, } from '@ton/core';
import { Staking } from '../wrappers/Staking';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { keyPairFromSeed, keyPairFromSecretKey, sign, signVerify, KeyPair, getSecureRandomBytes } from '@ton/crypto';
import { generateKeyPair } from 'crypto';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Staking contract address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const staking = provider.open(Staking.createFromAddress(address));
    const data = Buffer.from('7569643a3137323639303935333435333536382c733a30','hex')
    console.log('data length',data.length)
    // Buffer.from('uid:20555555555555,s:1')
    console.log('data hex:',data.toString('hex'))

    const buffer = Buffer.from('76d2585e8c5ffbd2dbd61cd51d6db339070e92d290a088e9605430a1cd475b6e', 'hex')
    // private key hex: 636861696e746f6f6c323032342140230000000000000000000000000000000007193dd6e064eff05976b0f793eab3e16b32e3823081a4d94f84997ff6e2b89f
    // public key hex: 07193dd6e064eff05976b0f793eab3e16b32e3823081a4d94f84997ff6e2b89f
    // private key hex: 636861696e746f6f6c323032342140230000000000000000000000000000000007193dd6e064eff05976b0f793eab3e16b32e3823081a4d94f84997ff6e2b89f
    // public key hex: 07193dd6e064eff05976b0f793eab3e16b32e3823081a4d94f84997ff6e2b89f

    const keypair: KeyPair = keyPairFromSeed(buffer);
    // keyPairFromSecretKey(buffer);
    console.log('private key hex:', keypair.secretKey.toString('hex'))
    console.log('public key hex:', keypair.publicKey.toString('hex'))
    // const keypair: KeyPair = keyPairFromSecretKey(buffer);
    // const keypair: KeyPair = keyPairFromSecretKey(buffer); // Creates keypair from secret key

    // Sign
    const signature = sign(data, keypair.secretKey); // Creates signature for arbitrary data (it is recommended to get hash from data first)
    console.log('signature:',signature.toString('hex'))

    // Check
    const valid: boolean = signVerify(data, signature, keypair.publicKey);
    console.log(valid)
    const pk = '0x'+keypair.publicKey.toString('hex');
    const pk_int = BigInt(pk)
    console.log('pk_int',pk_int)



    // let result = await staking.getSingValid(
    //     beginCell().storeBuffer(data, data.length).endCell(),
    //     beginCell().storeBuffer(signature, 64).endCell(),
    //     pk_int
    // );
    // ui.write('Sign valid result : ' + result)

    ui.clearActionPrompt();
}