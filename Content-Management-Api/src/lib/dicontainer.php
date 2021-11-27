<?php

namespace WoodiwissConsultants;

class DiContainer
{
	private array $services;
	private array $loadedServices;

	public function __construct()
	{
		$this->services = [];
		$this->loadedServices = [];
	}

	public function addInjectable(string $injectionType, string|object|null $injectable = null): DiContainer
	{
		if ($injectable === null) {
			$injectReflectedType = new \ReflectionClass($injectionType);
			$this->services[$injectionType] = function () use ($injectReflectedType) {
				$injectableArgs = $this->getInjectablesForType($injectReflectedType->getName());
				return $injectReflectedType->newInstanceArgs($injectableArgs);
			};
		}
		else if (gettype($injectable) === 'string') {
			$injectReflectedType = new \ReflectionClass($injectable);
			$this->services[$injectionType] = function () use ($injectReflectedType) {
				$injectableArgs = $this->getInjectablesForType($injectReflectedType->getName());
				return $injectReflectedType->newInstanceArgs($injectableArgs);
			};
		}
		else {
			$injectableReflectedType = new \ReflectionClass($injectable);
			$injectableParent = $injectableReflectedType->getParentClass();
			if ($injectionType === $injectableReflectedType->getName() ||
			($injectableParent !== false && $injectionType === $injectableParent)) {
				$this->loadedServices[$injectionType] = $this->services[$injectionType] = $injectable;
			}
			else {
				$injectableReflectedName = $injectableReflectedType->getName();
				throw new \Error("$injectableReflectedName is not a $injectionType or a child of $injectionType");
			}
		}

		return $this;
	}

	public function getInjectablesForType(string $type): array
	{
		$injectables = [];
		$reflectedType = new \ReflectionClass($type);
		$typeCtor = $reflectedType->getConstructor();
		if ($typeCtor === null)
			throw new \Error('Cannot inject into types without a constructor');
		$typeCtorParams = $typeCtor->getParameters();
		foreach ($typeCtorParams as $param) {
			/** @var \ReflectionNamedType */$paramType = $param->getType();
			$paramTypeName = $paramType->getName();
			if (isset($this->services[$paramTypeName])) {
				$injectables[] = isset($this->loadedServices[$paramTypeName]) ? $this->loadedServices[$paramTypeName]
					: $this->loadedServices[$paramTypeName] = $this->services[$paramTypeName]();
				continue;
			}

			$paramClass = new \ReflectionClass($paramTypeName);
			/** @var \ReflectionClass */$paramParent = $paramClass->getParentClass();
			if ($paramParent !== false) {
				if (isset($this->services[$paramParent->getName()])) {
					$injectables[] = isset($this->loadedServices[$paramParent->getName()]) ? $this->loadedServices[$paramParent->getName()]
						: $this->loadedServices[$paramParent->getName()] = $this->services[$paramParent->getName()]();
					continue;
				}
			}

			throw new \Error("Could not inject parameter of type $paramTypeName");
		}

		return $injectables;
	}
}