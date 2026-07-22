import React from 'react';
import { fmtNum, fmtChests } from '../lib/format';
import { totalSlots, calcChests, slotRemainder } from '../lib/calc';

export default function IngredientRow({ input, consumed, onAdjust }) {
  const total = totalSlots(input.quantity, input.stackSize);
  const remaining = Math.max(0, total - consumed);
  const remChests = calcChests(remaining);
  const totalChests = calcChests(total);
  const totalRem = slotRemainder(input.quantity, input.stackSize);

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
          <span className="bc-num">{fmtNum(consumed)}</span>
          <button onClick={() => onAdjust(1)} disabled={consumed >= total}>+</button>
        </div>
        <span className="br-remaining">{fmtNum(remaining)} stacks left · {fmtChests(remChests)}</span>
      </div>
    </div>
  );
}
