import { ServerRequestHandlerMethod } from './Server';

export type RequestHandlerResult<ResultType = any> = Promise<{
	status: number;
	result: ResultType;
}>;

// TODO: This should also support/expect headers
export type RequestHandlerData<QueryData = any, BodyData = any> = {
	url: string;
	query: QueryData;
	body: BodyData;
};

export default abstract class RequestHandler<QueryData = any, BodyData = any, ResultType = any> {
	/**
	 * Method on which handler should react to.
	 */
	abstract method: ServerRequestHandlerMethod;

	/**
	 * URL on which handler should be triggered
	 */
	abstract url: string;

	/**
	 * Handler method that is being triggered if handler match is "true"
	 * 
	 * @param {RequestHandlerData} data Incoming data
	 * @returns {RequestHandlerResult<ResultType>}
	 */
	abstract handle(data: RequestHandlerData<QueryData, BodyData>): RequestHandlerResult<ResultType>
};
