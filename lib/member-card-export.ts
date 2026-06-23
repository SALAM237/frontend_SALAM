import { BarcodeFormat, QRCodeWriter } from '@zxing/library';
import { memberCardVerifyUrl, type MemberCardData } from '@/components/portal/MemberCard';
import { formatFullName } from '@/lib/format-name';

function rrect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill = true, stroke = false) {
  ctx.beginPath();
  rrect(ctx, x, y, w, h, r);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

function drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = '';

  for (const word of words) {
    const candidate = line ? line + ' ' + word : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length >= maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line);

  lines.forEach((entry, index) => ctx.fillText(index === maxLines - 1 && lines.length === maxLines && words.length > entry.split(/\s+/).length ? entry + '...' : entry, x, y + index * lineHeight));
}

function drawQr(ctx: CanvasRenderingContext2D, data: string, x: number, y: number, size: number) {
  const writer = new QRCodeWriter();
  const matrix = writer.encode(data, BarcodeFormat.QR_CODE, size, size, new Map());
  ctx.fillStyle = '#07140d';
  roundRect(ctx, x, y, size, size, 16);
  ctx.fillStyle = '#ffffff';
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (matrix.get(col, row)) ctx.fillRect(x + col, y + row, 1, 1);
    }
  }
}

export async function generateMemberCardBlob(member: MemberCardData): Promise<Blob> {
  const W = 800;
  const H = 500;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas indisponible');

  ctx.save();
  roundRect(ctx, 0, 0, W, H, 32, false, false);
  ctx.clip();

  const bg = ctx.createLinearGradient(0, 0, W * 0.75, H);
  bg.addColorStop(0, '#07140d');
  bg.addColorStop(0.55, '#0b1f15');
  bg.addColorStop(1, '#10261a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(255,255,255,0.04)';
  for (let x = 9; x < W; x += 18) {
    for (let y = 9; y < H; y += 18) {
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.fillStyle = 'rgba(16,185,129,0.08)';
  ctx.beginPath();
  ctx.arc(W - 20, 40, 115, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(247,198,0,0.06)';
  ctx.beginPath();
  ctx.arc(10, H - 20, 105, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#0B8F3A'; ctx.fillRect(0, 0, W / 3, 8);
  ctx.fillStyle = '#C8102E'; ctx.fillRect(W / 3, 0, W / 3, 8);
  ctx.fillStyle = '#F7C600'; ctx.fillRect((W * 2) / 3, 0, W / 3, 8);
  ctx.fillStyle = '#0B8F3A'; ctx.fillRect(0, H - 5, W / 3, 5);
  ctx.fillStyle = '#C8102E'; ctx.fillRect(W / 3, H - 5, W / 3, 5);
  ctx.fillStyle = '#F7C600'; ctx.fillRect((W * 2) / 3, H - 5, W / 3, 5);

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(62, 78, 32, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#0B8F3A';
  ctx.font = '900 18px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('S', 62, 85);
  ctx.restore();

  ctx.textAlign = 'left';
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 20px Arial';
  ctx.fillText('SALAM', 104, 76);
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.font = '500 10px Arial';
  ctx.fillText('SOLIDAIRE ASSOCIATIVE', 104, 93);

  ctx.strokeStyle = 'rgba(16,185,129,0.3)';
  ctx.fillStyle = 'rgba(16,185,129,0.1)';
  ctx.lineWidth = 1;
  roundRect(ctx, 30, 112, 156, 25, 13, true, true);
  ctx.fillStyle = '#6ee7b7';
  ctx.font = '900 9px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('CARTE DE MEMBRE', 108, 128);
  ctx.textAlign = 'left';

  const verifyUrl = memberCardVerifyUrl(member);
  drawQr(ctx, verifyUrl, W - 222, 28, 192);

  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.beginPath();
  ctx.moveTo(30, H - 168);
  ctx.lineTo(W - 30, H - 168);
  ctx.stroke();

  ctx.fillStyle = 'rgba(255,255,255,0.42)';
  ctx.font = '700 12px Arial';
  ctx.fillText('TITULAIRE', 30, H - 138);

  if (member.gender) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '700 11px Arial';
    ctx.fillText(member.gender === 'femme' ? 'MADAME' : 'MONSIEUR', 30, H - 119);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 36px Arial';
  drawWrappedText(ctx, formatFullName(member.firstName, member.lastName), 30, H - 88, W - 270, 40, 2);

  ctx.fillStyle = '#6ee7b7';
  ctx.font = '800 14px Arial';
  ctx.fillText(member.role, 30, H - 48);
  if (member.antenne) {
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '500 11px Arial';
    ctx.fillText('Antenne ' + member.antenne, 30, H - 30);
  }

  ctx.textAlign = 'right';
  ctx.fillStyle = 'rgba(255,255,255,0.35)';
  ctx.font = '700 10px Arial';
  ctx.fillText('N° MEMBRE', W - 30, H - 72);
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '900 15px Arial';
  ctx.fillText(member.id, W - 30, H - 52);
  ctx.fillStyle = 'rgba(255,255,255,0.32)';
  ctx.font = '500 10px Arial';
  ctx.fillText(`Valide ${member.year}`, W - 30, H - 34);
  ctx.textAlign = 'left';

  ctx.restore();

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG impossible')), 'image/png', 0.95);
  });
}

export async function downloadMemberCardPng(member: MemberCardData, filename = `carte-salam-${member.id}.png`) {
  const blob = await generateMemberCardBlob(member);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function downloadElementAsPng(_element: HTMLElement, filename: string, member?: MemberCardData) {
  if (!member) throw new Error('Donnees carte manquantes');
  await downloadMemberCardPng(member, filename);
}

export function memberCardMailto(email: string, name: string, memberId: string, cardVerifyToken?: string | null) {
  const verifyUrl = memberCardVerifyUrl({ id: memberId, cardVerifyToken });
  const subject = `Carte membre SALAM - ${name}`;
  const body = `Bonjour,\n\nVoici le lien de verification de la carte membre SALAM de ${name} :\n${verifyUrl}\n\nCordialement.`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}