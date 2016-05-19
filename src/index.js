import AWS from 'aws-sdk';

/**
 * Returns an array of instances from a regions Reservations
 *
 * @return Promise
 */

export function mapRegions(regions) {
	return regions.map(region => region.RegionName);
}

/**
 * Returns an array of instances from a regions Reservations
 *
 * @return Promise
 */

export function mapInstances(reservations, status) {
	var instances = [];
	reservations.forEach(reservation => reservation.Instances.forEach(instance => {
		if (instance.State.Code === status) {
			instances.push(instance.InstanceId);
		}
	}));
	return instances;
}

/**
 * Describes available regions
 *
 * @return Promise
 */

export function discoverAvailableRegions() {
	const ec2 = new AWS.EC2();

	return new Promise(resolve => ec2.describeRegions({}, (error, response) =>
		resolve(mapRegions(response.Regions))
	));
}

/**
 * Describes available instances in a region
 *
 * @return Promise
 */

export function discoverRegionInstances(tag, region, status) {
	const ec2 = new AWS.EC2({ region });

	const params = {
		Filters: [ { Name: `tag:${tag.name}`, Values: [tag.value] } ]
	};

	return new Promise(resolve => ec2.describeInstances(params, (error, response) =>
		resolve(mapInstances(response.Reservations, status))
	));
}

/**
 * Stops an array of instances
 *
 * @return Promise
 */

export function stopTaggedInstances(event, context) {
	const tag = { name: 'stop-group', value: context.functionName };

	discoverAvailableRegions()
		.then(regions => regions.forEach(region => discoverRegionInstances(tag, region, 16).then(instances => {
			if (instances.length) {
				(new AWS.EC2({ region })).stopInstances({ InstanceIds: instances }, () => {});
			}
		})));
}

/**
 * Starts an array of instances
 *
 * @return Promise
 */

export function startTaggedInstances(event, context) {
	const tag = { name: 'start-group', value: context.functionName };

	discoverAvailableRegions()
		.then(regions => regions.forEach(region => discoverRegionInstances(tag, region, 80).then(instances => {
			if (instances.length) {
				(new AWS.EC2({ region })).startInstances({ InstanceIds: instances }, () => {});
			}
		})));
}

