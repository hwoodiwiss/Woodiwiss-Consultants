<?php

namespace WoodiwissConsultants;

include_once __DIR__ . '/Interface/IResult.php';

class RedirectResult implements IResult
{

	public function __construct(private string $uri, private bool $permenant = false)
	{

	}

	/**
	 * function StatusCode
	 *
	 * @return int Status Code to send to user
	 */
	function StatusCode(): int
	{
		return $this->permenant ? 301 : 302;
	}

	/**
	 * function Body
	 *
	 * @return string|null Data to return to the user
	 */
	function Body(): ?string
	{
		return null;
	}
}