import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AppImage } from '../app-images';
import { ImageApiService } from './api/imageApi.service';
import { ImageService } from './image.service';

const testImages: AppImage[] = [
	{
		description: 'Alt1',
		image_sizes: {
			thumbnail: {
				uri: 'Path1/thumb',
				width: 200,
				height: 200,
			},
			optimal: {
				uri: 'Path1/optimal',
				width: 1920,
				height: 200,
			},
		},
	},
	{
		description: 'Alt2',
		image_sizes: {
			thumbnail: {
				uri: 'Path2/thumb',
				width: 200,
				height: 200,
			},
			optimal: {
				uri: 'Path2/optimal',
				width: 1920,
				height: 200,
			},
		},
	},
	{
		description: 'Alt3',
		image_sizes: {
			thumbnail: {
				uri: 'Path3/thumb',
				width: 200,
				height: 200,
			},
			optimal: {
				uri: 'Path3/optimal',
				width: 1920,
				height: 200,
			},
		},
	},
	{
		description: 'Alt4',
		image_sizes: {
			thumbnail: {
				uri: 'Path4/thumb',
				width: 200,
				height: 200,
			},
			optimal: {
				uri: 'Path4/optimal',
				width: 1920,
				height: 200,
			},
		},
	},
];

describe('ImageService', () => {
	let service: ImageService;
	let imageApi: ImageApiService;
	const mockApiService = {
		images: jest.fn().mockReturnValue(of([])),
		add_image: jest.fn(),
	};

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			imports: [HttpClientTestingModule],
			providers: [
				{
					provide: ImageApiService,
					useValue: mockApiService,
				},
			],
		}).compileComponents();
	});

	beforeEach(() => {
		service = TestBed.inject(ImageService);
		imageApi = TestBed.inject(ImageApiService);
	});

	it('should construct', () => {
		expect(service).toBeTruthy();
	});

	it('should set images from API on construct', () => {
		mockApiService.images.mockReturnValue(of(testImages));
		let service = new ImageService(imageApi);
		expect(service.getImages()).toBe(testImages);
	});

	it('should add image to images on successful upload', async () => {
		const expected_buffer = new ArrayBuffer(123);
		const expectedAddedImage: AppImage = {
			description: '',
			image_sizes: {
				thumbnail: { uri: 'Path2/thumb', width: 200, height: 200 },
			},
		};

		mockApiService.add_image.mockReturnValue(of(expectedAddedImage));
		const mockFile = {
			arrayBuffer: jest.fn().mockResolvedValue(expected_buffer),
		};

		await service.addImage(mockFile as any as File);
		expect(mockApiService.add_image).toBeCalledWith(expected_buffer);

		expect(service.getImages()).toContain(expectedAddedImage);
	});
});
