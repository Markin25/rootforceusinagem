import logoUrl from '@assets/logodefinitiva.png';

function setCSSVar(name: string, value: string) {
  document.documentElement.style.setProperty(name, value);
}

function clamp(n: number, min = 0, max = 1) {
  return Math.max(min, Math.min(max, n));
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number;
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function toRgbString([r, g, b]: [number, number, number]) {
  return `${r}, ${g}, ${b}`;
}

async function getAverageColor(src: string): Promise<[number, number, number] | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 64;
        canvas.width = size; canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        resolve([Math.round(r / count), Math.round(g / count), Math.round(b / count)]);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export async function applyBrandFromLogo() {
  try {
    const avg = await getAverageColor(logoUrl);
    if (!avg) return;
    const [h, s, l] = rgbToHsl(avg[0], avg[1], avg[2]);
    const brand = hslToRgb(h, clamp(s, 0.3, 0.8), clamp(l, 0.25, 0.5));
    const brandDark = hslToRgb(h, s, clamp(l - 0.15, 0, 1));
    const brandLight = hslToRgb(h, clamp(s - 0.2, 0, 1), clamp(l + 0.15, 0, 1));
    const accent = hslToRgb(h, clamp(s + 0.2, 0, 1), clamp(l + 0.1, 0, 1));
    const accentDark = hslToRgb(h, s, clamp(l - 0.1, 0, 1));

    setCSSVar('--brand', toRgbString(brand));
    setCSSVar('--brand-dark', toRgbString(brandDark));
    setCSSVar('--brand-light', toRgbString(brandLight));
    setCSSVar('--accent', toRgbString(accent));
    setCSSVar('--accent-dark', toRgbString(accentDark));

    window.dispatchEvent(new CustomEvent('brand-applied'));
  } catch (err) {
    console.warn('Falha ao aplicar paleta da logo:', err);
  }
}

applyBrandFromLogo();
