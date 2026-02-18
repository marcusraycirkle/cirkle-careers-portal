# Candidate Announcement Broadcasting Feature

## Overview
This feature allows employers to broadcast announcements to all pending candidates assigned to them. The announcement is sent via Discord DM to each candidate and logged to a specified Discord channel (1473734843618558006).

## Components Implemented

### 1. **Frontend UI** (`script.js`)
- **Button in Candidates Tab**: A purple "📢 Broadcast Announcement" button has been added to the candidate management section
- **Modal Dialog**: When clicked, opens a modal with:
  - Title input field
  - Message textarea
  - Real-time preview of the announcement
  - Publish button

### 2. **Frontend Functions** (`script.js`)
- `openAnnouncementModal()` - Opens the announcement modal dialog
- `broadcastAnnouncement()` - Handles the submission and API call
- `logAnnouncementToChannel()` - Logs the announcement to Discord

### 3. **Bot Integration** (`bot-sentinel.js`)
- `broadcastAnnouncement()` - New function that:
  - Sends DMs to all candidates with the announcement
  - Logs success/failure for each candidate
  - Posts a comprehensive log to the channel (1473734843618558006)
  - Tracks delivery statistics

### 4. **Backend API** (`backend-api.js`)
- `broadcastAnnouncement()` - Helper function to call the API endpoint

## How It Works

1. **User clicks the "Broadcast Announcement" button** in the Candidates tab
2. **Modal opens** where the user can:
   - Enter announcement title
   - Enter announcement message
   - See a live preview of how it will appear
3. **User clicks "Publish to Pending Candidates"**
4. **System processes**:
   - Validates inputs
   - Filters all pending candidates assigned to the current user
   - Makes API call to `/api/broadcast-announcement` with candidate data
5. **Backend/Bot processes**:
   - Sends Discord DM to each candidate with the announcement
   - Logs failures for candidates without Discord ID or failed deliveries
   - Posts a comprehensive log to channel 1473734843618558006 including:
     - Announcement title and message
     - Publisher name
     - Number of recipients
     - Success/failure statistics
     - List of failed recipients (if any)
6. **User sees success screen** confirming the announcement was published

## API Endpoint Required

The following endpoint needs to be implemented in the Cloudflare Worker backend:

**POST** `/api/broadcast-announcement`

### Request Body
```json
{
  "title": "string",
  "content": "string",
  "senderName": "string",
  "senderId": "string",
  "sentAt": "ISO-8601 timestamp",
  "recipientCount": "number",
  "candidates": [
    {
      "id": "string",
      "name": "string",
      "discordId": "string",
      "email": "string"
    }
  ]
}
```

### Response
Should return:
```json
{
  "success": true,
  "processed": number,
  "message": "string"
}
```

### Implementation Notes
The endpoint should:
1. Validate the request data
2. Call the `broadcastAnnouncement()` function from `bot-sentinel.js`
3. Return the result to the frontend
4. Handle errors gracefully

## Discord Channel Logging

The announcement log is posted to channel **1473734843618558006** with the following information:

- **Title**: "📢 Announcement Broadcast Log"
- **Color**: Purple (0x5856d6)
- **Fields**:
  - 📌 Title - The announcement title
  - 💬 Message - The announcement content (truncated to 1000 chars)
  - 👤 Published by - Name of the user who sent it
  - 📊 Recipients - Number of candidates targeted
  - ✅ Successfully sent - Count of successful deliveries
  - ❌ Failed - Count of failed deliveries
  - ⚠️ Failed Recipients - List of candidates who didn't receive it

## Features

✅ **Selective Targeting**: Only sends to candidates assigned to the current user
✅ **Discord DMs**: Professional embed format in Discord DMs
✅ **Audit Trail**: Complete logging to designated channel
✅ **Error Handling**: Graceful handling of failed deliveries
✅ **Statistics**: Tracks success/failure metrics
✅ **Real-time Preview**: Live preview of announcement in modal
✅ **Loading States**: UI feedback during processing

## Permissions & Security

- Only employees with access to the candidates management tab can broadcast announcements
- Candidates are filtered based on job assignments
- All announcements are logged for audit purposes
- Discord DMs are sent only to candidates with valid Discord IDs
- Announcement data is not stored permanently (logging only)

## Testing

To test the feature:

1. Log in as an employer with pending candidates assigned
2. Navigate to the Candidates section
3. Click the "📢 Broadcast Announcement" button
4. Fill in title and message
5. Verify the preview looks correct
6. Click "Publish to Pending Candidates"
7. Verify:
   - Success message appears
   - Announcement log appears in Discord channel 1473734843618558006
   - Candidates receive Discord DMs (if they have Discord ID)

## Error Handling

The system handles various error scenarios:

- **Missing Discord ID**: Candidate is skipped with a note
- **Failed DM delivery**: Recorded as failed, but process continues for other candidates
- **Invalid input**: User is notified to fill in both fields
- **API failures**: User is shown error message with details
- **Discord channel not found**: Logging fails silently (doesn't block announcement)

## Future Enhancements

Possible improvements:
- Scheduled announcements
- Announcement templates
- Rich text formatting support
- Announcement history/archive
- Read receipts
- Announcement targeting by job position
- Announcement scheduling with delivery confirmation

## Files Modified

1. [script.js](script.js) - Added UI and functions
2. [bot-sentinel.js](bot-sentinel.js) - Added broadcast handler
3. [backend-api.js](backend-api.js) - Added API helper function

## Configuration

- **Log Channel ID**: 1473734843618558006 (currently hardcoded, can be made configurable)
- **Color Scheme**: Purple (0x5856d6) 
- **Button Label**: "📢 Broadcast Announcement"
