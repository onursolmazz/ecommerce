<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddToCartRequest;
use App\Http\Requests\UpdateCartItemRequest;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CartController extends Controller
{
    public function index()
    {
        $cart = Cart::with([
            'items.product.images',
            'items.product.category'
        ])->firstOrCreate([
            'user_id' => auth()->id
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sepet başarıyla getirildi.',
            'data' => $cart
        ]);
    }
    public function add(AddToCartRequest $request)
    {
        DB::beginTransaction();

        try {

            $product = Product::findOrFail($request->product_id);

            if ($product->stock < $request->quantity) {
                return response()->json([
                    'success' => false,
                    'message' => 'Yeterli stok bulunmuyor.'
                ], 422);
            }

            $cart = Cart::firstOrCreate([
                'user_id' => auth()->id
            ]);

            $cartItem = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->first();

            if ($cartItem) {

                $newQuantity = $cartItem->quantity + $request->quantity;

                if ($newQuantity > $product->stock) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Stok miktarı aşıldı.'
                    ], 422);
                }

                $cartItem->increment('quantity', $request->quantity);
            } else {

                $cartItem = CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'quantity' => $request->quantity,
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Ürün sepete eklendi.',
                'data' => $cartItem->load('product.images')
            ], 201);
        } catch (\Throwable $e) {

            DB::rollBack();

            return response()->json([
                'success' => false,
                'message' => 'Sepete eklenemedi.',
                'error' => app()->isLocal() ? $e->getMessage() : null
            ], 500);
        }
    }
    public function update(UpdateCartItemRequest $request, CartItem $cartItem)
    {
        $product = $cartItem->product;

        if ($request->quantity > $product->stock) {
            return response()->json([
                'success' => false,
                'message' => 'Stok yetersiz.'
            ], 422);
        }

        $cartItem->update([
            'quantity' => $request->quantity
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Sepet güncellendi.',
            'data' => $cartItem->load('product.images')
        ]);
    }

    public function destroy(CartItem $cartItem)
    {
        $cartItem->delete();

        return response()->json([
            'success' => true,
            'message' => 'Ürün sepetten kaldırıldı.'
        ]);
    }

    public function clear()
    {
        $cart = Cart::where('user_id', auth()->id)->first();

        if (!$cart) {
            return response()->json([
                'success' => false,
                'message' => 'Sepet bulunamadı.'
            ], 404);
        }

        $cart->items()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Sepet temizlendi.'
        ]);
    }
}
