✓ Compiled successfully in 2.7s
  Running TypeScript  ...Failed to type check.

./src/lib/admin/queries.ts:40:49
Type error: Cannot find name 'Product'.

  38 | }
  39 |
> 40 | export async function getAllProducts(): Promise<Product[]> {
     |                                                 ^
  41 |   const supabase = await createClient()
  42 |   
  43 |   let allData: ProductRow[] = []
Next.js build worker exited with code: 1 and signal: null
root@Hawking:/var/www/orange-msk# 