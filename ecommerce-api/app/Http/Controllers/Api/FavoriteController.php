<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FavoriteRequest;
use App\Http\Resources\ProductResource;
use App\Models\Favorite;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class FavoriteController extends Controller
{
    public function index(): JsonResponse
    {
        $favorites = Favorite::query()
            ->with([
                'product.images',
                'product.category',
                'product.seller',
            ])
            ->where('user_id', Auth::id())
            ->latest()
            ->get();

        $products = $favorites
            ->pluck('product')
            ->filter()
            ->values();

        return response()->json([
            'success' => true,
            'message' => 'Favoriler getirildi.',
            'data' => ProductResource::collection($products),
            'meta' => [
                'total' => $products->count(),
            ],
        ]);
    }

    public function store(FavoriteRequest $request): JsonResponse
    {
        $product = Product::query()
            ->where('status', true)
            ->findOrFail($request->integer('product_id'));

        $favorite = Favorite::firstOrCreate([
            'user_id' => Auth::id(),
            'product_id' => $product->id,
        ]);

        $favorite->load([
            'product.images',
            'product.category',
            'product.seller',
        ]);

        return response()->json([
            'success' => true,
            'message' => $favorite->wasRecentlyCreated
                ? 'Ürün favorilere eklendi.'
                : 'Ürün zaten favorilerinizde.',
            'data' => [
                'id' => $favorite->id,
                'product' => new ProductResource($favorite->product),
            ],
        ], $favorite->wasRecentlyCreated ? 201 : 200);
    }

    public function destroy(Product $product): JsonResponse
    {
        $deleted = Favorite::query()
            ->where('user_id', Auth::id())
            ->where('product_id', $product->id)
            ->delete();

        if (!$deleted) {
            return response()->json([
                'success' => false,
                'message' => 'Ürün favorilerde bulunamadı.',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'message' => 'Ürün favorilerden kaldırıldı.',
            'data' => [
                'product_id' => $product->id,
            ],
        ]);
    }
}
