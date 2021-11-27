<?php

require_once __DIR__ . '/../TestData/MapperTestModels.php';
require_once __DIR__ . '/../../src/lib/mapper.php';

use PHPUnit\Framework\TestCase;
use WoodiwissConsultants\Mapper;
use WoodiwissConsultants\Validator;

class MapperTest extends TestCase
{
	public string $testMapperObjectJson;
	public string $testMapperObjectIncompleteJson;
	public string $testMapperObjectWithArrayJson;
	public string $testMapperObjectWithIncorrectJson;

	protected function setUp(): void
	{
		$this->testMapperObjectJson = file_get_contents(__DIR__ . '/../TestData/TestMapperObject.json');
		$this->testMapperObjectIncompleteJson = file_get_contents(__DIR__ . '/../TestData/TestMapperObjectIncomplete.json');
		$this->testMapperObjectWithArrayJson = file_get_contents(__DIR__ . '/../TestData/TestMapperObjectWithArray.json');
		$this->testMapperObjectWithIncorrectJson = file_get_contents(__DIR__ . '/../TestData/TestMapperObjectWithIncorrect.json');
	}

	public function testMapper_MapsObjectsToObjects()
	{
		$mapper = new Mapper(TestMapperObject::class);
		$result = $mapper->map(json_decode($this->testMapperObjectJson));

		if (!$result instanceof TestMapperObject)
			$this->fail();

		$this->assertEquals("Test Text", $result->testName);
		$this->assertEquals(69, $result->testNumber);
		$this->assertInstanceOf(TestMapperChild::class , $result->child);
		$this->assertEquals("Test Text", $result->child->testName);
		$this->assertEquals(69, $result->child->testNumber);
	}

	public function testMapper_MapsAssocArraysToObjects()
	{
		$mapper = new Mapper(TestMapperObject::class);
		$result = $mapper->map(json_decode($this->testMapperObjectJson, true));

		if (!$result instanceof TestMapperObject)
			$this->fail();

		$this->assertEquals("Test Text", $result->testName);
		$this->assertEquals(69, $result->testNumber);
		$this->assertInstanceOf(TestMapperChild::class , $result->child);
		$this->assertEquals("Test Text", $result->child->testName);
		$this->assertEquals(69, $result->child->testNumber);
	}

	public function testMapper_MapsPartialObjectsToObjects()
	{
		$mapper = new Mapper(TestMapperObject::class);
		$result = $mapper->map(json_decode($this->testMapperObjectIncompleteJson));

		if (!$result instanceof TestMapperObject)
			$this->fail();

		$this->assertEquals("Test Text", $result->testName);
		$this->assertEquals(69, $result->testNumber);
		try {
			$test = $result->child;
			$this->fail('Object has been initialized with garbage.');
		}
		catch (\Error $e) {
		}
	}

	public function testMapper_MapsPartialArraysToObjects()
	{
		$mapper = new Mapper(TestMapperObject::class);
		$result = $mapper->map(json_decode($this->testMapperObjectIncompleteJson, true));

		if (!$result instanceof TestMapperObject)
			$this->fail();

		$this->assertEquals("Test Text", $result->testName);
		$this->assertEquals(69, $result->testNumber);
		try {
			$test = $result->child;
			$this->fail('Object has been initialized with garbage.');
		}
		catch (\Error $e) {
		}
	}

	public function testMapper_MapsPartialArraysToNullableObjects()
	{
		$mapper = new Mapper(TestMapperObjectNullableChild::class);
		$result = $mapper->map(json_decode($this->testMapperObjectIncompleteJson, true));

		if (!$result instanceof TestMapperObjectNullableChild)
			$this->fail();

		$this->assertEquals("Test Text", $result->testName);
		$this->assertEquals(69, $result->testNumber);
		$this->assertNull($result->child);
	}

	public function testMapper_MapsObjectsToObjectsWithArrays()
	{
		$mapper = new Mapper(TestMapperObjectWithArray::class);
		$result = $mapper->map(json_decode($this->testMapperObjectWithArrayJson));

		if (!$result instanceof TestMapperObjectWithArray)
			$this->fail();

		$this->assertEquals("Test Text", $result->testName);
		$this->assertEquals(69, $result->testNumber);
		$this->assertEquals(2, count($result->children));

	}

	public function testMapper_MapsAssocArraysToObjectsWithArrays()
	{
		$mapper = new Mapper(TestMapperObjectWithArray::class);
		$result = $mapper->map(json_decode($this->testMapperObjectWithArrayJson, true));

		if (!$result instanceof TestMapperObjectWithArray)
			$this->fail();

		$this->assertEquals("Test Text", $result->testName);
		$this->assertEquals(69, $result->testNumber);
		$this->assertEquals(2, count($result->children));
	}

	public function testMapper_DoesNotMapEntirelyIncorrectData()
	{
		$mapper = new Mapper(TestMapperObject::class);
		$result = $mapper->map(json_decode($this->testMapperObjectWithIncorrectJson, true));


		if ($result instanceof TestMapperObject)
			$this->fail();

		$this->assertNull($result);

	}

	public function testMapper_MapsCommonFieldsBetweenObjects()
	{
		$mapper = new Mapper(TestMapperObject::class);
		$childMapper = new Mapper(TestMapperChild::class);
		/** @var TestMapperObject */$mapperObj = $mapper->map(json_decode($this->testMapperObjectJson, true));
		/** @var TestMapperChild */$actual = $childMapper->map($mapperObj);

		$this->assertEquals($mapperObj->testName, $actual->testName);
		$this->assertEquals($mapperObj->testNumber, $actual->testNumber);
	}

	public function testMapper_ReturnsNullIfNoFieldsMapped()
	{
		$mapper = new Mapper(TestMapperObjectNullableChild::class);
		$result = $mapper->map(json_decode($this->testMapperObjectWithIncorrectJson, true));


		if ($result instanceof TestMapperObjectNullableChild)
			$this->fail();

		$this->assertNull($result);

	}

	public function testMapper_ReturnsNullIfInputIsNull()
	{
		$mapper = new Mapper(TestMapperObjectNullableChild::class);
		$result = $mapper->map(null);


		if ($result instanceof TestMapperObjectNullableChild)
			$this->fail();

		$this->assertNull($result);

	}

	public function testMapper_GetValidatorReturnsValidatorOfType()
	{
		$mapper = new Mapper(TestMapperObject::class);
		$validator = $mapper->getValidator();
		$this->assertInstanceOf(Validator::class , $validator);
		$this->assertEquals(TestMapperObject::class , $validator->type);
	}

	public function testMapper_IgnoresPrivateMembers()
	{
		$mapper = new Mapper(TestMapperObjectPrivate::class);
		$result = $mapper->map(json_decode($this->testMapperObjectJson, true));

		if (!$result instanceof TestMapperObjectPrivate)
			$this->fail();

		$this->assertFalse($result->getTestNameIsSet());
		$this->assertEquals(69, $result->testNumber);
		$this->assertInstanceOf(TestMapperChild::class , $result->child);
		$this->assertEquals("Test Text", $result->child->testName);
		$this->assertEquals(69, $result->child->testNumber);
	}

}
