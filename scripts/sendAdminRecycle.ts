import { Address, toNano } from '@ton/core';
import { Staking } from '../wrappers/Staking';
import { NetworkProvider, sleep } from '@ton/blueprint';
import { keyPairFromSeed, keyPairFromSecretKey, sign, signVerify, KeyPair, getSecureRandomBytes } from '@ton/crypto';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Staking contract address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const staking = provider.open(Staking.createFromAddress(address));

    const staking_amount = await ui.input('Input staking amount');



    await staking.sendAdminRecycle(provider.sender(), {
        value: toNano(0.038),
        queryID: 0,
        recycle_amount:Number(staking_amount)

    });
    
    ui.write('Send stake successfully!');

}