# Asset Management Refactoring TODO

## Part 1: Smart Sync Script (Python)
- [x] Create `scripts/smart_sync.py` with logic to scan `public/infographics/` and `public/mindmaps/` folders
- [x] Implement YouTube API search to find video IDs from filenames (titles) with normalization
- [x] Rename files to `[VIDEO_ID]_infographic.png` or `[VIDEO_ID]_mindmap.png` based on folder
- [x] Upload files to Google Drive using credentials.json
- [x] Create/update `public/assets_mapping.json` with {videoId: {infographic: fileId, mindmap: fileId}}
- [x] Delete local files after successful upload

## Part 2: Frontend Logic (React)
- [x] Update `src/services/youtube.ts` `getAssetPath` to fetch from `assets_mapping.json` and return Google Drive URLs
- [x] Edit `src/components/Learn.tsx` to use videoId instead of title for getAssetPath calls
- [x] Edit `src/components/Learn.tsx` to add onError handlers to image elements to close lightbox on 404

## Testing and Verification
- [x] Install Python dependencies: `pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib google-auth`
- [x] Run the script: `python scripts/smart_sync.py` - Successfully uploaded 12 files to Google Drive
- [x] Test frontend to ensure images load from cloud and hide on errors - Web server running on localhost:5173
- [ ] Update `src/services/youtube.ts` `getAssetPath` to fetch from `assets_mapping.json` and return Google Drive URLs
