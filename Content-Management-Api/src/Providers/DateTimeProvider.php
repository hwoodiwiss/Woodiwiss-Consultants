<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/../lib/includes.php';

class DateTimeProvider
{

	private string $formatString = 'Y-m-d H:i:s.u';

	public function __construct()
	{
	}

	public function getFormat()
	{
		return $this->formatString;
	}

	public function UTCNow(): \DateTime
	{
		return new \DateTime('now', new \DateTimezone('UTC'));
	}

	public function UTCNowString(): string
	{
		return $this->UTCNow()->format($this->formatString);
	}

	public function DateTimeString(\DateTime $dt): string
	{
		return $dt->format($this->formatString);
	}
}