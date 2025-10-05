import { useEffect, RefObject } from 'react';

/**
 * Custom hook to handle click outside behavior
 * @param ref - React ref to the element that should trigger close when clicked outside
 * @param handler - Function to call when clicking outside the element
 */
function useClickOutside(
  ref: RefObject<Element | null>,
  handler: () => void
) {
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        ref.current && 
        event.target instanceof Node && 
        !ref.current.contains(event.target)
      ) {
        handler();
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [ref, handler]);
}

export default useClickOutside;
