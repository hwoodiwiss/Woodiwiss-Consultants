<?php

namespace WoodiwissConsultants;

class Utils
{
	static function GenerateRandomString($length = 10): string
	{
		$Chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
		$NumChars = strlen($Chars);
		$randomString = '';
		for ($i = 0; $i < $length; $i++) {
			$randomString .= $Chars[rand(0, $NumChars - 1)];
		}

		return $randomString;
	}

	//Gets the current date and time in UTC
	static function CurrentDateTime(): string
	{
		$dt = new \DateTime('now', new \DateTimezone('UTC'));
		$currTime = $dt->format('Y-m-d H:i:s.u');
		return $currTime;
	}

	//Safeley gets a value from an array if it exists, or null if it doesn't
	static function SafeGetValue(array $dataArray, string $valName)
	{
		if (array_key_exists($valName, $dataArray)) {
			return $dataArray[$valName];
		}
		else {
			return null;
		}
	}

	//Gets an assoc array of annotations on a class, parsed from documentation comments
	static function GetClassAnnotations(string $ClassName): array
	{
		$classReflection = new \ReflectionClass($ClassName);
		$docComment = $classReflection->getDocComment();
		return Utils::GetAnnotationsFromDocComment($docComment);
	}

	//Gets an assoc array of annotations on a class property, parsed from documentation comments
	static function GetPropertyAnnotations(string $ClassName, string $Property): array
	{
		$propReflection = new \ReflectionProperty($ClassName, $Property);
		$docComment = $propReflection->getDocComment();
		return Utils::GetAnnotationsFromDocComment($docComment);
	}

	static function GetMethodAnnotations(string $ClassName, string $Method): array
	{
		$methodReflection = new \ReflectionMethod($ClassName, $Method);
		$docComment = $methodReflection->getDocComment();
		return Utils::GetAnnotationsFromDocComment($docComment);
	}

	private static function GetAnnotationsFromDocComment(string $docComment): array
	{
		$Annotations = array();
		if ($docComment != false) {
			$docComment = str_replace("/**", "", $docComment);
			$docComment = str_replace("*/", "", $docComment);
			$docComment = str_replace("*", "", $docComment);
			$docDataAnnots = explode("@", $docComment);
			foreach ($docDataAnnots as $value) {
				$value = trim($value);
				$keyVal = explode(" ", $value);
				if (count($keyVal) == 2) {
					$Annotations[$keyVal[0]] = $keyVal[1];
				}
			}
		}

		return $Annotations;
	}

	public function NewGuid(): string
	{
		if (function_exists('com_create_guid'))
			return trim(com_create_guid(), '{}');

		$data = random_bytes(16);

		$data[6] = chr(ord($data[6]) & 0x0f | 0x40); // set version to 0100
		$data[8] = chr(ord($data[8]) & 0x3f | 0x80); // set bits 6-7 to 10

		return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
	}
}
