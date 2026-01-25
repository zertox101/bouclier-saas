'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isClient, setIsClient] = useState(false);

    // Check if we're on the client
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Initialize from localStorage on mount
    useEffect(() => {
        if (!isClient) return;

        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.error(`Error loading localStorage key "${key}":`, error);
        }
    }, [key, isClient]);

    // Return a wrapped version of useState's setter function that persists to localStorage
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;

            // Save state
            setStoredValue(valueToStore);

            // Save to local storage
            if (isClient) {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    };

    return [storedValue, setValue] as const;
}
