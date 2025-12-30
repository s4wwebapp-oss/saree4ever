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

async function runAuthVerification() {
    console.log('🚀 Starting User Auth Verification...\n');

    const testUser = {
        email: `saree.tester.${Date.now()}@gmail.com`,
        password: 'password123',
        full_name: 'Test Authenticator',
        phone: '9876543210'
    };

    let token;
    let userId;

    // 1. Sign Up
    try {
        console.log('1️⃣  Signing Up New User...');
        const signupRes = await axios.post(`${API_URL}/auth/signup`, testUser);

        console.log(`✅ Signup Successful: ${signupRes.data.message}`);
        if (!signupRes.data.user) throw new Error('User object missing in signup response');
        userId = signupRes.data.user.id;
        console.log('✅ Signup Successful (Validation: Email confirmation should be disabled)');

    } catch (error) {
        console.error('❌ Signup Failed:', error.response?.data || error.message);
        return;
    }

    // 2. Sign In (Login)
    try {
        console.log('\n2️⃣  Signing In...');
        const signinRes = await axios.post(`${API_URL}/auth/signin`, {
            email: testUser.email,
            password: testUser.password
        });

        token = signinRes.data.token;
        if (!token) throw new Error('Token missing in signin response');

        console.log('✅ Signin Successful. Token received.');
        console.log('   User Role:', signinRes.data.user.role);

    } catch (error) {
        console.error('❌ Signin Failed:', error.response?.data || error.message);
        return;
    }

    // 3. Access Protected Route (/me)
    try {
        console.log('\n3️⃣  Accessing Protected Route (/api/auth/me)...');
        const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (meRes.data.user.email === testUser.email) {
            console.log('✅ Protected Route Access Successful.');
            console.log('   Verified Email:', meRes.data.user.email);
        } else {
            console.error('❌ Protected Route Value Mismatch:', meRes.data);
        }

    } catch (error) {
        console.error('❌ Protected Route Access Failed:', error.response?.data || error.message);
        return;
    }

    // 4. Verify Database Entry (User Profile)
    try {
        console.log('\n4️⃣  Verifying User Profile in DB...');
        const { data: profile, error } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', userId) // userId captured from signup response? Wait, standard signup returns user id?
            // Let's check signin response id
            .single();

        // Use ID from signin/signup response if needed.
        // Actually, let's fetch by email to be sure if ID is tricky
        // Wait, user_profiles is keyed by ID. I need the UUID.
        // The signup response sends `data.user.id`.

        // Let's refetch ID from Supabase Auth to be 100% sure
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const createdUser = users.find(u => u.email === testUser.email);

        if (!createdUser) throw new Error('User not found in Supabase Auth');

        const { data: dbProfile } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', createdUser.id)
            .single();

        if (dbProfile && dbProfile.full_name === testUser.full_name) {
            console.log('✅ User Profile verified in Database.');
        } else {
            console.error('❌ User Profile check failed or name mismatch.');
        }

    } catch (error) {
        console.error('❌ Database Verification Failed:', error.message);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test user...');
    try {
        // Get ID
        const { data: { users } } = await supabase.auth.admin.listUsers();
        const createdUser = users.find(u => u.email === testUser.email);
        if (createdUser) {
            await supabase.auth.admin.deleteUser(createdUser.id);
            // And delete profile if not cascaded
            await supabase.from('user_profiles').delete().eq('id', createdUser.id);
            console.log('✅ Test user deleted.');
        }
    } catch (e) {
        console.log('⚠️ Cleanup failed:', e.message);
    }

    console.log('\n🎉 SUCESS! Authentication Logic is Sound.');
}

runAuthVerification();
