const cleanDisplayName = (displayName) => {
  let cleaned = displayName;

  if (!displayName) {
    return displayName;
  }

  /* eslint-disable no-control-regex */
  cleaned = cleaned.replace(/[\u0000-\u001F\u007F\u0080-\u009F]/g, ''); // ASCII control characters.
  cleaned = cleaned.replace(/[\u000A-\u000D\u0085\u2028\u2029]/g, ''); // Line breaks.
  cleaned = cleaned.trim();

  return cleaned;
};

export default cleanDisplayName;
