import { parse as ParseURL } from 'url';
import { createServer, Server as HttpServer, IncomingMessage, ServerResponse } from 'http';
import RequestHandler from './RequestHandler';

export enum ServerRequestHandlerMethod {
	Get = 'GET',
	Post = 'POST',
};

export default class Server {
	/**
	 * Holds instances of available request handlers.
	 */
	private readonly handlers: RequestHandler[];

	/**
	 * Holds instance of nodejs Server object.
	 */
	private readonly server: HttpServer;

	constructor(handlers: RequestHandler[]) {
		if (Array.isArray(handlers) === false) {
			throw new TypeError('Invalid handlers array provided');
		}

		// Walk through handlers and validate proper type for each one.
		this.handlers = handlers.reduce((serverRequestHandlers: RequestHandler[], handler: RequestHandler, index: number): RequestHandler[] => {
			if (handler instanceof RequestHandler === false) {
				throw new TypeError(`Invalid request handler object on index ${index}`);
			}

			return [...serverRequestHandlers, handler];
		}, []);

		// Create server object with prepared handling.
		this.server = createServer(async (request: IncomingMessage, response: ServerResponse): Promise<void> => {
			const { url, query, body } = await Server.parseRequest(request);

			// Get the handler for current request based on method and url
			const handler = this.handlers.find((handler: RequestHandler): boolean => (
				`${url}`.toLowerCase() === `${handler.url}` && `${request.method}` === handler.method)
			) || null;

			// In case that there is no handler, default values 404/Route not found will be used to respond.
			const { status = 404, result = { message: 'Route not found' } } = await handler?.handle({ url, query, body }) || {};

			response.writeHead(status, { 'Content-Type': 'application/json' });
			response.write(JSON.stringify(result));
			response.end();
		});
	}

	/**
	 * Start listening for requests on given port.
	 * 
	 * @param {number} listeningPort Port on which to listen.
	 */
	start(listeningPort: number): void {
		this.server.listen(listeningPort, () => {
			console.log('Server running on port 3000');
		});
	}

	/**
	 * Parse request object to retrieve query, body and url of current request.
	 * 
	 * @param {IncomingMessage} request Request object.
	 * @returns 
	 */
	static async parseRequest(request: IncomingMessage): Promise<{ url: string, query: object, body: object | null }> {
		if (request instanceof IncomingMessage === false) {
			throw new TypeError('Invalid request object provided');
		}

		const parsedUrl = ParseURL(request.url || '/', true);
		const query = JSON.parse(JSON.stringify(parsedUrl.query)); // We do to plain object conversion, not performant but easy to understand.
		const body = await Server.getRequestBodyData(request);

		return { url: parsedUrl.pathname || '/', query, body };
	}

	/**
	 * Retrieve request body (post data) if possible.
	 * 
	 * @param {IncomingMessage} request Request object.
	 * @returns {Promise<object | null>}
	 */
	static getRequestBodyData(request: IncomingMessage): Promise<any> {
		return new Promise((resolve: Function) => {
			let bodyString = '';

			request.on('data', (chunk: string): void => {
				bodyString += chunk;
			});

			request.on('end', (): void => {
				try {
					resolve(JSON.parse(bodyString));
				} catch (_) {
					resolve({}); // we provide empty body so that its never "null"
				}
			});
		});
	}
}