'use client';

import { useState } from 'react';

/** Copies a voucher code to the clipboard, with a brief "Copied" confirmation. */
const CopyCodeButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be blocked (e.g. insecure origin); the code is on screen to copy by hand.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={`Copy ${code}`}
      className="rounded border border-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700"
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
};

export default CopyCodeButton;
