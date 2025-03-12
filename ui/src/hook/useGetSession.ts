import { create } from 'zustand';
import { TokenResponseCamelCase } from '@/api/auth.ts';

interface SessionState {
  tokens: TokenResponseCamelCase | null;
  updateTokens: (tokens: TokenResponseCamelCase | null) => void;
}

const useSessionTokens = create<SessionState>((set) => ({
  tokens: JSON.parse(localStorage.getItem('sessionTokens')) || null,
  updateTokens: (newTokens) => {
    if (newTokens) {
      localStorage.setItem('sessionTokens', JSON.stringify(newTokens));
      set({ tokens: newTokens });
    } else {
      localStorage.removeItem('sessionTokens');
      set({ tokens: null });
    }
  },
}));

export default useSessionTokens;
