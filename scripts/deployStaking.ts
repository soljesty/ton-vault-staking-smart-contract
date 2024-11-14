import { Address, toNano } from '@ton/core';
import { Staking } from '../wrappers/Staking';
import { compile, NetworkProvider } from '@ton/blueprint';

export async function run(provider: NetworkProvider) {
    const staking = provider.open(Staking.createFromConfig({
        stakingLockTimer: 1,
        stakingAdminAddress: provider.sender().address!,
        sigPk:BigInt(3210787916289541836061277516625504098268092526885732694079923562244733057183),
    }, await compile('Staking')));

    await staking.sendDeploy(provider.sender(), toNano('0.01'));

    await provider.waitForDeploy(staking.address);

    console.log('Staking contract deploye successed!');
}
