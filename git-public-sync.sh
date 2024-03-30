#!/bin/bash

# # Set Up a Remote for the Public Repository
# git remote add public https://github.com/1varunvc/schedule-personalised-sms.git

# Ensure you're on the main branch or another specific starting branch
git checkout main

# Create a new branch for the sync
git checkout -b temp-public-sync

# Remove specific files and directories from being tracked without deleting them
git rm --cached messages.js
git rm --cached git-public-sync.sh

# Commit the removal
git commit -m "Temporarily remove certain files for public sync"

# Push to the public repository
git push public temp-public-sync:main --force

# Cleanup: Re-add messages.js
git add messages.js
git add git-public-sync.sh
git commit -m "Track messages.js and git-public-sync.sh"

# Cleanup: Switch back and delete the temporary branch
git checkout main
git push
git branch -D temp-public-sync

# Optionally, remove the remote if it was only added for this operation
# git remote remove public
