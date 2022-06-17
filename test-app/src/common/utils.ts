import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import {
  createApiKeyMiddleware,
  createFetchFn,
  StacksMainnet,
  StacksTestnet,
} from '@stacks/network';
import { RPCClient } from '@stacks/rpc-client';

dayjs.extend(relativeTime);

const apiMiddleware = createApiKeyMiddleware({ apiKey: process.env.X_API_KEY ?? '' });
export const fetchPrivate = createFetchFn(apiMiddleware);

const testnetUrl = 'https://stacks-node-api.testnet.stacks.co';
const localhostUrl = 'http://localhost:3999';

export const getRPCClient = () => {
  return new RPCClient(testnetUrl);
};

export const toRelativeTime = (ts: number): string => dayjs().to(ts);

export const stacksTestnetNetwork = new StacksTestnet({ url: testnetUrl });

// TODO: Remove? This does not seem to be in use?
export const stacksMainnetNetwork = new StacksMainnet({ fetchFn: fetchPrivate });

export const stacksLocalhostNetwork = new StacksTestnet({ url: localhostUrl });
