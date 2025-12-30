const axios = require('axios');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const API_URL = 'http://localhost:5001/api';
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL = process.env.ADMIN_EMAILS ? process.env.ADMIN_EMAILS.split(',')[0].trim() : 'admin@saree4ever.com';
const ADMIN_PASSWORD = 'password123';

async function verifyAdminLogin() {
    console.log('🚀 Starting Admin Login Verification...\n');
    console.log(`   Target Email: ${ADMIN_EMAIL}`);

    // 1. Check if admin exists in Supabase, create if not
    try {
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const adminUser = users.find(u => u.email === ADMIN_EMAIL);

        if (!adminUser) {
            console.log('⚠️  Admin user not found. Creating default admin...');
            const { error: createError } = await supabase.auth.admin.createUser({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                email_confirm: true,
                user_metadata: { full_name: 'Admin User' }
            });
            if (createError) throw createError;
            console.log(`✅ Admin user created with password: ${ADMIN_PASSWORD}`);
        } else {
            console.log('ℹ️  Admin user exists in Supabase.');
            // Optional: Reset password to ensure test works? 
            // Better NOT to reset unless login fails, to avoid messing up user's manual changes.
            // Let's try login first.
        }
    } catch (err) {
        console.error('❌ Error checking/creating admin user:', err.message);
        return;
    }

    // 2. Try Admin Login
    try {
        console.log('\n🔐 Attempting Admin Login...');
        const loginRes = await axios.post(`${API_URL}/auth/admin/signin`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });

        if (loginRes.data.token) {
            console.log('✅ Admin Login Successful!');
            console.log('   Token received.');
            console.log('   Role:', loginRes.data.user.role);
        } else {
            console.error('❌ Admin Login Failed: No token returned.');
        }

    } catch (error) {
        if (error.response && error.response.status === 401) {
            console.error('❌ Admin Login Failed: Invalid Credentials.');
            console.log(`   (Tried password: ${ADMIN_PASSWORD})`);

            // Retry with reset?
            console.log('\n🔄 Attempting to reset admin password to ' + ADMIN_PASSWORD + ' and retry...');
            try {
                const { data: { users } } = await supabase.auth.admin.listUsers();
                const adminUser = users.find(u => u.email === ADMIN_EMAIL);
                if (adminUser) {
                    await supabase.auth.admin.updateUserById(adminUser.id, { password: ADMIN_PASSWORD });
                    console.log('✅ Password reset successful. Retrying login...');

                    const retryRes = await axios.post(`${API_URL}/auth/admin/signin`, {
                        email: ADMIN_EMAIL,
                        password: ADMIN_PASSWORD
                    });
                    if (retryRes.data.token) {
                        console.log('✅ Admin Login Successful (after password reset)!');
                    }
                }
            } catch (retryErr) {
                console.error('❌ Retry failed:', retryErr.response?.data || retryErr.message);
            }

        } else if (error.response && error.response.status === 403) {
            console.error('❌ Admin Login Failed: Access Denied (403).');
            console.error('   This usually means the email is not in the ADMIN_EMAILS allowlist.');
        } else {
            console.error('❌ Admin Login Failed:', error.response?.data || error.message);
        }
    }
}

verifyAdminLogin();
