require('dotenv').config();

const { ELBv2, EC2MetadataCredentials } = require('aws-sdk');
const fs = require('fs');
const { flatten } = require('lodash');

const clientConfig = {
    region: process.env.AWS_REGION,
    credentials: process.env.AWS_CRED_TYPE === "ec2_metadata" ? new EC2MetadataCredentials() : {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
}

const elbv2 = new ELBv2(clientConfig);


const run = async (elbv2, targetGroupArn, outFilePath, updateRate) => {
    const result = await elbv2.describeTargetHealth({ TargetGroupArn: targetGroupArn }).promise();

    if (result.TargetHealthDescriptions) {
        const targets = result.TargetHealthDescriptions.map(({ Target: { Id, Port } }) => {
            return `${Id}:${Port}`;
        });

        fs.writeFileSync(outFilePath, JSON.stringify([
            {
                "targets": targets
            }
        ]) + '\n');
    }

    if (updateRate) {
        setTimeout(() => {
            run(elbv2, targetGroupArn, outFilePath, updateRate);
        }, updateRate * 1000);
    }
}

const targetGroupArn = process.env.TARGET_GROUP_ARN;
if (!targetGroupArn) {
    console.error("env:`TARGET_GROUP_ARN` is required");
    process.exit(1);
}

const outFilePath = process.env.OUT_FILE_PATH;
if (!outFilePath) {
    console.error("env:`OUT_FILE_PATH` is required");
    process.exit(1);
}

const updateRate = isNaN(process.env.UPDATE_RATE) ? 0 : parseInt(process.env.UPDATE_RATE);

run(elbv2, targetGroupArn, outFilePath, updateRate);
