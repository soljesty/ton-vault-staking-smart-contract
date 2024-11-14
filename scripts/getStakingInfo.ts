import { Address, Sender, toNano, TupleReader } from '@ton/core';
import { Staking } from '../wrappers/Staking';
import { NetworkProvider, sleep } from '@ton/blueprint';

export async function run(provider: NetworkProvider, args: string[]) {
    const ui = provider.ui();

    const address = Address.parse(args.length > 0 ? args[0] : await ui.input('Staking contract address'));

    if (!(await provider.isContractDeployed(address))) {
        ui.write(`Error: Contract at address ${address} is not deployed!`);
        return;
    }

    const staking = provider.open(Staking.createFromAddress(address));

    // const query_address = Address.parse(args.length > 0 ? args[0] : await ui.input('Query address'));
    const sender : Sender = provider.sender();
    await staking.getStakingInfo();
}