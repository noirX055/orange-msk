const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://db.orangemsk.ru',
  process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic2VydmljZV9yb2xlIiwiaXNzIjoic3VwYWJhc2UiLCJpYXQiOjE3ODY5ODQ2ODcsImV4cCI6MjEwMjM0NDY4N30.4x2QUV8grWzw0mS0N505Ebbk8fv4LKNKVMQgdlPpeyE'
);

// Known brands mapping identical to import script
const KNOWN_BRANDS = new Set(['Apple', 'Samsung', 'Xiaomi', 'Dyson', 'Sony', 'GoPro', 'Marshall', 'JBL']);

async function main() {
  console.log("Fetching all products...");
  
  let allProducts = [];
  let from = 0;
  let to = 999;
  let hasMore = true;

  while (hasMore) {
    const { data: products, error: pError } = await supabase
      .from('products')
      .select('id, brand, category, group_path')
      .not('group_path', 'is', null)
      .not('group_path', 'eq', '')
      .range(from, to);

    if (pError) throw pError;
    if (products && products.length > 0) {
      allProducts = allProducts.concat(products);
      from += 1000;
      to += 1000;
      if (products.length < 1000) hasMore = false;
    } else {
      hasMore = false;
    }
  }
  
  console.log(`Found ${allProducts.length} products with a group_path.`);

  const { data: brands, error: bError } = await supabase.from('brands').select('id, name');
  if (bError) throw bError;

  const brandMap = new Map(brands.map(b => [b.name, b.id]));
  const uniqueGroups = new Map();
  const productUpdates = [];

  for (const p of allProducts) {
    const parts = (p.group_path || '').split('/');
    if (parts.length < 3) continue;

    const isBrand = KNOWN_BRANDS.has(parts[0]);
    const catParts = isBrand ? parts.slice(1) : parts;

    let seriesName = null;
    if (catParts.length >= 3) {
      seriesName = catParts[2];
    } else if (!isBrand && catParts.length >= 2) {
      seriesName = catParts[1];
    }

    if (!seriesName) continue;

    const brandId = brandMap.get(p.brand);
    if (!brandId) continue;

    const key = `${brandId}_${p.category}_${seriesName}`;
    if (!uniqueGroups.has(key)) {
      uniqueGroups.set(key, {
        name: seriesName,
        brand_id: brandId,
        category_slug: p.category
      });
    }

    productUpdates.push({
      id: p.id,
      series: seriesName
    });
  }

  const groupsToInsert = Array.from(uniqueGroups.values());
  console.log(`Found ${groupsToInsert.length} unique groups to insert.`);

  if (groupsToInsert.length > 0) {
    const { error: insertError } = await supabase
      .from('product_groups')
      .upsert(groupsToInsert, { onConflict: 'name,brand_id,category_slug' });

    if (insertError) throw insertError;
    console.log("Groups inserted!");
  } else {
    console.log("No new groups to insert.");
  }

  console.log(`Updating ${productUpdates.length} products with series name...`);
  let updated = 0;
  for (const update of productUpdates) {
    const { error } = await supabase.from('products').update({ series: update.series }).eq('id', update.id);
    if (error) console.error(`Update error for id ${update.id}:`, error.message);
    else updated++;
    if (updated % 500 === 0) console.log(`  Updated ${updated}...`);
  }

  console.log("Migration complete!");
}

main().catch(console.error);
