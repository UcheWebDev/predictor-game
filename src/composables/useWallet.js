import { ref } from 'vue';
import { providers } from 'near-api-js';
// import { distinctUntilChanged, map } from 'rxjs';
import '@near-wallet-selector/modal-ui/styles.css';
import { setupModal } from '@near-wallet-selector/modal-ui';
import { setupWalletSelector } from '@near-wallet-selector/core';
import { setupHereWallet } from '@near-wallet-selector/here-wallet';
import { setupMyNearWallet } from '@near-wallet-selector/my-near-wallet';

const THIRTY_TGAS = '30000000000000';
const NO_DEPOSIT = '0';

export function useWallet({ networkId = 'testnet', createAccessKeyFor = undefined }) {
    const accountId = ref('');
    const isSignedIn = ref(false);
    const selector = ref(null);

    const startUp = async () => {
        selector.value = await setupWalletSelector({
            network: networkId,
            modules: [setupMyNearWallet(), setupHereWallet()],
        });

        const walletSelector = selector.value;
        isSignedIn.value = walletSelector.isSignedIn();
        accountId.value = isSignedIn.value ? walletSelector.store.getState().accounts[0].accountId : '';

        // walletSelector.store.observable
        //     .pipe(
        //         map(state => state.accounts),
        //         distinctUntilChanged()
        //     )
        //     .subscribe(accounts => {
        //         const signedAccount = accounts.find(account => account.active)?.accountId;
        //         accountChangeHook(signedAccount);
        //     });

        return accountId.value;
    };

    const signIn = async () => {
        const modal = setupModal(await selector.value, { contractId: createAccessKeyFor });
        modal.show();
    };

    const signOut = async () => {
        const selectedWallet = await (await selector.value).wallet();
        await selectedWallet.signOut();
        isSignedIn.value = false
        // localStorage.removeItem("groupName");
    };

    const viewMethod = async ({ contractId, method, args = {} }) => {
        const url = `https://rpc.${networkId}.near.org`;
        const provider = new providers.JsonRpcProvider({ url });

        const res = await provider.query({
            request_type: 'call_function',
            account_id: contractId,
            method_name: method,
            args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
            finality: 'optimistic',
        });

        return JSON.parse(Buffer.from(res.result).toString());
    };

    const callMethod = async ({ contractId, method, args = {}, gas = THIRTY_TGAS, deposit = NO_DEPOSIT }) => {
        const selectedWallet = await (await selector.value).wallet();
        const outcome = await selectedWallet.signAndSendTransaction({
            receiverId: contractId,
            actions: [
                {
                    type: 'FunctionCall',
                    params: {
                        methodName: method,
                        args,
                        gas,
                        deposit,
                    },
                },
            ],
        });

        return providers.getTransactionLastResult(outcome);
    };

    const getTransactionResult = async (txhash) => {
        const walletSelector = selector.value;
        const { network } = walletSelector.options;
        const provider = new providers.JsonRpcProvider({ url: network.nodeUrl });

        const transaction = await provider.txStatus(txhash, 'unnused');
        return providers.getTransactionLastResult(transaction);
    };

    return {
        accountId,
        isSignedIn,
        startUp,
        signIn,
        signOut,
        viewMethod,
        callMethod,
        getTransactionResult,
    };
}
