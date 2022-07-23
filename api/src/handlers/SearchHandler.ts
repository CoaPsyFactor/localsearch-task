import RequestHandler, { RequestHandlerData, RequestHandlerResult } from '../RequestHandler';
import { ServerRequestHandlerMethod } from '../Server';
import FakeAPISDK, { Business } from '../utils/FakeAPISDK';

const sdk = new FakeAPISDK();

export enum SearchHandlerTermType {
	BusinessName = 'businessName',
	BusinessAddress = 'businessAddress',
};

export type SearchHandlerData = {
	type: SearchHandlerTermType;
	term: string;
};

export default class SearchHandler extends RequestHandler<{ type: SearchHandlerTermType }, { term: string }> {
	method: ServerRequestHandlerMethod = ServerRequestHandlerMethod.Post;
	url: string = '/business/search';

	async handle(data: RequestHandlerData<{ type: SearchHandlerTermType; }, { term: string; }>): RequestHandlerResult {
		switch (data.query.type) {
			case SearchHandlerTermType.BusinessAddress:
			case SearchHandlerTermType.BusinessName:
				break;
			default:
				return {
					status: 400,
					result: { message: `Invalid search term type "${data.query.type}"` },
				}
		}

		if (typeof data.body.term !== 'string' || data.body.term.length === 0) {
			return {
				status: 400,
				result: { message: 'Search term may not be empty' },
			};
		}

		const businesses = await sdk.getBusinesses() || [];
		const searchTerm = new RegExp(data.body.term, 'gi');

		return {
			status: 200,
			result: (businesses || []).filter((business: Business) => (
				searchTerm
					.test(data.query.type === SearchHandlerTermType.BusinessAddress
						? business.address : business.name)
			)),
		};
	}
}