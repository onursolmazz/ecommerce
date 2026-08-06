<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\StockHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = max(
                1,
                min((int) $request->input('per_page', 12), 50)
            );

            $query = Product::query()
                ->with([
                    'category',
                    'seller',
                    'images',
                ])
                ->withCount([
                    'reviews',
                    'favorites',
                ])
                ->withAvg('reviews', 'rating');

            if ($request->filled('search')) {
                $search = trim((string) $request->input('search'));

                $query->where(function ($builder) use ($search) {
                    $builder
                        ->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%")
                        ->orWhereHas('category', function ($categoryQuery) use ($search) {
                            $categoryQuery->where(
                                'name',
                                'like',
                                "%{$search}%"
                            );
                        });
                });
            }

            if ($request->filled('category_id')) {
                $query->where(
                    'category_id',
                    $request->integer('category_id')
                );
            }

            if ($request->filled('category')) {
                $category = $request->input('category');

                $query->whereHas('category', function ($categoryQuery) use ($category) {
                    $categoryQuery->where(function ($builder) use ($category) {
                        $builder->where('slug', $category);

                        if (is_numeric($category)) {
                            $builder->orWhere('id', (int) $category);
                        }
                    });
                });
            }

            if ($request->filled('seller_id')) {
                $query->where(
                    'seller_id',
                    $request->integer('seller_id')
                );
            }

            if ($request->filled('min_price')) {
                $query->where(
                    'price',
                    '>=',
                    (float) $request->input('min_price')
                );
            }

            if ($request->filled('max_price')) {
                $query->where(
                    'price',
                    '<=',
                    (float) $request->input('max_price')
                );
            }

            if ($request->has('status')) {
                $query->where(
                    'status',
                    $request->boolean('status')
                );
            }

            if ($request->boolean('in_stock')) {
                $query->where('stock', '>', 0);
            }

            switch ($request->input('sort', 'latest')) {
                case 'popular':
                    $query
                        ->orderByDesc('reviews_count')
                        ->orderByDesc('favorites_count')
                        ->orderByDesc('reviews_avg_rating')
                        ->latest('id');
                    break;

                case 'rating':
                    $query
                        ->orderByDesc('reviews_avg_rating')
                        ->orderByDesc('reviews_count')
                        ->latest('id');
                    break;

                case 'price_asc':
                    $query
                        ->orderBy('price')
                        ->latest('id');
                    break;

                case 'price_desc':
                    $query
                        ->orderByDesc('price')
                        ->latest('id');
                    break;

                case 'name_asc':
                    $query->orderBy('name');
                    break;

                case 'name_desc':
                    $query->orderByDesc('name');
                    break;

                case 'oldest':
                    $query->oldest();
                    break;

                case 'latest':
                default:
                    $query->latest();
                    break;
            }

            $products = $query
                ->paginate($perPage)
                ->withQueryString();

            return response()->json([
                'success' => true,
                'message' => 'Ürünler getirildi.',
                'data' => ProductResource::collection(
                    $products->getCollection()
                ),
                'meta' => [
                    'current_page' => $products->currentPage(),
                    'last_page' => $products->lastPage(),
                    'per_page' => $products->perPage(),
                    'total' => $products->total(),
                    'from' => $products->firstItem(),
                    'to' => $products->lastItem(),
                ],
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Ürünler getirilemedi.',
                'error' => app()->isLocal()
                    ? $exception->getMessage()
                    : null,
            ], 500);
        }
    }

    public function show(Product $product): JsonResponse
    {
        $product->load([
            'category',
            'seller',
            'images',
            'reviews.user',
        ]);

        $product->loadCount([
            'reviews',
            'favorites',
        ]);

        $product->loadAvg('reviews', 'rating');

        return response()->json([
            'success' => true,
            'message' => 'Ürün başarıyla getirildi.',
            'data' => new ProductResource($product),
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        try {
            $product = DB::transaction(function () use ($request) {
                $product = Product::create([
                    'category_id' => $request->integer('category_id'),
                    'seller_id' => Auth::id(),
                    'name' => $request->input('name'),
                    'slug' => $this->generateUniqueSlug(
                        $request->input('name')
                    ),
                    'description' => $request->input('description'),
                    'price' => $request->input('price'),
                    'stock' => $request->integer('stock'),
                    'status' => $request->boolean('status'),
                ]);

                if ($request->hasFile('images')) {
                    foreach ($request->file('images') as $index => $image) {
                        $path = $image->store('products', 'public');

                        ProductImage::create([
                            'product_id' => $product->id,
                            'image' => $path,
                            'is_primary' => $index === 0,
                        ]);
                    }
                }

                if ($product->stock > 0) {
                    StockHistory::create([
                        'product_id' => $product->id,
                        'user_id' => Auth::id(),
                        'type' => 'create',
                        'quantity' => $product->stock,
                        'description' => 'Başlangıç stoğu oluşturuldu.',
                    ]);
                }

                return $product;
            });

            $product->load([
                'category',
                'seller',
                'images',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ürün başarıyla oluşturuldu.',
                'data' => new ProductResource($product),
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Ürün oluşturulamadı.',
                'error' => app()->isLocal()
                    ? $exception->getMessage()
                    : null,
            ], 500);
        }
    }

    public function update(
        UpdateProductRequest $request,
        Product $product
    ): JsonResponse {
        try {
            DB::transaction(function () use ($request, $product) {
                $oldStock = (int) $product->stock;
                $newStock = $request->integer('stock');

                $product->update([
                    'category_id' => $request->integer('category_id'),
                    'name' => $request->input('name'),
                    'slug' => $this->generateUniqueSlug(
                        $request->input('name'),
                        $product->id
                    ),
                    'description' => $request->input('description'),
                    'price' => $request->input('price'),
                    'stock' => $newStock,
                    'status' => $request->boolean('status'),
                ]);

                if ($request->filled('deleted_images')) {
                    $deletedImageIds = collect(
                        $request->input('deleted_images')
                    )
                        ->filter()
                        ->map(fn($id) => (int) $id)
                        ->values()
                        ->all();

                    $images = ProductImage::query()
                        ->where('product_id', $product->id)
                        ->whereIn('id', $deletedImageIds)
                        ->get();

                    foreach ($images as $image) {
                        Storage::disk('public')->delete($image->image);
                        $image->delete();
                    }
                }

                if ($request->hasFile('images')) {
                    $hasPrimaryImage = ProductImage::query()
                        ->where('product_id', $product->id)
                        ->where('is_primary', true)
                        ->exists();

                    foreach ($request->file('images') as $index => $image) {
                        $path = $image->store('products', 'public');

                        ProductImage::create([
                            'product_id' => $product->id,
                            'image' => $path,
                            'is_primary' => !$hasPrimaryImage && $index === 0,
                        ]);
                    }
                }

                if ($request->filled('primary_image_id')) {
                    $primaryImage = ProductImage::query()
                        ->where('product_id', $product->id)
                        ->findOrFail(
                            $request->integer('primary_image_id')
                        );

                    ProductImage::query()
                        ->where('product_id', $product->id)
                        ->update([
                            'is_primary' => false,
                        ]);

                    $primaryImage->update([
                        'is_primary' => true,
                    ]);
                }

                $hasPrimaryImage = ProductImage::query()
                    ->where('product_id', $product->id)
                    ->where('is_primary', true)
                    ->exists();

                if (!$hasPrimaryImage) {
                    ProductImage::query()
                        ->where('product_id', $product->id)
                        ->oldest('id')
                        ->first()
                        ?->update([
                            'is_primary' => true,
                        ]);
                }

                if ($oldStock !== $newStock) {
                    StockHistory::create([
                        'product_id' => $product->id,
                        'user_id' => Auth::id(),
                        'type' => 'update',
                        'quantity' => $newStock - $oldStock,
                        'description' => 'Stok güncellendi.',
                    ]);
                }
            });

            $product->refresh()->load([
                'category',
                'seller',
                'images',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ürün başarıyla güncellendi.',
                'data' => new ProductResource($product),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Ürün güncellenemedi.',
                'error' => app()->isLocal()
                    ? $exception->getMessage()
                    : null,
            ], 500);
        }
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ürün başarıyla silindi.',
            'data' => [
                'id' => $product->id,
                'deleted_at' => $product->deleted_at,
            ],
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $product = Product::withTrashed()->findOrFail($id);

        if (!$product->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Ürün zaten aktif durumda.',
            ], 422);
        }

        $product->restore();

        $product->load([
            'category',
            'seller',
            'images',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ürün geri yüklendi.',
            'data' => new ProductResource($product),
        ]);
    }

    public function forceDelete(int $id): JsonResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $product = Product::withTrashed()
                    ->with('images')
                    ->findOrFail($id);

                foreach ($product->images as $image) {
                    Storage::disk('public')->delete($image->image);
                    $image->forceDelete();
                }

                $product->forceDelete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Ürün kalıcı olarak silindi.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Ürün silinemedi.',
                'error' => app()->isLocal()
                    ? $exception->getMessage()
                    : null,
            ], 500);
        }
    }

    private function generateUniqueSlug(
        string $name,
        ?int $ignoreId = null
    ): string {
        $baseSlug = Str::slug($name);
        $slug = $baseSlug;
        $counter = 1;

        while (
            Product::withTrashed()
            ->where('slug', $slug)
            ->when(
                $ignoreId,
                fn($query) => $query->where('id', '!=', $ignoreId)
            )
            ->exists()
        ) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        return $slug;
    }
}