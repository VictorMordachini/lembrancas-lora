
import { useSecureMemories } from './useSecureMemories';

// Backward compatibility wrapper - delegates to the secure version
export const useMemories = () => {
  return useSecureMemories(false); // Only user's own memories
};
