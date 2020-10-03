# aws-prometheus-updater

## Environment Variable

* `AWS_REGION`: AWS Elastic Beanstalk region
* `AWS_CRED_TYPE`: AWS credential type, can be `accesskey` or `ec2_metadata`
* `AWS_ACCESS_KEY_ID`: AWS Access Key ID, only work on `accesskey` mode
* `AWS_SECRET_ACCESS_KEY`: AWS Secret Access Key, only work on `accesskey` mode
* `EB_ENV_NAME`: Elastic Beanstalk environment name
* `OUT_FILE_PATH`: Path of the output file
* `UPDATE_RATE`: How long the script should update the targets (in sec). Set to zero will only run one time.
