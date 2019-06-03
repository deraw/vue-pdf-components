/** Create range array
 * eg. range(3) => [0, 1, 2]
 *
 * @param {Number} start Range start
 * @param {Number} end Range end
 */
export default function range(start: number, end: number) {
	return Array.from(Array(end - start + 1), (_, i) => start + i);
}
