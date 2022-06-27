import { UseQueryOptions } from 'react-query';
import { MempoolTransaction } from '@stacks/stacks-blockchain-api-types';
import { AddressNonces } from '@stacks/blockchain-api-client/lib/generated';

import { useGetAccountNonces } from '@app/query/nonce/account-nonces.query';
import { useCurrentAccountFilteredMempoolTransactionsState } from '@app/query/mempool/mempool.hooks';
import { useCurrentAccountNonceState } from '@app/store/nonce/nonce.hooks';

const accountNoncesQueryOptions = {
  refetchOnMount: 'always',
  refetchOnReconnect: 'always',
  refetchOnWindowFocus: 'always',
};

function getNextNonce(accountNonces: AddressNonces, pendingTransactions: MempoolTransaction[]) {
  if (!accountNonces) return 0;

  const missingNonces = accountNonces.detected_missing_nonces;
  const possibleNextNonce = accountNonces.possible_next_nonce;

  const hasMissingNonce = missingNonces?.length > 0;
  const missingNonce = missingNonces?.sort()[0];

  const hasPendingTx = pendingTransactions?.length > 0;
  const latestPendingTx = pendingTransactions[0];
  const pendingTxNonce = latestPendingTx?.nonce;

  // We need to compare missing nonces with pending tx nonces
  // bc the api is often slow to update the missing nonces array
  if (hasMissingNonce && hasPendingTx) {
    const pendingNonces = pendingTransactions.map(tx => tx.nonce);
    const remainingMissingNonces = missingNonces.filter(nonce => !pendingNonces.includes(nonce));
    return remainingMissingNonces.length > 0
      ? Math.min(...remainingMissingNonces)
      : Math.max(pendingTxNonce + 1, possibleNextNonce);
  }

  // If there is a missing nonce (but no pending txs), just return the first missing nonce
  if (hasMissingNonce && !hasPendingTx) return missingNonce;

  // It is possible that the detected_missing_nonces array won't update fast
  // enough and we will continue here w/out knowing there is a missing nonce.
  // We could possibly do a check ourselves and throw a warning toast?

  if (hasPendingTx && pendingTxNonce === possibleNextNonce) return pendingTxNonce + 1;

  return possibleNextNonce;
}

export function useNextNonce() {
  const [currentAccountNonce, setCurrentAccountNonce] = useCurrentAccountNonceState();
  const pendingTransactions = useCurrentAccountFilteredMempoolTransactionsState();

  const queryOptions = {
    onSuccess: (data: AddressNonces) => {
      const nextNonce = data && getNextNonce(data, pendingTransactions);
      if (nextNonce) setCurrentAccountNonce(nextNonce);
    },
    ...accountNoncesQueryOptions,
  };
  useGetAccountNonces(queryOptions as UseQueryOptions);
  return currentAccountNonce || 0;
}
