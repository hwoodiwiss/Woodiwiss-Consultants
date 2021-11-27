<?php

namespace WoodiwissConsultants;


class Validator
{

	private \ReflectionClass $reflectedType;

	public function __construct(public string $type)
	{
		$this->reflectedType = new \ReflectionClass($type);
	}

	public function validate(?object $object): bool {
		//Quick escape if null
		if($object === null) return false;

		//Quick escape if not an instance of type
		if(!$this->reflectedType->isInstance($object)) return false;

		$properties = $this->reflectedType->getProperties();

		foreach($properties as /** @var \ReflectionProperty*/ $property) {
			if($property instanceof \ReflectionProperty) {
				//Uninitialized is a fail
				if(!$property->isInitialized($object)) return false;

				$propName = $property->getName();
				//Skip validation for nullable nulls, we know they're in a valid state
				if ($property->getType()->allowsNull() && $object->$propName === null) {
					continue;
				}

				//Validate that non-builtin properties are valid
				if(!$property->getType()->isBuiltIn()) {
					$childValidator = new Validator($property->getType()->getName());
					if(!$childValidator->validate($object->$propName)) {
						return false;
					}
				}
			}
		}

		return true;
	}
}