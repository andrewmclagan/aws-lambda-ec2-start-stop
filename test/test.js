import test from 'ava';
import sinon from 'sinon';
import AWS from 'aws-sdk';
import {
	discoverAvailableRegions,
	discoverRegionInstances,
	stopTaggedInstances,
	mapRegions,
	mapInstances } from '../src/index';

const ec2 = {
	describeRegions: () => {},
	describeInstances: () => {},
	stopInstances: () => {},
};

sinon.stub(AWS, 'EC2').returns(ec2);

test('It can map region objects to region names', t => {
	const mockResponse = {
		Regions: [
			{ RegionName: 'us-mock-1', EndPoint: 'foo-bar'},
			{ RegionName: 'ap-southeast-2', EndPoint: 'bar-bar'},
		],
	};

	const mappedRegions = mapRegions(mockResponse.Regions);

	t.deepEqual(['us-mock-1', 'ap-southeast-2'], mappedRegions);
});

test('It can map instance objects to instance ids', t => {
	const mockResponse = {
		Reservations: [
			{
				Instances: [
					{ State: { Code: 22 }, InstanceId: 'i-foo-bar' },
					{ State: { Code: 22 }, InstanceId: 'i-bar-bar' },
					{ State: { Code: 22 }, InstanceId: 'i-rab-voo' },
				],
			},
			{
				Instances: [
					{ State: { Code: 22 }, InstanceId: 'i-1-bar' },
					{ State: { Code: 22 }, InstanceId: 'i-2-bar' },
					{ State: { Code: 22 }, InstanceId: 'i-3-voo' },
				],
			},
		],
	};

	const mappedInstances = mapInstances(mockResponse.Reservations, 22);

	const expected = [
		'i-foo-bar',
		'i-bar-bar',
		'i-rab-voo',
		'i-1-bar',
		'i-2-bar',
		'i-3-voo',
	];

	t.deepEqual(expected, mappedInstances);
});

test('It only maps instances with specific status codes', t => {
	const mockResponse = {
		Reservations: [
			{
				Instances: [
					{ State: { Code: 5 }, InstanceId: 'i-foo-bar' },
					{ State: { Code: 22 }, InstanceId: 'i-bar-bar' },
					{ State: { Code: 22 }, InstanceId: 'i-rab-voo' },
				],
			},
		],
	};

	const mappedInstances = mapInstances(mockResponse.Reservations, 22);

	t.deepEqual(['i-bar-bar', 'i-rab-voo'], mappedInstances);
});

test('It can discover all available regions', t => {
	const mockResponse = {
		Regions: [
			{ RegionName: 'us-mock-1', EndPoint: 'foo-bar'},
			{ RegionName: 'ap-southeast-2', EndPoint: 'bar-bar'},
		],
	};

	sinon.stub(ec2, 'describeRegions').yields(undefined, mockResponse);

	return discoverAvailableRegions().then(regions => {
		t.deepEqual(regions, ['us-mock-1', 'ap-southeast-2']);
		t.truthy(ec2.describeRegions.calledOnce);

		ec2.describeRegions.restore();
	});
});

test('It can discover a regions instances', t => {
	const mockRegion = 'us-mock-1';

	const mockTag = {name: 'foo', value: 'bar'};

	const mockResponse = {
		Reservations: [
			{
				Instances: [
					{ State: { Code: 5 }, InstanceId: 'i-foo-bar' },
					{ State: { Code: 22 }, InstanceId: 'i-bar-bar' },
					{ State: { Code: 22 }, InstanceId: 'i-rab-voo' },
				],
			},
		],
	};

	sinon.stub(ec2, 'describeInstances').yields(undefined, mockResponse);

	return discoverRegionInstances(mockTag, mockRegion, 22).then(instances => {
		t.deepEqual(instances, ['i-bar-bar', 'i-rab-voo']);
		t.truthy(ec2.describeInstances.calledOnce);

		ec2.describeInstances.restore();
	});
});
