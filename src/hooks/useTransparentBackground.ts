import { useEffect } from "react";

/**
 * Forces the page (and root html element) to render with a truly
 * transparent background for the lifetime of the component, restoring the
 * previous values on unmount. Used by OBS Browser-Source pages so they
 * composite cleanly over a scene instead of showing a solid fill.
 *
 * Setting body's background alone isn't enough here: this app forces dark
 * mode (see main.tsx), and next-themes sets `color-scheme: dark` on
 * <html>. Per the CSS spec, when the root element has no opaque background
 * and its color-scheme includes "dark", the browser paints the canvas
 * black by default instead of leaving it transparent — that's a fallback
 * for normal opaque browser windows, but it also kicks in inside OBS's
 * Browser Source, which otherwise supports real alpha transparency. So on
 * top of a transparent body, this also overrides color-scheme to "normal"
 * while mounted, which stops that black fallback from applying.
 */
export function useTransparentBackground() {
  useEffect(() => {
    const prevBodyBg = document.body.style.background;
    const prevHtmlBg = document.documentElement.style.background;
    const prevColorScheme = document.documentElement.style.colorScheme;

    document.body.style.background = "transparent";
    document.documentElement.style.background = "transparent";
    document.documentElement.style.colorScheme = "normal";

    return () => {
      document.body.style.background = prevBodyBg;
      document.documentElement.style.background = prevHtmlBg;
      document.documentElement.style.colorScheme = prevColorScheme;
    };
  }, []);
}
