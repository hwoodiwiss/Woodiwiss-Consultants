<?php

require_once __DIR__ . '/../../src/Providers/DateTimeProvider.php';


use PHPUnit\Framework\TestCase;
use WoodiwissConsultants\DateTimeProvider;

class DateTimeProviderTest extends TestCase
{
	//Cannot test "Now" related functions as I can't manipulate time.
	private DateTimeProvider $provider;

	protected function setUp(): void
	{
		$this->provider = new DateTimeProvider();
	}

	/** @test */
	public function testDateTimeProvider_getFormat_ReturnsISODateFormat()
	{
		$actual = $this->provider->getFormat();
		$this->assertEquals('Y-m-d H:i:s.u', $actual);
	}

	/** @test */
	public function testDateTimeProvider_DateTimeString_ReturnsADateTimeISOFormatted()
	{
		$expected_date = '2020-03-03 13:12:11.111111';
		$date_time = new \DateTime($expected_date);
		$actual = $this->provider->DateTimeString($date_time);
		$this->assertEquals('2020-03-03 13:12:11.111111', $actual);
	}




}