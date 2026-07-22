import React, { useState, useRef, useMemo } from 'react';
import { parseSfmd, detectTiers } from '../import/sfmd';

const TIER_COLORS = [
  '#f48229', '#60a5fa', '#34d399', '#fbbf24', '#ef4444',
  '#a78bfa', '#fb923c', '#38bdf8', '#4ade80', '#f472b6',
];

export default function ImportModal({ onClose, onImport }) {
  const [step, setStep] = useState('upload');
  const [fileContent, setFileContent] = useState(null);
  const [fileName, setFileName] = useState('');
  const [nodes, setNodes] = useState([]);
  const [autoTiers, setAutoTiers] = useState([]);
  const [tierEdits, setTierEdits] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setError('');
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        setFileContent(content);
        const parsed = parseSfmd(content);
        setNodes(parsed);
        const tiers = detectTiers(parsed);
        setAutoTiers(tiers);
        const edits = parsed.map(n => {
          const tierIndex = tiers.findIndex(t => t.items.includes(n.name));
          return { name: n.name, tier: tierIndex >= 0 ? tierIndex : 0 };
        });
        setTierEdits(edits);
        setStep('review');
      } catch (err) {
        setError('Failed to parse .sfmd file: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleTierChange = (name, tier) => {
    setTierEdits(prev =>
      prev.map(e => e.name === name ? { ...e, tier: parseInt(tier, 10) } : e)
    );
  };

  const itemsByTier = useMemo(() => {
    const map = {};
    autoTiers.forEach((t, i) => {
      const tierItems = t.items
        .map(name => nodes.find(n => n.name === name))
        .filter(Boolean)
        .sort((a, b) => a.y - b.y);
      if (tierItems.length > 0) {
        map[i] = { tier: t, color: TIER_COLORS[i % TIER_COLORS.length], items: tierItems };
      }
    });
    return map;
  }, [autoTiers, nodes]);

  return (
    <div className="modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <h3>Import from Satisfactory Modeler</h3>

        {step === 'upload' && (
          <>
            <p>Drop a .sfmd file or click to browse. Tiers are auto-detected from horizontal position on the Modeler canvas.</p>
            <div
              className={`file-zone ${dragOver ? 'active' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <p>Drop .sfmd file here</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".sfmd"
              style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files[0]; if (f) handleFile(f); }}
            />
            {error && <p style={{ color: 'var(--rust)', marginTop: 8 }}>{error}</p>}
          </>
        )}

        {step === 'review' && (
          <>
            <p>
              Found <strong>{nodes.length}</strong> items across{' '}
              <strong>{autoTiers.length}</strong> auto-detected tiers
              from <strong>{fileName}</strong>.
              Drag items between tiers or use the dropdown to reassign.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
              {Object.entries(itemsByTier).map(([tierIdx, { tier, color, items }]) => (
                <div key={tierIdx} style={{
                  background: 'var(--panel)',
                  border: '1px solid var(--rule)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '8px 14px',
                    borderBottom: '1px solid var(--rule-subtle)',
                  }}>
                    <span style={{
                      width: 4, height: 18, borderRadius: 2, flexShrink: 0,
                      background: color,
                    }} />
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)',
                      fontWeight: 600, color: 'var(--ink)',
                    }}>
                      Tier {tierIdx}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)',
                      color: 'var(--ink-faint)',
                    }}>
                      {items.length} items · col {tier.xMin}
                    </span>
                  </div>
                  <div style={{ padding: '6px 14px 8px' }}>
                    {items.map((node, i) => {
                      const inputCount = Object.keys(node.inputs || {}).length;
                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '4px 0',
                          borderBottom: i < items.length - 1 ? '1px solid var(--rule-subtle)' : 'none',
                        }}>
                          <span style={{
                            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                            color: 'var(--ink)', flex: 1,
                          }}>
                            {node.name}
                            {inputCount > 0 && (
                              <span style={{ fontSize: 10, color: 'var(--ink-faint)', marginLeft: 8 }}>
                                {inputCount} inputs
                              </span>
                            )}
                          </span>
                          <select
                            value={tierEdits.find(e => e.name === node.name)?.tier ?? Number(tierIdx)}
                            onChange={(e) => handleTierChange(node.name, e.target.value)}
                            style={{
                              background: 'var(--paper)', color: 'var(--ink)',
                              border: '1px solid var(--rule)', borderRadius: 'var(--radius-sm)',
                              padding: '3px 6px', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-2xs)',
                              minWidth: 50, outline: 'none',
                            }}
                          >
                            {autoTiers.map((t, j) => (
                              <option key={j} value={j}>Tier {j}</option>
                            ))}
                            <option value={-1}>Unassigned</option>
                          </select>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button className="sb-btn" onClick={() => setStep('upload')}>Back</button>
              <button className="sb-btn primary" onClick={() => onImport(fileContent, tierEdits.filter(e => e.tier >= 0))}>
                Import {nodes.length} items
              </button>
            </div>
          </>
        )}

        <div className="modal-actions">
          <button className="sb-btn" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
