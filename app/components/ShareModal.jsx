"use client";

import { useState } from "react";

export default function ShareModal({
  open,
  onClose,
  locationLabel,
  shareUrl,
  getImageBase64,
}) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  const timestamp = new Date().toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    try {
      const imageBase64 = await getImageBase64();

      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          imageBase64,
          locationLabel,
          timestamp,
          shareUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");
      setStatus("success");
      setEmail("");
    } catch (err) {
      setErrorMsg(err.message);
      setStatus("error");
    }
  };

  const handleClose = () => {
    setStatus("idle");
    setEmail("");
    setErrorMsg("");
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop */}
      <div
        className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 w-full max-w-sm mx-6 bg-white bg-opacity-90 rounded-xl shadow-lg p-8">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-700 text-lg leading-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold text-stone-800 mb-1">
          Share this painting
        </h2>
        <p className="text-sm text-stone-500 mb-6">
          {locationLabel} · {timestamp}
        </p>

        {/* Copy link */}
        <div className="mb-6">
          <p className="text-xs uppercase tracking-wide text-stone-400 mb-2">
            Share link
          </p>
          <div className="flex gap-2 items-center">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 border border-stone-200 rounded px-2 py-1.5 text-xs text-stone-500 bg-stone-50 outline-none truncate"
            />
            <button
              onClick={handleCopyLink}
              className="shrink-0 px-3 py-1.5 rounded bg-stone-200 hover:bg-stone-300 text-xs font-semibold text-stone-700 transition-colors"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>

        <div className="border-t border-stone-200 pt-5">
          <p className="text-xs uppercase tracking-wide text-stone-400 mb-3">
            Email this rendering
          </p>
          {status === "success" ? (
            <p className="text-sm text-stone-600">Sent! Check your inbox.</p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-stone-300 rounded px-3 py-2 text-sm outline-none focus:border-stone-500"
              />
              <button
                type="submit"
                disabled={status === "sending"}
                className="w-full py-2 rounded bg-stone-700 text-white text-sm font-semibold uppercase tracking-wide hover:bg-stone-800 transition-colors disabled:opacity-50"
              >
                {status === "sending" ? "Sending…" : "Send"}
              </button>
              {status === "error" && (
                <p className="text-xs text-red-500">{errorMsg}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
