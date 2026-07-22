export function fmtNum(n) {
  if (n == null || n === '') return '';
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function parseNum(raw) {
  const stripped = String(raw || '').replace(/,/g, '');
  const n = parseInt(stripped, 10);
  return isNaN(n) ? 0 : Math.max(0, n);
}

export function fmtRemaining(remaining) {
  if (remaining <= 0) return '0';
  const fixed = remaining.toFixed(2);
  return parseFloat(fixed).toString();
}

export function fmtChests(ch) {
  if (ch.full === 0 && ch.rem === 0) return '\u2014';
  if (ch.full === 0) {
    const dec = (ch.rem / 48).toFixed(2);
    return `${dec} containers`;
  }
  if (ch.rem === 0) return `${ch.full} ind. containers`;
  return `${ch.full} containers + ${ch.rem} stacks`;
}

export function liveFmt(input) {
  const prev = input.dataset.prev || '';
  const val = input.value;
  const raw = val.replace(/,/g, '');
  if (!/^\d*$/.test(raw)) { input.value = prev; return; }
  const rawBeforeCursor = val.slice(0, input.selectionStart).replace(/,/g, '');
  const digitPos = rawBeforeCursor.length;
  const formatted = raw ? fmtNum(parseInt(raw, 10)) : '';
  let newPos = 0;
  let digitsSeen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (digitsSeen >= digitPos) break;
    newPos = i + 1;
    if (formatted[i] !== ',') digitsSeen++;
  }
  input.dataset.prev = formatted;
  input.value = formatted;
  input.setSelectionRange(newPos, newPos);
}
