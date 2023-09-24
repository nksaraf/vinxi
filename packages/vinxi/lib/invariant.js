const genericMessage = "Invariant Violation";
const {
	setPrototypeOf = function (obj, proto) {
		obj.__proto__ = proto;
		return obj;
	},
} = Object;

export class InvariantError extends Error {
	framesToPop = 1;
	name = genericMessage;
	constructor(/** @type {string | number} */ message = genericMessage) {
		super(
			typeof message === "number"
				? `${genericMessage}: ${message} (see https://github.com/apollographql/invariant-packages)`
				: message,
		);
		setPrototypeOf(this, InvariantError.prototype);
	}
}

/**
 * @param {any} condition
 * @param {string | number} message
 * @returns {asserts condition}
 */
export default function invariant(condition, message) {
	if (!condition) {
		throw new InvariantError(message);
	}
}

export { invariant };
