import { Sdk } from '@unique-nft/sdk';
import { PolkadotProvider } from '@unique-nft/accounts/polkadot';

const baseUrl = 'https://rest.quartz.uniquenetwork.dev/v1';
// const baseUrl = 'https://rest.opal.uniquenetwork.dev/v1';

async function setStake(client, address, amountInit) {
    const { decimals } = await client.common.chainProperties();
    const arr = amountInit.toString().split('.');
    let amount = arr[0] !== '0' ? arr[0] : '';
    if (arr[1]) {
        amount += arr[1] + Array(decimals - arr[1].length).fill('0').join('');
    } else {
        amount += Array(decimals).fill('0').join('');
    }

    return client.extrinsics.submitWaitResult({
        address: address,
        section: 'appPromotion',
        method: 'stake',
        args: [amount],
    });
}

async function getBalanceAndStake(amount) {
    const provider = new PolkadotProvider();
    await provider.init();
    const list = await provider.getAccounts();
    const signer = list[3];

    // create client
    const options = {
        baseUrl: baseUrl,
        signer,
    };
    const client = new Sdk(options);

    // весь застейченный баланс отображается в lockedBalance
    let initBalanceResponse;
    try {
        initBalanceResponse = await client.balance.get({
            address: signer.instance.address,
        });
    } catch (e) {}

    // set stake
    let setStakeResult;

    try {
        setStakeResult = await setStake(client, signer.instance.address, amount);
    } catch (e) {}

    let totalStaked;
    try {
        totalStaked = await client.stateQuery.execute({
                endpoint: 'rpc',
                module: 'appPromotion',
                method: 'totalStaked',
            },
            {args: [{Substrate: signer.instance.address}]}
        );
    } catch (e) {}
    return {
        initBalanceResponse,
        setStakeResult,
        totalStaked
    }
};

window.setStake = setStake;
window.getBalanceAndStake = getBalanceAndStake;
