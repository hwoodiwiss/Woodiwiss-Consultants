<?php

namespace WoodiwissConsultants;

class HeaderCollection implements \ArrayAccess, \Iterator
{
	private int $position = 0;
	private array $keys = [];
	private array $headers;

	public function __construct(?HeaderCollection $headers = null)
	{
		$this->position = 0;
		$this->keys = [];
		$this->headers = $headers ?? [];
	}

	/**
	 * Whether an offset exists
	 * Whether or not an offset exists.
	 *
	 * @param string $offset An offset to check for.
	 *
	 * @return bool
	 */
	function offsetExists($offset)
	{
		if (gettype($offset) === gettype('')) {
			return array_key_exists($offset, $this->headers);
		}
		else {
			throw new \InvalidArgumentException('Header name must be a string');
		}
	}

	/**
	 * Offset to retrieve
	 * Returns the value at specified offset.
	 *
	 * @param string $offset The offset to retrieve.
	 *
	 * @return mixed
	 */
	function offsetGet($offset)
	{
		if (gettype($offset) === gettype('')) {
			return $this->headers[$offset];
		}
		else {
			throw new \InvalidArgumentException('Header name must be a string');
		}
	}

	/**
	 * Assign a value to the specified offset
	 * Assigns a value to the specified offset.
	 *
	 * @param mixed $offset The offset to assign the value to.
	 * @param mixed $value The value to set.
	 */
	function offsetSet($offset, $value)
	{
		if (gettype($offset) === gettype('')) {
			$this->headers[$offset] = $value;
		}
		else {
			throw new \InvalidArgumentException('Header name must be a string');
		}
	}

	/**
	 * Unset an offset
	 * Unsets an offset.
	 *
	 * @param mixed $offset The offset to unset.
	 */
	function offsetUnset($offset)
	{
		unset($this->headers[$offset]);
	}

	/**
	 * Return the current element
	 * Returns the current element.
	 *
	 * @return string | array
	 */
	function current(): string|array
	{
		return $this->headers[$this->keys[$this->position]];
	}

	/**
	 * Return the key of the current element
	 * Returns the key of the current element.
	 *
	 * @return int|string
	 */
	function key(): string
	{
		return $this->keys[$this->position];
	}

	/**
	 * Move forward to next element
	 * Moves the current position to the next element.
	 */
	function next()
	{
		++$this->position;
	}

	/**
	 * Rewind the Iterator to the first element
	 * Rewinds back to the first element of the Iterator.
	 */
	function rewind()
	{
		$this->position = 0;
		$this->keys = array_keys($this->headers);
	}

	/**
	 * Checks if current position is valid
	 * This method is called after Iterator::rewind() and Iterator::next() to check if the current position is valid.
	 *
	 * @return bool
	 */
	function valid(): bool
	{
		return isset($this->keys[$this->position]) && isset($this->headers[$this->keys[$this->position]]);
	}
}