function inlineComputedStyles(source: Element, target: Element) {
  const computed = window.getComputedStyle(source);
  const style = Array.from(computed).map(name => `${name}:${computed.getPropertyValue(name)};`).join('');
  target.setAttribute('style', style);
  Array.from(source.children).forEach((child, index) => {
    const targetChild = target.children[index];
    if (targetChild) inlineComputedStyles(child, targetChild);
  });
}

export async function downloadElementAsPng(element: HTMLElement, filename: string) {
  const rect = element.getBoundingClientRect();
  const width = Math.max(1, Math.ceil(rect.width));
  const height = Math.max(1, Math.ceil(rect.height));
  const clone = element.cloneNode(true) as HTMLElement;
  inlineComputedStyles(element, clone);
  clone.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');

  const serialized = new XMLSerializer().serializeToString(clone);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><foreignObject width="100%" height="100%">${serialized}</foreignObject></svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));

  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error('Image export impossible'));
    });

    const canvas = document.createElement('canvas');
    const scale = Math.min(3, Math.max(2, window.devicePixelRatio || 2));
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas indisponible');
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0, width, height);

    const png = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('PNG impossible')), 'image/png', 0.95);
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(png);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function memberCardMailto(email: string, name: string, memberId: string) {
  const verifyUrl = `https://salam-cameroun.com/verify/${encodeURIComponent(memberId)}`;
  const subject = `Carte membre SALAM - ${name}`;
  const body = `Bonjour,\n\nVoici le lien de verification de la carte membre SALAM de ${name} :\n${verifyUrl}\n\nCordialement.`;
  return `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}