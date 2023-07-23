import { useState, useEffect } from "react"

type UseLocalStorageReturn<T> = [state: T, setState: React.Dispatch<React.SetStateAction<T>>]

const useLocalStorage = <T,>(value: React.SetStateAction<T>, key: string): UseLocalStorageReturn<T> => {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== "undefined") {
      const store = window.localStorage.getItem(key);

      if (store) {
        return JSON.parse(store);
      } else {
        return value;
      }
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(state));
    }
  }, [state]);

  return [state, setState];
}

export default useLocalStorage;