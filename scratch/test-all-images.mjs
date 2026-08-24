import fetch from 'node-fetch';

const items = [
  // Pizza
  { cat: 'pizza', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/02-pizza-margherita.webp' },
  { cat: 'pizza', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/06-pizza-ham-and-cheese.webp' },
  { cat: 'pizza', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/04-calzone.webp' },

  // Pasta
  { cat: 'pasta', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Garlic,%20Oil%20&%20Chili/01-spaghetti-aglio-e-olio.webp' },
  { cat: 'pasta', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Garlic,%20Oil%20&%20Chili/02-penne-aglio-e-olio.webp' },
  { cat: 'pasta', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/02-Pasta/Garlic,%20Oil%20&%20Chili/03-tagliatelle-aglio-e-olio.webp' },

  // Salad
  { cat: 'salad', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/04-Italian-Salads/01-egg-and-vegetable-salad.webp' },
  { cat: 'salad', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/04-Italian-Salads/03-chicken-salad.webp' },
  { cat: 'salad', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/04-Italian-Salads/04-tuna-and-egg-salad.webp' },

  // Sandwich & Burger
  { cat: 'burger', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/05-Pizza-Sandwiches/01-pizza-sandwich-parma-ham.webp' },
  { cat: 'burger', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/05-Pizza-Sandwiches/02-pizza-sandwich-salame.webp' },
  { cat: 'burger', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/06-Pizza-Burgers/03-beef-pizza-burger-with-french-fries.webp' },

  // French Fries
  { cat: 'fries', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/01-french-fries.webp' },
  { cat: 'fries', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/02-sausages-and-french-fries.webp' },
  { cat: 'fries', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/07-French-Fries/03-onion-rings-and-french-fries.webp' },

  // Desserts
  { cat: 'dessert', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/03-tiramisu.webp' },
  { cat: 'dessert', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/08-Desserts/01-affogato-al-caffe.webp' },
  { cat: 'dessert', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/01-Pizza/08-pizza-nutella.webp' },

  // Drinks
  { cat: 'drinks', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/01-caffe-espresso.webp' },
  { cat: 'drinks', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/10-Coffee-Shop/03-cappuccino.webp' },
  { cat: 'drinks', img: 'https://gjqevgkbjkharczhikcl.supabase.co/storage/v1/object/public/delivery_food/11-Fruit-Drinks/01-fruit-shakes-choice-of-fruit.webp' }
];

Promise.all(items.map(async item => {
  try {
    const res = await fetch(item.img);
    console.log(res.status === 200 ? 'OK' : `FAIL ${res.status}`, item.img.split('/').pop());
  } catch (e) {
    console.log('ERR', item.img.split('/').pop(), e.message);
  }
}));
