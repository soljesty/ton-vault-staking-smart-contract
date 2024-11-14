import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, fromNano, Slice, TupleItem, toNano } from '@ton/core';

export type StakingConfig = {
    stakingLockTimer: number;
    stakingAdminAddress: Address;
    sigPk: bigint;
};

export const Opcodes = {
    staking: 0x9b18ba90, withdraw: 0xcb03bfaf, admin_recycle: 0x72e90687,
};

export function stakingConfigToCell(config: StakingConfig): Cell {
    return beginCell().storeUint(config.stakingLockTimer, 32).storeDict(null).storeRef(beginCell().storeAddress(config.stakingAdminAddress).endCell()).endCell();
}

export class Staking implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) { }

    static createFromAddress(address: Address) {
        return new Staking(address);
    }

    static createFromConfig(config: StakingConfig, code: Cell, workchain = 0) {
        const data = stakingConfigToCell(config);
        const init = { code, data };
        return new Staking(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getContractBalance(provider: ContractProvider) {
        const result = await provider.get('get_contract_balance', []);
        return result.stack.readNumber();
    }


    async getAddressState(provider: ContractProvider, address: Address) {
        const result = await provider.get('get_adress_state', [
            { type: 'slice', cell: beginCell().storeAddress(address).endCell() },
        ]);
        const tuple = result.stack.readTuple();
        console.log(tuple);
        // tuple.pop()
        // let res = [];
        // const temp = tuple.pop();
        // if (temp.type == 'int') {
        //     res.push(fromNano(temp.value));
        // }
        return tuple;
    }


    async sendStaking(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;

        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.staking, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .endCell(),
        });
    }

    async sendWithdraw(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
            slashed: number;
            sig_data: Buffer;
            sig_data_bit_length : number;
            signature: Buffer;
            signature_bit_length : number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.withdraw, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeUint(opts.slashed,4)
                .storeUint(opts.sig_data_bit_length,32)
                .storeUint(opts.signature_bit_length,32)
                .storeRef(beginCell().storeBuffer(opts.sig_data, opts.sig_data.length).endCell())
                .storeRef(beginCell().storeBuffer(opts.signature, opts.signature.length).endCell())
                .endCell(),
        });
    }

    async sendAdminRecycle(
        provider: ContractProvider,
        via: Sender,
        opts: {
            value: bigint;
            queryID?: number;
            recycle_amount: number;
        },
    ) {
        await provider.internal(via, {
            value: opts.value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Opcodes.admin_recycle, 32)
                .storeUint(opts.queryID ?? 0, 64)
                .storeCoins(opts.recycle_amount)
                .endCell(),
        });
    }

    async getStakingInfo(provider: ContractProvider) {
        const result = await provider.get('get_staking_info', []);
        const tuple = result.stack.readTuple();
        console.log(tuple);
        return tuple;
    }


    async getSingValid(provider: ContractProvider, sign_data: Cell, signature: Cell, public_key: bigint) {
        const call = await provider.get('get_sign_valid', [
            { type: 'slice', cell: sign_data },
            { type: 'slice', cell: signature },
            { type: 'int', value: public_key },
        ]);
        const tuple = call.stack.readTuple();
        console.log(tuple);
        return tuple;
    }

    async getUploadData(provider: ContractProvider, data: Cell) {
        const call = await provider.get('get_upload_data', [
            { type: 'slice', cell: data },
        ]);
        const tuple = call.stack.readTuple();
        console.log(tuple);
        return tuple;
    }

}
