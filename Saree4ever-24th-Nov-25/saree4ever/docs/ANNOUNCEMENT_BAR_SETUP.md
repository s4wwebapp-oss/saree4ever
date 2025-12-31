# Announcement Bar Management

## Overview

The announcement bar is a customizable top banner that appears on all pages. Admins can edit the text, add clickable links, and control which page opens when users click on it.

## Features

- **Editable Text**: Change the announcement message from admin panel
- **Clickable Links**: Add URLs that open when users click the announcement
- **Link Target Control**: Choose whether links open in same window or new tab
- **Active/Inactive Toggle**: Enable or disable announcements
- **Multiple Announcements**: Create multiple announcements and switch between them
- **Display Order**: Control the order of announcements (if multiple are active)

## Database Migration

Run the migration to create the announcement bar table:

```sql
-- Run: backend/migrations/create_announcement_bar_table.sql
```

This creates:
- `announcement_bar` table with all necessary columns
- Indexes for performance
- Row Level Security policies
- Default announcement: "NEW STORE NOW OPEN | VISIT OUR SHOWROOM"

## Admin Access

1. Log in as admin
2. Navigate to `/admin/announcement`
3. You'll see:
   - List of all announcements
   - Create/Edit form
   - Active/Inactive toggle
   - Preview of active announcement

## Creating an Announcement

1. Click "+ New Announcement"
2. Fill in the form:
   - **Text**: The announcement message (e.g., "NEW STORE NOW OPEN | VISIT OUR SHOWROOM")
   - **Link URL** (optional): 
     - Relative path: `/contact`, `/about`, `/collections/new-arrivals`
     - Full URL: `https://example.com`
     - Leave empty if announcement should not be clickable
   - **Link Target**: 
     - `_self`: Opens in same window (default)
     - `_blank`: Opens in new tab
   - **Display Order**: Lower numbers appear first (default: 0)
   - **Active**: Check to activate (will deactivate others)
3. Click "Create"

## Editing an Announcement

1. Click "Edit" next to any announcement
2. Modify the fields
3. Click "Update"

## Activating/Deactivating

- Click the status badge (Active/Inactive) to toggle
- Only one announcement can be active at a time
- When you activate one, others are automatically deactivated

## Link Examples

### Internal Pages
- `/contact` - Contact page
- `/about` - About page
- `/collections/new-arrivals` - New arrivals collection
- `/stories` - Stories/Blog page
- `/offers` - Offers page

### External Links
- `https://www.instagram.com/saree4ever` - Instagram profile
- `https://www.facebook.com/saree4ever` - Facebook page

### No Link
- Leave "Link URL" empty to make announcement non-clickable

## API Endpoints

### Public
- `GET /api/announcement/active` - Get active announcement

### Admin (requires authentication)
- `GET /api/announcement` - Get all announcements
- `GET /api/announcement/:id` - Get announcement by ID
- `POST /api/announcement` - Create announcement
- `PUT /api/announcement/:id` - Update announcement
- `DELETE /api/announcement/:id` - Delete announcement

## Frontend Integration

The Header component automatically:
- Fetches the active announcement on page load
- Displays it in the top black bar
- Makes it clickable if a link is provided
- Hides the bar if no active announcement exists

## Best Practices

1. **Keep it Short**: Announcement text should be concise and scannable
2. **Use Uppercase**: Uppercase text works well for announcements
3. **Clear Call-to-Action**: Make it clear what users should do
4. **Test Links**: Always test links after creating/editing
5. **One at a Time**: Only keep one announcement active at a time
6. **Update Regularly**: Change announcements for promotions, events, etc.

## Troubleshooting

### Announcement Not Showing
- Check if announcement is marked as "Active"
- Verify database migration ran successfully
- Check browser console for errors
- Ensure backend server is running

### Link Not Working
- Verify link URL is correct
- Check if it's a relative path (starts with `/`) or full URL
- Test the link in a new tab
- Check browser console for errors

### Cannot Edit Announcement
- Ensure you're logged in as admin
- Check backend server is running
- Verify database connection

## Example Announcements

### Store Opening
```
Text: NEW STORE NOW OPEN | VISIT OUR SHOWROOM
Link: /contact
Target: _self
```

### Sale/Promotion
```
Text: SUMMER SALE | UP TO 50% OFF | SHOP NOW
Link: /offers
Target: _self
```

### Social Media
```
Text: FOLLOW US ON INSTAGRAM @SAREE4EVER
Link: https://www.instagram.com/saree4ever
Target: _blank
```

### No Link
```
Text: FREE SHIPPING WORLDWIDE | COMPLIMENTARY FALLS & PICO
Link: (empty)
Target: _self
```


