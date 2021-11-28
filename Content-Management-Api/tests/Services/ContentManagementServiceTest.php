<?php

require_once __DIR__ . '/../../src/Services/ContentManagementService.php';

use PHPUnit\Framework\TestCase;
use PHPUnit\Framework\MockObject\MockObject;

use WoodiwissConsultants\ContentManagementService;
use WoodiwissConsultants\EditorContentContext;
use WoodiwissConsultants\DateTimeProvider;
use WoodiwissConsultants\ContentModel;
use WoodiwissConsultants\UpdateContentModel;
use WoodiwissConsultants\EditorContent;
use WoodiwissConsultants\User;

class ContentManagementServiceTest extends TestCase
{
	private ContentManagementService $service;
	private string $testUUID = 'd7405729-cc9f-4784-afb1-27f839df7842';
	private string $testDateTime = '2020-03-03 13:12:11.111111';
	private string $testContent = 'Some Content';
	private array $testDbContent;

	private EditorContent $testDbObject;
	private ContentModel $testContentModel;
	private UpdateContentModel $testUpdateModel;
	private User $testUser;

	private MockObject $mockEditorContentContext;
	private MockObject $mockDateTimeProvider;

	protected function setUp(): void
	{
		$this->mockEditorContentContext = $this->createMock(EditorContentContext::class);
		$this->mockDateTimeProvider = $this->createMock(DateTimeProvider::class);
		$this->mockDateTimeProvider->method('UTCNowString')->willReturn($this->testDateTime);
		$this->service = new ContentManagementService($this->mockEditorContentContext, $this->mockDateTimeProvider);

		$this->testDbContent = [
			'ContentId' => $this->testUUID,
			'Content' => $this->testContent,
			'SomeOther' => 'Field'
		];

		$this->testContentModel = new ContentModel();
		$this->testContentModel->Content = $this->testContent;
		$this->testContentModel->ContentId = $this->testUUID;

		$this->testUpdateModel = new UpdateContentModel();
		$this->testUpdateModel->id = $this->testUUID;
		$this->testUpdateModel->content = $this->testContent . 'lol';

		$this->testUser = new User();
		$this->testUser->Id = 123;

		$this->testDbObject = new EditorContent();
		$this->testDbObject->Id = 1;
		$this->testDbObject->ContentId = $this->testUUID;
		$this->testDbObject->Content = $this->testContent;
		$this->testDbObject->LastModifiedBy = 123;
		$this->testDbObject->LastModifiedDate = $this->testDateTime;
	}

	/** @test */
	public function testContentManagementService_GetContent_ReturnsNullIfContextReturns0Items()
	{
		$this->mockEditorContentContext->expects($this->once())->method('select')->willReturn([]);
		$actual = $this->service->GetContent($this->testUUID);
		$this->assertNull($actual);
	}

	public function testContentManagementService_GetContent_ReturnsNullIfContextReturnsGreaterThan1Items()
	{
		$this->mockEditorContentContext->expects($this->once())->method('select')->willReturn(["this", "shouldn't happen"]);
		$actual = $this->service->GetContent($this->testUUID);
		$this->assertNull($actual);
	}

	public function testContentManagementService_GetContent_ReturnsContentModelIfContextReturns1Item()
	{
		$this->mockEditorContentContext->expects($this->once())->method('select')->willReturn([$this->testDbObject]);
		$actual = $this->service->GetContent($this->testUUID);
		$this->assertEquals($this->testContentModel, $actual);
	}

	/** @test */
	public function testContentManagementService_UpsertContent_ReturnsFalseIfDbFindsNoneAndInsertFails()
	{
		$this->mockEditorContentContext->expects($this->once())->method('select')->willReturn([]);
		$this->mockEditorContentContext->expects($this->once())->method('InsertObj')->willReturn('');

		$this->assertFalse($this->service->UpsertContent($this->testUpdateModel, $this->testUser));
	}

	/** @test */
	public function testContentManagementService_UpsertContent_ReturnsFalseIfDbFindsNoneButInsertSucceeds()
	{
		$this->mockEditorContentContext->expects($this->once())->method('select')->willReturn([]);
		$this->mockEditorContentContext->expects($this->once())->method('InsertObj')->willReturn('ATruthyValue!');

		$this->assertTrue($this->service->UpsertContent($this->testUpdateModel, $this->testUser));
	}

	/** @test */
	public function testContentManagementService_UpsertContent_ReturnsFalseIfDbFindsMoreThanOne()
	{
		$this->mockEditorContentContext->expects($this->once())->method('select')->willReturn(['a', 'b', 'c']);

		$this->assertFalse($this->service->UpsertContent($this->testUpdateModel, $this->testUser));
	}

	/** @test */
	public function testContentManagementService_UpsertContent_ReturnsTrueIfDbFindsOneAndUpdateDoesNotThrow()
	{
		$this->mockEditorContentContext->expects($this->once())->method('select')->willReturn([$this->testDbObject]);
		$this->mockEditorContentContext->expects($this->once())->method('UpdateObj');


		$this->assertTrue($this->service->UpsertContent($this->testUpdateModel, $this->testUser));
	}
	/** @test */
	public function testContentManagementService_UpsertContent_ReturnsFalseIfDbFindsOneAndUpsertThrows()
	{
		$this->mockEditorContentContext->expects($this->once())->method('select')->willReturn([$this->testDbObject]);
		$this->mockEditorContentContext->expects($this->once())->method('UpdateObj')->willThrowException(new \Exception('An error occurred!'));

		$this->assertFalse($this->service->UpsertContent($this->testUpdateModel, $this->testUser));
	}






}