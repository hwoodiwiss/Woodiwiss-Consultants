<?php

class TestMapperObject
{
	public string $testName;
	public int $testNumber;
	public TestMapperChild $child;
}

class TestMapperObjectPrivate
{
	private string $testName;
	public int $testNumber;
	public TestMapperChild $child;

	public function getTestNameIsSet()
	{
		return isset($this->testName);
	}
}

class TestMapperObjectNullableChild
{
	public string $testName;
	public int $testNumber;
	public ?TestMapperChild $child;

}

class TestMapperObjectWithArray
{
	public string $testName;
	public int $testNumber;
	public array $children;
}

class TestMapperChild
{
	public string $testName;
	public int $testNumber;
}