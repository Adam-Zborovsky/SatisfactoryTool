import React, { useState, useEffect } from 'react';
import { fmtNum, fmtChests, parseNum } from '../lib/format';
import { totalSlots, calcChests, slotRemainder } from '../lib/calc';

export default function IngredientRow({ input, consumed, onAdjust, onSet }) {
  const total = totalSlots(input.quantity, input.stackSize);
  const remaining = Math.max(0, total - consumed);
  const remChests = calcChests(remaining);
  const totalChests = calcChests(total);
  const totalRem = slotRemainder(input.quantity, input.stackSize);

  const [localVal, setLocalVal] = useState('');

  useEffect(() => {
    setLocalVal(fmtNum(consumed));
  }, [consumed]);

  const handleChange = (e) => {
    const raw = e.target.value.replace(/,/g, '');
    if (!/^\d*$/.test(raw)) return;
    setLocalVal(fmtNum(parseInt(raw || '0', 10)));
  };

  const handleBlur = () => {
    const target = parseNum(localVal);
    onSet(Math.min(target, total));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  return (
    <div className="breakdown-row">
      <div className="br-info">
        <span className="br-name">{input.name}</span>
        <span className="br-total">
          {fmtNum(input.quantity)} items · {fmtNum(total)} stacks
          {totalRem > 0 && <span style={{ color: 'var(--ink-faint)' }}> +{fmtNum(totalRem)}</span>}
          {' · '}
          {totalChests.full > 0 || totalChests.rem > 0
            ? fmtChests(totalChests)
            : '\u2014'}
        </span>
      </div>
      <div className="br-tracker">
        <div className="bc">
          <button onClick={() => onAdjust(-1)} disabled={consumed <= 0}>-</button>
          <input
            type="text"
            inputMode="numeric"
            className="bc-num"
            value={localVal}
            placeholder="0"
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            style={{
              width: 48, textAlign: 'center', background: 'transparent', color: 'var(--ink)',
              border: 'none', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)',
              fontWeight: 600, outline: 'none', padding: 0, lineHeight: '26px',
            }}
          />
          <button onClick={() => onAdjust(1)} disabled={consumed >= total}>+</button>
        </div>
        <span className="br-remaining">{fmtNum(remaining)} stacks left · {fmtChests(remChests)}</span>
      </div>
    </div>
  );
}
