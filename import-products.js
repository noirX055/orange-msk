const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

// --- Config ---
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://db.orangemsk.ru';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || process.argv[3] || '';
const EXCEL_PATH = process.argv[2] || 'список товаров.xlsx';

if (!SUPABASE_KEY) {
  console.error('Usage: node import-products.js "список товаров.xlsx" SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Известные бренды (level 1 в иерархии)
const KNOWN_BRANDS = new Set([
  'Apple', 'Samsung', 'Xiaomi', 'Dyson', 'Google',
  'HONOR', 'Huawei', 'OnePlus', 'Poco'
]);

// Пропускаем
const SKIP_GROUPS = new Set(['Услуги', 'Цифровые товары']);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[ёЁ]/g, 'e')
    .replace(/[а-яА-Я]/g, c => {
      const map = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ж':'zh','з':'z',
        'и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p',
        'р':'r','с':'s','т':'t','у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch',
        'ш':'sh','щ':'shch','ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya'
      };
      return map[c.toLowerCase()] || c;
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 120);
}

function makeUniqueSlug(base, existing) {
  let slug = base;
  let i = 2;
  while (existing.has(slug)) {
    slug = `${base}-${i}`;
    i++;
  }
  existing.add(slug);
  return slug;
}

async function main() {
  console.log(`Reading ${EXCEL_PATH}...`);
  const wb = XLSX.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws);
  console.log(`Total rows: ${rows.length}`);

  // Filter out skipped groups
  const filtered = rows.filter(row => {
    const group = (row['Группы'] || '').trim();
    if (!group) return false;
    const level1 = group.split('/')[0];
    return !SKIP_GROUPS.has(level1);
  });
  console.log(`After filtering: ${filtered.length} products`);

  // --- Step 1: Extract brands ---
  const brandNames = new Set();
  filtered.forEach(row => {
    const level1 = (row['Группы'] || '').split('/')[0];
    if (KNOWN_BRANDS.has(level1)) brandNames.add(level1);
  });

  console.log(`\nInserting ${brandNames.size} brands...`);
  const brandMap = {}; // name -> id

  for (const name of [...brandNames].sort()) {
    const slug = slugify(name);
    const { data, error } = await supabase
      .from('brands')
      .upsert({ name, slug }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`Brand error (${name}):`, error.message);
      continue;
    }
    brandMap[name] = data.id;
    console.log(`  ✓ ${name} (id: ${data.id})`);
  }

  // --- Step 2: Extract categories ---
  const categorySet = new Map(); // slug -> { name, parentSlug }
  
  filtered.forEach(row => {
    const parts = (row['Группы'] || '').split('/');
    const isBrand = KNOWN_BRANDS.has(parts[0]);
    
    // For brands: category starts at index 1
    // For generic: category starts at index 0
    const catParts = isBrand ? parts.slice(1) : parts;
    
    if (catParts.length === 0) return;

    // Only use first 2 levels for categories
    const topName = catParts[0];
    const topSlug = slugify(topName);
    if (!categorySet.has(topSlug)) {
      categorySet.set(topSlug, { name: topName, parentSlug: null });
    }

    if (catParts.length >= 2) {
      const subName = catParts[1];
      const subSlug = slugify(`${topName}-${subName}`);
      if (!categorySet.has(subSlug)) {
        categorySet.set(subSlug, { name: subName, parentSlug: topSlug });
      }
    }
  });

  console.log(`\nInserting ${categorySet.size} categories...`);
  const categoryMap = {}; // slug -> id

  // Insert top-level first
  for (const [slug, { name, parentSlug }] of categorySet) {
    if (parentSlug) continue;
    const { data, error } = await supabase
      .from('categories')
      .upsert({ name, slug, parent_id: null }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`Category error (${name}):`, error.message);
      continue;
    }
    categoryMap[slug] = data.id;
  }

  // Insert sub-categories
  for (const [slug, { name, parentSlug }] of categorySet) {
    if (!parentSlug) continue;
    const parentId = categoryMap[parentSlug] || null;
    const { data, error } = await supabase
      .from('categories')
      .upsert({ name, slug, parent_id: parentId }, { onConflict: 'slug' })
      .select('id')
      .single();

    if (error) {
      console.error(`Subcategory error (${name}):`, error.message);
      continue;
    }
    categoryMap[slug] = data.id;
  }
  console.log(`  ✓ ${Object.keys(categoryMap).length} categories inserted`);

  // --- Step 3: Insert products in batches ---
  console.log(`\nPreparing ${filtered.length} products...`);
  const slugSet = new Set();
  const products = [];

  for (const row of filtered) {
    const parts = (row['Группы'] || '').split('/');
    const isBrand = KNOWN_BRANDS.has(parts[0]);
    
    const brandName = isBrand ? parts[0] : null;
    const brandId = brandName ? (brandMap[brandName] || null) : null;

    // Determine category
    const catParts = isBrand ? parts.slice(1) : parts;
    let categoryId = null;
    if (catParts.length >= 2) {
      const subSlug = slugify(`${catParts[0]}-${catParts[1]}`);
      categoryId = categoryMap[subSlug] || null;
    }
    if (!categoryId && catParts.length >= 1) {
      const topSlug = slugify(catParts[0]);
      categoryId = categoryMap[topSlug] || null;
    }

    const name = (row['Наименование'] || '').trim();
    const code = String(row['Код'] || '').trim();
    const sku = (row['Артикул'] || '').trim() || null;
    
    if (!name || !code) continue;

    const baseSlug = slugify(name);
    const slug = makeUniqueSlug(baseSlug, slugSet);

    products.push({
      code,
      sku,
      name,
      slug,
      brand_id: brandId,
      category_id: categoryId,
      group_path: row['Группы'] || '',
      price: 0,
      in_stock: true,
      is_visible: false,
      is_traceable: (row['Прослеживаемый'] || '').toLowerCase() === 'да',
    });
  }

  // Batch insert (500 at a time)
  const BATCH = 500;
  let inserted = 0;
  let errors = 0;

  for (let i = 0; i < products.length; i += BATCH) {
    const batch = products.slice(i, i + BATCH);
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'code' });
    
    if (error) {
      console.error(`Batch ${i}-${i + batch.length} error:`, error.message);
      errors += batch.length;
    } else {
      inserted += batch.length;
      process.stdout.write(`  Inserted: ${inserted}/${products.length}\r`);
    }
  }

  console.log(`\n\n=== DONE ===`);
  console.log(`Brands:     ${Object.keys(brandMap).length}`);
  console.log(`Categories: ${Object.keys(categoryMap).length}`);
  console.log(`Products:   ${inserted} inserted, ${errors} errors`);
  console.log(`\nВсе товары добавлены с is_visible=false и price=0.`);
  console.log(`Выставьте цены через админку, затем включите видимость.`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
