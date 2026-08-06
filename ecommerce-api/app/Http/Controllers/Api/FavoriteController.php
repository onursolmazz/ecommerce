<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\FavoriteRequest;
use App\Http\Resources\ProductResource;
use App\Models\Favorite;
use App\Models\Product;

class FavoriteController extends Controller
{
    public function index()
    {
        $favorites = Favorite::with([
            'product.images',
            'product.category',
            'product.seller'
        ])
            ->where('user_id', auth()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Favoriler getirildi.',
            'data' => ProductResource::collection(
                $favorites->pluck('product')
            )
        ]);
    }

    public function store(FavoriteRequest $request)
    {
        $favorite = Favorite::firstOrCreate([
            'user_id' => auth()->id,
            'product_id' => $request->product_id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Ürün favorilere eklendi.',
            'data' => $favorite
        ], 201);
    }

    public function destroy(Product $product)
    {
        Favorite::where('user_id', auth()->id)
            ->where('product_id', $product->id)
            ->delete();

        return response()->json([
            'success' => true,
            'message' => 'Favorilerden kaldırıldı.'
        ]);
    }
}
