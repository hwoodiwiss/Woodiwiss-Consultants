<?php

require_once __DIR__ . '/../TestData/MapperTestModels.php';
require_once __DIR__ . '/../../src/lib/validator.php';

use PHPUnit\Framework\TestCase;
use WoodiwissConsultants\Mapper;
use WoodiwissConsultants\Validator;

class ValidatorTest extends TestCase
{
	public string $testMapperObjectJson;
	public string $testMapperObjectIncomplete;
	public string $testMapperObjectWithArray;
	public string $testMapperObjectWithIncorrect;

	protected function setUp(): void
	{
		$this->testMapperObjectJson = file_get_contents(__DIR__ . '/../TestData/TestMapperObject.json');
		$this->testMapperObjectIncomplete = file_get_contents(__DIR__ . '/../TestData/TestMapperObjectIncomplete.json');
		$this->testMapperObjectWithArray = file_get_contents(__DIR__ . '/../TestData/TestMapperObjectWithArray.json');
		$this->testMapperObjectWithIncorrect = file_get_contents(__DIR__ . '/../TestData/TestMapperObjectWithIncorrect.json');
	}

	public function testValidator_ValidateReturnsTrueForValidObjects()
	{
		$mapper = new Mapper(TestMapperObject::class);
		$validator = new Validator(TestMapperObject::class);
		$object = $mapper->map(json_decode($this->testMapperObjectJson));
		$this->assertTrue($validator->validate($object));
	}

	public function testValidator_ValidateReturnsFalseForIncompleteObjects()
	{
		$mapper = new Mapper(TestMapperObject::class);
		$validator = new Validator(TestMapperObject::class);
		$object = $mapper->map(json_decode($this->testMapperObjectIncomplete));
		$this->assertFalse($validator->validate($object));
	}

	public function testValidator_ValidateReturnsTrueForIncompleteNullableObjects()
	{
		$mapper = new Mapper(TestMapperObjectNullableChild::class);
		$validator = new Validator(TestMapperObjectNullableChild::class);
		$object = $mapper->map(json_decode($this->testMapperObjectIncomplete));
		$this->assertTrue($validator->validate($object));
	}

	public function testValidator_ValidateReturnsFalseForIncorrectObjects()
	{
		$mapper = new Mapper(TestMapperObject::class);
		$validator = new Validator(TestMapperChild::class);
		$object = $mapper->map(json_decode($this->testMapperObjectJson));
		$this->assertFalse($validator->validate($object));
	}

	public function testValidator_ValidateReturnsFalseForNull()
	{
		$validator = new Validator(TestMapperChild::class);
		$this->assertFalse($validator->validate(null));
	}

}