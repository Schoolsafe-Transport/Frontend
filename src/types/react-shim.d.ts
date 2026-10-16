/* eslint-disable @typescript-eslint/no-explicit-any */
// React and JSX ambient types for development

declare module 'react' {
  export type ReactNode = any;
  export type FC<P = Record<string, any>> = (props: P) => any;
  export type ReactElement = any;
  export function createElement(...args: any[]): any;
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useContext<T>(context: any): T;
  export function createContext<T>(defaultValue: T): any;
  export function useRef<T = any>(initialValue?: T | null): { current: T };
  export const StrictMode: any;
  export interface FormEvent<T = any> {
    preventDefault(): void;
    stopPropagation(): void;
    target: T;
  }
  export interface ChangeEvent<T = any> {
    target: T;
  }

  export namespace React {
    export type ReactNode = any;
    export type FC<P = Record<string, any>> = (props: P) => any;
    export type ReactElement = any;
    export interface FormEvent<T = any> {
      preventDefault(): void;
      stopPropagation(): void;
      target: T;
    }
    export interface ChangeEvent<T = any> {
      target: T;
    }
  }

  const React: {
    createElement: typeof createElement;
    useState: typeof useState;
    useEffect: typeof useEffect;
    useContext: typeof useContext;
    createContext: typeof createContext;
    useRef: typeof useRef;
    StrictMode: typeof StrictMode;
  };
  export default React;
}

declare module 'react-dom/client' {
  export function createRoot(container: any): {
    render(element: any): void;
  };
  const ReactDOM: {
    createRoot: typeof createRoot;
  };
  export default ReactDOM;
}

declare global {
  namespace JSX {
    interface Element extends any {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
}
