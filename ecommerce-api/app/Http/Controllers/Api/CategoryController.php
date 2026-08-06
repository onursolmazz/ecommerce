<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Throwable;

class CategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        try {
            $perPage = max(
                1,
                min((int) $request->input('per_page', 10), 50)
            );

            $query = Category::query()
                ->with([
                    'parent',
                    'children',
                ])
                ->withCount('products');

            if ($request->filled('search')) {
                $search = trim((string) $request->input('search'));

                $query->where(
                    'name',
                    'like',
                    "%{$search}%"
                );
            }

            if ($request->filled('parent_id')) {
                $query->where(
                    'parent_id',
                    $request->integer('parent_id')
                );
            }

            if ($request->boolean('root_only')) {
                $query->whereNull('parent_id');
            }

            if ($request->has('status')) {
                $query->where(
                    'status',
                    $request->boolean('status')
                );
            }

            switch ($request->input('sort', 'latest')) {
                case 'name_asc':
                    $query->orderBy('name');
                    break;

                case 'name_desc':
                    $query->orderByDesc('name');
                    break;

                case 'popular':
                    $query
                        ->orderByDesc('products_count')
                        ->latest('id');
                    break;

                case 'oldest':
                    $query->oldest();
                    break;

                case 'latest':
                default:
                    $query->latest();
                    break;
            }

            $categories = $query
                ->paginate($perPage)
                ->withQueryString();

            return response()->json([
                'success' => true,
                'message' => 'Kategoriler başarıyla getirildi.',
                'data' => CategoryResource::collection(
                    $categories->getCollection()
                ),
                'meta' => [
                    'current_page' => $categories->currentPage(),
                    'last_page' => $categories->lastPage(),
                    'per_page' => $categories->perPage(),
                    'total' => $categories->total(),
                    'from' => $categories->firstItem(),
                    'to' => $categories->lastItem(),
                ],
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Kategoriler getirilemedi.',
                'error' => app()->isLocal()
                    ? $exception->getMessage()
                    : null,
            ], 500);
        }
    }

    public function store(
        StoreCategoryRequest $request
    ): JsonResponse {
        try {
            $category = DB::transaction(function () use ($request) {
                $imagePath = null;

                if ($request->hasFile('image')) {
                    $imagePath = $request
                        ->file('image')
                        ->store('categories', 'public');
                } elseif ($request->filled('image')) {
                    $imagePath = $request->input('image');
                }

                return Category::create([
                    'name' => $request->input('name'),
                    'slug' => $this->generateUniqueSlug(
                        $request->input('name')
                    ),
                    'parent_id' => $request->filled('parent_id')
                        ? $request->integer('parent_id')
                        : null,
                    'image' => $imagePath,
                    'status' => $request->boolean('status'),
                ]);
            });

            $category->load([
                'parent',
                'children',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Kategori başarıyla oluşturuldu.',
                'data' => new CategoryResource($category),
            ], 201);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Kategori oluşturulamadı.',
                'error' => app()->isLocal()
                    ? $exception->getMessage()
                    : null,
            ], 500);
        }
    }

    public function show(Category $category): JsonResponse
    {
        $category->load([
            'parent',
            'children',
            'products.images',
        ]);

        $category->loadCount('products');

        return response()->json([
            'success' => true,
            'message' => 'Kategori başarıyla getirildi.',
            'data' => new CategoryResource($category),
        ]);
    }

    public function update(
        UpdateCategoryRequest $request,
        Category $category
    ): JsonResponse {
        try {
            DB::transaction(function () use ($request, $category) {
                $imagePath = $category->image;

                if ($request->hasFile('image')) {
                    if (
                        $category->image &&
                        !Str::startsWith($category->image, [
                            'http://',
                            'https://',
                        ])
                    ) {
                        Storage::disk('public')->delete(
                            $category->image
                        );
                    }

                    $imagePath = $request
                        ->file('image')
                        ->store('categories', 'public');
                } elseif ($request->filled('image')) {
                    $imagePath = $request->input('image');
                }

                $parentId = $request->filled('parent_id')
                    ? $request->integer('parent_id')
                    : null;

                if ($parentId === $category->id) {
                    abort(422, 'Kategori kendisinin üst kategorisi olamaz.');
                }

                $category->update([
                    'name' => $request->input('name'),
                    'slug' => $this->generateUniqueSlug(
                        $request->input('name'),
                        $category->id
                    ),
                    'parent_id' => $parentId,
                    'image' => $imagePath,
                    'status' => $request->boolean('status'),
                ]);
            });

            $category->refresh()->load([
                'parent',
                'children',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Kategori başarıyla güncellendi.',
                'data' => new CategoryResource($category),
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Kategori güncellenemedi.',
                'error' => app()->isLocal()
                    ? $exception->getMessage()
                    : null,
            ], 500);
        }
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->children()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Alt kategorileri bulunan kategori silinemez.',
            ], 422);
        }

        if ($category->products()->exists()) {
            return response()->json([
                'success' => false,
                'message' => 'Ürünleri bulunan kategori silinemez.',
            ], 422);
        }

        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori başarıyla silindi.',
            'data' => [
                'id' => $category->id,
                'deleted_at' => $category->deleted_at,
            ],
        ]);
    }

    public function restore(int $id): JsonResponse
    {
        $category = Category::withTrashed()->findOrFail($id);

        if (!$category->trashed()) {
            return response()->json([
                'success' => false,
                'message' => 'Kategori zaten aktif durumda.',
            ], 422);
        }

        $category->restore();

        $category->load([
            'parent',
            'children',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori başarıyla geri yüklendi.',
            'data' => new CategoryResource($category),
        ]);
    }

    public function forceDelete(int $id): JsonResponse
    {
        try {
            DB::transaction(function () use ($id) {
                $category = Category::withTrashed()
                    ->findOrFail($id);

                if ($category->children()->withTrashed()->exists()) {
                    abort(
                        422,
                        'Alt kategorileri bulunan kategori kalıcı olarak silinemez.'
                    );
                }

                if ($category->products()->withTrashed()->exists()) {
                    abort(
                        422,
                        'Ürünleri bulunan kategori kalıcı olarak silinemez.'
                    );
                }

                if (
                    $category->image &&
                    !Str::startsWith($category->image, [
                        'http://',
                        'https://',
                    ])
                ) {
                    Storage::disk('public')->delete(
                        $category->image
                    );
                }

                $category->forceDelete();
            });

            return response()->json([
                'success' => true,
                'message' => 'Kategori kalıcı olarak silindi.',
            ]);
        } catch (Throwable $exception) {
            report($exception);

            return response()->json([
                'success' => false,
                'message' => 'Kategori kalıcı olarak silinemedi.',
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
            Category::withTrashed()
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
