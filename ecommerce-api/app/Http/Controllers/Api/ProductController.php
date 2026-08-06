<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\StockHistory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with([
            'category',
            'seller',
            'images'
        ])
            ->when($request->search, function ($query) use ($request) {
                $query->where('name', 'like', "%{$request->search}%");
            })
            ->when($request->category_id, function ($query) use ($request) {
                $query->where('category_id', $request->category_id);
            })
            ->when($request->seller_id, function ($query) use ($request) {
                $query->where('seller_id', $request->seller_id);
            })
            ->when($request->min_price, function ($query) use ($request) {
                $query->where('price', '>=', $request->min_price);
            })
            ->when($request->max_price, function ($query) use ($request) {
                $query->where('price', '<=', $request->max_price);
            })
            ->when($request->status !== null, function ($query) use ($request) {
                $query->where('status', $request->status);
            })
            ->when($request->sort, function ($query) use ($request) {

                switch ($request->sort) {

                    case 'price_asc':
                        $query->orderBy('price');
                        break;

                    case 'price_desc':
                        $query->orderByDesc('price');
                        break;

                    case 'oldest':
                        $query->oldest();
                        break;

                    default:
                        $query->latest();
                }
            }, function ($query) {
                $query->latest();
            })
            ->paginate(12);

        return response()->json([
            'success' => true,
            'message' => 'Ürünler getirildi.',
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'total' => $products->total(),
            ]
        ]);
    }

    public function show(Product $product)
    {
        $product->load([
            'category',
            'seller',
            'images',
            'reviews.user'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ürün başarıyla getirildi.',
            'data' => new ProductResource($product)
        ]);
    }

    public function store(StoreProductRequest $request)
    {
        DB::beginTransaction();

        try {

            $product = Product::create([
                'category_id' => $request->category_id,
                'seller_id'   => auth()->id,
                'name'        => $request->name,
                'slug'        => Str::slug($request->name),
                'description' => $request->description,
                'price'       => $request->price,
                'stock'       => $request->stock,
                'status'      => $request->boolean('status'),
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

            DB::commit();

            $product->load([
                'category',
                'seller',
                'images'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ürün başarıyla oluşturuldu.',
                'data' => new ProductResource($product),
            ], 201);
        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Ürün oluşturulamadı.',
                'error' => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }

    public function update(UpdateProductRequest $request, Product $product)
    {
        DB::beginTransaction();

        try {
            $oldStock = $product->stock;
            $product->update([
                'category_id' => $request->category_id,
                'name' => $request->name,
                'slug' => Str::slug($request->name),
                'description' => $request->description,
                'price' => $request->price,
                'stock' => $request->stock,
                'status' => $request->boolean('status'),
            ]);
            if ($request->filled('deleted_images')) {
                $images = ProductImage::whereIn('id', $request->deleted_images)
                    ->where('product_id', $product->id)
                    ->get();
                foreach ($images as $image) {
                    Storage::disk('public')->delete($image->image);
                    $image->delete();
                }
            }
            if ($request->hasFile('images')) {

                foreach ($request->file('images') as $image) {

                    $path = $image->store('products', 'public');

                    ProductImage::create([
                        'product_id' => $product->id,
                        'image' => $path,
                        'is_primary' => false,
                    ]);
                }
            }

            if ($request->filled('primary_image_id')) {

                ProductImage::where('product_id', $product->id)
                    ->update([
                        'is_primary' => false
                    ]);

                ProductImage::where('id', $request->primary_image_id)
                    ->where('product_id', $product->id)
                    ->update([
                        'is_primary' => true
                    ]);
            }

            if ($oldStock != $request->stock) {

                StockHistory::create([
                    'product_id' => $product->id,
                    'user_id' => auth()->id,
                    'type' => 'update',
                    'quantity' => $request->stock - $oldStock,
                    'description' => 'Stok güncellendi.'
                ]);
            }

            DB::commit();

            $product->load([
                'category',
                'seller',
                'images'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Ürün başarıyla güncellendi.',
                'data' => new ProductResource($product),
            ]);
        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Ürün güncellenemedi.',
                'error' => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }
    public function destroy(Product $product)
    {
        $product->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ürün başarıyla silindi.',
            'data' => [
                'id' => $product->id,
                'deleted_at' => now(),
            ]
        ]);
    }
    public function restore($id)
    {
        $product = Product::withTrashed()->findOrFail($id);

        $product->restore();

        return response()->json([
            'success' => true,
            'message' => 'Ürün geri yüklendi.',
            'data' => new ProductResource(
                $product->load([
                    'category',
                    'seller',
                    'images'
                ])
            )
        ]);
    }
    public function forceDelete($id)
    {
        DB::beginTransaction();

        try {

            $product = Product::withTrashed()
                ->with('images')
                ->findOrFail($id);

            foreach ($product->images as $image) {

                Storage::disk('public')->delete($image->image);

                $image->forceDelete();
            }

            $product->forceDelete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ürün kalıcı olarak silindi.'
            ]);
        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Ürün silinemedi.',
                'error' => app()->isLocal() ? $e->getMessage() : null,
            ], 500);
        }
    }
}
