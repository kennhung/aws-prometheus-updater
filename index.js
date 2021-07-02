require('dotenv').config();
const { ElasticBeanstalk, EC2, EC2MetadataCredentials } = require('aws-sdk');
const fs = require('fs');
const { flatten } = require('lodash');

const clientConfig = {
    region: process.env.AWS_REGION,
    credentials: process.env.AWS_CRED_TYPE === "ec2_metadata" ? new EC2MetadataCredentials() : {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
}

const eb = new ElasticBeanstalk(clientConfig);

const ec2 = new EC2(clientConfig);

const update_target_file = (eb, ec2, updateRate) => {
    eb.describeEnvironmentResources({ EnvironmentName: process.env.EB_ENV_NAME }).promise().then(({ EnvironmentResources }) => {
        ec2.describeInstances({
            InstanceIds: EnvironmentResources.Instances.map(({ Id }) => {
                return Id;
            })
        }).promise().then(({ Reservations }) => {
            const ips = flatten(Reservations.map(({ Instances }) => {
                return Instances.map(({ PrivateIpAddress }) => PrivateIpAddress);
            }));

            fs.writeFileSync(process.env.OUT_FILE_PATH, JSON.stringify([
                {
                    "targets": ips.map((ip) => `${ip}:9209`)
                }
            ]) + '\n');

            if (updateRate) {
                setTimeout(() => {
                    update_target_file(eb, ec2, updateRate);
                }, updateRate * 1000);
            }
        });
    })
}

const updateRate = isNaN(process.env.UPDATE_RATE) ? 0 : parseInt(process.env.UPDATE_RATE);
update_target_file(eb, ec2, updateRate);
