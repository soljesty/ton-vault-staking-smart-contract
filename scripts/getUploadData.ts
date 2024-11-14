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


    const buffer = Buffer.from('636861696e746f6f6c323032342140230000000000000000000000000000000007193dd6e064eff05976b0f793eab3e16b32e3823081a4d94f84997ff6e2b89f', 'hex')
    const keypair: KeyPair = keyPairFromSecretKey(buffer);

    const data = Buffer.from('user_id:202512421111,slashed:0')
    const singature = sign(data, keypair.secretKey);

    const pk = '0x' + keypair.publicKey.toString('hex');
    const pk_int = Number(pk)

    console.log(data.toString('hex'))
    console.log(singature.toString('hex'))

    let result = await staking.getUploadData(
        beginCell().storeUint(data.length,32).storeUint(singature.length,32).storeRef(beginCell().storeBuffer(data, data.length).endCell()).storeRef(beginCell().storeBuffer(singature, singature.length).endCell()).endCell(),
    );
    ui.write('Sign valid result : ' + result)

    // ui.clearActionPrompt();
}