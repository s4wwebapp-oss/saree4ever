require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function createAdminUser() {
    const email = 'admin@saree4ever.com';
    const password = 'admin123'; // Matches what user was trying

    console.log(`Creating/Updating admin user: ${email}`);

    // 1. Check if user exists (by trying to sign in, or list users if we had admin api enabled, but sign up is easier)
    // Actually, using service role we can list users or admin.createUser

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    const existingUser = users?.find(u => u.email === email);

    if (existingUser) {
        console.log('User already exists. Updating password...');
        const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: password, user_metadata: { role: 'admin' }, email_confirm: true }
        );
        if (updateError) console.error('Error updating password:', updateError);
        else console.log('Password updated successfully.');
    } else {
        console.log('Creating new admin user...');
        const { data, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { role: 'admin' }
        });
        if (createError) console.error('Error creating user:', createError);
        else console.log('Admin user created successfully.');
    }
}

createAdminUser();
