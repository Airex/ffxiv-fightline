/// <reference lib="webworker" />

addEventListener("message", ({ data }) => {
  // const warnings = collectWarnings(data.holders);
  const warnings = [];
  postMessage({ warnings });
});
