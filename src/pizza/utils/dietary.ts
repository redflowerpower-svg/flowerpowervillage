import type { MenuItem } from '../data/menuData';

export type DietaryType = 'vegan' | 'veggie' | null;

/**
 * Deterministic and exhaustive culinary classification for all menu items:
 * - 'vegan': 100% plant-based, zero animal ingredients (no meat, fish, dairy, eggs, honey).
 * - 'veggie': Vegetarian (no meat or fish, but contains or permits dairy, cheese, eggs).
 * - null: Regular / Omnivore (contains pork, beef, chicken, fish, seafood) or non-food.
 */
export function getDietaryType(item?: MenuItem | null, categoryId: string = ''): DietaryType {
  if (!item) return null;

  const id = (item.id || '').toLowerCase().trim();
  const name = (item.name || '').toLowerCase().trim();
  const desc = ((item.description || '') + ' ' + (item.descriptionIt || '') + ' ' + (item.descriptionTh || '') + ' ' + (item.descriptionDe || '')).toLowerCase();
  const cat = (categoryId || (item as any).category || '').toLowerCase().trim();

  // 1. NON-FOOD / BEVERAGES (No dietary filter / watermark needed for soft drinks, beers, wines)
  if (
    cat === 'wines' || cat === 'beers' || cat === 'soft-drinks' ||
    id.startsWith('wine-') || id.startsWith('beer-') || id.startsWith('chang-') ||
    id.startsWith('leo-') || id.startsWith('singha-') || id.includes('drinking-water') ||
    id.includes('soda-water') || id.includes('soft-drink')
  ) {
    return null;
  }

  // 2. MEAT & FISH CHECK (Definite ONNIVORO / Regular)
  // Check for presence of meat, poultry, pork, cured meats, fish, tuna, seafood
  const meatKeywords = [
    'ham', 'prosciutto', 'salsiccia', 'sausage', 'salame', 'salami', 
    'pepperoni', 'wurstel', 'würstel', 'frankfurter', 'bacon', 'pancetta', 'speck', 
    'mortadella', 'spianata', 'pork', 'maiale', 'chicken', 'pollo', 'beef', 
    'manzo', 'meat', 'carne', 'ragu', 'ragù', 'bolognese', 'amatriciana',
    'carbonara', 'tuna', 'tonno', 'anchov', 'acciughe', 'alice', 'alici', 
    'fish', 'pesce', 'seafood', 'shrimp', 'gamber', 'calamari', 'frutti di mare',
    'หมู', 'ไก่', 'เนื้อ', 'เบคอน', 'แฮม', 'ไส้กรอก', 'ทูน่า', 'ปลา', 'กุ้ง', 'ซีฟู้ด',
    'schinken', 'rind', 'huhn', 'hähnchen', 'thunfisch',
    'ဝက်သား', 'အမဲသား', 'ကြက်သား', 'ငါး', 'ပုစွန်', 'ဘေကွန်', 'ဆာလာမီ', 'ဝက်အူချောင်း'
  ];

  // Specific check: Baked Pesto Lasagna has NO meat, whereas Bolognese & Seafood have meat/fish
  const isPestoLasagna = id.includes('baked-pesto-lasagna') || name.includes('pesto lasagna');
  
  if (!isPestoLasagna) {
    if (meatKeywords.some(w => id.includes(w) || name.includes(w) || desc.includes(w))) {
      return null;
    }
  }

  // 3. 100% VEGAN ITEMS LIST
  
  // Specific Vegan Pizzas
  if (id.includes('marinara') || id.includes('mushrooms-and-tofu-vegan') || id.includes('sweet-bell-pepper-vegan') || name.includes('vegan')) {
    return 'vegan';
  }

  // French Fries & Onion Rings (pure fries without meat/nuggets)
  if (id === 'french-fries' || id === 'onion-rings-and-french-fries' || id === 'french-fries-onion-rings') {
    return 'vegan';
  }

  // Vegan Semolina Pastas (Spaghetti / Penne with Aglio & Olio or Pomodoro)
  if ((id.startsWith('spaghetti-') || id.startsWith('penne-')) && (id.includes('aglio-e-olio') || id.includes('pomodoro'))) {
    return 'vegan';
  }

  // Fruit Salad
  if (id.includes('fruit-salad') || name.includes('fruit salad')) {
    return 'vegan';
  }

  // Coffee & Teas (Pure Espresso, Americano, Pure Thai Teas / Herbal / Black / Green Teas)
  if (
    id.includes('caffè-espresso') || id.includes('caffe-espresso') || 
    id.includes('americano') || 
    id.includes('red-thai-tea') || id.includes('green-thai-tea') ||
    id.includes('tea') || id.includes('tè')
  ) {
    // Exclude milk/cream based coffees like cappuccino, latte macchiato, marocchino, milk and honey
    if (!id.includes('cappuccino') && !id.includes('latte') && !id.includes('marocchino') && !id.includes('milk') && !id.includes('affogato')) {
      return 'vegan';
    }
  }

  // Fruit Shakes (100% fresh crushed fruit + water/ice - Vegan)
  if (id.includes('fruit-shakes') && !id.includes('smoothie')) {
    return 'vegan';
  }

  // 4. VEGETARIAN (VEGGIE) ITEMS LIST (Contain or permit cheese, dairy, milk, eggs, butter)

  // Vegetarian Pizzas with Mozzarella / Cheese / Nutella / Egg
  if (cat === 'traditional-italian-pizza' || id.startsWith('pizza-') || id === 'calzone') {
    return 'veggie';
  }

  // Vegetarian Pasta (4 Formaggi, Pesto, Tagliatelle/Gnocchi/Ravioli with Pomodoro or Aglio e Olio, Baked Pesto Lasagna)
  if (cat === 'pasta' || isPestoLasagna) {
    return 'veggie';
  }

  // Vegetarian Italian Salads (Egg and Vegetable Salad)
  if (cat === 'italian-salads') {
    return 'veggie';
  }

  // Desserts (Cakes, Tiramisu, Crepes, Pancakes, Affogato)
  if (cat === 'desserts' || id.includes('affogato') || id.includes('tiramisu') || id.includes('pancake') || id.includes('crepe')) {
    return 'veggie';
  }

  // Breakfast (Italian Breakfast with cappuccino/cake, Butter & Jam, Nutella Bread, French Toast, Pastries)
  if (cat === 'breakfast-and-snacks') {
    return 'veggie';
  }

  // Dairy/Milk Drinks (Smoothies with milk, Cappuccino, Latte Macchiato, Marocchino, Hot Chocolate, Milk & Honey, Lassis with yogurt, Frappés with milk/ice-cream)
  if (
    cat === 'coffee-shop' || cat === 'fruit-drinks' ||
    id.includes('smoothie') || id.includes('cappuccino') || id.includes('latte') || id.includes('marocchino') || 
    id.includes('chocolate') || id.includes('milk') || id.includes('lassi') || id.includes('frapp')
  ) {
    return 'veggie';
  }

  return 'veggie';
}
