<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Category;
use App\Http\Resources\CategoryResource;
use Illuminate\Support\Str;
use App\Http\Requests\StoreCategoryRequest;
use App\Http\Requests\UpdateCategoryRequest;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $categories = Category::with(['parent', 'children'])
            ->latest()
            ->paginate(10);

        return response()->json([
            'success' => true,
            'message' => 'Kategoriler başarıyla getirildi.',
            'data' => CategoryResource::collection($categories),
            'meta' => [
                'current_page' => $categories->currentPage(),
                'last_page' => $categories->lastPage(),
                'per_page' => $categories->perPage(),
                'total' => $categories->total(),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreCategoryRequest $request)
    {
        $category = Category::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'parent_id' => $request->parent_id,
            'image' => $request->image,
            'status' => $request->boolean('status'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori başarıyla oluşturuldu.',
            'data' => new CategoryResource($category),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load(['parent', 'children']);

        return response()->json([
            'success' => true,
            'message' => 'Kategori başarıyla getirildi.',
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateCategoryRequest $request, Category $category)
    {
        $category->update([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
            'parent_id' => $request->parent_id,
            'image' => $request->image,
            'status' => $request->boolean('status'),
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Kategori başarıyla güncellendi.',
            'data' => new CategoryResource($category),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori başarıyla silindi.',
            'deleted_id' => $category->id,
        ]);
    }

    public function restore($id)
    {
        $category = Category::withTrashed()->findOrFail($id);

        $category->restore();

        return response()->json([
            'success' => true,
            'message' => 'Kategori başarıyla geri yüklendi.',
            'data' => new CategoryResource($category),
        ]);
    }

    public function forceDelete($id)
    {
        $category = Category::withTrashed()->findOrFail($id);

        $category->forceDelete();

        return response()->json([
            'success' => true,
            'message' => 'Kategori kalıcı olarak silindi.',
            'deleted_id' => $id,
        ]);
    }
}
