import { Blockchain, SandboxContract, TreasuryContract } from '@ton/sandbox';
import { Cell, toNano } from '@ton/core';
import { Staking } from '../wrappers/Staking';
import '@ton/test-utils';
import { compile } from '@ton/blueprint';

describe('Staking', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Staking');
    });

    let blockchain: Blockchain;
    let deployer: SandboxContract<TreasuryContract>;
    let staking: SandboxContract<Staking>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        staking = blockchain.openContract(Staking.createFromConfig({}, code));

        deployer = await blockchain.treasury('deployer');

        const deployResult = await staking.sendDeploy(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: staking.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and staking are ready to use
    });
});
