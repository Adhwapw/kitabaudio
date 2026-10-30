import { AudioItem } from '../types.ts';

/**
 * Peta foto produk kurasi untuk tampilan live.
 *
 * Masalah yang diperbaiki file ini: sebelumnya foto kurasi hanya hidup di
 * scripts/image-cache.json, dan itu hanya dipakai crawler untuk snapshot
 * bawaan. Saat sinkronisasi live berhasil, sheetSync mengembalikan item
 * dari spreadsheet saja, sehingga foto kurasi hilang dari tampilan.
 * Dengan peta ini, sheetSync menempelkan foto ke item live yang belum
 * punya imageUrl, dengan kunci yang sama persis seperti image-cache.json:
 * "tabId::nama-produk-lowercase".
 *
 * Aturan kurasi (jangan dilanggar):
 * - Satu entri hanya ditambahkan bila URL-nya sudah dicek: HTTP 2xx,
 *   content-type gambar, dan halaman sumbernya memang produk yang sama
 *   (bukan model lain yang mirip, mis. Tea Pro vs Tea Pro SE).
 * - Kolom "Gambar" di spreadsheet selalu menang: fungsi di bawah tidak
 *   menimpa imageUrl yang sudah ada.
 * - Jaga file ini tetap sama isinya dengan scripts/image-cache.json.
 *   Entri baru ditambahkan ke kedua tempat, lalu crawl dijalankan ulang
 *   agar snapshot bawaan ikut ter-update.
 */
export const PRODUCT_IMAGES: Record<string, string> = {
  'dongle-dac::cayin ru7':
    'https://d30ek1sgwm2r4c.cloudfront.net/sites/files/treoo/productimg/202305/cayin_ru7_1.jpg',
  'dongle-dac::fiio ka17':
    'https://cdn.shopify.com/s/files/1/0153/8863/files/Headphone-Zone-FiiO-KA17-Black-090.jpg?v=1707732982',
  'headphone::focal clear mg':
    'https://r2.gear4music.com/media/116/1167509/1200/preview.jpg',
  'headphone::hifiman sundara':
    'https://www.headphonezone.in/cdn/shop/products/Headphone-Zone-HiFiMAN-Sundara-1160-1160-3.jpg?v=1719229635&width=1160',
  'headphone::sennheiser hd600':
    'https://cdn.shopify.com/s/files/1/0153/8863/files/Headphone-Zone-Sennheiser-HD600-New-03.jpg?v=1696510005',
  'headphone::sennheiser hd650':
    'https://www.bhphotovideo.com/images/fb/Sennheiser_HD_650_HD650_Reference_Class_310010.jpg',
  'iem::crinear daybreak':
    'https://www.headphonezone.in/cdn/shop/files/Headphone-Zone-CrinEar-Daybreak-11.jpg?v=1767943472&width=1160',
  'iem::hisenior mega5est 7th':
    'https://cdn.shopify.com/s/files/1/0915/6712/8880/files/006.jpg?v=1741593661',
  'iem::juzear 61t':
    'https://cdn.shopify.com/s/files/1/0421/5432/8214/files/JUZEAR_Butterfly_61T_4_2048x2048.png?v=1729757125',
  'iem::moondrop blessing 3':
    'https://hifi-passion.de/thumbnail/bf/c6/1d/1706741224/2hxbbxglk2wrvb_600x600.jpg',
  'iem::xenns mangird tea pro se':
    'https://www.theaudiostore.in/cdn/shop/files/xenns-mangird-tea-pro-se-iem-5.jpg?v=1770627458&width=900',
  'iem::xenns top pro':
    'https://www.linsoul.com/cdn/shop/files/XENNS_TOP_PRO_8_600x.jpg',
  'ows::soundcore aerofit 2':
    'https://content.rozetka.com.ua/goods/images/big/574341677.jpg',
  'speaker::focal chora 806':
    'https://images.crutchfieldonline.com/products/2020/8/091/g091C806BK-F.jpg',
  'speaker::kef lsx ii':
    'https://cdn.ispace.cz/files/photos/1600/7/76b29fae7225f7696374ec172a2758bd2e4a3059.webp',
  'tws::airpods pro 2':
    'https://www.climaxcomputer.com/wp-content/uploads/2024/10/airpods-pro-2-202409-gallery-4-scaled.webp',
  'tws::huawei freebuds pro 5':
    'https://consumer.huawei.com/dam/content/dam/huawei-cbg-site/ecommerce/tr/2026/february/FreeBuds-Pro-5/explore/unboxing/HUAWEI-FreeBuds-Pro-5-Unboxing-1752x1530.jpg',
  'tws::samsung galaxy buds 3 pro':
    'https://images.samsung.com/is/image/samsung/p6pim/mx/2407/gallery/mx-galaxy-buds3-pro-r630-sm-r630nzaamxo-542136034?$Q90_684_547_JPG$',
  'tws::sennheiser momentum true wireless 5':
    'https://cdn1.avstore.ro/qube/get/90w400h400/d1d0afa7fa46ea5a2b29bfbc59abd755',
  'tws::sony wf-1000xm5':
    'https://www.worldwidestereo.com/cdn/shop/files/179969_WWS17_1946x.jpg',
  'w.headphone::sennheiser momentum 4':
    'https://m.media-amazon.com/images/I/716++4xC2wL.SS700.jpg',
  'w.headphone::sony wh-1000xm5':
    'https://www.jbhifi.co.nz/cdn/shop/files/411410-Product-3-I-638917017043272857.jpg?v=1756111369',
  'w.headphone::sony wh-1000xm6':
    'https://sony.scene7.com/is/image/sonyglobalsolutions/WH1000XM6_WithSandstonecolour_M?$largeImageMobile$&fmt=png-alpha',
};

export function productImageKey(tabId: string, name: string): string {
  return `${tabId}::${name.toLowerCase().trim()}`;
}

/** Tempelkan foto kurasi ke item yang belum punya imageUrl. Tidak menimpa. */
export function applyProductImages(tabId: string, items: AudioItem[]): AudioItem[] {
  return items.map(item => {
    if (item.imageUrl) return item;
    const url = PRODUCT_IMAGES[productImageKey(tabId, item.name)];
    return url ? { ...item, imageUrl: url } : item;
  });
}
