
import { useSecurePeopleTags } from './useSecurePeopleTags';

// Backward compatibility wrapper - delegates to the secure version
export const usePeopleTags = () => {
  return useSecurePeopleTags();
};
