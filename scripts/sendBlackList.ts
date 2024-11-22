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

    const address_str = await ui.input('Input Black Address');



    await staking.sendBlackList(provider.sender(), {
        value: toNano(0.038),
        queryID: 0,
        blackAddress:Address.parse(address_str)

    });
    
    ui.write('Send black address successfully!');

}