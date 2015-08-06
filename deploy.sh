#!/bin/bash
set -e

echo "This deployment script is ugly. You should probably only use it if you've read and understood the whole thing. Sorry."
echo "This script will now exit without doing anything."
exit 0

current_time=$(date "+%Y%m%d-%H%M")
deploy_filename="aws_deploy/$current_time-upload.zip"

mkdir -p aws_deploy
zip -r $deploy_filename *

aws lambda update-function-code --function-name actdigstream --zip-file fileb://$deploy_filename
