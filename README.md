# AWS EC2 - Lambda Start / Stop [![Build Status](https://travis-ci.org/andrewmclagan/aws-lambda-ec2-start-stop.svg?branch=master)](https://travis-ci.org/https://travis-ci.org/andrewmclagan/aws-lambda-ec2-start-stop)

> AWS Lambda function that will stop or stop EC2 instances that have a tag with the key start-group or stop-group and the value the name of the lambda function.

Originally forked from [SamVerschueren/aws-lambda-stop-server](https://github.com/SamVerschueren/aws-lambda-stop-server) updates include:

* node ^4.x.x
* cross-region
* removed dependancies
* ES6 codebase
* modular, testable, functional and importantly readable codebase 

## Usage

Download the [`/dist/build.zip`](https://github.com/andrewmclagan/aws-lambda-ec2-start-stop/releases/latest) file from the latest release and deploy it as a lambda function (use master at your own risk).

Lambda settings:

* **Function Name** Something that relates to the schedule e.g. `week-day-startup` or `daily-shutdown`.
* **Timeout** 30 seconds or above
* **Runtime** Node.js 4.3 and above
* **Handler** for stopping instances `index.stopTaggedInstances`, for starting instances `index.startTaggedInstances`.
* **Event Sources** Choose `Scheduled Event` then provide a cron expression e.g. `cron(15 17 ? * MON-FRI *)` This expression will stop the servers every weekday, from monday to friday, at 17:15 PM (UTC time).


### Tags

Tagging your instance is very important in order for the lambda function to work properly. The lambda function will retrieve **all instances** across **all regions** that have a tag with a key `stop-group` or `start-group`,
and a value being the name of the lambda function you provided.

For instance, if you named your lambda function `week-day-startup`, make sure you add a tag with key-value `start-group=week-day-startup` to all the instances you want to start on that particular schedule.

### IAM Role

Make sure your lambda function is able to describe and stop instances.

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "MyStatementId",
            "Effect": "Allow",
            "Action": [
            	"ec2:DescribeRegions",
                "ec2:DescribeInstances",
                "ec2:StopInstances"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

## License

MIT © Andrew McLagan
