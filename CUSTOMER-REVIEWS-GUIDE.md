# Customer Reviews Management Guide

## Overview

The Customer Reviews section displays testimonials on your homepage with beautiful Google-style review cards. You can now easily manage these reviews through the admin panel.

## Accessing the Reviews Admin

1. Go to **Admin** → **Reviews** (⭐ icon in sidebar)
2. Or navigate directly to: `/admin/reviews`

---

## Features

### What You Can Do:

✅ **Add new customer reviews**
✅ **Edit existing reviews**
✅ **Delete reviews**
✅ **Control visibility** (active/inactive)
✅ **Set display order** (which reviews appear first)
✅ **Add customer photos**
✅ **Set star ratings** (1-5 stars)

---

## Adding a New Review

### Step 1: Click "Add Review" Button

Click the "+ Add Review" button in the top right corner.

### Step 2: Fill in the Review Details

**Required Fields:**
- **Customer Name**: The reviewer's name (e.g., "Priya Sharma")
- **Review Content**: The actual review text
- **Rating**: 1-5 stars (default is 5 stars)

**Optional Fields:**
- **Customer Role**: Title or description (e.g., "Wedding Bride", "Regular Customer")
- **Customer Image URL**: Photo of the reviewer
- **Display Order**: Lower numbers appear first (default: 0)
- **Status**: Toggle "Active" to show/hide on website

### Step 3: Save the Review

Click "Add Review" to save. The review will appear on your homepage if marked as active.

---

## How Customer Photos Work

### Option 1: Upload to Supabase Storage

1. Go to your Supabase project
2. Navigate to **Storage** → **product-images** bucket
3. Upload the customer photo
4. Click on the uploaded file and copy the **Public URL**
5. Paste the URL in the "Customer Image URL" field

### Option 2: Use External Image URL

- Upload the image to any image hosting service
- Copy the direct image URL
- Paste it in the "Customer Image URL" field

### No Photo?

If you don't provide a photo, the system automatically shows the customer's first initial in a colored circle (e.g., "P" for Priya).

---

## Display Order

Reviews are sorted by the **Display Order** number:

- **Lower numbers appear first**
- **0** = First position
- **1** = Second position
- **2** = Third position, etc.

Example:
```
Display Order: 0 → Shows first
Display Order: 1 → Shows second
Display Order: 5 → Shows after 0-4
```

---

## Active vs Inactive Reviews

### Active Reviews (Visible on Website)
- Checkbox is ✅ checked
- Green "● Active" badge
- Appears on homepage

### Inactive Reviews (Hidden)
- Checkbox is ☐ unchecked
- Gray "○ Inactive" badge
- Saved but not visible to customers
- Useful for:
  - Reviews pending approval
  - Seasonal reviews
  - A/B testing different reviews

---

## Tips for Great Reviews

### ✅ Best Practices:

1. **Be Specific**: Mention product names or specific details
   - ❌ "Great product"
   - ✅ "The Kanjivaram silk saree quality exceeded my expectations"

2. **Keep It Authentic**: Real reviews build trust
   - Use actual customer feedback
   - Include minor critiques if appropriate

3. **Vary the Content**: Don't make all reviews sound the same
   - Mix short and long reviews
   - Different occasions (wedding, festival, casual)
   - Different product types

4. **Use Customer Photos**: Reviews with photos get 3x more engagement
   - Ask customers for permission first
   - Use high-quality, professional photos

5. **Optimal Number**: Show 6-12 active reviews
   - Too few = not enough social proof
   - Too many = overwhelming

### 📝 Example Good Reviews:

```
Name: Anjali Mehta
Role: Wedding Bride
Rating: ⭐⭐⭐⭐⭐
Content: "I ordered my wedding saree from Saree4ever and it was absolutely stunning!
The Kanjivaram silk quality was exceptional, and the zari work was intricate.
Delivery was on time, and customer service was very responsive. Highly recommend!"
```

```
Name: Deepa Kumar
Role: Regular Customer
Rating: ⭐⭐⭐⭐⭐
Content: "Have been shopping here for 2 years now. Their cotton handloom sarees
are perfect for daily wear - comfortable, breathable, and affordable. Great collection!"
```

---

## Where Reviews Appear

Your reviews are displayed on the **Homepage** in two sections:

### 1. Testimonials Section (Classic Style)
- 4-column grid layout
- White background
- Located after featured products

### 2. Customer Reviews Section (Google Style)
- 3-column grid with cards
- Profile pictures
- Star ratings
- "See what our customers are saying about their experience with Saree4ever"

Both sections use the same review data, so when you add a review, it appears in both places!

---

## Editing Reviews

1. Find the review card
2. Click the **"Edit"** button
3. Make your changes
4. Click **"Update Review"**

---

## Deleting Reviews

1. Find the review card
2. Click the **"Delete"** button
3. Confirm the deletion
4. Review is permanently removed

⚠️ **Warning:** Deletion is permanent and cannot be undone!

---

## Quick Actions

### Hide All Reviews Temporarily
Set all reviews to "Inactive" to hide the entire reviews section.

### Change Review Order
Edit the "Display Order" number to reorder reviews without deleting/recreating.

### Seasonal Rotation
- Keep all reviews in the system
- Mark seasonal reviews as "Active" during appropriate times
- Mark as "Inactive" when not relevant

---

## Troubleshooting

### Reviews Not Showing on Homepage?

**Check:**
1. Is the review marked as "Active"? ✅
2. Are there any active reviews at all?
3. Is the Reviews section enabled in Page Sections admin?
4. Clear your browser cache and refresh

### Customer Photo Not Displaying?

**Check:**
1. Is the image URL valid and accessible?
2. Is it a direct link to an image file (ends in .jpg, .png, etc.)?
3. Is the image publicly accessible (not requiring login)?
4. Try opening the URL in a new browser tab

### Can't Delete a Review?

**Check:**
1. Are you logged in as admin?
2. Do you have admin permissions?
3. Check browser console for errors

---

## Database Structure

For developers, reviews are stored in the `testimonials` table with:

```sql
id              UUID (auto-generated)
customer_name   VARCHAR (required)
customer_role   VARCHAR (optional)
content         TEXT (required)
rating          INTEGER (1-5, default 5)
image_url       TEXT (optional)
is_active       BOOLEAN (default true)
display_order   INTEGER (default 0)
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

---

## API Endpoints

The admin panel uses these API endpoints:

- `GET /api/testimonials` - Get all reviews
- `GET /api/testimonials/active` - Get only active reviews (public)
- `POST /api/testimonials` - Create new review (admin only)
- `PUT /api/testimonials/:id` - Update review (admin only)
- `DELETE /api/testimonials/:id` - Delete review (admin only)

---

## Next Steps

1. **Add your first review** using the admin panel
2. **Test the display** by visiting your homepage
3. **Collect real customer reviews** via email or order follow-ups
4. **Rotate reviews seasonally** to keep content fresh

---

## Need Help?

- Check the **Admin → Help** section for more guides
- Contact support if you encounter issues
- Review the troubleshooting section above

Happy managing! ⭐
