'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useToast } from '../../components/Toaster';
import {
  VOUCHER_IMAGE_ASSETS,
  VOUCHER_IMAGE_HEIGHT,
  VOUCHER_IMAGE_WIDTH,
  type VoucherImageAssets,
  type VoucherImageData,
  buildVoucherSvg
} from './voucher-image';

type Props = VoucherImageData & {
  voucherId: string;
  status: string;
};

const toBase64 = async (path: string) => {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Couldn't load ${path}`);
  const bytes = new Uint8Array(await res.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
};

/** Draws the voucher SVG onto a canvas and returns it as a PNG. */
const renderPng = async (data: VoucherImageData): Promise<Blob> => {
  const entries = await Promise.all(
    Object.entries(VOUCHER_IMAGE_ASSETS).map(async ([key, path]) => [key, await toBase64(path)])
  );
  const svg = buildVoucherSvg(data, Object.fromEntries(entries) as VoucherImageAssets);
  const svgUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
  try {
    const img = new Image();
    img.src = svgUrl;
    await img.decode();
    const canvas = document.createElement('canvas');
    canvas.width = VOUCHER_IMAGE_WIDTH;
    canvas.height = VOUCHER_IMAGE_HEIGHT;
    canvas.getContext('2d')!.drawImage(img, 0, 0);
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Export failed'))), 'image/png')
    );
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
};

/**
 * The voucher as a picture to text or DM, for holders who gave a phone number or Instagram
 * handle instead of an email. Download it, or share it straight from a phone.
 */
const VoucherImagePanel = ({ voucherId, status, ...data }: Props) => {
  const router = useRouter();
  const { addToast } = useToast();
  const [png, setPng] = useState<{ blob: Blob; url: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const [canShare, setCanShare] = useState(false);
  const [marking, setMarking] = useState(false);
  const fileName = `${data.code}.png`;
  const key = JSON.stringify(data);

  useEffect(() => {
    let url: string | null = null;
    let cancelled = false;
    setPng(null);
    setFailed(false);
    renderPng(JSON.parse(key) as VoucherImageData)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setPng({ blob, url });
        const file = new File([blob], fileName, { type: 'image/png' });
        setCanShare(
          typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })
        );
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [key, fileName]);

  const share = async () => {
    if (!png) return;
    try {
      await navigator.share({ files: [new File([png.blob], fileName, { type: 'image/png' })] });
    } catch (err) {
      // Closing the share sheet rejects with AbortError; that's not a failure.
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        addToast('Couldn’t open sharing. Download the image instead.', 'error');
      }
    }
  };

  const markSent = async () => {
    setMarking(true);
    try {
      const res = await fetch(`/api/vouchers/${voucherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACTIVE' })
      });
      if (!res.ok) throw new Error();
      addToast('Marked as sent.', 'success');
      router.refresh();
    } catch {
      addToast('Failed to update status.', 'error');
    } finally {
      setMarking(false);
    }
  };

  const button =
    'rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50';

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
      <div className="w-40 shrink-0 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
        {png ? (
          // eslint-disable-next-line @next/next/no-img-element -- a local blob URL, not an optimisable image
          <img
            src={png.url}
            alt={`Voucher ${data.code} as an image`}
            width={VOUCHER_IMAGE_WIDTH}
            height={VOUCHER_IMAGE_HEIGHT}
            className="h-auto w-full"
          />
        ) : (
          <div className="flex aspect-[4/5] items-center justify-center px-3 text-center text-xs text-slate-400">
            {failed ? 'Couldn’t build the image.' : 'Building image…'}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-600">
          For texting or DMing the code when you don&apos;t have an email address.
        </p>
        <div className="flex flex-wrap gap-2">
          {png ? (
            <a href={png.url} download={fileName} className={button}>
              Download image
            </a>
          ) : (
            <button disabled className={button}>
              Download image
            </button>
          )}
          {canShare && (
            <button onClick={share} disabled={!png} className={button}>
              Share…
            </button>
          )}
        </div>
        {status === 'PENDING' && (
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            Sent it?
            <button
              onClick={markSent}
              disabled={marking}
              className="font-medium text-indigo-600 hover:text-indigo-500 disabled:opacity-50"
            >
              {marking ? 'Saving…' : 'Mark it Active'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoucherImagePanel;
