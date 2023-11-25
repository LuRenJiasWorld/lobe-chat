import { PersistOptions, devtools, persist } from 'zustand/middleware';
import { shallow } from 'zustand/shallow';
import { createWithEqualityFn } from 'zustand/traditional';
import { StateCreator } from 'zustand/vanilla';

import { isDev } from '@/utils/env';

import { createHyperStorage } from '../middleware/createHyperStorage';
import { SessionStoreState, initialState } from './initialState';
import { AgentAction, createAgentSlice } from './slices/agent/action';
import { SessionAction, createSessionSlice } from './slices/session/action';

//  ===============  聚合 createStoreFn ============ //

export type SessionStore = SessionAction & AgentAction & SessionStoreState;
const createStore: StateCreator<SessionStore, [['zustand/devtools', never]]> = (...parameters) => ({
  ...initialState,
  ...createAgentSlice(...parameters),
  ...createSessionSlice(...parameters),
});

//  ===============  persist 本地缓存中间件配置 ============ //

const LOBE_CHAT = 'LobeChat_Session';

const persistOptions: PersistOptions<SessionStore> = {
  name: LOBE_CHAT,

  // 手动控制 Hydration ，避免 ssr 报错
  skipHydration: true,

  storage: createHyperStorage({
    url: {
      mode: 'hash',
      selectors: [
        // map state key to storage key
        { activeId: 'session' },
        { activeTopicId: 'topic' },
      ],
    },
  }),
  version: 0,
};

//  ===============  实装 useStore ============ //

export const useSessionStore = createWithEqualityFn<SessionStore>()(
  persist(
    devtools(createStore, {
      name: LOBE_CHAT + (isDev ? '_DEV' : ''),
    }),
    persistOptions,
  ),
  shallow,
);
