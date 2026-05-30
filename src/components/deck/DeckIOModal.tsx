"use client";

import { useState } from "react";
import { Deck } from "@/types";
import { exportDeckText, importDeckText, encodeDeckToUrl } from "@/lib/deck-io";
import { useDeckStore } from "@/lib/deck-store";
import { X, Copy, Check, Upload, Download, AlertTriangle, Link, Image } from "lucide-react";
import { DecklistExportImage } from "./DecklistExportImage";

interface DeckIOModalProps {
  deck: Deck;
  onClose: () => void;
}

type Tab = "export" | "import";

export function DeckIOModal({ deck, onClose }: DeckIOModalProps) {
  const { setDeckCards } = useDeckStore();
  const [tab, setTab] = useState<Tab>("export");
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showImageExport, setShowImageExport] = useState(false);
  const [importText, setImportText] = useState("");
  const [importResult, setImportResult] = useState<{ matched: number; unmatched: string[] } | null>(null);
  const [imported, setImported] = useState(false);

  const exportText = exportDeckText(deck);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = async () => {
    const url = encodeDeckToUrl(deck);
    await navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleImport = () => {
    const result = importDeckText(importText, deck.game);
    setImportResult({ matched: result.matched, unmatched: result.unmatched });
    if (result.cards.length > 0) {
      setDeckCards(deck.id, result.cards);
      setImported(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-md glass-md rounded-t-2xl border-t border-white/[0.08] flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-white/[0.06]">
          <h2 className="text-sm font-bold text-white">Import / Export</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-white/30 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/[0.05]">
          {(["export", "import"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setImportResult(null); setImported(false); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all ${
                tab === t
                  ? "text-white border-b border-white/30 bg-white/[0.04]"
                  : "text-white/30 hover:text-white/60"
              }`}
            >
              {t === "export" ? <Download className="w-3.5 h-3.5" /> : <Upload className="w-3.5 h-3.5" />}
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {tab === "export" && (
            <>
              <p className="text-xs text-white/35">
                Copy this list to share your deck or import it into another tool.
              </p>
              <div className="relative">
                <textarea
                  readOnly
                  value={exportText}
                  rows={14}
                  className="w-full glass rounded-xl p-3 text-xs text-white/60 font-mono resize-none focus:outline-none leading-relaxed"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    copied
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  }`}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Text"}
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    copiedLink
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/25"
                  }`}
                >
                  {copiedLink ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
                  {copiedLink ? "Copied!" : "Share Link"}
                </button>
              </div>
              <button
                onClick={() => setShowImageExport(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 border border-purple-500/25"
              >
                <Image className="w-4 h-4" />
                Export as Image
              </button>
            </>
          )}

          {showImageExport && <DecklistExportImage deck={deck} onClose={() => setShowImageExport(false)} />}

          {tab === "import" && (
            <>
              <p className="text-xs text-white/35">
                Paste a deck list below. Supported formats:{" "}
                <span className="text-white/50 font-mono">4x Card Name</span>,{" "}
                <span className="text-white/50 font-mono">4 Card Name</span>, or{" "}
                <span className="text-white/50 font-mono">Card Name x4</span>.
                Lines starting with <span className="text-white/50 font-mono">//</span> are ignored.
              </p>
              <textarea
                value={importText}
                onChange={(e) => { setImportText(e.target.value); setImportResult(null); setImported(false); }}
                placeholder={"4x Card Name\n3x Another Card\n..."}
                rows={10}
                className="w-full glass rounded-xl p-3 text-xs text-white font-mono resize-none focus:outline-none leading-relaxed placeholder-white/15"
              />

              {importResult && (
                <div className="space-y-2">
                  {imported && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      Imported {importResult.matched} card{importResult.matched !== 1 ? "s" : ""} into your deck.
                    </div>
                  )}
                  {importResult.unmatched.length > 0 && (
                    <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                      <div className="flex items-center gap-2 text-xs text-amber-400 mb-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        {importResult.unmatched.length} card{importResult.unmatched.length !== 1 ? "s" : ""} not found in database:
                      </div>
                      <ul className="space-y-0.5">
                        {importResult.unmatched.map((n) => (
                          <li key={n} className="text-[11px] text-white/40 font-mono pl-1">· {n}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleImport}
                disabled={!importText.trim()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 disabled:opacity-30 disabled:pointer-events-none"
              >
                <Upload className="w-4 h-4" />
                Import into Deck
              </button>
              <p className="text-[10px] text-white/20 text-center">
                This will replace all current cards in the deck.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
