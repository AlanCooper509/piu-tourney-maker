import { createContext } from "react";

/** The current stream CSS, so outlined text re-reads its outline whenever it changes. */
export const StreamCssContext = createContext<string | null>(null);
