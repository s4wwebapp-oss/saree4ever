require('dotenv').config();
const { supabase } = require('./config/db');

async function seedLandingPageContent() {
  console.log('Seeding landing page content with appropriate images...');

  // 1. Seed Categories with appropriate images
  const categories = [
    { 
      name: 'Blouses', 
      slug: 'blouses', 
      description: 'Designer readymade blouses perfectly stitched for your sarees',
      image_url: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&q=80',
      is_active: true,
      display_order: 1
    },
    { 
      name: 'Jewels', 
      slug: 'jewels', 
      description: 'Exquisite Indian jewelry to complement your ethnic look',
      image_url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80',
      is_active: true,
      display_order: 2
    },
    { 
      name: 'New Arrivals', 
      slug: 'new-arrivals', 
      description: 'Latest collection of sarees and ethnic wear',
      image_url: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80',
      is_active: true,
      display_order: 3
    },
    { 
      name: 'Hot deals', 
      slug: 'hot-deals', 
      description: 'Best offers and discounts on your favorite sarees',
      image_url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80',
      is_active: true,
      display_order: 4
    },
    { 
      name: 'Silk Sarees', 
      slug: 'silk', 
      description: 'Traditional and modern Silk sarees',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&q=80',
      is_active: true,
      display_order: 5
    },
    { 
      name: 'Cotton Sarees', 
      slug: 'cotton', 
      description: 'Breathable and comfortable cotton sarees',
      image_url: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&q=80',
      is_active: true,
      display_order: 6
    }
  ];

  for (const cat of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'slug' });
    
    if (error) console.error(`Error seeding category ${cat.name}:`, error.message);
    else console.log(`✓ Category: ${cat.name}`);
  }

  // 2. Seed Hero Slides
  const heroSlides = [
    {
      title: 'Ethereal Silk Collection',
      subtitle: 'Handwoven masterpieces for the modern woman',
      image_url: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1600&q=80',
      button_text: 'Shop Collection',
      button_link: '/products?category=silk',
      is_active: true,
      display_order: 1
    },
    {
      title: 'Festive Jewels',
      subtitle: 'Complete your look with our handcrafted jewelry',
      image_url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1600&q=80',
      button_text: 'Explore Jewelry',
      button_link: '/products?category=jewels',
      is_active: true,
      display_order: 2
    }
  ];

  // Clear existing hero slides first to avoid duplicates since there's no unique constraint
  await supabase.from('hero_slides').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const slide of heroSlides) {
    const { error } = await supabase
      .from('hero_slides')
      .insert(slide);
    
    if (error) console.error(`Error seeding hero slide ${slide.title}:`, error.message);
    else console.log(`✓ Hero Slide: ${slide.title}`);
  }

  // 3. Seed Testimonials
  const testimonials = [
    {
      customer_name: 'Priya Sharma',
      content: 'The quality of the silk saree I ordered is exceptional. The colors are even more vibrant in person. Highly recommended!',
      rating: 5,
      image_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
      is_active: true
    },
    {
      customer_name: 'Anjali Desai',
      content: 'I love the collection here. Whether it\'s a heavy silk saree for a function or a light cotton one for office, Saree4ever never disappoints.',
      rating: 5,
      image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80',
      is_active: true
    }
  ];

  // Clear existing testimonials
  await supabase.from('testimonials').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  for (const t of testimonials) {
    const { error } = await supabase
      .from('testimonials')
      .insert(t);
    
    if (error) console.error(`Error seeding testimonial ${t.customer_name}:`, error.message);
    else console.log(`✓ Testimonial: ${t.customer_name}`);
  }

  console.log('\nSeeding complete!');
}

seedLandingPageContent()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
