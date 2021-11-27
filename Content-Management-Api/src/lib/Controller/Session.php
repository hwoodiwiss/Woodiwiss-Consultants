<?php

namespace WoodiwissConsultants;

class Session implements \ArrayAccess, \Iterator
{
	private int $position = 0;
	private array $keys = [];
	private array $session;

	public function __construct()
	{
		$this->position = 0;
		$this->keys = [];
		if (!isset($_SESSION))
			throw new \RuntimeException("Attempted to use session when no session available");
		$this->session = & $_SESSION;
	}

	/**
	 * Starts a new session with safe cookies
	 * Allows unsafe cookie use only on localhost
	 */
	static function StartSession(): void
	{
		if (!isset($_SESSION)) {
			ini_set('session.cookie_httponly', 1);
			ini_set('session.use_only_cookies', 1);
			//Allows insecure cookie for localhost non https connections
			ini_set('session.cookie_samesite', 'None');
			if ($_SERVER['HTTP_HOST'] !== "localhost") {
				ini_set('session.cookie_secure', 1);
			}

			session_start();
		}
	}

	function ClearSession(): void
	{
		foreach ($this->session as $key => $val) {
			unset($this->session[$key]);
		}
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
			return array_key_exists($offset, $this->session);
		}
		else {
			throw new \InvalidArgumentException('Session key must be a string');
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
			return $this->session[$offset];
		}
		else {
			throw new \InvalidArgumentException('Session key name must be a string');
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
			$this->session[$offset] = $value;
		}
		else {
			throw new \InvalidArgumentException('Session key name must be a string');
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
		unset($this->session[$offset]);
	}

	/**
	 * Return the current element
	 * Returns the current element.
	 *
	 * @return mixed
	 */
	function current(): string
	{
		return $this->session[$this->keys[$this->position]];
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
		$this->keys = array_keys($this->session);
	}

	/**
	 * Checks if current position is valid
	 * This method is called after Iterator::rewind() and Iterator::next() to check if the current position is valid.
	 *
	 * @return bool
	 */
	function valid(): bool
	{
		return isset($this->keys[$this->position]) && isset($this->session[$this->keys[$this->position]]);
	}
}