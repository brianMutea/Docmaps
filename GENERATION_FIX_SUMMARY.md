# Map Generation Fix Summary

## Issue
When generating a map from a URL, the generation would complete successfully but the dialog would stay open with the error: "Generation completed but no map ID received". The map was being created in the database but the user wasn't redirected to the editor.

## Root Cause
The SSE (Server-Sent Events) stream parsing in the dialog component had two critical issues:

1. **Incomplete chunk handling**: SSE data arrives in chunks, and JSON parsing was failing on incomplete data because there was no buffer to accumulate partial messages.

2. **Early loop break**: The code was breaking out of the inner loop when it found a `complete` event, but not exiting the outer read loop, causing it to continue reading and potentially miss the mapId.

## Changes Made

### 1. Fixed SSE Stream Parsing (`apps/editor/components/generate-map-dialog.tsx`)
- Added a `buffer` variable to accumulate incomplete SSE chunks
- Properly split lines and keep the last incomplete line in the buffer
- Added console logging to track SSE events and mapId reception
- Changed to `return` instead of `break` when mapId is received, ensuring immediate redirect
- Improved error handling for JSON parsing

### 2. Simplified API Response (`apps/editor/app/api/generate-map/route.ts`)
- Extracted mapId to a variable before sending the complete event
- Added console logging to verify mapId is being sent
- Used proper type casting to avoid TypeScript errors

## Testing Instructions

### Prerequisites
1. Ensure database migration has been run:
   ```bash
   cd docs-maps
   npx supabase db reset
   ```

2. Rebuild the editor app (if not already done):
   ```bash
   npm run build --filter=editor
   ```

3. Start the development server:
   ```bash
   npm run dev --filter=editor
   ```

### Test Steps
1. Navigate to http://localhost:3000/editor/dashboard
2. Click the "Generate from URL" button
3. Enter a documentation URL (e.g., `https://docs.stripe.com/api`)
4. Click "Generate Map"
5. Open browser console (F12) to see debug logs
6. Watch for these console messages:
   - `SSE event received:` - Shows each event type
   - `Map ID received:` - Shows the extracted mapId
   - `Sending complete event with mapId:` - Server-side confirmation

### Expected Behavior
- The dialog should show "Generating..." with a loading spinner
- After generation completes (10-30 seconds depending on the URL)
- You should see a success toast: "Map generated successfully!"
- The dialog should close automatically
- You should be redirected to `/editor/maps/{mapId}?generated=true`
- The generated map should be visible in the editor

### If Issues Persist
1. Check browser console for errors
2. Check server logs for the "Sending complete event with mapId:" message
3. Verify the database has the new map:
   ```sql
   SELECT id, title, generation_metadata FROM maps ORDER BY created_at DESC LIMIT 1;
   ```
4. Ensure you're using the latest build (clear browser cache if needed)

## Files Modified
- `apps/editor/components/generate-map-dialog.tsx` - Fixed SSE parsing logic
- `apps/editor/app/api/generate-map/route.ts` - Simplified mapId extraction

## Commit
```
commit c5759d6
Fix SSE stream parsing and mapId extraction in generate-map dialog
```
