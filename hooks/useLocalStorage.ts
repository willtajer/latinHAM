// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react'

/**
 * Custom hook to manage state synchronized with localStorage.
 * @param key - The key in localStorage to store the value.
 * @param initialValue - The initial value to use if none is found in localStorage.
 * @returns An array containing the stored value and a setter function.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Initialize state with value from localStorage or the initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue; // Return initialValue during server-side rendering
    }
    try {
      // Retrieve the item from localStorage by key
      const item = window.localStorage.getItem(key);
      // Parse the JSON string or return the initial value if not found
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue; // Return initialValue if parsing fails
    }
  });

  // Update localStorage whenever the key or storedValue changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Convert the stored value to a JSON string and save it to localStorage
        window.localStorage.setItem(key, JSON.stringify(storedValue));
      } catch (error) {
        console.log(error); // Log any errors that occur during saving
      }
    }
  }, [key, storedValue]);

  /**
   * Sets the value both in state and in localStorage.
   * @param value - The new value to store.
   */
  const setValue = (value: T) => {
    try {
      // If value is a function, execute it with the current storedValue
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Update the state with the new value
      setStoredValue(valueToStore);
      // Also update the value in localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error); // Log any errors that occur during setting the value
    }
  };

  // Return the stored value and the setter function
  return [storedValue, setValue];
}
