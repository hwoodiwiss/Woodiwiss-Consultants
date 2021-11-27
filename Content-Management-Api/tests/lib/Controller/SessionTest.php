<?php

require_once __DIR__ . '/../../../src/lib/Controller/Session.php';

use PHPUnit\Framework\TestCase;
use WoodiwissConsultants\Session;

class SessionTest extends TestCase
{
	private Session $session;

	protected function setUp(): void
	{
		$_SESSION = [];
		$this->session = new Session();
	}

	public function testCtor_ThrowsIfSessionNotStarted()
	{
		unset($_SESSION);

		try {
			$result = new Session();
		}
		catch (\Exception $e) {
			$this->assertInstanceOf(\RuntimeException::class , $e);
			return;
		}

		$this->fail('Exception not thrown as expected');
	}

	public function testCtor_ConstructsASession()
	{
		$_SESSION = [];

		$actual = new Session();

		$this->assertInstanceOf(Session::class , $actual);
	}

	public function testStartSession_SetsSessionCookieConfig()
	{
		$_SERVER = ['HTTP_HOST' => '192.168.1.1'];
		unset($_SESSION);

		Session::StartSession();

		$this->assertEquals(1, ini_get('session.cookie_httponly'));
		$this->assertEquals(1, ini_get('session.use_only_cookies'));
		$this->assertEquals(1, ini_get('session.cookie_secure'));
	}

	public function testStartSession_SetsSessionCookieConfigForLocalhost()
	{
		$_SERVER = ['HTTP_HOST' => 'localhost'];
		unset($_SESSION);

		Session::StartSession();

		$this->assertEquals(1, ini_get('session.cookie_httponly'));
		$this->assertEquals(1, ini_get('session.use_only_cookies'));
		$this->assertEquals(0, ini_get('session.cookie_secure'));
	}

	public function testStartSession_SetsSessionSuperglobal()
	{
		$_SERVER = ['HTTP_HOST' => '192.168.1.1'];
		unset($_SESSION);

		Session::StartSession();

		$this->assertEquals(true, isset($_SESSION));

	}

	public function testClearSession_EmptiesSessionSuperglobal()
	{
		$_SESSION = ['A' => '1', 'B' => '2', 'C' => '3'];

		$this->session->ClearSession();

		$this->assertCount(0, $_SESSION);
	}

	public function testSession_CorrectlyIterable()
	{
		$_SESSION = ['A' => '1', 'B' => '2', 'C' => '3'];
		$actual = [];
		foreach ($this->session as $key => $val) {
			$actual[$key] = $val;
		}

		$this->assertEquals($_SESSION, $actual);
	}
}