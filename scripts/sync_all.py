#!/usr/bin/env python3
"""
Single command to sync everything: videos and assets
Usage: python scripts/sync_all.py
"""

import os
import sys
import subprocess
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_script(script_path, description):
    """Run a Python script and return success status"""
    try:
        logger.info(f"Starting {description}...")
        result = subprocess.run([sys.executable, script_path], check=True, capture_output=True, text=True)
        logger.info(f"{description} completed successfully")
        if result.stdout:
            logger.info(f"Output: {result.stdout}")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"{description} failed with exit code {e.returncode}")
        if e.stdout:
            logger.info(f"Output: {e.stdout}")
        if e.stderr:
            logger.error(f"Error: {e.stderr}")
        return False
    except FileNotFoundError:
        logger.error(f"Script not found: {script_path}")
        return False

def main():
    logger.info("Starting complete sync process...")

    # Get the directory where this script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))

    # Paths to the scripts
    update_videos_script = os.path.join(script_dir, 'update_videos.py')
    smart_sync_script = os.path.join(script_dir, 'smart_sync.py')

    # Step 1: Update videos
    success1 = run_script(update_videos_script, "video update")

    # Step 2: Sync assets (only if video update succeeded)
    if success1:
        success2 = run_script(smart_sync_script, "asset sync")
        if success2:
            logger.info("Complete sync process finished successfully!")
            logger.info("Remember to push the updated assets_mapping.json to git for the website to see the changes.")
        else:
            logger.error("Asset sync failed")
            sys.exit(1)
    else:
        logger.error("Video update failed, skipping asset sync")
        sys.exit(1)

if __name__ == '__main__':
    main()
