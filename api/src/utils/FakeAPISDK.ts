import axios from 'axios';
import { createClient, RedisClientType } from 'redis';

export enum BusinessOpeningHoursDays {
	Monday = 'monday',
	Tuesday = 'tuesday',
	Wednesday = 'wednesday',
	Thursday = 'thursday',
	Friday = 'friday',
	Saturday = 'saturday',
	Sunday = 'sunday',
};

export type BusinessOpeningHours = { [period: string]: { start: string, end: string }[] };

export type Business = {
	name: string;
	address: string;
	website: string;
	phone: string;
	workingHours: BusinessOpeningHours;
};

const availableBusinessIds = ['GXvPAor1ifNfpF0U5PTG0w', 'ohGSnJtMIC5nPfYRi_HTAg'];

export default class FakeAPISDK {
	private redis: RedisClientType;

	constructor() {
		this.redis = createClient({ url: 'redis://cache' })

		const redisErrorListener = (error: any): void => {
			this.redis.off('error', redisErrorListener);

			console.log(`Redis error`);
			console.error(error);
		};

		this.redis.on('error', redisErrorListener);

		this.redis.connect().then(() => {
			console.log('Redis connection established');
		}).catch((error: any) => {
			console.log('Failed to connect to redis server');
			console.error(error);
		});
	}

	/**
	 * Retrieve list of available businesses.
	 * Grab from cache (redis) if possible and available, otherwise grab from API and cache.
	 *
	 * @returns {Business[]}
	 */
	async getBusinesses(): Promise<Business[]> {
		const cachedBusinesses = await this.getCachedBusinesses();

		if (cachedBusinesses) {
			return cachedBusinesses;
		}

		console.info('Cache is empty - triggering provider API');

		const businesses: Business[] = await Promise.all(availableBusinessIds.map(async (businessId: string): Promise<Business> => {
			const businessRequestResult = await axios.get(`https://storage.googleapis.com/coding-session-rest-api/${businessId}`);
			const phoneInfo = businessRequestResult.data.addresses[0]?.contacts.find((contact: any) => contact.contact_type === 'phone');
			const websiteInfo = businessRequestResult.data.addresses[0]?.contacts.find((contact: any) => contact.contact_type === 'url');

			return {
				name: businessRequestResult.data.displayed_what,
				address: businessRequestResult.data.displayed_where,
				phone: phoneInfo?.call_link || '',
				website: websiteInfo?.service_code || '',
				workingHours: this.generateOpeningHours(businessRequestResult.data.opening_hours.days),
			};
		}));

		await this.cacheBusinesses(businesses);

		return businesses;
	}

	/**
	 * Generate "UI" friendly object representing business opening hours.
	 *
	 * @param {object} openingHoursRaw RAW object representing business opening hours.
	 * @returns {BusinessOpeningHours}
	 */
	generateOpeningHours(openingHoursRaw: any): BusinessOpeningHours {
		const days = Object.values(BusinessOpeningHoursDays);

		let weekday: string = BusinessOpeningHoursDays.Monday;
		let openingHours: string = JSON.stringify(openingHoursRaw[BusinessOpeningHoursDays.Monday] || 'null');

		const data: BusinessOpeningHours = {};

		days.forEach((currentDay: string, index: number) => {
			const currentOpeningHoursString = openingHoursRaw[currentDay] && JSON.stringify(openingHoursRaw[currentDay]) || null;

			if (currentOpeningHoursString !== openingHours) {
				const previousWeekday = days[index - 1] || null;
				const key = weekday === previousWeekday || previousWeekday === null
					? weekday
					: `${weekday}-${previousWeekday}`;

				data[key] = openingHours && JSON.parse(openingHours) || null;

				openingHours = currentOpeningHoursString;
				weekday = currentDay;
			}
			
			if (index + 1 === days.length) {
				const previousWeekday = days[index - 1] || null;
				const key = currentOpeningHoursString !== openingHours || data[previousWeekday]
					? currentDay
					: `${previousWeekday}-${currentDay}`;

				data[key] = currentOpeningHoursString && JSON.parse(currentOpeningHoursString) || null;
			}
		});

		return data;
	}

	/**
	 * Retrieve businesses from redis.
	 * 
	 * @returns {Promise<Business[]|null>}
	 */
	async getCachedBusinesses(): Promise<Business[] | null> {
		if (this.redis.isReady === false) {
			return null;
		}

		// In case that "businesses" doesnt actually return a value, we default to "null"
		// So that JSON.parse doesn't fail
		const businessesString = await this.redis.get('businesses') || null;

		if (businessesString) {
			return JSON.parse(businessesString) as Business[];
		}

		return null;
	}

	/**
	 * Store businesses into redis.
	 * 
	 * @param {Business[]} businesses 
	 * @returns 
	 */
	async cacheBusinesses(businesses: Business[]): Promise<void> {
		if (this.redis.isReady === false) {
			return;
		}

		await this.redis.set('businesses', JSON.stringify(businesses));
		await this.redis.expire('businesses', 60);
	}
}