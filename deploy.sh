#!/usr/bin/env bash

# NOTE: This file is used in the optional lab05_deploy (worth 0 marks).
# If you are currently working on lab05_forum, you can ignore it.

WORKING_DIRECTORY="~/www/Reminder-Bot"

# NOTE: change the credentials below as appropriate. the 
# The SSH_HOST can be found at the top of Remote Access -> SSH in Alwaysdata.
USERNAME="zitian"
SSH_HOST="ssh-zitian.alwaysdata.net"

scp -r ./package.json ./config.json "$USERNAME@$SSH_HOST:$WORKING_DIRECTORY"
ssh "$USERNAME@$SSH_HOST" "cd $WORKING_DIRECTORY && npm install --omit=dev"
