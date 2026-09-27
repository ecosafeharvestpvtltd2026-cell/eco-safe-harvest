import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

// Generated components expose stable `data-ocid` hooks; use them as the test id
// attribute so `getByTestId` reads the app's own contract rather than a class.
configure({ testIdAttribute: "data-ocid" });

// Testing Library only auto-cleans when Vitest globals are enabled; this suite
// imports its helpers explicitly, so unmount between tests here.
afterEach(() => {
  cleanup();
});

// jsdom does not implement the Pointer Capture API that Radix UI's Select
// calls when a pointer event lands on its trigger. Without these no-op shims
// the select throws `target.hasPointerCapture is not a function` and the
// dropdown never opens. This is a jsdom gap, not app behavior.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
}
if (!Element.prototype.setPointerCapture) {
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.releasePointerCapture) {
  Element.prototype.releasePointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
