<?php

require_once __DIR__ . '/../../src/lib/utils.php';

use PHPUnit\Framework\TestCase;
use WoodiwissConsultants\Utils;

class UtilsTest extends TestCase
{
	protected function setUp(): void
	{

	}


	public function testUtils_GenerateRandomString_GeneratesRandomString()
	{
		//With default params, GenerateRandomString should have a randomness of 62^10, chances of repeat in 1000 iters is vanishingly small
		$prevGenerated = [];
		for ($i = 0; $i < 1000; $i++) {
			$newItem = Utils::GenerateRandomString();

			$this->assertNotContains($newItem, $prevGenerated);
			$prevGenerated[] = $newItem;
		}
	}
	public function testUtils_GenerateRandomString_GeneratesStringOfLength()
	{
		for ($i = 0; $i < 100; $i++) {
			$random = Utils::GenerateRandomString($i);

			$this->assertEquals($i, strlen($random));
		}
	}

	public function testUtils_CurrentDateTime_GetsAValidDateTime()
	{
		$dateTimeString = Utils::CurrentDateTime();
		$dateTime = \DateTime::createFromFormat('Y-m-d H:i:s.u', $dateTimeString);

		$this->assertNotEquals(false, $dateTime);
	}

	public function testUtils_SafeGetValue_ReturnsValuesFromAssocArray()
	{
		$expected = 'TestExpected';
		$testData = ['testItem' => 'no', 'testItem2' => $expected];
		$actual = Utils::SafeGetValue($testData, 'testItem2');

		$this->assertEquals($expected, $actual);
	}

	public function testUtils_SafeGetValue_ReturnsNullWhenNoValueExistsForKey()
	{
		$testData = ['testItem' => 'no', 'testItem2' => 'yes'];
		$actual = Utils::SafeGetValue($testData, 'testItem3');

		$this->assertNull($actual);
	}

	public function testUtils_GetClassAnnotations_ReturnsAnnotationsConvertedFromDocBlock()
	{
		$expectedOutput = ['classThing' => 'testThing', 'table' => 'testTable'];

		$result = Utils::GetClassAnnotations(AnnotationTestClass::class);

		$this->assertEquals($expectedOutput, $result);
	}

	public function testUtils_GetClassAnnotations_ThrowsForInvalidClassName()
	{
		try {
			$result = Utils::GetClassAnnotations('NoTaClAsS');
		}
		catch (\Exception $e) {
			$this->assertInstanceOf(\ReflectionException::class , $e);
			return;
		}

		$this->fail('Exception was not thrown as expected');
	}

	public function testUtils_GetPropertyAnnotations_ReturnsAnnotationsConvertedFromDocBlock()
	{
		$expectedOutput = ['var' => 'int', 'property' => 'int'];

		$result = Utils::GetPropertyAnnotations(AnnotationTestClass::class , 'annotationTestProperty');

		$this->assertEquals($expectedOutput, $result);
	}

	public function testUtils_GetPropertyAnnotations_ThrowsForInvalidClassName()
	{
		try {
			$result = Utils::GetPropertyAnnotations('NoTaClAsS', 'annotationTestProperty');
		}
		catch (\Exception $e) {
			$this->assertInstanceOf(\ReflectionException::class , $e);
			return;
		}

		$this->fail('Exception was not thrown as expected');
	}

	public function testUtils_GetPropertyAnnotations_ThrowsForInvalidPropertyName()
	{
		try {
			$result = Utils::GetPropertyAnnotations(AnnotationTestClass::class , 'fakeProperty');
		}
		catch (\Exception $e) {
			$this->assertInstanceOf(\ReflectionException::class , $e);
			return;
		}

		$this->fail('Exception was not thrown as expected');
	}

	public function testUtils_GetMethodAnnotations_ReturnsAnnotationsConvertedFromDocBlock()
	{
		$expectedOutput = ['method' => 'method', 'attribute' => 'attr'];

		$result = Utils::GetMethodAnnotations(AnnotationTestClass::class , 'AnnotationTestMethod');

		$this->assertEquals($expectedOutput, $result);
	}

	public function testUtils_GetMethodAnnotations_ThrowsForInvalidClassName()
	{
		try {
			$result = Utils::GetMethodAnnotations('NoTaClAsS', 'AnnotationTestMethod');
		}
		catch (\Exception $e) {
			$this->assertInstanceOf(\ReflectionException::class , $e);
			return;
		}

		$this->fail('Exception was not thrown as expected');
	}

	public function testUtils_GetMethodAnnotations_ThrowsForInvalidMethodName()
	{
		try {
			$result = Utils::GetMethodAnnotations(AnnotationTestClass::class , 'fakeProperty');
		}
		catch (\Exception $e) {
			$this->assertInstanceOf(\ReflectionException::class , $e);
			return;
		}

		$this->fail('Exception was not thrown as expected');
	}

}

/**
 * @table testTable
 * @classThing testThing
 */
class AnnotationTestClass
{

	/**
	 * @var int
	 * @property int
	 */
	public $annotationTestProperty;

	/**
	 * @method method
	 * @attribute attr
	 */
	public function AnnotationTestMethod()
	{
	}
}