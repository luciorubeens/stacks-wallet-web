import { atom } from 'jotai';
import BN from 'bn.js';

import {
  deserializeTransaction,
  createStacksPrivateKey,
  TransactionSigner,
} from '@stacks/transactions';
import { currentAccountPrivateKeyState } from '@store/accounts';
import { apiClientState } from '@store/common/api-clients';
import { feeState } from '@store/transactions/fees';

export const rawTxIdState = atom<string | null>(null);

const rawTxCache = new Map();

const rawTxState = atom<string>(get => {
  const txId = get(rawTxIdState);
  if (!txId) return;
  const match = rawTxCache.get(txId);
  // no need to fetch again
  if (match) return match;
  const { transactionsApi } = get(apiClientState);
  return transactionsApi.getRawTransactionById({ txId }).then(result => {
    const rawTx = result.raw_tx;
    rawTxCache.set(txId, rawTx);
    return rawTx;
  });
});

export const rawTxByteLengthState = atom(get => {
  const transaction = get(rawDeserializedTxState);
  return transaction?.serialize().byteLength || 0;
});

export const rawDeserializedTxState = atom(get => {
  const rawTx = get(rawTxState);
  if (!rawTx) return;
  return deserializeTransaction(rawTx);
});

export const rawSignedTxState = atom(get => {
  const transaction = get(rawDeserializedTxState);
  const privateKey = get(currentAccountPrivateKeyState);
  if (!transaction || !privateKey) return;
  const fee = get(feeState);
  if (fee) {
    transaction.setFee(new BN(fee));
  }
  const signer = new TransactionSigner(transaction);
  signer.signOrigin(createStacksPrivateKey(privateKey));
  return transaction;
});
