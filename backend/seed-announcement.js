require('dotenv').config();
const { supabase } = require('./config/db');

async function seedAnnouncements() {
    console.log('📢 Seeding announcement bar...');

    const announcements = [
        {
            text: 'Free shipping on all orders over ₹1999',
            link_url: '/collections/new-arrivals',
            background_color: '#000000',
            text_color: '#ffffff',
            is_active: true
        }
    ];

    // Clear existing
    await supabase.from('announcement_bars').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    for (const ann of announcements) {
        const { data, error } = await supabase
            .from('announcement_bars')
            .insert(ann)
            .select()
            .single();

        if (error) {
            console.error('Error seeding announcement:', error.message);
        } else {
            console.log('✅ Created announcement:', data.text);
        }
    }
}

seedAnnouncements()
    .then(() => process.exit(0))
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
