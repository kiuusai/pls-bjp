import mempoolJs from '@mempool/mempool.js';
import type { MempoolConfig } from '@mempool/mempool.js/lib/interfaces';
import type { AddressTxsUtxo } from '@mempool/mempool.js/lib/interfaces/bitcoin/addresses';

export type UTXO = AddressTxsUtxo;

// const MEMPOOL_API_URL = getMempoolAPIUrl();

type Network = {
	isLiquid: boolean;
	isTestnet: boolean;
	custom?: MempoolConfig;
};

export function createMempoolApi(network: Network) {
	function createMempoolConfig(network: Network): MempoolConfig {
		if (network.custom) return network.custom;

		const protocol = 'https';

		if (network.isLiquid) {
			const hostname = 'liquid.network'

			if (network.isTestnet) {
				return {
					protocol,
					hostname,
					network: 'liquidtestnet',
				};
			}

			return {
				protocol,
				hostname,
				network: 'liquid',
			};
		}

		const hostname = 'mempool.space';

		if (network.isTestnet) {
			return {
				protocol,
				hostname,
				network: 'testnet'
			}
		}

		return {
			protocol,
			hostname,
			network: 'mainnet',
		}
	}

	const mempool = mempoolJs(createMempoolConfig(network));

	const api = network.isLiquid ? mempool.liquid : mempool.bitcoin;

	return {
		async getTransactionHexFromId(txid: string) {
			return await api.transactions.getTxHex({ txid });
		},

		async getAddressUtxos(address: string) {
			return await api.addresses.getAddressTxsUtxo({ address });
		},

		async getAddressUnconfirmedTxs(address: string) {
			return await api.addresses.getAddressTxsMempool({ address });
		},
		async publishTransaction(txhex: string) {
			return await api.transactions.postTx({ txhex });
		}
	};
}
