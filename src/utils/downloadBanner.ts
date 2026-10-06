import html2canvas from 'html2canvas-pro';
import { PlacementRecord } from '../types/placement';

/**
 * Convert any image URL (local or cross-origin) into a base64 Data URL
 * using direct fetch, proxy fetch fallback, or canvas draw.
 */
async function toBase64DataUrl(src: string): Promise<string> {
  if (!src) return '';
  if (src.startsWith('data:')) return src;

  // 1. Try direct fetch
  try {
    const res = await fetch(src, { mode: 'cors' });
    if (res.ok) {
      const blob = await res.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch {
    // ignore and try proxy
  }

  // 2. Try proxy endpoint for cross-origin URLs (e.g. LinkedIn, AWS, external CDNs)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    try {
      const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(src)}`;
      const res = await fetch(proxyUrl);
      if (res.ok) {
        const blob = await res.blob();
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }
    } catch {
      // ignore and try canvas
    }
  }

  // 3. Try Image + Canvas draw
  return new Promise<string>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
          return;
        }
      } catch {
        // failed
      }
      resolve(src);
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
}

export async function downloadBannerAsImage(
  element: HTMLElement | null,
  placement: PlacementRecord
): Promise<void> {
  if (!element) {
    console.error('downloadBannerAsImage: No target element provided');
    return;
  }

  // Target the exact banner element (excluding any surrounding page wrapper/padding/margins)
  const bannerElement = (
    element.id === 'individual-banner-export' || element.id === 'group-banner-export'
      ? element
      : (element.querySelector('#individual-banner-export, #group-banner-export') as HTMLElement) ||
        (element.firstElementChild as HTMLElement) ||
        element
  );

  const sanitizedStudentName =
    placement.type === 'group'
      ? `Group_${placement.students.length}_Students`
      : (placement.students[0]?.name || 'Student').replace(/[^a-zA-Z0-9_-]/g, '_');
  const sanitizedCompany = placement.company.replace(/[^a-zA-Z0-9_-]/g, '_');
  const fileName = `MIT-WPU_${sanitizedStudentName}_${sanitizedCompany}_Placement.png`;

  try {
    // 1. Find all <img> inside the banner element and preload them as base64 Data URLs
    const originalImages = Array.from(bannerElement.querySelectorAll('img'));
    const base64Map = new Map<HTMLImageElement, string>();

    await Promise.all(
      originalImages.map(async (img) => {
        const currentSrc = img.currentSrc || img.src;
        if (currentSrc) {
          const b64 = await toBase64DataUrl(currentSrc);
          if (b64 && b64.startsWith('data:')) {
            base64Map.set(img, b64);
          }
        }
      })
    );

    // 2. Clone the banner element strictly
    const clone = bannerElement.cloneNode(true) as HTMLElement;
    const clonedImages = Array.from(clone.querySelectorAll('img'));

    originalImages.forEach((origImg, index) => {
      const clonedImg = clonedImages[index];
      const b64 = base64Map.get(origImg);
      if (clonedImg && b64) {
        clonedImg.src = b64;
        clonedImg.removeAttribute('srcset');
      }
    });

    // Reset external margin and shadows so only the banner itself is captured
    clone.style.margin = '0';
    clone.style.boxShadow = 'none';

    // Standard high-definition target width for the banner
    const targetWidth = placement.type === 'group' ? 880 : 840;
    clone.style.width = `${targetWidth}px`;
    clone.style.maxWidth = `${targetWidth}px`;

    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '-99999px';
    wrapper.style.left = '-99999px';
    wrapper.style.width = `${targetWidth}px`;
    wrapper.style.padding = '0';
    wrapper.style.margin = '0';
    wrapper.style.zIndex = '-1000';
    wrapper.style.opacity = '1';
    wrapper.style.background = 'transparent';
    wrapper.style.pointerEvents = 'none';

    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    // Wait briefly for layout & images to render
    await new Promise((r) => setTimeout(r, 120));

    const finalHeight = clone.offsetHeight;

    // 3. Render canvas with html2canvas-pro directly on the clone
    const canvas = await html2canvas(clone, {
      scale: 3.0, // Crisp 3x ultra HD output
      useCORS: true,
      allowTaint: false,
      backgroundColor: null, // Transparent background outside the banner
      logging: false,
      width: targetWidth,
      height: finalHeight,
      windowWidth: targetWidth,
      windowHeight: finalHeight,
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      onclone: (clonedDoc) => {
        const allElements = clonedDoc.querySelectorAll('*');
        allElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.animation = 'none';
            el.style.transition = 'none';
          }
        });
      },
    });

    // Clean up offscreen wrapper
    if (document.body.contains(wrapper)) {
      document.body.removeChild(wrapper);
    }

    // 4. Download canvas strictly as PNG file
    if (canvas.toBlob) {
      canvas.toBlob((blob) => {
        if (!blob) {
          fallbackDownload(canvas.toDataURL('image/png'), fileName);
          return;
        }
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = fileName;
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
          URL.revokeObjectURL(blobUrl);
        }, 300);
      }, 'image/png', 1.0);
    } else {
      fallbackDownload(canvas.toDataURL('image/png'), fileName);
    }
  } catch (error) {
    console.error('Error during banner export:', error);
    try {
      const directCanvas = await html2canvas(bannerElement, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
      });
      fallbackDownload(directCanvas.toDataURL('image/png'), fileName);
    } catch (fallbackError) {
      console.error('Fallback export error:', fallbackError);
      window.print();
    }
  }
}

function fallbackDownload(dataUrl: string, fileName: string) {
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 300);
}
