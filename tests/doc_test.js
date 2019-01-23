/**
 * Represents a book.
 * @constructor
 * @param {string} title - The title of the book.
 * @param {string} author - The author of the book.
 */
function Book(title, author) {}

/**
 * Test Doc Node Class
 */
class TestDocNode {
    /**
     * @constructor
     * @param {string} str
     */
    constructor(str) {
        /**
         * The test node's title.
         */
        this.str = str;
    }
    /** The getter function example. */
    get bong() {
        return this._bong;
    }

    set bong(newBong) {
        this._bong = newBong * 2;
    }
}
