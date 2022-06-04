import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react";

declare global {
  interface WindowEventMap {
    "local-storage": CustomEvent;
  }
}

// Create a setter type that works like "useState"
type SetValue<T> = Dispatch<SetStateAction<T>>;

// A wrapper for "JSON.parse()"" to support "undefined" value
const parseJSON = <T>(value: string | null): T | undefined => {
  try {
    return value === "undefined" ? undefined : JSON.parse(value ?? "");
  } catch {
    // console.log('parsing error on', { value });
    return undefined;
  }
};

/**
 * A custom hook that uses localStorage to store and retrieve values.
 *
 * @param {string} key The key to use for the localStorage
 * @param {any} initialValue The initial value to use if the key is not found in localStorage
 *
 * @returns A tuple of the value and a setter function
 */
const useLocalStorage = <T>(key: string, initialValue: T): [T, SetValue<T>] => {
  // Get the item from localStorage
  const readValue = useCallback((): T => {
    // Prevent build error "window is undefined" but keep keep working
    if (typeof window === "undefined") {
      return initialValue;
    }

    // Get the value from localStorage or return the initialValue with a warning if not found
    try {
      const item = window.localStorage.getItem(key);
      return item ? (parseJSON(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that will store the new value in localStorage.
  const setValue: SetValue<T> = useCallback(
    (value) => {
      // Prevent build error "window is undefined" but keeps working
      if (typeof window == "undefined") {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`
        );
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const newValue = value instanceof Function ? value(storedValue) : value;

        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(newValue));

        // Save state
        setStoredValue(newValue);

        // Dispatch a custom event so every useLocalStorage hook are notified
        window.dispatchEvent(new Event("local-storage"));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue]
  );

  // Set the value to the initial value the first time useLocalStorage is called
  useEffect(() => {
    setStoredValue(readValue());
  }, []);

  return [storedValue, setValue];
};

export { useLocalStorage };
