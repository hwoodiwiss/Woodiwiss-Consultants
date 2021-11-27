<?php

namespace WoodiwissConsultants;

require_once __DIR__ . '/validator.php';

/**
 * class Mapper
 * Maps data from anonymous objects and arrays to concretes
 * Limitations: Mapping to arrays is imperfect, as arrays cannot store type
 */
class Mapper
{

	private \ReflectionClass $reflectedType;

	public function __construct(public string $type) {
		$this->reflectedType = new \ReflectionClass($type);
	}

	public function map(object | array | null $data): object|null {
		if($data === null) return null;
		if(gettype($data) === 'object') return $this->map_object($this->reflectedType, $data);
		if(is_array($data)) return $this->map_array($this->reflectedType, $data);
	}

	private function map_object(\ReflectionClass $class, object $data) {
		$dataVars = get_object_vars($data);
		return $this->map_array($class, $dataVars);
	}

	private function map_array(\ReflectionClass $class, array $data) {
		$mappedObject = null;
		$objectProperties = array_combine(array_map(function (\ReflectionProperty $property) {
			return $property->getName();
		}, $class->getProperties(\ReflectionProperty::IS_PUBLIC)), $class->getProperties(\ReflectionProperty::IS_PUBLIC));
		$setProperties = [];

		foreach($data as $key => $value) {
			if(isset($objectProperties[$key])) {
				$setProperties[] = $key;
				/** @var \ReflectionProperty*/ $prop = $objectProperties[$key];
				if($mappedObject === null) $mappedObject = $class->newInstance();
				if($prop instanceof \ReflectionProperty && $prop->getType()->getName() !== 'array') {
					if(gettype($data[$key]) === 'object'){
						$mappedObject->$key = $this->map_object(new \ReflectionClass($prop->getType()->getName()), $data[$key]);
					} else if (is_array($data[$key])) {
						$mappedObject->$key = $this->map_array(new \ReflectionClass($prop->getType()->getName()), $data[$key]);
					} else {
						$mappedObject->$key = $value;
					}
				} else {
					$mappedObject->$key = $data[$key];
				}
			}
		}
		
		if($mappedObject !== null) {
			foreach(array_diff(array_keys($objectProperties), $setProperties) as $unsetKey) {
				if(isset($objectProperties[$unsetKey])){
					/** @var \ReflectionProperty*/ $prop = $objectProperties[$unsetKey];
					if($prop instanceof \ReflectionProperty && $prop->getType()->allowsNull()) {
						$mappedObject->$unsetKey = null;
					}
				}
			}
		}

		return $mappedObject;
	}

	public function getValidator(): Validator
	{
		return new Validator($this->type);
	}
}