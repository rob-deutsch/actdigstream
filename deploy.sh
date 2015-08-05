#!/bin/bash
set -e

current_time=$(date "+%Y%m%d-%H%M")
deploy_filename="aws_deploy/$current_time-upload.zip"

mkdir -p aws_deploy
zip -r $deploy_filename *

aws lambda update-function-code --function-name actdigstream --zip-file fileb://$deploy_filename
