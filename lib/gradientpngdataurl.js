/**
Example Usage:

const gradient = "linear-gradient(90deg, red 0%, blue 100%)";

const pngDataUrl = GradientPngDataUrl
  .fromString(gradient)
  .toDataURL(400, 200);

console.log(pngDataUrl);

Preview in an Image Element:

const img = document.createElement("img");

img.src = GradientPngDataUrl
  .fromString("linear-gradient(to right, #ff7a18, #af002d 50%, #319197)")
  .toDataURL(600, 120);

document.body.appendChild(img);

*/
class GradientPngDataUrl {
	constructor(gradientString) {
		this.original = gradientString;
		this.parsed = this.parseLinearGradient(gradientString);
	}

	static fromString(gradientString) {
		return new GradientPngDataUrl(gradientString);
	}

	toDataURL(width, height, type = "image/png", quality) {
		if (!Number.isFinite(width) || width <= 0) {
			throw new Error("Width must be a positive number.");
		}

		if (!Number.isFinite(height) || height <= 0) {
			throw new Error("Height must be a positive number.");
		}

		const canvas = document.createElement("canvas");
		canvas.width = Math.round(width);
		canvas.height = Math.round(height);

		const ctx = canvas.getContext("2d");

		const line = this.getGradientLine(
			canvas.width,
			canvas.height,
			this.parsed.angle
		);

		const canvasGradient = ctx.createLinearGradient(
			line.x0,
			line.y0,
			line.x1,
			line.y1
		);

		const normalizedStops = this.normalizeStops(
			this.parsed.stops,
			line.length
		);

		for (const stop of normalizedStops) {
			canvasGradient.addColorStop(stop.offset, stop.color);
		}

		ctx.fillStyle = canvasGradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		if (quality === undefined) {
			return canvas.toDataURL(type);
		}

		return canvas.toDataURL(type, quality);
	}

	parseLinearGradient(input) {
		const trimmed = input.trim();

		const match = trimmed.match(/^linear-gradient\s*\((.*)\)$/i);

		if (!match) {
			throw new Error("Input must be a CSS linear-gradient string.");
		}

		const body = match[1].trim();
		const parts = this.splitTopLevelCommas(body);

		if (parts.length < 2) {
			throw new Error("A linear gradient must contain at least two colors.");
		}

		let angle = 180;
		let stopParts = parts;

		const firstPart = parts[0].trim();

		if (this.isAngle(firstPart)) {
			angle = this.parseAngle(firstPart);
			stopParts = parts.slice(1);
		} else if (this.isDirection(firstPart)) {
			angle = this.parseDirection(firstPart);
			stopParts = parts.slice(1);
		}

		const stops = [];

		for (const stopPart of stopParts) {
			const parsedStops = this.parseColorStop(stopPart);

			for (const stop of parsedStops) {
				stops.push(stop);
			}
		}

		if (stops.length < 2) {
			throw new Error("A linear gradient must contain at least two color stops.");
		}

		return {
			angle,
			stops
		};
	}

	splitTopLevelCommas(input) {
		const result = [];
		let current = "";
		let depth = 0;
		let quote = null;

		for (let i = 0; i < input.length; i++) {
			const char = input[i];

			if (quote) {
				current += char;

				if (char === quote && input[i - 1] !== "\\") {
					quote = null;
				}

				continue;
			}

			if (char === "\"" || char === "'") {
				quote = char;
				current += char;
				continue;
			}

			if (char === "(") {
				depth++;
				current += char;
				continue;
			}

			if (char === ")") {
				depth--;
				current += char;
				continue;
			}

			if (char === "," && depth === 0) {
				result.push(current.trim());
				current = "";
				continue;
			}

			current += char;
		}

		if (current.trim()) {
			result.push(current.trim());
		}

		return result;
	}

	splitTopLevelWhitespace(input) {
		const result = [];
		let current = "";
		let depth = 0;
		let quote = null;

		for (let i = 0; i < input.length; i++) {
			const char = input[i];

			if (quote) {
				current += char;

				if (char === quote && input[i - 1] !== "\\") {
					quote = null;
				}

				continue;
			}

			if (char === "\"" || char === "'") {
				quote = char;
				current += char;
				continue;
			}

			if (char === "(") {
				depth++;
				current += char;
				continue;
			}

			if (char === ")") {
				depth--;
				current += char;
				continue;
			}

			if (/\s/.test(char) && depth === 0) {
				if (current.trim()) {
					result.push(current.trim());
					current = "";
				}

				continue;
			}

			current += char;
		}

		if (current.trim()) {
			result.push(current.trim());
		}

		return result;
	}

	isAngle(value) {
		return /^[+-]?(?:\d+|\d*\.\d+)(deg|rad|grad|turn)$/i.test(value.trim());
	}

	parseAngle(value) {
		const trimmed = value.trim();
		const match = trimmed.match(/^([+-]?(?:\d+|\d*\.\d+))(deg|rad|grad|turn)$/i);

		if (!match) {
			throw new Error("Invalid angle: " + value);
		}

		const number = parseFloat(match[1]);
		const unit = match[2].toLowerCase();

		let degrees;

		if (unit === "deg") {
			degrees = number;
		} else if (unit === "rad") {
			degrees = number * 180 / Math.PI;
		} else if (unit === "grad") {
			degrees = number * 0.9;
		} else if (unit === "turn") {
			degrees = number * 360;
		} else {
			degrees = number;
		}

		return ((degrees % 360) + 360) % 360;
	}

	isDirection(value) {
		return /^to\s+/i.test(value.trim());
	}

	parseDirection(value) {
		const words = value
			.trim()
			.toLowerCase()
			.split(/\s+/)
			.filter(Boolean);

		if (words[0] !== "to") {
			throw new Error("Invalid direction: " + value);
		}

		let x = 0;
		let y = 0;

		for (let i = 1; i < words.length; i++) {
			const word = words[i];

			if (word === "left") {
				x -= 1;
			} else if (word === "right") {
				x += 1;
			} else if (word === "top") {
				y -= 1;
			} else if (word === "bottom") {
				y += 1;
			} else {
				throw new Error("Invalid direction keyword: " + word);
			}
		}

		if (x === 0 && y === 0) {
			throw new Error("Invalid gradient direction: " + value);
		}

		const radians = Math.atan2(x, -y);
		const degrees = radians * 180 / Math.PI;

		return ((degrees % 360) + 360) % 360;
	}

	parseColorStop(input) {
		const tokens = this.splitTopLevelWhitespace(input.trim());

		if (tokens.length === 0) {
			throw new Error("Empty color stop.");
		}

		const positions = [];

		while (tokens.length > 1 && this.isPositionToken(tokens[tokens.length - 1])) {
			positions.unshift(this.parsePositionToken(tokens.pop()));
		}

		const color = tokens.join(" ");

		if (!color) {
			throw new Error("Missing color in color stop: " + input);
		}

		this.validateColor(color);

		if (positions.length === 0) {
			return [
				{
					color,
					position: null
				}
			];
		}

		if (positions.length === 1) {
			return [
				{
					color,
					position: positions[0]
				}
			];
		}

		return [
			{
				color,
				position: positions[0]
			},
			{
				color,
				position: positions[1]
			}
		];
	}

	isPositionToken(token) {
		return /^[+-]?(?:\d+|\d*\.\d+)(%|px)?$/i.test(token.trim());
	}

	parsePositionToken(token) {
		const match = token
			.trim()
			.match(/^([+-]?(?:\d+|\d*\.\d+))(%|px)?$/i);

		if (!match) {
			throw new Error("Invalid color stop position: " + token);
		}

		return {
			value: parseFloat(match[1]),
			unit: match[2] ? match[2].toLowerCase() : "%"
		};
	}

	validateColor(color) {
		const canvas = document.createElement("canvas");
		canvas.width = 1;
		canvas.height = 1;

		const ctx = canvas.getContext("2d");

		ctx.fillStyle = "#000000";
		ctx.fillStyle = color;

		const normalized = ctx.fillStyle;

		if (!normalized || normalized === "#000000") {
			ctx.fillStyle = "#ffffff";
			ctx.fillStyle = color;

			if (ctx.fillStyle === "#ffffff") {
				throw new Error("Invalid CSS color: " + color);
			}
		}
	}

	normalizeStops(stops, gradientLineLength) {
		const result = stops.map((stop) => {
			return {
				color: stop.color,
				offset: stop.position === null
					? null
					: this.positionToOffset(stop.position, gradientLineLength)
			};
		});

		if (result[0].offset === null) {
			result[0].offset = 0;
		}

		if (result[result.length - 1].offset === null) {
			result[result.length - 1].offset = 1;
		}

		let lastExplicitIndex = 0;

		for (let i = 1; i < result.length; i++) {
			if (result[i].offset !== null) {
				const startOffset = result[lastExplicitIndex].offset;
				const endOffset = result[i].offset;
				const gap = i - lastExplicitIndex;

				for (let j = 1; j < gap; j++) {
					const t = j / gap;
					result[lastExplicitIndex + j].offset =
						startOffset + (endOffset - startOffset) * t;
				}

				lastExplicitIndex = i;
			}
		}

		for (const stop of result) {
			if (stop.offset === null) {
				stop.offset = 1;
			}

			stop.offset = Math.max(0, Math.min(1, stop.offset));
		}

		for (let i = 1; i < result.length; i++) {
			if (result[i].offset < result[i - 1].offset) {
				result[i].offset = result[i - 1].offset;
			}
		}

		return result;
	}

	positionToOffset(position, gradientLineLength) {
		if (position.unit === "%") {
			return position.value / 100;
		}

		if (position.unit === "px") {
			return position.value / gradientLineLength;
		}

		return position.value / 100;
	}

	getGradientLine(width, height, angleDegrees) {
		const radians = angleDegrees * Math.PI / 180;

		const dx = Math.sin(radians);
		const dy = -Math.cos(radians);

		const length = Math.abs(width * dx) + Math.abs(height * dy);

		const cx = width / 2;
		const cy = height / 2;

		return {
			x0: cx - dx * length / 2,
			y0: cy - dy * length / 2,
			x1: cx + dx * length / 2,
			y1: cy + dy * length / 2,
			length
		};
	}
}
